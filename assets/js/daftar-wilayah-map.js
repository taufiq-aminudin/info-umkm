(function(){
  const WILAYAH = 'https://wilayah.id/api';
  const categories = [
    'Kuliner','Fashion','Pertanian','Perkebunan','Peternakan','Perikanan','Kehutanan',
    'Kerajinan','Jasa','Perdagangan','Manufaktur','Otomotif','Kecantikan','Kesehatan',
    'Pendidikan','Teknologi & Digital','Pariwisata','Transportasi','Properti','Ekonomi Kreatif','Lainnya'
  ];

  const $ = id => document.getElementById(id);
  const setOptions = (el, items, placeholder) => {
    el.innerHTML = '<option value="">'+placeholder+'</option>' + items.map(x=>`<option value="${x.code}">${x.name}</option>`).join('');
    el.disabled = false;
  };
  const setLoading = (el, text) => { el.innerHTML = `<option value="">${text}</option>`; el.disabled = true; };
  const api = async url => {
    const r = await fetch(url, {headers:{'Accept':'application/json'}});
    if(!r.ok) throw new Error('Gagal mengambil data wilayah');
    const j = await r.json();
    return j.data || [];
  };

  // Kategori lengkap di sisi frontend; dapat diperluas tanpa mengubah layout.
  const category = $('category');
  if(category) category.innerHTML = '<option value="">Pilih kategori</option>' + categories.map(c=>`<option>${c}</option>`).join('');

  // Wilayah Indonesia: Provinsi -> Kabupaten/Kota -> Kecamatan -> Desa/Kelurahan.
  const province = $('province'), regency = $('regency'), district = $('district'), village = $('village');
  api(WILAYAH + '/provinces.json').then(items=>setOptions(province,items,'Pilih Provinsi')).catch(()=>setLoading(province,'Gagal memuat provinsi'));
  province?.addEventListener('change', async function(){
    setLoading(regency,'Memuat Kabupaten/Kota...'); setLoading(district,'Pilih Kabupaten/Kota terlebih dahulu'); setLoading(village,'Pilih Kecamatan terlebih dahulu');
    if(!this.value) { setLoading(regency,'Pilih Provinsi terlebih dahulu'); return; }
    try { setOptions(regency, await api(WILAYAH + '/regencies/' + encodeURIComponent(this.value) + '.json'),'Pilih Kabupaten/Kota'); }
    catch(e){ setLoading(regency,'Gagal memuat Kabupaten/Kota'); }
  });
  regency?.addEventListener('change', async function(){
    setLoading(district,'Memuat Kecamatan...'); setLoading(village,'Pilih Kecamatan terlebih dahulu');
    if(!this.value) { setLoading(district,'Pilih Kabupaten/Kota terlebih dahulu'); return; }
    try { setOptions(district, await api(WILAYAH + '/districts/' + encodeURIComponent(this.value) + '.json'),'Pilih Kecamatan'); }
    catch(e){ setLoading(district,'Gagal memuat Kecamatan'); }
  });
  district?.addEventListener('change', async function(){
    setLoading(village,'Memuat Desa/Kelurahan...');
    if(!this.value) { setLoading(village,'Pilih Kecamatan terlebih dahulu'); return; }
    try { setOptions(village, await api(WILAYAH + '/villages/' + encodeURIComponent(this.value) + '.json'),'Pilih Desa/Kelurahan'); }
    catch(e){ setLoading(village,'Gagal memuat Desa/Kelurahan'); }
  });

  // Leaflet + OpenStreetMap: tidak membutuhkan Google Maps API key.
  const mapEl = $('mapPicker');
  if(!mapEl || typeof L === 'undefined') return;
  const indonesia = [-2.5, 118.0], zoom = 5;
  const map = L.map(mapEl, {scrollWheelZoom:true}).setView(indonesia, zoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  let marker = null;

  function setPoint(lat,lng){
    if(!Number.isFinite(lat)||!Number.isFinite(lng)) return;
    if(!marker) marker=L.marker([lat,lng],{draggable:true}).addTo(map);
    else marker.setLatLng([lat,lng]);
    $('latitude').value = lat.toFixed(7);
    $('longitude').value = lng.toFixed(7);
    marker.bindPopup('Lokasi usaha').openPopup();
  }
  map.on('click', e=>setPoint(e.latlng.lat,e.latlng.lng));
  function wireMarker(){ marker?.on('dragend', e=>{ const p=e.target.getLatLng(); setPoint(p.lat,p.lng); }); }
  map.on('click', ()=>wireMarker());
  const originalSetPoint=setPoint;
  setPoint=function(lat,lng){ originalSetPoint(lat,lng); wireMarker(); };

  $('centerIndonesia')?.addEventListener('click',()=>map.setView(indonesia,zoom));
  $('useMyLocation')?.addEventListener('click',()=>{
    if(!navigator.geolocation){ alert('Browser tidak mendukung lokasi otomatis.'); return; }
    navigator.geolocation.getCurrentPosition(pos=>{
      const {latitude,longitude}=pos.coords; map.setView([latitude,longitude],16); setPoint(latitude,longitude);
    },()=>alert('Lokasi tidak dapat diakses. Aktifkan izin lokasi browser.'));
  });

  window.addEventListener('resize',()=>setTimeout(()=>map.invalidateSize(),150));

  const form = $('umkmForm'), status = $('formStatus');
  form?.addEventListener('submit', function(e){
    e.preventDefault();
    if(!this.reportValidity()) return;
    if(!$('latitude').value || !$('longitude').value){
      status.style.display='block'; status.textContent='Silakan tentukan titik lokasi usaha pada peta terlebih dahulu.'; mapEl.scrollIntoView({behavior:'smooth',block:'center'}); return;
    }
    const file = this.querySelector('input[type=file]')?.files?.[0];
    if(file && file.size > 2*1024*1024){
      status.style.display='block'; status.textContent='Ukuran file KTP maksimal 2MB.'; return;
    }
    status.style.display='block';
    status.textContent='Pendaftaran demo berhasil disiapkan. Pada versi produksi, data akan dikirim ke antrean approval Superadmin.';
  });

  const y=$('year'); if(y) y.textContent=new Date().getFullYear();
})();
