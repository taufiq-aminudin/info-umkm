(function(){
'use strict';
const STORAGE_KEY='infoUmkmAdminData';
const demo=[
{id:'DEMO-1',name:'Warung Makmur',cat:'Kuliner',loc:'Temanggung, Jawa Tengah',img:'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',rating:'4.9',createdAt:'2026-01-01',gallery:[]},
{id:'DEMO-2',name:'Batik Nusantara',cat:'Fashion',loc:'Sleman, DI Yogyakarta',img:'https://images.unsplash.com/photo-1583743814966-8936f37f1eab?auto=format&fit=crop&w=1200&q=80',rating:'4.8',createdAt:'2026-01-02',gallery:[]},
{id:'DEMO-3',name:'Tani Sejahtera',cat:'Pertanian',loc:'Bandung, Jawa Barat',img:'https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1200&q=80',rating:'4.9',createdAt:'2026-01-03',gallery:[]},
{id:'DEMO-4',name:'Kerajinan Bambu',cat:'Kerajinan',loc:'Gianyar, Bali',img:'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=1200&q=80',rating:'4.7',createdAt:'2026-01-04',gallery:[]}
];
function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;')}
function arr(v){return Array.isArray(v)?v.filter(Boolean):[]}
function admin(){try{const a=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');return Array.isArray(a)?a.filter(u=>String(u.status||'').toLowerCase()==='approved').map(u=>({
 id:String(u.id||''),name:String(u.businessName||u.name||''),cat:String(u.category||'Lainnya'),
 loc:[u.districtName,u.regencyName,u.provinceName].filter(Boolean).join(', ')||[u.district,u.regency,u.province].filter(Boolean).join(', ')||String(u.address||'Indonesia'),
 img:String(u.logo||''),rating:String(u.rating||'5.0'),ownerName:String(u.ownerName||''),phone:String(u.phone||''),address:String(u.address||''),description:String(u.description||''),
 lat:parseFloat(u.latitude),lng:parseFloat(u.longitude),gallery:arr(u.gallery||u.photos||u.images)
})).filter(u=>u.id&&u.name):[]}catch(e){return[]}}
function validCoord(lat,lng){return Number.isFinite(lat)&&Number.isFinite(lng)&&lat>=-90&&lat<=90&&lng>=-180&&lng<=180}
function mapsUrl(u){return validCoord(u.lat,u.lng)?'https://www.openstreetmap.org/?mlat='+encodeURIComponent(u.lat)+'&mlon='+encodeURIComponent(u.lng)+'#map=18/'+encodeURIComponent(u.lat)+'/'+encodeURIComponent(u.lng):''}
function run(){
 const root=document.getElementById('detailContent');
 const id=new URLSearchParams(location.search).get('id');
 const data=demo.concat(admin());
 const u=data.find(x=>String(x.id)===String(id));
 if(!u){root.innerHTML='<div class="panel" style="text-align:center;padding:35px"><h2>UMKM tidak ditemukan</h2><p class="muted">Data UMKM tidak tersedia pada browser ini.</p><a class="btn btn-primary" href="index.html">Kembali ke Direktori</a></div>';return;}
 const img=u.img||'../assets/img/logo.svg';
 const gallery=[img].concat(u.gallery||[]).filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).slice(0,8);
 const galleryHtml='<div class="detail-section"><h2>Foto Usaha &amp; Produk</h2>'+(gallery.length?'<div class="detail-gallery">'+gallery.map((g,i)=>'<button type="button" data-gallery-src="'+esc(g)+'" aria-label="Lihat foto '+(i+1)+'"><img src="'+esc(g)+'" alt="Foto '+esc(u.name)+' '+(i+1)+'" loading="lazy"></button>').join('')+'</div>':'<div class="gallery-empty">Foto usaha atau produk belum ditambahkan.</div>')+'</div>';
 const mapHtml=validCoord(u.lat,u.lng)?'<div class="detail-section"><h2>Lokasi Usaha</h2><div id="businessMap" class="detail-map"></div><p class="detail-map-note">📍 '+esc(u.loc)+' · <a href="'+mapsUrl(u)+'" target="_blank" rel="noopener">Buka lokasi di OpenStreetMap</a></p></div>':'<div class="detail-section"><h2>Lokasi Usaha</h2><div class="detail-item"><small>Alamat</small><b>'+esc(u.address||u.loc||'Indonesia')+'</b></div><p class="detail-map-note">Koordinat lokasi usaha belum tersedia.</p></div>';
 root.innerHTML='<article class="detail-card"><div class="detail-cover"><img src="'+esc(img)+'" alt="'+esc(u.name)+'"></div><div class="detail-body"><span class="badge">✓ Terverifikasi</span><h1>'+esc(u.name)+'</h1><p class="muted">'+esc(u.cat)+'</p><div class="stars">★★★★★ <span class="muted">'+esc(u.rating)+'</span></div><div class="detail-meta"><div class="detail-item"><small>Lokasi</small><b>'+esc(u.loc)+'</b></div><div class="detail-item"><small>Pemilik</small><b>'+esc(u.ownerName||'-')+'</b></div><div class="detail-item"><small>Telepon</small><b>'+esc(u.phone||'-')+'</b></div><div class="detail-item"><small>Alamat</small><b>'+esc(u.address||u.loc||'-')+'</b></div></div><div class="detail-section"><h2>Tentang UMKM</h2><p class="detail-description">'+esc(u.description||'Belum ada deskripsi UMKM.')+'</p></div>'+galleryHtml+mapHtml+'<div class="detail-actions"><a class="btn btn-primary" href="index.html">← Kembali ke Direktori</a>'+(u.phone?'<a class="btn btn-outline" href="tel:'+esc(u.phone)+'">Hubungi UMKM</a>':'')+'</div></div></article>';
 document.querySelectorAll('[data-gallery-src]').forEach(btn=>btn.addEventListener('click',()=>{const src=btn.getAttribute('data-gallery-src');const w=window.open('', '_blank');if(w){w.document.write('<!doctype html><title>'+esc(u.name)+'</title><style>html,body{margin:0;background:#111;height:100%;display:grid;place-items:center}img{max-width:96vw;max-height:96vh;object-fit:contain}</style><img src="'+esc(src)+'" alt="'+esc(u.name)+'">');w.document.close();}}));
 if(validCoord(u.lat,u.lng)&&window.L){const map=L.map('businessMap',{scrollWheelZoom:false}).setView([u.lat,u.lng],16);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);L.marker([u.lat,u.lng]).addTo(map).bindPopup('<b>'+esc(u.name)+'</b><br>'+esc(u.loc)).openPopup();setTimeout(()=>map.invalidateSize(),100);}
}
document.addEventListener('DOMContentLoaded',function(){const y=document.getElementById('year');if(y)y.textContent=new Date().getFullYear();run();});
})();
