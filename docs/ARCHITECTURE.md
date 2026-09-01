# Arsitektur Produksi INFO UMKM

## Stack yang disarankan
- Laravel / PHP
- MySQL
- Blade + Tailwind CSS
- Alpine.js / JavaScript
- Google Maps atau OpenStreetMap
- Private storage untuk KTP/KK

## Entitas utama
users
admins
umkms
umkm_documents
umkm_products
umkm_social_media
provinces
regencies
districts
villages
categories
posts
media
approvals
activity_logs
settings

## Status UMKM
draft -> pending -> approved / rejected -> suspended

## Prinsip keamanan
1. Dokumen KTP/KK private, tidak public URL.
2. Password menggunakan hashing.
3. RBAC untuk superadmin/admin.
4. Validasi MIME, ukuran, dan extension upload.
5. Audit log untuk approval dan akses dokumen.
6. `.env` tidak masuk Git.
7. Backup terenkripsi.
8. HTTPS wajib.
