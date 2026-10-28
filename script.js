const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyH5tILYOzA5zWntQir0gBruI00Y1Iwdw6QCuobIezCtajvvNIxdgiMIucs9n31PN4/exec";

function formatRupiah(val) {
  if (!val) return '0';
  const cleanNum = String(val).replace(/\D/g, '');
  return cleanNum ? new Intl.NumberFormat('id-ID').format(cleanNum) : '0';
}

// TOGGLE TEMA
const themeToggleBtn = document.getElementById('themeToggle');
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    document.body.classList.toggle('dark-mode');
  });
}

// DATA PRODUK
const productListContainer = document.getElementById('product-list-container');
let currentCategory = 'all';
let fetchedProducts = [];

async function loadProductsFromSheets() {
  if (!productListContainer) return;

  productListContainer.innerHTML = `
    <div style="grid-column: span 2; text-align: center; padding: 40px 10px; color: var(--text-sub);">
      <p style="font-size: 12px; font-weight: 600;">Mengambil produk dari server...</p>
    </div>
  `;

  try {
    const response = await fetch(`${SCRIPT_URL}?action=getProducts`);
    const data = await response.json();

    if (data.success) {
      fetchedProducts = data.products;
      renderProducts(currentCategory);
      renderHomeRecommendations();
    } else {
      renderProducts(currentCategory);
      renderHomeRecommendations();
    }
  } catch (err) {
    console.error("Gagal mengambil produk:", err);
    renderProducts(currentCategory);
    renderHomeRecommendations();
  }
}

// RENDER REKOMENDASI HOME
function renderHomeRecommendations() {
  const homeRecContainer = document.getElementById('home-recommendation-grid');
  if (!homeRecContainer) return;

  if (fetchedProducts.length === 0) {
    homeRecContainer.innerHTML = `<p style="grid-column: span 2; font-size: 12px; text-align:center; color: var(--text-sub);">Belum ada produk jualan.</p>`;
    return;
  }

  const homeProducts = fetchedProducts.slice(0, 4);

  homeRecContainer.innerHTML = homeProducts.map(item => `
    <div class="account-card home-card" data-id="${item.id}">
      <div class="account-media">
        <img src="${item.image}" alt="${item.code}" class="account-img" loading="lazy" onerror="this.onerror=null;this.src='banner1.png';">
        <div class="account-badge-group">
          <span class="badge-code">${item.code}</span>
          <span class="badge-cat">${item.category === 'ff' ? 'Free Fire' : 'Mobile Legends'}</span>
        </div>
      </div>
      <div class="account-body">
        <div class="account-price-row">
          <span class="price-label">Harga Akun</span>
          <span class="account-price">Rp ${formatRupiah(item.price)}</span>
        </div>
        <button type="button" class="btn-see-now">Lihat Sekarang</button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.home-card').forEach(card => {
    card.addEventListener('click', function() {
      const prodId = this.getAttribute('data-id');
      switchTab('tab-produk', 1);
      openProductDetail(prodId);
    });
  });
}

// RENDER KATALOG PRODUK
function renderProducts(filterCat = 'all') {
  const filtered = filterCat === 'all' 
    ? fetchedProducts 
    : fetchedProducts.filter(p => p.category === filterCat);

  if (!productListContainer) return;

  if (filtered.length === 0) {
    productListContainer.innerHTML = `<p style="grid-column: span 2; font-size: 13px; text-align:center; color: var(--text-sub);">Belum ada akun jualan di kategori ini.</p>`;
    return;
  }

  productListContainer.innerHTML = filtered.map(item => {
    const displaySpecs = item.specs.slice(0, 2).map(s => `<li class="spec-item">${s}</li>`).join('');
    return `
      <div class="account-card catalog-card" data-id="${item.id}">
        <div class="account-media">
          <img src="${item.image}" alt="${item.code}" class="account-img" loading="lazy" onerror="this.onerror=null;this.src='banner1.png';">
          <div class="account-badge-group">
            <span class="badge-code">${item.code}</span>
            <span class="badge-cat">${item.category === 'ff' ? 'Free Fire' : 'Mobile Legends'}</span>
          </div>
        </div>
        <div class="account-body">
          <div class="account-price-row">
            <span class="price-label">Harga Akun</span>
            <span class="account-price">Rp ${formatRupiah(item.price)}</span>
          </div>
          <ul class="account-specs-list">${displaySpecs}</ul>
          <button type="button" class="btn-see-now">Lihat Sekarang</button>
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.catalog-card').forEach(card => {
    card.addEventListener('click', function() {
      const prodId = this.getAttribute('data-id');
      openProductDetail(prodId);
    });
  });
}

