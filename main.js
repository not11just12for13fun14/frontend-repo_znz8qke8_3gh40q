/* Main JS for Interactions: smooth scroll, active nav, parallax, tilt, lightning, intersection animations */
(function(){
  const qs = s => document.querySelector(s);
  const qsa = s => Array.from(document.querySelectorAll(s));

  // Smooth scroll for internal links (fallback for browsers lacking CSS smooth)
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || href === '#' || !href.startsWith('#')) return;
      const target = document.getElementById(href.substring(1));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({behavior:'smooth', block:'start'});
      history.pushState(null, '', href);
    });
  });

  // Mobile nav toggle
  const toggle = qs('.nav__toggle');
  const linksWrap = qs('.nav__links');
  toggle?.addEventListener('click', () => {
    const open = linksWrap.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  linksWrap?.addEventListener('click', (e) => {
    if(e.target.matches('a.nav__link')){
      linksWrap.classList.remove('open');
      toggle?.setAttribute('aria-expanded','false');
    }
  });

  // Active nav highlighting using IntersectionObserver
  const sections = qsa('main.section, section.section');
  const navLinks = qsa('.nav__link');
  const sectionById = Object.fromEntries(sections.map(s => [s.id, s]));
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const id = entry.target.id;
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
      }
    })
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0.1 });
  sections.forEach(sec => observer.observe(sec));

  // Reveal on enter (3D)
  const revealEls = qsa('.reveal3d');
  const revealObs = new IntersectionObserver((els)=>{
    els.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); revealObs.unobserve(e.target); } });
  }, {threshold: 0.2});
  revealEls.forEach(el => revealObs.observe(el));

  // Animate skill bars on view
  const skillBars = qsa('.skill__bar span');
  const skillsObs = new IntersectionObserver((ents)=>{
    ents.forEach(ent => {
      if(ent.isIntersecting){
        const el = ent.target;
        const value = Number(el.dataset.value)||0;
        el.style.transition = 'width 1.2s cubic-bezier(.2,.8,.2,1)';
        requestAnimationFrame(()=> el.style.width = value + '%');
        skillsObs.unobserve(el);
      }
    })
  }, {threshold:0.3});
  skillBars.forEach(b => skillsObs.observe(b));

  // Parallax effect for elements with data-speed
  const parallaxEls = qsa('.parallax');
  let lastY = window.scrollY;
  const onScroll = ()=>{
    const y = window.scrollY;
    const vh = window.innerHeight;
    parallaxEls.forEach(el => {
      const speed = parseFloat(el.dataset.speed||'0.2');
      const rect = el.getBoundingClientRect();
      const offset = (rect.top - vh/2) * speed;
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // 3D tilt interaction for .tilt elements
  const tiltEls = qsa('.tilt');
  tiltEls.forEach(el => {
    const damp = 18; // lower = stronger tilt
    const enter = () => el.style.transition = 'transform .15s ease';
    const leave = () => { el.style.transform = 'rotateX(0) rotateY(0)'; el.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1)'; };
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      const rx = (+py * 12).toFixed(2);
      const ry = (+px * -12).toFixed(2);
      el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    };
    el.addEventListener('mouseenter', enter);
    el.addEventListener('mouseleave', leave);
    el.addEventListener('mousemove', move);
    // touch
    el.addEventListener('touchstart', enter, {passive:true});
    el.addEventListener('touchend', leave);
  });

  // Lightning effect on canvas
  const canvas = document.getElementById('lightningCanvas');
  const ctx = canvas?.getContext('2d');
  const resize = () => { if(!canvas) return; canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  resize();
  window.addEventListener('resize', resize);

  function random(min,max){return Math.random()*(max-min)+min}
  function bolt(){
    if(!ctx || !canvas) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const branches = Math.floor(random(2,5));
    for(let b=0; b<branches; b++){
      let x = random(canvas.width*0.2, canvas.width*0.8);
      let y = -10;
      ctx.beginPath();
      ctx.moveTo(x,y);
      const steps = Math.floor(random(12,18));
      for(let i=0;i<steps;i++){
        const nx = x + random(-30,30);
        const ny = y + random(10, canvas.height/steps + 15);
        ctx.lineTo(nx, ny);
        x = nx; y = ny;
      }
      const glow = ctx.createLinearGradient(0,0,0,canvas.height);
      glow.addColorStop(0,'rgba(91,140,255,.85)');
      glow.addColorStop(1,'rgba(34,211,238,.85)');
      ctx.strokeStyle = glow;
      ctx.lineWidth = random(1.2, 2.4);
      ctx.shadowBlur = 22;
      ctx.shadowColor = 'rgba(91,140,255,.9)';
      ctx.stroke();
    }
  }
  // Periodic lightning with random intervals
  let lightningTimer;
  function schedule(){
    if(lightningTimer) clearTimeout(lightningTimer);
    lightningTimer = setTimeout(()=>{ bolt(); schedule(); }, random(2400, 5200));
  }
  schedule();

  // Footer year
  const yearEl = qs('#year');
  if(yearEl){ yearEl.textContent = new Date().getFullYear(); }
})();
