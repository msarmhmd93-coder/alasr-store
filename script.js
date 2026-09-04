const storageKey = 'sewingStoreProducts';
const productList = document.getElementById('productList');
const totalProductsStat = document.getElementById('totalProductsStat');
const stockStat = document.getElementById('stockStat');

function readProducts(){
  const saved = localStorage.getItem(storageKey);
  if(!saved) return [];
  try{return JSON.parse(saved);}catch(e){return []}
}
function formatPrice(value){
  return new Intl.NumberFormat('ar-SA',{style:'currency',currency:'SAR',maximumFractionDigits:2}).format(Number(value||0));
}

function renderProducts(){
  const products = readProducts();
  const totalProducts = products.length;
  const totalStock = products.reduce((s,p)=>s+Number(p.stock||0),0);
  if(totalProductsStat) totalProductsStat.textContent = totalProducts;
  if(stockStat) stockStat.textContent = totalStock;

  if(!products.length){ productList.innerHTML = '<p class="empty-state">لا توجد منتجات حالياً.</p>'; return }
  // Get announcements and set hero (first announcement shown on top)
  const annKey = 'sewingAnnouncements';
  let annsAll = [];
  try{ const s = localStorage.getItem(annKey); annsAll = s?JSON.parse(s):[] }catch(e){annsAll=[]}

  // Render hero announcement if exists (first announcement)
  if(annsAll.length){
    const first = annsAll[0];
    const heroCard = document.querySelector('.hero-card');
    if(heroCard){
      heroCard.innerHTML = `\
        <video src="${first.video}" autoplay muted loop playsinline style="width:100%;height:220px;object-fit:cover;border-radius:18px"></video>\
      `;
    }
  }

  // Prepare interleaving announcements (exclude first used as hero)
  const interAnns = annsAll.length>1 ? annsAll.slice(1) : [];

  // Build product HTML and interleave announcement videos among products
  const parts = [];
  const annCount = interAnns.length;
  let annIndex = 0;
  const interval = annCount ? Math.max(1, Math.ceil(products.length / annCount)) : 0;

  products.forEach((product, idx)=>{
    const videoBtn = product.video ? `<button class="small-btn" data-video="${product.video}" onclick="openVideo(this)">عرض فيديو</button>` : '';
    parts.push(`
      <article class="product-card">
        <img src="${product.image||''}" alt="${product.name}" />
        <div class="product-body">
          <div class="product-header">
            <h3>${product.name}</h3>
          </div>
          <div class="product-price-row">
            <span class="tag">${product.category||''}</span>
            ${videoBtn}
              <button class="small-btn" onclick="addToCart(${product.id})">أضف للسلة</button>
            </div>
          <p>${product.description||''}</p>
        </div>
      </article>
    `);

    // after pushing product, insert announcement if needed
    if(interval && ((idx + 1) % interval === 0) && annIndex < annCount){
      const ann = interAnns[annIndex++];
      parts.push(`
        <div class="product-card"> 
          <div class="product-body">
            <video src="${ann.video}" controls muted playsinline style="width:100%;height:240px;object-fit:cover;border-radius:12px"></video>
            <div style="padding:10px"><strong>${ann.title||''}</strong></div>
          </div>
        </div>
      `);
    }
  });

  productList.innerHTML = parts.join('');

  // Render video showcase (videos uploaded for products)
  const videoListEl = document.getElementById('videoList');
  if(videoListEl){
    const videos = products.filter(p=>p.video).slice(0,6);
    if(!videos.length){
      videoListEl.innerHTML = '<p class="empty-state">لا توجد فيديوهات عرض حالياً.</p>';
    } else {
      videoListEl.innerHTML = videos.map(v=>`
        <div class="video-card">
          <video controls width="320" src="${v.video}"></video>
          <div style="padding:8px"><strong>${v.name}</strong><div class="tag">${v.category||''}</div></div>
        </div>
      `).join('')
    }
  }
}

  // CART FUNCTIONS
  const cartKey = 'sewingCart';
  function readCart(){ try{ const s=localStorage.getItem(cartKey); return s?JSON.parse(s):[] }catch(e){return[]} }
  function saveCart(c){ localStorage.setItem(cartKey, JSON.stringify(c)); updateCartCount(); }
  function updateCartCount(){ const c = readCart(); const count = c.reduce((s,i)=>s+i.qty,0); const el = document.getElementById('cartCount'); if(el) el.textContent = count; }

  function addToCart(id){ const products = readProducts(); const p = products.find(x=>x.id===id); if(!p){ alert('المنتج غير متوفر'); return }
    const cart = readCart(); const idx = cart.findIndex(i=>i.id===id); if(idx>=0){ cart[idx].qty = cart[idx].qty + 1 } else { cart.push({ id: p.id, name: p.name, qty:1, image: p.image||'' }) }
    saveCart(cart); alert('أضيف إلى السلة'); }

  function openCart(){ const modal = document.getElementById('cartModal'); if(!modal) return; modal.setAttribute('aria-hidden','false'); renderCartItems(); }
  function closeCart(){ const modal = document.getElementById('cartModal'); if(!modal) return; modal.setAttribute('aria-hidden','true'); }

  function renderCartItems(){ const itemsEl = document.getElementById('cartItems'); if(!itemsEl) return; const cart = readCart(); if(!cart.length){ itemsEl.innerHTML = '<p class="empty-state">السلة فارغة.</p>'; return }
    itemsEl.innerHTML = cart.map(it=>`<div class="cart-item"><img src="${it.image||''}" alt="${it.name}"/><div class="meta"><strong>${it.name}</strong></div><div class="qty"><button class="cancel-btn" onclick="changeQty(${it.id},-1)">-</button><span>${it.qty}</span><button class="submit-btn" onclick="changeQty(${it.id},1)">+</button><button class="cancel-btn" onclick="removeFromCart(${it.id})">حذف</button></div></div>`).join('') }

  function changeQty(id, delta){ const cart = readCart(); const idx = cart.findIndex(i=>i.id===id); if(idx<0) return; cart[idx].qty = Math.max(0, cart[idx].qty + delta); if(cart[idx].qty===0) cart.splice(idx,1); saveCart(cart); renderCartItems(); }
  function removeFromCart(id){ const cart = readCart().filter(i=>i.id!==id); saveCart(cart); renderCartItems(); }

  function clearCart(){ if(!confirm('تفريغ السلة؟')) return; saveCart([]); renderCartItems(); }

  function checkoutViaWhatsApp(){ const cart = readCart(); if(!cart.length){ alert('السلة فارغة'); return }
    let msg = 'طلب من مشغل العسر%0A'; cart.forEach((it,idx)=>{ msg += `${idx+1}. ${encodeURIComponent(it.name)} - الكمية: ${it.qty}%0A` });
    msg += '%0A';
    const phone = '781159414';
    const url = `https://wa.me/${phone}?text=${msg}`;
    // open
    window.open(url, '_blank');
  }

  // Hook cart UI
  document.addEventListener('click',(e)=>{
    if(e.target && e.target.id==='cartToggle') openCart();
    if(e.target && e.target.id==='closeCart') closeCart();
    if(e.target && e.target.id==='clearCart') clearCart();
    if(e.target && e.target.id==='checkoutBtn') checkoutViaWhatsApp();
  });

  // initialize cart count
  updateCartCount();

