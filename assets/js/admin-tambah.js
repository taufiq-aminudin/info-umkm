(function () {
  'use strict';

  // Wilayah menggunakan sumber yang SAMA dengan Direktori UMKM.
  // Jangan menggunakan sumber/API lain agar kode Provinsi -> Kabupaten/Kota -> Kecamatan konsisten.
  const REGION_API='https://api.kodewilayah.web.id';
  const provinces=[['11','Aceh'],['12','Sumatera Utara'],['13','Sumatera Barat'],['14','Riau'],['15','Jambi'],['16','Sumatera Selatan'],['17','Bengkulu'],['18','Lampung'],['19','Kepulauan Bangka Belitung'],['21','Kepulauan Riau'],['31','DKI Jakarta'],['32','Jawa Barat'],['33','Jawa Tengah'],['34','Daerah Istimewa Yogyakarta'],['35','Jawa Timur'],['36','Banten'],['51','Bali'],['52','Nusa Tenggara Barat'],['53','Nusa Tenggara Timur'],['61','Kalimantan Barat'],['62','Kalimantan Tengah'],['63','Kalimantan Selatan'],['64','Kalimantan Timur'],['65','Kalimantan Utara'],['71','Sulawesi Utara'],['72','Sulawesi Tengah'],['73','Sulawesi Selatan'],['74','Sulawesi Tenggara'],['75','Gorontalo'],['76','Sulawesi Barat'],['81','Maluku'],['82','Maluku Utara'],['91','Papua'],['92','Papua Barat'],['93','Papua Selatan'],['94','Papua Tengah'],['95','Papua Pegunungan'],['96','Papua Barat Daya']];
  const categories=['Kuliner & Makanan','Minuman','Fashion','Kerajinan','Pertanian','Perkebunan','Peternakan','Perikanan','Jasa','Perdagangan','Otomotif','Teknologi & Digital','Kesehatan','Kecantikan','Pendidikan','Pariwisata','Homestay & Penginapan','Industri','Konveksi','Furniture','Properti','Transportasi','Ekonomi Kreatif','Elektronik','Percetakan','Agribisnis','Bahan Bangunan','Energi','Logistik','Lainnya'];
  const $=id=>document.getElementById(id);
  function options(el,items,placeholder){el.innerHTML='<option value="">'+placeholder+'</option>';items.forEach(x=>{const o=document.createElement('option');o.value=x.code;o.textContent=x.name;el.appendChild(o)});el.disabled=false}
  function loading(el,text){el.innerHTML='<option value="">'+text+'</option>';el.disabled=true}
  async function getList(level,code){
    const path=level==='regencies'?'regencies':'districts';
    const url=REGION_API+'/'+path+'/'+encodeURIComponent(code);
    const r=await fetch(url,{headers:{Accept:'application/json'},cache:'no-store'});
    if(!r.ok) throw new Error('HTTP '+r.status+' '+url);
    const j=await r.json();
    const raw=j && j.success && Array.isArray(j.data)?j.data:[];
    const items=raw.map(x=>({code:String(x.code||x.id||''),name:String(x.name||'' )})).filter(x=>x.code&&x.name);
    if(!items.length) throw new Error((j&&j.message)||('Data wilayah kosong: '+url));
    return items;
  }
  let regionRequest=0;
  async function loadRegencies(code){
    const requestId=++regionRequest;
    loading($('regency'),'Memuat kabupaten/kota...');
    loading($('district'),'Pilih Kabupaten/Kota terlebih dahulu');
    if(!code){$('regency').disabled=true;return}
    try{
      const items=await getList('regencies',code);
      if(requestId!==regionRequest)return;
      options($('regency'),items,'Pilih Kabupaten/Kota');
    }catch(e){
      if(requestId!==regionRequest)return;
      options($('regency'),[],'Gagal memuat kabupaten/kota');
      $('regency').disabled=true;
      console.error('INFO UMKM wilayah:',e);
    }
  }
  async function loadDistricts(code){
    const requestId=++regionRequest;
    loading($('district'),'Memuat kecamatan...');
    if(!code){$('district').disabled=true;return}
    try{
      const items=await getList('districts',code);
      if(requestId!==regionRequest)return;
      options($('district'),items,'Pilih Kecamatan');
    }catch(e){
      if(requestId!==regionRequest)return;
      options($('district'),[],'Gagal memuat kecamatan');
      $('district').disabled=true;
      console.error('INFO UMKM wilayah:',e);
    }
  }
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
  function compressImage(file,maxWidth=1280,quality=.78){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onerror=()=>reject(reader.error||new Error('Gagal membaca foto.'));
      reader.onload=()=>{
        const img=new Image();
        img.onload=()=>{
          const scale=Math.min(1,maxWidth/img.width);
          const canvas=document.createElement('canvas');
          canvas.width=Math.max(1,Math.round(img.width*scale));
          canvas.height=Math.max(1,Math.round(img.height*scale));
          const ctx=canvas.getContext('2d');
          ctx.drawImage(img,0,0,canvas.width,canvas.height);
          resolve(canvas.toDataURL('image/jpeg',quality));
        };
        img.onerror=()=>reject(new Error('Foto tidak valid.'));
        img.src=reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
  function initGallery(){
    const input=$('gallery'),preview=$('galleryPreview');
    if(!input||!preview)return;
    input.addEventListener('change',async()=>{
      const files=Array.from(input.files||[]).slice(0,8);
      if(input.files.length>8)alert('Maksimal 8 foto gallery. Hanya 8 foto pertama yang digunakan.');
      preview.innerHTML='';
      for(const file of files){
        if(file.size>1.5*1024*1024){alert('Foto '+file.name+' melebihi 1,5 MB dan dilewati.');continue}
        if(!/^image\/(png|jpeg|webp)$/.test(file.type)){alert('Foto '+file.name+' harus JPG, PNG, atau WEBP.');continue}
        try{const src=await compressImage(file);const img=document.createElement('img');img.src=src;img.alt='Preview foto usaha';preview.appendChild(img)}catch(e){console.error(e)}
      }
    });
  }
  async function readGallery(){
    const input=$('gallery');if(!input)return[];
    const files=Array.from(input.files||[]).slice(0,8);const out=[];
    for(const file of files){
      if(file.size>1.5*1024*1024||!/^image\/(png|jpeg|webp)$/.test(file.type))continue;
      try{out.push(await compressImage(file))}catch(e){console.error(e)}
    }
    return out;
  }
  async function initForm(){
    const form=$('manualForm');
    form.addEventListener('submit',async e=>{
      e.preventDefault();
      if(!form.checkValidity()){form.reportValidity();return}
      if(!$('latitude').value||!$('longitude').value){alert('Silakan tentukan titik lokasi usaha pada peta.');return}
      if(!$('logo').files.length){alert('Logo usaha wajib diunggah.');return}
      const submit=form.querySelector('button[type="submit"]');
      if(submit){submit.disabled=true;submit.textContent='Menyimpan...'}
      try{
        const fd=new FormData(form);const data=Object.fromEntries(fd.entries());
        const province=$('province'),regency=$('regency'),district=$('district');
        data.provinceName=province.options[province.selectedIndex]?.text||'';
        data.regencyName=regency.options[regency.selectedIndex]?.text||'';
        data.districtName=district.options[district.selectedIndex]?.text||'';
        data.status='approved';data.source='admin';data.createdAt=new Date().toISOString();data.id='ADM-'+Date.now();data.logo=$('logoPreview').src||'';
        data.gallery=await readGallery();
        delete data.logoFile;
        const list=JSON.parse(localStorage.getItem('infoUmkmAdminData')||'[]');list.push(data);localStorage.setItem('infoUmkmAdminData',JSON.stringify(list));
        alert('UMKM berhasil ditambahkan dan berstatus Approved.');window.location.href='index.html';
      }catch(err){console.error(err);alert('Gagal menyimpan UMKM. Silakan coba lagi.');if(submit){submit.disabled=false;submit.textContent='Simpan & Terbitkan'}}
    });
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const province=$('province');
    const regency=$('regency');
    const district=$('district');
    if(!province||!regency||!district)return;
    const previousProvince=province.value;
    options(province,provinces.map(p=>({code:p[0],name:p[1]})),'Pilih Provinsi');
    if(previousProvince) province.value=previousProvince;
    const cat=$('category');categories.forEach(x=>{const o=document.createElement('option');o.value=x;o.textContent=x;cat.appendChild(o)});
    $('province').addEventListener('change',e=>loadRegencies(e.target.value));
    $('regency').addEventListener('change',e=>loadDistricts(e.target.value));
    if(province.value) loadRegencies(province.value);
    else { regency.disabled=true; district.disabled=true; }
    initLogo();initGallery();initForm();initMap();
  });
})();
