const demoUMKM=[
 {name:"Warung Makmur",cat:"Kuliner",loc:"Temanggung, Jawa Tengah",img:"https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",rating:"4.9"},
 {name:"Batik Nusantara",cat:"Fashion",loc:"Sleman, DI Yogyakarta",img:"https://images.unsplash.com/photo-1583743814966-8936f37f1eab?auto=format&fit=crop&w=900&q=80",rating:"4.8"},
 {name:"Tani Sejahtera",cat:"Pertanian",loc:"Bandung, Jawa Barat",img:"https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=900&q=80",rating:"4.9"},
 {name:"Kerajinan Bambu",cat:"Kerajinan",loc:"Gianyar, Bali",img:"https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=900&q=80",rating:"4.7"}
];

function card(u){
  return `<article class="card">
    <div class="card-img">
      <img src="${u.img}" alt="${u.name}">
      <span class="badge">✓ Terverifikasi</span>
    </div>
    <div class="card-body">
      <h3>${u.name}</h3>
      <p>${u.cat}</p>
      <p>📍 ${u.loc}</p>
      <div class="stars">★★★★★ <span class="muted">${u.rating}</span></div>
      <a class="btn btn-outline" href="detail.html">Lihat Detail</a>
    </div>
  </article>`;
}

function getFilterValues(){
  return {
    search:(document.getElementById("filterSearch")?.value || "").trim().toLowerCase(),
    province:(document.getElementById("filterProvince")?.selectedOptions[0]?.text || "").trim().toLowerCase(),
    regency:(document.getElementById("filterRegency")?.selectedOptions[0]?.text || "").trim().toLowerCase(),
    district:(document.getElementById("filterDistrict")?.selectedOptions[0]?.text || "").trim().toLowerCase(),
    category:(document.getElementById("filterCategory")?.value || "").trim().toLowerCase()
  };
}

function renderCards(id="listId"){
  const el=document.getElementById(id);
  if(!el) return;

  const f=getFilterValues();
  const filtered=demoUMKM.filter(u=>{
    const haystack=`${u.name} ${u.cat} ${u.loc}`.toLowerCase();
    if(f.search && !haystack.includes(f.search)) return false;
    if(f.province && f.province !== "semua provinsi" && !u.loc.toLowerCase().includes(f.province)) return false;
    if(f.regency && f.regency !== "semua kabupaten/kota" && !u.loc.toLowerCase().includes(f.regency)) return false;
    if(f.district && f.district !== "pilih kabupaten/kota terlebih dahulu" && !u.loc.toLowerCase().includes(f.district)) return false;
    if(f.category && f.category !== "semua kategori" && u.cat.toLowerCase() !== f.category) return false;
    return true;
  });

  el.innerHTML=filtered.map(card).join("") ||
    '<div class="panel" style="grid-column:1/-1;text-align:center;padding:30px">Tidak ada UMKM yang sesuai filter.</div>';

  const count=document.querySelector(".resultsbar b");
  if(count) count.textContent=`${filtered.length} UMKM ditemukan`;
}

document.addEventListener("DOMContentLoaded",()=>{
  renderCards();

  const y=document.getElementById("year");
  if(y) y.textContent=new Date().getFullYear();

  document.querySelectorAll("[data-demo-alert]").forEach(b=>{
    b.removeAttribute("data-demo-alert");
    b.addEventListener("click",e=>{
      e.preventDefault();
      renderCards();
    });
  });

  ["filterSearch","filterProvince","filterRegency","filterDistrict","filterCategory"].forEach(id=>{
    const el=document.getElementById(id);
    if(!el) return;
    el.addEventListener(id==="filterSearch" ? "input" : "change",()=>{
      if(id !== "filterProvince" && id !== "filterRegency") renderCards();
    });
  });
});
