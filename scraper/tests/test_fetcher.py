import logging

import httpx
import pytest
from tenacity import RetryError

from scraper.fetcher import Fetcher, FetcherConfig, RetryableStatus


class _FakeResponse:
    def __init__(self, status_code=200, text="", request=None):
        self.status_code = status_code
        self.text = text
        self.request = request or httpx.Request("GET", "https://example.com")


def test_success_first_try(monkeypatch):
    cfg = FetcherConfig(base_delay_ms=0, max_retries=1)
    f = Fetcher(cfg)

    def fake_get(self, url):
        return _FakeResponse(200, text="OK", request=httpx.Request("GET", url))

    monkeypatch.setattr(httpx.Client, "get", fake_get, raising=True)

    with f:
        txt = f.get_text("https://books.toscrape.com")
    assert txt == "OK"


def test_retry_on_500_then_success(monkeypatch, caplog):
    cfg = FetcherConfig(base_delay_ms=0, max_retries=3)
    f = Fetcher(cfg)
    calls = {"n": 0}

    def fake_get(self, url):
        calls["n"] += 1
        if calls["n"] == 1:
            return _FakeResponse(500, text="", request=httpx.Request("GET", url))
        return _FakeResponse(200, text="YAY", request=httpx.Request("GET", url))

    monkeypatch.setattr(httpx.Client, "get", fake_get, raising=True)

    with f, caplog.at_level(logging.WARNING):
        txt = f.get_text("https://books.toscrape.com/page-1.html")

    assert calls["n"] == 2
    assert "Retryable status 500" in ";".join(r.message for r in caplog.records)
    assert txt == "YAY"


def test_give_up_after_max_retries(monkeypatch):
    cfg = FetcherConfig(base_delay_ms=0, max_retries=2)
    f = Fetcher(cfg)

    def fake_get(self, url):
        return _FakeResponse(503, text="", request=httpx.Request("GET", url))

    monkeypatch.setattr(httpx.Client, "get", fake_get, raising=True)

    with f:
        with pytest.raises(RetryError):
            f.get_text("https://books.toscrape.com/stuck")


def test_non_retryable_404_raises(monkeypatch):
    cfg = FetcherConfig(base_delay_ms=0, max_retries=3)
    f = Fetcher(cfg)

    def fake_get(self, url):
        return _FakeResponse(404, text="", request=httpx.Request("GET", url))

    monkeypatch.setattr(httpx.Client, "get", fake_get, raising=True)

    with f:
        with pytest.raises(httpx.HTTPStatusError):
            f.get_text("https://books.toscrape.com/missing")


def test_user_agent_header_is_set(monkeypatch):
    cfg = FetcherConfig(user_agent="book-scraper/TEST", base_delay_ms=0)
    f = Fetcher(cfg)
    captured = {}

    def fake_get(self, url):
        captured["ua"] = self.headers.get("User-Agent")
        return _FakeResponse(200, text="UA OK", request=httpx.Request("GET", url))

    monkeypatch.setattr(httpx.Client, "get", fake_get, raising=True)

    with f:
        f.get_text("https://books.toscrape.com")
    assert captured["ua"] == "book-scraper/TEST"

