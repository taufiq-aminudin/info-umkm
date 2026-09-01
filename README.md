# INFO UMKM — info-umkm.my.id

Starter project modern untuk portal direktori UMKM Indonesia.

## Cakupan UI
- Homepage / landing page
- Direktori UMKM nasional
- Filter provinsi, kabupaten/kota, kecamatan, kategori
- Detail UMKM
- Peta/lokasi usaha
- Media sosial & kontak
- Form pendaftaran UMKM
- Upload KTP & KK (UI prototype; penyimpanan aman belum diaktifkan)
- Dashboard Superadmin
- Approval UMKM
- CMS postingan
- Statistik dan activity log
- Responsive desktop/mobile

## Catatan keamanan
KTP, KK, NIK, nomor KK, dan data pribadi tidak boleh disimpan di repository GitHub atau public storage.
Implementasi produksi harus memakai backend, database, private object storage, authentication, role/permission, validation upload, audit log, encryption/backup, dan HTTPS.

## Struktur
- `index.html` — homepage
- `umkm/index.html` — direktori
- `umkm/detail.html` — detail UMKM
- `daftar.html` — pendaftaran UMKM
- `admin/index.html` — dashboard superadmin
- `assets/css/style.css` — desain global
- `assets/js/app.js` — data/demo interaction
- `docs/ARCHITECTURE.md` — rancangan backend & database

## Next step
Prototype ini sengaja dibuat sebagai fondasi UI/UX. Tahap berikutnya dapat diubah menjadi aplikasi Laravel + MySQL dengan API, authentication, approval workflow, dan private document storage.
