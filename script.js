// ==========================================
// 100% MURNI FRONTEND - TANPA GOOGLE SHEETS, TANPA CODE.GS, TANPA DRIVE
// ==========================================

const FALLBACK_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='1.5'><rect x='3' y='3' width='18' height='18' rx='2'/><circle cx='8.5' cy='8.5' r='1.5'/><path d='M21 15l-5-5L5 21'/></svg>";

let currentCategory = 'all';
// Mengambil data langsung dari penyimpanan lokal HP/Browser kamu
let fetchedProducts = JSON.parse(localStorage.getItem('fendi_local_products')) || [];

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

function fixImageUrl(url) {
  if (!url) return FALLBACK_SVG;
  return url; 
}

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

const productListContainer = document.getElementById('product-list-container');

// FUNGSI LOAD TANPA FETCH KE SERVER
function loadProductsFromSheets() {
  // Hanya membaca variabel lokal
  renderProducts(currentCategory);
  renderHomeRecommendations();
  renderAdminManageList();
  checkUrlForProductDetail();
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
    const validImg = fixImageUrl(item.image);
    const gameCategoryLabel = getCategoryLabel(item.category);

    return `
      <div class="account-card home-card" data-id="${item.id}">
        <div class="account-media">
          <img src="${validImg}" alt="${item.code}" class="account-img" loading="lazy" onerror="this.src='${FALLBACK_SVG}';">
          <div class="account-badge-group">
            <span class="badge-code">${item.code}</span>
          </div>
        </div>
        <div class="account-body">
          <span class="badge-cat-inline">${gameCategoryLabel}</span>
          <div class="card-stock-label">STOCK PRIBADI FENDI STORE</div>
          <div class="card-seller-name">Fendi Store</div>
          <div class="account-price-row">
            <span class="price-label">Harga Akun</span>
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
    const validImg = fixImageUrl(item.image);
    const gameCategoryLabel = getCategoryLabel(item.category);

    return `
      <div class="account-card catalog-card" data-id="${item.id}">
        <div class="account-media">
          <img src="${validImg}" alt="${item.code}" class="account-img" loading="lazy" onerror="this.src='${FALLBACK_SVG}';">
          <div class="account-badge-group">
            <span class="badge-code">${item.code}</span>
          </div>
        </div>
        <div class="account-body">
          <span class="badge-cat-inline">${gameCategoryLabel}</span>
          <div class="card-stock-label">STOCK PRIBADI FENDI STORE</div>
          <div class="card-seller-name">Fendi Store</div>
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
      openProductDetail(this.getAttribute('data-id'));
    });
  });
}

function openProductDetail(productId, updateHistory = true) {
  const item = fetchedProducts.find(p => String(p.id) === String(productId));
  if (!item) return;

  const catalogView = document.getElementById('product-catalog-view');
  const detailView = document.getElementById('product-detail-view');
  const detailImg = document.getElementById('detail-img');

  if (catalogView && detailView) {
    catalogView.style.display = 'none';
    detailView.style.display = 'flex';

    detailImg.src = fixImageUrl(item.image);

    const specsArr = parseSpecs(item.specs);

    document.getElementById('detail-cat-badge').textContent = getCategoryLabel(item.category);
    document.getElementById('detail-title').textContent = `STOCK PRIBADI FENDI STORE ${item.code.replace('#', '')}`;
    document.getElementById('detail-price').textContent = `Rp ${formatRupiah(item.price)}`;
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
    const validImg = fixImageUrl(item.image);
    return `
      <div class="account-card rec-card" data-id="${item.id}">
        <div class="account-media">
          <img src="${validImg}" alt="${item.code}" class="account-img" loading="lazy" onerror="this.src='${FALLBACK_SVG}';">
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
    `;
  }).join('');

  document.querySelectorAll('.rec-card').forEach(card => {
    card.addEventListener('click', function() {
      openProductDetail(this.getAttribute('data-id'));
    });
  });
}

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
  checkUrlForProductDetail();
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

