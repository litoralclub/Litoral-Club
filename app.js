// CONFIGURACIÓN
const CONFIG = {
  whatsappNumber: '5493487625552',
  currencySymbol: '$',
};

// CATÁLOGO CON GALERÍA DE FOTOS
const PRODUCTS = [
  {
    id: 1,
    name: 'GORRA TRUCKER BLACK ICON',
    category: 'Trucker',
    price: 18500,
    badge: 'BEST SELLER',
    desc: 'Trucker clásica con frente acolchado, bordado frontal de alta densidad y malla respirable premium.',
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80',
      'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=800&q=80',
      'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80'
    ]
  },
  {
    id: 2,
    name: 'SNAPBACK LITORAL CORE WHITE',
    category: 'Snapback',
    price: 21000,
    badge: 'NUEVO DROP',
    desc: 'Snapback estructura rígida de 6 paneles, visera plana con sticker de autenticidad y calce streetwear.',
    images: [
      'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=800&q=80',
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80'
    ]
  },
  {
    id: 3,
    name: 'DAD CAP VINTAGE WASHED',
    category: 'Dad Cap',
    price: 17500,
    badge: 'LIMITED',
    desc: 'Algodón 100% gastado estilo vintage, visera curva y hebilla metálica trasera regulable.',
    images: [
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800&q=80',
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80'
    ]
  },
  {
    id: 4,
    name: 'TRUCKER BEIGE & BROWN SPECIAL',
    category: 'Trucker',
    price: 19500,
    badge: 'DROP 2026',
    desc: 'Combinación bicolor en tonos tierra, visera semicurva y etiqueta tejida lateral.',
    images: [
      'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80',
      'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=800&q=80'
    ]
  }
];

let cart = JSON.parse(localStorage.getItem('litoral_cart')) || [];
let activeCategory = 'TODAS';
let currentModalProduct = null;
let currentModalImgIndex = 0;

