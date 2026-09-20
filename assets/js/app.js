/* INFO UMKM — Direktori
 * Patch kecil: tampilkan UMKM dari Admin + pendaftaran langsung.
 * Data publik hanya menampilkan record yang sudah Approved.
 */
if (!window.demoUMKM) {
  window.demoUMKM = [
    {id:"DEMO-1",name:"Warung Makmur",cat:"Kuliner",loc:"Temanggung, Jawa Tengah",img:"https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",rating:"4.9",createdAt:"2026-01-01"},
    {id:"DEMO-2",name:"Batik Nusantara",cat:"Fashion",loc:"Sleman, DI Yogyakarta",img:"https://images.unsplash.com/photo-1583743814966-8936f37f1eab?auto=format&fit=crop&w=900&q=80",rating:"4.8",createdAt:"2026-01-02"},
    {id:"DEMO-3",name:"Tani Sejahtera",cat:"Pertanian",loc:"Bandung, Jawa Barat",img:"https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=900&q=80",rating:"4.9",createdAt:"2026-01-03"},
    {id:"DEMO-4",name:"Kerajinan Bambu",cat:"Kerajinan",loc:"Gianyar, Bali",img:"https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=900&q=80",rating:"4.7",createdAt:"2026-01-04"}
  ];
}

function readArray(key){
 try{
   const raw=JSON.parse(localStorage.getItem(key)||"[]");
   return Array.isArray(raw)?raw:[];
 }catch(e){
   console.error("Gagal membaca "+key,e);
   return [];
 }
}

function isApproved(u){
 const s=String(u&&u.status||"").trim().toLowerCase();
 return ["approved","approve","terverifikasi","verified","published","active"].includes(s);
}

function readApprovedUMKM(){
 const keys=["infoUmkmAdminData","infoUmkmRecords"];
 const result=[];
 const seen=new Set();
 keys.forEach(function(key){
   readArray(key).forEach(function(u,index){
     if(!isApproved(u)) return;
     const id=String(u.id||u.businessId||(key+"-"+index));
     const name=String(u.businessName||u.name||u.umkmName||"").trim();
     if(!name) return;
     const unique=id+"|"+name.toLowerCase();
     if(seen.has(unique)) return;
     seen.add(unique);
     const province=String(u.provinceName||u.province||"").trim();
     const city=String(u.regencyName||u.regency||u.city||"").trim();
     const district=String(u.districtName||u.district||"").trim();
     result.push({
       id:id,
       name:name,
       cat:String(u.category||u.cat||"Lainnya"),
       loc:[district,city,province].filter(Boolean).join(", ")||String(u.address||"Indonesia"),
       img:String(u.logo||u.image||u.photo||""),
       rating:String(u.rating||"5.0"),
       createdAt:String(u.createdAt||u.created_at||"")
     });
   });
 });
 return result;
}

function esc(v){
 return String(v==null?"":v)
   .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
   .replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}

function card(u){
 const inUmkmDir = location.pathname.indexOf("/umkm/") !== -1 || location.pathname.endsWith("/umkm");
 const defaultImg = inUmkmDir ? "../assets/img/logo.svg" : "assets/img/logo.svg";
 const img = (u.img && String(u.img).trim().length > 0) ? u.img : defaultImg;
 const detailHref = inUmkmDir ? `detail.html?id=${encodeURIComponent(u.id)}` : `umkm/detail.html?id=${encodeURIComponent(u.id)}`;
 return `<article class="card" id="card-${esc(u.id)}">
   <div class="card-img"><img src="${esc(img)}" alt="${esc(u.name)}" loading="lazy" onerror="this.onerror=null;this.src='${defaultImg}'"><span class="badge">✓ Terverifikasi</span></div>
   <div class="card-body"><h3>${esc(u.name)}</h3><p>${esc(u.cat)}</p><p>📍 ${esc(u.loc)}</p>
   <div class="stars">★★★★★ <span class="muted">${esc(u.rating||"5.0")}</span></div>
   <a class="btn btn-outline" href="${detailHref}">Lihat Detail</a></div>
 </article>`;
}

function skeletonCardsHTML(count = 4){
  return Array.from({length: count}).map(function(){
    return `<article class="card-skeleton" aria-hidden="true">
      <div class="skeleton-img skeleton-shimmer"></div>
      <div class="card-body">
        <div class="skeleton-title skeleton-shimmer"></div>
        <div class="skeleton-badge skeleton-shimmer"></div>
        <div class="skeleton-location skeleton-shimmer"></div>
        <div class="skeleton-rating skeleton-shimmer"></div>
        <div class="skeleton-btn skeleton-shimmer"></div>
      </div>
    </article>`;
  }).join("");
}

window.skeletonCardsHTML = skeletonCardsHTML;

function getAllUMKM(){
 const actual = readApprovedUMKM();
 return actual.concat(window.demoUMKM || []);
}

