/* INFO UMKM - Public UMKM directory
 * Syncs approved Superadmin data from localStorage key: infoUmkmAdminData.
 * Keeps existing demo UMKM and merges them with approved admin entries.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'infoUmkmAdminData';

  const demoUMKM = [
    { id: 'DEMO-1', name: 'Warung Makmur', cat: 'Kuliner', loc: 'Temanggung, Jawa Tengah', img: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80', rating: '4.9', createdAt: '2026-01-01' },
    { id: 'DEMO-2', name: 'Batik Nusantara', cat: 'Fashion', loc: 'Sleman, DI Yogyakarta', img: 'https://images.unsplash.com/photo-1583743814966-8936f37f1eab?auto=format&fit=crop&w=900&q=80', rating: '4.8', createdAt: '2026-01-02' },
    { id: 'DEMO-3', name: 'Tani Sejahtera', cat: 'Pertanian', loc: 'Bandung, Jawa Barat', img: 'https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=900&q=80', rating: '4.9', createdAt: '2026-01-03' },
    { id: 'DEMO-4', name: 'Kerajinan Bambu', cat: 'Kerajinan', loc: 'Gianyar, Bali', img: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=900&q=80', rating: '4.7', createdAt: '2026-01-04' }
  ];

  const categories = [
    'Kuliner & Makanan', 'Minuman', 'Fashion', 'Kerajinan', 'Pertanian', 'Perkebunan',
    'Peternakan', 'Perikanan', 'Jasa', 'Perdagangan', 'Otomotif', 'Teknologi & Digital',
    'Kesehatan', 'Kecantikan', 'Pendidikan', 'Pariwisata', 'Homestay & Penginapan',
    'Industri', 'Konveksi', 'Furniture', 'Properti', 'Transportasi', 'Ekonomi Kreatif',
    'Elektronik', 'Percetakan', 'Agribisnis', 'Bahan Bangunan', 'Energi', 'Logistik', 'Lainnya'
  ];

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function readAdminData() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (!Array.isArray(raw)) return [];
      return raw
        .filter(u => String(u.status || '').toLowerCase() === 'approved')
        .map(normalizeAdmin)
        .filter(Boolean);
    } catch (error) {
      console.error('INFO UMKM: gagal membaca data Superadmin.', error);
      return [];
    }
  }

  function normalizeAdmin(u, index) {
    if (!u || typeof u !== 'object') return null;
    const name = String(u.businessName || u.name || '').trim();
    if (!name) return null;

    const province = String(u.province || '').trim();
    const regency = String(u.regency || '').trim();
    const district = String(u.district || '').trim();
    const provinceName = String(u.provinceName || '').trim();
    const regencyName = String(u.regencyName || '').trim();
    const districtName = String(u.districtName || '').trim();
    const address = String(u.address || '').trim();
    const location = [districtName, regencyName, provinceName].filter(Boolean).join(', ') || address || 'Indonesia';

    return {
      id: String(u.id || ('ADMIN-' + index)),
      name,
      cat: String(u.category || 'Lainnya').trim(),
      loc: location,
      img: String(u.logo || '').trim(),
      rating: String(u.rating || '5.0'),
      createdAt: String(u.createdAt || ''),
      source: 'admin',
      province,
      regency,
      district,
      provinceName,
      regencyName,
      districtName,
      address,
      description: String(u.description || '').trim(),
      phone: String(u.phone || '').trim(),
      ownerName: String(u.ownerName || '').trim()
    };
  }

  function getAllUMKM() {
    return demoUMKM.concat(readAdminData());
  }

  function selectedValue(id) {
    return document.getElementById(id)?.value || '';
  }

  function selectedText(id) {
    return document.getElementById(id)?.selectedOptions?.[0]?.textContent?.trim() || '';
  }

  function getFilterValues() {
    return {
      search: selectedValue('filterSearch').trim().toLowerCase(),
      province: selectedValue('filterProvince').trim(),
      provinceName: selectedText('filterProvince').toLowerCase(),
      regency: selectedValue('filterRegency').trim(),
      regencyName: selectedText('filterRegency').toLowerCase(),
      district: selectedValue('filterDistrict').trim(),
      districtName: selectedText('filterDistrict').toLowerCase(),
      category: selectedValue('filterCategory').trim().toLowerCase(),
      sort: selectedValue('sortSelect').trim().toLowerCase()
    };
  }

  function categoryMatches(itemCat, selectedCat) {
    if (!selectedCat || selectedCat === 'semua kategori') return true;
    const a = String(itemCat || '').toLowerCase();
    const b = String(selectedCat || '').toLowerCase();
    if (a === b) return true;
    if (b === 'kuliner' && a === 'kuliner & makanan') return true;
    return a.includes(b) || b.includes(a);
  }

  function regionMatches(item, f) {
    if (f.province && item.source === 'admin') {
      if (item.province !== f.province && item.provinceName.toLowerCase() !== f.provinceName) return false;
    } else if (f.province && item.source !== 'admin') {
      if (!item.loc.toLowerCase().includes(f.provinceName)) return false;
    }

    if (f.regency && item.source === 'admin') {
      if (item.regency !== f.regency && item.regencyName.toLowerCase() !== f.regencyName) return false;
    } else if (f.regency && item.source !== 'admin') {
      if (!item.loc.toLowerCase().includes(f.regencyName)) return false;
    }

    if (f.district && item.source === 'admin') {
      if (item.district !== f.district && item.districtName.toLowerCase() !== f.districtName) return false;
    } else if (f.district && item.source !== 'admin') {
      if (!item.loc.toLowerCase().includes(f.districtName)) return false;
    }
    return true;
  }

  function applyFilters(items) {
    const f = getFilterValues();
    const filtered = items.filter(item => {
      const haystack = [item.name, item.cat, item.loc, item.address, item.description, item.ownerName].join(' ').toLowerCase();
      if (f.search && !haystack.includes(f.search)) return false;
      if (!regionMatches(item, f)) return false;
      if (!categoryMatches(item.cat, f.category)) return false;
      return true;
    });

    if (f.sort === 'terbaru') {
      filtered.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    } else if (f.sort === 'terpopuler') {
      filtered.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    }

    return filtered;
  }

  function card(u) {
    const image = u.img || '../assets/img/logo.svg';
    const detail = 'detail.html?id=' + encodeURIComponent(u.id);
    const verified = u.source === 'admin' ? '✓ Terverifikasi' : '✓ Terverifikasi';
    return `<article class="card">
      <div class="card-img">
        <img src="${esc(image)}" alt="${esc(u.name)}" loading="lazy">
        <span class="badge">${verified}</span>
      </div>
      <div class="card-body">
        <h3>${esc(u.name)}</h3>
        <p>${esc(u.cat)}</p>
        <p>📍 ${esc(u.loc)}</p>
        <div class="stars">★★★★★ <span class="muted">${esc(u.rating)}</span></div>
        <a class="btn btn-outline" href="${detail}">Lihat Detail</a>
      </div>
    </article>`;
  }

  function populateCategories() {
    const select = document.getElementById('filterCategory');
    if (!select) return;
    const current = select.value;
    select.innerHTML = '<option value="">Semua Kategori</option>' + categories.map(cat => `<option value="${esc(cat)}">${esc(cat)}</option>`).join('');
    if (current) select.value = current;
  }

  function renderCards(id = 'listId') {
    const el = document.getElementById(id);
    if (!el) return;
    const filtered = applyFilters(getAllUMKM());
    el.innerHTML = filtered.map(card).join('') || '<div class="panel" style="grid-column:1/-1;text-align:center;padding:30px">Tidak ada UMKM yang sesuai filter.</div>';
    const count = document.querySelector('.resultsbar b');
    if (count) count.textContent = `${filtered.length} UMKM ditemukan`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    populateCategories();
    renderCards();

    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();

    ['filterSearch', 'filterProvince', 'filterRegency', 'filterDistrict', 'filterCategory', 'sortSelect'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener(id === 'filterSearch' ? 'input' : 'change', () => renderCards());
    });

    // If Superadmin adds data in another tab/window, refresh the public list automatically.
    window.addEventListener('storage', event => {
      if (event.key === STORAGE_KEY) renderCards();
    });
  });
})();
