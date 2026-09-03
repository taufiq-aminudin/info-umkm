(function(){
  'use strict';
  const KEY='infoUmkmAdminData';
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const read=()=>{try{const d=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(d)?d:[]}catch(e){return[]}};
  const life=v=>({active:'Aktif',moved:'Pindah Lokasi',closed:'Tutup'})[String(v||'active').toLowerCase()]||'Aktif';
  const badge=(v)=>{const s=String(v||'approved').toLowerCase();const text=s==='approved'?'Approved':s==='pending'?'Pending':s==='rejected'?'Rejected':s==='closed'?'Tutup':s==='moved'?'Pindah Lokasi':'Draft';return `<span class="status ${esc(s)}">${text}</span>`};
  function render(){
    const q=(document.getElementById('searchInput')?.value||'').trim().toLowerCase();
    const st=document.getElementById('statusFilter')?.value||'';
    const lifeFilter=document.getElementById('lifeFilter')?.value||'';
    let d=read().filter(x=>{
      const approval=String(x.status||'approved').toLowerCase();
      const lifecycle=String(x.businessStatus||'active').toLowerCase();
      const hay=[x.businessName,x.name,x.ownerName,x.owner,x.provinceName,x.regencyName,x.districtName,x.address,x.category,x.phone,x.email].join(' ').toLowerCase();
      return (!st||approval===st)&&(!lifeFilter||lifecycle===lifeFilter)&&(!q||hay.includes(q));
    });
    const el=document.getElementById('umkmTable');
    if(!el)return;
    el.innerHTML=d.map(x=>{
      const name=x.businessName||x.name||'-', owner=x.ownerName||x.owner||'-';
      const loc=[x.districtName,x.regencyName,x.provinceName].filter(Boolean).join(', ')||x.address||'-';
      return `<tr><td><b>${esc(name)}</b><br><small class="muted">${esc(x.id||'')}</small></td><td>${esc(owner)}</td><td>${esc(loc)}</td><td>${esc(x.category||'-')}</td><td>${badge(x.status)}<br><small class="lifecycle">${esc(life(x.businessStatus))}</small></td><td><div class="admin-actions"><a class="btn btn-outline" href="detail.html?id=${encodeURIComponent(x.id||'')}">Detail</a><a class="btn btn-primary" href="edit.html?id=${encodeURIComponent(x.id||'')}">Edit</a></div></td></tr>`;
    }).join('')||'<tr><td colspan="6" class="muted">Belum ada data UMKM.</td></tr>';
  }
  document.addEventListener('DOMContentLoaded',()=>{
    render();
    ['searchInput','statusFilter','lifeFilter'].forEach(id=>{const el=document.getElementById(id);if(el)el.addEventListener(id==='searchInput'?'input':'change',render)});
    window.addEventListener('storage',e=>{if(e.key===KEY)render()});
    const y=document.getElementById('year');if(y)y.textContent=new Date().getFullYear();
  });
})();