function applyDirectoryFilters(){
 const listEl = document.getElementById("listId");
 if(!listEl) return;

 const allItems = getAllUMKM();
 const searchInput = document.getElementById("filterSearch");
 const query = (searchInput ? searchInput.value : "").trim().toLowerCase();

 const catEl = document.getElementById("filterCategory");
 const selectedCat = (catEl && catEl.value && catEl.value !== "Semua Kategori") ? catEl.value.toLowerCase() : "";

 const provEl = document.getElementById("filterProvince");
 const provText = (provEl && provEl.value && provEl.selectedIndex > 0) ? (provEl.options[provEl.selectedIndex]?.text || "").toLowerCase() : "";

 const regEl = document.getElementById("filterRegency");
 const regText = (regEl && regEl.value && regEl.selectedIndex > 0) ? (regEl.options[regEl.selectedIndex]?.text || "").toLowerCase() : "";

 const distEl = document.getElementById("filterDistrict");
 const distText = (distEl && distEl.value && distEl.selectedIndex > 0) ? (distEl.options[distEl.selectedIndex]?.text || "").toLowerCase() : "";

 const sortEl = document.getElementById("filterSort") || document.querySelector(".resultsbar select");
 const sortVal = sortEl ? sortEl.value : "";

 let filtered = allItems.filter(function(u){
   // 1. Real-time name search (also matches products if defined)
   if(query){
     const nameMatch = (u.name || "").toLowerCase().includes(query);
     const prodMatch = (u.products || "").toLowerCase().includes(query);
     if(!nameMatch && !prodMatch) return false;
   }

   // 2. Category filter
   if(selectedCat){
     const catName = (u.cat || "").toLowerCase();
     if(!catName.includes(selectedCat) && !selectedCat.includes(catName)) return false;
   }

   // 3. Location / Province filter
   if(provText && !provText.includes("semua")){
     const loc = (u.loc || "").toLowerCase();
     const prov = (u.province || "").toLowerCase();
     if(!loc.includes(provText) && !prov.includes(provText)) return false;
   }

   // 4. Regency filter
   if(regText && !regText.includes("semua")){
     const loc = (u.loc || "").toLowerCase();
     const city = (u.city || "").toLowerCase();
     if(!loc.includes(regText) && !city.includes(regText)) return false;
   }

   // 5. District filter
   if(distText && !distText.includes("semua")){
     const loc = (u.loc || "").toLowerCase();
     const dist = (u.district || "").toLowerCase();
     if(!loc.includes(distText) && !dist.includes(distText)) return false;
   }

   return true;
 });

 // Sorting
 if(sortVal === "Terbaru" || sortVal === "terbaru"){
   filtered.sort(function(a, b){
     return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
   });
 } else {
   // Terpopuler / rating
   filtered.sort(function(a, b){
     return parseFloat(b.rating || 0) - parseFloat(a.rating || 0);
   });
 }

 // Render Results
 window.__lastFilteredUMKM = filtered;
 listEl.setAttribute("aria-busy", "false");
 if(filtered.length === 0){
   listEl.innerHTML = `
     <div id="noResultsState" class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 48px 24px; background: #ffffff; border: 1px dashed #cbd5e1; border-radius: 16px; margin: 12px 0;">
       <div style="font-size: 38px; line-height: 1; margin-bottom: 12px;">🔍</div>
       <h3 style="font-size: 18px; font-weight: 700; color: #1e293b; margin: 0 0 8px;">Tidak Ada UMKM Ditemukan</h3>
       <p class="muted" style="margin: 0 0 16px; font-size: 14px;">Tidak ditemukan usaha dengan nama atau kriteria "<strong>${esc(query || selectedCat || 'filter yang dipilih')}</strong>".</p>
       <button type="button" id="btnResetSearchInline" class="btn btn-outline" style="width: auto; padding: 8px 18px; font-size: 13px; display: inline-block;">Reset Pencarian</button>
     </div>
   `;
   const resetBtn = document.getElementById("btnResetSearchInline");
   if(resetBtn && searchInput){
     resetBtn.addEventListener("click", function(){
       searchInput.value = "";
       searchInput.focus();
       applyDirectoryFilters();
     });
   }
 } else {
   listEl.innerHTML = filtered.map(card).join("");
 }

 // Render Visual Map Representation
 renderDirectoryMapView(filtered, allItems);

 // Maintain current view mode visibility
 const mapContainer = document.getElementById("directoryMapView");
 if(directoryViewMode === "map"){
   listEl.style.display = "none";
   if(mapContainer){
     mapContainer.classList.add("active");
     mapContainer.style.display = "flex";
   }
 } else {
   if(mapContainer){
     mapContainer.classList.remove("active");
     mapContainer.style.display = "none";
   }
   listEl.style.display = "grid";
 }

 // Update counter
 const counter = document.getElementById("resultsCounter") || document.querySelector(".resultsbar b");
 if(counter){
   const viewLabel = directoryViewMode === "map" ? " (Mode Peta)" : "";
   if(query || selectedCat || provText){
     counter.textContent = `${filtered.length} dari ${allItems.length} UMKM ditemukan${viewLabel}`;
   } else {
     counter.textContent = `${filtered.length} UMKM ditemukan${viewLabel}`;
   }
 }
}

// Coordinate mapping for Indonesian regions (normalized X: 0-100%, Y: 0-100%)
const INDONESIA_COORDINATES = {
  "aceh": { x: 10.0, y: 22.0 },
  "sumatera utara": { x: 14.5, y: 30.0 },
  "sumatera barat": { x: 17.0, y: 46.0 },
  "riau": { x: 21.0, y: 38.0 },
  "kepulauan riau": { x: 25.0, y: 34.0 },
  "jambi": { x: 23.5, y: 50.0 },
  "sumatera selatan": { x: 26.5, y: 60.0 },
  "bengkulu": { x: 21.5, y: 60.0 },
  "lampung": { x: 28.5, y: 70.0 },
  "dki jakarta": { x: 33.5, y: 74.0 },
  "jakarta": { x: 33.5, y: 74.0 },
  "banten": { x: 31.0, y: 74.0 },
  "jawa barat": { x: 36.0, y: 76.5 },
  "jawa tengah": { x: 42.0, y: 77.0 },
  "di yogyakarta": { x: 42.8, y: 81.0 },
  "yogyakarta": { x: 42.8, y: 81.0 },
  "jawa timur": { x: 48.0, y: 79.0 },
  "bali": { x: 55.0, y: 82.0 },
  "nusa tenggara barat": { x: 60.0, y: 83.0 },
  "nusa tenggara timur": { x: 68.0, y: 85.0 },
  "kalimantan barat": { x: 36.0, y: 44.0 },
  "kalimantan tengah": { x: 44.0, y: 48.0 },
  "kalimantan selatan": { x: 48.0, y: 56.0 },
  "kalimantan timur": { x: 51.0, y: 38.0 },
  "kalimantan utara": { x: 50.0, y: 26.0 },
  "sulawesi utara": { x: 68.0, y: 26.0 },
  "gorontalo": { x: 64.0, y: 30.0 },
  "sulawesi tengah": { x: 60.0, y: 42.0 },
  "sulawesi barat": { x: 57.5, y: 48.0 },
  "sulawesi selatan": { x: 58.5, y: 62.0 },
  "sulawesi tenggara": { x: 65.0, y: 58.0 },
  "maluku": { x: 77.0, y: 54.0 },
  "maluku utara": { x: 75.0, y: 33.0 },
  "papua": { x: 92.0, y: 46.0 },
  "papua barat": { x: 84.0, y: 38.0 },
  "papua barat daya": { x: 81.0, y: 35.0 },
  "papua selatan": { x: 93.0, y: 72.0 },
  "papua tengah": { x: 87.0, y: 50.0 },
  "papua pegunungan": { x: 90.0, y: 53.0 },

  // Regencies & Major Cities
  "temanggung": { x: 41.5, y: 76.5 },
  "sleman": { x: 42.8, y: 80.5 },
  "bandung": { x: 36.2, y: 76.5 },
  "gianyar": { x: 55.2, y: 81.8 },
  "denpasar": { x: 54.5, y: 82.2 },
  "surabaya": { x: 48.5, y: 78.2 },
  "semarang": { x: 42.2, y: 75.8 },
  "solo": { x: 43.2, y: 78.5 },
  "surakarta": { x: 43.2, y: 78.5 },
  "medan": { x: 14.2, y: 27.5 },
  "padang": { x: 17.2, y: 46.2 },
  "palembang": { x: 26.5, y: 59.5 },
  "makassar": { x: 58.2, y: 62.5 },
  "balikpapan": { x: 50.8, y: 42.2 },
  "samarinda": { x: 51.5, y: 39.5 },
  "pontianak": { x: 34.8, y: 44.5 },
  "manado": { x: 68.2, y: 25.5 },
  "ambon": { x: 77.2, y: 54.8 },
  "jayapura": { x: 93.5, y: 44.8 }
};

