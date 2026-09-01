
const demoUMKM=[
 {name:"Warung Makmur",cat:"Kuliner",loc:"Temanggung, Jawa Tengah",img:"https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",rating:"4.9"},
 {name:"Batik Nusantara",cat:"Fashion",loc:"Sleman, DI Yogyakarta",img:"https://images.unsplash.com/photo-1583743814966-8936f37f1eab?auto=format&fit=crop&w=900&q=80",rating:"4.8"},
 {name:"Tani Sejahtera",cat:"Pertanian",loc:"Bandung, Jawa Barat",img:"https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=900&q=80",rating:"4.9"},
 {name:"Kerajinan Bambu",cat:"Kerajinan",loc:"Gianyar, Bali",img:"https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=900&q=80",rating:"4.7"}
];
function card(u){return `<article class="card"><div class="card-img"><img src="${u.img}" alt="${u.name}"><span class="badge">✓ Terverifikasi</span></div><div class="card-body"><h3>${u.name}</h3><p>${u.cat}</p><p>📍 ${u.loc}</p><div class="stars">★★★★★ <span class="muted">${u.rating}</span></div><a class="btn btn-outline" href="detail.html">Lihat Detail</a></div></article>`}
function renderCards(id=listId){const el=document.getElementById(id);if(el)el.innerHTML=demoUMKM.map(card).join("")}
document.addEventListener("DOMContentLoaded",()=>{renderCards(); const y=document.getElementById("year");if(y)y.textContent=new Date().getFullYear();
document.querySelectorAll("[data-demo-alert]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();alert("Fitur ini tersedia pada tahap backend/production.");}));
});
