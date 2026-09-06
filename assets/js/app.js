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
 const img=u.img||"assets/img/logo.svg";
 return `<article class="card">
   <div class="card-img"><img src="${esc(img)}" alt="${esc(u.name)}" loading="lazy"><span class="badge">✓ Terverifikasi</span></div>
   <div class="card-body"><h3>${esc(u.name)}</h3><p>${esc(u.cat)}</p><p>📍 ${esc(u.loc)}</p>
   <div class="stars">★★★★★ <span class="muted">${esc(u.rating||"5.0")}</span></div>
   <a class="btn btn-outline" href="detail.html?id=${encodeURIComponent(u.id)}">Lihat Detail</a></div>
 </article>`;
}

function renderCards(id="listId"){
 const el=document.getElementById(id);
 if(!el) return;
 const actual=readApprovedUMKM();
 const items=actual.concat(demoUMKM);
 el.innerHTML=items.map(card).join("");
 const counter=document.querySelector(".resultsbar b");
 if(counter) counter.textContent=actual.length+" UMKM ditemukan";
}

function initUMKMApp(){
 renderCards("listId");
 const y=document.getElementById("year");
 if(y) y.textContent=new Date().getFullYear();
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
