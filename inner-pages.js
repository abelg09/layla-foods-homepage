const catalog = window.LAYLA.products;
const categories = window.LAYLA.categories;
const recipes = window.LAYLA.recipes;
const params = new URLSearchParams(window.location.search);

function categoryById(id) {
  return categories.find((category) => category.id === id);
}

function productBySku(sku) {
  return catalog.find((product) => product.sku === sku) || catalog[0];
}

function productImage(product) {
  return product.image || product.fallbackImage || "assets/photos/kebab.jpg";
}

function addProductToCart(sku, quantity = 1) {
  const cart = getStoredCart();
  const existing = cart.find((item) => item.sku === sku);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ sku, quantity });
  }
  setStoredCart(cart);
}

function productCard(product, variant = "") {
  const category = categoryById(product.category);
  return `
    <article class="product-card collection-product ${variant}" data-category="${product.category}" data-name="${product.name.toLowerCase()}" data-price="${product.price}">
      <a class="product-image-link" href="product.html?sku=${product.sku}" aria-label="${product.name}">
        <img src="${productImage(product)}" alt="${product.name}" onerror="this.src='${product.fallbackImage || "assets/photos/kebab.jpg"}'">
      </a>
      <div class="product-body">
        <span>${category ? category.brand : "Layla"}</span>
        <h3><a href="product.html?sku=${product.sku}">${product.name}</a></h3>
        <p>${product.size}</p>
        <strong>${formatAed(product.price)} each</strong>
        <small>${product.pairing}</small>
        <button class="add-button" type="button" data-add-sku="${product.sku}">Add to cart</button>
      </div>
      <mark>${product.badge}</mark>
    </article>
  `;
}

function renderCategoryRail() {
  const rail = document.querySelector("[data-category-rail]");
  if (!rail) {
    return;
  }

  const active = params.get("collection") || "all";
  rail.innerHTML = `
    <a class="${active === "all" ? "is-active" : ""}" href="shop.html">All Products</a>
    ${categories.map((category) => `
      <a class="${active === category.id ? "is-active" : ""}" href="shop.html?collection=${category.id}">
        <img src="${category.image}" alt="">
        <span>${category.brand}</span>
        <small>${category.title}</small>
      </a>
    `).join("")}
  `;
}

function renderCollectionGrid() {
  const grid = document.querySelector("[data-collection-grid]");
  if (!grid) {
    return;
  }

  const query = (params.get("q") || "").toLowerCase();
  const collection = params.get("collection") || "all";
  const sort = params.get("sort") || document.querySelector("[data-sort]")?.value || "featured";
  let products = [...catalog];

  if (collection !== "all") {
    products = products.filter((product) => product.category === collection);
  }

  if (query) {
    products = products.filter((product) => {
      const category = categoryById(product.category);
      return [
        product.name,
        product.badge,
        product.pairing,
        category?.brand,
        category?.title
      ].join(" ").toLowerCase().includes(query);
    });
  }

  if (sort === "price-low") {
    products.sort((a, b) => a.price - b.price);
  }
  if (sort === "price-high") {
    products.sort((a, b) => b.price - a.price);
  }
  if (sort === "new") {
    products = products.reverse();
  }

  const activeCategory = categoryById(collection);
  document.querySelectorAll("[data-collection-title]").forEach((item) => {
    item.textContent = activeCategory ? activeCategory.title : "All Products";
  });
  document.querySelectorAll("[data-collection-copy]").forEach((item) => {
    item.textContent = activeCategory
      ? `${activeCategory.brand}: ${activeCategory.tagline}.`
      : "Shop Layla's freezer range by category, recipe occasion, and quick add-ons.";
  });
  document.querySelectorAll("[data-product-count]").forEach((item) => {
    item.textContent = `${products.length} item${products.length === 1 ? "" : "s"}`;
  });

  grid.innerHTML = products.length
    ? products.map((product) => productCard(product)).join("")
    : `<div class="empty-state"><h3>No products found</h3><p>Try a different category or search term.</p><a class="primary-action" href="shop.html">Reset shop</a></div>`;
}

function bindCollectionControls() {
  document.querySelectorAll("[data-filter-pill]").forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.filterPill;
      const next = new URLSearchParams(window.location.search);
      if (value === "all") {
        next.delete("collection");
      } else {
        next.set("collection", value);
      }
      window.location.href = `shop.html?${next.toString()}`;
    });
  });

  document.querySelectorAll("[data-sort]").forEach((select) => {
    select.value = params.get("sort") || "featured";
    select.addEventListener("change", () => {
      const next = new URLSearchParams(window.location.search);
      next.set("sort", select.value);
      window.location.href = `shop.html?${next.toString()}`;
    });
  });
}

