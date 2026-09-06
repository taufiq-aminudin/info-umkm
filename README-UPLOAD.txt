INFO UMKM — ADS & IKLAN SENDIRI
=================================

ZIP ini adalah paket upload untuk menambahkan:
1. SPACE ADS / Google AdSense di halaman publik.
2. IKLAN SENDIRI yang dapat dikontrol melalui localStorage key "infoUmkmAds".
3. Slot TOP, MIDDLE, BOTTOM dan self-ad SIDEBAR/MIDDLE/TOP/BOTTOM.

File yang diubah/ditambahkan:
- index.html
- daftar.html
- umkm/index.html
- umkm/detail.html
- assets/css/style.css
- assets/css/ads.css
- assets/js/app.js
- assets/js/ads.js

Google AdSense:
Saat ini slot tampil sebagai "SPACE ADS" sampai publisher/client ID dan slot ID
diatur. Jangan mengubah fungsi UMKM yang sudah ada.

Contoh data IKLAN SENDIRI:
localStorage.setItem('infoUmkmAds', JSON.stringify([{
  id:'AD-001',
  title:'Promosi UMKM',
  image:'assets/img/iklan.jpg',
  link:'https://contoh.com',
  positions:['top','sidebar','middle','bottom'],
  status:'active'
}]));

Upload:
Ekstrak isi ZIP ke ROOT WEBSITE dan pilih overwrite/replace untuk file yang sama.
File lain yang tidak ada di ZIP tidak dihapus.
