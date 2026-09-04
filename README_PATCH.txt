INFO UMKM — MASTER HEADER FIX

Sumber: repository GitHub taufiq-aminudin/info-umkm, branch main.

Patch ini memperbaiki kesalahan ZIP sebelumnya dan menjadikan header Beranda sebagai master untuk halaman publik yang dipatch.

Isi:
- index.html
- assets/css/style.css
- umkm/index.html
- umkm/detail.html

PENTING:
- style.css adalah file CSS, bukan index.html.
- umkm/index.html tidak kosong.
- Struktur header publik memakai pola master Beranda: .container.nav > .brand + .navlinks + .mobile.
- Tidak mengubah JS admin, filter, detail, atau aset gambar.
- File lama dengan nama yang sama boleh ditimpa sesuai struktur folder.
