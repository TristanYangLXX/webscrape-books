from typing import Literal, TypedDict


class BookItem(TypedDict):
    key: str
    site: Literal["books"]
    url: str
    title: str
    price: float
    availability: str
    rating: int
    category: str


Item = BookItem
