INFO UMKM — Homepage Patch
============================

Source:
https://github.com/taufiq-aminudin/info-umkm

Patch:
- Replaces root index.html with the supplied homepage.
- Homepage reads approved UMKM from localStorage key: infoUmkmRecords.
- Keeps existing Admin/Admin-Tambah data flow intact.
- No admin.js or admin-tambah.js are replaced.
- Duplicate closing HTML tags in the supplied paste were cleaned.

Upload:
Extract this ZIP into the INFO UMKM project root and replace index.html.
