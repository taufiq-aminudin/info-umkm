/* INFO UMKM - Wilayah Indonesia
 * Public UMKM filter
 * Reference implementation: working Superadmin wilayah patch.
 * Cascade: Provinsi -> Kabupaten/Kota -> Kecamatan
 */
(function () {
  "use strict";

  const API = "https://api.kodewilayah.web.id";

  const provinceEl = document.getElementById("filterProvince");
  const regencyEl = document.getElementById("filterRegency");
  const districtEl = document.getElementById("filterDistrict");

  if (!provinceEl || !regencyEl || !districtEl) return;

  function resetSelect(select, text, disabled = true) {
    select.innerHTML = "";
    const option = document.createElement("option");
    option.value = "";
    option.textContent = text;
    select.appendChild(option);
    select.disabled = disabled;
  }

  function fillSelect(select, data, placeholder) {
    select.innerHTML = "";

    const first = document.createElement("option");
    first.value = "";
    first.textContent = placeholder;
    select.appendChild(first);

    (Array.isArray(data) ? data : []).forEach(item => {
      const option = document.createElement("option");
      option.value = String(item.code);
      option.textContent = item.name;
      select.appendChild(option);
    });

    select.disabled = false;
  }

  async function load(url, levelName) {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: { "Accept": "application/json" }
    });

    if (!response.ok) {
      throw new Error(`${levelName}: HTTP ${response.status}`);
    }

    const json = await response.json();

    if (!json || json.success !== true || !Array.isArray(json.data)) {
      throw new Error(`${levelName}: response API tidak valid`);
    }

    return json.data;
  }

  async function loadProvinces() {
    resetSelect(provinceEl, "Memuat Provinsi...");
    resetSelect(regencyEl, "Pilih Provinsi terlebih dahulu");
    resetSelect(districtEl, "Pilih Kabupaten/Kota terlebih dahulu");

    try {
      const data = await load(`${API}/provinces`, "Provinsi");
      fillSelect(provinceEl, data, "Semua Provinsi");
    } catch (error) {
      resetSelect(provinceEl, "Gagal memuat Provinsi");
      console.error("INFO UMKM:", error);
    }
  }

  async function loadRegencies(provinceCode) {
    resetSelect(regencyEl, "Memuat Kabupaten/Kota...");
    resetSelect(districtEl, "Pilih Kabupaten/Kota terlebih dahulu");

    if (!provinceCode) {
      resetSelect(regencyEl, "Pilih Provinsi terlebih dahulu");
      return;
    }

    try {
      const data = await load(`${API}/regencies/${encodeURIComponent(provinceCode)}`, "Kabupaten/Kota");
      fillSelect(regencyEl, data, "Semua Kabupaten/Kota");
    } catch (error) {
      resetSelect(regencyEl, "Gagal memuat Kabupaten/Kota");
      console.error("INFO UMKM:", error);
    }
  }

  async function loadDistricts(regencyCode) {
    resetSelect(districtEl, "Memuat Kecamatan...");

    if (!regencyCode) {
      resetSelect(districtEl, "Pilih Kabupaten/Kota terlebih dahulu");
      return;
    }

    try {
      const data = await load(`${API}/districts/${encodeURIComponent(regencyCode)}`, "Kecamatan");
      fillSelect(districtEl, data, "Semua Kecamatan");
    } catch (error) {
      resetSelect(districtEl, "Gagal memuat Kecamatan");
      console.error("INFO UMKM:", error);
    }
  }

  provinceEl.addEventListener("change", function () {
    loadRegencies(this.value);
  });

  regencyEl.addEventListener("change", function () {
    loadDistricts(this.value);
  });

  loadProvinces();
})();