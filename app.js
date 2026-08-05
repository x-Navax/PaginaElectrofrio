// ==========================================================
// CONFIGURACIÓN PRINCIPAL
// ==========================================================

const CONFIG = {
  // Podés pegar la URL normal de edición, la URL publicada o la URL CSV.
  // Ejemplo normal:
  // https://docs.google.com/spreadsheets/d/ID_DE_TU_PLANILLA/edit#gid=0
  googleSheetsCsvUrl: "https://docs.google.com/spreadsheets/d/1jEzoIQRDqij0PQwZ3IgqXi4iCMFi2_WHpeXlTNrN6p0/edit?usp=sharing",

  // Nombre de la pestaña donde están los productos.
  sheetName: "Productos",

  // Número de WhatsApp con código de país, sin +, espacios ni guiones.
  // Ejemplo Argentina: 5493487000000
  whatsappNumber: "5491162799000",

  businessName: "Electrofrío",
  locale: "es-AR",
  currency: "ARS",

  // Imagen que se usa si un producto no tiene una URL válida.
  fallbackImage:
    "https://images.unsplash.com/photo-1581092919535-7146ff1a5904?auto=format&fit=crop&w=900&q=80"
};

// ==========================================================
// PRODUCTOS DE EJEMPLO
// Se muestran cuando todavía no se configuró Google Sheets.
// Podés borrarlos una vez conectada la planilla.
// ==========================================================

const SAMPLE_PRODUCTS = [
  {
    id: "1",
    nombre: "Disyuntor diferencial Schneider 2P",
    categoria: "Electricidad",
    precio: 78500,
    imagen: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80",
    descripcion: "Protección diferencial para instalaciones eléctricas domiciliarias y comerciales.",
    destacado: true,
    stock: "Disponible",
    marca: "Schneider"
  },
  {
    id: "2",
    nombre: "Bomba de vacío profesional",
    categoria: "Refrigeración",
    precio: 289900,
    imagen: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=80",
    descripcion: "Ideal para trabajos de instalación y mantenimiento de equipos de refrigeración.",
    destacado: true,
    stock: "Disponible",
    marca: "Genérica"
  },
  {
    id: "3",
    nombre: "Juego de manómetros para refrigeración",
    categoria: "Herramientas",
    precio: 126000,
    imagen: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=900&q=80",
    descripcion: "Kit de medición para servicio técnico de aire acondicionado y refrigeración.",
    destacado: true,
    stock: "Últimas unidades",
    marca: "Profesional"
  },
  {
    id: "4",
    nombre: "Gas refrigerante R134a",
    categoria: "Gases refrigerantes",
    precio: 0,
    imagen: "https://images.unsplash.com/photo-1600861194942-f883de0dfe96?auto=format&fit=crop&w=900&q=80",
    descripcion: "Gas refrigerante para aplicaciones compatibles. Consultar presentación y disponibilidad.",
    destacado: false,
    stock: "Consultar",
    marca: "R134a"
  },
  {
    id: "5",
    nombre: "Térmica bipolar 25A",
    categoria: "Electricidad",
    precio: 12400,
    imagen: "https://images.unsplash.com/photo-1621905252472-e5f77a30ce61?auto=format&fit=crop&w=900&q=80",
    descripcion: "Interruptor termomagnético bipolar para protección de circuitos.",
    destacado: false,
    stock: "Disponible",
    marca: "Sica"
  },
  {
    id: "6",
    nombre: "Capacitor para aire acondicionado",
    categoria: "Repuestos",
    precio: 9800,
    imagen: "https://images.unsplash.com/photo-1592833159155-c62df1b65634?auto=format&fit=crop&w=900&q=80",
    descripcion: "Diferentes capacidades para equipos de refrigeración y aire acondicionado.",
    destacado: false,
    stock: "Disponible",
    marca: "Universal"
  },
  {
    id: "7",
    nombre: "Plafón LED Candela",
    categoria: "Iluminación",
    precio: 18500,
    imagen: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?auto=format&fit=crop&w=900&q=80",
    descripcion: "Iluminación LED de bajo consumo para interiores.",
    destacado: false,
    stock: "Disponible",
    marca: "Candela"
  },
  {
    id: "8",
    nombre: "Pinza amperométrica digital",
    categoria: "Herramientas",
    precio: 44900,
    imagen: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=80",
    descripcion: "Medición práctica de corriente, tensión y continuidad.",
    destacado: false,
    stock: "Disponible",
    marca: "Digital"
  }
];

