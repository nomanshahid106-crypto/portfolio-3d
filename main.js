// UI behaviour (ClearPlan-style): quiet staggered fade-rise reveals,
// skill bars, counters, project filter, menu, form, scroll progress.
// Deliberately NO typing effect, NO card tilt/lift on hover — motion is
// calm, short and never covers or moves the content you are reading.
(function(){
  // Stagger: grid items rise one after another, ClearPlan-style
  ['.skills-grid','.projects-grid','.services-grid','.about-facts','.stats'].forEach(function(sel){
    var grid=document.querySelector(sel);
    if(!grid) return;
    Array.prototype.forEach.call(grid.children,function(child,i){
      child.style.transitionDelay=(i*90)+'ms';
    });
  });
  document.querySelectorAll('.timeline .tl-item').forEach(function(item,i){
    item.style.transitionDelay=(i*110)+'ms';
  });

  // Reveal on scroll + skill bars + counters
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('.bar i').forEach(function(b){ b.style.width=b.style.getPropertyValue('--w'); });
      e.target.querySelectorAll('[data-count]').forEach(runCounter);
      if(e.target.hasAttribute('data-count')) runCounter(e.target);
      io.unobserve(e.target);
    });
  },{threshold:.18});
  document.querySelectorAll('.reveal').forEach(function(n){ io.observe(n); });

  function runCounter(node){
    if(node.dataset.done) return; node.dataset.done=1;
    var target=+node.dataset.count, prefix=node.dataset.prefix||'', t0=null;
    function step(ts){ if(!t0)t0=ts; var p=Math.min((ts-t0)/1400,1); var eased=1-Math.pow(1-p,3);
      node.textContent=prefix+Math.floor(target*eased).toLocaleString();
      if(p<1) requestAnimationFrame(step); else node.textContent=prefix+target.toLocaleString()+(target>=100?'+':''); }
    requestAnimationFrame(step);
  }
  document.querySelectorAll('.stat strong').forEach(function(n){ io.observe(n.parentElement); });

  // Project filter
  var chips=document.querySelectorAll('.chip');
  chips.forEach(function(chip){ chip.addEventListener('click',function(){
    chips.forEach(function(c){c.classList.remove('active');}); chip.classList.add('active');
    var f=chip.dataset.filter;
    document.querySelectorAll('.project').forEach(function(p){
      p.classList.toggle('hide', !(f==='all'||p.dataset.cat.split(' ').indexOf(f)>-1));
    });
  });});

  // Mobile menu
  var btn=document.getElementById('menu-btn'), menu=document.getElementById('mobile-menu');
  if(btn){ btn.addEventListener('click',function(){ var open=menu.hidden; menu.hidden=!open; btn.setAttribute('aria-expanded',String(open)); });
    menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ menu.hidden=true; }); }); }

  // Scroll progress (thin top track, like ClearPlan's section tracks)
  var bar=document.getElementById('progress-bar');
  addEventListener('scroll',function(){ var h=document.documentElement; var p=h.scrollTop/(h.scrollHeight-h.clientHeight||1); bar.style.width=(p*100)+'%'; },{passive:true});

  // Contact form (demo — no backend)
  var form=document.getElementById('contact-form');
  if(form) form.addEventListener('submit',function(ev){ ev.preventDefault();
    var name=form.querySelector('[name=name]').value.trim();
    document.getElementById('form-msg').textContent='Thanks'+(name?', '+name:'')+'! This demo form does not send yet — please reach me via GitHub, Fiverr or LinkedIn above.';
    form.reset();
  });
})();
