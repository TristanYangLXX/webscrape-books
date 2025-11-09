import logging
import random
import time
from dataclasses import dataclass
from typing import Optional

import httpx
from tenacity import Retrying, retry_if_exception_type, stop_after_attempt, wait_random_exponential

logger = logging.getLogger(__name__)


class RetryableStatus(Exception):
    """Raised for HTTP statuses that should be retried (e.g., 429, 5xx)."""

    def __init__(self, status_code: int, url: str):
        super().__init__(f"Retryable HTTP status {status_code} for {url}")
        self.status_code = status_code
        self.url = url


@dataclass
class FetcherConfig:
    user_agent: str = "book-scraper/0.1"
    timeout_s: float = 15.0
    base_delay_ms: int = 800
    jitter_ratio: float = 0.20
    max_retries: int = 3
    backoff_multiplier: float = 0.5
    backoff_max_s: float = 5.0


class Fetcher:
    """
    Synchronous HTTP fetcher with shared client, polite delay, and retries.
    """

    def __init__(self, config: Optional[FetcherConfig] = None):
        self.config = config or FetcherConfig()
        self.client = httpx.Client(
            timeout=self.config.timeout_s,
            headers={"User-Agent": self.config.user_agent},
            follow_redirects=True,
        )

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        self.close()

    def close(self) -> None:
        try:
            self.client.close()
        except Exception:
            pass

    def get_text(self, url: str) -> str:
        attempt_no = 0

        for attempt in Retrying(
            stop=stop_after_attempt(self.config.max_retries),
            wait=wait_random_exponential(
                multiplier=self.config.backoff_multiplier,
                max=self.config.backoff_max_s,
            ),
            retry=retry_if_exception_type((httpx.RequestError, RetryableStatus)),
            reraise=False,
        ):
            with attempt:
                attempt_no += 1
                self._sleep_politely_before_request(attempt_no)
                return self._one_request(url)

        raise AssertionError("Unexpected retry termination in get_text")

    def _one_request(self, url: str) -> str:
        resp = self.client.get(url)

        if resp.status_code == 429 or 500 <= resp.status_code <= 599:
            logger.warning("[fetch] Retryable status %s for %s", resp.status_code, url)
            raise RetryableStatus(resp.status_code, url)

        if 400 <= resp.status_code <= 499:
            msg = f"Non-retryable HTTP {resp.status_code} for {url}"
            logger.error("[fetch] %s", msg)
            raise httpx.HTTPStatusError(msg, request=resp.request, response=resp)

        logger.info("[fetch] %s (%d bytes)", url, len(resp.text))
        return resp.text

    def _sleep_politely_before_request(self, attempt_no: int) -> None:
        base_s = self.config.base_delay_ms / 1000.0
        j = self.config.jitter_ratio
        delay_s = base_s * random.uniform(1 - j, 1 + j)

        if delay_s > 0:
            logger.debug("[fetch] Sleeping %.3fs before attempt %d", delay_s, attempt_no)
            time.sleep(delay_s)
