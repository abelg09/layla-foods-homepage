const threshold = 350;
let cartTotal = 0;
let cartCount = 0;
let heroIndex = 0;

const heroSlides = [
  {
    eyebrow: "New this week",
    title: "The freezer upgrade",
    copy: "Premium gyoza, toasties, samosas, kebabs and sauces delivered cold-chain across Dubai.",
    cta: "Shop now",
    image: "assets/photos/kebab.jpg",
    alt: "Grilled kebab platter with sauces"
  },
  {
    eyebrow: "Friday hosting",
    title: "Snack boxes made easy",
    copy: "Pick Golden Wraps, The Crunch and Drizzle chutneys for a ready-to-serve party spread.",
    cta: "Build a box",
    image: "assets/photos/samosa.jpg",
    alt: "Golden samosas ready for a snack board"
  },
  {
    eyebrow: "Layla+",
    title: "Never run out",
    copy: "Monthly freezer boxes from AED 99 with family favorites, sauces and quick dinners.",
    cta: "Subscribe & save",
    image: "assets/photos/toastie.jpg",
    alt: "Toasted sandwich with melted filling"
  }
];

const cartCountEl = document.querySelector("#cartCount");
const cartTotalEl = document.querySelector("#cartTotal");
const deliveryMessageEl = document.querySelector("#deliveryMessage");
const progressFillEl = document.querySelector("#progressFill");
const productStatusEl = document.querySelector("#productStatus");
const basketSummaryEl = document.querySelector(".basket-summary");
const productCards = [...document.querySelectorAll(".product-card")];
const searchInput = document.querySelector("#productSearch");
const categoryButtons = [...document.querySelectorAll(".category-tile")];
const heroTitle = document.querySelector("#heroTitle");
const heroCopy = document.querySelector("#heroCopy");
const heroCta = document.querySelector("#heroCta");
const heroEyebrow = document.querySelector(".hero .eyebrow");
const heroDots = [...document.querySelectorAll(".hero-dots span")];
const heroImage = document.querySelector(".hero-image");

function formatAed(value) {
  return `AED ${value.toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function updateCart() {
  const remaining = Math.max(threshold - cartTotal, 0);
  const progress = Math.min((cartTotal / threshold) * 100, 100);
  cartCountEl.textContent = cartCount;
  cartTotalEl.textContent = `Basket ${formatAed(cartTotal)}`;
  deliveryMessageEl.textContent = remaining === 0
    ? "Free delivery unlocked"
    : `Add ${formatAed(remaining)} more for free delivery`;
  progressFillEl.style.width = `${progress}%`;
  basketSummaryEl.classList.toggle("is-active", cartCount > 0);
}

function filterProducts() {
  const active = document.querySelector(".category-tile.active")?.dataset.category || "all";
  const query = searchInput.value.trim().toLowerCase();
  let visible = 0;

  productCards.forEach((card) => {
    const category = card.dataset.category;
    const name = card.dataset.name.toLowerCase();
    const categoryMatch = active === "all" || category === active;
    const searchMatch = !query || name.includes(query) || category.toLowerCase().includes(query);
    const shouldShow = categoryMatch && searchMatch;
    card.hidden = !shouldShow;
    if (shouldShow) visible += 1;
  });

  if (query) {
    productStatusEl.textContent = visible
      ? `${visible} product${visible === 1 ? "" : "s"} found for "${searchInput.value}".`
      : `No bestseller match for "${searchInput.value}" yet.`;
    return;
  }

  productStatusEl.textContent = active === "all"
    ? "Shop our launch edit of Layla bestsellers."
    : visible
      ? `Showing ${active} products.`
      : `${active} products will appear here as the catalogue fills in.`;
}

function showHero(index) {
  heroIndex = (index + heroSlides.length) % heroSlides.length;
  const slide = heroSlides[heroIndex];
  heroEyebrow.textContent = slide.eyebrow;
  heroTitle.textContent = slide.title;
  heroCopy.textContent = slide.copy;
  heroCta.textContent = slide.cta;
  heroImage.src = slide.image;
  heroImage.alt = slide.alt;
  heroDots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === heroIndex));
}

function setupReveals() {
  const revealItems = [
    ...document.querySelectorAll(".delivery-card, .hero, .parent-section, .category-tile, .product-card, .feature-card, .recipe-card, .chef-card, .cookbook-card")
  ];

  if (!("IntersectionObserver" in window)) {
    return;
  }

  revealItems.forEach((item) => item.classList.add("reveal"));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  revealItems.forEach((item) => observer.observe(item));
}

document.querySelectorAll(".add-button").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".product-card");
    cartTotal += Number(card.dataset.price);
    cartCount += 1;
    button.textContent = "Added";
    window.setTimeout(() => {
      button.textContent = "Add to cart";
    }, 850);
    updateCart();
  });
});

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    categoryButtons.forEach((tile) => tile.classList.remove("active"));
    button.classList.add("active");
    filterProducts();
    document.querySelector("#bestsellers").scrollIntoView({ block: "start" });
  });
});

searchInput.addEventListener("input", filterProducts);
document.querySelector("#prevHero").addEventListener("click", () => showHero(heroIndex - 1));
document.querySelector("#nextHero").addEventListener("click", () => showHero(heroIndex + 1));
setupReveals();
updateCart();
