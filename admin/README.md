# INFO UMKM — Superadmin Clickable Patch v8

Perbaikan dari screenshot terbaru.

Penyebab utama:
- `index.html` dashboard sebelumnya **tidak memuat `admin-layout-patch.css`**, sehingga CSS layout tidak pernah diterapkan pada dashboard.
- Akibatnya sidebar lama tetap menempel/fixed dan terlihat menimpa footer.

Perbaikan:
- Satu file layout saja: `assets/css/admin-layout-patch.css`
- Patch sekarang dimuat langsung pada semua halaman admin non-login.
- Dashboard tidak lagi memiliki wrapper `</div>` berlebih sebelum footer.
- Sidebar tetap normal-flow dan footer berada setelah area admin.
- Tidak membuat patch CSS v3/v5/v6 baru.
