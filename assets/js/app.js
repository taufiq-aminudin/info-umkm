/* INFO UMKM — Direktori
 * Patch kecil: tampilkan UMKM dari Admin + pendaftaran langsung.
 * Data publik hanya menampilkan record yang sudah Approved.
 */
const demoUMKM=[
 {id:"DEMO-1",name:"Warung Makmur",cat:"Kuliner",loc:"Temanggung, Jawa Tengah",img:"https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",rating:"4.9",createdAt:"2026-01-01"},
 {id:"DEMO-2",name:"Batik Nusantara",cat:"Fashion",loc:"Sleman, DI Yogyakarta",img:"https://images.unsplash.com/photo-1583743814966-8936f37f1eab?auto=format&fit=crop&w=900&q=80",rating:"4.8",createdAt:"2026-01-02"},
 {id:"DEMO-3",name:"Tani Sejahtera",cat:"Pertanian",loc:"Bandung, Jawa Barat",img:"https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=900&q=80",rating:"4.9",createdAt:"2026-01-03"},
 {id:"DEMO-4",name:"Kerajinan Bambu",cat:"Kerajinan",loc:"Gianyar, Bali",img:"https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=900&q=80",rating:"4.7",createdAt:"2026-01-04"}
];

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

function getAllUMKM(){
 const actual = readApprovedUMKM();
 return actual.concat(demoUMKM);
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

 // Update counter
 const counter = document.getElementById("resultsCounter") || document.querySelector(".resultsbar b");
 if(counter){
   if(query || selectedCat || provText){
     counter.textContent = `${filtered.length} dari ${allItems.length} UMKM ditemukan`;
   } else {
     counter.textContent = `${filtered.length} UMKM ditemukan`;
   }
 }
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

 // Initial render
 applyDirectoryFilters();

 const y = document.getElementById("year");
 if(y) y.textContent = new Date().getFullYear();

 document.querySelectorAll("[data-demo-alert]").forEach(function(b){
   b.addEventListener("click",function(e){e.preventDefault();alert("Fitur ini tersedia pada tahap backend/production.");});
 });
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
