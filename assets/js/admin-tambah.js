(function(){
  'use strict';
  const API='https://wilayah.web.id/api';
  const provinces=[['11','Aceh'],['12','Sumatera Utara'],['13','Sumatera Barat'],['14','Riau'],['15','Jambi'],['16','Sumatera Selatan'],['17','Bengkulu'],['18','Lampung'],['19','Kepulauan Bangka Belitung'],['21','Kepulauan Riau'],['31','DKI Jakarta'],['32','Jawa Barat'],['33','Jawa Tengah'],['34','Daerah Istimewa Yogyakarta'],['35','Jawa Timur'],['36','Banten'],['51','Bali'],['52','Nusa Tenggara Barat'],['53','Nusa Tenggara Timur'],['61','Kalimantan Barat'],['62','Kalimantan Tengah'],['63','Kalimantan Selatan'],['64','Kalimantan Timur'],['65','Kalimantan Utara'],['71','Sulawesi Utara'],['72','Sulawesi Tengah'],['73','Sulawesi Selatan'],['74','Sulawesi Tenggara'],['75','Gorontalo'],['76','Sulawesi Barat'],['81','Maluku'],['82','Maluku Utara'],['91','Papua'],['92','Papua Barat'],['93','Papua Selatan'],['94','Papua Tengah'],['95','Papua Pegunungan'],['96','Papua Barat Daya']];
  const categories=['Kuliner & Makanan','Minuman','Fashion','Kerajinan','Pertanian','Perkebunan','Peternakan','Perikanan','Jasa','Perdagangan','Otomotif','Teknologi & Digital','Kesehatan','Kecantikan','Pendidikan','Pariwisata','Homestay & Penginapan','Industri','Konveksi','Furniture','Properti','Transportasi','Ekonomi Kreatif','Elektronik','Percetakan','Agribisnis','Bahan Bangunan','Energi','Logistik','Lainnya'];
  const $=id=>document.getElementById(id);
  function options(el,items,placeholder){el.innerHTML='<option value="">'+placeholder+'</option>';items.forEach(x=>{const o=document.createElement('option');o.value=x.code;o.textContent=x.name;el.appendChild(o)});el.disabled=false}
  async function get(url){const r=await fetch(url,{headers:{Accept:'application/json'}});if(!r.ok)throw Error('HTTP '+r.status);const j=await r.json();return Array.isArray(j.data)?j.data.map(x=>({code:String(x.code||x.id||''),name:String(x.name||'')})).filter(x=>x.code&&x.name):[]}
  function loading(el,text){el.innerHTML='<option value="">'+text+'</option>';el.disabled=true}
  async function loadRegencies(code){loading($('regency'),'Memuat kabupaten/kota...');loading($('district'),'Pilih Kabupaten/Kota terlebih dahulu');if(!code)return;try{options($('regency'),await get(API+'/regencies/'+encodeURIComponent(code)+'?limit=100'),'Pilih Kabupaten/Kota')}catch(e){options($('regency'),[],'Gagal memuat kabupaten/kota');$('regency').disabled=true;console.error(e)}}
  async function loadDistricts(code){loading($('district'),'Memuat kecamatan...');if(!code)return;try{options($('district'),await get(API+'/districts/'+encodeURIComponent(code)+'?limit=1000'),'Pilih Kecamatan')}catch(e){options($('district'),[],'Gagal memuat kecamatan');$('district').disabled=true;console.error(e)}}
  function initMap(){
    if(!window.L)return;
    const map=L.map('businessMap').setView([-2.5489,118.0149],5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
    let marker=null;
    function setPoint(lat,lng){const p=[lat,lng];$('latitude').value=Number(lat).toFixed(6);$('longitude').value=Number(lng).toFixed(6);if(marker)marker.setLatLng(p);else marker=L.marker(p).addTo(map)}
    map.on('click',e=>setPoint(e.latlng.lat,e.latlng.lng));
    $('setLocation').addEventListener('click',()=>{if(!navigator.geolocation){alert('Browser tidak mendukung lokasi perangkat. Klik langsung pada peta.');return}navigator.geolocation.getCurrentPosition(pos=>{const p=[pos.coords.latitude,pos.coords.longitude];map.setView(p,16);setPoint(p[0],p[1])},()=>alert('Lokasi perangkat tidak dapat diakses. Klik langsung pada peta.'))});
    setTimeout(()=>map.invalidateSize(),150);
  }
  function initLogo(){
    $('logo').addEventListener('change',e=>{
      const f=e.target.files[0];if(!f)return;
      if(f.size>2*1024*1024){alert('Ukuran logo maksimal 2 MB.');e.target.value='';return}
      if(!/^image\/(png|jpeg|webp|svg\+xml)$/.test(f.type)){alert('Logo harus berupa JPG, PNG, WEBP, atau SVG.');e.target.value='';return}
      const r=new FileReader();r.onload=()=>{$('logoPreview').src=r.result;$('logoPreview').style.display='block';$('logoPlaceholder').style.display='none'};r.readAsDataURL(f);
    });
  }
  function initForm(){
    const form=$('manualForm');
    form.addEventListener('submit',e=>{
      e.preventDefault();
      if(!form.checkValidity()){form.reportValidity();return}
      if(!$('latitude').value||!$('longitude').value){alert('Silakan tentukan titik lokasi usaha pada peta.');return}
      if(!$('logo').files.length){alert('Logo usaha wajib diunggah.');return}
      const fd=new FormData(form);const data=Object.fromEntries(fd.entries());
      data.status='approved';data.source='admin';data.createdAt=new Date().toISOString();data.id='ADM-'+Date.now();data.logo=$('logoPreview').src||'';
      const list=JSON.parse(localStorage.getItem('infoUmkmAdminData')||'[]');list.push(data);localStorage.setItem('infoUmkmAdminData',JSON.stringify(list));
      alert('UMKM berhasil ditambahkan dan berstatus Approved.');window.location.href='index.html';
    });
  }
  document.addEventListener('DOMContentLoaded',()=>{
    options($('province'),provinces.map(p=>({code:p[0],name:p[1]})),'Pilih Provinsi');
    const cat=$('category');categories.forEach(x=>{const o=document.createElement('option');o.value=x;o.textContent=x;cat.appendChild(o)});
    $('province').addEventListener('change',e=>loadRegencies(e.target.value));
    $('regency').addEventListener('change',e=>loadDistricts(e.target.value));
    initLogo();initForm();initMap();
  });
})();
