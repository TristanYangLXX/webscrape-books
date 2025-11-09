from src.parser import parse_books_list, parse_books_detail

LIST_HTML = """
<html>
  <body>
    <ul class="breadcrumb">
      <li><a href="/">Home</a></li>
      <li><a href="/catalogue/category/books_1/index.html">Books</a></li>
      <li class="active">Travel</li>
    </ul>
    <section>
      <article class="product_pod">
        <h3><a href="catalogue/book-1_1/index.html" title="A Travel Book">A Travel Book</a></h3>
        <p class="star-rating Three"> </p>
        <div class="product_price">
          <p class="price_color">£51.77</p>
          <p class="instock availability">
             In stock (22 available)
          </p>
        </div>
      </article>
      <article class="product_pod">
        <h3><a href="/catalogue/book-2_2/index.html" title="Another Book">Another Book</a></h3>
        <p class="star-rating Five"> </p>
        <div class="product_price">
          <p class="price_color">£9.99</p>
          <p class="instock availability">
             In stock
          </p>
        </div>
      </article>
    </section>
    <ul class="pager">
      <li class="next"><a href="page-2.html">next</a></li>
    </ul>
  </body>
</html>
"""

DETAIL_HTML = """
<html>
  <body>
    <ul class="breadcrumb">
      <li><a>Home</a></li>
      <li><a>Books</a></li>
      <li><a>Travel</a></li>
      <li class="active">A Travel Book</li>
    </ul>
    <div class="product_main">
      <h1>A Travel Book</h1>
      <p class="star-rating Four"> </p>
      <p class="price_color">£42.00</p>
      <p class="instock availability">
        In stock (20 available)
      </p>
    </div>
  </body>
</html>
"""


def test_parse_books_list_extracts_two_and_next():
    items, next_url = parse_books_list(
        LIST_HTML,
        base_url="https://books.toscrape.com/",
        page_url="https://books.toscrape.com/",
    )
    assert len(items) == 2
    b0 = items[0]
    assert b0["title"] == "A Travel Book"
    assert b0["url"].startswith("https://books.toscrape.com/catalogue/book-1_1/index.html")
    assert b0["price"] == 51.77
    assert b0["availability"].startswith("In stock")
    assert b0["rating"] == 3
    assert b0["category"] == "Travel"
    assert next_url == "https://books.toscrape.com/page-2.html"


def test_parse_books_list_absolute_href_and_rating():
    items, _ = parse_books_list(
        LIST_HTML,
        base_url="https://books.toscrape.com/",
        page_url="https://books.toscrape.com/",
    )
    b1 = items[1]
    assert b1["title"] == "Another Book"
    assert b1["url"] == "https://books.toscrape.com/catalogue/book-2_2/index.html"
    assert b1["rating"] == 5
    assert b1["price"] == 9.99


def test_parse_books_detail_enriches_fields():
    item = parse_books_detail(
        DETAIL_HTML,
        page_url="https://books.toscrape.com/catalogue/book-1_1/index.html",
    )
    assert item["title"] == "A Travel Book"
    assert item["category"] == "Travel"
    assert item["price"] == 42.0
    assert item["rating"] == 4
    assert item["availability"].startswith("In stock")


def test_next_url_resolves_against_current_page():
    html = """
    <html><body>
      <section>
        <ul class="pager"><li class="next"><a href="../page-3.html">next</a></li></ul>
      </section>
    </body></html>
    """

    _, next_url = parse_books_list(
        html,
        base_url="https://books.toscrape.com/",
        page_url="https://books.toscrape.com/catalogue/page-2.html",
    )

    assert next_url == "https://books.toscrape.com/catalogue/page-3.html"

