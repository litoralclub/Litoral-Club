// --- CONFIGURACIÓN DEL NEGOCIO ---
const WHATSAPP_PHONE = "543447542312"; // Reemplazá por tu número de WhatsApp con código de país

let gorrasDB = [];
let cart = JSON.parse(localStorage.getItem('litoral_cart')) || [];
let currentCategory = 'all';

// 1. Cargar productos desde products.json
async function loadProducts() {
  try {
    const res = await fetch('products.json');
    gorrasDB = await res.json();
    renderFeatured();
    renderCatalog(gorrasDB);
    buildCategoryPills();
    updateCartUI();
    document.getElementById('wa-contact-link').href = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent('Hola Litoral Club! Quiero hacer una consulta sobre sus gorras.')}`;
  } catch (err) {
    console.error("Error cargando productos:", err);
  }
}

// 2. Control de pestañas (Inicio, Gorras, Contacto)
function switchTab(tabId) {
  document.querySelectorAll('.tab-view').forEach(v => v.style.display = 'none');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  document.getElementById(`view-${tabId}`).style.display = 'block';
  const activeNav = document.getElementById(`tab-${tabId}`);
  if (activeNav) activeNav.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 3. Renderizar tarjetas de gorras
function renderGorraCard(g) {
  return `
    <div class="product-card">
      <div class="product-thumb">
        ${g.badge ? `<span class="badge-promo">${g.badge}</span>` : ''}
        <img src="${g.image}" alt="${g.name}" loading="lazy">
      </div>
      <div class="product-details">
        <span class="prod-category">${g.category}</span>
        <h4 class="prod-title">${g.name}</h4>
        <p class="prod-desc">${g.description}</p>
        <div class="prod-action">
          <span class="prod-price">$${g.price.toLocaleString('es-AR')}</span>
          <button class="btn-add" onclick="addToCart(${g.id})">+ AGREGAR</button>
        </div>
      </div>
    </div>
  `;
}

function renderFeatured() {
  document.getElementById('featured-grid').innerHTML = gorrasDB.slice(0, 4).map(renderGorraCard).join('');
}

function renderCatalog(items) {
  const container = document.getElementById('catalog-grid');
  if (items.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted); grid-column:1/-1; text-align:center; padding:3rem;">No se encontraron gorras con esa búsqueda.</p>';
    return;
  }
  container.innerHTML = items.map(renderGorraCard).join('');
}

function buildCategoryPills() {
  const categories = ['all', ...new Set(gorrasDB.map(g => g.category))];
  const pillsContainer = document.getElementById('category-pills');
  pillsContainer.innerHTML = categories.map(cat => `
    <button class="filter-pill ${cat === currentCategory ? 'active' : ''}" onclick="filterCategory('${cat}', this)">
      ${cat === 'all' ? 'TODAS LAS GORRAS' : cat}
    </button>
  `).join('');
}

function filterCategory(category, btnElement) {
  currentCategory = category;
  document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');

  const filtered = category === 'all' ? gorrasDB : gorrasDB.filter(g => g.category === category);
  renderCatalog(filtered);
}

function filterAndGo(category) {
  switchTab('productos');
  const targetPill = Array.from(document.querySelectorAll('.filter-pill')).find(p => p.textContent.trim().toLowerCase() === category.toLowerCase());
  filterCategory(category, targetPill);
}

// 4. Buscador en vivo
function handleSearch() {
  const query = document.getElementById('searchInput').value.toLowerCase().trim();
  switchTab('productos');
  const results = gorrasDB.filter(g => 
    g.name.toLowerCase().includes(query) || 
    g.category.toLowerCase().includes(query) || 
    g.description.toLowerCase().includes(query)
  );
  renderCatalog(results);
}

// 5. Carrito de Compras
function addToCart(id) {
  const item = gorrasDB.find(g => g.id === id);
  const exists = cart.find(g => g.id === id);
  if (exists) {
    exists.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  saveCart();
  toggleCart(true);
}

function updateQty(id, delta) {
  const item = cart.find(g => g.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(p => p.id !== id);
  }
  saveCart();
}

function saveCart() {
  localStorage.setItem('litoral_cart', JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const countElement = document.getElementById('cart-count');
  const itemsContainer = document.getElementById('drawer-items');
  const totalElement = document.getElementById('drawer-total-price');

  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  countElement.textContent = totalQty;

  if (cart.length === 0) {
    itemsContainer.innerHTML = '<p style="color:var(--text-muted); text-align:center; margin-top:3rem; font-size:0.9rem;">TU CARRITO ESTÁ VACÍO</p>';
    totalElement.textContent = '$0';
    return;
  }

  let total = 0;
  itemsContainer.innerHTML = cart.map(item => {
    const sub = item.price * item.qty;
    total += sub;
    return `
      <div class="drawer-item">
        <div class="drawer-item-info">
          <strong>${item.name}</strong>
          <span>$${item.price.toLocaleString('es-AR')} x ${item.qty}</span>
        </div>
        <div class="drawer-qty-btns">
          <button onclick="updateQty(${item.id}, -1)">-</button>
          <span style="font-size:0.85rem; font-weight:bold;">${item.qty}</span>
          <button onclick="updateQty(${item.id}, 1)">+</button>
        </div>
      </div>
    `;
  }).join('');

  totalElement.textContent = `$${total.toLocaleString('es-AR')}`;
}

function toggleCart(open) {
  const drawer = document.getElementById('cart-drawer');
  if (open) {
    drawer.classList.add('open');
  } else {
    drawer.classList.remove('open');
  }
}

function handleDrawerBackdrop(e) {
  if (e.target.id === 'cart-drawer') {
    toggleCart(false);
  }
}

// 6. Finalizar pedido por WhatsApp
function checkoutWhatsApp() {
  if (cart.length === 0) return alert('El carrito está vacío.');

  let message = "¡Hola Litoral Club! Quiero encargar el siguiente pedido:\n\n";
  let total = 0;

  cart.forEach((item, index) => {
    const sub = item.price * item.qty;
    total += sub;
    message += `${index + 1}. *${item.name}* (x${item.qty}) - $${sub.toLocaleString('es-AR')}\n`;
  });

  message += `\n*TOTAL DEL PEDIDO:* $${total.toLocaleString('es-AR')}\n`;
  message += "\n¿Cómo coordinamos el pago y los datos para el envío?";

  window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`, '_blank');
}

// Iniciar al cargar la web
window.onload = loadProducts;

function toggleSearch() {
  const wrapper = document.getElementById('searchWrapper');
  const input = document.getElementById('searchInput');
  
  wrapper.classList.toggle('active');

  if (wrapper.classList.contains('active')) {
    input.focus();
  } else {
    input.value = '';
    handleSearch(); // Restablece los productos si se cierra el buscador
  }
}

// Cierra el buscador si hacés clic fuera de él
document.addEventListener('click', function(event) {
  const wrapper = document.getElementById('searchWrapper');
  if (wrapper && !wrapper.contains(event.target) && wrapper.classList.contains('active')) {
    const input = document.getElementById('searchInput');
    if (input && input.value.trim() === '') {
      wrapper.classList.remove('active');
    }
  }
});