// FUNGSI BUKA DETAIL PRODUK
function openProductDetail(productId) {
  const item = fetchedProducts.find(p => String(p.id) === String(productId));
  if (!item) return;

  const catalogView = document.getElementById('product-catalog-view');
  const detailView = document.getElementById('product-detail-view');

  if (catalogView && detailView) {
    catalogView.style.display = 'none'; // Sembunyikan katalog
    detailView.style.display = 'flex'; // Tampilkan view detail

    const detailImg = document.getElementById('detail-img');
    detailImg.src = item.image;
    detailImg.onerror = function() {
      this.onerror = null;
      this.src = 'banner1.png';
    };

    document.getElementById('detail-cat-badge').textContent = item.category === 'ff' ? 'FREE FIRE' : 'MOBILE LEGENDS';
    document.getElementById('detail-title').textContent = `STOCK PRIBADI FENDI STORE ${item.code.replace('#', '')}`;
    document.getElementById('detail-price').textContent = `Rp ${formatRupiah(item.price)}`;
    document.getElementById('detail-specs-content').textContent = item.specs.join(" || ");

    const waText = encodeURIComponent(`Halo Admin Fendi Store, saya mau beli akun Kode: ${item.code} dengan harga Rp ${formatRupiah(item.price)}.`);
    const buyNowBtn = document.getElementById('btn-buy-now');
    if (buyNowBtn) {
      buyNowBtn.href = `https://wa.me/6285854325988?text=${waText}`;
    }

    renderRecommendations(productId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// KEMBALI KE KATALOG
document.getElementById('btn-back-catalog')?.addEventListener('click', () => {
  const catalogView = document.getElementById('product-catalog-view');
  const detailView = document.getElementById('product-detail-view');
  if (catalogView && detailView) {
    catalogView.style.display = 'flex';
    detailView.style.display = 'none';
  }
});

// REKOMENDASI PRODUK LAIN DI DETAIL
function renderRecommendations(currentId) {
  const recContainer = document.getElementById('recommendation-grid');
  if (!recContainer) return;

  const recs = fetchedProducts.filter(p => String(p.id) !== String(currentId)).slice(0, 4);

  if (recs.length === 0) {
    recContainer.innerHTML = `<p style="grid-column: span 2; font-size: 11px; color: var(--text-sub);">Tidak ada produk lain.</p>`;
    return;
  }

  recContainer.innerHTML = recs.map(item => `
    <div class="account-card rec-card" data-id="${item.id}">
      <div class="account-media">
        <img src="${item.image}" alt="${item.code}" class="account-img" loading="lazy" onerror="this.onerror=null;this.src='banner1.png';">
        <div class="account-badge-group">
          <span class="badge-code">${item.code}</span>
        </div>
      </div>
      <div class="account-body">
        <div class="account-price-row">
          <span class="account-price">Rp ${formatRupiah(item.price)}</span>
        </div>
        <button type="button" class="btn-see-now">Lihat Sekarang</button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.rec-card').forEach(card => {
    card.addEventListener('click', function() {
      const prodId = this.getAttribute('data-id');
      openProductDetail(prodId);
    });
  });
}

// SUB TABS FILTER
const subTabItems = document.querySelectorAll('.sub-tab-item');
subTabItems.forEach((btn) => {
  btn.addEventListener('click', function() {
    const targetSub = this.getAttribute('data-sub');
    currentCategory = targetSub;

    subTabItems.forEach(b => b.classList.remove('active'));
    this.classList.add('active');

    renderProducts(targetSub);
  });
});

// BOTTOM NAV MANAGER
const navItems = document.querySelectorAll('.nav-item');
const navIndicator = document.querySelector('.nav-indicator');
const tabContents = document.querySelectorAll('.tab-content');

function updateIndicator(index) {
  if (navIndicator) {
    navIndicator.style.transform = `translateX(${index * 100}%)`;
  }
}

function switchTab(targetTabId, navIndex) {
  navItems.forEach(nav => nav.classList.remove('active'));
  tabContents.forEach(tab => tab.classList.remove('active'));

  const targetNavItem = document.querySelector(`.nav-item[data-index="${navIndex}"]`);
  if (targetNavItem) targetNavItem.classList.add('active');

  const targetTab = document.getElementById(targetTabId);
  if (targetTab) targetTab.classList.add('active');

  if (targetTabId === 'tab-produk') {
    const catalogView = document.getElementById('product-catalog-view');
    const detailView = document.getElementById('product-detail-view');
    if (catalogView && detailView) {
      catalogView.style.display = 'flex';
      detailView.style.display = 'none';
    }
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

// INISIALISASI
loadProductsFromSheets();
updateIndicator(0);
