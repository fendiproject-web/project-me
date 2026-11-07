const FALLBACK_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='1.5'><rect x='3' y='3' width='18' height='18' rx='2'/><circle cx='8.5' cy='8.5' r='1.5'/><path d='M21 15l-5-5L5 21'/></svg>";

let currentCategory = 'all';
let fetchedProducts = [];

// --- LOGIKA OTOMATISASI & HITUNG DISKON ---
function prosesDataProduk() {
  if (typeof DAFTAR_PRODUK === 'undefined') {
    console.error("File data-produk.js belum terpanggil atau kosong.");
    return [];
  }

  return DAFTAR_PRODUK.map((item, index) => {
    const namaFile = item.fileFoto.toLowerCase();
    let category = "FREE FIRE";
    let code = "#FF-" + String(index + 1).padStart(2, '0');

    if (namaFile.includes('ml')) {
      category = "MOBILE LEGENDS";
      code = "#ML-" + String(index + 1).padStart(2, '0');
    } else if (namaFile.includes('ff')) {
      category = "FREE FIRE";
      code = "#FF-" + String(index + 1).padStart(2, '0');
    }

    // Hitung Diskon Otomatis
    let diskonPersen = 0;
    let hargaAsliNum = parseInt(String(item.hargaAsli || 0).replace(/\D/g, ''));
    let hargaJualNum = parseInt(String(item.harga || 0).replace(/\D/g, ''));

    if (hargaAsliNum > 0 && hargaJualNum > 0 && hargaAsliNum > hargaJualNum) {
      diskonPersen = Math.round(((hargaAsliNum - hargaJualNum) / hargaAsliNum) * 100);
    }

    return {
      id: String(index + 1),
      fileFoto: item.fileFoto,
      code: code,
      category: category,
      price: item.harga,
      hargaAsli: item.hargaAsli,
      diskon: diskonPersen,
      image: item.fileFoto,
      specs: item.spesifikasi
    };
  });
}

// --- FUNGSI BANTUAN ---
function formatRupiah(val) {
  if (!val) return '0';
  const cleanNum = String(val).replace(/\D/g, '');
  return cleanNum ? new Intl.NumberFormat('id-ID').format(cleanNum) : '0';
}

function getCategoryLabel(catRaw) {
  if (!catRaw) return 'FREE FIRE';
  const cat = String(catRaw).toLowerCase().trim();
  if (cat === 'ff' || cat.includes('free') || cat.includes('fire')) return 'FREE FIRE';
  if (cat === 'ml' || cat.includes('mobile') || cat.includes('legend')) return 'MOBILE LEGENDS';
  return String(catRaw).toUpperCase();
}

function parseSpecs(specs) {
  if (Array.isArray(specs)) return specs;
  if (!specs) return [];
  return String(specs).split(',').map(s => s.trim()).filter(s => s.length > 0);
}

function matchCategory(productCat, targetFilter) {
  if (!targetFilter || targetFilter === 'all') return true;
  const cat = String(productCat || '').toLowerCase().trim();
  const filter = String(targetFilter).toLowerCase().trim();

  if (filter === 'ff') return cat.includes('free') || cat.includes('fire') || cat === 'ff';
  if (filter === 'ml') return cat.includes('mobile') || cat.includes('legend') || cat === 'ml';
  return cat === filter;
}

function initTheme() {
  const savedTheme = localStorage.getItem('fendi_theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.remove('dark-mode');
    document.body.classList.add('light-mode');
  } else {
    document.body.classList.remove('light-mode');
    document.body.classList.add('dark-mode');
  }
}

const themeToggleBtn = document.getElementById('themeToggle');
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    if (document.body.classList.contains('dark-mode')) {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
      localStorage.setItem('fendi_theme', 'light');
    } else {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
      localStorage.setItem('fendi_theme', 'dark');
    }
  });
}

// --- RENDER PRODUK ---
const productListContainer = document.getElementById('product-list-container');

function loadProducts() {
  fetchedProducts = prosesDataProduk();
  renderProducts(currentCategory);
  renderHomeRecommendations();
  checkUrlForProductDetail();
}

