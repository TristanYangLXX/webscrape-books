from __future__ import annotations

import re
from typing import List, Optional, Tuple
from urllib.parse import urljoin

from bs4 import BeautifulSoup

from .types import BookItem

_RATING_MAP = {"One": 1, "Two": 2, "Three": 3, "Four": 4, "Five": 5}


def _abs(href: str | None, base: str) -> Optional[str]:
    if not href:
        return None
    return urljoin(base, href)


def _rating_from_classes(classes: list[str] | None) -> int:
    if not classes:
        return 0

    for klass, val in _RATING_MAP.items():
        if klass in classes:
            return val

    return 0


def _parse_price(text: str) -> float:
    m = re.search(r"([0-9]+(?:\.[0-9]+)?)", text.replace(",", ""))
    return float(m.group(1)) if m else 0.0


def _clean_ws(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def parse_books_list(html: str, base_url: str, page_url: str) -> Tuple[List[BookItem], Optional[str]]:
    soup = BeautifulSoup(html, "html.parser")

    category = ""
    bc_active = soup.select_one("ul.breadcrumb li.active")
    if bc_active:
        cat_text = _clean_ws(bc_active.get_text(" "))
        if cat_text.lower() != "all products":
            category = cat_text

    items: List[BookItem] = []
    for pod in soup.select("article.product_pod"):
        a = pod.select_one("h3 a")
        if not a or not a.get("href"):
            continue

        title = _clean_ws(a.get("title") or a.get_text(" "))
        url = _abs(a.get("href"), base_url)
        if not url:
            continue

        price_el = pod.select_one("p.price_color")
        price = _parse_price(price_el.get_text(" ")) if price_el else 0.0

        avail_el = pod.select_one("p.instock.availability")
        availability = _clean_ws(avail_el.get_text(" ")) if avail_el else ""

        rating_el = pod.select_one("p.star-rating")
        rating = _rating_from_classes(rating_el.get("class") if rating_el else None)

        item: BookItem = {
            "key": url,
            "site": "books",
            "url": url,
            "title": title,
            "price": price,
            "availability": availability,
            "rating": rating,
            "category": category,
        }
        items.append(item)

    next_link = soup.select_one("li.next a")
    next_url = _abs(next_link.get("href") if next_link else None, page_url)

    return items, next_url


def parse_books_detail(html: str, page_url: str) -> BookItem:
    soup = BeautifulSoup(html, "html.parser")

    title_el = soup.select_one("div.product_main h1")
    title = _clean_ws(title_el.get_text(" ")) if title_el else ""

    price_el = soup.select_one("div.product_main p.price_color")
    price = _parse_price(price_el.get_text(" ")) if price_el else 0.0

    avail_el = soup.select_one("div.product_main p.instock.availability")
    availability = _clean_ws(avail_el.get_text(" ")) if avail_el else ""

    rating_el = soup.select_one("div.product_main p.star-rating")
    rating = _rating_from_classes(rating_el.get("class") if rating_el else None)

    category = ""
    crumb_li = soup.select("ul.breadcrumb li")
    if len(crumb_li) >= 3:
        cat_candidate = crumb_li[2].get_text(" ")
        category = _clean_ws(cat_candidate)

    return {
        "key": page_url,
        "site": "books",
        "url": page_url,
        "title": title,
        "price": price,
        "availability": availability,
        "rating": rating,
        "category": category,
    }

