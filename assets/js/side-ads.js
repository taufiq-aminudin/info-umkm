/*
 * INFO UMKM — SIDE ADS ONLY
 * This layer is additive. Existing top/middle/bottom ads remain untouched.
 */
(function(){
  'use strict';

  const KEY='infoUmkmAds';

  function esc(v){
    return String(v==null?'':v)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
      .replace(/'/g,'&#039;');
  }

  function root(){
    return location.pathname.indexOf('/umkm/')!==-1?'../':'';
  }

  function url(v){
    const s=String(v||'');
    if(!s)return '';
    if(/^(https?:|mailto:|tel:|data:|\/)/i.test(s))return s;
    if(s.indexOf('../')===0)return root()+s.substring(3);
    return root()+s;
  }

  function ads(){
    try{
      const a=JSON.parse(localStorage.getItem(KEY)||'[]');
      if(!Array.isArray(a))return [];
      return a.filter(function(x){
        return x && String(x.status||'').toLowerCase()==='active';
      });
    }catch(e){return [];}
  }

  function hasSide(a){
    if(Array.isArray(a.positions)) return a.positions.some(function(p){
      return String(p).toLowerCase()==='sidebar' || String(p).toLowerCase()==='side';
    });
    return String(a.position||'').toLowerCase()==='sidebar' ||
           String(a.position||'').toLowerCase()==='side';
  }

  function makeAd(a){
    const title=a.title||'Iklan INFO UMKM';
    const href=url(a.link||'kontak.html');
    const img=url(a.image||'');
    let body='';

    if(img){
      body='<img src="'+esc(img)+'" alt="'+esc(title)+'" loading="lazy">';
    }else{
      body='<div class="info-side-ad-placeholder"><span>RUANG IKLAN SENDIRI<br>300 × 250</span></div>';
    }

    return '<a class="info-side-ad" href="'+esc(href)+'" target="_blank" rel="noopener">'+
      body+
      '<div class="info-side-ad-label">IKLAN</div>'+
      '</a>';
  }

  function init(){
    if(document.querySelector('.admin-shell') || (document.body&&document.body.dataset.admin==='1'))return;
    if(document.querySelector('[data-info-side-ads]'))return;

    const wrap=document.createElement('aside');
    wrap.className='info-side-ads';
    wrap.dataset.infoSideAds='1';

    const side=ads().filter(hasSide);

    /* Always keep a visible side advertising space on desktop. */
    if(side.length){
      wrap.innerHTML=side.map(makeAd).join('');
    }else{
      wrap.innerHTML=
        '<a class="info-side-ad" href="'+esc(root()+'kontak.html')+'">'+
        '<div class="info-side-ad-placeholder"><span>SPACE IKLAN<br>300 × 250<br><br>Pasang Iklan Anda</span></div>'+
        '<div class="info-side-ad-label">IKLAN SENDIRI</div>'+
        '</a>';
    }

    document.body.appendChild(wrap);
  }

  document.addEventListener('DOMContentLoaded',init);
  window.addEventListener('storage',function(e){
    if(e.key===KEY)location.reload();
  });
})();