let allProducts = [];
let filteredProducts = [];

// ==========================================================
// ELEMENTOS
// ==========================================================

const featuredProductsContainer = document.getElementById("featuredProducts");
const productsGrid = document.getElementById("productsGrid");
const categoriesGrid = document.getElementById("categoriesGrid");
const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("searchInput");
const resultsCount = document.getElementById("resultsCount");
const clearFiltersButton = document.getElementById("clearFilters");
const emptyState = document.getElementById("emptyState");
const productModal = document.getElementById("productModal");
const catalogClosed = document.getElementById("catalogClosed");

// ==========================================================
// INICIO
// ==========================================================

document.addEventListener("DOMContentLoaded", async () => {
  setupMenu();
  setupWhatsappLinks();
  setupFilters();
  setupModal();
  document.getElementById("currentYear").textContent = new Date().getFullYear();

  allProducts = await loadProducts();
  filteredProducts = [];

  populateCategoryFilter();
  renderCategories();
  renderFeaturedProducts();
  showClosedCatalog();
  updateHeroProduct();
});

// ==========================================================
// CARGA DESDE GOOGLE SHEETS
// ==========================================================

async function loadProducts() {
  if (!CONFIG.googleSheetsCsvUrl.trim()) {
    console.info("Google Sheets no configurado. Se usan productos de ejemplo.");
    return SAMPLE_PRODUCTS;
  }

  try {
    const csvUrl = buildGoogleSheetsCsvUrl(CONFIG.googleSheetsCsvUrl, CONFIG.sheetName);
    console.info("Leyendo productos desde:", csvUrl);

    const response = await fetch(`${csvUrl}${csvUrl.includes("?") ? "&" : "?"}_=${Date.now()}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const csvText = await response.text();
    const rows = parseCsv(csvText);

    if (!rows.length) {
      throw new Error("La planilla no contiene filas o no está publicada para lectura.");
    }

    const products = rows
      .map(normalizeProduct)
      .filter(product => product.nombre)
      .filter(product => product.activo);

    if (!products.length) {
      throw new Error('No se encontró la columna "nombre". Revisá los encabezados.');
    }

    return products;
  } catch (error) {
    console.error("No se pudo cargar Google Sheets:", error);
    resultsCount.textContent =
      `Error al cargar Google Sheets: ${error.message}`;
    return SAMPLE_PRODUCTS;
  }
}

function buildGoogleSheetsCsvUrl(inputUrl, sheetName = "Productos") {
  const url = String(inputUrl || "").trim();

  if (!url) return "";

  // Si ya es un enlace CSV/GVIZ, se usa directamente.
  if (url.includes("tqx=out:csv") || url.includes("output=csv")) {
    return url;
  }

  const idMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!idMatch) {
    throw new Error("La URL de Google Sheets no es válida.");
  }

  const spreadsheetId = idMatch[1];
  const gidMatch = url.match(/[?#&]gid=(\d+)/);

  if (gidMatch) {
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&gid=${gidMatch[1]}`;
  }

  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

// Convierte CSV a objetos usando la primera fila como encabezado.
// Soporta comas, comillas y saltos de línea dentro de campos.
function parseCsv(csvText) {
  const rows = [];
  let row = [];
  let field = "";
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      field += '"';
      i++;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") i++;
      row.push(field);
      field = "";

      if (row.some(cell => cell.trim() !== "")) {
        rows.push(row);
      }

      row = [];
      continue;
    }

    field += char;
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map(header =>
    normalizeKey(header)
  );

  return rows.slice(1).map(cells => {
    const object = {};
    headers.forEach((header, index) => {
      object[header] = (cells[index] || "").trim();
    });
    return object;
  });
}

function normalizeKey(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");
}

function normalizeProduct(row, index) {
  return {
    id: row.id || String(index + 1),
    nombre: row.nombre || row.producto || "",
    categoria: row.categoria || "Otros",
    precio: parsePrice(row.precio),
    imagen: normalizeImageUrl(row.imagen || row.foto || ""),
    descripcion: row.descripcion || "",
    destacado: parseBoolean(row.destacado),
    activo: parseActive(row.activo),
    stock: row.stock || "Consultar",
    marca: row.marca || ""
  };
}

function parsePrice(value) {
  if (typeof value === "number") return value;

  const cleaned = String(value || "")
    .replace(/\$/g, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const number = Number(cleaned);
  return Number.isFinite(number) ? number : 0;
}

function parseBoolean(value) {
  return ["si", "sí", "true", "1", "x", "destacado"].includes(
    String(value || "").trim().toLowerCase()
  );
}

function parseActive(value) {
  const normalizedValue = String(value || "")
    .trim()
    .toLowerCase();

  // Si la celda está vacía, el producto queda activo.
  // Esto evita que desaparezcan los productos que ya cargaste.
  if (!normalizedValue) {
    return true;
  }

  return [
    "si",
    "sí",
    "true",
    "1",
    "x",
    "activo"
  ].includes(normalizedValue);
}

// Convierte links compartidos de Google Drive en links directos de imagen.
function normalizeImageUrl(url) {
  if (!url) return CONFIG.fallbackImage;

  const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const fileId = driveMatch?.[1] || idMatch?.[1];

  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
  }

  return url;
}

// ==========================================================
// RENDER DE PRODUCTOS
// ==========================================================

function renderFeaturedProducts() {
  const featured = allProducts.filter(
    product => product.destacado
  );

  const featuredSection =
    document.getElementById("destacados");

  if (featured.length === 0) {
    featuredSection.classList.add("hidden");
    return;
  }

  featuredSection.classList.remove("hidden");

  featuredProductsContainer.innerHTML = featured
    .map(product => createProductCard(product, true))
    .join("");

  bindProductButtons(featuredProductsContainer);
  setupFeaturedCarousel();
}

function setupFeaturedCarousel() {
  const track = document.getElementById("featuredProducts");
  const prevButton = document.getElementById("featuredPrev");
  const nextButton = document.getElementById("featuredNext");
  const dotsContainer = document.getElementById("featuredDots");

  if (!track || !prevButton || !nextButton || !dotsContainer) {
    return;
  }

  const cards = [...track.querySelectorAll(".product-card")];

  if (!cards.length) {
    dotsContainer.innerHTML = "";
    return;
  }

  let currentPage = 0;
  let pagePositions = [];
  let scrollTimer;
  let resizeTimer;

  function getVisibleCards() {
    if (window.innerWidth <= 700) return 1;
    if (window.innerWidth <= 1020) return 2;
    return 3;
  }

  function calculatePagePositions() {
    const visibleCards = getVisibleCards();
    const maxScroll = Math.max(
      0,
      track.scrollWidth - track.clientWidth
    );

    const positions = [];

    for (
      let index = 0;
      index < cards.length;
      index += visibleCards
    ) {
      const card = cards[index];

      if (!card) continue;

      positions.push(
        Math.min(card.offsetLeft, maxScroll)
      );
    }

    // Agrega una posición exacta para el final.
    positions.push(maxScroll);

    pagePositions = [
      ...new Set(
        positions.map(position =>
          Math.round(position)
        )
      )
    ].sort((a, b) => a - b);

    if (!pagePositions.length) {
      pagePositions = [0];
    }

    currentPage = Math.min(
      currentPage,
      pagePositions.length - 1
    );
  }

  function findNearestPage() {
    const currentScroll = track.scrollLeft;

    let nearestIndex = 0;
    let smallestDistance = Infinity;

    pagePositions.forEach((position, index) => {
      const distance = Math.abs(
        position - currentScroll
      );

      if (distance < smallestDistance) {
        smallestDistance = distance;
        nearestIndex = index;
      }
    });

    return nearestIndex;
  }

  function updateDots() {
    [...dotsContainer.children].forEach(
      (dot, index) => {
        dot.classList.toggle(
          "is-active",
          index === currentPage
        );
      }
    );
  }

  function goToPage(page, behavior = "smooth") {
    const totalPages = pagePositions.length;

    if (!totalPages) return;

    // Carrusel circular
    if (page >= totalPages) {
      currentPage = 0;
    } else if (page < 0) {
      currentPage = totalPages - 1;
    } else {
      currentPage = page;
    }

    track.scrollTo({
      left: pagePositions[currentPage],
      behavior
    });

    updateDots();
  }

  function createDots() {
    dotsContainer.innerHTML = "";

    pagePositions.forEach((_, index) => {
      const dot = document.createElement("button");

      dot.type = "button";
      dot.className = "carousel-dot";

      dot.setAttribute(
        "aria-label",
        `Ir al grupo ${index + 1}`
      );

      dot.addEventListener("click", () => {
        goToPage(index);
      });

      dotsContainer.appendChild(dot);
    });

    updateDots();
  }

  prevButton.disabled = false;
  nextButton.disabled = false;

  prevButton.onclick = () => {
    goToPage(currentPage - 1);
  };

  nextButton.onclick = () => {
    goToPage(currentPage + 1);
  };

  track.addEventListener("scroll", () => {
    clearTimeout(scrollTimer);

    scrollTimer = setTimeout(() => {
      currentPage = findNearestPage();
      updateDots();
    }, 100);
  });

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
      currentPage = 0;

      track.scrollTo({
        left: 0,
        behavior: "auto"
      });

      calculatePagePositions();
      createDots();
    }, 160);
  });

  requestAnimationFrame(() => {
    calculatePagePositions();
    createDots();
    goToPage(0, "auto");
  });
}