function getUMKMCoordinates(u){
  const text = `${u.city || ""} ${u.district || ""} ${u.loc || ""} ${u.province || ""}`.toLowerCase();
  let baseCoord = null;

  for(const [key, coord] of Object.entries(INDONESIA_COORDINATES)){
    if(text.includes(key)){
      baseCoord = coord;
      break;
    }
  }

  if(!baseCoord){
    baseCoord = { x: 42.0, y: 77.0 };
  }

  let hash = 0;
  const idStr = String(u.id || "0");
  for(let i = 0; i < idStr.length; i++){
    hash = (hash * 31 + idStr.charCodeAt(i)) % 1000;
  }
  const jitterX = ((hash % 11) - 5) * 0.4;
  const jitterY = (((Math.floor(hash / 11)) % 11) - 5) * 0.35;

  const finalX = Math.max(7, Math.min(94, baseCoord.x + jitterX));
  const finalY = Math.max(14, Math.min(86, baseCoord.y + jitterY));

  return { x: finalX, y: finalY };
}

function getCategoryMeta(cat){
  const c = String(cat || "").toLowerCase();
  if(c.includes("kuliner") || c.includes("makanan") || c.includes("minuman")){
    return { cls: "pin-cat-kuliner", icon: "🍜", color: "#ea580c", label: "Kuliner" };
  }
  if(c.includes("fashion") || c.includes("pakaian") || c.includes("batik")){
    return { cls: "pin-cat-fashion", icon: "👗", color: "#7c3aed", label: "Fashion" };
  }
  if(c.includes("tani") || c.includes("pertanian")){
    return { cls: "pin-cat-pertanian", icon: "🌱", color: "#059669", label: "Pertanian" };
  }
  if(c.includes("kebun") || c.includes("perkebunan") || c.includes("kopi")){
    return { cls: "pin-cat-perkebunan", icon: "☕", color: "#d97706", label: "Perkebunan" };
  }
  if(c.includes("rajin") || c.includes("kerajinan") || c.includes("kriya")){
    return { cls: "pin-cat-kerajinan", icon: "🧺", color: "#2563eb", label: "Kerajinan" };
  }
  if(c.includes("jasa") || c.includes("layanan")){
    return { cls: "pin-cat-jasa", icon: "🛠️", color: "#0284c7", label: "Jasa" };
  }
  return { cls: "pin-cat-lainnya", icon: "🏪", color: "#475569", label: cat || "Lainnya" };
}

let directoryViewMode = "grid";

function setDirectoryViewMode(mode){
  directoryViewMode = mode;
  const gridBtn = document.getElementById("btnViewGrid");
  const mapBtn = document.getElementById("btnViewMap");
  const listEl = document.getElementById("listId");
  const mapContainer = document.getElementById("directoryMapView");
  const counter = document.getElementById("resultsCounter") || document.querySelector(".resultsbar b");

  if(gridBtn && mapBtn){
    if(mode === "map"){
      gridBtn.classList.remove("active");
      gridBtn.setAttribute("aria-pressed", "false");
      mapBtn.classList.add("active");
      mapBtn.setAttribute("aria-pressed", "true");

      if(listEl) listEl.style.display = "none";
      if(mapContainer){
        mapContainer.classList.add("active");
        mapContainer.style.display = "flex";
        renderDirectoryMapView(window.__lastFilteredUMKM || getAllUMKM(), getAllUMKM());
      }
    } else {
      mapBtn.classList.remove("active");
      mapBtn.setAttribute("aria-pressed", "false");
      gridBtn.classList.add("active");
      gridBtn.setAttribute("aria-pressed", "true");

      if(mapContainer){
        mapContainer.classList.remove("active");
        mapContainer.style.display = "none";
      }
      if(listEl) listEl.style.display = "grid";
    }
  }

  if(counter && window.__lastFilteredUMKM){
    const filtered = window.__lastFilteredUMKM;
    const allItems = getAllUMKM();
    const searchInput = document.getElementById("filterSearch");
    const query = (searchInput ? searchInput.value : "").trim();
    const viewLabel = mode === "map" ? " (Mode Peta)" : "";

    if(query){
      counter.textContent = `${filtered.length} dari ${allItems.length} UMKM ditemukan${viewLabel}`;
    } else {
      counter.textContent = `${filtered.length} UMKM ditemukan${viewLabel}`;
    }
  }
}

