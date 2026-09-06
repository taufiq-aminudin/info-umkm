INFO UMKM — ADS + IKLAN SENDIRI — COMPLETE UPLOAD
====================================================

ZIP ini sudah berisi integrasi HTML + CSS + JS.

Yang tersedia di halaman publik:
- ADS TOP
- ADS MIDDLE
- ADS BOTTOM
- IKLAN SENDIRI TOP
- IKLAN SENDIRI MIDDLE
- IKLAN SENDIRI SIDEBAR (pada layout yang memiliki sidebar)
- IKLAN SENDIRI BOTTOM

Jika belum ada AdSense ID, area ADS tetap tampil sebagai SPACE ADS.
Untuk mengaktifkan Google AdSense:
1. Buka assets/js/ads-config.js
2. Isi window.INFO_UMKM_ADSENSE_CLIENT dengan ca-pub-...
3. Isi slot top/middle/bottom dengan ad slot ID Anda.
4. Upload kembali file tersebut.

Iklan sendiri dapat diisi melalui localStorage:
localStorage.setItem('infoUmkmAds', JSON.stringify([{
  id:'AD-001',
  title:'Nama Iklan',
  image:'assets/img/banner.jpg',
  link:'https://contoh.com',
  positions:['top','middle','sidebar','bottom'],
  status:'active'
}]));

Tanpa data iklan sendiri, slot tetap menampilkan "Pasang iklan di INFO UMKM"
sebagai ruang komersial, sehingga ruang iklan tidak hilang.

UPLOAD:
Ekstrak isi ZIP ke ROOT website dan overwrite file yang sama.
Jangan upload folder pembungkus ZIP; isi ZIP adalah root website.

Catatan:
Paket ini hanya menggunakan file sumber yang tersedia dalam pekerjaan ini:
index.html, daftar.html, umkm/index.html, umkm/detail.html serta aset CSS/JS terkait.
Halaman lain yang belum tersedia sebagai file sumber tidak direka ulang agar tidak merusak halaman existing.
