// ============================================================
// SOLD NOTIFIKASI — muncul masuk-keluar bergantian di atas layar
// ============================================================

(function () {
  const CONTAINER_ID = 'sold-notif-container';

  // --- SENSOR NAMA: Fendi -> F****i ---
  function sensorNama(nama) {
    if (!nama) return '***';
    const str = String(nama).trim();
    if (str.length <= 2) return str.charAt(0) + '*';
    if (str.length === 3) return str.charAt(0) + '*' + str.charAt(2);
    const first = str.charAt(0);
    const last = str.charAt(str.length - 1);
    const middle = '*'.repeat(str.length - 2);
    return first + middle + last;
  }

  // --- FORMAT WAKTU MAJU ---
  function timeAgo(waktuStr) {
    const waktu = new Date(waktuStr).getTime();
    if (isNaN(waktu)) return '';
    const now = Date.now();
    const diffMs = now - waktu;
    if (diffMs < 0) return 'Baru saja';

    const menit = Math.floor(diffMs / 60000);
    const jam   = Math.floor(diffMs / 3600000);
    const hari  = Math.floor(diffMs / 86400000);

    if (menit < 1) return 'Baru saja';
    if (menit < 60) return menit + ' menit lalu';
    if (jam < 24) return jam + ' jam lalu';
    if (jam < 48) return 'Kemarin';
    return hari + ' hari lalu';
  }

  // --- AMBIL KODE #FF01 DARI fileFoto ---
  function kodeDariFile(fileFoto) {
    if (!fileFoto) return '';
    const nama = String(fileFoto).toLowerCase();
    // Cari angka di nama file
    const angka = nama.match(/\d+/);
    const nomor = angka ? angka[0].padStart(2, '0') : '00';
    if (nama.includes('ml')) return '#ML' + nomor;
    if (nama.includes('ff')) return '#FF' + nomor;
    return '#' + nomor;
  }

  // --- CARI HARGA DARI DAFTAR_PRODUK ---
  function hargaDariFile(fileFoto) {
    if (typeof DAFTAR_PRODUK === 'undefined') return 0;
    const match = DAFTAR_PRODUK.find(p =>
      String(p.fileFoto).toLowerCase() === String(fileFoto).toLowerCase()
    );
    if (!match) return 0;
    return String(match.harga || 0).replace(/\D/g, '');
  }

  function formatRupiah(val) {
    const clean = String(val).replace(/\D/g, '');
    return clean ? new Intl.NumberFormat('id-ID').format(clean) : '0';
  }

  // --- BANGUN DAFTAR NOTIFIKASI ---
  function buildNotifList() {
    if (typeof DAFTAR_SOLD === 'undefined' || !Array.isArray(DAFTAR_SOLD)) return [];

    return DAFTAR_SOLD
      .map(item => {
        const waktuMs = new Date(item.waktu).getTime();
        const kode = kodeDariFile(item.fileFoto);
        const harga = hargaDariFile(item.fileFoto);
        return {
          nama: sensorNama(item.nama),
          kode: kode,
          harga: harga,
          waktuMs: isNaN(waktuMs) ? 0 : waktuMs,
          waktuRaw: item.waktu
        };
      })
      .filter(item => item.kode)
      .sort((a, b) => b.waktuMs - a.waktuMs); // terbaru di atas
  }

  // --- RENDER SATU NOTIFIKASI ---
  function renderNotif(item) {
    const kodeTeks = item.kode.replace('#', '');
    // "STOCK PRIBADI 01" -> ambil angka saja
    const nomorStock = kodeTeks.replace(/[A-Z]/gi, '');
    return `
      <div class="sold-notif-item">
        <span class="sold-notif-text">
          <strong>${item.nama}</strong> Berhasil Order
          STOCK PRIBADI ${nomorStock}
          <span class="sold-notif-price">Rp. ${formatRupiah(item.harga)}</span>
          <span class="sold-notif-time">· ${timeAgo(item.waktuRaw)}</span>
        </span>
        <button type="button" class="sold-notif-close" aria-label="Tutup">&times;</button>
      </div>
    `;
  }

  // --- JALANKAN ANIMASI MASUK-KELUAR ---
  function startNotifLoop(container, items) {
    let index = 0;
    let stopped = false;

    const stop = () => {
      stopped = true;
      container.classList.remove('show');
      container.innerHTML = '';
    };

    const showNext = () => {
      if (stopped) return;
      if (index >= items.length) index = 0; // loop

      container.innerHTML = renderNotif(items[index]);
      // tombol close
      const closeBtn = container.querySelector('.sold-notif-close');
      if (closeBtn) closeBtn.addEventListener('click', stop);

      // masuk
      requestAnimationFrame(() => container.classList.add('show'));

      // tampil 4 detik, lalu keluar
      setTimeout(() => {
        if (stopped) return;
        container.classList.remove('show');
        setTimeout(() => {
          if (stopped) return;
          index++;
          showNext();
        }, 400);
      }, 4000);
    };

    showNext();
  }

  // --- INIT ---
  function init() {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) return;

    // Tunggu data-produk.js & data-sold.js siap
    const tryInit = () => {
      if (typeof DAFTAR_PRODUK === 'undefined' || typeof DAFTAR_SOLD === 'undefined') {
        setTimeout(tryInit, 200);
        return;
      }
      const items = buildNotifList();
      if (items.length === 0) return;
      startNotifLoop(container, items);
    };

    tryInit();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();