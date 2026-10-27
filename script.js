// --- FITUR 1: TOGGLE TEMA TERANG / GELAP ---
const themeToggleBtn = document.getElementById('themeToggle');
const body = document.body;

themeToggleBtn.addEventListener('click', () => {
  body.classList.toggle('light-mode');
  body.classList.toggle('dark-mode');
});

// --- FITUR 2: NAVIGASI GESER & ANIMASI MEMBAL (BOUNCE) ---
const navItems = document.querySelectorAll('.nav-item');
const navIndicator = document.querySelector('.nav-indicator');

function updateIndicator(index) {
  navIndicator.style.transform = `translateX(${index * 100}%)`;
}

navItems.forEach((item) => {
  item.addEventListener('click', function(e) {
    // Reset status active dan animasi bounce dari ikon lain
    navItems.forEach(nav => {
      nav.classList.remove('active');
      const icon = nav.querySelector('.icon-box');
      if (icon) icon.classList.remove('bounce');
    });

    // Aktifkan menu yang diklik
    this.classList.add('active');

    // Jalankan animasi bounce pada ikon
    const currentIcon = this.querySelector('.icon-box');
    if (currentIcon) {
      currentIcon.classList.add('bounce');
      
      currentIcon.addEventListener('animationend', () => {
        currentIcon.classList.remove('bounce');
      }, { once: true });
    }

    // Geser indikator kapsul
    const index = parseInt(this.getAttribute('data-index'));
    updateIndicator(index);
  });
});

// Posisi awal indikator pada menu Home (index 0)
updateIndicator(0);
