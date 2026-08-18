const S = { projects: [], filter: 'All' };
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

async function json(p) {
  let r = await fetch(p);
  if (!r.ok) throw Error(p);
  return r.json();
}

async function boot() {
  try {
    let [site, projects, exp, teams, guides] = await Promise.all([
      json('data/site.json'),
      json('data/projects.json'),
      json('data/experience.json'),
      json('data/teams.json'),
      json('data/guides.json').catch(() => []) 
    ]);
    
    S.projects = projects;
    
    if ($('#name')) siteRender(site);
    if ($('#services')) serviceRender(site.services);
    if ($('#featured')) featured(projects);
    if ($('#miniExp')) experience(exp); 
    if ($('#allProjects')) { allProjects(projects); filters(projects); }
    if ($('#timeline')) timelineRender(exp);
    if ($('#teamsGrid')) teamsRender(teams);
    if ($('#guidesGrid')) guidesRender(guides); 
    
    navigation(); theme(); dialog(); reveal();
  } catch(e) { console.error(e); }
}

const esc = x => String(x).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

function siteRender(s) {
  $('#name').innerHTML = `${esc(s.firstName)} <span>${esc(s.lastName)}</span>`;
  $('#role').textContent = s.roleLine; 
  $('#intro').textContent = s.intro; 
  
  // Current Work Widget Logic
  $('#current').textContent = s.currentWork;
  if ($('#statusBox')) {
    if (s.currentWorkUrl) {
      $('#statusBox').href = safe(s.currentWorkUrl);
    } else {
      $('#statusBox').removeAttribute('href');
      $('#statusBox').style.pointerEvents = 'none';
    }
  }
  
  if($('#aboutText')) $('#aboutText').textContent = s.about;
  if($('#quote')) $('#quote').textContent = s.quote;
  
  $('#emailBtn').href = `mailto:${s.links.email}`;
  
  if($('#fgh')) $('#fgh').href = s.links.github || '#';
  if($('#fmail')) $('#fmail').href = s.links.email ? `mailto:${s.links.email}` : '#';
  if($('#gh')) $('#gh').href = s.links.github || '#';
  if($('#tg')) $('#tg').href = s.links.telegram || '#';
  if($('#li')) $('#li').href = s.links.linkedin || '#';
  if($('#gl')) $('#gl').href = s.links.gitlab || '#';
  if($('#dc')) $('#dc').href = s.links.discord || '#';
  if($('#ml')) $('#ml').href = s.links.email ? `mailto:${s.links.email}` : '#';
  
  // Dynamic Tech Stack & Popup Rendering
  let visibleTech = s.tech.slice(0, 6);
  let extraTech = s.tech.slice(6);
  
  let techHTML = visibleTech.map(x => `<a href="${safe(x.url || '#')}" target="_blank" rel="noreferrer" title="${esc(x.label)}">${esc(x.short)}</a>`).join('');
  
  if (extraTech.length > 0) {
    techHTML += `
      <div class="more" tabindex="0">
        +${extraTech.length}
        <div class="tech-popup">
          ${extraTech.map(x => `<a href="${safe(x.url || '#')}" target="_blank" rel="noreferrer" title="${esc(x.label)}"><span>${esc(x.short)}</span> ${esc(x.label)}</a>`).join('')}
        </div>
      </div>
    `;
  }
  $('#tech').innerHTML = techHTML;
  
  if($('#interests')) $('#interests').innerHTML = s.interests.map(x => `<span class="interest">${esc(x)}</span>`).join('');
}

function serviceRender(a) { $('#services').innerHTML = a.map(x => `<div class="service"><i>${esc(x.icon)}</i><div><strong>${esc(x.title)}</strong><p>${esc(x.description)}</p></div></div>`).join(''); }
function tags(p) { return p.tags.slice(0,3).map(x => `<span class="tag">${esc(x)}</span>`).join(''); }

function featured(a) {
  $('#featured').innerHTML = a.filter(x => x.featured).slice(0,4).map(p => `<div class="prow" data-id="${esc(p.id)}"><div class="picon">${esc(p.icon)}</div><div><strong>${esc(p.title)}</strong><small>${esc(p.shortDescription)}</small><div class="tags">${tags(p)}</div></div><b>↗</b></div>`).join('');
  $$('.prow').forEach(x => x.onclick = () => openProject(x.dataset.id));
}

function experience(a) { $('#miniExp').innerHTML = a.slice(0,4).map(x => `<div class="exp"><small>${esc(x.period)}</small><strong>${esc(x.title)}</strong><p>${esc(x.description)}</p></div>`).join(''); }
function timelineRender(a) { $('#timeline').innerHTML = a.map(x => `<article class="entry"><span class="date">${esc(x.period)}</span><h3>${esc(x.title)}</h3><span class="role">${esc(x.role)}</span><p>${esc(x.description)}</p></article>`).join(''); }

