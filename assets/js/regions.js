/* INFO UMKM - Filter Wilayah Indonesia
 * Province -> Kabupaten/Kota -> Kecamatan
 * Uses wilayah.id public API. No dependency on the demo card data.
 */
(function () {
  "use strict";

  const API = "https://wilayah.id/api";

  const provinceEl = document.getElementById("filterProvince");
  const regencyEl = document.getElementById("filterRegency");
  const districtEl = document.getElementById("filterDistrict");

  if (!provinceEl || !regencyEl || !districtEl) return;

  function setOptions(select, items, placeholder) {
    select.innerHTML = "";
    const first = document.createElement("option");
    first.value = "";
    first.textContent = placeholder;
    select.appendChild(first);

    items.forEach(item => {
      const option = document.createElement("option");
      option.value = item.code;
      option.textContent = item.name;
      select.appendChild(option);
    });
    select.disabled = false;
  }

  function loading(select, text) {
    select.innerHTML = `<option value="">${text}</option>`;
    select.disabled = true;
  }

  function errorOption(select, text) {
    select.innerHTML = `<option value="">${text}</option>`;
    select.disabled = true;
  }

  async function getJSON(url) {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Accept": "application/json" },
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    if (!json || !Array.isArray(json.data)) throw new Error("Format data wilayah tidak valid");
    return json.data;
  }

  async function loadProvinces() {
    loading(provinceEl, "Memuat Provinsi...");
    loading(regencyEl, "Pilih Provinsi terlebih dahulu");
    loading(districtEl, "Pilih Kabupaten/Kota terlebih dahulu");

    try {
      const data = await getJSON(`${API}/provinces.json`);
      setOptions(provinceEl, data, "Semua Provinsi");
    } catch (err) {
      errorOption(provinceEl, "Gagal memuat Provinsi");
      console.error("INFO UMKM wilayah:", err);
    }
  }

  async function loadRegencies(provinceCode) {
    loading(regencyEl, "Memuat Kabupaten/Kota...");
    loading(districtEl, "Pilih Kabupaten/Kota terlebih dahulu");

    if (!provinceCode) {
      loading(regencyEl, "Pilih Provinsi terlebih dahulu");
      return;
    }

    try {
      const data = await getJSON(`${API}/regencies/${provinceCode}.json`);
      setOptions(regencyEl, data, "Semua Kabupaten/Kota");
    } catch (err) {
      errorOption(regencyEl, "Gagal memuat Kabupaten/Kota");
      console.error("INFO UMKM wilayah:", err);
    }
  }

  async function loadDistricts(regencyCode) {
    loading(districtEl, "Memuat Kecamatan...");

    if (!regencyCode) {
      loading(districtEl, "Pilih Kabupaten/Kota terlebih dahulu");
      return;
    }

    try {
      const data = await getJSON(`${API}/districts/${regencyCode}.json`);
      setOptions(districtEl, data, "Semua Kecamatan");
    } catch (err) {
      errorOption(districtEl, "Gagal memuat Kecamatan");
      console.error("INFO UMKM wilayah:", err);
    }
  }

  provinceEl.addEventListener("change", function () {
    loadRegencies(this.value);
    if (typeof window.renderCards === "function") window.renderCards();
  });

  regencyEl.addEventListener("change", function () {
    loadDistricts(this.value);
    if (typeof window.renderCards === "function") window.renderCards();
  });

  districtEl.addEventListener("change", function () {
    if (typeof window.renderCards === "function") window.renderCards();
  });

  loadProvinces();
})();