// Render public announcements (uploads from admin)
function renderAnnouncements(){
  const annKey = 'sewingAnnouncements';
  let anns = [];
  try{ const s = localStorage.getItem(annKey); anns = s?JSON.parse(s):[] }catch(e){anns=[]}
  const el = document.getElementById('announcementList');
  if(!el) return;
  if(!anns.length){ el.innerHTML = '<p class="empty-state">لا توجد إعلانات حالياً.</p>'; return }
  el.innerHTML = anns.map(a=>`<div class="announce-video"><video src="${a.video}" controls autoplay muted loop playsinline></video><div class="announce-title">${a.title||''}</div></div>`).join('')
}

// call announcements renderer on load
renderAnnouncements();


window.openVideo = function(btn){
  const url = btn.dataset.video;
  if(!url) return;
  const win = window.open(url, '_blank');
  if(!win) alert('لا يمكن فتح الفيديو - تحقق من إعدادات المنبثقات');
}

// Initialize storage with defaults if empty
if(!localStorage.getItem(storageKey)){
  const sample=[
    {id:1,name:'عباية سوداء أنيقة',category:'عبايات',stock:8,description:'عباية أنيقة',image:'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'},
    {id:2,name:'برقع شيفون فاخر',category:'براقع',stock:12,description:'برقع شيفون',image:'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80'}
  ]; localStorage.setItem(storageKey,JSON.stringify(sample));
}

renderProducts();