function renderProducts(filterCat = 'all') {
  currentCategory = filterCat.toLowerCase();
  const filtered = fetchedProducts.filter(p => matchCategory(p.category, currentCategory));

  if (!productListContainer) return;

  if (filtered.length === 0) {
    productListContainer.innerHTML = `<p style="grid-column: span 2; font-size: 13px; text-align:center; color: var(--text-sub); padding: 30px 0;">Belum ada akun jualan di kategori ini.</p>`;
    return;
  }

  productListContainer.innerHTML = filtered.map(item => {
    const specsArr = parseSpecs(item.specs);
    const displaySpecs = specsArr.slice(0, 2).map(s => `<li class="spec-item">${s}</li>`).join('');
    const gameCategoryLabel = getCategoryLabel(item.category);

    // Tampilan Badge Diskon di sebelah Kode
    let badgeDiskon = '';
    if (item.diskon > 0) {
      badgeDiskon = `<span class="badge-diskon">${item.diskon}% OFF</span>`;
    }

    // Tampilan Harga Coret
    let hargaCoret = '';
    if (item.diskon > 0 && item.hargaAsli) {
      hargaCoret = `<span class="harga-coret">Rp ${formatRupiah(item.hargaAsli)}</span>`;
    }

    return `
      <div class="account-card catalog-card" data-id="${item.id}">
        <div class="account-media" style="aspect-ratio: 4 / 5;">
          <img src="${item.image}" alt="${item.code}" class="account-img" loading="lazy" onerror="this.src='${FALLBACK_SVG}';">
          <div class="account-badge-group">
            <span class="badge-code">${item.code}</span>
            ${badgeDiskon}
          </div>
        </div>
        <div class="account-body">
          <span class="badge-cat-inline">${gameCategoryLabel}</span>
          <div class="card-stock-label">STOCK PRIBADI FENDI STORE</div>
          <div class="card-seller-name" style="border-bottom: 1px dashed var(--border-color); padding-bottom: 4px; margin-bottom: 4px;">Fendi Store</div>
          
          <div class="account-price-row">
            <span class="price-label">Harga Akun</span>
            ${hargaCoret}
            <span class="account-price">Rp ${formatRupiah(item.price)}</span>
          </div>
          <button type="button" class="btn-see-now">Lihat Sekarang</button>
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.catalog-card').forEach(card => {
    card.addEventListener('click', function() {
      openProductDetail(this.getAttribute('data-id'));
    });
  });
}

function renderHomeRecommendations() {
  const homeRecContainer = document.getElementById('home-recommendation-grid');
  if (!homeRecContainer) return;

  if (fetchedProducts.length === 0) {
    homeRecContainer.innerHTML = `<p style="grid-column: span 2; font-size: 12px; text-align:center; color: var(--text-sub); padding: 20px 0;">Belum ada produk jualan.</p>`;
    return;
  }

  const homeProducts = fetchedProducts.slice(0, 4);

  homeRecContainer.innerHTML = homeProducts.map(item => {
    const gameCategoryLabel = getCategoryLabel(item.category);

    let badgeDiskon = '';
    if (item.diskon > 0) {
      badgeDiskon = `<span class="badge-diskon">${item.diskon}% OFF</span>`;
    }

    let hargaCoret = '';
    if (item.diskon > 0 && item.hargaAsli) {
      hargaCoret = `<span class="harga-coret">Rp ${formatRupiah(item.hargaAsli)}</span>`;
    }

    return `
      <div class="account-card home-card" data-id="${item.id}">
        <div class="account-media" style="aspect-ratio: 4 / 5;">
          <img src="${item.image}" alt="${item.code}" class="account-img" loading="lazy" onerror="this.src='${FALLBACK_SVG}';">
          <div class="account-badge-group">
            <span class="badge-code">${item.code}</span>
            ${badgeDiskon}
          </div>
        </div>
        <div class="account-body">
          <span class="badge-cat-inline">${gameCategoryLabel}</span>
          <div class="card-stock-label">STOCK PRIBADI FENDI STORE</div>
          <div class="card-seller-name" style="border-bottom: 1px dashed var(--border-color); padding-bottom: 4px; margin-bottom: 4px;">Fendi Store</div>
          
          <div class="account-price-row">
            <span class="price-label">Harga Akun</span>
            ${hargaCoret}
            <span class="account-price">Rp ${formatRupiah(item.price)}</span>
          </div>
          <button type="button" class="btn-see-now">Lihat Sekarang</button>
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.home-card').forEach(card => {
    card.addEventListener('click', function() {
      switchTab('tab-produk', 1, false);
      openProductDetail(this.getAttribute('data-id'));
    });
  });
}

