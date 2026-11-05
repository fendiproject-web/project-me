// LINK GOOGLE APPS SCRIPT WEB APP
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwcLqSBqeptlNAPOfj5AeUOVZrlJj_cwEylq2GtHSb7ojSBuURbMZAr6g1hdjHFLg/exec";

const FALLBACK_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='1.5'><rect x='3' y='3' width='18' height='18' rx='2'/><circle cx='8.5' cy='8.5' r='1.5'/><path d='M21 15l-5-5L5 21'/></svg>";

let currentCategory = 'all';
let fetchedProducts = [];

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
  if (url.includes('drive.google.com') && url.includes('/d/')) {
    const match = url.match(/\/d\/([^\/]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
  }
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

// FUNGSI PARSER SPECS AGAR TIDAK EROR .map()
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

async function loadProductsFromSheets() {
  try {
    const fetchUrl = `${SCRIPT_URL}?action=getProducts&t=${new Date().getTime()}`;
    const response = await fetch(fetchUrl);
    const data = await response.json();

    if (data && data.products && Array.isArray(data.products)) {
      fetchedProducts = data.products;
    } else if (Array.isArray(data)) {
      fetchedProducts = data.map((item, idx) => ({
        id: String(item[0] || idx + 1),
        code: String(item[1] || '#AKUN-' + (idx + 1)),
        category: String(item[2] || 'FREE FIRE'),
        stockLabel: String(item[3] || 'STOCK PRIBADI FENDI STORE'),
        price: String(item[4] || '0'),
        image: String(item[5] || ''),
        specs: String(item[6] || '')
      }));
    } else {
      fetchedProducts = [];
    }
  } catch (err) {
    console.error("Gagal load produk:", err);
  } finally {
    renderProducts(currentCategory);
    renderHomeRecommendations();
    renderAdminManageList();
    checkUrlForProductDetail();
  }
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
    const stockLabelText = item.stockLabel || 'STOCK PRIBADI FENDI STORE';

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
          <div class="card-stock-label">${stockLabelText}</div>
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
    const stockLabelText = item.stockLabel || 'STOCK PRIBADI FENDI STORE';

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
          <div class="card-stock-label">${stockLabelText}</div>
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
    document.getElementById('detail-title').textContent = `${item.stockLabel || 'STOCK PRIBADI FENDI STORE'} ${item.code.replace('#', '')}`;
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

const authTabBtns = document.querySelectorAll('.auth-tab-btn');
const authForms = document.querySelectorAll('.auth-form');

authTabBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    const targetAuth = this.getAttribute('data-auth');
    authTabBtns.forEach(b => b.classList.remove('active'));
    authForms.forEach(f => f.classList.remove('active'));
    this.classList.add('active');
    const targetForm = document.getElementById(`${targetAuth}-form`);
    if (targetForm) targetForm.classList.add('active');
  });
});

function getCurrentUser() {
  const data = localStorage.getItem('fendi_session_user');
  return data ? JSON.parse(data) : null;
}

function updateAccountView() {
  const user = getCurrentUser();
  const guestView = document.getElementById('auth-guest-view');
  const loggedView = document.getElementById('auth-logged-view');
  const adminPanel = document.getElementById('admin-panel-section');

  if (!guestView || !loggedView) return;

  if (user) {
    guestView.style.display = 'none';
    loggedView.style.display = 'flex';
    document.getElementById('display-user-name').textContent = user.name;
    document.getElementById('display-user-wa').textContent = user.wa;
    document.getElementById('display-user-role').textContent = user.role.toUpperCase();

    if (user.role === 'admin') {
      adminPanel.style.display = 'block';
      renderAdminManageList();
    } else {
      adminPanel.style.display = 'none';
    }
  } else {
    guestView.style.display = 'flex';
    loggedView.style.display = 'none';
    if (adminPanel) adminPanel.style.display = 'none';
  }
}

document.getElementById('btn-logout')?.addEventListener('click', () => {
  localStorage.removeItem('fendi_session_user');
  updateAccountView();
  alert("Kamu telah keluar.");
});

document.getElementById('register-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const wa = document.getElementById('reg-wa').value.trim();
  const password = document.getElementById('reg-password').value.trim();
  const btn = document.getElementById('btn-register');

  btn.textContent = "Proses Mendaftar...";
  btn.disabled = true;

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'register', name: name, wa: wa, password: password })
    });
    const result = await response.json();

    alert(result.message);
    if (result.success) {
      document.getElementById('register-form').reset();
      document.querySelector('.auth-tab-btn[data-auth="login"]').click();
    }
  } catch (err) {
    alert("Gagal mendaftar: " + err.toString());
  } finally {
    btn.textContent = "Daftar Akun";
    btn.disabled = false;
  }
});

document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const btn = document.getElementById('btn-login');

  btn.textContent = "Proses Login...";
  btn.disabled = true;

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'login', username: username, password: password })
    });
    const result = await response.json();

    if (result.success) {
      localStorage.setItem('fendi_session_user', JSON.stringify(result.user));
      updateAccountView();
      document.getElementById('login-form').reset();
      alert(`Selamat datang kembali, ${result.user.name}!`);
    } else {
      alert(result.message);
    }
  } catch (err) {
    alert("Gagal login: " + err.toString());
  } finally {
    btn.textContent = "Masuk Sekarang";
    btn.disabled = false;
  }
});

// SUBMIT ADMIN UPLOAD
document.getElementById('admin-upload-form')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    alert("Hanya admin yang dapat memposting!");
    return;
  }

  const category = document.getElementById('post-category').value;
  const stockLabel = document.getElementById('post-stock-label').value.trim();
  const rawPrice = document.getElementById('post-price').value.trim();
  const cleanPrice = rawPrice.replace(/\D/g, '');
  const urlInput = document.getElementById('post-url').value.trim();
  const specsRaw = document.getElementById('post-specs').value.trim();
  const fileInput = document.getElementById('post-file');
  const btn = document.getElementById('btn-submit-product');

  btn.textContent = "Mengompres & Mengunggah Foto...";
  btn.disabled = true;

  let imageBase64 = null;
  let mimeType = null;

  if (fileInput && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    mimeType = file.type;
    imageBase64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(file);
    });
  }

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'addProduct',
        role: user.role,
        category: category,
        stockLabel: stockLabel || 'STOCK PRIBADI FENDI STORE',
        price: cleanPrice,
        imageUrl: urlInput,
        imageBase64: imageBase64,
        mimeType: mimeType,
        specs: specsRaw
      })
    });
    const result = await response.json();

    alert(result.message);
    if (result.success) {
      document.getElementById('admin-upload-form').reset();
      document.getElementById('post-stock-label').value = 'STOCK PRIBADI FENDI STORE';
      await loadProductsFromSheets();
      switchTab('tab-produk', 1);
    }
  } catch (err) {
    alert("Gagal upload: " + err.toString());
  } finally {
    btn.textContent = "+ Upload Akun Ke Katalog Stok";
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

window.deleteProductFromSheets = async function(productId) {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') return;

  if (confirm("Yakin mau menghapus produk akun ini?")) {
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'deleteProduct', role: user.role, productId: productId })
      });
      const result = await response.json();
      alert(result.message);
      if (result.success) {
        await loadProductsFromSheets();
      }
    } catch (err) {
      alert("Gagal menghapus: " + err.toString());
    }
  }
};

initTheme();
renderProducts(currentCategory);
loadProductsFromSheets();
updateAccountView();
handleRouting();
