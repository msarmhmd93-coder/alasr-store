const storageKey = 'sewingStoreProducts';
const adminPassword = '7811'; // تم تغييره حسب طلبك

const loginPanel = document.getElementById('loginPanel');
const adminPanel = document.getElementById('adminPanel');
const loginBtn = document.getElementById('loginBtn');
const adminPass = document.getElementById('adminPass');

const productForm = document.getElementById('productForm');
const prodId = document.getElementById('prodId');
const prodName = document.getElementById('prodName');
const prodCategory = document.getElementById('prodCategory');
const prodStock = document.getElementById('prodStock');
const prodImage = document.getElementById('prodImage');
const prodVideo = document.getElementById('prodVideo');
const prodDesc = document.getElementById('prodDesc');
const adminList = document.getElementById('adminList');
const cancelEdit = document.getElementById('cancelEdit');
const logoutBtn = document.getElementById('logoutBtn');
const announceForm = document.getElementById('announceForm');
const announceTitle = document.getElementById('announceTitle');
const announceFile = document.getElementById('announceFile');
const announceList = document.getElementById('announceList');

function readProducts(){
  const saved = localStorage.getItem(storageKey);
  if(!saved) return [];
  try{return JSON.parse(saved);}catch(e){return []}
}
function saveProducts(list){localStorage.setItem(storageKey,JSON.stringify(list))}

let pendingImageData = null;
let pendingVideoData = null;
let pendingAnnVideo = null;

prodImage.addEventListener('change',(e)=>{
  const f = e.target.files[0]; if(!f) { pendingImageData = null; return }
  const r = new FileReader(); r.onload = ()=>{ pendingImageData = r.result }; r.readAsDataURL(f);
});
prodVideo.addEventListener('change',(e)=>{
  const f = e.target.files[0]; if(!f) { pendingVideoData = null; return }
  const r = new FileReader(); r.onload = ()=>{ pendingVideoData = r.result }; r.readAsDataURL(f);
});

announceFile.addEventListener('change',(e)=>{
  const f = e.target.files[0]; if(!f){ pendingAnnVideo = null; return }
  const r = new FileReader(); r.onload = ()=>{ pendingAnnVideo = r.result }; r.readAsDataURL(f);
});

function renderAdminList(){
  const list = readProducts();
  if(!list.length){adminList.innerHTML='<p class="empty-state">لا توجد منتجات بعد.</p>';return}
  adminList.innerHTML = list.map(p=>`<div class="admin-item"><div>
    <strong>${p.name}</strong><br/><small>${p.category} — ${p.stock} متوفر</small>
    </div>
    <div style="display:flex;gap:8px">
      <button class="small edit" data-id="${p.id}">تعديل</button>
      <button class="small del" data-id="${p.id}">حذف</button>
    </div></div>`).join('')
}

// Announcements storage and rendering in admin
const annKey = 'sewingAnnouncements';
function readAnns(){ try{ const s=localStorage.getItem(annKey); return s?JSON.parse(s):[] }catch(e){return[]} }
function saveAnns(a){ localStorage.setItem(annKey, JSON.stringify(a)) }
function renderAnnAdmin(){
  const a = readAnns();
  if(!announceList) return;
  if(!a.length){ announceList.innerHTML = '<p class="empty-state">لا توجد إعلانات حالياً.</p>'; return }
  announceList.innerHTML = a.map(item=>`<div class="admin-item"><div><strong>${item.title||'إعلان'}</strong></div>
    <div style="display:flex;gap:8px"><button class="small del-ann" data-id="${item.id}">حذف</button></div></div>`).join('')
}

announceList && announceList.addEventListener('click',(e)=>{
  const t=e.target; if(t.classList.contains('del-ann')){
    if(!confirm('حذف الإعلان؟')) return; const id=Number(t.dataset.id); const next = readAnns().filter(x=>x.id!==id); saveAnns(next); renderAnnAdmin(); alert('تم الحذف'); }
});

announceForm && announceForm.addEventListener('submit', e=>{
  e.preventDefault();
  if(!pendingAnnVideo){ alert('اختر ملف الفيديو أولاً'); return }
  const title = (announceTitle.value||'إعلان').trim();
  const arr = readAnns(); arr.unshift({ id: Date.now(), title, video: pendingAnnVideo }); saveAnns(arr); pendingAnnVideo = null; announceForm.reset(); renderAnnAdmin(); alert('تم إضافة الإعلان');
});

// ensure admin announcement list shown
renderAnnAdmin();

function startEdit(id){
  const list = readProducts();
  const p = list.find(x=>x.id===id);
  if(!p) return;
  prodId.value = p.id; prodName.value=p.name; prodCategory.value=p.category; prodStock.value=p.stock||0; prodImage.value=p.image||''; prodVideo.value=p.video||''; prodDesc.value=p.description||'';
}

adminList.addEventListener('click',(e)=>{
  const t=e.target;
  if(t.classList.contains('edit')){startEdit(Number(t.dataset.id));}
  if(t.classList.contains('del')){
    if(!confirm('هل تريد حذف المنتج؟')) return;
    const id=Number(t.dataset.id);
    const list=readProducts().filter(x=>x.id!==id); saveProducts(list); renderAdminList(); alert('تم الحذف');
  }
});

productForm.addEventListener('submit',e=>{
  e.preventDefault();
  const name=prodName.value.trim(); if(!name){alert('الاسم مطلوب');return}
  const list=readProducts();
  const item = {id: prodId.value?Number(prodId.value):Date.now(), name, category:prodCategory.value||'', stock: Number(prodStock.value)||0, image: pendingImageData || '', video: pendingVideoData || '', description:prodDesc.value||'' }
  if(prodId.value){
    const idx=list.findIndex(x=>x.id===item.id); if(idx>=0) list[idx]=item;
  } else { list.unshift(item) }
  saveProducts(list); renderAdminList(); productForm.reset(); prodId.value=''; alert('تم الحفظ');
});

cancelEdit.addEventListener('click',()=>{productForm.reset(); prodId.value=''});

logoutBtn.addEventListener('click',()=>{sessionStorage.removeItem('isAdmin'); location.reload();});

loginBtn.addEventListener('click',()=>{
  if(adminPass.value===adminPassword){ sessionStorage.setItem('isAdmin','1'); showAdmin(); } else { alert('كلمة المرور خاطئة') }
});

function showAdmin(){ loginPanel.style.display='none'; adminPanel.style.display='block'; renderAdminList(); }

if(sessionStorage.getItem('isAdmin')) showAdmin();

// If no products yet in storage, initialize with a few defaults so owner can edit
if(!localStorage.getItem(storageKey)){
  const sample=[
    {id:1,name:'عباية سوداء أنيقة',category:'عبايات',price:250,stock:8,description:'عباية أنيقة',image:'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'},
    {id:2,name:'برقع شيفون فاخر',category:'براقع',price:180,stock:12,description:'برقع شيفون',image:'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80'}
  ]; saveProducts(sample);
}

renderAdminList();
