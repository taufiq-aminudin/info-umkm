/*
 * INFO UMKM — Global Ads & Self-Advertising
 * Safe isolated layer. Runs on public pages only.
 *
 * Google AdSense:
 * Set these optional values before loading this file:
 * window.INFO_UMKM_ADSENSE_CLIENT = "ca-pub-XXXXXXXXXXXXXXXX";
 * window.INFO_UMKM_ADSENSE_SLOTS = {
 *   top:"1234567890", middle:"1234567890", bottom:"1234567890"
 * };
 *
 * Self ads:
 * localStorage key: infoUmkmAds
 * Example:
 * [{
 *   id:"AD-001",
 *   title:"Nama Pengiklan",
 *   image:"assets/img/iklan.jpg",
 *   link:"https://contoh.com",
 *   positions:["top","sidebar","middle","bottom"],
 *   status:"active"
 * }]
 */
(function(){
  'use strict';

  const ADS_KEY = 'infoUmkmAds';

  function esc(v){
    return String(v == null ? '' : v)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#039;');
  }

  function isPublicPage(){
    return !document.body || document.body.dataset.admin !== '1';
  }

  function readSelfAds(){
    try{
      const raw = JSON.parse(localStorage.getItem(ADS_KEY) || '[]');
      if(!Array.isArray(raw)) return [];
      return raw.filter(function(ad){
        return ad && String(ad.status || '').toLowerCase() === 'active';
      });
    }catch(e){
      console.error('INFO UMKM ads:',e);
      return [];
    }
  }

  function adPositions(ad){
    if(Array.isArray(ad.positions)) return ad.positions.map(String);
    if(ad.position) return [String(ad.position)];
    return [];
  }

  function activeSelfAds(position){
    return readSelfAds().filter(function(ad){
      return adPositions(ad).indexOf(position) !== -1;
    });
  }

  function basePath(){
    return location.pathname.indexOf('/umkm/') !== -1 ? '../' : '';
  }

  function normalizeImage(src){
    if(!src) return '';
    const s = String(src);
    if(/^(https?:|data:|\/)/i.test(s)) return s;
    if(s.indexOf('../') === 0) return basePath() + s.substring(3);
    return basePath() + s;
  }

  function selfAdCard(ad){
    const href = ad.link || '#';
    const img = normalizeImage(ad.image || '');
    const title = ad.title || 'Iklan';
    if(!img){
      return '<a class="info-self-ad" href="'+esc(href)+'" target="_blank" rel="noopener">' +
        '<div class="info-self-ad-body">' +
        '<span class="info-self-ad-label">IKLAN</span>' +
        '<span class="info-self-ad-title">'+esc(title)+'</span>' +
        '</div></a>';
    }
    return '<a class="info-self-ad" href="'+esc(href)+'" target="_blank" rel="noopener">' +
      '<img src="'+esc(img)+'" alt="'+esc(title)+'" loading="lazy">' +
      '<div class="info-self-ad-body">' +
      '<span class="info-self-ad-label">IKLAN</span>' +
      '<span class="info-self-ad-title">'+esc(title)+'</span>' +
      '</div></a>';
  }

  function makeSlot(position, cls){
    const el = document.createElement('div');
    el.className = 'info-ads-slot' + (cls ? ' '+cls : '');
    el.dataset.adsPosition = position;
    return el;
  }

  function adSenseAvailable(){
    return !!(window.INFO_UMKM_ADSENSE_CLIENT &&
               window.INFO_UMKM_ADSENSE_SLOTS);
  }

  function fillGoogleSlot(el, position){
    const slots = window.INFO_UMKM_ADSENSE_SLOTS || {};
    const slotId = slots[position];

    if(adSenseAvailable() && slotId){
      el.innerHTML =
        '<ins class="adsbygoogle" style="display:block;min-height:70px" ' +
        'data-ad-client="'+esc(window.INFO_UMKM_ADSENSE_CLIENT)+'" ' +
        'data-ad-slot="'+esc(slotId)+'" data-ad-format="auto" data-full-width-responsive="true"></ins>';
      try{
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        return;
      }catch(e){}
    }

    el.innerHTML = '<span class="info-ads-label">SPACE ADS — '+esc(position.toUpperCase())+'</span>';
  }

  function injectAdSenseScript(){
    if(!adSenseAvailable()) return;
    if(document.querySelector('script[data-info-umkm-adsense]')) return;

    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' +
      encodeURIComponent(window.INFO_UMKM_ADSENSE_CLIENT);
    s.crossOrigin = 'anonymous';
    s.dataset.infoUmkmAdsense = '1';
    document.head.appendChild(s);
  }

  function render(){
    if(!isPublicPage()) return;

    injectAdSenseScript();

    const body = document.body;
    const footer = document.querySelector('footer');
    const pagehead = document.querySelector('.pagehead');
    const mainSection = document.querySelector('main');

    /* Do not duplicate if this script is loaded twice. */
    if(document.querySelector('[data-info-ads-root]')) return;

    const root = document.createElement('div');
    root.dataset.infoAdsRoot = '1';
    root.className = 'container';
    root.style.marginTop = '0';

    /* TOP: after pagehead, otherwise at start of body */
    const top = makeSlot('top','');
    fillGoogleSlot(top,'top');

    if(pagehead && pagehead.parentNode){
      pagehead.parentNode.insertBefore(root,pagehead.nextSibling);
      root.appendChild(top);
    }else if(footer){
      footer.parentNode.insertBefore(root,footer);
      root.appendChild(top);
    }else{
      body.insertBefore(root,body.firstChild);
      root.appendChild(top);
    }

    /* Self ad TOP */
    const topAds = activeSelfAds('top');
    if(topAds.length){
      const wrap = document.createElement('div');
      wrap.innerHTML = topAds.map(selfAdCard).join('');
      root.appendChild(wrap);
    }

    /* MIDDLE */
    const middle = makeSlot('middle','');
    fillGoogleSlot(middle,'middle');

    if(mainSection){
      const children = Array.prototype.filter.call(
        mainSection.children || [],
        function(){ return true; }
      );
      const target = children.length > 1 ? children[Math.floor(children.length/2)] : null;
      if(target && target.parentNode){
        target.parentNode.insertBefore(middle,target);
      }else{
        root.appendChild(middle);
      }
    }else{
      root.appendChild(middle);
    }

    const middleAds = activeSelfAds('middle');
    if(middleAds.length){
      const wrap = document.createElement('div');
      wrap.className = 'info-ads-middle';
      wrap.innerHTML = middleAds.map(selfAdCard).join('');
      if(mainSection && mainSection.parentNode){
        mainSection.parentNode.insertBefore(wrap, mainSection.nextSibling);
      }else{
        root.appendChild(wrap);
      }
    }

    /* SIDEBAR: create only where a two-column content area exists */
    const candidate = document.querySelector('.directory, .detail-grid, .form-layout');
    const sidebarAds = activeSelfAds('sidebar');

    if(candidate && sidebarAds.length){
      const sidebar = document.createElement('aside');
      sidebar.className = 'info-ads-sidebar';
      sidebar.innerHTML = sidebarAds.map(selfAdCard).join('');
      candidate.appendChild(sidebar);
    }

    /* BOTTOM */
    const bottomRoot = document.createElement('div');
    bottomRoot.className = 'container';
    const bottom = makeSlot('bottom','');
    fillGoogleSlot(bottom,'bottom');
    bottomRoot.appendChild(bottom);

    const bottomAds = activeSelfAds('bottom');
    if(bottomAds.length){
      const wrap = document.createElement('div');
      wrap.innerHTML = bottomAds.map(selfAdCard).join('');
      bottomRoot.appendChild(wrap);
    }

    if(footer){
      footer.parentNode.insertBefore(bottomRoot,footer);
    }else{
      body.appendChild(bottomRoot);
    }
  }

  document.addEventListener('DOMContentLoaded',render);

  window.addEventListener('storage',function(e){
    if(e.key === ADS_KEY) location.reload();
  });
})();
