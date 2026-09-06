INFO UMKM — PATCH ADMIN IKLAN

Fungsi:
- Iklan publik tampil di seluruh halaman publik website; area /admin tidak menampilkan iklan.
- Script iklan dimuat otomatis oleh app.js dan dipasang eksplisit pada halaman publik utama yang tersedia.
- Admin dapat membuat, mengedit, menghapus, menjeda, dan menerbitkan iklan.
- Posisi: TOP, MIDDLE, SIDEBAR 300x250, BOTTOM.
- Data iklan menggunakan localStorage key: infoUmkmAds.

File baru:
- admin/iklan.html
- assets/js/admin-ads.js
- assets/css/admin-ads.css

File yang dipatch:
- assets/js/ads.js
- assets/js/side-ads.js

Akses admin iklan setelah upload:
/admin/iklan.html (dari menu Manajemen Iklan di /admin)

Catatan:
Ini masih mekanisme static/localStorage. Untuk iklan yang dapat dikelola terpusat oleh admin dan terlihat oleh semua pengunjung dari perangkat berbeda, tahap produksi perlu backend/database atau CMS. Jangan gunakan localStorage untuk kredensial admin atau data sensitif.
