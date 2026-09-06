const STORAGE_KEYS = {
  products: 'mashgalAlOsor.products',
  videos: 'mashgalAlOsor.videos',
  gallery: 'mashgalAlOsor.gallery',
  hero: 'mashgalAlOsor.hero',
  admin: 'mashgalAlOsor.adminLoggedIn',
  shopStatus: 'mashgalAlOsor.shopOpen',
  adminEmails: 'mashgalAlOsor.adminEmails',
  cart: 'mashgalAlOsor.cart'
};

const DEFAULT_HERO_SHOWCASE = [
  {
    title: 'عباية ملكية',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'
  },
  {
    title: 'حجاب أنيق',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80'
  },
  {
    title: 'براقع فاخرة',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80'
  }
];

const DEFAULT_HERO = {
  title: 'مرحباً بكِ في مشغل العسر',
  text: 'مجموعة مختارة بعناية من الأقمشة الفاخرة، الألوان الراقية، والتصاميم العربية العصرية التي توازن بين الفخامة والراحة في كل يوم.',
  showcaseImages: [...DEFAULT_HERO_SHOWCASE]
};

const DEFAULT_ADMIN_EMAILS = {
  custom: 'hghyhgyh@gmail.com',
  official: 'msarmhmd93@gmail.com'
};

const ADMIN_CREDENTIALS = {
  email: 'msarmhmd93@gmail.com',
  password: '739959877'
};

const DEFAULT_PRODUCTS = [];
const DEFAULT_GALLERY_IMAGES = [];
const DEFAULT_VIDEOS = [];
const MAX_FILE_SIZES = {
  image: 2 * 1024 * 1024,
  video: 12 * 1024 * 1024
};

let products = [];
let videos = [];
let galleryImages = [];
let hero = { ...DEFAULT_HERO };
let adminEmails = { ...DEFAULT_ADMIN_EMAILS };
let isAdminLoggedIn = false;
let shopOpen = true;
let cart = [];

const CONTACT_NUMBERS = [
  { label: '770169698', link: 'https://wa.me/967770169698' },
  { label: '739959877', link: 'https://wa.me/967739959877' },
  { label: '781159414', link: 'https://wa.me/967781159414' }
];

const productGrid = document.getElementById('productGrid');
const imageGallery = document.getElementById('imageGallery');
const videoGallery = document.getElementById('videoGallery');
const cartModal = document.getElementById('cartModal');
const cartItemsList = document.getElementById('cartItemsList');
const cartCountBadge = document.getElementById('cartCountBadge');
const adminModal = document.getElementById('adminModal');
const loginState = document.getElementById('loginState');
const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const heroForm = document.getElementById('heroForm');
const galleryForm = document.getElementById('galleryForm');
const productForm = document.getElementById('productForm');
const videoForm = document.getElementById('videoForm');
const adminProductList = document.getElementById('adminProductList');
const adminVideoList = document.getElementById('adminVideoList');
const adminGalleryList = document.getElementById('adminGalleryList');
const heroTitleNode = document.getElementById('heroTitle');
const heroTextNode = document.getElementById('heroText');
const heroTitleInput = document.getElementById('heroTitleInput');
const heroTextInput = document.getElementById('heroTextInput');
const heroShowcaseNode = document.getElementById('heroShowcase');
const heroShowcaseFile1 = document.getElementById('heroShowcaseFile1');
const heroShowcaseFile2 = document.getElementById('heroShowcaseFile2');
const heroShowcaseFile3 = document.getElementById('heroShowcaseFile3');
const customEmailInput = document.getElementById('customEmailInput');
const officialEmailInput = document.getElementById('officialEmailInput');

function safeReadStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    return fallback;
  }
}

function safeWriteStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

