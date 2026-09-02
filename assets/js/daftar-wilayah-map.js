(function(){
  const WILAYAH_ID = 'https://wilayah.id/api';
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

  // Wilayah Indonesia: gunakan API yang SAMA dengan patch Superadmin.
  // Hanya blok wilayah yang diperbaiki; kategori, maps, dan form lainnya tetap.
  const REGION_API = 'https://api.kodewilayah.web.id';
  const provinces = [
    ['11','Aceh'],['12','Sumatera Utara'],['13','Sumatera Barat'],['14','Riau'],['15','Jambi'],['16','Sumatera Selatan'],['17','Bengkulu'],['18','Lampung'],['19','Kepulauan Bangka Belitung'],['21','Kepulauan Riau'],
    ['31','DKI Jakarta'],['32','Jawa Barat'],['33','Jawa Tengah'],['34','Daerah Istimewa Yogyakarta'],['35','Jawa Timur'],['36','Banten'],
    ['51','Bali'],['52','Nusa Tenggara Barat'],['53','Nusa Tenggara Timur'],['61','Kalimantan Barat'],['62','Kalimantan Tengah'],['63','Kalimantan Selatan'],['64','Kalimantan Timur'],['65','Kalimantan Utara'],
    ['71','Sulawesi Utara'],['72','Sulawesi Tengah'],['73','Sulawesi Selatan'],['74','Sulawesi Tenggara'],['75','Gorontalo'],['76','Sulawesi Barat'],['81','Maluku'],['82','Maluku Utara'],
    ['91','Papua'],['92','Papua Barat'],['93','Papua Selatan'],['94','Papua Tengah'],['95','Papua Pegunungan'],['96','Papua Barat Daya']
  ];

  const province = $('province'), regency = $('regency'), district = $('district'), village = $('village');

  const options = (el, items, placeholder) => {
    el.innerHTML = '<option value="">'+placeholder+'</option>';
    items.forEach(x => {
      const o = document.createElement('option');
      o.value = String(x.code);
      o.textContent = String(x.name);
      el.appendChild(o);
    });
    el.disabled = false;
  };
  const loading = (el, text) => {
    if(!el) return;
    el.innerHTML = '<option value="">'+text+'</option>';
    el.disabled = true;
  };

  async function getList(level, code){
    const path = level === 'regencies' ? 'regencies' : level === 'districts' ? 'districts' : 'villages';
    const url = REGION_API + '/' + path + '/' + encodeURIComponent(code);
    const r = await fetch(url, {headers:{Accept:'application/json'}, cache:'no-store'});
    if(!r.ok) throw new Error('HTTP '+r.status+' '+url);
    const j = await r.json();
    const raw = j && j.success && Array.isArray(j.data) ? j.data : [];
    const items = raw.map(x => ({
      code: String(x.code || x.id || ''),
      name: String(x.name || '')
    })).filter(x => x.code && x.name);
    if(!items.length) throw new Error((j && j.message) || ('Data wilayah kosong: '+url));
    items.sort((a,b) => a.name.localeCompare(b.name,'id'));
    return items;
  }

  // Province memakai daftar kode yang sama dengan Superadmin agar parent code konsisten.
  options(province, provinces.map(p => ({code:p[0], name:p[1]})), 'Pilih Provinsi');
  loading(regency, 'Pilih Provinsi terlebih dahulu');
  loading(district, 'Pilih Kabupaten/Kota terlebih dahulu');
  loading(village, 'Pilih Kecamatan terlebih dahulu');

  let regionRequest = 0;
  async function loadRegencies(code){
    const requestId = ++regionRequest;
    loading(regency, 'Memuat Kabupaten/Kota...');
    loading(district, 'Pilih Kabupaten/Kota terlebih dahulu');
    loading(village, 'Pilih Kecamatan terlebih dahulu');
    if(!code) return;
    try{
      const items = await getList('regencies', code);
      if(requestId !== regionRequest) return;
      options(regency, items, 'Pilih Kabupaten/Kota');
    }catch(e){
      if(requestId !== regionRequest) return;
      loading(regency, 'Gagal memuat Kabupaten/Kota');
      console.error('INFO UMKM wilayah:', e);
    }
  }

  async function loadDistricts(code){
    const requestId = ++regionRequest;
    loading(district, 'Memuat Kecamatan...');
    loading(village, 'Pilih Kecamatan terlebih dahulu');
    if(!code) return;
    try{
      const items = await getList('districts', code);
      if(requestId !== regionRequest) return;
      options(district, items, 'Pilih Kecamatan');
    }catch(e){
      if(requestId !== regionRequest) return;
      loading(district, 'Gagal memuat Kecamatan');
      console.error('INFO UMKM wilayah:', e);
    }
  }

  async function loadVillages(code){
    const requestId = ++regionRequest;
    loading(village, 'Memuat Desa/Kelurahan...');
    if(!code) return;
    try{
      const items = await getList('villages', code);
      if(requestId !== regionRequest) return;
      options(village, items, 'Pilih Desa/Kelurahan');
    }catch(e){
      if(requestId !== regionRequest) return;
      loading(village, 'Gagal memuat Desa/Kelurahan');
      console.error('INFO UMKM wilayah:', e);
    }
  }

  province?.addEventListener('change', e => loadRegencies(e.target.value));
  regency?.addEventListener('change', e => loadDistricts(e.target.value));
  district?.addEventListener('change', e => loadVillages(e.target.value));

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