function renderProductDetail() {
  const slot = document.querySelector("[data-product-detail]");
  if (!slot) {
    return;
  }

  const product = productBySku(params.get("sku") || "47");
  const category = categoryById(product.category);
  const related = catalog
    .filter((item) => item.sku !== product.sku && (item.category === product.category || item.category === "drizzle" || item.category === "glazd"))
    .slice(0, 4);

  document.title = `${product.name} | Layla`;
  slot.innerHTML = `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="index.html">Home</a>
      <span>/</span>
      <a href="shop.html">Shop</a>
      <span>/</span>
      <a href="shop.html?collection=${product.category}">${category.title}</a>
    </nav>
    <section class="product-detail">
      <div class="product-gallery">
        <img class="main-product-image" src="${productImage(product)}" alt="${product.name}" onerror="this.src='${product.fallbackImage || "assets/photos/kebab.jpg"}'">
        <div class="gallery-strip">
          <img src="${productImage(product)}" alt="">
          <img src="${category.image}" alt="">
          <img src="assets/food-pattern.svg" alt="">
        </div>
      </div>
      <article class="product-info">
        <p class="eyebrow">${category.brand}</p>
        <h1>${product.name}</h1>
        <p>${category.tagline}. ${product.pairing}.</p>
        <div class="product-points">
          <span>${product.size}</span>
          <span>${product.prep}</span>
          <span>${product.dietary}</span>
        </div>
        <div class="price-line">
          <strong>${formatAed(product.price)}</strong>
          <small>Cold-chain delivery across Dubai</small>
        </div>
        <div class="purchase-row">
          <div class="quantity-stepper" aria-label="Quantity">
            <button type="button" data-qty-minus>-</button>
            <output data-qty-value>1</output>
            <button type="button" data-qty-plus>+</button>
          </div>
          <button class="primary-action" type="button" data-add-current="${product.sku}">Add to cart</button>
        </div>
        <div class="subscription-callout">
          <strong>Subscribe and save with Layla+</strong>
          <span>Swap products monthly, skip any time, and keep freezer staples ready.</span>
          <a href="layla-plus.html">Choose your box</a>
        </div>
      </article>
    </section>
    <section class="inner-band product-tabs">
      <details open>
        <summary>Ingredients</summary>
        <p>Prepared with halal ingredients, flash frozen for freshness, and designed for home cooking consistency.</p>
      </details>
      <details>
        <summary>Cooking Instructions</summary>
        <p>Cook from frozen. Follow the pack timing, serve hot, and pair with the recommended Layla sauce or chutney.</p>
      </details>
      <details>
        <summary>Delivery</summary>
        <p>Orders are packed for cold-chain delivery. Free delivery unlocks at AED 350.</p>
      </details>
    </section>
    <section class="related-products">
      <div class="section-title">
        <div>
          <h2>Complete the Basket</h2>
          <p>Smart pairings based on this product.</p>
        </div>
        <a href="shop.html">Shop all</a>
      </div>
      <div class="product-grid compact-grid">
        ${related.map((item) => productCard(item, "mini")).join("")}
      </div>
    </section>
  `;
}

function bindProductControls() {
  let quantity = 1;
  const value = document.querySelector("[data-qty-value]");
  const update = () => {
    if (value) {
      value.textContent = quantity;
    }
  };

  document.querySelectorAll("[data-qty-minus]").forEach((button) => {
    button.addEventListener("click", () => {
      quantity = Math.max(1, quantity - 1);
      update();
    });
  });
  document.querySelectorAll("[data-qty-plus]").forEach((button) => {
    button.addEventListener("click", () => {
      quantity += 1;
      update();
    });
  });
  document.querySelectorAll("[data-add-current]").forEach((button) => {
    button.addEventListener("click", () => {
      addProductToCart(button.dataset.addCurrent, quantity);
      button.textContent = "Added";
      window.setTimeout(() => {
        button.textContent = "Add to cart";
      }, 900);
    });
  });
}

function renderRecipeIndex() {
  const grid = document.querySelector("[data-recipe-grid]");
  if (!grid) {
    return;
  }

  grid.innerHTML = recipes.map((recipe, index) => `
    <article class="recipe-index-card ${index === 0 ? "featured-recipe" : ""}">
      <a href="recipe.html?recipe=${recipe.slug}">
        <img src="${recipe.image}" alt="${recipe.name}">
      </a>
      <div>
        <span class="recipe-label">${recipe.type}</span>
        <div class="recipe-meta">
          <span>${recipe.time}</span>
          <span>${recipe.serves} people</span>
          <span>${recipe.difficulty}</span>
        </div>
        <h3><a href="recipe.html?recipe=${recipe.slug}">${recipe.name}</a></h3>
        <p>${recipe.copy}</p>
        <strong>Basket value ${formatAed(recipe.value)}</strong>
      </div>
    </article>
  `).join("");
}

