// ==========================================
// SCRIPT FENDI STORE (TANPA DATA PRODUK)
// ==========================================

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

// JALANKAN SAAT HALAMAN DIBUKA
initTheme();
handleRouting();