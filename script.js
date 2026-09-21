// mobile menu
const links=document.getElementById('links');
const menu=document.getElementById('menu');
function closeMenu(){links.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation')}
menu.onclick=()=>{const open=links.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation')};
links.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&links.classList.contains('open')){closeMenu();menu.focus()}});
document.addEventListener('click',e=>{if(!e.target.closest('nav'))closeMenu()});
matchMedia('(min-width: 761px)').addEventListener('change',closeMenu);
document.getElementById('yr').textContent=new Date().getFullYear();

// Reveal content progressively; keep content visible without JavaScript.
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
if ('IntersectionObserver' in window && !reducedMotion) {
  document.documentElement.classList.add('motion-ready');
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('in');observer.unobserve(entry.target)}
  }),{threshold:0.06});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
}

document.querySelectorAll('.filter').forEach(x=>x.setAttribute('aria-pressed',String(x.classList.contains('active'))));
// project filter
document.getElementById('filters').addEventListener('click',e=>{const b=e.target.closest('.filter');if(!b)return;
  document.querySelectorAll('.filter').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});
  const f=b.dataset.f;document.querySelectorAll('.proj').forEach(p=>p.classList.toggle('hide',f!=='all'&&!p.dataset.cat.split(' ').includes(f)))});

// Keep deep links to project evidence usable after filtering.
function revealLinkedProject() {
  const target=document.getElementById(location.hash.slice(1));
  if(target && target.matches('.proj.hide')) {
    document.querySelector('.filter[data-f="all"]').click();
    target.scrollIntoView({behavior:'instant',block:'start'});
  }
}
window.addEventListener('hashchange',revealLinkedProject);
revealLinkedProject();

// Clipboard failure leaves the visible mail link available for manual copying.
const copyButton=document.getElementById('copy-email');
const copyStatus=document.getElementById('copy-status');
copyButton.hidden=false;
copyButton.addEventListener('click',async()=>{
  try {
    await navigator.clipboard.writeText('aymanomara55@gmail.com');
    copyStatus.textContent='Email address copied.';
  } catch {
    copyStatus.textContent='Could not copy automatically. Select the email address above to copy it.';
  }
});
function updateCairoTime() {
  const time=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',hour:'2-digit',minute:'2-digit',timeZoneName:'shortOffset'}).format(new Date());
  document.getElementById('cairo-time').textContent=`${time} in Cairo`;
}
updateCairoTime();
setInterval(updateCairoTime,60000);