function renderDirectoryMapView(filtered, allItems){
  const mapContainer = document.getElementById("directoryMapView");
  if(!mapContainer) return;

  const inUmkmDir = location.pathname.indexOf("/umkm/") !== -1 || location.pathname.endsWith("/umkm");
  const defaultImg = inUmkmDir ? "../assets/img/logo.svg" : "assets/img/logo.svg";

  if(filtered.length === 0){
    mapContainer.innerHTML = `
      <div id="noMapResultsState" class="empty-state" style="text-align:center; padding:54px 24px; background:#ffffff; border:1px dashed #cbd5e1; border-radius:18px; margin:8px 0;">
        <div style="font-size:42px; line-height:1; margin-bottom:12px;">🗺️</div>
        <h3 style="font-size:18px; font-weight:700; color:#1e293b; margin:0 0 8px;">Tidak Ada Titik UMKM yang Sesuai</h3>
        <p class="muted" style="margin:0 0 16px; font-size:14px;">Tidak ditemukan lokasi usaha yang cocok dengan kriteria filter saat ini.</p>
        <button type="button" id="btnResetMapSearch" class="btn btn-outline" style="width:auto; padding:8px 18px; font-size:13px; display:inline-block;">Reset Filter</button>
      </div>
    `;
    const resetMapBtn = document.getElementById("btnResetMapSearch");
    if(resetMapBtn){
      resetMapBtn.addEventListener("click", function(){
        const searchInput = document.getElementById("filterSearch");
        if(searchInput) searchInput.value = "";
        const catEl = document.getElementById("filterCategory");
        if(catEl) catEl.selectedIndex = 0;
        const provEl = document.getElementById("filterProvince");
        if(provEl) provEl.selectedIndex = 0;
        applyDirectoryFilters();
      });
    }
    return;
  }

  // Regional Sentra / Potensi Placeholder Hubs
  const PLACEHOLDER_MAP_HUBS = [
    {
      id: "hub-sumut",
      name: "Sentra Kopi & Tenun Deli",
      shortName: "Hub Deli",
      region: "Sumatera Utara",
      icon: "☕",
      x: 14.8,
      y: 28.5,
      highlight: "Pusat ekspor kopi arabika gayo-sidikalang & kerajinan tenun ulos khas Nusantara.",
      targetProvince: "Sumatera Utara"
    },
    {
      id: "hub-jabar",
      name: "Klaster Tekstil & Kreatif Bandung",
      shortName: "Hub Priangan",
      region: "Jawa Barat",
      icon: "👗",
      x: 35.8,
      y: 75.8,
      highlight: "Sentra garmen rajut, fesyen modern berkelanjutan, dan aksesoris kreatif lokal.",
      targetProvince: "Jawa Barat"
    },
    {
      id: "hub-jogja",
      name: "Sentra Kriya & Batik Budaya Jogja",
      shortName: "Hub Mataram",
      region: "DI Yogyakarta",
      icon: "🎨",
      x: 43.2,
      y: 80.2,
      highlight: "Klaster kerajinan perak Kotagede, gerabah Kasongan, dan batik tulis legendaris.",
      targetProvince: "DI Yogyakarta"
    },
    {
      id: "hub-bali",
      name: "Klaster Kriya & Seni Budaya Ubud",
      shortName: "Hub Gianyar",
      region: "Bali",
      icon: "🧺",
      x: 55.4,
      y: 81.6,
      highlight: "Pusat ukiran kayu estetik, kriya bambu ramah lingkungan, dan komoditas vanili Bali.",
      targetProvince: "Bali"
    },
    {
      id: "hub-sulsel",
      name: "Sentra Bahari & Tenun Sutera",
      shortName: "Hub Sulawesi",
      region: "Sulawesi Selatan",
      icon: "🐟",
      x: 58.4,
      y: 61.8,
      highlight: "Klaster produk olahan hasil laut, bumbu rempah tradisional, dan tenun sutera Wajo.",
      targetProvince: "Sulawesi Selatan"
    },
    {
      id: "hub-papua",
      name: "Sentra Noken & Kakao Lestari",
      shortName: "Hub Papua",
      region: "Papua",
      icon: "🌿",
      x: 88.5,
      y: 38.5,
      highlight: "Klaster warisan anyaman noken Papua berstandar UNESCO dan perkebunan kakao alam.",
      targetProvince: "Papua"
    }
  ];

  // Business Sector definitions for floating legend box
  const SECTORS = [
    { name: "Kuliner", icon: "🍜", color: "#ea580c" },
    { name: "Fashion", icon: "👗", color: "#7c3aed" },
    { name: "Pertanian", icon: "🌱", color: "#059669" },
    { name: "Perkebunan", icon: "☕", color: "#d97706" },
    { name: "Kerajinan", icon: "🧺", color: "#2563eb" },
    { name: "Jasa", icon: "🛠️", color: "#0284c7" }
  ];

  // Detect active category filter to synchronize with floating legend
  const catFilterSelect = document.getElementById("filterCategory");
  const activeCatVal = (catFilterSelect ? catFilterSelect.value : "").trim();
  const isFilteredBySector = activeCatVal && activeCatVal !== "Semua Kategori";

  // Build sector items for floating legend box
  const sectorItemsHTML = SECTORS.map(function(sec){
    const count = filtered.filter(function(u){
      const meta = getCategoryMeta(u.cat);
      return meta.label.toLowerCase() === sec.name.toLowerCase();
    }).length;
    const isSelected = isFilteredBySector && activeCatVal.toLowerCase().includes(sec.name.toLowerCase());
    return `
      <button type="button" class="map-floating-legend-item ${isSelected ? 'active' : ''}" data-sector="${esc(sec.name)}" id="legend-sec-${esc(sec.name.toLowerCase())}" aria-pressed="${isSelected}">
        <div class="map-floating-legend-left">
          <span class="map-floating-legend-dot" style="background:${sec.color}"></span>
          <span>${sec.icon} ${esc(sec.name)}</span>
        </div>
        <span class="map-floating-legend-count">${count}</span>
      </button>
    `;
  }).join("");

  // Floating Legend Box categorizing map pins by UMKM business sector
  const floatingLegendHTML = `
    <div class="map-floating-legend-box" id="directoryMapFloatingLegend" role="region" aria-label="Legenda Sektor Bisnis UMKM">
      <div class="map-floating-legend-header">
        <div class="map-floating-legend-title">
          <span>🏷️ Sektor Bisnis</span>
        </div>
        <button type="button" class="map-floating-legend-toggle" id="btnToggleMapLegend" aria-label="Sembunyikan atau tampilkan legenda sektor" title="Kecilkan/Besarkan">
          <span id="legendToggleIcon">−</span>
        </button>
      </div>
      <div class="map-floating-legend-body" id="mapFloatingLegendBody">
        <button type="button" class="map-floating-legend-item ${!isFilteredBySector ? 'active' : ''}" data-sector="" id="legend-sec-all" aria-pressed="${!isFilteredBySector}">
          <div class="map-floating-legend-left">
            <span class="map-floating-legend-dot" style="background:var(--blue)"></span>
            <span>Semua Sektor</span>
          </div>
          <span class="map-floating-legend-count">${filtered.length}</span>
        </button>
        ${sectorItemsHTML}
      </div>
    </div>
  `;

  // Map pins with hover tooltip preview cards containing business name and rating
  const pinsHTML = filtered.map(function(u){
    const coords = getUMKMCoordinates(u);
    const meta = getCategoryMeta(u.cat);
    return `
      <div class="map-umkm-pin ${meta.cls}" id="pin-${esc(u.id)}" style="left:${coords.x.toFixed(1)}%; top:${coords.y.toFixed(1)}%;" tabindex="0" role="button" aria-label="${esc(u.name)} (${esc(u.cat)})" data-id="${esc(u.id)}">
        <div class="map-pin-body">
          <div class="map-pin-head">
            <span class="map-pin-icon">${meta.icon}</span>
          </div>
          <div class="map-pin-pulse"></div>
        </div>
        <!-- Hover Preview Tooltip Card -->
        <div class="map-pin-tooltip" role="tooltip" aria-hidden="true">
          <div class="map-tooltip-top">
            <span class="map-tooltip-badge" style="background:${meta.color}18; color:${meta.color}">${meta.icon} ${esc(meta.label)}</span>
            <span class="map-tooltip-rating">★ ${esc(u.rating || "5.0")}</span>
          </div>
          <div class="map-tooltip-name">${esc(u.name)}</div>
          <div class="map-tooltip-loc">📍 ${esc(u.loc)}</div>
        </div>
      </div>
    `;
  }).join("");

  // Interactive placeholder map markers that animate when the map container is active
  const placeholdersHTML = PLACEHOLDER_MAP_HUBS.map(function(hub){
    return `
      <div class="map-placeholder-marker" id="marker-${hub.id}" data-hub-id="${hub.id}" style="left:${hub.x}%; top:${hub.y}%;" tabindex="0" role="button" aria-label="Sentra Potensi: ${esc(hub.name)} (${esc(hub.region)})" title="Sentra Potensi: ${esc(hub.name)}">
        <div class="map-placeholder-radar-wrapper">
          <div class="map-placeholder-radar"></div>
          <div class="map-placeholder-radar"></div>
          <div class="map-placeholder-core">
            <span>${hub.icon}</span>
          </div>
        </div>
        <span class="map-placeholder-tag">${esc(hub.shortName)}</span>
      </div>
    `;
  }).join("");

  const trayCardsHTML = filtered.map(function(u){
    const meta = getCategoryMeta(u.cat);
    return `
      <div class="map-location-card" id="tray-card-${esc(u.id)}" data-id="${esc(u.id)}" role="button" tabindex="0">
        <div class="map-location-card-icon" style="background:${meta.color}15; color:${meta.color}">
          ${meta.icon}
        </div>
        <div class="map-location-card-info">
          <div class="map-location-card-name">${esc(u.name)}</div>
          <div class="map-location-card-sub">📍 ${esc(u.loc)} • ★ ${esc(u.rating || "5.0")}</div>
        </div>
      </div>
    `;
  }).join("");

  mapContainer.innerHTML = `
    <div class="directory-map-header">
      <div>
        <h3>🗺️ Peta Sebaran UMKM Terpilih</h3>
        <p>Menampilkan ${filtered.length} titik usaha lokal terverifikasi di seluruh wilayah nusantara. Arahkan kursor ke pin untuk melihat cuplikan usaha.</p>
      </div>
    </div>
    <div class="directory-map-stage" id="directoryMapStage">
      <!-- Floating Legend Box Categorizing Pins by Sector -->
      ${floatingLegendHTML}
      <svg class="directory-map-svg" viewBox="0 0 1000 480" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <linearGradient id="indonesiaLandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#b6daf5"/>
            <stop offset="100%" stop-color="#9fc8ed"/>
          </linearGradient>
          <filter id="islandShadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#0f2b48" flood-opacity="0.12"/>
          </filter>
        </defs>

        <g stroke="#97c5e8" stroke-width="0.75" stroke-dasharray="3 6" opacity="0.4">
          <line x1="50" y1="120" x2="950" y2="120"/>
          <line x1="50" y1="240" x2="950" y2="240"/>
          <line x1="50" y1="360" x2="950" y2="360"/>
          <line x1="250" y1="50" x2="250" y2="430"/>
          <line x1="500" y1="50" x2="500" y2="430"/>
          <line x1="750" y1="50" x2="750" y2="430"/>
        </g>

        <g filter="url(#islandShadow)" fill="url(#indonesiaLandGrad)" stroke="#74b0dc" stroke-width="1.8">
          <!-- Sumatera -->
          <path d="M 90 90 C 105 75, 125 90, 140 115 C 160 145, 180 190, 200 220 C 220 250, 250 280, 285 325 C 295 340, 280 345, 270 340 C 240 310, 215 270, 190 230 C 165 190, 130 150, 95 110 Z" />
          
          <!-- Jawa & Madura -->
          <path d="M 310 365 C 340 360, 390 365, 430 368 C 470 372, 500 375, 520 385 C 510 395, 460 392, 420 390 C 370 388, 330 385, 305 375 Z" />
          <path d="M 470 358 C 495 355, 515 362, 505 368 C 485 368, 470 365, 470 358 Z" />

          <!-- Bali, NTB, NTT -->
          <path d="M 535 388 C 545 385, 555 388, 550 396 C 540 396, 532 392, 535 388 Z" />
          <path d="M 565 390 C 585 388, 595 394, 580 400 C 565 398, 560 393, 565 390 Z" />
          <path d="M 605 392 C 635 388, 650 398, 625 404 C 605 402, 600 396, 605 392 Z" />
          <path d="M 660 395 C 695 392, 715 400, 690 408 C 665 408, 655 400, 660 395 Z" />

          <!-- Kalimantan -->
          <path d="M 350 170 C 380 130, 440 120, 480 140 C 520 160, 535 210, 520 250 C 500 280, 460 285, 430 270 C 390 285, 360 260, 350 220 Z" />

          <!-- Sulawesi -->
          <path d="M 600 140 C 620 135, 680 115, 685 130 C 670 145, 630 155, 615 180 C 640 190, 675 220, 660 240 C 635 235, 620 210, 605 210 C 600 240, 640 275, 635 295 C 615 300, 595 260, 590 230 C 585 270, 575 305, 565 300 C 565 260, 578 220, 585 190 C 570 180, 580 150, 600 140 Z" />

          <!-- Maluku -->
          <path d="M 730 140 C 750 130, 755 170, 740 190 C 730 170, 725 150, 730 140 Z" />
          <path d="M 740 230 C 770 235, 785 250, 760 260 C 740 255, 735 240, 740 230 Z" />
          <path d="M 745 270 C 765 275, 760 290, 740 288 C 735 280, 740 272, 745 270 Z" />

          <!-- Papua -->
          <path d="M 800 160 C 825 150, 840 175, 830 195 C 820 185, 805 180, 800 160 Z" />
          <path d="M 835 195 C 880 185, 945 200, 965 230 C 975 280, 960 340, 940 370 C 915 365, 895 330, 875 300 C 850 280, 835 240, 835 195 Z" />
        </g>

        <g fill="#5f8fae" font-size="11" font-weight="700" letter-spacing="1.5" opacity="0.75">
          <text x="175" y="225">SUMATERA</text>
          <text x="410" y="200">KALIMANTAN</text>
          <text x="390" y="415">JAWA</text>
          <text x="610" y="240">SULAWESI</text>
          <text x="545" y="415">BALI &amp; NT</text>
          <text x="880" y="270">PAPUA</text>
        </g>
      </svg>

      <div class="directory-map-compass" title="Orientasi Peta: Utara">U ↑</div>
      <div class="directory-map-watermark">Peta Sebaran Wilayah Indonesia • INFO UMKM</div>

      <!-- Animated Interactive Placeholder Markers -->
      <div class="directory-map-placeholders" id="directoryMapPlaceholders">
        ${placeholdersHTML}
      </div>

      <div class="directory-map-pins" id="directoryMapPins">
        ${pinsHTML}
      </div>

      <div id="mapPopupContainer" style="display:none;"></div>
    </div>

    <div class="map-locations-tray">
      <div class="map-locations-tray-header">
        <strong>Daftar Lokasi Terpilih (${filtered.length} UMKM)</strong>
        <span class="muted" style="font-size:12px">Klik kartu untuk melihat detail di peta</span>
      </div>
      <div class="map-locations-grid">
        ${trayCardsHTML}
      </div>
    </div>
  `;

  const stage = document.getElementById("directoryMapStage");
  const popupContainer = document.getElementById("mapPopupContainer");

  // Toggle Collapse on Floating Legend Box
  const btnToggleLegend = document.getElementById("btnToggleMapLegend");
  const legendBox = document.getElementById("directoryMapFloatingLegend");
  const legendIcon = document.getElementById("legendToggleIcon");
  if(btnToggleLegend && legendBox){
    btnToggleLegend.addEventListener("click", function(e){
      e.stopPropagation();
      legendBox.classList.toggle("collapsed");
      if(legendIcon){
        legendIcon.textContent = legendBox.classList.contains("collapsed") ? "+" : "−";
      }
    });
  }

  // Handle Sector Filter Click from Floating Legend Box
  if(stage){
    stage.querySelectorAll(".map-floating-legend-item").forEach(function(btn){
      btn.addEventListener("click", function(e){
        e.stopPropagation();
        const sector = btn.getAttribute("data-sector") || "";
        const catSelect = document.getElementById("filterCategory");
        if(catSelect){
          if(!sector){
            catSelect.selectedIndex = 0;
          } else {
            let matched = false;
            for(let i = 0; i < catSelect.options.length; i++){
              if(catSelect.options[i].text.toLowerCase().includes(sector.toLowerCase())){
                catSelect.selectedIndex = i;
                matched = true;
                break;
              }
            }
            if(!matched){
              catSelect.value = sector;
            }
          }
          applyDirectoryFilters();
        }
      });
    });
  }

  function openPopupForUMKM(umkmId){
    const u = filtered.find(item => String(item.id) === String(umkmId));
    if(!u || !popupContainer || !stage) return;

    stage.querySelectorAll(".map-umkm-pin").forEach(p => p.classList.remove("focused"));
    mapContainer.querySelectorAll(".map-location-card").forEach(c => c.classList.remove("active"));

    const pinEl = document.getElementById(`pin-${u.id}`);
    const cardEl = document.getElementById(`tray-card-${u.id}`);
    if(pinEl) pinEl.classList.add("focused");
    if(cardEl) {
      cardEl.classList.add("active");
      cardEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }

    const meta = getCategoryMeta(u.cat);
    const coords = getUMKMCoordinates(u);
    const detailHref = inUmkmDir ? `detail.html?id=${encodeURIComponent(u.id)}` : `umkm/detail.html?id=${encodeURIComponent(u.id)}`;
    const img = (u.img && String(u.img).trim().length > 0) ? u.img : defaultImg;

    const popX = Math.max(16, Math.min(84, coords.x));
    const popY = Math.max(24, coords.y);

    popupContainer.innerHTML = `
      <div class="map-pin-popup" id="activeMapPopup" style="left:${popX}%; top:${popY - 14}%; bottom:auto;" role="dialog" aria-modal="false">
        <div class="map-popup-header">
          <span class="map-popup-badge" style="background:${meta.color}15; color:${meta.color}">✓ ${esc(meta.label)}</span>
          <button type="button" class="map-popup-close" id="btnCloseMapPopup" aria-label="Tutup info">✕</button>
        </div>
        <div style="display:flex;gap:10px;align-items:center;margin-bottom:8px">
          <img src="${esc(img)}" alt="${esc(u.name)}" style="width:44px;height:44px;border-radius:8px;object-fit:cover;border:1px solid #e2e8f0;" onerror="this.onerror=null;this.src='${defaultImg}'">
          <div style="min-width:0;flex:1">
            <h4 class="map-popup-title">${esc(u.name)}</h4>
            <div class="stars" style="font-size:11px;margin:0;padding:0">★★★★★ <span class="muted">${esc(u.rating || "5.0")}</span></div>
          </div>
        </div>
        <div class="map-popup-meta">📍 ${esc(u.loc)}</div>
        <a class="btn btn-primary map-popup-btn" href="${detailHref}">Lihat Detail Lengkap →</a>
      </div>
    `;
    popupContainer.style.display = "block";

    const closeBtn = document.getElementById("btnCloseMapPopup");
    if(closeBtn){
      closeBtn.addEventListener("click", function(e){
        e.stopPropagation();
        closePopup();
      });
    }
  }

  function closePopup(){
    if(!popupContainer || !stage) return;
    popupContainer.style.display = "none";
    popupContainer.innerHTML = "";
    stage.querySelectorAll(".map-umkm-pin").forEach(p => p.classList.remove("focused"));
    mapContainer.querySelectorAll(".map-location-card").forEach(c => c.classList.remove("active"));
  }

  // Interactive placeholder markers click handler
  stage.querySelectorAll(".map-placeholder-marker").forEach(function(marker){
    marker.addEventListener("click", function(e){
      e.stopPropagation();
      const hubId = marker.getAttribute("data-hub-id");
      const hub = PLACEHOLDER_MAP_HUBS.find(h => h.id === hubId);
      if(!hub || !popupContainer) return;

      stage.querySelectorAll(".map-umkm-pin").forEach(p => p.classList.remove("focused"));
      mapContainer.querySelectorAll(".map-location-card").forEach(c => c.classList.remove("active"));

      const popX = Math.max(16, Math.min(84, hub.x));
      const popY = Math.max(24, hub.y);

      popupContainer.innerHTML = `
        <div class="map-pin-popup" id="activeMapPopup" style="left:${popX}%; top:${popY - 14}%; bottom:auto;" role="dialog" aria-modal="false">
          <div class="map-popup-header">
            <span class="map-popup-badge" style="background:#e0f2fe; color:#0284c7;">✨ Sentra Potensi UMKM</span>
            <button type="button" class="map-popup-close" id="btnCloseMapPopup" aria-label="Tutup info">✕</button>
          </div>
          <div style="display:flex;gap:10px;align-items:center;margin-bottom:8px">
            <div style="width:40px;height:40px;border-radius:10px;background:#e0f2fe;display:flex;align-items:center;justify-content:center;font-size:20px;border:1px solid #bae6fd;flex-shrink:0">
              ${hub.icon}
            </div>
            <div style="min-width:0;flex:1">
              <h4 class="map-popup-title">${esc(hub.name)}</h4>
              <div class="muted" style="font-size:11px">📍 Wilayah: <strong>${esc(hub.region)}</strong></div>
            </div>
          </div>
          <p style="font-size:12px;color:var(--ink);margin:4px 0 10px;line-height:1.4">${esc(hub.highlight)}</p>
          <button type="button" class="btn btn-primary map-popup-btn" id="btnFilterByHub" data-prov="${esc(hub.targetProvince)}">
            🔍 Cari UMKM di ${esc(hub.targetProvince)}
          </button>
        </div>
      `;
      popupContainer.style.display = "block";

      const closeBtn = document.getElementById("btnCloseMapPopup");
      if(closeBtn){
        closeBtn.addEventListener("click", function(ev){
          ev.stopPropagation();
          closePopup();
        });
      }

      const hubFilterBtn = document.getElementById("btnFilterByHub");
      if(hubFilterBtn){
        hubFilterBtn.addEventListener("click", function(ev){
          ev.stopPropagation();
          const prov = hubFilterBtn.getAttribute("data-prov");
          const provSelect = document.getElementById("filterProvince");
          if(provSelect){
            let found = false;
            for(let i = 0; i < provSelect.options.length; i++){
              if(provSelect.options[i].text.toLowerCase().includes(prov.toLowerCase())){
                provSelect.selectedIndex = i;
                found = true;
                break;
              }
            }
            if(!found){
              const searchInput = document.getElementById("filterSearch");
              if(searchInput) searchInput.value = prov;
            }
          }
          applyDirectoryFilters();
        });
      }
    });

    marker.addEventListener("keydown", function(e){
      if(e.key === "Enter" || e.key === " "){
        e.preventDefault();
        marker.click();
      }
    });
  });

  stage.querySelectorAll(".map-umkm-pin").forEach(function(pin){
    pin.addEventListener("click", function(e){
      e.stopPropagation();
      const id = pin.getAttribute("data-id");
      openPopupForUMKM(id);
    });
    pin.addEventListener("keydown", function(e){
      if(e.key === "Enter" || e.key === " "){
        e.preventDefault();
        const id = pin.getAttribute("data-id");
        openPopupForUMKM(id);
      }
    });
  });

  mapContainer.querySelectorAll(".map-location-card").forEach(function(card){
    card.addEventListener("click", function(){
      const id = card.getAttribute("data-id");
      openPopupForUMKM(id);
      stage.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });

  stage.addEventListener("click", function(e){
    if(!e.target.closest(".map-umkm-pin") && !e.target.closest(".map-placeholder-marker") && !e.target.closest("#activeMapPopup") && !e.target.closest("#directoryMapFloatingLegend")){
      closePopup();
    }
  });
}

window.applyDirectoryFilters = applyDirectoryFilters;

function renderCards(id="listId"){
 applyDirectoryFilters();
}

function initUMKMApp(){
 const searchInput = document.getElementById("filterSearch");
 const catEl = document.getElementById("filterCategory");
 const provEl = document.getElementById("filterProvince");
 const regEl = document.getElementById("filterRegency");
 const distEl = document.getElementById("filterDistrict");
 const sortEl = document.getElementById("filterSort") || document.querySelector(".resultsbar select");
 const applyBtn = document.getElementById("btnApplyFilter");
 const resetBtn = document.getElementById("btnResetFilter");

 // 1. URL search parameter prefill (e.g. ?q=Warung or ?search=Batik)
 const urlParams = new URLSearchParams(window.location.search);
 const initialQuery = urlParams.get("q") || urlParams.get("search");
 if(initialQuery && searchInput){
   searchInput.value = initialQuery;
 }

 // 2. Real-time filtering listeners as the user types
 if(searchInput){
   searchInput.addEventListener("input", applyDirectoryFilters);
   searchInput.addEventListener("search", applyDirectoryFilters); // Fires when native clear (x) button is clicked
   searchInput.addEventListener("keyup", applyDirectoryFilters);
   searchInput.addEventListener("paste", function(){
     setTimeout(applyDirectoryFilters, 20);
   });
 }

 // 3. Filter dropdown listeners
 if(catEl) catEl.addEventListener("change", applyDirectoryFilters);
 if(sortEl) sortEl.addEventListener("change", applyDirectoryFilters);
 if(provEl) provEl.addEventListener("change", function(){ setTimeout(applyDirectoryFilters, 50); });
 if(regEl) regEl.addEventListener("change", function(){ setTimeout(applyDirectoryFilters, 50); });
 if(distEl) distEl.addEventListener("change", function(){ setTimeout(applyDirectoryFilters, 50); });

 if(applyBtn){
   applyBtn.addEventListener("click", function(e){
     e.preventDefault();
     applyDirectoryFilters();
   });
 }

 if(resetBtn){
   resetBtn.addEventListener("click", function(e){
     e.preventDefault();
     if(searchInput) searchInput.value = "";
     if(catEl) catEl.selectedIndex = 0;
     if(provEl) provEl.selectedIndex = 0;
     if(regEl){ regEl.selectedIndex = 0; regEl.disabled = true; }
     if(distEl){ distEl.selectedIndex = 0; distEl.disabled = true; }
     if(sortEl) sortEl.selectedIndex = 0;
     applyDirectoryFilters();
     if(searchInput) searchInput.focus();
   });
 }

 // View Toggle: Grid vs Visual Map
 const btnViewGrid = document.getElementById("btnViewGrid");
 const btnViewMap = document.getElementById("btnViewMap");
 if(btnViewGrid && btnViewMap){
   btnViewGrid.addEventListener("click", function(e){
     e.preventDefault();
     setDirectoryViewMode("grid");
   });
   btnViewMap.addEventListener("click", function(e){
     e.preventDefault();
     setDirectoryViewMode("map");
   });
 }

 // Initial render
 applyDirectoryFilters();

 const y = document.getElementById("year");
 if(y) y.textContent = new Date().getFullYear();

 document.querySelectorAll("[data-demo-alert]").forEach(function(b){
   b.addEventListener("click",function(e){e.preventDefault();alert("Fitur ini tersedia pada tahap backend/production.");});
 });

 // Dynamic UI: Header scroll elevation & Floating Scroll-To-Top
 const header = document.querySelector("header");
 let scrollTopBtn = document.getElementById("btnScrollTop");
 if(!scrollTopBtn && !document.querySelector('.admin-shell')){
   scrollTopBtn = document.createElement("button");
   scrollTopBtn.id = "btnScrollTop";
   scrollTopBtn.type = "button";
   scrollTopBtn.setAttribute("aria-label", "Kembali ke atas");
   scrollTopBtn.innerHTML = "↑";
   document.body.appendChild(scrollTopBtn);
   scrollTopBtn.addEventListener("click", function(){
     window.scrollTo({ top: 0, behavior: "smooth" });
   });
 }

 window.addEventListener("scroll", function(){
   const top = window.scrollY || document.documentElement.scrollTop;
   if(header){
     if(top > 20){
       header.classList.add("scrolled");
     } else {
       header.classList.remove("scrolled");
     }
   }
   if(scrollTopBtn){
     if(top > 320){
       scrollTopBtn.classList.add("visible");
     } else {
       scrollTopBtn.classList.remove("visible");
     }
   }
 }, { passive: true });

 // Dynamic UI: Mobile Navigation Drawer
 const mobileToggle = document.querySelector(".mobile");
 if(mobileToggle && !document.getElementById("mobileNavDrawer")){
   const navLinksContainer = document.querySelector(".navlinks");
   const backdrop = document.createElement("div");
   backdrop.id = "mobileNavBackdrop";
   backdrop.className = "mobile-nav-backdrop";

   const drawer = document.createElement("div");
   drawer.id = "mobileNavDrawer";
   drawer.className = "mobile-nav-drawer";
   drawer.innerHTML = `
     <div class="mobile-nav-header">
       <strong>Menu Navigasi</strong>
       <button type="button" class="mobile-nav-close" id="btnCloseMobileNav" aria-label="Tutup menu">✕</button>
     </div>
     <nav class="mobile-nav-links" id="mobileNavLinks"></nav>
   `;

   document.body.appendChild(backdrop);
   document.body.appendChild(drawer);

   const mobileLinks = drawer.querySelector("#mobileNavLinks");
   if(navLinksContainer && mobileLinks){
     Array.from(navLinksContainer.children).forEach(function(item){
       const clone = item.cloneNode(true);
       mobileLinks.appendChild(clone);
     });
   }

   function openMobileMenu(){
     backdrop.classList.add("open");
     drawer.classList.add("open");
     document.body.style.overflow = "hidden";
   }

   function closeMobileMenu(){
     backdrop.classList.remove("open");
     drawer.classList.remove("open");
     document.body.style.overflow = "";
   }

   mobileToggle.addEventListener("click", openMobileMenu);
   backdrop.addEventListener("click", closeMobileMenu);
   const closeBtn = drawer.querySelector("#btnCloseMobileNav");
   if(closeBtn) closeBtn.addEventListener("click", closeMobileMenu);

   drawer.querySelectorAll("a").forEach(function(a){
     a.addEventListener("click", closeMobileMenu);
   });
 }
}

document.addEventListener("DOMContentLoaded",initUMKMApp);
window.addEventListener("storage",function(e){
 if(["infoUmkmAdminData","infoUmkmRecords"].includes(e.key)) renderCards("listId");
});


(function loadInfoUmkmAds(){
  if(document.body && (document.body.dataset.admin==='1' || document.querySelector('.admin-shell'))) return;
  function load(src){
    if(document.querySelector('script[data-info-ads-loader="'+src+'"]')) return;
    const s=document.createElement('script');
    s.src=src;
    s.dataset.infoAdsLoader=src;
    document.head.appendChild(s);
  }
  const base=location.pathname.indexOf('/umkm/')!==-1?'../':'';
  load(base+'assets/js/ads.js');
  load(base+'assets/js/side-ads.js');
})();