// --- DETAIL PRODUK ---
function openProductDetail(productId, updateHistory = true) {
  const item = fetchedProducts.find(p => String(p.id) === String(productId));
  if (!item) return;

  const catalogView = document.getElementById('product-catalog-view');
  const detailView = document.getElementById('product-detail-view');
  const detailImg = document.getElementById('detail-img');

  if (catalogView && detailView) {
    catalogView.style.display = 'none';
    detailView.style.display = window.innerWidth >= 1024 ? 'grid' : 'flex';

    detailImg.src = item.image;

    const specsArr = parseSpecs(item.specs);

    document.getElementById('detail-cat-badge').textContent = getCategoryLabel(item.category);
    document.getElementById('detail-title').textContent = `STOCK PRIBADI FENDI STORE ${item.code.replace('#', '')}`;
    
    // Tampilkan Harga Coret & Diskon di Halaman Detail
    let detailHargaHTML = `Rp ${formatRupiah(item.price)}`;
    if (item.diskon > 0 && item.hargaAsli) {
      detailHargaHTML = `<span style="text-decoration: line-through; color: var(--text-sub); font-size: 14px; font-weight: 500; margin-right: 8px;">Rp ${formatRupiah(item.hargaAsli)}</span> Rp ${formatRupiah(item.price)} <span class="badge-diskon" style="font-size: 11px; vertical-align: middle;">${item.diskon}% OFF</span>`;
    }
    document.getElementById('detail-price').innerHTML = detailHargaHTML;

    document.getElementById('detail-specs-content').textContent = specsArr.join(" || ");

    const waText = encodeURIComponent(`Halo Admin Fendi Store, saya mau beli akun Kode: ${item.code} dengan harga Rp ${formatRupiah(item.price)}.`);
    const buyNowBtn = document.getElementById('btn-buy-now');
    if (buyNowBtn) buyNowBtn.href = `https://wa.me/6285854325988?text=${waText}`;

    renderRecommendations(productId);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (updateHistory) {
      const cleanCode = item.code.replace('#', '').toLowerCase();
      window.history.pushState({ tabId: 'tab-produk', productId: productId }, '', `/produk?id=${cleanCode}`);
    }
  }
}

function checkUrlForProductDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const prodCode = urlParams.get('id');

  if (prodCode && fetchedProducts.length > 0) {
    const matchedProduct = fetchedProducts.find(p => p.code.replace('#', '').toLowerCase() === prodCode.toLowerCase() || String(p.id) === prodCode);
    if (matchedProduct) {
      switchTab('tab-produk', 1, false);
      openProductDetail(matchedProduct.id, false);
    }
  }
}

const zoomImgBox = document.getElementById('detail-img-box');
const zoomModal = document.getElementById('image-zoom-modal');
const modalImg = document.getElementById('img-full-zoom');
const closeModalBtn = document.getElementById('modal-close-btn');

if (zoomImgBox && zoomModal && modalImg) {
  zoomImgBox.addEventListener('click', () => {
    const detailImg = document.getElementById('detail-img');
    if (detailImg && detailImg.src) {
      modalImg.src = detailImg.src;
      zoomModal.style.display = 'block';
    }
  });
}

if (closeModalBtn) {
  closeModalBtn.addEventListener('click', () => {
    zoomModal.style.display = 'none';
  });
}

