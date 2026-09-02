/* =========================================================
   INFO UMKM - FILTER WILAYAH INDONESIA
   Provinsi -> Kabupaten/Kota -> Kecamatan

   File baru / terisolasi.
   Tidak mengubah app.js, kategori, data UMKM, atau map.
   ========================================================= */

(function () {
  'use strict';

  const API = 'https://wilayah.id/api';

  /* =========================================================
     38 PROVINSI INDONESIA
     ========================================================= */

  const PROVINCES = [
    ['11', 'Aceh'],
    ['12', 'Sumatera Utara'],
    ['13', 'Sumatera Barat'],
    ['14', 'Riau'],
    ['15', 'Jambi'],
    ['16', 'Sumatera Selatan'],
    ['17', 'Bengkulu'],
    ['18', 'Lampung'],
    ['19', 'Kepulauan Bangka Belitung'],
    ['21', 'Kepulauan Riau'],
    ['31', 'DKI Jakarta'],
    ['32', 'Jawa Barat'],
    ['33', 'Jawa Tengah'],
    ['34', 'Daerah Istimewa Yogyakarta'],
    ['35', 'Jawa Timur'],
    ['36', 'Banten'],
    ['51', 'Bali'],
    ['52', 'Nusa Tenggara Barat'],
    ['53', 'Nusa Tenggara Timur'],
    ['61', 'Kalimantan Barat'],
    ['62', 'Kalimantan Tengah'],
    ['63', 'Kalimantan Selatan'],
    ['64', 'Kalimantan Timur'],
    ['65', 'Kalimantan Utara'],
    ['71', 'Sulawesi Utara'],
    ['72', 'Sulawesi Tengah'],
    ['73', 'Sulawesi Selatan'],
    ['74', 'Sulawesi Tenggara'],
    ['75', 'Gorontalo'],
    ['76', 'Sulawesi Barat'],
    ['81', 'Maluku'],
    ['82', 'Maluku Utara'],
    ['91', 'Papua'],
    ['92', 'Papua Barat'],
    ['93', 'Papua Selatan'],
    ['94', 'Papua Tengah'],
    ['95', 'Papua Pegunungan'],
    ['96', 'Papua Barat Daya']
  ];

  /* =========================================================
     ELEMENT
     ========================================================= */

  const province = document.getElementById('filterProvince');
  const regency = document.getElementById('filterRegency');
  const district = document.getElementById('filterDistrict');

  if (!province || !regency || !district) {
    return;
  }

  /* =========================================================
     HELPER
     ========================================================= */

  function clearSelect(select, text, disabled) {
    select.innerHTML = '';

    const option = document.createElement('option');
    option.value = '';
    option.textContent = text;

    select.appendChild(option);
    select.disabled = disabled;
  }

  function fillSelect(select, data, placeholder) {
    select.innerHTML = '';

    const first = document.createElement('option');
    first.value = '';
    first.textContent = placeholder;
    select.appendChild(first);

    data.forEach(function (item) {
      const option = document.createElement('option');

      option.value = String(item.code);
      option.textContent = String(item.name);

      select.appendChild(option);
    });

    select.disabled = false;
  }

  function loading(select, text) {
    clearSelect(select, text, true);
  }

  function normalize(data) {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map(function (item) {
        return {
          code: String(item.code || item.id || '').trim(),
          name: String(item.name || '').trim()
        };
      })
      .filter(function (item) {
        return item.code && item.name;
      });
  }

  function sortByName(items) {
    return items.sort(function (a, b) {
      return a.name.localeCompare(
        b.name,
        'id',
        {
          sensitivity: 'base',
          numeric: true
        }
      );
    });
  }

  /* =========================================================
     API
     ========================================================= */

  async function request(url) {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(
        'HTTP ' + response.status + ' - ' + url
      );
    }

    const json = await response.json();

    if (!json || !Array.isArray(json.data)) {
      throw new Error(
        'Format response wilayah tidak valid'
      );
    }

    return normalize(json.data);
  }

  /* =========================================================
     LOAD PROVINSI
     ========================================================= */

  function loadProvinces() {

    const data = PROVINCES.map(function (item) {
      return {
        code: item[0],
        name: item[1]
      };
    });

    fillSelect(
      province,
      data,
      'Semua Provinsi'
    );

    /*
     * Tampilan awal tetap Jawa Tengah
     */
    province.value = '33';

    loadRegencies('33');
  }

  /* =========================================================
     LOAD KABUPATEN / KOTA
     ========================================================= */

  async function loadRegencies(provinceCode) {

    clearSelect(
      regency,
      'Memuat Kabupaten/Kota...',
      true
    );

    clearSelect(
      district,
      'Pilih Kabupaten/Kota terlebih dahulu',
      true
    );

    if (!provinceCode) {
      clearSelect(
        regency,
        'Pilih Provinsi terlebih dahulu',
        true
      );

      return;
    }

    try {

      const url =
        API +
        '/regencies/' +
        encodeURIComponent(provinceCode) +
        '.json';

      const data = sortByName(
        await request(url)
      );

      if (!data.length) {
        throw new Error(
          'Kabupaten/Kota tidak ditemukan'
        );
      }

      fillSelect(
        regency,
        data,
        'Semua Kabupaten/Kota'
      );

      console.info(
        'INFO UMKM:',
        data.length,
        'Kabupaten/Kota untuk provinsi',
        provinceCode
      );

    } catch (error) {

      clearSelect(
        regency,
        'Data Kabupaten/Kota gagal dimuat',
        true
      );

      console.error(
        'INFO UMKM - Kabupaten/Kota:',
        error
      );
    }
  }

  /* =========================================================
     LOAD KECAMATAN
     ========================================================= */

  async function loadDistricts(regencyCode) {

    clearSelect(
      district,
      'Memuat Kecamatan...',
      true
    );

    if (!regencyCode) {

      clearSelect(
        district,
        'Pilih Kabupaten/Kota terlebih dahulu',
        true
      );

      return;
    }

    try {

      /*
       * PENTING:
       * Mengambil Kecamatan berdasarkan kode
       * Kabupaten/Kota yang dipilih.
       */
      const url =
        API +
        '/districts/' +
        encodeURIComponent(regencyCode) +
        '.json';

      const data = sortByName(
        await request(url)
      );

      if (!data.length) {
        throw new Error(
          'Kecamatan tidak ditemukan untuk ' +
          regencyCode
        );
      }

      fillSelect(
        district,
        data,
        'Semua Kecamatan'
      );

      console.info(
        'INFO UMKM:',
        data.length,
        'Kecamatan untuk Kabupaten/Kota',
        regencyCode
      );

    } catch (error) {

      clearSelect(
        district,
        'Data Kecamatan gagal dimuat',
        true
      );

      console.error(
        'INFO UMKM - Kecamatan:',
        error
      );
    }
  }

  /* =========================================================
     EVENT PROVINSI
     ========================================================= */

  province.addEventListener(
    'change',
    function () {

      loadRegencies(
        this.value
      );

    }
  );

  /* =========================================================
     EVENT KABUPATEN / KOTA
     ========================================================= */

  regency.addEventListener(
    'change',
    function () {

      loadDistricts(
        this.value
      );

    }
  );

  /* =========================================================
     START
     ========================================================= */

  loadProvinces();

})();
