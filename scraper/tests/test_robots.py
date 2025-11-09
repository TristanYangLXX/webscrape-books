import logging
from urllib.robotparser import RobotFileParser

import pytest

from src.robots import RobotsHandler

logging.getLogger("src.robots").setLevel(logging.INFO)


def test_construct_without_network(monkeypatch):
    """Constructor should not crash even if RobotFileParser.read fails."""

    def fake_read(self):
        raise RuntimeError("network disabled")

    monkeypatch.setattr(RobotFileParser, "read", fake_read, raising=True)

    rh = RobotsHandler("https://books.toscrape.com", user_agent="test-agent")

    assert isinstance(rh, RobotsHandler)


def test_can_fetch_allows_when_no_rules(monkeypatch):
    """When no rules are loaded, RobotFileParser defaults to allow."""

    monkeypatch.setattr(RobotFileParser, "read", lambda self: None, raising=True)

    rh = RobotsHandler("https://books.toscrape.com", user_agent="test-agent")

    monkeypatch.setattr(rh.rp, "can_fetch", lambda agent, url: True, raising=True)

    assert rh.can_fetch("https://books.toscrape.com/catalogue/page-1.html") is True


def test_can_fetch_blocked_logs(monkeypatch, caplog):
    """If can_fetch returns False, handler should log a warning and return False."""

    monkeypatch.setattr(RobotFileParser, "read", lambda self: None, raising=True)

    rh = RobotsHandler("https://books.toscrape.com", user_agent="test-agent")

    monkeypatch.setattr(rh.rp, "can_fetch", lambda agent, url: False, raising=True)

    with caplog.at_level(logging.WARNING):
        allowed = rh.can_fetch("https://books.toscrape.com/private")

    assert allowed is False
    assert any("BLOCKED by robots.txt" in msg for _, _, msg in caplog.record_tuples)


def test_crawl_delay_none(monkeypatch):
    """If robots.txt has no crawl-delay for our agent, return 0 ms."""

    monkeypatch.setattr(RobotFileParser, "read", lambda self: None, raising=True)

    rh = RobotsHandler("https://books.toscrape.com", user_agent="test-agent")

    monkeypatch.setattr(rh.rp, "crawl_delay", lambda agent: None, raising=True)

    assert rh.get_crawl_delay_ms() == 0


def test_crawl_delay_ms_conversion(monkeypatch, caplog):
    """If crawl-delay is present in seconds, convert to ms and log it."""

    monkeypatch.setattr(RobotFileParser, "read", lambda self: None, raising=True)

    rh = RobotsHandler("https://books.toscrape.com", user_agent="test-agent")

    monkeypatch.setattr(rh.rp, "crawl_delay", lambda agent: 2.5, raising=True)

    with caplog.at_level(logging.INFO):
        ms = rh.get_crawl_delay_ms()

    assert ms == 2500
    assert any(
        "Crawl-delay found in robots.txt: 2500 ms" in msg
        for _, _, msg in caplog.record_tuples
    )

