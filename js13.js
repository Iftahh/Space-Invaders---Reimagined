(function(){function Pa(){if(0!=Ca.length){var a=Ca.shift(),b=a[1];H.getElementById("text").textContent=a[0];Da+=b;H.getElementById("pbar-in").style.width=2*Da+"px";a[2]();setTimeout(Pa,0)}}function Qa(a){var b=Y(3.5,(a-Ra)/32);Ra=a;a=(da/3|0)%ea;var c=KEYS[32]?1.65:.6;isLeftPressed()?(e.b.x=W(-10,e.b.x-c),e.F=!0):isRightPressed()?(e.b.x=Y(10,e.b.x+c),e.F=!1):e.F=e.g>Z/2||e.g<-Z/2;!e.H&&e.U&&(e.b.x+=Sa(1.5,e.b.x,.02));fa.k=KEYS[32];c=e.a.y<D;e.b.scale(c?.99:.76);e.b.y=R(-10,20,e.b.y+(KEYS[32]?-.25:
e.H?.8:.5));e.a.add(Ea(e.b,b));e.a.y>D&&(c&&(q[q.length*(1-l/2/l)|0].d=22*e.b.y,console.log("wave "+22*e.b.y),L.k=!0,L.position.x=e.a.x,L.position.y=e.a.y+h-8,L.speed=.75*e.b.y,L.h=20*y(e.b.y)),e.a.y>D+.5*s&&(e.a.y=0));e.a.x>WORLD_WIDTH+l&&(e.a.x=-l);e.a.x<-l&&(e.a.x=WORLD_WIDTH+l);a:{var c=ta(e.a.x/f|0,(e.a.y-.4*h)/f|0),m=headCollide=feetCollide=!1,g=0,v=0;e.U=c==$||c==Fa||1==c;0<e.b.x&&(g=h/4,v=-e.a.x%f);0>e.b.x&&(g=h/-4,v=-e.a.x%f+f);ua((e.a.x+g)/f|0,(e.a.y-.8*h)/f|0)&&(headCollide=!0,ua((e.a.x+
g)/f|0,(e.a.y-.6*h)/f|0)&&(m=!0));ua((e.a.x+g)/f|0,(e.a.y+2*f)/f|0)&&(feetCollide=!0,ua((e.a.x+g)/f|0,e.a.y/f|0)&&(m=!0));if(feetCollide||headCollide)if(m&&(e.b.x*=-.3,e.a.x+=v),.2>y(e.b.y)?e.b.y=0:e.b.y*=0<e.b.y&&feetCollide||0>e.b.y&&headCollide?-.3:.3,headCollide&&(e.a.y+=f-e.a.y%f,m||(e.a.y+=f),e.b.x*=.2),feetCollide){e.a.y-=e.a.y%f;m&&(e.a.y-=f);e.H=!0;Ta=0;break a}6<Ta++&&(e.H=!1)}e.H&&(.3>y(e.b.x)?e.b.x=0:e.b.x*=.8);OffsetY=e.a.y-s/2|0;S=e.a.x-l/2|0;w.setTransform(1,0,0,1,-S,-OffsetY);u.setTransform(1,
0,0,1,-S,-OffsetY);fa.position.x=e.a.x-(e.F?5:15);fa.position.y=e.a.y-25;pb(b);fa.update(b);va.update(b);L.update(b);w.clearRect(S,OffsetY,l,s);u.clearRect(S,OffsetY,l,s);u.save();u.globalCompositeOperation="lighter";fa.O(u);u.restore();va.O(u);wa&&(e.g=Math.atan2(OffsetY+Ua-e.a.y,S+Va-e.a.x),c=e.a,m=e.g,g=wa,u.save(),u.translate(c.x-h/2,c.y-h),e.F&&(u.translate(h,0),u.scale(-1,1),m=Z-m),u.drawImage(g,0,0,h,h,0,0,h,h),u.translate(h/3+h/9,h/3),u.rotate(m),u.drawImage(g,h,0,h,h,-h/3,-h/3,h,h),u.restore());
w.save();L.O(w);w.restore();Wa!=a&&(w.fillStyle=ga[a],Wa=a);qb();D-=.01*b;D<WORLD_HEIGHT-1E3&&(D=WORLD_HEIGHT-10);1E7>M&&(ha[X].clearRect(M-lastRenderX,minDirtyY-lastRenderY,ia-M-2,maxDirtyY-minDirtyY-2),aa(ha[X],M,minDirtyY,M-lastRenderX-1,minDirtyY-lastRenderY-1,ia-M,maxDirtyY-minDirtyY),M=minDirtyY=1E7,ia=maxDirtyY=-1E7);scrollBackground(e.a.x,e.a.y);xa(Qa);da++}function Sa(a,b,c){a-=b;return R(-10,10,y(a)*a*c)}function Xa(){return 1.5}function rb(a){return Ga(l,s,function(b){var c=[],m=[];i=0;
T(l,s,function(b,v){c[i]=ba(5*(b-l/2)/(3*v/s+.6)+5*B(a+z*(b+2*v)/l)+3*B(a+2*z*(b+v)/l));m[i]=ba(5*(2*v/s+.6)*B(a+4*z*(b+v/2)/l)*B(a+3.5*z*(b+v)/l));i++});sb(c,m,I,b,l,s)})}function qb(){if(!(OffsetY+2*s<D)){w.translate(S,0);w.beginPath();w.moveTo(l,OffsetY+s);w.lineTo(0,OffsetY+s);var a=0;ja(q,function(b){w.lineTo(a,b.height+3*B((a-5.25*da)/322*z+4*B((a-3*da)/511*z)+4*B((a-1.5*da)/733*z)));a+=Ya});w.closePath();w.fill();w.strokeStyle="#eef";w.stroke()}}function pb(a){var b=0;ja(q,function(c){c.d+=
a*(-.04*(c.height-D)-.025*c.d);c.height+=c.d*a;b=W(b,y(c.d))});if(1<b){var c=[],m=[];E(Za,function(){for(var a=0;a<q.length;a++)0<a&&(c[a]=.25*(q[a].height-q[a-1].height),q[a-1].d+=c[a]),a<q.length-1&&(m[a]=.25*(q[a].height-q[a+1].height),q[a+1].d+=m[a]);for(a=0;a<q.length;a++)0<a&&(q[a-1].height+=c[a]),a<q.length-1&&(q[a+1].height+=m[a])})}}function ua(a,b){var c=ta(a,b);return c==ka||c==Ha||c==la}function $a(a,b){var c=ab[ta(a,b)];return void 0===c?tb:c}function ta(a,b){return 0>b?$:0>a?b>=1E3-
.4*a?ka:$:2048<=a?b>=1E3+.4*(a-2048)?ka:$:1E3<=b?ka:ya[2048*b+a]}function bb(a,b,c){ya[2048*b+a]=c;a*=f;b*=f;M=Y(M,a-2*f);minDirtyY=Y(minDirtyY,b-2*f);ia=W(ia,a+2*f);maxDirtyY=W(maxDirtyY,b+2*f)}function aa(a,b,c,m,g,v,e){var za=v/f|0,N=e/f|0,h=b/f|0;b=c/f|0;var x=lastRenderX;c=lastRenderY;a.save();a.translate(-x,-c);a.rect(x+m,c+g,v,e);a.clip();m-=f;m-=m%f;g-=f;g-=g%f;for(var za=za+4,N=N+2,x=x+m,t=c+g,p=b;p<b+N;p++){var k=$a(h,p),l=0;E(za,function(b){var c=$a(h+b,p);if(c!=k||b>=za-1){if(k){a.fillStyle=
k;a.beginPath();a.moveTo(x+l*f+O[y(11*l+3*p)%80],t+O[y(9*l+7*p)%80]);for(var m=l+1;m<=b;m++)a.lineTo(x+m*f+O[y(11*m+3*p)%80],t+O[y(9*m+7*p)%80]);m--;for(a.lineTo(x+m*f+O[y(11*m+3*(p+1))%80],1+t+f+O[y(9*m+7*(p+1))%80]);m>=l;m--)a.lineTo(x+m*f+O[y(11*m+3*(p+1))%80],1+t+f+O[y(9*m+7*(p+1))%80]);a.closePath();a.fill()}l=b}k=c});t+=f}a.restore()}function ma(a,b,c){return Ga(k,k,function(m){var g=0;T(k,k,function(v,e){m[g++]=a(v,e);m[g++]=b(v,e);m[g++]=c(v,e);m[g++]=255})})}function ub(){return function(a){var b=
Y(a.n,.4);return na((b+.08)/2,(a.p+.31)/2,(a.b+.16)/2)}}function Ia(a,b){res={D:0,S:[],u:null,C:.3,R:function(){},ca:function(a,b){this.V({N:a,o:[],T:[],k:!0,t:r(12,12),s:r(0,.3),elapsedTime:0,duration:-1,h:0,i:0,i:0});this.V(b||{})},V:function(a){for(var b in a)this[b]=a[b];this.j||(this.j=this.size);this.h||(this.h=this.N/this.G)},B:function(a,b){if(this.o.length==this.N)return null;var g=this.T.shift()||vb();this.da(g,a,b);this.o.push(g);return g},da:function(a,b,g){a.position.x=b+this.t.x*n(-1,
1);a.position.y=g+this.t.y*n(-1,1);b=(this.g+this.L*n(-1,1))*(Z/180);b=r(Math.cos(b),B(b));g=this.speed+this.Q*n(-1,1);a.direction=Ea(b,g);a.size=this.size+this.I*n(-1,1);a.size=1>=a.size?1:a.size|0;a.j=this.j+this.I*n(-1,1);a.c=this.G+this.M*n(-1,1);a.e=this.e+this.P*n(-1,1);a.e=100<a.e?100:0>a.e?0:a.e;a.X=a.size/200*a.e|0;b=[this.q[0]+this.r[0]*n(-1,1),this.q[1]+this.r[1]*n(-1,1),this.q[2]+this.r[2]*n(-1,1),this.q[3]+this.r[3]*n(-1,1)];g=[this.l[0]+this.m[0]*n(-1,1),this.l[1]+this.m[1]*n(-1,1),
this.l[2]+this.m[2]*n(-1,1),this.l[3]+this.m[3]*n(-1,1)];a.color=b;isNaN(a.color[2])&&console.log("Error");a.f[0]=(g[0]-b[0])/a.c;a.f[1]=(g[1]-b[1])/a.c;a.f[2]=(g[2]-b[2])/a.c;a.f[3]=(g[3]-b[3])/a.c;a.Z=(a.j-a.size)/a.c;isNaN(a.f[2])&&console.log("Error")},update:function(a){a/=31;if(this.k&&0<this.h){var b=1/this.h;for(this.i+=a;this.o.length<this.N&&this.i>b;)this.B(this.position.x,this.position.y),this.i-=b;-1!=this.duration&&(this.elapsedTime+=a,this.duration<this.elapsedTime&&this.ga())}var g=
this;ja(this.o,function(b,m){if(0<b.c){g.s&&(b.direction=cb(b.direction,g.s));g.u&&(b.direction.x+=Sa(g.u(b),b.direction.x,g.C));for(var e=0;e<g.S.length;e++){var f=g.S[e],l=b.position,x=f[1];b.direction=cb(b.direction,Ea(r(l.x-x.x,l.y-x.y),f[0]))}b.position.add(b.direction);b.c-=a;g.R(b)}0<b.c?(b.size+=b.Z*a,b.X=b.size/200*b.e|0,f=b.color[0]+=b.f[0]*a,l=b.color[1]+=b.f[1]*a,x=b.color[2]+=b.f[2]*a,e=b.color[3]+=b.f[3]*a,f=["rgba("+R(0,255,f|0),R(0,255,l|0),R(0,255,x|0)].join(),b.aa=g.D||f+",0)",b.$=
f+","+R(0,1,e.toFixed(2))+")"):(g.o.splice(m,1),g.T.push(b))})},ga:function(){this.k=!1;this.i=this.elapsedTime=0},O:function(a){ja(this.o,function(b){b.fa(a)})}};res.ca(a,b);return res}function vb(){return{position:r(0,0),color:[],f:[],fa:function(a){var b=this.size,c=b>>1,m=this.position.x|0,e=this.position.y|0,c=a.createRadialGradient(m+c,e+c,this.X,m+c,e+c,c);c.addColorStop(0,this.$);c.addColorStop(1,this.aa);a.fillStyle=c;a.fillRect(m,e,b,b)}}}function cb(a,b){return r(a.x+b.x,a.y+b.y)}function Ea(a,
b){return r(a.x*b,a.y*b)}function r(a,b){return{x:a||0,y:b||0,scale:function(a){this.x*=a;this.y*=a},add:function(a){this.x+=a.x;this.y+=a.y}}}function db(a){var b=a.canvas.width,c=a.canvas.height,m=U(b,c);Ja(a,F(m),[-1,0,0,0,0,0,-2,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0]);var e=Ja(a,0,[0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,-2,0,0,0,0,0,-1]),v=0,G=e.data;E(b*c,function(){E(3,function(){G[v]=255-G[v];v++});v++});var f=U(b,c);F(f).putImageData(e,0,0);a.globalCompositeOperation="darken";a.drawImage(f,0,0,
b,c);a.globalCompositeOperation="lighter";a.drawImage(m,0,0,b,c)}function Ja(a,b,c){var m=Ka(a);a=(b||a).createImageData(m.width,m.height);eb(m,a.data,c);if(!b)return a;b.putImageData(a,0,0)}function eb(a,b,c){side=ba(wb(c.length));halfSide=side/2|0;src=a.data;sw=a.width;sh=a.height;var m=0;T(sw,sh,function(a,e){var G=0,f=0,N=0;T(side,side,function(b,m){var l=e+m-halfSide,p=a+b-halfSide,l=l+10*sh,l=l%sh,p=p+10*sw,p=p%sw,l=4*(l*sw+p),p=c[m*side+b];G+=src[l]*p;f+=src[l+1]*p;N+=src[l+2]*p});b[m++]=G;
b[m++]=f;b[m++]=N;b[m++]=255})}function sb(a,b,c,m,e,f){var G=0,l=0,N=20*e,k=20*f;T(e,f,function(h,t){var p=a[l],n=b[l];l++;p=4*((h-p+N)%e+(t-n+k)%f*e);m[G++]=c[p++];m[G++]=c[p++];m[G++]=c[p++];m[G++]=c[p]})}function oa(a,b){var c=Ka(a),e=c.data,g=0;E(c.width*c.height,function(){var a=e[g],c=e[g+1],f=e[g+2],a=a/255,c=c/255,f=f/255,l,k,h,t=Math.max(a,c,f),p=t-Math.min(a,c,f);0==p?a=h=0:(h=p/t,l=(t-a)/6/p+.5,k=(t-c)/6/p+.5,f=(t-f)/6/p+.5,a=a===t?f-k:c===t?1/3+l-f:2/3+k-l,0>a?a++:1<a&&a--);h=b({n:a,
p:h,b:t});e[g++]=h.ea;e[g++]=h.ba;e[g++]=h.Y;g++});a.putImageData(c,0,0)}function na(a,b,c){void 0===b&&(b=a.p,c=a.b,a=a.n);var e=6*a|0,g=6*a-e;a=c*(1-b);var f=c*(1-g*b);b=c*(1-(1-g)*b);var l,h,k;switch(e%6){case 0:l=c;h=b;k=a;break;case 1:l=f;h=c;k=a;break;case 2:l=a;h=c;k=b;break;case 3:l=a;h=f;k=c;break;case 4:l=b;h=a;k=c;break;case 5:l=c,h=a,k=f}return{ea:255*l|0,ba:255*h|0,Y:255*k|0}}function A(a,b,c,e,g,f,l,h,k,s){function x(p,q){var r=q*a+p;try{return t[r]?t[r]:t[r]=P(s)|0?R(0,255,(P(k)|0)+
x((a+p-(n(g,f)|0))%a,(b+q-(n(l,h)|0))%b)):n(c,e)|0}catch(w){return t[r]=n(c,e)|0}}var t=[];return x}function Q(a,b,c){Ca.push([a,b,c])}function Ga(a,b,c){a=U(a,b);b=F(a);imgData=Ka(b);d=imgData.data;c(d,b,a);b.putImageData(imgData,0,0);return a}function Ka(a){return a.getImageData(0,0,a.canvas.width,a.canvas.height)}function n(a,b){return a+P(b-a)}function P(a){return pa()*a}function La(a){return a*a}function F(a){return a.getContext("2d")}function U(a,b){var c=H.createElement("canvas");c.width=a||
l;c.height=b||s;return c}function T(a,b,c){for(var e=0;e<b;e++)for(var g=0;g<a;g++)c(g,e)}function R(a,b,c){return Y(b,W(a,c))}function ja(a,b){for(var c=a.length-1;0<=c&&!b(a[c],c);c--);}function E(a,b){for(var c=0;c<a;c++)b(c)}function pa(){var a=2091639*C.J+C.v*C.w;C.J=C.K;C.K=C.A;C.v=a|0;C.A=a-C.v;return C.A}var qa=250,fb=400,ea=10,Za=8,f=7,l=1E7,s=0;/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)&&(qa=200,fb=300,ea=5,Za=4);for(;(s>innerHeight||l>innerWidth)&&
3<f;)f--,SIZE_FACTOR=f/7,l=1715*SIZE_FACTOR|0,s=1400*SIZE_FACTOR|0;WORLD_WIDTH=2048*f;WORLD_HEIGHT=1E3*f;var D=WORLD_HEIGHT-150,ga=[],S=OffsetY=0,C={W:function(a){a=1>a?1/a:a;this.J=(a>>>0)*this.w;a=69069*a+1>>>0;this.K=a*this.w;this.A=(69069*a+1>>>0)*this.w;this.v=1;return this},J:0,K:0,A:0,v:0,w:2.3283064365386963E-10};C.W(5);var ca=[],ra=[],H=document;H.getElementById("overlay").style.width=l+"px";H.getElementById("overlay").style.left=(-l>>1)+"px";var xb=H.getElementById("canvas_cont");E(4,function(){var a=
U();a.style.left=(-l>>1)+"px";xb.appendChild(a);ca.push(a);ra.push(F(a))});var Ma=ra[0],V=ra[1],u=ra[2],w=ra[3],y=Math.abs,Y=Math.min,W=Math.max,B=Math.sin,ba=Math.round,wb=Math.sqrt,Z=Math.PI,z=2*Z,xa=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame;if(!xa)var gb=0,xa=function(a){var b=Date.now(),c=W(0,16-(b-gb));window.setTimeout(function(){a(b+c)},c);gb=b+c};var Ca=[],e={a:r(50*f,900*f),b:r()},wa=red_man=0,h=64*SIZE_FACTOR|0,yb=U(2*h,h),hb=F(yb),
Na=new Image;Na.onload=function(){hb.drawImage(Na,0,0,2*h,h);wa=U(2*h,h);var a=F(wa),b=hb.getImageData(0,0,2*h,h).data,c=a.createImageData(2*h,h),e=c.data,g=0;T(2*h,h,function(){e[g]=b[g];g++;e[g]=b[g];g++;e[g]=b[g]/2;g++;e[g]=b[g];g++});a.putImageData(c,0,0)};Na.src="./man.gif";var Ta=0;KEYS={};updateFromKeys=function(a){KEYS[a.keyCode]="keydown"==a.type;(32==a.keyCode||37<=a.keyCode&&40>=a.ha)&&a.preventDefault()};isLeftPressed=function(){return KEYS[37]||KEYS[65]||KEYS[83]};isRightPressed=function(){return KEYS[39]||
KEYS[68]||KEYS[70]};H.addEventListener("keydown",updateFromKeys);H.addEventListener("keyup",updateFromKeys);H.body.addEventListener("touchmove",function(a){a.preventDefault()},!1);var Va=0,Ua=0;ca[ca.length-1].addEventListener("mousemove",function(a){var b=ca[1].getBoundingClientRect();Va=a.clientX-b.left;Ua=a.clientY-b.top},!1);ca[ca.length-1].addEventListener("onmousedown",function(){});var ib;Q("Painting Sky",5,function(){ib=Ga(qa,s,function(a){var b=0;E(qa,function(){a[b++]=40;a[b++]=50;a[b++]=
80;a[b++]=255});var c=210/s,e=4*qa;T(qa,s-1,function(){a[b]=(a[b-4]+a[b-e]+(P(2)|0)>>1)+(pa()<c?P(2)|0:0);b++;a[b]=(a[b-4]+a[b-e]+(P(2)|0)>>1)+(pa()<c?P(2)|0:0);b++;a[b]=(a[b-4]+a[b-e]+(P(2)|0)>>1)+(pa()<c?P(2)|0:0);b++;a[b++]=255})});Ma.fillStyle=Ma.createPattern(ib,"repeat-x");Ma.fillRect(0,0,l,s);addWaveFrame()});var k=fb,Aa,jb,kb,Ba,lb,mb,nb,ob,sa;Q("Chiseling rocks",10,function(){function a(a,b){return function(c,e){return W(b,a(c,e))}}Aa=ma(A(k,k,120,180,-3,3,-3,3,-1,200),A(k,k,70,130,-3,3,
-3,3,-1,100),A(k,k,40,80,-3,3,-3,3,-2,100));var b=ma(A(k,k,60,180,-1,2,1,3,-2,100),A(k,k,70,220,-1,2,1,3,-1,200),A(k,k,70,100,-1,2,1,3,-3,100)),c=ma(a(A(k,k,60,110,1,3,-3,0,-4,100),20),a(A(k,k,80,160,1,3,-3,0,-2,500),30),a(A(k,k,20,40,1,3,-3,0,4,1E3),80));jb=V.createPattern(b,"repeat");oa(F(b),function(a){return na(a.n,.2*a.p,.4*a.b)});kb=V.createPattern(b,"repeat");oa(F(c),function(a){return na(a.n,.1*a.p,R(.75,1,1.1*a.b))});mb=V.createPattern(c,"repeat");addWaveFrame()});Q("Chiseling rocks",10,
function(){Ba=ma(A(k+7,k+7,80,140,-2,4,-2,4,2,300),A(k+7,k+7,80,140,-2,4,-2,4,-1,300),A(k+7,k+7,40,80,-2,4,-2,4,-2,300));cave_floor_canvas=ma(A(k,k,30,50,1,4,1,4,5,100),A(k,k,120,180,1,4,1,4,-2,200),A(k,k,150,220,1,4,1,4,-2,200));ground_ctx=F(Ba);sa=F(Aa);var a=F(cave_floor_canvas);oa(a,function(a){return na(a.n,.3*a.p,.5*a.b)});ja([ground_ctx,sa,a],function(a){Ja(a,a,[.1,.1,.1,.1,.2,.1,.1,.1,.1])});nb=V.createPattern(cave_floor_canvas,"repeat");addWaveFrame()});Q("Chiseling rocks",10,function(){db(ground_ctx);
oa(ground_ctx,function(a){return na(a.n,.3*a.p,.5*a.b)});db(sa);oa(sa,ub());ob=V.createPattern(Aa,"repeat");lb=V.createPattern(Ba,"repeat");Aa=Ba=ground_ctx=sa=0;addWaveFrame()});var ya,J=l+400,K=s+400,O=[],X=0,Oa=[],ha=[];Q("Digging Caves",10,function(){C.W(1);var a=U(2048,1E3),b=F(a);b.fillStyle="rgba(0,0,0,0)";b.fillRect(0,0,2048,1E3);b.shadowColor="#400000";b.shadowBlur=0;b.shadowOffsetX=0;b.shadowOffsetY=-14;b.fillStyle="#600000";var c=[];c[2048]=0;(function(a,b,c){var e=a.length-1;c=Math.pow(2,
-c);b*=c;var f=e/2;for(a[0]=a[e]=0;f;){for(var g=f;g<e;g+=2*f)a[g]=b*n(.2,1)+(a[g-f]+a[g+f])/2;b*=c;f>>=1}})(c,1500,.7);b.beginPath();b.lineTo(0,1E3);E(2048,function(a){c[a]+=400*La(B(2*z*a/2048))*La(B(Z+3*z*a/2048));c[a]*=1/(1+La(.001*(a-1024)));b.lineTo(a,1E3-c[a])});b.lineTo(2049,1E3);b.closePath();b.fill();b.clip();b.shadowOffsetY=3;b.lineWidth=22;b.shadowColor="#800000";b.beginPath();b.strokeStyle="#a00000";b.moveTo(0,600);b.lineTo(2048,900);b.moveTo(0,900);b.lineTo(2048,600);b.moveTo(204.8,
0);b.lineTo(1433.6,810);b.moveTo(1843.2,0);b.lineTo(614.4,810);b.stroke();b.beginPath();b.fillStyle="#a00000";b.arc(204.8,750,30,0,z);b.arc(1843.2,750,30,0,z);b.fill();ya=new Uint8Array(2048E3);var e=b.getImageData(0,0,2048,1E3).data,f=0,l=0;T(2048,1E3,function(a,b){var h=e[f+=4]>>5,k=b/1E3;.4>k&&(h==Fa||h==Ha)&&b<1E3-c[a]+100*(.4-k)&&(h=la);ya[l++]=h})});E(2,function(){var a=U(J,K);Oa.push(a);ha.push(a.getContext("2d"))});E(80,function(){O.push(n(-(f>>1),1+(f>>1))|0)});var ab={},M=minDirtyY=1E7,
ia=maxDirtyY=-1E7,$=0,Fa=2,Ha=3,tb=4,ka=6,la=7;Q("Digging Caves",10,function(){ab=[0,kb,jb,lb,nb,ob,"#333",mb];addWaveFrame()});lastRenderX=lastRenderY=1E7;scrollBackground=function(a,b){a-=J/2;b-=K/2;var c=ha[X],e=a-lastRenderX,f=b-lastRenderY,h=y(e),k=y(f);if(h||k){if(h>J||k>K)lastRenderX=a,lastRenderY=b,aa(c,a,b,0,0,J,K);else if(200<h||200<k){lastRenderX=a;lastRenderY=b;var n,q,r,x,c=0;0>e?(n=h,q=0):(n=0,q=h);0>f?(r=k,x=0):(x=k,r=0);var t=J-h,p=K-k,w=1-X,u=ha[w];u.clearRect(0,0,J,K);u.drawImage(Oa[X],
q,x,t,p,n,r,t,p);n=b;q=a;0>f?(aa(u,q,n,0,0,J,k),c=k,n+=k):aa(u,q,n+K-k,0,K-k,J,k);0>e?aa(u,q,n,0,c,h,K-k):(q+=J-h,aa(u,q,n,J-h,c,h,K-k));X=w;e=f=0}V.clearRect(0,0,l,s);V.drawImage(Oa[X],200+e,200+f,l,s,0,0,l,s)}};var I;addWaveFrame=function(){if(!I){I=[];for(var a=0,b=0;b<s;b++)for(var c=n(5,25)|0,e=n(10,35)|0,f=n(20,40)|0,h=0;h<l;h++){var k=n(25,50)|0,q=n(30,65)|0,r=n(70,120)|0;I[a++]=20+(k+c>>1)+ba(5*B(b*z/10));I[a++]=25+(q+e>>1)+ba(5*B(b*z/12));I[a++]=30+(r+f>>1)+ba(8*B(b*z/13));I[a++]=255;c=k;
e=q;f=r}a=[];eb({data:I,width:l,height:s},a,[.1,.1,.1,.1,.2,.1,.1,.1,.1]);I=a}ga.push(w.createPattern(rb(ga.length*z/ea),"repeat"))};E(ea-ga.length,function(){Q("Waving waves",3,function(){ga.length<ea&&addWaveFrame()})});Q("Waving waves",1,function(){I=null});var Ya=10,q=[];E(l/Ya+1,function(){q.push({height:D,d:0})});w.globalAlpha=.9;var da=0,Wa,fa=Ia(350,{position:r(),g:90,L:10,duration:-1,l:[200,45,10,0],m:[40,40,40,0],s:r(0,.03),G:1,M:0,t:r(4,6),e:12,P:12,size:30*SIZE_FACTOR|0,j:75*SIZE_FACTOR|
0,D:"rgba(40,20,10,0)",I:4,speed:4,Q:1,h:140,q:[220,188,88,1],r:[32,35,38,0],R:function(a){if(a.position.y>D){if(a.c=0,va.B(a.position.x,a.position.y)&&(a=q[q.length*(1-(a.position.x-S)/l)|0+(n(-1,2)|0)]))a.d+=1}else{var b=ta(a.position.x/f|0,a.position.y/f|0);if(b==Fa||b==la)a.c=0,va.B(a.position.x,a.position.y),b==la?(L.speed=3,L.B(a.position.x,a.position.y),bb(a.position.x/f|0,a.position.y/f|0,$)):bb(a.position.x/f|0,a.position.y/f|0,.8>pa()?1:$);else if(b==ka||b==Ha||b==la)a.direction.y*=-1}},
u:function(){return e.U?1.5:0},C:.1}),va=Ia(250,{k:!1,position:r(),g:-90,L:20,duration:10,l:[40,40,40,0],m:[10,10,10,0],s:r(0,-.25),G:.8,M:.2,t:r(2,2),e:12,P:12,size:45*SIZE_FACTOR|0,j:60*SIZE_FACTOR|0,I:6,D:"transparent",speed:1,Q:0,q:[220,220,220,1],r:[22,22,22,0],u:Xa,C:.8}),L=Ia(250,{k:!1,position:r(),g:-90,L:80,duration:.15,l:[40,70,140,.2],m:[10,10,10,0],s:r(0,.5),G:1.2,M:.2,t:r(16,4),e:72,P:12,size:14,j:8,I:1,h:100,speed:2,D:"rgba(140,140,255,0)",Q:.5,q:[60,80,120,.9],r:[12,12,12,0],R:function(a){a.position.y>
D&&0<a.direction.y&&(a.c=0)},u:Xa,C:.05}),Ra=0,Da=0;Q("Ready!",10,function(){H.getElementById("overlay").style.display="none";xa(Qa)});Pa()})();