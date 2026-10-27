// Preload gambar profil dan banner
const avatarPreload = new Image();
avatarPreload.src = 'profile.webp';

const bannerPreload = new Image();
bannerPreload.src = 'banner1.png';

// --- DATA INITIAL PRODUK AKUN (SOLUSI DATA ARRAY) ---
const defaultProducts = [
  {
    id: 1,
    code: "#FF-01",
    category: "ff",
    price: "150.000",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
    specs: ["Vault Melimpah", "Old Season Pass", "Diamond 200", "Single Log VK"]
  },
  {
    id: 2,
    code: "#ML-01",
    category: "ml",
    price: "280.000",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80",
    specs: ["Rank Mythic", "Skin Collector 2", "Skin Epic 8", "All Unbind All Login"]
  }
];

// Mengambil data produk dari LocalStorage jika ada, atau gunakan default
function getStoredProducts() {
  const localData = localStorage.getItem('fendi_store_products');
  return localData ? JSON.parse(localData) : defaultProducts;
}

function saveProducts(products) {
  localStorage.setItem('fendi_store_products', JSON.stringify(products));
}

// --- FITUR 1: TOGGLE TEMA TERANG / GELAP ---
const themeToggleBtn = document.getElementById('themeToggle');
const body = document.body;

themeToggleBtn.addEventListener('click', () => {
  body.classList.toggle('light-mode');
  body.classList.toggle('dark-mode');
});

// --- FITUR 2: RENDER DAFTAR PRODUK AKUN KE Halaman PRODUK ---
const productListContainer = document.getElementById('product-list-container');
let currentSubCategory = 'all';

function renderProducts(categoryFilter = 'all') {
  const products = getStoredProducts();
  const filteredProducts = categoryFilter === 'all' 
    ? products 
    : products.filter(item => item.category === categoryFilter);

  if (!productListContainer) return;

  if (filteredProducts.length === 0) {
    productListContainer.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--text-sub);">
        <p style="font-weight: 600;">Belum ada akun produk untuk kategori ini.</p>
      </div>
    `;
    return;
  }

  productListContainer.innerHTML = filteredProducts.map(item => {
    // Format pesan order WhatsApp otomatis
    const waText = encodeURIComponent(`Halo Admin Fendi Store, saya berminat beli Akun ${item.code} (${item.category.toUpperCase()}) seharga Rp ${item.price}. Apakah masih ada?`);
    const waUrl = `https://wa.me/6285854325988?text=${waText}`;

    const specsMarkup = item.specs.map(spec => `<li class="spec-item">${spec}</li>`).join('');

    return `
      <div class="account-card">
        <div class="account-media">
          <img src="${item.image}" alt="${item.code}" class="account-img" onerror="this.src='banner1.png'">
          <div class="account-badge-group">
            <span class="badge-code">${item.code}</span>
            <span class="badge-cat">${item.category === 'ff' ? 'Free Fire' : 'Mobile Legends'}</span>
          </div>
        </div>
        <div class="account-body">
          <div class="account-price-row">
            <span class="price-label">Harga Akun</span>
            <span class="account-price">Rp ${item.price}</span>
          </div>
          <ul class="account-specs-list">
            ${specsMarkup}
          </ul>
          <a href="${waUrl}" target="_blank" class="account-buy-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            <span>Beli Akun via WA</span>
          </a>
        </div>
      </div>
    `;
  }).join('');
}

// --- FITUR 3: SUB TABS PRODUK (Semua, Free Fire, Mobile Legends) ---
const subTabItems = document.querySelectorAll('.sub-tab-item');

subTabItems.forEach((btn) => {
  btn.addEventListener('click', function() {
    const targetSub = this.getAttribute('data-sub');
    currentSubCategory = targetSub;

    subTabItems.forEach(b => b.classList.remove('active'));
    this.classList.add('active');

    renderProducts(targetSub);
  });
});

// --- FITUR 4: PERPINDAHAN HALAMAN UTAMA (BOTTOM NAV) ---
const navItems = document.querySelectorAll('.nav-item');
const navIndicator = document.querySelector('.nav-indicator');
const tabContents = document.querySelectorAll('.tab-content');

function updateIndicator(index) {
  navIndicator.style.transform = `translateX(${index * 100}%)`;
}

function switchTab(targetTabId, navIndex) {
  navItems.forEach(nav => {
    nav.classList.remove('active');
    const icon = nav.querySelector('.icon-box');
    if (icon) icon.classList.remove('bounce');
  });

  tabContents.forEach(tab => {
    tab.classList.remove('active');
  });

  const targetNavItem = document.querySelector(`.nav-item[data-index="${navIndex}"]`);
  if (targetNavItem) {
    targetNavItem.classList.add('active');

    const currentIcon = targetNavItem.querySelector('.icon-box');
    if (currentIcon) {
      currentIcon.classList.add('bounce');
      currentIcon.addEventListener('animationend', () => {
        currentIcon.classList.remove('bounce');
      }, { once: true });
    }
  }

  const targetTab = document.getElementById(targetTabId);
  if (targetTab) {
    targetTab.classList.add('active');
  }

  updateIndicator(navIndex);
}

navItems.forEach((item) => {
  item.addEventListener('click', function(e) {
    e.preventDefault();
    const targetTabId = this.getAttribute('data-target');
    const navIndex = parseInt(this.getAttribute('data-index'));
    switchTab(targetTabId, navIndex);
  });
});

// Event trigger tombol pemicu antar tab (misalnya tombol Cek Keaslian Admin)
const switchTabTriggers = document.querySelectorAll('.switch-tab-trigger');
switchTabTriggers.forEach((trigger) => {
  trigger.addEventListener('click', function() {
    const targetTabId = this.getAttribute('data-target-tab');
    const navIndex = parseInt(this.getAttribute('data-nav-index'));
    switchTab(targetTabId, navIndex);
  });
});

// --- FITUR 5: FORM INPUT TAMBAH POSTINGAN AKUN BARU (DI TAB AKUN) ---
const addProductForm = document.getElementById('add-product-form');

if (addProductForm) {
  addProductForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const category = document.getElementById('prod-category').value;
    const code = document.getElementById('prod-code').value.trim();
    const price = document.getElementById('prod-price').value.trim();
    const image = document.getElementById('prod-image').value.trim();
    const specsRaw = document.getElementById('prod-specs').value.trim();

    const specsArray = specsRaw.split(',').map(s => s.trim()).filter(s => s.length > 0);

    const newProduct = {
      id: Date.now(),
      code: code,
      category: category,
      price: price,
      image: image,
      specs: specsArray
    };

    const currentProducts = getStoredProducts();
    currentProducts.unshift(newProduct);
    saveProducts(currentProducts);

    // Reset Form
    addProductForm.reset();

    // Render ulang produk & pindah langsung ke tab Produk (index 1)
    renderProducts(currentSubCategory);
    switchTab('tab-produk', 1);

    alert(`Akun ${code} berhasil diposting ke Tab Produk!`);
  });
}

// Render produk awal & atur posisi indikator navigasi ke Home (index 0)
renderProducts('all');
updateIndicator(0);
