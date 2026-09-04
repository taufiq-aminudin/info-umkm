INFO UMKM - FIX SINKRONISASI UMKM ADMIN KE HOMEPAGE

Patch ini menyamakan penyimpanan UMKM Admin ke localStorage key infoUmkmRecords yang juga digunakan oleh panel Admin. Homepage membaca record Approved dari key tersebut sehingga UMKM yang ditambah melalui Tambah UMKM Manual langsung tampil di homepage pada browser/domain yang sama.

File utama:
- index.html
- assets/js/admin.js
- assets/js/admin-tambah.js
- admin/tambah.html

Catatan: karena penyimpanan memakai localStorage, data hanya muncul pada browser/perangkat yang sama.