function renderProducts() {
  productsGrid.innerHTML = filteredProducts
    .map(product => createProductCard(product, false))
    .join("");

  const count = filteredProducts.length;
  resultsCount.textContent = `${count} producto${count === 1 ? "" : "s"} encontrado${count === 1 ? "" : "s"}`;
  emptyState.classList.toggle("hidden", count > 0);
  productsGrid.classList.toggle("hidden", count === 0);

  bindProductButtons(productsGrid);
}

function createProductCard(product, showBadge) {
  const stockClass = isOutOfStock(product.stock)
    ? "product-card__stock product-card__stock--out"
    : "product-card__stock";

  return `
    <article class="product-card">
      ${showBadge ? '<span class="product-card__badge">DESTACADO</span>' : ""}
      <button
        class="product-card__image js-open-product"
        data-product-id="${escapeHtml(product.id)}"
        aria-label="Ver ${escapeHtml(product.nombre)}"
        type="button"
        style="border:0; width:100%;"
      >
        <img
          src="${escapeHtml(product.imagen || CONFIG.fallbackImage)}"
          alt="${escapeHtml(product.nombre)}"
          loading="lazy"
          onerror="this.onerror=null;this.src='${CONFIG.fallbackImage}'"
        />
      </button>

      <div class="product-card__body">
        <span class="product-card__category">
        ${escapeHtml(product.categoria)}
    </span>

    ${
      product.marca
      ? `<span class="product-card__brand">
            ${escapeHtml(product.marca)}
         </span>`
      : ""
    }
          ${escapeHtml(product.descripcion || "Consultá características y disponibilidad.")}
        </p>

        <span class="${stockClass}">${escapeHtml(product.stock)}</span>

        <div class="product-card__bottom">
          <div class="product-card__price">
            ${formatPrice(product.precio)}
            <small>${product.precio > 0 ? "Precio de referencia" : "Precio y disponibilidad"}</small>
          </div>

          <button
            class="product-card__button js-open-product"
            data-product-id="${escapeHtml(product.id)}"
            type="button"
            aria-label="Consultar ${escapeHtml(product.nombre)}"
          >
            +
          </button>
        </div>
      </div>
    </article>
  `;
}

