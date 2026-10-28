// LINK GOOGLE APPS SCRIPT
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyH5tILYOzA5zWntQir0gBruI00Y1Iwdw6QCuobIezCtajvvNIxdgiMIucs9n31PN4/exec";

// Preload Profil & Banner
const avatarPreload = new Image();
avatarPreload.src = 'profile.webp';

const bannerPreload = new Image();
bannerPreload.src = 'banner1.png';

// TOGGLE TEMA TERANG / GELAP
const themeToggleBtn = document.getElementById('themeToggle');
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    document.body.classList.toggle('dark-mode');
  });
}

// FETCH DAFTAR PRODUK DARI GOOGLE SHEETS
const productListContainer = document.getElementById('product-list-container');
let currentCategory = 'all';
let fetchedProducts = [];

async function loadProductsFromSheets() {
  if (!productListContainer) return;

  productListContainer.innerHTML = `
    <div style="text-align: center; padding: 40px 10px; color: var(--text-sub);">
      <p style="font-size: 12px; font-weight: 600;">Mengambil produk dari server...</p>
    </div>
  `;

  try {
    const response = await fetch(`${SCRIPT_URL}?action=getProducts`);
    const data = await response.json();

    if (data.success) {
      fetchedProducts = data.products;
      renderProducts(currentCategory);
      renderAdminManageList();
    } else {
      renderProducts(currentCategory);
    }
  } catch (err) {
    console.error("Gagal mengambil produk:", err);
    renderProducts(currentCategory);
  }
}

function renderProducts(filterCat = 'all') {
  const filtered = filterCat === 'all' 
    ? fetchedProducts 
    : fetchedProducts.filter(p => p.category === filterCat);

  if (!productListContainer) return;

  if (filtered.length === 0) {
    productListContainer.innerHTML = `
      <div style="text-align: center; padding: 40px 10px; color: var(--text-sub);">
        <p style="font-size: 13px; font-weight: 600;">Belum ada akun jualan di kategori ini.</p>
      </div>
    `;
    return;
  }

  productListContainer.innerHTML = filtered.map(item => {
    const waText = encodeURIComponent(`Halo Admin Fendi Store, saya berminat beli Akun ${item.code} (${item.category.toUpperCase()}) seharga Rp ${item.price}. Apakah masih ada?`);
    const waUrl = `https://wa.me/6285854325988?text=${waText}`;
    const specsList = item.specs.map(s => `<li class="spec-item">${s}</li>`).join('');

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
            ${specsList}
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

// SUB TABS PRODUK
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
    if (currentIcon) {
      currentIcon.classList.add('bounce');
    }
  }

  const targetTab = document.getElementById(targetTabId);
  if (targetTab) targetTab.classList.add('active');

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

const switchTabTriggers = document.querySelectorAll('.switch-tab-trigger');
switchTabTriggers.forEach((trigger) => {
  trigger.addEventListener('click', function() {
    const targetTabId = this.getAttribute('data-target-tab');
    const navIndex = parseInt(this.getAttribute('data-nav-index'));
    switchTab(targetTabId, navIndex);
  });
});

// TOGGLE FORM LOGIN & DAFTAR
const authTabBtns = document.querySelectorAll('.auth-tab-btn');
const authForms = document.querySelectorAll('.auth-form');

authTabBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    const targetAuth = this.getAttribute('data-auth');

    authTabBtns.forEach(b => b.classList.remove('active'));
    authForms.forEach(f => f.classList.remove('active'));

    this.classList.add('active');
    const targetForm = document.getElementById(`${targetAuth}-form`);
    if (targetForm) {
      targetForm.classList.add('active');
    }
  });
});

// KELOLA SESSION USER (LOCALSTORAGE)
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

    // HANYA MUNCULKAN PANEL ADMIN JIKA ROLE ADALAH 'ADMIN'
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
  alert("Kamu telah keluar/logout.");
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

// UPLOAD PRODUK BARU (KHUSUS ADMIN)
document.getElementById('admin-upload-form')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    alert("Hanya admin yang dapat memposting produk!");
    return;
  }

  const category = document.getElementById('post-category').value;
  const code = document.getElementById('post-code').value.trim();
  const price = document.getElementById('post-price').value.trim();
  const urlInput = document.getElementById('post-url').value.trim();
  const specsRaw = document.getElementById('post-specs').value.trim();
  const fileInput = document.getElementById('post-file');
  const btn = document.getElementById('btn-submit-product');

  btn.textContent = "Uploading Foto & Data...";
  btn.disabled = true;

  const sendPayload = async (imageBase64 = null) => {
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'addProduct',
          role: user.role,
          category: category,
          code: code,
          price: price,
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

// RENDER DAFTAR HAPUS PRODUK UNTUK ADMIN
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
        <p style="font-size: 11px; color: var(--text-sub);">Rp ${item.price}</p>
      </div>
      <button type="button" class="btn-delete-prod" onclick="deleteProductFromSheets('${item.id}')">Hapus</button>
    </div>
  `).join('');
}

// HAPUS PRODUK
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

// INISIALISASI awal
loadProductsFromSheets();
updateAccountView();
updateIndicator(0);
