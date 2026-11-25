(function(){
  var tip=document.getElementById('tip');
  function show(e){var t=e.target.closest('[data-tip]');if(!t){tip.style.opacity=0;return;}
    tip.textContent=t.getAttribute('data-tip');tip.style.opacity=1;
    var x=(e.touches?e.touches[0].clientX:e.clientX),y=(e.touches?e.touches[0].clientY:e.clientY);
    var w=tip.offsetWidth,h=tip.offsetHeight;var L=Math.min(Math.max(8,x+12),window.innerWidth-w-8);var T=y-h-12;if(T<8)T=y+16;
    tip.style.left=L+'px';tip.style.top=T+'px';}
  document.addEventListener('mousemove',show);document.addEventListener('click',show);
  document.addEventListener('scroll',function(){tip.style.opacity=0;},true);
  var c=document.getElementById('fcity'),s=document.getElementById('fstat'),q=document.getElementById('fq'),n=document.getElementById('fcount');
  function f(){var rows=document.querySelectorAll('#ptable tbody tr'),k=0,hh=0,qq=q.value.trim();
    rows.forEach(function(r){var ok=(!c.value||r.dataset.c===c.value)&&(!s.value||r.dataset.s===s.value)&&(!qq||r.children[1].textContent.indexOf(qq)>=0);
      r.style.display=ok?'':'none';if(ok){k++;hh+=parseInt(r.children[3].textContent.replace(/,/g,''),10)||0;}});
    n.textContent=k+' 案，'+hh.toLocaleString()+' 戶';}
  if(c){[c,s].forEach(function(el){el.addEventListener('change',f);});q.addEventListener('input',f);f();}
})();
