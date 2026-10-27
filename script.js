// Preload gambar profil dan banner langsung ke memori browser
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

// --- FITUR 2: PERPINDAHAN HALAMAN TAB & INDIKATOR BOTTOM NAV ---
const navItems = document.querySelectorAll('.nav-item');
const navIndicator = document.querySelector('.nav-indicator');
const tabContents = document.querySelectorAll('.tab-content');

function updateIndicator(index) {
  navIndicator.style.transform = `translateX(${index * 100}%)`;
}

function switchTab(targetTabId, navIndex) {
  // 1. Reset status active di semua tombol & tab content
  navItems.forEach(nav => {
    nav.classList.remove('active');
    const icon = nav.querySelector('.icon-box');
    if (icon) icon.classList.remove('bounce');
  });

  tabContents.forEach(tab => {
    tab.classList.remove('active');
  });

  // 2. Aktifkan nav item yang sesuai
  const targetNavItem = document.querySelector(`.nav-item[data-index="${navIndex}"]`);
  if (targetNavItem) {
    targetNavItem.classList.add('active');

    // Animasi bounce
    const currentIcon = targetNavItem.querySelector('.icon-box');
    if (currentIcon) {
      currentIcon.classList.add('bounce');
      currentIcon.addEventListener('animationend', () => {
        currentIcon.classList.remove('bounce');
      }, { once: true });
    }
  }

  // 3. Tampilkan tab content yang dipilih
  const targetTab = document.getElementById(targetTabId);
  if (targetTab) {
    targetTab.classList.add('active');
  }

  // 4. Geser indikator kapsul
  updateIndicator(navIndex);
}

// Event listener klik tombol navigasi bawah
navItems.forEach((item) => {
  item.addEventListener('click', function(e) {
    e.preventDefault();
    const targetTabId = this.getAttribute('data-target');
    const navIndex = parseInt(this.getAttribute('data-index'));
    switchTab(targetTabId, navIndex);
  });
});

// Event listener tombol pemicu antar tab (seperti Cek Keaslian Admin)
const switchTabTriggers = document.querySelectorAll('.switch-tab-trigger');
switchTabTriggers.forEach((trigger) => {
  trigger.addEventListener('click', function() {
    const targetTabId = this.getAttribute('data-target-tab');
    const navIndex = parseInt(this.getAttribute('data-nav-index'));
    switchTab(targetTabId, navIndex);
  });
});

// Posisi awal indikator pada menu Home (index 0)
updateIndicator(0);
