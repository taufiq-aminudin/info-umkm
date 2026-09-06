/*
 * INFO UMKM — SIDE ADS ONLY
 * Adds an independent right-side advertising rail.
 * Does not modify existing UMKM/filter/detail rendering.
 */
(function(){
  'use strict';

  const SELF_ADS_KEY='infoUmkmAds';

  function esc(v){
    return String(v==null?'':v)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#039;');
  }

  function rootPath(){
    return location.pathname.indexOf('/umkm/')!==-1?'../':'';
  }

  function assetUrl(v){
    const s=String(v||'');
    if(!s)return '';
    if(/^(https?:|data:|\/)/i.test(s))return s;
    if(s.indexOf('../')===0)return rootPath()+s.substring(3);
    return rootPath()+s;
  }

  function readAds(){
    try{
      const raw=JSON.parse(localStorage.getItem(SELF_ADS_KEY)||'[]');
      return Array.isArray(raw)
        ? raw.filter(function(a){
            return a && String(a.status||'').toLowerCase()==='active';
          })
        : [];
    }catch(e){
      return [];
    }
  }

  function sideAds(){
    return readAds().filter(function(a){
      if(Array.isArray(a.positions))return a.positions.map(String).indexOf('sidebar')!==-1;
      return String(a.position||'').toLowerCase()==='sidebar';
    });
  }

  function selfAd(a){
    const title=a.title||'Pasang Iklan Anda';
    const href=assetUrl(a.link||rootPath()+'kontak.html');
    const img=assetUrl(a.image||'');

    return '<a class="info-side-self-ad" href="'+esc(href)+'" target="_blank" rel="noopener">'+
      (img
        ? '<img src="'+esc(img)+'" alt="'+esc(title)+'" loading="lazy">'
        : '<div class="info-side-self-ad-placeholder">RUANG IKLAN SENDIRI</div>')+
      '<div class="info-side-self-ad-body">'+
      '<span class="info-side-self-ad-label">IKLAN SENDIRI</span>'+
      '<span class="info-side-self-ad-title">'+esc(title)+'</span>'+
      '</div></a>';
  }

  function googleSlot(){
    const client=window.INFO_UMKM_ADSENSE_CLIENT||'';
    const slots=window.INFO_UMKM_ADSENSE_SLOTS||{};
    const slot=slots.sidebar||slots.side||'';

    const el=document.createElement('div');
    el.className='info-side-ads-slot';

    if(client && slot){
      el.innerHTML='<ins class="adsbygoogle" style="display:block;min-height:250px" '+
        'data-ad-client="'+esc(client)+'" data-ad-slot="'+esc(slot)+'" '+
        'data-ad-format="auto" data-full-width-responsive="true"></ins>';
      try{(window.adsbygoogle=window.adsbygoogle||[]).push({});}catch(e){}
    }else{
      el.innerHTML='<span class="info-side-ads-label">SPACE ADS — SIDEBAR 300×250</span>';
    }
    return el;
  }

  function render(){
    if(document.querySelector('[data-info-side-ads]'))return;
    if(document.body && (document.body.dataset.admin==='1' || document.querySelector('.admin-shell')))return;

    const rail=document.createElement('aside');
    rail.className='info-side-ads';
    rail.dataset.infoSideAds='1';
    rail.setAttribute('aria-label','Iklan');

    rail.appendChild(googleSlot());

    const ads=sideAds();
    if(ads.length){
      ads.forEach(function(a){rail.insertAdjacentHTML('beforeend',selfAd(a));});
    }else{
      rail.insertAdjacentHTML('beforeend',
        '<a class="info-side-self-ad" href="'+esc(rootPath()+'kontak.html')+'">'+
        '<div class="info-side-self-ad-placeholder">RUANG IKLAN SENDIRI</div>'+
        '<div class="info-side-self-ad-body">'+
        '<span class="info-side-self-ad-label">IKLAN SENDIRI</span>'+
        '<span class="info-side-self-ad-title">Pasang iklan di INFO UMKM</span>'+
        '</div></a>');
    }

    document.body.appendChild(rail);
  }

  document.addEventListener('DOMContentLoaded',render);
  window.addEventListener('storage',function(e){
    if(e.key===SELF_ADS_KEY)location.reload();
  });
})();
