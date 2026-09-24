const arabic=document.documentElement.lang==='ar';
// mobile menu
const links=document.getElementById('links');
const menu=document.getElementById('menu');
function closeMenu(){links.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label',arabic?'فتح القائمة':'Open navigation')}
menu.onclick=()=>{const open=links.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?(arabic?'إغلاق القائمة':'Close navigation'):(arabic?'فتح القائمة':'Open navigation'))};
links.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&links.classList.contains('open')){closeMenu();menu.focus()}});
document.addEventListener('click',e=>{if(!e.target.closest('nav'))closeMenu()});
matchMedia('(min-width: 761px)').addEventListener('change',closeMenu);
const year=document.getElementById('yr');
if(year)year.textContent=new Date().getFullYear();

// Reveal content progressively; keep content visible without JavaScript.
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
if ('IntersectionObserver' in window && !reducedMotion) {
  document.documentElement.classList.add('motion-ready');
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('in');observer.unobserve(entry.target)}
  }),{threshold:0,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
}

document.querySelectorAll('.filter').forEach(x=>x.setAttribute('aria-pressed',String(x.classList.contains('active'))));
// project filter
document.getElementById('filters')?.addEventListener('click',e=>{const b=e.target.closest('.filter');if(!b)return;
  document.querySelectorAll('.filter').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});
  const f=b.dataset.f;
  const apply=()=>document.querySelectorAll('.proj').forEach(p=>p.classList.toggle('hide',f!=='all'&&!p.dataset.cat.split(' ').includes(f)));
  // Cards glide to their new places where View Transitions are supported.
  if(document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(apply);
  else apply();
});
document.querySelectorAll('.proj').forEach(p=>{p.style.viewTransitionName=p.id});

// Stats count up once when they scroll into view; the final number is already in the HTML.
if('IntersectionObserver' in window && !reducedMotion){
  const counters=[...document.querySelectorAll('.stat>b')].map(b=>({node:b.firstChild,target:parseInt(b.firstChild.textContent,10)})).filter(c=>c.node.nodeType===3&&c.target>0);
  const countObserver=new IntersectionObserver(entries=>{
    if(!entries.some(e=>e.isIntersecting))return;
    countObserver.disconnect();
    const start=performance.now(),duration=1100;
    const step=now=>{
      const t=Math.min((now-start)/duration,1),eased=1-Math.pow(1-t,3);
      // Start near the final value so a quick scroll never shows "0 years".
      counters.forEach(c=>{c.node.textContent=String(Math.round(c.target*(.6+.4*eased)))});
      if(t<1)requestAnimationFrame(step);
    };
    counters.forEach(c=>{c.node.textContent=String(Math.round(c.target*.6))});
    requestAnimationFrame(step);
  },{threshold:.5});
  const stats=document.querySelector('.stats');
  if(stats)countObserver.observe(stats);
}

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
if(copyButton){
copyButton.hidden=false;
copyButton.addEventListener('click',async()=>{
  try {
    await navigator.clipboard.writeText('aymanomara55@gmail.com');
    copyStatus.textContent=arabic?'تم نسخ البريد الإلكتروني.':'Email address copied.';
  } catch {
    copyStatus.textContent=arabic?'تعذّر النسخ تلقائيًا. حدّد البريد الإلكتروني أعلاه لنسخه.':'Could not copy automatically. Select the email address above to copy it.';
  }
});
}
function updateCairoTime() {
  const time=new Intl.DateTimeFormat(arabic?'ar-EG':'en-GB',{timeZone:'Africa/Cairo',hour:'2-digit',minute:'2-digit',timeZoneName:'shortOffset'}).format(new Date());
  const cairo=document.getElementById('cairo-time');
  if(!cairo)return;
  cairo.textContent=arabic?`${time} بتوقيت القاهرة`:`${time} in Cairo`;
}
updateCairoTime();
setInterval(updateCairoTime,60000);

// Mockup screens play once when their card comes into view.
if('IntersectionObserver' in window && !reducedMotion){
  const liveObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    liveObserver.unobserve(entry.target);
    entry.target.classList.add('live');
    const value=entry.target.querySelector('.ph-value b');
    const match=value&&value.textContent.match(/^(\D*)([\d,]+)$/);
    if(match){
      const target=parseInt(match[2].replace(/,/g,''),10),start=performance.now()+500;
      const step=now=>{
        const t=Math.max(0,Math.min((now-start)/1200,1)),eased=1-Math.pow(1-t,3);
        value.textContent=match[1]+Math.round(target*(.8+.2*eased)).toLocaleString('en-US');
        if(t<1)requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }),{threshold:.35});
  document.querySelectorAll('.project-art').forEach(art=>liveObserver.observe(art));
  document.querySelectorAll('.ph-clock b').forEach(b=>{b.innerHTML=b.textContent.replace(':','<span class="colon">:</span>')});
  document.querySelectorAll('.gov-art .ph-cta').forEach(cta=>cta.classList.add('gov-cta-pulse'));
}

// Featured cards tilt toward the pointer on devices with a precise hover pointer.
if(!reducedMotion && matchMedia('(hover: hover) and (pointer: fine)').matches){
  document.querySelectorAll('.featured .project-art').forEach(art=>{
    let frame=0,x=0,y=0;
    const apply=()=>{frame=0;art.style.setProperty('--mx',x.toFixed(3));art.style.setProperty('--my',y.toFixed(3))};
    const card=art.closest('.proj');
    card.addEventListener('pointermove',event=>{
      const rect=art.getBoundingClientRect();
      x=Math.max(-1,Math.min(1,(event.clientX-rect.left)/rect.width*2-1));
      y=Math.max(-1,Math.min(1,(event.clientY-rect.top)/rect.height*2-1));
      art.classList.add('tilting');
      if(!frame)frame=requestAnimationFrame(apply);
    });
    card.addEventListener('pointerleave',()=>{x=0;y=0;art.classList.remove('tilting');if(!frame)frame=requestAnimationFrame(apply)});
  });
}
