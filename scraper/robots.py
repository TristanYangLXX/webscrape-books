import logging
from urllib.parse import urljoin, urlparse
from urllib.robotparser import RobotFileParser

logger = logging.getLogger(__name__)


class RobotsHandler:
    """
    Handles robots.txt fetching and permission checks.
    Uses Python's built-in RobotFileParser.
    """

    def __init__(self, base_url: str, user_agent: str = "book-scraper"):
        self.base_url = base_url
        self.user_agent = user_agent
        self.rp = RobotFileParser()
        self._load_robots()

    def _load_robots(self) -> None:
        robots_url = urljoin(self.base_url, "/robots.txt")
        try:
            self.rp.set_url(robots_url)
            self.rp.read()
            logger.info(f"[robots] Loaded robots.txt from {robots_url}")
        except Exception as e:
            logger.warning(
                f"[robots] Failed to load robots.txt ({e}). Defaulting to allow all."
            )

    def can_fetch(self, url: str) -> bool:
        """
        Returns True if our user-agent is allowed to fetch the URL.
        Logs when blocked.
        """
        allowed = self.rp.can_fetch(self.user_agent, url)
        if not allowed:
            logger.warning(f"[robots] BLOCKED by robots.txt: {url}")
        return allowed

    def get_crawl_delay_ms(self) -> int:
        """
        Returns crawl-delay in milliseconds if provided in robots.txt, else 0.
        """
        delay = self.rp.crawl_delay(self.user_agent)
        if delay is None:
            return 0
        # convert seconds → ms
        delay_ms = int(delay * 1000)
        logger.info(f"[robots] Crawl-delay found in robots.txt: {delay_ms} ms")
        return delay_ms
