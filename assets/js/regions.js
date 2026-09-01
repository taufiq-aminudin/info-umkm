/* INFO UMKM - Wilayah Indonesia
 * Penambahan terisolasi untuk filter Provinsi -> Kabupaten/Kota -> Kecamatan.
 * Tidak mengubah app.js atau data UMKM yang sudah ada.
 */
(function () {
  'use strict';

  const API = 'https://wilayah.web.id/api';

  // 38 provinsi Indonesia. Kode mengikuti kode wilayah Kemendagri.
  const provinces = [
    ['11','Aceh'],
    ['12','Sumatera Utara'],
    ['13','Sumatera Barat'],
    ['14','Riau'],
    ['15','Jambi'],
    ['16','Sumatera Selatan'],
    ['17','Bengkulu'],
    ['18','Lampung'],
    ['19','Kepulauan Bangka Belitung'],
    ['21','Kepulauan Riau'],
    ['31','DKI Jakarta'],
    ['32','Jawa Barat'],
    ['33','Jawa Tengah'],
    ['34','Daerah Istimewa Yogyakarta'],
    ['35','Jawa Timur'],
    ['36','Banten'],
    ['51','Bali'],
    ['52','Nusa Tenggara Barat'],
    ['53','Nusa Tenggara Timur'],
    ['61','Kalimantan Barat'],
    ['62','Kalimantan Tengah'],
    ['63','Kalimantan Selatan'],
    ['64','Kalimantan Timur'],
    ['65','Kalimantan Utara'],
    ['71','Sulawesi Utara'],
    ['72','Sulawesi Tengah'],
    ['73','Sulawesi Selatan'],
    ['74','Sulawesi Tenggara'],
    ['75','Gorontalo'],
    ['76','Sulawesi Barat'],
    ['81','Maluku'],
    ['82','Maluku Utara'],
    ['91','Papua'],
    ['92','Papua Barat'],
    ['93','Papua Selatan'],
    ['94','Papua Tengah'],
    ['95','Papua Pegunungan'],
    ['96','Papua Barat Daya']
  ];

  function setOptions(select, items, placeholder) {
    select.innerHTML = '';
    const first = document.createElement('option');
    first.value = '';
    first.textContent = placeholder;
    select.appendChild(first);
    items.forEach(function (item) {
      const option = document.createElement('option');
      option.value = item.code;
      option.textContent = item.name;
      select.appendChild(option);
    });
  }

  function setLoading(select, placeholder) {
    select.innerHTML = '';
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Memuat data...';
    select.appendChild(option);
    select.disabled = true;
  }

  async function getRegions(url) {
    const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const json = await response.json();
    return Array.isArray(json.data) ? json.data : [];
  }

  function normalize(items) {
    return items.map(function (item) {
      return { code: String(item.code || item.id || ''), name: String(item.name || '') };
    }).filter(function (item) { return item.code && item.name; });
  }

  document.addEventListener('DOMContentLoaded', function () {
    const province = document.getElementById('filterProvince');
    const regency = document.getElementById('filterRegency');
    const district = document.getElementById('filterDistrict');
    if (!province || !regency || !district) return;

    setOptions(province, provinces.map(function (p) { return { code: p[0], name: p[1] }; }), 'Semua Provinsi');

    // Pertahankan tampilan awal website: Jawa Tengah.
    province.value = '33';

    async function loadRegencies(code, keepSelection) {
      if (!code) {
        setOptions(regency, [], 'Semua Kabupaten/Kota');
        regency.disabled = true;
        setOptions(district, [], 'Semua Kecamatan');
        district.disabled = true;
        return;
      }
      setLoading(regency, 'Semua Kabupaten/Kota');
      setLoading(district, 'Semua Kecamatan');
      try {
        const items = normalize(await getRegions(API + '/regencies/' + encodeURIComponent(code) + '?limit=100'));
        setOptions(regency, items, 'Semua Kabupaten/Kota');
        regency.disabled = false;
        if (keepSelection) regency.value = keepSelection;
      } catch (error) {
        setOptions(regency, [], 'Data kabupaten/kota gagal dimuat');
        regency.disabled = true;
        console.error('INFO UMKM wilayah:', error);
      }
      district.disabled = true;
      district.innerHTML = '<option value="">Pilih Kabupaten/Kota terlebih dahulu</option>';
    }

    async function loadDistricts(code) {
      if (!code) {
        setOptions(district, [], 'Semua Kecamatan');
        district.disabled = true;
        return;
      }
      setLoading(district, 'Semua Kecamatan');
      try {
        const items = normalize(await getRegions(API + '/districts/' + encodeURIComponent(code) + '?limit=1000'));
        setOptions(district, items, 'Semua Kecamatan');
        district.disabled = false;
      } catch (error) {
        setOptions(district, [], 'Data kecamatan gagal dimuat');
        district.disabled = true;
        console.error('INFO UMKM wilayah:', error);
      }
    }

    province.addEventListener('change', function () {
      loadRegencies(this.value, '');
    });

    regency.addEventListener('change', function () {
      loadDistricts(this.value);
    });

    loadRegencies(province.value, '');
  });
})();