function renderRecipeDetail() {
  const slot = document.querySelector("[data-recipe-detail]");
  if (!slot) {
    return;
  }

  const recipe = recipes.find((item) => item.slug === params.get("recipe")) || recipes[0];
  const items = recipe.skus.map(productBySku);
  document.title = `${recipe.name} | Layla Recipes`;
  slot.innerHTML = `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="index.html">Home</a>
      <span>/</span>
      <a href="recipes.html">Recipes</a>
    </nav>
    <section class="article-hero">
      <div>
        <p class="eyebrow">${recipe.type}</p>
        <h1>${recipe.name}</h1>
        <p>${recipe.copy}</p>
        <div class="product-points">
          <span>${recipe.time}</span>
          <span>${recipe.serves} people</span>
          <span>${recipe.difficulty}</span>
        </div>
      </div>
      <img src="${recipe.image}" alt="${recipe.name}">
    </section>
    <section class="shop-layout recipe-shop">
      <aside class="filter-panel sticky-panel">
        <p class="eyebrow">Basket Builder</p>
        <h2>${formatAed(recipe.value)}</h2>
        <p>Everything in this recipe is designed to move straight into cart.</p>
        <button class="primary-action" type="button" data-add-recipe="${recipe.skus.join(",")}">Add recipe basket</button>
      </aside>
      <div class="recipe-method">
        <h2>Method</h2>
        <ol>
          <li>Cook the Layla freezer items from frozen until hot and crisp.</li>
          <li>Warm the sauce gently and loosen with a splash of water if needed.</li>
          <li>Plate with fresh herbs, crunch, chutney or chilli oil.</li>
          <li>Serve immediately while the textures are at their best.</li>
        </ol>
        <h2>Recipe SKUs</h2>
        <div class="product-grid compact-grid">
          ${items.map((item) => productCard(item, "mini")).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderCartPage() {
  const slot = document.querySelector("[data-cart-page]");
  if (!slot) {
    return;
  }

  const cart = getStoredCart();
  if (!cart.length) {
    slot.innerHTML = `
      <section class="empty-state cart-empty">
        <h1>Your Cart is Waiting</h1>
        <p>Add freezer staples, recipe baskets or a Layla+ box.</p>
        <a class="primary-action" href="shop.html">Start shopping</a>
      </section>
    `;
    return;
  }

  const rows = cart.map((item) => {
    const product = productBySku(item.sku);
    return `
      <article class="cart-line">
        <img src="${productImage(product)}" alt="${product.name}">
        <div>
          <h3>${product.name}</h3>
          <p>${product.size}</p>
          <button type="button" data-remove-sku="${product.sku}">Remove</button>
        </div>
        <strong>${item.quantity} x ${formatAed(product.price)}</strong>
      </article>
    `;
  }).join("");

  slot.innerHTML = `
    <section class="cart-page">
      <div>
        <p class="eyebrow">Cart</p>
        <h1>Your Freezer Basket</h1>
        <div class="cart-lines">${rows}</div>
      </div>
      <aside class="order-summary">
        <h2>Order Summary</h2>
        <div><span>Subtotal</span><strong>${formatAed(cartTotals())}</strong></div>
        <div><span>Delivery</span><strong>${cartTotals() >= 350 ? "Free" : "Calculated"}</strong></div>
        <a class="primary-action" href="checkout.html">Proceed to checkout</a>
      </aside>
    </section>
  `;
}

function bindGlobalProductButtons() {
  document.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-sku]");
    if (addButton) {
      addProductToCart(addButton.dataset.addSku);
      const original = addButton.textContent;
      addButton.textContent = "Added";
      window.setTimeout(() => {
        addButton.textContent = original;
      }, 900);
    }

    const recipeButton = event.target.closest("[data-add-recipe]");
    if (recipeButton) {
      recipeButton.dataset.addRecipe.split(",").forEach((sku) => addProductToCart(sku.trim()));
      recipeButton.textContent = "Recipe added";
    }

    const removeButton = event.target.closest("[data-remove-sku]");
    if (removeButton) {
      const next = getStoredCart().filter((item) => item.sku !== removeButton.dataset.removeSku);
      setStoredCart(next);
      renderCartPage();
    }
  });
}

function initAccordions() {
  document.querySelectorAll("[data-accordion] details").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) {
        return;
      }
      item.parentElement.querySelectorAll("details").forEach((other) => {
        if (other !== item) {
          other.removeAttribute("open");
        }
      });
    });
  });
}

function initRevealAnimation() {
  const items = [...document.querySelectorAll(".page-hero, .inner-band, .collection-product, .stack-card, .form-card, .recipe-index-card")];
  if (!("IntersectionObserver" in window)) {
    return;
  }
  items.forEach((item) => item.classList.add("reveal"));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach((item) => observer.observe(item));
}

renderCategoryRail();
renderCollectionGrid();
renderProductDetail();
renderRecipeIndex();
renderRecipeDetail();
renderCartPage();
bindCollectionControls();
bindProductControls();
bindGlobalProductButtons();
initAccordions();
initRevealAnimation();
