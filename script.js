// LINK GOOGLE APPS SCRIPT
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyH5tILYOzA5zWntQir0gBruI00Y1Iwdw6QCuobIezCtajvvNIxdgiMIucs9n31PN4/exec";

// Preload Foto
const avatarPreload = new Image();
avatarPreload.src = 'profile.webp';

const bannerPreload = new Image();
bannerPreload.src = 'banner1.png';

// FORMAT RUPIAH
function formatRupiah(val) {
  if (!val) return '0';
  const cleanNum = String(val).replace(/\D/g, '');
  return cleanNum ? new Intl.NumberFormat('id-ID').format(cleanNum) : '0';
}

// TOGGLE TEMA TERANG / GELAP
const themeToggleBtn = document.getElementById('themeToggle');
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    document.body.classList.toggle('dark-mode');
  });
}

// FORMAT HARGA REALTIME (INPUT ADMIN)
const postPriceInput = document.getElementById('post-price');
if (postPriceInput) {
  postPriceInput.addEventListener('input', function () {
    let rawValue = this.value.replace(/\D/g, '');
    this.value = rawValue ? new Intl.NumberFormat('id-ID').format(rawValue) : '';
  });
}

// FETCH & RENDER PRODUK
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
      renderAdminManageList();
      
      // Cek apakah ada parameter ID produk di URL pas halaman pertama kali dibuka
      checkUrlForProductDetail();
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

// RENDER REKOMENDASI PRODUK DI HOME
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
      switchTab('tab-produk', 1, false);
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

// BUKA DETAIL PRODUK DAN PERBAARUI URL
function openProductDetail(productId, updateHistory = true) {
  const item = fetchedProducts.find(p => String(p.id) === String(productId));
  if (!item) return;

  const catalogView = document.getElementById('product-catalog-view');
  const detailView = document.getElementById('product-detail-view');

  if (catalogView && detailView) {
    catalogView.style.display = 'none';
    detailView.style.display = 'flex';

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

    // UBAH URL DENGAN QUERY ID PRODUK TANPA RELOAD
    if (updateHistory) {
      const cleanCode = item.code.replace('#', '').toLowerCase();
      window.history.pushState({ tabId: 'tab-produk', productId: productId }, '', `/produk?id=${cleanCode}`);
    }
  }
}

// CEK QUERY URL UNTUK BUKA DETAIL PRODUK
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

// MODAL FULL ZOOM FOTO PRODUK
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
    if (e.target === zoomModal) {
      zoomModal.style.display = 'none';
    }
  });
}

// KEMBALI KE KATALOG
document.getElementById('btn-back-catalog')?.addEventListener('click', () => {
  const catalogView = document.getElementById('product-catalog-view');
  const detailView = document.getElementById('product-detail-view');
  if (catalogView && detailView) {
    catalogView.style.display = 'flex';
    detailView.style.display = 'none';
    window.history.pushState({ tabId: 'tab-produk' }, '', '/produk');
  }
});

// REKOMENDASI PRODUK LAIN DI DETAIL PRODUK
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

// BOTTOM NAV & ROUTING MANAGER
const navItems = document.querySelectorAll('.nav-item');
const navIndicator = document.querySelector('.nav-indicator');
const tabContents = document.querySelectorAll('.tab-content');

function updateIndicator(index) {
  if (navIndicator) {
    navIndicator.style.transform = `translateX(${index * 100}%)`;
  }
}

function switchTab(targetTabId, navIndex, updateHistory = true) {
  navItems.forEach(nav => {
    nav.classList.remove('active');
    const icon = nav.querySelector('.icon-box');
    if (icon) icon.classList.remove('bounce');
  });

  tabContents.forEach(tab => tab.classList.remove('active'));

  const targetNavItem = document.querySelector(`.nav-item[data-index="${navIndex}"]`);
  if (targetNavItem) {
    targetNavItem.classList.add('active');
    const currentIcon = targetNavItem.querySelector('.icon-box');
    if (currentIcon) currentIcon.classList.add('bounce');
  }

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

  // MENGUBAH URL BROWSER TANPA RELOAD
  if (updateHistory) {
    const pathMap = {
      'tab-home': '/home',
      'tab-produk': '/produk',
      'tab-datame': '/datame',
      'tab-akun': '/akun'
    };
    const newPath = pathMap[targetTabId] || '/';
    window.history.pushState({ tabId: targetTabId, index: navIndex }, '', newPath);
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
    const targetTabId = this.getAttribute('data-target');
    const navIndex = parseInt(this.getAttribute('data-index'));
    switchTab(targetTabId, navIndex);
  });
});

const switchTabTriggers = document.querySelectorAll('.switch-tab-trigger');
switchTabTriggers.forEach((trigger) => {
  trigger.addEventListener('click', function() {
    const targetTabId = this.getAttribute('data-target-tab');
    const navIndex = parseInt(this.getAttribute('data-nav-index'));
    switchTab(targetTabId, navIndex);
  });
});

// FORM LOGIN & DAFTAR
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

// SESSION USER & LOGIN
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
    adminPanel.style.display = 'none';
  }
}

// LOGOUT
document.getElementById('btn-logout')?.addEventListener('click', () => {
  localStorage.removeItem('fendi_session_user');
  updateAccountView();
  alert("Kamu telah keluar.");
});

// DAFTAR AKUN
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

// LOGIN AKUN
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

// UPLOAD PRODUK BARU ADMIN
document.getElementById('admin-upload-form')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    alert("Hanya admin yang dapat memposting!");
    return;
  }

  const category = document.getElementById('post-category').value;
  const rawPrice = document.getElementById('post-price').value.trim();
  const cleanPrice = rawPrice.replace(/\D/g, '');
  const urlInput = document.getElementById('post-url').value.trim();
  const specsRaw = document.getElementById('post-specs').value.trim();
  const fileInput = document.getElementById('post-file');
  const btn = document.getElementById('btn-submit-product');

  btn.textContent = "Uploading Foto & Simpan Data...";
  btn.disabled = true;

  const sendPayload = async (imageBase64 = null) => {
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'addProduct',
          role: user.role,
          category: category,
          price: cleanPrice,
          imageUrl: urlInput,
          imageBase64: imageBase64,
          specs: specsRaw
        })
      });
      const result = await response.json();

      alert(result.message);
      if (result.success) {
        document.getElementById('admin-upload-form').reset();
        await loadProductsFromSheets();
        switchTab('tab-produk', 1);
      }
    } catch (err) {
      alert("Gagal upload: " + err.toString());
    } finally {
      btn.textContent = "+ Upload Akun Ke Produk";
      btn.disabled = false;
    }
  };

  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      sendPayload(evt.target.result);
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    sendPayload(null);
  }
});

// KELOLA & HAPUS PRODUK
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
        <span style="font-size: 12px; font-weight: 700;">${item.code} (${item.category.toUpperCase()})</span>
        <p style="font-size: 11px; color: var(--text-sub);">Rp ${formatRupiah(item.price)}</p>
      </div>
      <button type="button" class="btn-delete-prod" onclick="deleteProductFromSheets('${item.id}')">Hapus</button>
    </div>
  `).join('');
}

// HAPUS PRODUK DARI SHEETS
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

// INISIALISASI
loadProductsFromSheets();
updateAccountView();
handleRouting();
