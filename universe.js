// Original particle sculpture. No 3D library, external assets, or network requests.
(() => {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const hero = document.getElementById('top');
  const scene = document.getElementById('universe');
  let scrollProgress = 0, scrollFrame = 0;
  const motionButton = document.getElementById('motion');
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = motionPreference.matches;
  let visible = true;
  let width = 0, height = 0, angle = .3, tilt = -.3, frame = 0, previous = 0;
  let drag = null;
  let seed = 42;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const stars = Array.from({length: 150}, () => ({x:random(), y:random(), size:random()*.8+.2, alpha:random()*.3+.08}));
  const points = [];
  // Intersecting orbital ribbons create an airy, sculptural core.
  for (let i = 0; i < 1900; i++) {
    const u = random() * Math.PI * 2;
    const v = random() * Math.PI * 2;
    const tube = .13 + random() * .14;
    const ring = .67 + tube * Math.cos(v);
    const band = i % 3;
    let x = ring * Math.cos(u), y = tube * Math.sin(v), z = ring * Math.sin(u);
    const twist = band * Math.PI / 3 + .35 * Math.sin(u * 3);
    const yy = y * Math.cos(twist) - z * Math.sin(twist);
    z = y * Math.sin(twist) + z * Math.cos(twist);
    const colors = ['61,231,255', '157,104,255', '255,100,218', '221,248,255'];
    points.push({x, y:yy, z, color:colors[i % 7 === 0 ? 3 : band], size:random()*1.1+.5, brightness:random()*.5+.5});
  }
  function draw() {
    ctx.clearRect(0,0,width,height);
    const mobile = width <= 760;
    const centerX = width / 2, centerY = height * (mobile ? .58 : .48);
    const zoom = motionPreference.matches ? 1 : 1 + scrollProgress * .6;
    const radius = Math.min(width * (mobile ? .44 : .25), height * .36, 325) * zoom;
    for (const star of stars) {
      ctx.fillStyle = `rgba(178,213,255,${star.alpha*1.4})`;
      ctx.beginPath(); ctx.arc(star.x*width,star.y*height,star.size,0,Math.PI*2); ctx.fill();
    }
    const glow=ctx.createRadialGradient(centerX,centerY,0,centerX,centerY,radius*1.35);
    glow.addColorStop(0,'rgba(91,47,240,.18)');glow.addColorStop(.5,'rgba(0,170,230,.07)');glow.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
    const rotation=angle + (motionPreference.matches ? 0 : scrollProgress*.8);
    const ca=Math.cos(rotation),sa=Math.sin(rotation),ct=Math.cos(tilt),st=Math.sin(tilt);
    const projected=points.map(p=>{
      const x=p.x*ca+p.z*sa,z=-p.x*sa+p.z*ca;
      const y=p.y*ct-z*st,depth=p.y*st+z*ct;
      const perspective=3/(3-depth);
      return {x:centerX+x*radius*perspective,y:centerY+y*radius*perspective,z:depth,color:p.color,size:p.size*perspective,a:p.brightness*(.55+(depth+1)*.3)};
    }).sort((a,b)=>a.z-b.z);
    for(const p of projected){
      ctx.fillStyle=`rgba(${p.color},${Math.min(p.a,1)})`;
      ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
      if(p.a>.75 && p.size>1.2){ctx.fillStyle=`rgba(${p.color},.12)`;ctx.beginPath();ctx.arc(p.x,p.y,p.size*3.5,0,Math.PI*2);ctx.fill();}
    }
  }
  function tick(now) {
    frame=0;
    if(paused || !visible || document.hidden) return;
    const delta=previous ? Math.min(now-previous,40) : 16;
    previous=now;
    if(!drag) angle+=delta*.000065;
    draw();frame=requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);frame=0;previous=0;
    motionButton.hidden=false;
    motionButton.textContent=paused?'▷':'Ⅱ';
    const ar=document.documentElement.lang==='ar';
    motionButton.setAttribute('aria-label',paused?(ar?'تشغيل حركة المجرّة':'Play constellation animation'):(ar?'إيقاف حركة المجرّة':'Pause constellation animation'));
    motionButton.setAttribute('aria-pressed',String(paused));
    draw();
    if(!paused && visible && !document.hidden) frame=requestAnimationFrame(tick);
  }
  function updateScroll() {
    scrollFrame=0;
    const distance=hero.offsetHeight-scene.offsetHeight;
    scrollProgress=motionPreference.matches || distance<=0 ? 0 : Math.max(0,Math.min(1,-hero.getBoundingClientRect().top/distance));
    scene.style.setProperty('--scroll-progress',scrollProgress.toFixed(4));
    if(paused && visible) draw();
  }
  window.addEventListener('scroll',()=>{
    if(!scrollFrame) scrollFrame=requestAnimationFrame(updateScroll);
  },{passive:true});
  function resize() {
    const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;
    const dpr=Math.min(devicePixelRatio || 1,2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);updateScroll();draw();
  }
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()},{threshold:0}).observe(canvas);
  document.addEventListener('visibilitychange',sync);
  motionButton.addEventListener('click',()=>{paused=!paused;sync()});
  motionPreference.addEventListener('change',event=>{paused=event.matches;updateScroll();sync()});
  canvas.addEventListener('pointerdown',event=>{drag={x:event.clientX,y:event.clientY};canvas.setPointerCapture(event.pointerId)});
  canvas.addEventListener('pointermove',event=>{
    if(!drag)return;
    angle+=(event.clientX-drag.x)*.006;
    tilt=Math.max(-1,Math.min(1,tilt+(event.clientY-drag.y)*.003));
    drag={x:event.clientX,y:event.clientY};draw();
  });
  const endDrag=()=>{drag=null};
  canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);canvas.addEventListener('lostpointercapture',endDrag);
  canvas.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
    event.preventDefault();
    if(event.key==='ArrowLeft')angle-=.12;
    if(event.key==='ArrowRight')angle+=.12;
    if(event.key==='ArrowUp')tilt=Math.max(-1,tilt-.12);
    if(event.key==='ArrowDown')tilt=Math.min(1,tilt+.12);
    draw();
  });
  resize();sync();
})();