// Renderizado inicial
function initStore() {
  renderCategories();
  renderProducts();
  updateCartUI();

  const waLink = document.getElementById('wa-contact-link');
  if (waLink) {
    waLink.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent('¡Hola Litoral Club! Quería consultar por las gorras.')}`;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStore);
} else {
  initStore();
}

function renderCategories() {
  const pillsContainer = document.getElementById('category-pills');
  if (!pillsContainer) return;

  const categories = ['TODAS', ...new Set(PRODUCTS.map(p => p.category))];
  pillsContainer.innerHTML = categories.map(cat => `
    <button type="button" class="filter-pill ${cat === activeCategory ? 'active' : ''}" onclick="filterCategory('${cat}')">
      ${cat}
    </button>
  `).join('');
}

function filterCategory(cat) {
  activeCategory = cat;
  renderCategories();
  renderProducts();
}

function filterAndGo(cat) {
  switchTab('productos');
  filterCategory(cat);
}

function renderProducts(searchQuery = '') {
  const catalogGrid = document.getElementById('catalog-grid');
  const featuredGrid = document.getElementById('featured-grid');

  let filtered = PRODUCTS.filter(p => {
    const matchesCat = (activeCategory === 'TODAS' || p.category === activeCategory);
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const generateCardHTML = (p) => `
    <div class="product-card" onclick="openProductModal(${p.id})">
      <div class="product-thumb">
        ${p.badge ? `<span class="badge-promo">${p.badge}</span>` : ''}
        <img src="${p.images[0]}" alt="${p.name}" loading="lazy">
      </div>
      <div class="product-details">
        <span class="prod-category">${p.category}</span>
        <h4 class="prod-title">${p.name}</h4>
        <p class="prod-desc">${p.desc}</p>
        <div class="prod-action" onclick="event.stopPropagation()">
          <span class="prod-price">${CONFIG.currencySymbol}${p.price.toLocaleString('es-AR')}</span>
          <button type="button" class="btn-add" onclick="addToCart(${p.id})">AGREGAR</button>
        </div>
      </div>
    </div>
  `;

  if (catalogGrid) {
    catalogGrid.innerHTML = filtered.map(generateCardHTML).join('');
  }

  if (featuredGrid) {
    featuredGrid.innerHTML = PRODUCTS.slice(0, 4).map(generateCardHTML).join('');
  }
}

function handleSearch() {
  const query = document.getElementById('searchInput').value;
  if (query.trim() !== '') {
    switchTab('productos');
  }
  renderProducts(query);
}

// Modal y Galería Deslizable
window.openProductModal = function(prodId) {
  const product = PRODUCTS.find(p => p.id === prodId);
  if (!product) return;

  currentModalProduct = product;
  currentModalImgIndex = 0;

  document.getElementById('modalCategory').innerText = product.category;
  document.getElementById('modalTitle').innerText = product.name;
  document.getElementById('modalPrice').innerText = `${CONFIG.currencySymbol}${product.price.toLocaleString('es-AR')}`;
  document.getElementById('modalDesc').innerText = product.desc;

  const addBtn = document.getElementById('modalAddBtn');
  addBtn.onclick = () => {
    addToCart(product.id);
    closeProductModal();
    toggleCart(true);
  };

  updateModalImage();
  renderModalThumbs();

  document.getElementById('productModal').classList.add('open');
};

function updateModalImage() {
  const mainImg = document.getElementById('modalMainImg');
  if (currentModalProduct && currentModalProduct.images.length > 0) {
    mainImg.src = currentModalProduct.images[currentModalImgIndex];
  }
  
  const thumbs = document.querySelectorAll('.slider-thumb-item');
  thumbs.forEach((th, idx) => {
    th.classList.toggle('active', idx === currentModalImgIndex);
  });
}

function renderModalThumbs() {
  const thumbsContainer = document.getElementById('modalThumbs');
  if (!currentModalProduct || currentModalProduct.images.length <= 1) {
    thumbsContainer.innerHTML = '';
    return;
  }

  thumbsContainer.innerHTML = currentModalProduct.images.map((img, idx) => `
    <img src="${img}" class="slider-thumb-item ${idx === currentModalImgIndex ? 'active' : ''}" onclick="setModalImg(${idx})">
  `).join('');
}

window.setModalImg = function(index) {
  currentModalImgIndex = index;
  updateModalImage();
};

window.nextModalImg = function() {
  if (!currentModalProduct) return;
  currentModalImgIndex = (currentModalImgIndex + 1) % currentModalProduct.images.length;
  updateModalImage();
};

window.prevModalImg = function() {
  if (!currentModalProduct) return;
  currentModalImgIndex = (currentModalImgIndex - 1 + currentModalProduct.images.length) % currentModalProduct.images.length;
  updateModalImage();
};

window.closeProductModal = function(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains('close-modal')) return;
  document.getElementById('productModal').classList.remove('open');
};

// Pestañas
window.switchTab = function(tabName) {
  ['inicio', 'productos', 'contacto'].forEach(tab => {
    const view = document.getElementById(`view-${tab}`);
    const link = document.getElementById(`tab-${tab}`);
    if (view) view.style.display = (tab === tabName) ? 'block' : 'none';
    if (link) link.classList.toggle('active', tab === tabName);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Carrito
window.addToCart = function(prodId) {
  const item = PRODUCTS.find(p => p.id === prodId);
  const existing = cart.find(c => c.id === prodId);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }

  saveCart();
  updateCartUI();
};

window.changeQty = function(prodId, delta) {
  const item = cart.find(c => c.id === prodId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(c => c.id !== prodId);
  }

  saveCart();
  updateCartUI();
};

function saveCart() {
  localStorage.setItem('litoral_cart', JSON.stringify(cart));
}

function updateCartUI() {
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const cartCountEl = document.getElementById('cart-count');
  if (cartCountEl) cartCountEl.innerText = totalCount;

  const drawerTotalEl = document.getElementById('drawer-total-price');
  if (drawerTotalEl) drawerTotalEl.innerText = `${CONFIG.currencySymbol}${totalPrice.toLocaleString('es-AR')}`;

  const drawerItems = document.getElementById('drawer-items');
  if (drawerItems) {
    if (cart.length === 0) {
      drawerItems.innerHTML = '<p style="text-align: center; color: #777; margin-top: 2rem;">El carrito está vacío.</p>';
    } else {
      drawerItems.innerHTML = cart.map(item => `
        <div class="drawer-item">
          <div class="drawer-item-info">
            <strong>${item.name}</strong>
            <span>${item.qty} x ${CONFIG.currencySymbol}${item.price.toLocaleString('es-AR')}</span>
          </div>
          <div class="drawer-qty-btns">
            <button type="button" onclick="changeQty(${item.id}, -1)">-</button>
            <span>${item.qty}</span>
            <button type="button" onclick="changeQty(${item.id}, 1)">+</button>
          </div>
        </div>
      `).join('');
    }
  }
}

window.toggleCart = function(show) {
  const drawer = document.getElementById('cart-drawer');
  if (drawer) drawer.classList.toggle('open', show);
};

window.handleDrawerBackdrop = function(e) {
  if (e.target.id === 'cart-drawer') toggleCart(false);
};

window.checkoutWhatsApp = function() {
  if (cart.length === 0) {
    alert('Tu carrito está vacío.');
    return;
  }

  let text = '⚡ *NUEVO PEDIDO - LITORAL CLUB* ⚡\n\n';
  let total = 0;

  cart.forEach(item => {
    const sub = item.price * item.qty;
    total += sub;
    text += `• *${item.name}* x${item.qty} — $${sub.toLocaleString('es-AR')}\n`;
  });

  text += `\n*TOTAL:* $${total.toLocaleString('es-AR')}\n`;
  text += '---------------------------------\n';
  text += 'Hola! Quiero coordinar el pago y el envío para este pedido.';

  window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
};