// ==========================================
// PENGOSONGAN LOGIN & REGISTER
// ==========================================
function setupEmptyAccountTab() {
  const guestView = document.getElementById('auth-guest-view');
  const loggedView = document.getElementById('auth-logged-view');
  const adminPanel = document.getElementById('admin-panel-section');
  
  if (guestView) guestView.style.display = 'none';
  if (loggedView) loggedView.style.display = 'none';
  
  // Langsung buka form upload agar kamu bisa langsung tes secara lokal
  if (adminPanel) adminPanel.style.display = 'block';
}

// BACA FILE GAMBAR SEBAGAI URL DATA (MURNI LOKAL JAVASCRIPT)
function getLocalImageURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

// ==========================================
// SUBMIT UPLOAD LOKAL (TANPA SERVER, TANPA GOOGLE)
// ==========================================
document.getElementById('admin-upload-form')?.addEventListener('submit', async function(e) {
  e.preventDefault();

  const category = document.getElementById('post-category').value;
  const rawPrice = document.getElementById('post-price').value.trim();
  const cleanPrice = rawPrice.replace(/\D/g, '');
  let urlInput = document.getElementById('post-url')?.value.trim() || '';
  const specsRaw = document.getElementById('post-specs').value.trim();
  const fileInput = document.getElementById('post-file');
  const btn = document.getElementById('btn-submit-product');

  btn.textContent = "Menyimpan ke Browser...";
  btn.disabled = true;

  try {
    // Jika upload foto dari HP, jadikan URL lokal langsung (tanpa dikirim kemana-mana)
    if (fileInput && fileInput.files.length > 0) {
      urlInput = await getLocalImageURL(fileInput.files[0]);
    }

    // Buat kode otomatis
    const catPrefix = (category.toLowerCase().includes('mobile') || category.toLowerCase() === 'ml') ? 'ML' : 'FF';
    const nextId = fetchedProducts.length + 1;
    const generatedCode = `#${catPrefix}-${String(nextId).padStart(2, '0')}`;

    // Simpan objek produk ke array lokal
    const newProduct = {
      id: String(Date.now()),
      code: generatedCode,
      category: (catPrefix === 'ML') ? 'MOBILE LEGENDS' : 'FREE FIRE',
      stockLabel: 'STOCK PRIBADI FENDI STORE',
      price: cleanPrice || '0',
      image: urlInput,
      specs: specsRaw
    };

    fetchedProducts.push(newProduct);
    
    // Simpan ke memory browser (Local Storage)
    localStorage.setItem('fendi_local_products', JSON.stringify(fetchedProducts));

    alert("Berhasil ditambahkan!");
    document.getElementById('admin-upload-form').reset();
    
    loadProductsFromSheets(); // Memanggil fungsi render ulang
    switchTab('tab-produk', 1);

  } catch (err) {
    alert("Gagal menyimpan lokal: " + err.toString());
  } finally {
    btn.textContent = "+ Upload Akun Ke Produk";
    btn.disabled = false;
  }
});

function renderAdminManageList() {
  const adminManageList = document.getElementById('admin-manage-list');
  if (!adminManageList) return;

  if (fetchedProducts.length === 0) {
    adminManageList.innerHTML = `<p style="font-size: 11px; color: var(--text-sub);">Belum ada akun jualan.</p>`;
    return;
  }

  adminManageList.innerHTML = fetchedProducts.map(item => `
    <div class="manage-item">
      <div>
        <span style="font-size: 12px; font-weight: 700;">${item.code} (${item.category})</span>
        <p style="font-size: 11px; color: var(--text-sub);">Rp ${formatRupiah(item.price)}</p>
      </div>
      <button type="button" class="btn-delete-prod" onclick="deleteProductFromSheets('${item.id}')">Hapus</button>
    </div>
  `).join('');
}

window.deleteProductFromSheets = function(productId) {
  if (confirm("Yakin mau menghapus produk akun ini?")) {
    // Hapus dari array lokal
    fetchedProducts = fetchedProducts.filter(p => String(p.id) !== String(productId));
    
    // Update Local Storage
    localStorage.setItem('fendi_local_products', JSON.stringify(fetchedProducts));
    
    alert("Produk berhasil dihapus!");
    loadProductsFromSheets();
  }
};

initTheme();
renderProducts(currentCategory);
loadProductsFromSheets();
setupEmptyAccountTab(); 
handleRouting();
