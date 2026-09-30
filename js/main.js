(function(){
var c=document.getElementById('sig');if(!c)return;
var ctx=c.getContext('2d'),still=matchMedia('(prefers-reduced-motion: reduce)').matches;
var W,H,accent,line,t=1.3,mx=0,tx=0,k=0,inside=false,raf=0;
function theme(){var s=getComputedStyle(document.documentElement);accent=s.getPropertyValue('--accent').trim();line=s.getPropertyValue('--line').trim();}
function v(x){var u=x/W,g=Math.exp(-Math.pow((x-mx)/130,2))*k;
  var s=.55*Math.sin(u*13-t*1.3)+.3*Math.sin(u*29+t*.8)+.15*Math.sin(u*53-t*2);
  return Math.max(-1,Math.min(1,s*(.55+.25*Math.sin(u*3+t*.4)+.4*g)));}
function draw(){
  ctx.clearRect(0,0,W,H);
  var m=H/2,A=H*.42,a=W*.36,b=W*.62,x,y,h;
  ctx.strokeStyle=line;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,m);ctx.lineTo(W,m);ctx.stroke();
  ctx.strokeStyle=accent;ctx.lineWidth=1.6;ctx.lineJoin='round';ctx.beginPath();
  for(x=0;x<=a;x+=2){y=m-v(x)*A;if(x){ctx.lineTo(x,y)}else{ctx.moveTo(x,y)}}
  ctx.stroke();
  ctx.fillStyle=accent;
  for(x=Math.ceil(a/12)*12;x<b;x+=12){
    y=m-v(x)*A;ctx.globalAlpha=.35;ctx.strokeStyle=accent;ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(x,m);ctx.lineTo(x,y);ctx.stroke();
    ctx.globalAlpha=1;ctx.beginPath();ctx.arc(x,y,2.4,0,6.2832);ctx.fill();
  }
  for(x=Math.ceil(b/12)*12;x<W;x+=12){
    h=Math.round(v(x)*6)/6*A;
    if(Math.abs(h)<1.5)h=1.5;
    ctx.fillRect(x-2.5,h>0?m-h:m,5,Math.abs(h));
  }
}
function size(){var d=Math.min(devicePixelRatio||1,2);W=c.clientWidth;H=c.clientHeight;c.width=W*d;c.height=H*d;ctx.setTransform(d,0,0,d,0,0);draw();}
function loop(){mx+=(tx-mx)*.12;k+=((inside?1:0)-k)*.06;t+=.016;draw();raf=requestAnimationFrame(loop);}
theme();size();
addEventListener('resize',size);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(){theme();draw();});
if(still)return;
c.addEventListener('pointermove',function(e){tx=e.clientX-c.getBoundingClientRect().left;if(!inside){mx=tx;inside=true;}});
c.addEventListener('pointerleave',function(){inside=false;});
new IntersectionObserver(function(e){
  if(e[0].isIntersecting){if(!raf)raf=requestAnimationFrame(loop);}else{cancelAnimationFrame(raf);raf=0;}
}).observe(c);
})();
