INFO UMKM — Superadmin Edit UMKM Patch

Isi ZIP:
- admin/umkm.html — Kelola UMKM dengan tombol Detail + Edit dan filter status usaha.
- admin/edit.html — Form edit UMKM.
- assets/js/admin-edit.js — Simpan perubahan ke localStorage.infoUmkmAdminData.
- assets/js/admin-kelola-umkm.js — Tabel Kelola UMKM.
- assets/css/admin-edit-patch.css — CSS tambahan kecil.

Fitur:
- Edit nama usaha, pemilik, HP, email, NIK/KK internal, kategori, wilayah, alamat, deskripsi.
- Edit titik lokasi pada peta.
- Ganti logo dan gallery.
- Status usaha: Aktif / Pindah Lokasi / Tutup.
- Saat lokasi berubah, lokasi lama disimpan ke locationHistory.
- Saat status Tutup, closedAt dicatat.
- Data NIK/KK hanya berada di storage Superadmin dan tidak dirender pada halaman publik.

Catatan penting:
Sistem saat ini menggunakan localStorage.infoUmkmAdminData. Jadi data hanya tersimpan pada browser/origin yang sama. Ini belum merupakan database server bersama.
