/* INFO UMKM — Admin Iklan
 * Prototype static: data iklan disimpan di localStorage.
 * Key publik yang dibaca oleh ads.js: infoUmkmAds
 */
(function(){
  'use strict';
  const KEY='infoUmkmAds';
  let editingId='';
  const $=id=>document.getElementById(id);
  function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
  function read(){try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x:[]}catch(e){return []}}
  function save(a){localStorage.setItem(KEY,JSON.stringify(a));render();}
  function positions(a){return Array.isArray(a.positions)?a.positions:[]}
  function reset(){editingId='';$('adForm').reset();$('formTitle').textContent='Buat Iklan Baru';$('saveBtn').textContent='Simpan Draft';$('adStatus').value='draft';updatePreview();}
  function getChecked(){return Array.from(document.querySelectorAll('input[name="positions"]:checked')).map(x=>x.value)}
  function load(id){const a=read().find(x=>String(x.id)===String(id));if(!a)return;editingId=a.id;$('formTitle').textContent='Edit Iklan';$('saveBtn').textContent='Simpan Perubahan';$('adTitle').value=a.title||'';$('adImage').value=a.image||'';$('adLink').value=a.link||'';$('adStatus').value=a.status||'draft';document.querySelectorAll('input[name="positions"]').forEach(x=>x.checked=positions(a).includes(x.value));$('adNote').value=a.note||'';updatePreview();window.scrollTo({top:0,behavior:'smooth'});}
  function submit(e){e.preventDefault();const title=$('adTitle').value.trim();if(!title){alert('Judul iklan wajib diisi.');return}const pos=getChecked();if(!pos.length){alert('Pilih minimal satu posisi iklan.');return}const now=new Date().toISOString();const arr=read();const old=editingId?arr.find(x=>x.id===editingId):null;const ad={id:editingId||('AD-'+Date.now()),title,image:$('adImage').value.trim(),link:$('adLink').value.trim()||'kontak.html',positions:pos,status:$('adStatus').value,note:$('adNote').value.trim(),createdAt:old?.createdAt||now,updatedAt:now};const next=editingId?arr.map(x=>x.id===editingId?ad:x):[ad,...arr];save(next);alert(ad.status==='active'?'Iklan berhasil diterbitkan.':'Iklan disimpan sebagai draft.');reset();}
  function remove(id){if(!confirm('Hapus iklan ini?'))return;save(read().filter(x=>x.id!==id));}
  function setStatus(id,status){const arr=read().map(x=>x.id===id?Object.assign({},x,{status,updatedAt:new Date().toISOString()}):x);save(arr);}
  function render(){const arr=read();const active=arr.filter(x=>x.status==='active').length;$('totalAds').textContent=arr.length;$('activeAds').textContent=active;$('draftAds').textContent=arr.filter(x=>x.status==='draft').length;$('pausedAds').textContent=arr.filter(x=>x.status==='paused').length;const body=$('adsTable');if(!arr.length){body.innerHTML='<tr><td colspan="6" class="ads-empty">Belum ada iklan. Buat iklan pertama dari form di sebelah kiri.</td></tr>';return}body.innerHTML=arr.map(a=>{const st=a.status||'draft';const btn=st==='active'?'<button class="ads-btn ads-btn-light" data-action="status" data-id="'+esc(a.id)+'" data-status="paused">Jeda</button>':'<button class="ads-btn ads-btn-success" data-action="status" data-id="'+esc(a.id)+'" data-status="active">Terbitkan</button>';return '<tr><td><img class="ads-thumb" src="'+esc(a.image||'')+'" onerror="this.style.display=\'none\'" alt=""></td><td><div class="ads-title">'+esc(a.title)+'</div><div class="ads-meta">'+esc(a.link||'')+'</div></td><td><div class="ads-pos">'+positions(a).map(p=>'<span>'+esc(p.toUpperCase())+'</span>').join('')+'</div></td><td><span class="ads-status ads-status-'+esc(st)+'">'+esc(st==='active'?'AKTIF':st==='paused'?'DIJEDA':'DRAFT')+'</span></td><td class="ads-meta">'+(a.updatedAt?new Date(a.updatedAt).toLocaleString('id-ID'):'-')+'</td><td><div class="ads-row-actions"><button class="ads-btn ads-btn-light" data-action="edit" data-id="'+esc(a.id)+'">Edit</button>'+btn+'<button class="ads-btn ads-btn-danger" data-action="delete" data-id="'+esc(a.id)+'">Hapus</button></div></td></tr>'}).join('')}
  function updatePreview(){const img=$('adImage').value.trim();$('previewSide').innerHTML=img?'<img src="'+esc(img)+'" alt="">':'SPACE IKLAN 300 × 250';$('previewMiddle').innerHTML=img?'<img src="'+esc(img)+'" alt="">':'SPACE ADS — MIDDLE';}
  document.addEventListener('DOMContentLoaded',function(){
    $('adForm').addEventListener('submit',submit);$('cancelBtn').addEventListener('click',reset);$('adImage').addEventListener('input',updatePreview);$('adsTable').addEventListener('click',function(e){const b=e.target.closest('[data-action]');if(!b)return;const id=b.dataset.id;if(b.dataset.action==='edit')load(id);if(b.dataset.action==='delete')remove(id);if(b.dataset.action==='status')setStatus(id,b.dataset.status)});render();updatePreview();
  });
  window.addEventListener('storage',function(e){if(e.key===KEY)render()});
})();
