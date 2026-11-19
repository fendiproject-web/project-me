// ============================================================
// DATA SOLD — DIISI MANUAL OLEH ADMIN
// ============================================================
// Cara isi:
//   fileFoto : nama file foto produk (sama seperti di data-produk.js)
//              contoh: "FF1.webp" -> otomatis jadi kode #FF01
//                      "ML2.webp" -> otomatis jadi kode #ML02
//   nama     : nama pembeli (akan otomatis disensor: Fendi -> F****i)
//   waktu    : waktu order format ISO (YYYY-MM-DDTHH:MM:SS)
//              akan otomatis tampil "Baru saja / X menit lalu / X jam lalu
//              / Kemarin / X hari lalu"
//
// URUTAN: tidak perlu diurutkan manual, script akan otomatis
//         menampilkan yang TERBARU di paling atas.
// ============================================================

const DAFTAR_SOLD = [
  // ---- CONTOH (boleh dihapus / diubah) ----
  { fileFoto: "FF1.webp", nama: "Fendi",  waktu: "2026-02-18T07:54:00" },
  { fileFoto: "ML1.webp", nama: "Rizky",  waktu: "2026-02-17T21:30:00" },
  { fileFoto: "FF2.webp", nama: "Anisa",  waktu: "2026-02-17T10:15:00" },

  // ---- TAMBAHKAN DATA SOLD BARU DI SINI ----
];