function allProjects(a) {
  let l = S.filter === 'All' ? a : a.filter(x => x.tags.includes(S.filter));
  $('#allProjects').innerHTML = l.map((p,i) => `
    <article class="pcard">
      ${p.image ? `<div class="pcard-img"><img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy"></div>` : ''}
      <div class="top"><span>${String(i+1).padStart(2,'0')}</span><span>${esc(p.year)}</span></div>
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.description)}</p>
      <div class="tags">${p.tags.map(x => `<span class="tag">${esc(x)}</span>`).join('')}</div>
      <div class="card-actions">
        <a class="card-link open" href="#" data-id="${esc(p.id)}">Details ↗</a>
        ${p.links ? p.links.map(link => `<a class="card-link" href="${safe(link.url)}" target="_blank" rel="noreferrer">${esc(link.label)}</a>`).join('') : ''}
      </div>
    </article>
  `).join('');
  $$('.pcard .open').forEach(x => x.onclick = e => { e.preventDefault(); openProject(x.dataset.id); });
}

function filters(a) {
  let t = ['All', ...new Set(a.flatMap(x => x.tags))].slice(0,12);
  $('#filters').innerHTML = t.map(x => `<button class="filter ${x === 'All' ? 'active' : ''}" data-f="${esc(x)}">${esc(x)}</button>`).join('');
  $$('.filter').forEach(b => b.onclick = () => { S.filter = b.dataset.f; $$('.filter').forEach(x => x.classList.toggle('active', x === b)); allProjects(S.projects); });
}

function teamsRender(a) { $('#teamsGrid').innerHTML = a.map(x => `<article class="team"><small>${esc(x.icon)}</small><h3>${esc(x.name)}</h3><p>${esc(x.description)}</p>${x.url ? `<a href="${safe(x.url)}" target="_blank" rel="noreferrer">Explore ↗</a>` : ''}</article>`).join(''); }

function guidesRender(a) {
  if (!a || !a.length) return;
  $('#guidesGrid').innerHTML = a.map((g, i) => `
    <article class="pcard">
      ${g.image ? `<div class="pcard-img"><img src="${esc(g.image)}" alt="${esc(g.title)}" loading="lazy"></div>` : ''}
      <div class="top"><span>${String(i+1).padStart(2,'0')}</span><span>${esc(g.date)}</span></div>
      <h3>${esc(g.title)}</h3>
      <p>${esc(g.description)}</p>
      <div class="tags">${g.tags.map(x => `<span class="tag">${esc(x)}</span>`).join('')}</div>
      <div class="card-actions">
        ${g.links ? g.links.map(link => `<a class="card-link" href="${safe(link.url)}" target="_blank" rel="noreferrer">${esc(link.label)}</a>`).join('') : ''}
      </div>
    </article>
  `).join('');
}

function openProject(id) {
  let p = S.projects.find(x => x.id === id);
  if (!p) return;
  $('#dialogBody').innerHTML = `
    ${p.image ? `<img class="dialog-img" src="${esc(p.image)}" alt="${esc(p.title)}">` : ''}
    <small class="dialog-k">${esc(p.category)} · ${esc(p.year)}</small>
    <h2 class="dialog-title">${esc(p.title)}</h2>
    <p class="dialog-p">${esc(p.description)}</p>
    <div class="tags">${p.tags.map(x => `<span class="tag">${esc(x)}</span>`).join('')}</div>
    <div class="dialog-actions">
      ${p.links ? p.links.map(link => `<a class="dialog-link" href="${safe(link.url)}" target="_blank" rel="noreferrer">${esc(link.label)}</a>`).join('') : ''}
    </div>
  `;
  $('#dialog').showModal();
}

function navigation() { let m = $('#menu'), n = $('#mobileNav'); if(m) m.onclick = () => n.classList.toggle('open'); }
function theme() {
  let b = $('#theme');
  if (localStorage.theme === 'light') document.body.classList.add('light');
  b.textContent = document.body.classList.contains('light') ? '☀' : '☾';
  b.onclick = () => { document.body.classList.toggle('light'); let l = document.body.classList.contains('light'); localStorage.theme = l ? 'light' : 'dark'; b.textContent = l ? '☀' : '☾'; };
}
function dialog() { if($('#close')) $('#close').onclick = () => $('#dialog').close(); if($('#dialog')) $('#dialog').onclick = e => { if (e.target === $('#dialog')) $('#dialog').close(); } }
function reveal() {
  let o = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.style.opacity = 1; e.target.style.transform = 'none'; o.unobserve(e.target); } }), { threshold: .06 });
  $$('.service, .prow, .pcard, .entry, .team').forEach(x => { x.style.opacity = 0; x.style.transform = 'translateY(12px)'; x.style.transition = '.55s ease'; o.observe(x); });
}
function safe(x) { try { let u = new URL(x, location.href); return ['http:', 'https:'].includes(u.protocol) ? u.href : '#'; } catch { return '#'; } }

boot();