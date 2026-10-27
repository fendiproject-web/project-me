// Preload gambar profil dan banner
const avatarPreload = new Image();
avatarPreload.src = 'profile.webp';

const bannerPreload = new Image();
bannerPreload.src = 'banner1.png';

// --- FITUR 1: TOGGLE TEMA TERANG / GELAP ---
const themeToggleBtn = document.getElementById('themeToggle');
const body = document.body;

themeToggleBtn.addEventListener('click', () => {
  body.classList.toggle('light-mode');
  body.classList.toggle('dark-mode');
});

// --- FITUR 2: PERPINDAHAN HALAMAN UTAMA (BOTTOM NAV) ---
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

// Event trigger dari tombol Home ke DataMe
const switchTabTriggers = document.querySelectorAll('.switch-tab-trigger');
switchTabTriggers.forEach((trigger) => {
  trigger.addEventListener('click', function() {
    const targetTabId = this.getAttribute('data-target-tab');
    const navIndex = parseInt(this.getAttribute('data-nav-index'));
    switchTab(targetTabId, navIndex);
  });
});

// --- FITUR 3: SUB TABS PRODUK (Semua, Free Fire, Mobile Legends) ---
const subTabItems = document.querySelectorAll('.sub-tab-item');
const subTabContents = document.querySelectorAll('.sub-tab-content');

subTabItems.forEach((btn) => {
  btn.addEventListener('click', function() {
    const targetSub = this.getAttribute('data-sub');

    subTabItems.forEach(b => b.classList.remove('active'));
    subTabContents.forEach(c => c.classList.remove('active'));

    this.classList.add('active');
    const activeContent = document.getElementById(`sub-${targetSub}`);
    if (activeContent) {
      activeContent.classList.add('active');
    }
  });
});

// Posisi awal indikator pada menu Home (index 0)
updateIndicator(0);
