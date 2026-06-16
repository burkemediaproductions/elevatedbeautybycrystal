const EBC_FALLBACK_CATEGORIES = [
  {key:'facials', name:'Facial Treatments', url:'/facial-treatments.html', summary:'Glow-focused facial treatments and skin care rituals designed around hydration, relaxation, clarity, and a refreshed finish.', fallback_services:['Signature Facial','Glow Facial','Deep Cleansing Facial','Hydration Facial']},
  {key:'nails', name:'Manicure & Pedicure', url:'/manicure-pedicure.html', summary:'Detail-driven manicure and pedicure services for everyday polish, special moments, and a fresh self-care reset.', fallback_services:['Classic Manicure','Gel Manicure','Classic Pedicure','Gel Pedicure']},
  {key:'extensions', name:'Nail Extensions', url:'/nail-extensions.html', summary:'Structure, length, and style for clients who want durable, personalized nails with a polished finish.', fallback_services:['Acrylic Full Set','Builder Gel Overlay','Poly Gel Full Set','Extension Fill']},
  {key:'massage', name:'Massage & Energy', url:'/massage-bodywork.html', summary:'Massage, bodywork, and energy services designed to ease tension, support rest, and create a grounded experience.', fallback_services:['Therapeutic Massage','Deep Tissue Massage','Maternity Massage','Relaxation Massage']},
  {key:'brows-lashes-waxing', name:'Brows, Lashes & Waxing', url:'/brows-lashes-waxing.html', summary:'Beauty finishing services that enhance natural features, simplify daily routines, and help clients feel put together.', fallback_services:['Brow Lamination','Lash Lift & Tint','Brow Wax','Facial Waxing']},
  {key:'mini-wellness', name:'Mini-Elevated Wellness', url:'/services.html?category=mini-wellness', summary:'Age-appropriate mini wellness services for ages 5-12, with a parent or caregiver present.', fallback_services:['Mini Mani','Mini Pedi','Mini Skin Care Routine']},
  {key:'addons', name:'Add-Ons & Nail Art', url:'/services.html?category=addons', summary:'Finishing touches, removals, nail art, charms, chrome, glitter, and service add-ons.', fallback_services:['Nail Art','Chrome','Frenchies','Removal']},
  {key:'special-occasion', name:'Special Occasion / Travel', url:'/special-occasion-beauty.html', summary:'Travel-friendly beauty services for special occasions across Desert Hot Springs, Palm Springs, the low desert, and select high desert communities.', fallback_services:['Event Beauty Prep','Bridal Party Beauty Services','Photoshoot Beauty Prep','Travel Service Consultation']}
];
const EBC_CATEGORY_ORDER = ['facials','nails','extensions','brows-lashes-waxing','massage','mini-wellness','addons','special-occasion'];
const EBC_CATEGORY_BY_KEY = Object.fromEntries(EBC_FALLBACK_CATEGORIES.map(c=>[c.key,c]));
function slugify(value){return String(value||'services').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'services'}
function escapeHtml(value){return String(value||'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]))}
<<<<<<< HEAD
function serviceBookingUrl(baseUrl, serviceId){const clean=String(baseUrl||'').replace(/[?#].*$/,'').replace(/\/services\/?$/i,'').replace(/\/+$/,'');return clean&&serviceId?`${clean}/services/${encodeURIComponent(serviceId)}`:clean}
=======
>>>>>>> 8fa6d00 (Square Widget)
function fallbackServices(categoryKey){const cat=EBC_CATEGORY_BY_KEY[categoryKey]||null;const names=cat?cat.fallback_services:EBC_FALLBACK_CATEGORIES.flatMap(c=>c.fallback_services);return names.map(name=>({name,categoryKey:cat?cat.key:'all',categoryName:cat?cat.name:'Service',description:'Service details, timing, and pricing will be confirmed during online booking.',bookingUrl:null}))}
function inferCategory(service){
  const originalKey=service.categoryKey||'';
  const originalName=service.categoryName||'';
  const name=String(service.name||'');
  const lower=name.toLowerCase();
  if(originalKey && originalKey !== 'services' && originalKey !== 'service'){
    return {key:slugify(originalKey), name:originalName || originalKey, url:`/services.html?category=${slugify(originalKey)}`, summary:`Browse ${originalName || originalKey} services from Crystal's online service menu.`};
  }
  if(/elevated skin care|facial|dermaplan|microderm|jelly mask|high frequency|bacne|pore rehab|hydrating|age-less|skin care/i.test(name)) return EBC_CATEGORY_BY_KEY.facials;
  if(/massage|energy|stone|deep tissue|maternity|card reading|energy clearing|woo-saw|muscle relaxation/i.test(name)) return EBC_CATEGORY_BY_KEY.massage;
  if(/hair removal|wax|brow|lash|lami|lift|tint|underarm|bikini|sideburn|chin|lip|nose|ear/i.test(name)) return EBC_CATEGORY_BY_KEY['brows-lashes-waxing'];
  if(/mini-elevated|mini wellness|ages 5-12|mini mani|mini pedi|mini skin/i.test(name)) return EBC_CATEGORY_BY_KEY['mini-wellness'];
  if(/add on|add-on|chrome|cateye|charms|jewlery|jewelry|design|frenchies|glitter|removal|repair|foil|art tier|crystals custom/i.test(name)) return EBC_CATEGORY_BY_KEY.addons;
  if(/gel x|gelx|acrylic|builder gel|polygel|luminary|overlay|fullset|full set|fill|toenail set|rebalance|extension/i.test(name)) return EBC_CATEGORY_BY_KEY.extensions;
  if(/manicure|pedicure|mani|pedi|nail care|simple glow|afterglow jelly|clean & classic|healing heart|waterless/i.test(name)) return EBC_CATEGORY_BY_KEY.nails;
  if(/bridal|wedding|event|special occasion|photoshoot|travel|party/i.test(name)) return EBC_CATEGORY_BY_KEY['special-occasion'];
  return {key:'services', name:originalName && originalName !== 'Services' ? originalName : 'More Services', url:'/services.html?category=services', summary:'Additional services from Crystal\'s online service menu.'};
}
function normalizeBookingData(data){
  const rawServices=Array.isArray(data.services)?data.services:[];
  const services=rawServices.map(service=>{const cat=inferCategory(service);return {...service, rawCategoryKey:service.categoryKey, rawCategoryName:service.categoryName, categoryKey:cat.key, categoryName:cat.name, categoryUrl:cat.url};});
  const categoryMap=new Map();
  services.forEach(s=>{const cat=inferCategory(s); if(!categoryMap.has(cat.key)) categoryMap.set(cat.key,{...cat,count:0}); categoryMap.get(cat.key).count++;});
  let categories=[...categoryMap.values()].filter(c=>c.count>0);
  if(!categories.length) categories=EBC_FALLBACK_CATEGORIES.map(c=>({...c,count:0}));
  categories.sort((a,b)=>{
    const ai=EBC_CATEGORY_ORDER.indexOf(a.key); const bi=EBC_CATEGORY_ORDER.indexOf(b.key);
    if(ai!==-1 || bi!==-1) return (ai===-1?999:ai)-(bi===-1?999:bi);
    return a.name.localeCompare(b.name);
  });
  return {...data, services, categories};
}
<<<<<<< HEAD
function serviceCard(s,defaultUrl){const price=s.price?`<span>${escapeHtml(s.price)}</span>`:'';const duration=s.duration?`<span>${escapeHtml(s.duration)}</span>`:'';const url=s.bookingUrl||serviceBookingUrl(defaultUrl,s.id)||defaultUrl||'/booking.html';return `<article class="service-item"><div class="service-item-top"><div><h3>${escapeHtml(s.name)}</h3><p class="service-meta">${[escapeHtml(s.categoryName),duration,price].filter(Boolean).join(' • ')}</p></div></div><p>${escapeHtml(s.description||'Review this service and continue to secure online booking.')}</p><a class="btn btn-primary" href="${escapeHtml(url)}" target="_blank" rel="noopener">Book Appointment</a></article>`}
function categoryCard(c,bookingUrl){return `<article class="card service-card reveal visible"><span class="eyebrow">${escapeHtml(c.name)}</span><h3>${escapeHtml(c.name)}</h3><p>${escapeHtml(c.summary || `Browse ${c.name} services from Crystal's online service menu.`)}</p><div class="btn-row"><a class="btn btn-secondary" href="${escapeHtml(c.url || `/services.html?category=${c.key}`)}">View Services</a><a class="btn btn-primary" href="${escapeHtml(bookingUrl||'/booking.html')}" target="_blank" rel="noopener">Book Appointment</a></div></article>`}
=======
function serviceCard(s,defaultUrl){const price=s.price?`<span>${escapeHtml(s.price)}</span>`:'';const duration=s.duration?`<span>${escapeHtml(s.duration)}</span>`:'';const url='/booking.html';return `<article class="service-item"><div class="service-item-top"><div><h3>${escapeHtml(s.name)}</h3><p class="service-meta">${[escapeHtml(s.categoryName),duration,price].filter(Boolean).join(' • ')}</p></div></div><p>${escapeHtml(s.description||'Review this service and continue to secure online booking.')}</p><a class="btn btn-primary" href="${url}">Book Appointment</a></article>`}
function categoryCard(c,bookingUrl){return `<article class="card service-card reveal visible"><span class="eyebrow">${escapeHtml(c.name)}</span><h3>${escapeHtml(c.name)}</h3><p>${escapeHtml(c.summary || `Browse ${c.name} services from Crystal's online service menu.`)}</p><div class="btn-row"><a class="btn btn-secondary" href="${escapeHtml(c.url || `/services.html?category=${c.key}`)}">View Services</a><a class="btn btn-primary" href="/booking.html">Book Appointment</a></div></article>`}
>>>>>>> 8fa6d00 (Square Widget)
async function loadBookingData(){try{const res=await fetch('/.netlify/functions/square-catalog',{headers:{'accept':'application/json'}});if(!res.ok)throw new Error('Booking service unavailable');return normalizeBookingData(await res.json())}catch(e){return normalizeBookingData({services:[],categories:EBC_FALLBACK_CATEGORIES,bookingSiteUrl:'/booking.html',status:'fallback'})}}
function selectedCategoryFromUrl(){return new URLSearchParams(window.location.search).get('category') || ''}
function renderServiceLists(data){const defaultUrl=data.bookingSiteUrl||'/booking.html';document.querySelectorAll('.square-service-list').forEach(el=>{let key=el.dataset.category||'all';const queryKey=selectedCategoryFromUrl();if(key==='all' && queryKey) key=queryKey;let services=(data.services||[]).filter(s=>key==='all'||s.categoryKey===key||s.rawCategoryKey===key||s.categoryName===key);if(!services.length){try{const fb=JSON.parse(el.dataset.fallback||'[]');services=fb.length?fb.map(name=>({name,categoryKey:key,categoryName:(EBC_CATEGORY_BY_KEY[key]||{}).name||'Service',description:'This fallback item will be replaced by the live service menu once configured.'})):fallbackServices(key)}catch(e){services=fallbackServices(key)}}const cat=(data.categories||[]).find(c=>c.key===key)||EBC_CATEGORY_BY_KEY[key];const heading=el.closest('section')?.querySelector('h2');if(queryKey && cat && heading) heading.textContent=`${cat.name} services`;el.innerHTML=services.map(s=>serviceCard(s,defaultUrl)).join('')})}
function renderCategoryCards(data){const defaultUrl=data.bookingSiteUrl||'/booking.html';document.querySelectorAll('.square-category-cards').forEach(el=>{const cats=(data.categories&&data.categories.length?data.categories:EBC_FALLBACK_CATEGORIES);el.innerHTML=cats.map(c=>categoryCard(c,(data.categoryBookingLinks||{})[c.key]||defaultUrl)).join('')})}
function renderDynamicServiceNav(data){const cats=(data.categories&&data.categories.length?data.categories:EBC_FALLBACK_CATEGORIES);const links=[...cats.map(c=>`<a href="${escapeHtml(c.url||`/services.html?category=${c.key}`)}">${escapeHtml(c.name)}</a>`),'<a href="/services.html">All Services</a>'].join('');document.querySelectorAll('.dropdown-menu').forEach(menu=>{const parent=menu.closest('.dropdown');const btn=parent?parent.querySelector('button'):null;if(btn && btn.textContent.trim().toLowerCase()==='services') menu.innerHTML=links});document.querySelectorAll('[data-mobile-panel] a[href="/services.html"]').forEach(a=>{if(a.parentElement?.querySelector('.mobile-submenu')) return;const div=document.createElement('div');div.className='mobile-submenu';div.innerHTML=cats.map(c=>`<a href="${escapeHtml(c.url||`/services.html?category=${c.key}`)}">${escapeHtml(c.name)}</a>`).join('');a.insertAdjacentElement('afterend',div);div.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{document.querySelector('[data-menu-toggle]')?.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open');document.querySelector('[data-mobile-panel]')?.classList.remove('open')}))})}
loadBookingData().then(data=>{window.EBC_BOOKING_DATA=data;renderDynamicServiceNav(data);renderServiceLists(data);renderCategoryCards(data)});
