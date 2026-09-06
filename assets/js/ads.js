/*
 * INFO UMKM — GLOBAL ADS + IKLAN SENDIRI
 * Patch isolated: tidak mengubah fungsi UMKM, filter, atau detail.
 */
(function(){
  'use strict';
  if(window.__INFO_UMKM_ADS_LOADED__) return;
  window.__INFO_UMKM_ADS_LOADED__=true;

  const SELF_ADS_KEY = 'infoUmkmAds';

  function esc(v){
    return String(v == null ? '' : v)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
      .replace(/'/g,'&#039;');
  }

  function rootPath(){
    const script=document.querySelector("script[src*='/assets/js/ads.js']");
    if(script){
      try{return new URL('../../',new URL(script.src,location.href)).pathname;}catch(e){}
    }
    return location.pathname.indexOf('/umkm/') !== -1 ? '../' : '';
  }

  function normalizeUrl(v){
    const s=String(v||'');
    if(!s) return '';
    if(/^(https?:|mailto:|tel:|data:|\/)/i.test(s)) return s;
    if(s.indexOf('../')===0) return rootPath()+s.substring(3);
    return rootPath()+s;
  }

  function readSelfAds(){
    try{
      const raw=JSON.parse(localStorage.getItem(SELF_ADS_KEY)||'[]');
      return Array.isArray(raw) ? raw.filter(function(ad){
        return ad && String(ad.status||'').toLowerCase()==='active';
      }) : [];
    }catch(e){
      console.error('INFO UMKM iklan:',e);
      return [];
    }
  }

  function positions(ad){
    if(Array.isArray(ad.positions)) return ad.positions.map(String);
    return ad.position ? [String(ad.position)] : [];
  }

  function adsFor(pos){
    return readSelfAds().filter(function(ad){
      return positions(ad).indexOf(pos)!==-1;
    });
  }

  function selfAd(ad){
    const title=ad.title||'Pasang Iklan Anda';
    const href=normalizeUrl(ad.link||'kontak.html');
    const image=normalizeUrl(ad.image||'');
    const imageHtml=image
      ? '<img src="'+esc(image)+'" alt="'+esc(title)+'" loading="lazy">'
      : '<div class="info-self-ad-placeholder">RUANG IKLAN SENDIRI</div>';

    return '<a class="info-self-ad" href="'+esc(href)+'" target="_blank" rel="noopener">'+
      imageHtml+
      '<div class="info-self-ad-body"><span class="info-self-ad-label">IKLAN SENDIRI</span>'+
      '<span class="info-self-ad-title">'+esc(title)+'</span></div></a>';
  }

  function selfAdSlot(position, showCta){
    const list=adsFor(position);
    if(list.length) return list.map(selfAd).join('');

    if(showCta){
      return '<a class="info-self-ad info-self-ad-cta" href="'+esc(rootPath()+'kontak.html')+'">'+
        '<div class="info-self-ad-placeholder">RUANG IKLAN SENDIRI</div>'+
        '<div class="info-self-ad-body"><span class="info-self-ad-label">IKLAN SENDIRI</span>'+
        '<span class="info-self-ad-title">Pasang iklan di INFO UMKM</span></div></a>';
    }
    return '';
  }

  function googleSlot(position){
    const el=document.createElement('div');
    el.className='info-ads-slot';
    el.dataset.infoAdsPosition=position;
    const client=window.INFO_UMKM_ADSENSE_CLIENT||'';
    const slots=window.INFO_UMKM_ADSENSE_SLOTS||{};
    const slot=slots[position]||'';

    if(client && slot){
      el.innerHTML='<ins class="adsbygoogle" style="display:block;min-height:90px" data-ad-client="'+
        esc(client)+'" data-ad-slot="'+esc(slot)+'" data-ad-format="auto" data-full-width-responsive="true"></ins>';
      try{(window.adsbygoogle=window.adsbygoogle||[]).push({});}catch(e){}
    }else{
      el.innerHTML='<span class="info-ads-label">SPACE ADS — '+esc(position.toUpperCase())+'</span>';
    }
    return el;
  }

  function selfSlot(position, cls, showCta){
    const wrap=document.createElement('div');
    wrap.className='info-self-ads-wrap '+(cls||'');
    wrap.dataset.infoSelfAds=position;
    wrap.innerHTML=selfAdSlot(position,showCta);
    return wrap;
  }

  function insertBeforeFooter(node){
    const footer=document.querySelector('footer');
    if(footer && footer.parentNode) footer.parentNode.insertBefore(node,footer);
    else document.body.appendChild(node);
  }

  function addGlobalTop(){
    if(document.querySelector('[data-info-global-top]')) return;
    const wrap=document.createElement('div');
    wrap.className='container info-ads-global';
    wrap.dataset.infoGlobalTop='1';
    wrap.appendChild(googleSlot('top'));
    wrap.appendChild(selfSlot('top','',true));

    const pagehead=document.querySelector('.pagehead');
    const hero=document.querySelector('.hero');
    const anchor=pagehead||hero;
    if(anchor && anchor.parentNode) anchor.parentNode.insertBefore(wrap,anchor.nextSibling);
    else document.body.insertBefore(wrap,document.body.firstChild);
  }

  function addMiddle(){
    if(document.querySelector('[data-info-global-middle]')) return;
    const wrap=document.createElement('div');
    wrap.className='container info-ads-global';
    wrap.dataset.infoGlobalMiddle='1';
    wrap.appendChild(googleSlot('middle'));
    wrap.appendChild(selfSlot('middle','',true));

    const sections=Array.prototype.filter.call(document.querySelectorAll('main > .section, body > .section'),function(s){
      return !s.closest('footer');
    });

    if(sections.length>=2){
      const target=sections[Math.min(2,sections.length-1)];
      target.parentNode.insertBefore(wrap,target);
    }else{
      insertBeforeFooter(wrap);
    }
  }

  function addSidebar(){
    if(document.querySelector('[data-info-sidebar]')) return;

    const candidates=[
      document.querySelector('.directory'),
      document.querySelector('.detail-grid'),
      document.querySelector('.form-layout')
    ];
    const candidate=candidates.find(Boolean);
    if(!candidate) return;

    let side=candidate.querySelector('.filters, .detail-sidebar, .form-sidebar');
    if(!side){
      side=document.createElement('aside');
      side.className='info-ads-sidebar';
      candidate.appendChild(side);
    }else{
      side.classList.add('info-ads-sidebar');
    }

    side.dataset.infoSidebar='1';
    side.insertBefore(selfSlot('sidebar','',true),side.firstChild);
  }

  function addBottom(){
    if(document.querySelector('[data-info-global-bottom]')) return;
    const wrap=document.createElement('div');
    wrap.className='container info-ads-global';
    wrap.dataset.infoGlobalBottom='1';
    wrap.appendChild(googleSlot('bottom'));
    wrap.appendChild(selfSlot('bottom','',true));
    insertBeforeFooter(wrap);
  }

  function injectStyles(){
    if(document.getElementById('info-umkm-ads-style')) return;
    const s=document.createElement('style');
    s.id='info-umkm-ads-style';
    s.textContent=`
      .info-ads-global{margin:18px auto;position:relative;z-index:1}
      .info-ads-slot{min-height:90px;display:flex;align-items:center;justify-content:center;border:1px dashed #cbd9e8;background:#f8fbff;border-radius:12px;overflow:hidden}
      .info-ads-label{font-size:11px;font-weight:800;letter-spacing:.08em;color:#8da0b4}
      .info-self-ads-wrap{margin-top:10px}
      .info-self-ad{display:block;text-decoration:none;background:#fff;border:1px solid #dfe8f0;border-radius:12px;overflow:hidden;color:#17324d;box-shadow:0 4px 14px rgba(30,70,110,.06)}
      .info-self-ad img{display:block;width:100%;height:auto;max-height:250px;object-fit:cover}
      .info-self-ad-placeholder{min-height:120px;display:flex;align-items:center;justify-content:center;background:#f4f8fc;color:#9aaabd;font-size:11px;text-align:center}
      .info-self-ad-body{padding:9px 11px;display:flex;flex-direction:column;gap:3px}
      .info-self-ad-label,.info-side-ad-label{font-size:9px;font-weight:900;letter-spacing:.08em;color:#7890a8}
      .info-self-ad-title{font-size:12px;font-weight:800}
      .info-ads-sidebar{display:flex;flex-direction:column;gap:10px}
      .info-side-ads{position:fixed;right:18px;top:110px;width:300px;z-index:20}
      .info-side-ad{display:block;background:#fff;border:1px solid #dfe8f0;border-radius:12px;overflow:hidden;text-decoration:none;color:#17324d;box-shadow:0 8px 24px rgba(30,70,110,.12);margin-bottom:10px}
      .info-side-ad img{display:block;width:300px;height:250px;object-fit:cover}
      .info-side-ad-placeholder{width:300px;height:250px;display:flex;align-items:center;justify-content:center;text-align:center;background:#f8fbff;color:#8da0b4;font-size:11px}
      .info-side-ad-label{padding:7px 10px;background:#fff}
      @media(max-width:1200px){.info-side-ads{position:static;width:min(300px,100%);margin:18px auto}.info-side-ad img,.info-side-ad-placeholder{max-width:100%;width:100%}}
      @media(max-width:600px){.info-side-ads{margin:12px auto}.info-ads-global{margin:12px auto}}
    `;
    document.head.appendChild(s);
  }

  function loadAdsense(){
    const client=window.INFO_UMKM_ADSENSE_CLIENT||'';
    if(!client || document.querySelector('script[data-info-umkm-adsense]')) return;
    const s=document.createElement('script');
    s.async=true;
    s.crossOrigin='anonymous';
    s.dataset.infoUmkmAdsense='1';
    s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+encodeURIComponent(client);
    document.head.appendChild(s);
  }

  function init(){
    /* Iklan tampil di seluruh halaman publik. */
    /* Never inject into admin pages. */
    if(document.body && (document.body.dataset.admin==='1' || document.querySelector('.admin-shell'))) return;

    injectStyles();
    addGlobalTop();
    addMiddle();
    addSidebar();
    addBottom();
    loadAdsense();
  }

  document.addEventListener('DOMContentLoaded',init);
  window.addEventListener('storage',function(e){
    if(e.key===SELF_ADS_KEY) location.reload();
  });
})();