function bindProductButtons(container) {
  container.querySelectorAll(".js-open-product").forEach(button => {
    button.addEventListener("click", () => {
      const product = allProducts.find(item => String(item.id) === button.dataset.productId);
      if (product) openProductModal(product);
    });
  });
}

function updateHeroProduct() {
  const featured = allProducts.find(product => product.destacado) || allProducts[0];
  if (!featured) return;

  document.getElementById("heroProductImage").src =
    featured.imagen || CONFIG.fallbackImage;
  document.getElementById("heroProductImage").alt = featured.nombre;
  document.getElementById("heroProductCategory").textContent =
    featured.categoria;
  document.getElementById("heroProductName").textContent =
    featured.nombre;
  document.getElementById("heroProductPrice").textContent =
    formatPrice(featured.precio);
}

// ==========================================================
// CATEGORÍAS Y FILTROS
// ==========================================================

function getCategories() {
  return [...new Set(allProducts.map(product => product.categoria).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "es"));
}

function populateCategoryFilter() {
  const options = getCategories()
    .map(category => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
    .join("");

  categoryFilter.insertAdjacentHTML("beforeend", options);
}

function renderCategories() {
  const categories = getCategories();

  categoriesGrid.innerHTML = categories
    .slice(0, 8)
    .map((category, index) => {
      const count = allProducts.filter(product => product.categoria === category).length;
      return `
        <button class="category-card" type="button" data-category="${escapeHtml(category)}">
          <div class="category-card__icon">${getCategoryIcon(category, index)}</div>
          <div>
            <strong>${escapeHtml(category)}</strong>
            <span>${count} producto${count === 1 ? "" : "s"}</span>
          </div>
        </button>
      `;
    })
    .join("");

  categoriesGrid.querySelectorAll(".category-card").forEach(button => {
    button.addEventListener("click", () => {
      categoryFilter.value = button.dataset.category;
      applyFilters();
      document.getElementById("productos").scrollIntoView({ behavior: "smooth" });
    });
  });
}

function getCategoryIcon(category, index) {
  const text = category.toLowerCase();

  if (text.includes("electric")) return "⚡";
  if (text.includes("refriger")) return "❄";
  if (text.includes("herramient")) return "◆";
  if (text.includes("gas")) return "◉";
  if (text.includes("repuesto")) return "⚙";
  if (text.includes("ilumina")) return "✦";
  return ["◇", "●", "▣", "✧"][index % 4];
}

function setupFilters() {
  searchInput.addEventListener("input", applyFilters);
  categoryFilter.addEventListener("change", applyFilters);

  clearFiltersButton.addEventListener("click", () => {
    searchInput.value = "";
    categoryFilter.value = "todos";
    applyFilters();
  });
}

function applyFilters() {
  const query = normalizeText(searchInput.value.trim());
  const category = categoryFilter.value;

  // Si no escribió nada y tampoco eligió categoría,
  // mantenemos el catálogo cerrado.
  if (!query && !category) {
    showClosedCatalog();
    return;
  }

  filteredProducts = allProducts.filter(product => {
    const searchableText = normalizeText(
      `${product.nombre} ${product.categoria} ${product.marca} ${product.descripcion}`
    );

    const matchesSearch =
      !query || searchableText.includes(query);

    const matchesCategory =
      !category || product.categoria === category;

    return matchesSearch && matchesCategory;
  });

  catalogClosed.classList.add("hidden");
  renderProducts();
}

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// ==========================================================
// MODAL
// ==========================================================

function setupModal() {
  document.querySelectorAll("[data-close-modal]").forEach(element => {
    element.addEventListener("click", closeProductModal);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeProductModal();
  });
}

function openProductModal(product) {
  document.getElementById("modalProductImage").src =
    product.imagen || CONFIG.fallbackImage;
  document.getElementById("modalProductImage").alt = product.nombre;
  document.getElementById("modalProductCategory").textContent =
    product.categoria;
  document.getElementById("modalProductName").textContent =
    product.nombre;
  document.getElementById("modalProductDescription").textContent =
    product.descripcion || "Consultá características, opciones y disponibilidad.";
  document.getElementById("modalProductPrice").textContent =
    formatPrice(product.precio);
  document.getElementById("modalProductStock").textContent =
    `Stock: ${product.stock}`;

  document.getElementById("modalWhatsapp").href =
    buildWhatsappUrl(
      `Hola, quería consultar por el producto: ${product.nombre} (${product.categoria}).`
    );

  productModal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeProductModal() {
  productModal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

// ==========================================================
// WHATSAPP Y MENÚ
// ==========================================================

function setupWhatsappLinks() {
  const generalMessage =
    `Hola ${CONFIG.businessName}, quería consultar por sus productos.`;

  [
    "headerWhatsapp",
    "heroWhatsapp",
    "ctaWhatsapp",
    "footerWhatsapp"
  ].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.href = buildWhatsappUrl(generalMessage);
  });
}

function buildWhatsappUrl(message) {
  const number = CONFIG.whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function setupMenu() {
  const menuButton = document.getElementById("menuBtn");
  const nav = document.getElementById("nav");

  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}

// ==========================================================
// UTILIDADES
// ==========================================================

function formatPrice(price) {
  if (!price || price <= 0) return "Consultar";

  return new Intl.NumberFormat(CONFIG.locale, {
    style: "currency",
    currency: CONFIG.currency,
    maximumFractionDigits: 0
  }).format(price);
}

function isOutOfStock(stock) {
  const text = normalizeText(stock);
  return text.includes("sin stock") || text.includes("agotado") || text.includes("no disponible");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
