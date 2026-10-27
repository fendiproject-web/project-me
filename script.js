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

navItems.forEach((item) => {
  item.addEventListener('click', function(e) {
    e.preventDefault(); // Mencegah lompatan scroll default browser

    // 1. Reset kelas active di semua tombol nav & tab content
    navItems.forEach(nav => {
      nav.classList.remove('active');
      const icon = nav.querySelector('.icon-box');
      if (icon) icon.classList.remove('bounce');
    });

    tabContents.forEach(tab => {
      tab.classList.remove('active');
    });

    // 2. Aktifkan menu bottom nav yang diklik
    this.classList.add('active');

    // 3. Tampilkan halaman tab yang sesuai
    const targetId = this.getAttribute('data-target');
    const targetTab = document.getElementById(targetId);
    if (targetTab) {
      targetTab.classList.add('active');
    }

    // 4. Jalankan animasi bounce pada ikon
    const currentIcon = this.querySelector('.icon-box');
    if (currentIcon) {
      currentIcon.classList.add('bounce');
      
      currentIcon.addEventListener('animationend', () => {
        currentIcon.classList.remove('bounce');
      }, { once: true });
    }

    // 5. Geser indikator kapsul cembung
    const index = parseInt(this.getAttribute('data-index'));
    updateIndicator(index);
  });
});

// Posisi awal indikator pada menu Home (index 0)
updateIndicator(0);
