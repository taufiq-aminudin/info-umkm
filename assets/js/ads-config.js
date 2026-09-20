/*
 * INFO UMKM — Google AdSense & Monetization Configuration
 *
 * Mendukung sinkronisasi otomatis dari panel Superadmin Settings & LocalStorage.
 * Anda juga dapat memasukkan ID secara langsung di file ini:
 * - window.INFO_UMKM_ADSENSE_CLIENT = "ca-pub-1234567890123456";
 */

(function(){
  'use strict';
  // Ambil dari localStorage jika disimpan dari Superadmin
  var storedClient = localStorage.getItem('infoUmkmAdsenseClient') || '';
  var storedSlots = {};
  try {
    storedSlots = JSON.parse(localStorage.getItem('infoUmkmAdsenseSlots') || '{}');
  } catch(e){}

  window.INFO_UMKM_ADSENSE_CLIENT = window.INFO_UMKM_ADSENSE_CLIENT || storedClient || "";
  window.INFO_UMKM_ADSENSE_SLOTS = window.INFO_UMKM_ADSENSE_SLOTS || {
    top: storedSlots.top || "",
    middle: storedSlots.middle || "",
    sidebar: storedSlots.sidebar || "",
    bottom: storedSlots.bottom || ""
  };

  // Upaya sinkronisasi dengan backend server jika tersedia
  if (typeof fetch === 'function') {
    fetch('/api/seo-ads-config')
      .then(function(r){ return r.json(); })
      .then(function(cfg){
        if (cfg && cfg.adsenseClient) {
          window.INFO_UMKM_ADSENSE_CLIENT = cfg.adsenseClient;
          if (cfg.adsenseSlots) window.INFO_UMKM_ADSENSE_SLOTS = cfg.adsenseSlots;
          // Inisialisasi ulang ads jika sudah siap
          if (window.__INFO_UMKM_INIT_ADSENSE__) {
            window.__INFO_UMKM_INIT_ADSENSE__();
          }
        }
        if (cfg && cfg.googleSiteVerification) {
          var metaGsc = document.querySelector('meta[name="google-site-verification"]');
          if (metaGsc && !metaGsc.getAttribute('content')) {
            metaGsc.setAttribute('content', cfg.googleSiteVerification);
          }
        }
      })
      .catch(function(){ /* Fallback aman offline / local */ });
  }
})();
