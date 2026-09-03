/* INFO UMKM - Public UMKM Directory
 * Patch isolated untuk halaman publik /umkm/.
 * Tombol/kartu detail menggunakan URL detail.html?id=... .
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'infoUmkmAdminData';
  const demoUMKM = [
    {id:'DEMO-1',name:'Warung Makmur',cat:'Kuliner',loc:'Temanggung, Jawa Tengah',img:'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',rating:'4.9',createdAt:'2026-01-01'},
    {id:'DEMO-2',name:'Batik Nusantara',cat:'Fashion',loc:'Sleman, DI Yogyakarta',img:'https://images.unsplash.com/photo-1583743814966-8936f37f1eab?auto=format&fit=crop&w=900&q=80',rating:'4.8',createdAt:'2026-01-02'},
    {id:'DEMO-3',name:'Tani Sejahtera',cat:'Pertanian',loc:'Bandung, Jawa Barat',img:'https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=900&q=80',rating:'4.9',createdAt:'2026-01-03'},
    {id:'DEMO-4',name:'Kerajinan Bambu',cat:'Kerajinan',loc:'Gianyar, Bali',img:'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=900&q=80',rating:'4.7',createdAt:'2026-01-04'}
  ];
  const categories=['Kuliner & Makanan','Minuman','Fashion','Kerajinan','Pertanian','Perkebunan','Peternakan','Perikanan','Jasa','Perdagangan','Otomotif','Teknologi & Digital','Kesehatan','Kecantikan','Pendidikan','Pariwisata','Homestay & Penginapan','Industri','Konveksi','Furniture','Properti','Transportasi','Ekonomi Kreatif','Elektronik','Percetakan','Agribisnis','Bahan Bangunan','Energi','Logistik','Lainnya'];

  function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
  function readAdmin(){try{const a=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');return Array.isArray(a)?a.filter(u=>String(u.status||'').toLowerCase()==='approved').map((u,i)=>normalize(u,i)).filter(Boolean):[]}catch(e){console.error(e);return[]}}
  function normalize(u,i){const name=String(u.businessName||u.name||'').trim();if(!name)return null;const province=String(u.province||'').trim(),regency=String(u.regency||'').trim(),district=String(u.district||'').trim();const pn=String(u.provinceName||'').trim(),rn=String(u.regencyName||'').trim(),dn=String(u.districtName||'').trim();return{id:String(u.id||'ADMIN-'+i),name,cat:String(u.category||'Lainnya'),loc:[dn,rn,pn].filter(Boolean).join(', ')||String(u.address||'Indonesia'),img:String(u.logo||''),rating:String(u.rating||'5.0'),createdAt:String(u.createdAt||''),source:'admin',province,regency,district,provinceName:pn,regencyName:rn,districtName:dn,address:String(u.address||''),description:String(u.description||''),phone:String(u.phone||''),ownerName:String(u.ownerName||'')};}
  function all(){return demoUMKM.concat(readAdmin());}
  function val(id){const e=document.getElementById(id);return e?String(e.value||'').trim():''}
  function text(id){const e=document.getElementById(id);return e&&e.selectedOptions[0]?e.selectedOptions[0].textContent.trim():''}
  function categoryMatch(cat,s){if(!s||s==='semua kategori')return true;const a=String(cat).toLowerCase(),b=s.toLowerCase();return a===b||(b==='kuliner'&&a==='kuliner & makanan')||a.includes(b)||b.includes(a)}
  function regionMatch(u){const p=val('filterProvince'),r=val('filterRegency'),d=val('filterDistrict');const pn=text('filterProvince').toLowerCase(),rn=text('filterRegency').toLowerCase(),dn=text('filterDistrict').toLowerCase();if(p){if(u.source==='admin'){if(u.province!==p&&u.provinceName.toLowerCase()!==pn)return false}else if(!u.loc.toLowerCase().includes(pn))return false}if(r){if(u.source==='admin'){if(u.regency!==r&&u.regencyName.toLowerCase()!==rn)return false}else if(!u.loc.toLowerCase().includes(rn))return false}if(d){if(u.source==='admin'){if(u.district!==d&&u.districtName.toLowerCase()!==dn)return false}else if(!u.loc.toLowerCase().includes(dn))return false}return true}
  function filtered(){const q=val('filterSearch').toLowerCase(),c=val('filterCategory').toLowerCase(),s=val('sortSelect').toLowerCase();const a=all().filter(u=>{const hay=[u.name,u.cat,u.loc,u.address,u.description,u.ownerName].join(' ').toLowerCase();return(!q||hay.includes(q))&&regionMatch(u)&&categoryMatch(u.cat,c)});if(s==='terbaru')a.sort((x,y)=>String(y.createdAt).localeCompare(String(x.createdAt)));else a.sort((x,y)=>Number(y.rating||0)-Number(x.rating||0));return a}
  function detailUrl(u){return 'detail.html?id='+encodeURIComponent(u.id)}
  function card(u){const url=detailUrl(u),img=u.img||'../assets/img/logo.svg';return `<article class="card" data-detail-url="${esc(url)}" tabindex="0" role="link" aria-label="Lihat detail ${esc(u.name)}"><div class="card-img"><img src="${esc(img)}" alt="${esc(u.name)}" loading="lazy"><span class="badge">✓ Terverifikasi</span></div><div class="card-body"><h3>${esc(u.name)}</h3><p>${esc(u.cat)}</p><p>📍 ${esc(u.loc)}</p><div class="stars">★★★★★ <span class="muted">${esc(u.rating)}</span></div><a class="btn btn-outline" href="${esc(url)}">Lihat Detail</a></div></article>`}
  function render(){const el=document.getElementById('listId');if(!el)return;const a=filtered();el.innerHTML=a.length?a.map(card).join(''):'<div class="panel" style="grid-column:1/-1;text-align:center;padding:30px">Tidak ada UMKM yang sesuai filter.</div>';const n=document.getElementById('resultCount');if(n)n.textContent=a.length+' UMKM ditemukan';}
  function populate(){const s=document.getElementById('filterCategory');if(!s)return;s.innerHTML='<option value="">Semua Kategori</option>'+categories.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('')}
  function detail(){const root=document.getElementById('detailContent');if(!root)return;const id=new URLSearchParams(location.search).get('id'),u=all().find(x=>String(x.id)===String(id));if(!u){root.innerHTML='<div class="panel" style="text-align:center;padding:35px"><h2>UMKM tidak ditemukan</h2><p class="muted">Data UMKM tidak tersedia pada browser ini.</p><a class="btn btn-primary" href="index.html">Kembali ke Direktori</a></div>';return}const img=u.img||'../assets/img/logo.svg';root.innerHTML=`<article class="detail-card"><div class="detail-cover"><img src="${esc(img)}" alt="${esc(u.name)}"></div><div class="detail-body"><span class="badge">✓ Terverifikasi</span><h1>${esc(u.name)}</h1><p class="muted">${esc(u.cat)}</p><div class="stars">★★★★★ <span class="muted">${esc(u.rating)}</span></div><div class="detail-meta"><div class="detail-item"><small>Lokasi</small><b>${esc(u.loc)}</b></div><div class="detail-item"><small>Pemilik</small><b>${esc(u.ownerName||'-')}</b></div><div class="detail-item"><small>Telepon</small><b>${esc(u.phone||'-')}</b></div><div class="detail-item"><small>Alamat</small><b>${esc(u.address||u.loc||'-')}</b></div></div><h3>Tentang UMKM</h3><p>${esc(u.description||'Belum ada deskripsi UMKM.')}</p><div class="detail-actions"><a class="btn btn-primary" href="index.html">← Kembali ke Direktori</a>${u.phone?`<a class="btn btn-outline" href="tel:${esc(u.phone)}">Hubungi UMKM</a>`:''}</div></div></article>`}

  document.addEventListener('DOMContentLoaded',function(){
    populate();
    render();
    const y=document.getElementById('year');if(y)y.textContent=new Date().getFullYear();
    ['filterSearch','filterProvince','filterRegency','filterDistrict','filterCategory','sortSelect'].forEach(id=>{const e=document.getElementById(id);if(e)e.addEventListener(id==='filterSearch'?'input':'change',render)});
    const apply=document.getElementById('applyFilter');if(apply)apply.addEventListener('click',render);
    const list=document.getElementById('listId');if(list)list.addEventListener('click',function(e){const a=e.target.closest('a[href]');if(a)return;const c=e.target.closest('.card[data-detail-url]');if(c)location.href=c.dataset.detailUrl});
    if(list)list.addEventListener('keydown',function(e){if(e.key!=='Enter'&&e.key!==' ')return;const c=e.target.closest('.card[data-detail-url]');if(c){e.preventDefault();location.href=c.dataset.detailUrl}});
    window.addEventListener('storage',function(e){if(e.key===STORAGE_KEY)render()});
    detail();
  });
})();