function generateId(prefix) {
  if (window.crypto && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getYouTubeEmbedUrl(url) {
  const match = url.match(/(?:youtube\.com(?:\/[^\n\s]+\/\S+\/|\/watch\?v=|\/embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (!match || !match[1]) {
    return '';
  }
  return `https://www.youtube.com/embed/${match[1]}?rel=0`;
}

function formatPrice(value) {
  return `${Number(value).toLocaleString('en-US')} ر.س`;
}

function getSafeImage(value, fallback = 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80') {
  if (!value) return fallback;
  return value;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('لا يوجد ملف'));
      return;
    }

    const maxSize = file.type.startsWith('video/') ? MAX_FILE_SIZES.video : MAX_FILE_SIZES.image;

    if (file.size > maxSize) {
      reject(new Error(file.type.startsWith('video/') ? 'حجم الفيديو كبير جدًا، اختر فيديو أصغر من 12MB.' : 'حجم الصورة كبير جدًا، اختر صورة أصغر من 2MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('فشل قراءة الملف'));
    reader.readAsDataURL(file);
  });
}

function buildWhatsAppLink(product, selectedCategory = '') {
  const chosenCategory = (selectedCategory || product.category || 'غير محدد').trim();
  const text = `مرحباً، أود إضافة المنتج إلى سلة المشتريات: ${product.name}، نوع الصنف: ${chosenCategory}، الوصف: ${product.description || 'أرغب في معرفة التفاصيل والمتطلبات.'}، رقم التواصل: 781159414.`;
  return `https://wa.me/967781159414?text=${encodeURIComponent(text)}`;
}

function buildProductShareLink(product) {
  if (product.link && product.link.trim()) {
    return product.link.trim();
  }

  const productName = encodeURIComponent(product.name || 'منتج');
  return `https://www.google.com/search?q=${productName}`;
}

function readStoredCart() {
  const raw = localStorage.getItem(STORAGE_KEYS.cart);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCartState() {
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
  renderCartCount();
}

function renderCartCount() {
  const totalCount = cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  if (cartCountBadge) {
    cartCountBadge.textContent = String(totalCount);
  }
}

function openCartModal() {
  if (!cartModal) return;
  cartModal.classList.add('show');
  cartModal.setAttribute('aria-hidden', 'false');
  renderCart();
}

function closeCartModal() {
  if (!cartModal) return;
  cartModal.classList.remove('show');
  cartModal.setAttribute('aria-hidden', 'true');
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      category: product.category || 'منتجات',
      qty: 1
    });
  }

  saveCartState();
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCartState();
  renderCart();
}

function decreaseCartItem(productId) {
  const item = cart.find((entry) => entry.id === productId);
  if (!item) return;

  if (item.qty > 1) {
    item.qty -= 1;
  } else {
    removeFromCart(productId);
    return;
  }

  saveCartState();
  renderCart();
}

function renderCart() {
  if (!cartItemsList) return;

  if (!cart.length) {
    cartItemsList.innerHTML = '<div class="empty-state">السلة فارغة الآن. أضف بعض المنتجات لبدء الطلب.</div>';
    return;
  }

  cartItemsList.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
          <div>
            <strong>${item.name}</strong>
            <span>${item.category}</span>
          </div>
          <div class="cart-qty-row">
            <button type="button" class="qty-btn" data-action="decrease" data-product-id="${item.id}">−</button>
            <span>${item.qty}</span>
            <button type="button" class="qty-btn" data-action="increase" data-product-id="${item.id}">+</button>
          </div>
        </div>
      `
    )
    .join('');

  cartItemsList.querySelectorAll('.qty-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = button.dataset.productId;
      const action = button.dataset.action;
      if (action === 'increase') {
        addToCart(productId);
      } else {
        decreaseCartItem(productId);
      }
    });
  });
}

function buildCartWhatsAppLink() {
  if (!cart.length) {
    return 'https://wa.me/967781159414';
  }

  const items = cart
    .map((item) => `- ${item.name} (${item.category}) × ${item.qty}`)
    .join('\n');

  const text = `مرحباً، أود شراء المنتجات التالية من السلة:\n${items}\n\nرقم التواصل: 781159414.`;
  return `https://wa.me/967781159414?text=${encodeURIComponent(text)}`;
}

function renderAdminEmails() {
  if (customEmailInput) customEmailInput.value = adminEmails.custom || DEFAULT_ADMIN_EMAILS.custom;
  if (officialEmailInput) officialEmailInput.value = adminEmails.official || DEFAULT_ADMIN_EMAILS.official;
}

function renderShopStatus() {
  const statusBadge = document.getElementById('shopStatusBadge');
  const statusText = document.getElementById('shopStatusText');
  const heroStatusNote = document.getElementById('heroStatusNote');

  if (statusBadge) {
    statusBadge.textContent = shopOpen ? 'متجر مفتوح الآن' : 'متجر مغلق الآن';
    statusBadge.classList.toggle('closed', !shopOpen);
  }

  if (statusText) {
    statusText.textContent = shopOpen ? 'مفتوح الآن' : 'مغلق الآن';
  }

  if (heroStatusNote) {
    heroStatusNote.classList.toggle('closed', !shopOpen);
    const strong = heroStatusNote.querySelector('strong');
    if (strong) {
      strong.textContent = shopOpen ? 'مفتوح' : 'مغلق';
    }
  }
}

function renderHeroShowcase() {
  if (!heroShowcaseNode) return;

  const showcaseImages = Array.isArray(hero.showcaseImages) && hero.showcaseImages.length
    ? hero.showcaseImages
    : DEFAULT_HERO_SHOWCASE;

  const cards = showcaseImages.map((item, index) => {
    const largeClass = index === 0 ? 'large' : 'small';
    const accentClass = index === 2 ? 'accent' : '';
    const miniTag = index === 0 ? '<span class="mini-tag">أفضل المبيعات</span>' : '';
    const imageUrl = getSafeImage(item.image, DEFAULT_HERO_SHOWCASE[index]?.image || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80');

    return `
      <div class="showcase-card luxury-card ${largeClass} ${accentClass}">
        ${miniTag}
        <img class="showcase-image" src="${imageUrl}" alt="${item.title || DEFAULT_HERO_SHOWCASE[index]?.title || 'صورة'}" loading="lazy" />
        <div class="showcase-meta">
          <strong>${item.title || DEFAULT_HERO_SHOWCASE[index]?.title || 'منتج'}</strong>
        </div>
      </div>
    `;
  });

  const stacked = cards.slice(1).length ? `
    <div class="showcase-stack">
      ${cards.slice(1).join('')}
    </div>
  ` : '';

  heroShowcaseNode.innerHTML = `${cards[0] || ''}${stacked}`;
}

function renderHeroContent() {
  if (heroTitleNode) heroTitleNode.textContent = hero.title || DEFAULT_HERO.title;
  if (heroTextNode) heroTextNode.textContent = hero.text || DEFAULT_HERO.text;

  if (heroTitleInput) heroTitleInput.value = hero.title || DEFAULT_HERO.title;
  if (heroTextInput) heroTextInput.value = hero.text || DEFAULT_HERO.text;

  renderHeroShowcase();
}

function renderProducts() {
  if (!productGrid) return;

  if (!products.length) {
    productGrid.innerHTML = '<div class="empty-state">لا توجد منتجات حالياً. أضف منتجك الأول من لوحة التحكم.</div>';
    return;
  }

  productGrid.innerHTML = products
    .map(
      (product) => `
        <article class="product-card">
          <img class="product-image" src="${getSafeImage(product.image)}" alt="${product.name}" loading="lazy" />
          <div class="product-body">
            <div class="product-top">
              <h3>${product.name}</h3>
              <span class="category-badge">${product.category || 'منتج'}</span>
            </div>

            <label class="product-select-wrap">
              <span>اختر نوع الصنف</span>
              <select class="product-choice" data-product-id="${product.id}">
                <option value="${product.category || 'سلة مبيعات'}">${product.category || 'سلة مبيعات'}</option>
                <option value="سلة مبيعات">سلة مبيعات</option>
                <option value="منتجات">منتجات</option>
                <option value="مجموعات">مجموعات</option>
                <option value="أكثر طلباً">أكثر طلباً</option>
                <option value="إكسسوارات">إكسسوارات</option>
              </select>
            </label>

            <div class="product-meta">
              <span>رقم التواصل: 781159414</span>
              <span>الصنف: ${product.category || 'غير محدد'}</span>
            </div>

            <p class="product-note">${product.description || 'منتج مختار بعناية من تشكيلة العروض الجديدة.'}</p>

            <div class="product-actions-row">
              <button class="cart-add-btn" type="button" data-product-id="${product.id}">
                أضف للسلة
              </button>
              <a class="whatsapp-btn" href="${buildWhatsAppLink(product, product.category || 'غير محدد')}" target="_blank" rel="noreferrer" data-product-id="${product.id}">
                أضف إلى واتساب 🛒
              </a>
              <a class="share-btn" href="${buildProductShareLink(product)}" target="_blank" rel="noreferrer" aria-label="فتح رابط المنتج">🔗</a>
            </div>
          </div>
        </article>
      `
    )
    .join('');

  document.querySelectorAll('.cart-add-btn').forEach((button) => {
    button.addEventListener('click', () => {
      addToCart(button.dataset.productId);
      openCartModal();
    });
  });

  document.querySelectorAll('.whatsapp-btn').forEach((button) => {
    button.addEventListener('click', (event) => {
      const productId = button.dataset.productId;
      const product = products.find((item) => item.id === productId);
      const select = document.querySelector(`.product-choice[data-product-id="${productId}"]`);
      const selectedCategory = select ? select.value : (product?.category || 'غير محدد');
      const target = event.currentTarget;
      target.href = buildWhatsAppLink(product, selectedCategory);
    });
  });
}

function renderGalleryImages() {
  if (!imageGallery) return;

  const imagesToRender = galleryImages.length ? galleryImages : DEFAULT_GALLERY_IMAGES;

  imageGallery.innerHTML = imagesToRender
    .map(
      (item) => `
        <article class="image-gallery-card">
          <img src="${getSafeImage(item.image)}" alt="${item.title || 'صورة معرض'}" loading="lazy" />
          <div class="gallery-overlay">
            <strong>${item.title || 'معرض الصور'}</strong>
          </div>
        </article>
      `
    )
    .join('');
}

function renderVideos() {
  if (!videoGallery) return;

  if (!videos.length) {
    videoGallery.innerHTML = '<div class="empty-state">لا توجد فيديوهات ترويجية حالياً.</div>';
    return;
  }

  videoGallery.innerHTML = videos
    .map((video) => {
      const embed = getYouTubeEmbedUrl(video.url);
      const localVideoSrc = video.dataUrl || video.fileUrl;

      return `
        <article class="video-card">
          ${
            localVideoSrc
              ? `<video class="video-embed" src="${localVideoSrc}" controls playsinline preload="metadata"></video>`
              : embed
                ? `<iframe class="video-embed" src="${embed}" title="${video.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
                : '<div class="empty-state">ملف الفيديو غير صالح</div>'
          }
          <div class="video-content">
            <h3>${video.title}</h3>
            ${video.url ? `<a href="${video.url}" target="_blank" rel="noreferrer">فتح الفيديو</a>` : ''}
          </div>
        </article>
      `;
    })
    .join('');
}

function renderAdminProductList() {
  if (!adminProductList) return;

  if (!products.length) {
    adminProductList.innerHTML = '<li><span>لا توجد منتجات</span></li>';
    return;
  }

  adminProductList.innerHTML = products
    .map(
      (product) => `
        <li>
          <span>${product.name}</span>
          <button class="remove-btn" type="button" data-product-id="${product.id}">حذف</button>
        </li>
      `
    )
    .join('');
}

function renderAdminVideoList() {
  if (!adminVideoList) return;

  if (!videos.length) {
    adminVideoList.innerHTML = '<li><span>لا توجد فيديوهات</span></li>';
    return;
  }

  adminVideoList.innerHTML = videos
    .map(
      (video) => `
        <li>
          <span>${video.title}</span>
          <button class="remove-btn" type="button" data-video-id="${video.id}">حذف</button>
        </li>
      `
    )
    .join('');
}

function renderAdminGalleryList() {
  if (!adminGalleryList) return;

  if (!galleryImages.length) {
    adminGalleryList.innerHTML = '<li><span>لا توجد صور</span></li>';
    return;
  }

  adminGalleryList.innerHTML = galleryImages
    .map(
      (item) => `
        <li>
          <span>${item.title}</span>
          <button class="remove-btn" type="button" data-gallery-id="${item.id}">حذف</button>
        </li>
      `
    )
    .join('');
}

function openAdminModal() {
  adminModal.classList.add('show');
  adminModal.setAttribute('aria-hidden', 'false');
}

function closeAdminModal() {
  adminModal.classList.remove('show');
  adminModal.setAttribute('aria-hidden', 'true');
}

function showAdminInterface() {
  loginState.classList.add('hidden');
  adminPanel.classList.remove('hidden');
}

function hideAdminInterface() {
  adminPanel.classList.add('hidden');
  loginState.classList.remove('hidden');
  loginForm.reset();
}

function persistSession() {
  localStorage.setItem(STORAGE_KEYS.admin, String(isAdminLoggedIn));
}

function readStoredHero() {
  const raw = localStorage.getItem(STORAGE_KEYS.hero);
  if (!raw) return { ...DEFAULT_HERO, showcaseImages: [...DEFAULT_HERO_SHOWCASE] };

  try {
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_HERO,
      ...parsed,
      showcaseImages: Array.isArray(parsed.showcaseImages) && parsed.showcaseImages.length
        ? parsed.showcaseImages
        : [...DEFAULT_HERO_SHOWCASE]
    };
  } catch {
    return { ...DEFAULT_HERO, showcaseImages: [...DEFAULT_HERO_SHOWCASE] };
  }
}

function readStoredAdminEmails() {
  const raw = localStorage.getItem(STORAGE_KEYS.adminEmails);
  if (!raw) return { ...DEFAULT_ADMIN_EMAILS };

  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_ADMIN_EMAILS, ...parsed };
  } catch {
    return { ...DEFAULT_ADMIN_EMAILS };
  }
}

function loadState() {
  products = safeReadStorage(STORAGE_KEYS.products, DEFAULT_PRODUCTS);
  videos = safeReadStorage(STORAGE_KEYS.videos, DEFAULT_VIDEOS);
  galleryImages = safeReadStorage(STORAGE_KEYS.gallery, DEFAULT_GALLERY_IMAGES);
  hero = readStoredHero();
  adminEmails = readStoredAdminEmails();
  cart = readStoredCart();
  isAdminLoggedIn = localStorage.getItem(STORAGE_KEYS.admin) === 'true';
  shopOpen = localStorage.getItem(STORAGE_KEYS.shopStatus) !== 'false';

  if (isAdminLoggedIn) {
    showAdminInterface();
  }

  renderAdminEmails();
  renderHeroContent();
  renderGalleryImages();
  renderShopStatus();
  renderCartCount();
  renderProducts();
  renderVideos();
  renderAdminProductList();
  renderAdminVideoList();
  renderAdminGalleryList();
}

function saveState() {
  const savedProducts = safeWriteStorage(STORAGE_KEYS.products, products);
  const savedVideos = safeWriteStorage(STORAGE_KEYS.videos, videos);
  const savedGallery = safeWriteStorage(STORAGE_KEYS.gallery, galleryImages);
  const savedHero = safeWriteStorage(STORAGE_KEYS.hero, hero);
  const savedEmails = safeWriteStorage(STORAGE_KEYS.adminEmails, adminEmails);
  const savedStatus = safeWriteStorage(STORAGE_KEYS.shopStatus, shopOpen);

  const storageOk = savedProducts && savedVideos && savedGallery && savedHero && savedEmails && savedStatus;

  if (!storageOk) {
    alert('حجم الملفات كبير جدًا، اختر صور أو فيديوهات أصغر حتى يتم حفظها داخل المتصفح.');
  }

  renderAdminEmails();
  renderHeroContent();
  renderGalleryImages();
  renderShopStatus();
  renderProducts();
  renderVideos();
  renderAdminProductList();
  renderAdminVideoList();
  renderAdminGalleryList();
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value.trim();
  const allowedEmails = new Set([
    ADMIN_CREDENTIALS.email,
    (adminEmails.custom || DEFAULT_ADMIN_EMAILS.custom).trim(),
    (adminEmails.official || DEFAULT_ADMIN_EMAILS.official).trim()
  ]);

  if (password === ADMIN_CREDENTIALS.password && allowedEmails.has(email)) {
    isAdminLoggedIn = true;
    persistSession();
    showAdminInterface();
    return;
  }

  alert('بيانات الدخول غير صحيحة. الرجاء التحقق من البريد الإلكتروني وكلمة المرور.');
}

function handleLogout() {
  isAdminLoggedIn = false;
  persistSession();
  hideAdminInterface();
  closeAdminModal();
}

function toggleShopStatus() {
  shopOpen = !shopOpen;
  localStorage.setItem(STORAGE_KEYS.shopStatus, String(shopOpen));
  renderShopStatus();
}

async function handleHeroSubmit(event) {
  event.preventDefault();
  const title = document.getElementById('heroTitleInput').value.trim();
  const text = document.getElementById('heroTextInput').value.trim();

  const selectedFiles = [
    heroShowcaseFile1?.files?.[0],
    heroShowcaseFile2?.files?.[0],
    heroShowcaseFile3?.files?.[0]
  ];

  const existingImages = Array.isArray(hero.showcaseImages) && hero.showcaseImages.length
    ? hero.showcaseImages
    : [...DEFAULT_HERO_SHOWCASE];

  try {
    const showcaseImages = await Promise.all(
      selectedFiles.map(async (file, index) => {
        if (!file) {
          return existingImages[index] || DEFAULT_HERO_SHOWCASE[index];
        }

        const image = await readFileAsDataUrl(file);
        return {
          title: existingImages[index]?.title || DEFAULT_HERO_SHOWCASE[index].title,
          image
        };
      })
    );

    hero = {
      title: title || DEFAULT_HERO.title,
      text: text || DEFAULT_HERO.text,
      showcaseImages
    };

    localStorage.setItem(STORAGE_KEYS.hero, JSON.stringify(hero));
    renderHeroContent();
    if (heroShowcaseFile1) heroShowcaseFile1.value = '';
    if (heroShowcaseFile2) heroShowcaseFile2.value = '';
    if (heroShowcaseFile3) heroShowcaseFile3.value = '';
    alert('تم حفظ نصوص الترحيب والصور بنجاح.');
  } catch (error) {
    alert('حدث خطأ أثناء حفظ الصور، حاول مرة أخرى.');
  }
}

function handleEmailSettingsSubmit(event) {
  event.preventDefault();
  const customValue = document.getElementById('customEmailInput').value.trim();
  const officialValue = document.getElementById('officialEmailInput').value.trim();

  adminEmails = {
    custom: customValue || DEFAULT_ADMIN_EMAILS.custom,
    official: officialValue || DEFAULT_ADMIN_EMAILS.official
  };

  localStorage.setItem(STORAGE_KEYS.adminEmails, JSON.stringify(adminEmails));
  renderAdminEmails();
  alert('تم حفظ إعدادات البريد الإلكتروني بنجاح.');
}

async function handleGallerySubmit(event) {
  event.preventDefault();
  const fileInput = document.getElementById('galleryImageFile');
  const title = document.getElementById('galleryImageTitle').value.trim();
  const file = fileInput.files && fileInput.files[0];

  if (!title || !file) {
    alert('يرجى اختيار صورة من الكمبيوتر وتحديد عنوانها.');
    return;
  }

  try {
    const image = await readFileAsDataUrl(file);
    galleryImages.unshift({
      id: generateId('gallery'),
      title,
      image
    });

    saveState();
    galleryForm.reset();
  } catch (error) {
    alert(error.message || 'حدث خطأ أثناء قراءة الصورة. حاول مرة أخرى.');
  }
}

async function handleProductSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('productName').value.trim();
  const description = document.getElementById('productDescription').value.trim();
  const link = document.getElementById('productLink').value.trim();
  const price = Number(document.getElementById('productPrice').value);
  const category = document.getElementById('productCategory').value;
  const fileInput = document.getElementById('productImageFile');
  const file = fileInput.files && fileInput.files[0];

  if (!name || !description || !category || !file || !price || price <= 0) {
    alert('يرجى إدخال اسم المنتج، الوصف، التصنيف، السعر، واختيار صورة من الكمبيوتر.');
    return;
  }

  try {
    const image = await readFileAsDataUrl(file);
    products.unshift({
      id: generateId('product'),
      name,
      category,
      price,
      image,
      description,
      link: link || ''
    });

    saveState();
    productForm.reset();
  } catch (error) {
    alert(error.message || 'حدث خطأ أثناء قراءة صورة المنتج. حاول مرة أخرى.');
  }
}

async function handleVideoSubmit(event) {
  event.preventDefault();
  const title = document.getElementById('videoTitle').value.trim();
  const fileInput = document.getElementById('videoFile');
  const file = fileInput.files && fileInput.files[0];

  if (!title || !file) {
    alert('يرجى إدخال عنوان الفيديو واختيار ملف video من الكمبيوتر.');
    return;
  }

  try {
    const dataUrl = await readFileAsDataUrl(file);
    videos.unshift({
      id: generateId('video'),
      title,
      url: '',
      dataUrl
    });

    saveState();
    videoForm.reset();
  } catch (error) {
    alert(error.message || 'حدث خطأ أثناء قراءة الفيديو. حاول مرة أخرى.');
  }
}

function removeProduct(productId) {
  products = products.filter((product) => product.id !== productId);
  saveState();
}

function removeVideo(videoId) {
  videos = videos.filter((video) => video.id !== videoId);
  saveState();
}

function removeGalleryImage(imageId) {
  galleryImages = galleryImages.filter((item) => item.id !== imageId);
  saveState();
}

function bindAdminActions() {
  document.getElementById('openCartBtn').addEventListener('click', openCartModal);
  document.getElementById('closeCartBtn').addEventListener('click', closeCartModal);
  document.getElementById('closeCartBtnSecondary').addEventListener('click', closeCartModal);
  document.querySelector('[data-close-cart="true"]').addEventListener('click', closeCartModal);
  document.getElementById('checkoutCartBtn').addEventListener('click', () => {
    window.open(buildCartWhatsAppLink(), '_blank', 'noopener');
  });

  document.getElementById('openAdminBtn').addEventListener('click', openAdminModal);
  document.getElementById('openAdminBtnSecondary').addEventListener('click', openAdminModal);
  document.getElementById('closeModalBtn').addEventListener('click', closeAdminModal);
  document.querySelector('[data-close-modal="true"]').addEventListener('click', closeAdminModal);
  loginForm.addEventListener('submit', handleLogin);
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  document.getElementById('toggleShopStatusBtn').addEventListener('click', toggleShopStatus);
  document.querySelectorAll('[data-toggle-password]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = document.getElementById(button.dataset.togglePassword);
      if (!target) return;
      const isPassword = target.type === 'password';
      target.type = isPassword ? 'text' : 'password';
      button.textContent = isPassword ? 'إخفاء' : 'إظهار';
    });
  });
  heroForm.addEventListener('submit', handleHeroSubmit);
  document.getElementById('emailSettingsForm').addEventListener('submit', handleEmailSettingsSubmit);
  galleryForm.addEventListener('submit', handleGallerySubmit);
  productForm.addEventListener('submit', handleProductSubmit);
  videoForm.addEventListener('submit', handleVideoSubmit);

  adminProductList.addEventListener('click', (event) => {
    const target = event.target;
    if (target.matches('.remove-btn')) {
      removeProduct(target.dataset.productId);
    }
  });

  adminVideoList.addEventListener('click', (event) => {
    const target = event.target;
    if (target.matches('.remove-btn')) {
      removeVideo(target.dataset.videoId);
    }
  });

  adminGalleryList.addEventListener('click', (event) => {
    const target = event.target;
    if (target.matches('.remove-btn')) {
      removeGalleryImage(target.dataset.galleryId);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  bindAdminActions();
  loadState();
});