if (zoomModal) {
  zoomModal.addEventListener('click', (e) => {
    if (e.target === zoomModal) zoomModal.style.display = 'none';
  });
}

document.getElementById('btn-back-catalog')?.addEventListener('click', () => {
  const catalogView = document.getElementById('product-catalog-view');
  const detailView = document.getElementById('product-detail-view');
  if (catalogView && detailView) {
    catalogView.style.display = 'flex';
    detailView.style.display = 'none';
    window.history.pushState({ tabId: 'tab-produk' }, '', '/produk');
  }
});

function renderRecommendations(currentId) {
  const recContainer = document.getElementById('recommendation-grid');
  if (!recContainer) return;

  const recs = fetchedProducts.filter(p => String(p.id) !== String(currentId)).slice(0, 4);

  if (recs.length === 0) {
    recContainer.innerHTML = `<p style="grid-column: span 2; font-size: 11px; color: var(--text-sub);">Tidak ada produk lain.</p>`;
    return;
  }

  recContainer.innerHTML = recs.map(item => {
    let badgeDiskon = '';
    if (item.diskon > 0) {
      badgeDiskon = `<span class="badge-diskon">${item.diskon}% OFF</span>`;
    }
    return `
      <div class="account-card rec-card" data-id="${item.id}">
        <div class="account-media" style="aspect-ratio: 4 / 5;">
          <img src="${item.image}" alt="${item.code}" class="account-img" loading="lazy" onerror="this.src='${FALLBACK_SVG}';">
          <div class="account-badge-group">
            <span class="badge-code">${item.code}</span>
            ${badgeDiskon}
          </div>
        </div>
        <div class="account-body">
          <div class="account-price-row">
            <span class="account-price">Rp ${formatRupiah(item.price)}</span>
          </div>
          <button type="button" class="btn-see-now">Lihat Sekarang</button>
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.rec-card').forEach(card => {
    card.addEventListener('click', function() {
      openProductDetail(this.getAttribute('data-id'));
    });
  });
}

// --- NAVIGASI & TAB ---
const subTabItems = document.querySelectorAll('.sub-tab-item');
subTabItems.forEach((btn) => {
  btn.addEventListener('click', function() {
    subTabItems.forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    renderProducts(this.getAttribute('data-sub'));
  });
});

const navItems = document.querySelectorAll('.nav-item');
const navIndicator = document.querySelector('.nav-indicator');
const tabContents = document.querySelectorAll('.tab-content');

function updateIndicator(index) {
  if (navIndicator) navIndicator.style.transform = `translateX(${index * 100}%)`;
}

function switchTab(targetTabId, navIndex, updateHistory = true) {
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

  if (updateHistory) {
    const pathMap = { 'tab-home': '/home', 'tab-produk': '/produk', 'tab-datame': '/datame', 'tab-akun': '/akun' };
    window.history.pushState({ tabId: targetTabId, index: navIndex }, '', pathMap[targetTabId] || '/');
  }
}

function handleRouting() {
  const path = window.location.pathname;
  const routeMap = {
    '/': { tab: 'tab-home', index: 0 },
    '/home': { tab: 'tab-home', index: 0 },
    '/produk': { tab: 'tab-produk', index: 1 },
    '/datame': { tab: 'tab-datame', index: 2 },
    '/akun': { tab: 'tab-akun', index: 3 }
  };
  const currentRoute = routeMap[path] || routeMap['/'];
  switchTab(currentRoute.tab, currentRoute.index, false);
}

window.addEventListener('popstate', handleRouting);

navItems.forEach((item) => {
  item.addEventListener('click', function(e) {
    e.preventDefault();
    switchTab(this.getAttribute('data-target'), parseInt(this.getAttribute('data-index')));
  });
});

const switchTabTriggers = document.querySelectorAll('.switch-tab-trigger');
switchTabTriggers.forEach((trigger) => {
  trigger.addEventListener('click', function() {
    switchTab(this.getAttribute('data-target-tab'), parseInt(this.getAttribute('data-nav-index')));
  });
});

// --- MULAI SEMUA ---
initTheme();
loadProducts();
handleRouting();