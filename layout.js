const navLinks = [
  { href: "shop.html", label: "Shop", page: "shop" },
  { href: "recipes.html", label: "Recipes", page: "recipes" },
  { href: "layla-plus.html", label: "Layla+", page: "layla-plus" },
  { href: "about.html", label: "About", page: "about" },
  { href: "b2b.html", label: "B2B", page: "b2b" },
  { href: "contact.html", label: "Contact", page: "contact" }
];

function getStoredCart() {
  window.__laylaMemoryCart = window.__laylaMemoryCart || [];
  if (typeof window.localStorage === "undefined") {
    return readCookieCart() || window.__laylaMemoryCart;
  }
  try {
    return JSON.parse(localStorage.getItem("laylaCart")) || [];
  } catch (error) {
    return readCookieCart() || window.__laylaMemoryCart;
  }
}

function setStoredCart(cart) {
  window.__laylaMemoryCart = cart;
  if (typeof window.localStorage !== "undefined") {
    localStorage.setItem("laylaCart", JSON.stringify(cart));
  }
  writeCookieCart(cart);
  window.dispatchEvent(new CustomEvent("layla-cart-updated"));
}

function readCookieCart() {
  try {
    const item = document.cookie.split("; ").find((row) => row.startsWith("laylaCart="));
    return item ? JSON.parse(decodeURIComponent(item.split("=")[1])) : null;
  } catch (error) {
    return null;
  }
}

function writeCookieCart(cart) {
  try {
    document.cookie = `laylaCart=${encodeURIComponent(JSON.stringify(cart))}; path=/; max-age=2592000`;
  } catch (error) {
    window.__laylaMemoryCart = cart;
  }
}

function cartTotals() {
  const cart = getStoredCart();
  return cart.reduce((total, item) => {
    const product = window.LAYLA.products.find((entry) => entry.sku === item.sku);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
}

function cartQuantity() {
  return getStoredCart().reduce((total, item) => total + item.quantity, 0);
}

function formatAed(value) {
  return `AED ${value.toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function updateSharedCartUi() {
  const total = cartTotals();
  const quantity = cartQuantity();
  const remaining = Math.max(350 - total, 0);
  const progress = Math.min((total / 350) * 100, 100);

  document.querySelectorAll("[data-cart-count]").forEach((item) => {
    item.textContent = quantity;
  });
  document.querySelectorAll("[data-cart-total]").forEach((item) => {
    item.textContent = formatAed(total);
  });
  document.querySelectorAll("[data-cart-message]").forEach((item) => {
    item.textContent = remaining === 0
      ? "Free delivery unlocked"
      : `Add ${formatAed(remaining)} more for free delivery`;
  });
  document.querySelectorAll("[data-cart-progress]").forEach((item) => {
    item.style.width = `${progress}%`;
  });
  document.querySelectorAll(".shared-basket").forEach((item) => {
    item.classList.toggle("is-active", quantity > 0);
  });
}

function renderHeader() {
  const slot = document.querySelector("#siteHeader");
  if (!slot) {
    return;
  }

  const currentPage = document.body.dataset.page || "";
  const navMarkup = navLinks.map((link, index) => `
    <a href="${link.href}"${currentPage === link.page ? ' aria-current="page"' : ""}>
      ${index === 0 ? '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 10h16M4 4h16M4 16h16"></path></svg>' : ""}
      ${link.label}
    </a>
  `).join("");

  slot.innerHTML = `
    <header class="site-header">
      <div class="topbar">
        <span>Free delivery over AED 350</span>
        <span>Dubai delivery in 24 hours</span>
        <span>100% halal range</span>
      </div>
      <div class="header-main">
        <a class="logo" href="index.html" aria-label="Layla home">
          <img src="assets/layla-logo-red.png" alt="Layla">
        </a>
        <form class="search" role="search" data-site-search>
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"></path>
          </svg>
          <input type="search" name="q" placeholder="Search Layla products" autocomplete="off">
          <button type="submit">Products</button>
        </form>
        <div class="header-tools">
          <button class="utility-button" type="button">العربية</button>
          <a class="utility-button" href="account.html">Sign In</a>
          <a class="cart-button" href="cart.html" aria-label="Cart">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M6 6h15l-1.5 9h-12L6 6ZM6 6 5.2 3H3"></path>
              <circle cx="9" cy="20" r="1"></circle>
              <circle cx="18" cy="20" r="1"></circle>
            </svg>
            <span data-cart-count>0</span>
          </a>
        </div>
      </div>
      <nav class="nav-row" aria-label="Main navigation">
        ${navMarkup}
      </nav>
    </header>
  `;
}

function renderFooter() {
  const slot = document.querySelector("#siteFooter");
  if (!slot) {
    return;
  }

  slot.innerHTML = `
    <footer class="site-footer rich-footer">
      <div>
        <img src="assets/layla-logo-cream.png" alt="Layla">
        <p>A premium frozen food brand built for UAE homes, cold-chain delivered and 100% halal.</p>
      </div>
      <nav aria-label="Shop footer">
        <strong>Shop</strong>
        <a href="shop.html">All products</a>
        <a href="shop.html?sort=new">New arrivals</a>
        <a href="shop.html?collection=golden-wraps">Golden Wraps</a>
        <a href="layla-plus.html">Layla+</a>
      </nav>
      <nav aria-label="Help footer">
        <strong>Help</strong>
        <a href="contact.html">Contact us</a>
        <a href="contact.html#delivery">Shipping & returns</a>
        <a href="contact.html#faq">FAQs</a>
        <a href="account.html">Track order</a>
      </nav>
      <nav aria-label="Company footer">
        <strong>Company</strong>
        <a href="about.html#story">Our story</a>
        <a href="about.html#ingredients">Ingredients 101</a>
        <a href="about.html#sustainability">Sustainability</a>
        <a href="b2b.html">Wholesale</a>
      </nav>
    </footer>
  `;
}

function renderBasketSummary() {
  const slot = document.querySelector("#siteBasket");
  if (!slot) {
    return;
  }

  slot.innerHTML = `
    <aside class="basket-summary shared-basket" aria-label="Basket summary">
      <div>
        <strong data-cart-message>Add AED 350 more for free delivery</strong>
        <span>Basket <span data-cart-total>AED 0.00</span></span>
      </div>
      <div class="progress-track" aria-hidden="true">
        <span data-cart-progress></span>
      </div>
      <a href="checkout.html">Checkout</a>
    </aside>
  `;
}

function bindLayoutEvents() {
  document.querySelectorAll("[data-site-search]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const query = new FormData(form).get("q") || "";
      window.location.href = `shop.html?q=${encodeURIComponent(query.toString().trim())}`;
    });
  });

  window.addEventListener("layla-cart-updated", updateSharedCartUi);
  window.addEventListener("storage", updateSharedCartUi);
}

renderHeader();
renderFooter();
renderBasketSummary();
bindLayoutEvents();
updateSharedCartUi();
