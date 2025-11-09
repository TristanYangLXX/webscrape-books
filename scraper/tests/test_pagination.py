from scraper.parser import parse_books_list


def test_next_link_resolves_to_absolute_url():
    html = """
    <html>
      <body>
        <section>
          <article class="product_pod">
            <h3><a href="catalogue/book-1.html" title="Book 1">Book 1</a></h3>
            <p class="star-rating Three"></p>
            <div class="product_price">
              <p class="price_color">£10.00</p>
              <p class="instock availability">In stock</p>
            </div>
          </article>
        </section>
        <ul class="pager">
          <li class="next"><a href="catalogue/page-2.html">next</a></li>
        </ul>
      </body>
    </html>
    """

    items, next_url = parse_books_list(
        html, base_url="https://books.toscrape.com", page_url="https://books.toscrape.com/catalogue/page-1.html"
    )

    assert items[0]["url"] == "https://books.toscrape.com/catalogue/book-1.html"
    assert next_url == "https://books.toscrape.com/catalogue/page-2.html"
