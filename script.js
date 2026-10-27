// Preload Gambar Profil & Banner
const avatarPreload = new Image();
avatarPreload.src = 'profile.webp';

const bannerPreload = new Image();
bannerPreload.src = 'banner1.png';

// AMBIL & SIMPAN PRODUK DARI LOCALSTORAGE
function getProducts() {
  const data = localStorage.getItem('fendi_store_accounts');
  return data ? JSON.parse(data) : [];
}

function saveProducts(products) {
  localStorage.setItem('fendi_store_accounts', JSON.stringify(products));
}

// TOGGLE TEMA
const themeToggleBtn = document.getElementById('themeToggle');
themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  document.body.classList.toggle('dark-mode');
});

// RENDER PRODUK DI TAB PRODUK
const productListContainer = document.getElementById('product-list-container');
let currentCategory = 'all';

function renderProducts(filterCat = 'all') {
  const products = getProducts();
  const filtered = filterCat === 'all' 
    ? products 
    : products.filter(p => p.category === filterCat);

  if (!productListContainer) return;

  if (filtered.length === 0) {
    productListContainer.innerHTML = `
      <div style="text-align: center; padding: 40px 10px; color: var(--text-sub);">
        <p style="font-size: 13px; font-weight: 600;">Belum ada akun jualan.</p>
        <p style="font-size: 11px; margin-top: 4px;">Buka tab <b>Akun</b> untuk memposting produk baru.</p>
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

// RENDER DAFTAR KELOLA / HAPUS PRODUK DI TAB AKUN
const adminManageList = document.getElementById('admin-manage-list');

function renderAdminManageList() {
  const products = getProducts();
  if (!adminManageList) return;

  if (products.length === 0) {
    adminManageList.innerHTML = `<p style="font-size: 11px; color: var(--text-sub);">Belum ada produk tersimpan.</p>`;
    return;
  }

  adminManageList.innerHTML = products.map(item => `
    <div class="manage-item">
      <div class="manage-info">
        <span class="manage-title">${item.code} (${item.category.toUpperCase()})</span>
        <span class="manage-sub">Rp ${item.price}</span>
      </div>
      <button type="button" class="btn-delete-item" onclick="deleteAccount(${item.id})">Hapus</button>
    </div>
  `).join('');
}

// FITUR HAPUS AKUN
window.deleteAccount = function(id) {
  if (confirm("Yakin mau hapus postingan akun ini?")) {
    const products = getProducts().filter(p => p.id !== id);
    saveProducts(products);
    renderProducts(currentCategory);
    renderAdminManageList();
  }
};

// SUB TABS PRODUK (Semua, FF, ML)
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
  navIndicator.style.transform = `translateX(${index * 100}%)`;
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

// PROSES SUBMIT FORM INPUT TAMBAH AKUN (SOLUSI 2)
const addProductForm = document.getElementById('add-product-form');

if (addProductForm) {
  addProductForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const category = document.getElementById('prod-category').value;
    const code = document.getElementById('prod-code').value.trim();
    const price = document.getElementById('prod-price').value.trim();
    const fileInput = document.getElementById('prod-file');
    const urlInput = document.getElementById('prod-url').value.trim();
    const specsRaw = document.getElementById('prod-specs').value.trim();

    const specsArray = specsRaw.split(',').map(s => s.trim()).filter(s => s.length > 0);

    // Fungsi menyimpan produk
    const saveNewAccount = (imageSrc) => {
      const newAcc = {
        id: Date.now(),
        code: code,
        category: category,
        price: price,
        image: imageSrc || 'banner1.png',
        specs: specsArray
      };

      const products = getProducts();
      products.unshift(newAcc);
      saveProducts(products);

      addProductForm.reset();
      renderProducts(currentCategory);
      renderAdminManageList();

      // Otomatis pindah ke Tab Produk (Index 1)
      switchTab('tab-produk', 1);
    };

    // Jika upload dari galeri file HP
    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function(e) {
        saveNewAccount(e.target.result);
      };
      reader.readAsDataURL(fileInput.files[0]);
    } else {
      // Jika pakai link URL atau default
      saveNewAccount(urlInput);
    }
  });
}

// INISIALISASI
renderProducts('all');
renderAdminManageList();
updateIndicator(0);
