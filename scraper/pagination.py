from typing import Optional
from urllib.parse import urljoin


def resolve_next(base_url: str, next_href: Optional[str]) -> Optional[str]:
    if not next_href:
        return None
    return urljoin(base_url, next_href)

