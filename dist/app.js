'use strict';
const $=id=>document.getElementById(id), ids=['current','cost','mode','size','currency','fees','range','target','symbol'];
try{const saved=JSON.parse(localStorage.getItem('stock-profit-v1'));if(saved)ids.forEach(id=>{if(saved[id]!==undefined)$(id).value=saved[id]})}catch{}
let s=null, hover=null, locked=false, geo=null;
const num=x=>new Intl.NumberFormat('zh-CN',{maximumFractionDigits:4}).format(x);
const money=x=>`${s.currency} ${new Intl.NumberFormat('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2}).format(x)}`;
const percent=x=>`${x>0?'+':''}${x.toFixed(2)}%`;
const tone=x=>x>0?'positive':x<0?'negative':'';
function show(id,value,n){$(id).textContent=value;$(id).classList.remove('positive','negative');if(tone(n))$(id).classList.add(tone(n))}
function calc(p){return (p-s.cost)*s.q-s.fees}
function update(){
 const v=Object.fromEntries(ids.map(id=>[id,$(id).value]));const current=+v.current,cost=+v.cost,size=+v.size,fees=+v.fees,target=+v.target;
 if(![current,cost,size,fees,target].every(Number.isFinite)||current<=0||cost<=0||size<=0||fees<0||target<0||['current','cost','size','fees','target'].some(id=>!v[id].trim())){$('error').textContent='请填写有效数字：股价、成本和规模须大于 0；手续费和目标价不能为负。';s=null;return}
 s={...v,current,cost,fees,target,q:v.mode==='amount'?size/cost:size};s.cap=s.cost*s.q+s.fees;s.be=s.cost+s.fees/s.q;
 if(![s.q,s.cap,s.be,calc(target)].every(Number.isFinite)){$('error').textContent='数值过大，请减小输入。';s=null;return}
 $('error').textContent='';try{localStorage.setItem('stock-profit-v1',JSON.stringify(v))}catch{}
 show('nowProfit',money(calc(current)),calc(current));show('nowReturn',percent(calc(current)/s.cap*100),calc(current));$('breakEven').textContent=num(s.be);$('position').textContent=`持仓 ${num(s.q)} 股 · 建仓金额 ${money(s.cost*s.q)}`;$('chartUnit').textContent=`纵轴：净盈亏（${s.currency}） / 横轴：股价`;
 show('targetProfit',money(calc(target)),calc(target));$('targetChange').textContent=`距当前价 ${percent((target/current-1)*100)} · 收益率 ${percent(calc(target)/s.cap*100)}`;
 $('scenarios').innerHTML=[-.5,-.2,-.1,0,.1,.2,.5,1].map(r=>{const p=current*(1+r),profit=calc(p);return `<tr><td>${percent(r*100)}</td><td>${num(p)}</td><td class="${tone(profit)}">${money(profit)}</td><td class="${tone((p-current)*s.q)}">${money((p-current)*s.q)}</td><td class="${tone(profit)}">${percent(profit/s.cap*100)}</td></tr>`}).join('');
 if(!locked)hover=current;draw();
}
function draw(){if(!s)return;const canvas=$('chart'),rect=canvas.getBoundingClientRect(),w=rect.width,h=rect.height,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);const left=w<500?65:85,right=20,top=30,bottom=43,range=+s.range,lo=Math.max(0,Math.min(s.current*(1-range),s.be*.9,s.target*.9)),hi=Math.max(s.current*(1+range),s.be*1.1,s.target*1.1),a=calc(lo),b=calc(hi),pad=Math.max((b-a)*.12,1),min=Math.min(a,0)-pad,max=Math.max(b,0)+pad;const X=p=>left+(p-lo)/(hi-lo)*(w-left-right),Y=p=>top+(max-p)/(max-min)*(h-top-bottom);geo={left,right,w,lo,hi};
 ctx.font='12px system-ui';ctx.lineWidth=1;
 for(let i=0;i<=4;i++){const p=min+(max-min)*i/4,y=Y(p);ctx.strokeStyle='#29364b';ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(w-right,y);ctx.stroke();ctx.fillStyle='#9cacc3';ctx.textAlign='right';ctx.fillText(new Intl.NumberFormat('zh-CN',{notation:'compact',maximumFractionDigits:1}).format(p),left-10,y+4)}
 for(let i=0;i<=4;i++){const p=lo+(hi-lo)*i/4;ctx.textAlign='center';ctx.fillStyle='#9cacc3';ctx.fillText(num(p),X(p),h-15)}
 const zero=Y(0);ctx.strokeStyle='#677a94';ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(left,zero);ctx.lineTo(w-right,zero);ctx.stroke();ctx.beginPath();ctx.moveTo(X(s.current),top);ctx.lineTo(X(s.current),h-bottom);ctx.stroke();ctx.setLineDash([]);
 const split=Math.max(lo,Math.min(hi,s.be));[[lo,split,'#ff8093','rgba(255,128,147,.09)'],[split,hi,'#45ddb0','rgba(69,221,176,.09)']].forEach(([p1,p2,color,fill])=>{ctx.beginPath();ctx.moveTo(X(p1),zero);ctx.lineTo(X(p1),Y(calc(p1)));ctx.lineTo(X(p2),Y(calc(p2)));ctx.lineTo(X(p2),zero);ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X(p1),Y(calc(p1)));ctx.lineTo(X(p2),Y(calc(p2)));ctx.stroke()});
 hover=Math.max(lo,Math.min(hi,hover??s.current));const x=X(hover),y=Y(calc(hover));ctx.fillStyle='rgba(133,177,255,.09)';ctx.fillRect(x-8,top,16,h-top-bottom);ctx.strokeStyle='#a8caff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,h-bottom);ctx.stroke();ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fillStyle='#edf3ff';ctx.fill();ctx.textAlign='center';ctx.fillStyle='#c4dcff';ctx.fillText(`${locked?'已锁定 · ':''}${num(hover)}`,Math.max(left+35,Math.min(w-55,x)),17);
 $('hoverPrice').textContent=num(hover);show('hoverProfit',money(calc(hover)),calc(hover));show('hoverChange',percent((hover/s.current-1)*100),hover-s.current);show('hoverReturn',percent(calc(hover)/s.cap*100),calc(hover));
}
function point(e){if(!s||!geo)return;const rect=$('chart').getBoundingClientRect();hover=geo.lo+(e.clientX-rect.left-geo.left)/(geo.w-geo.left-geo.right)*(geo.hi-geo.lo);draw()}
$('chart').addEventListener('pointermove',e=>{if(!locked)point(e)});$('chart').addEventListener('click',e=>{if(!s)return;if(!locked)point(e);locked=!locked;draw()});$('chart').addEventListener('pointerleave',()=>{if(!locked&&s){hover=s.current;draw()}});
ids.forEach(id=>$(id).addEventListener('input',update));window.addEventListener('resize',draw);
// 接口契约：GET /api/quote?symbol=AAPL，返回 {symbol, price, currency, asOf, source}
window.stockQuoteProvider={async getQuote(symbol){const res=await fetch('/api/quote?symbol='+encodeURIComponent(symbol));let data;try{data=await res.json()}catch{throw Error('请通过 start.bat 启动，或配置行情接口。')}if(!res.ok)throw Error(data.error||'行情请求失败');return data}};
$('fetchQuote').addEventListener('click',async()=>{const btn=$('fetchQuote');btn.disabled=true;$('quoteStatus').textContent='正在读取…';try{const q=await window.stockQuoteProvider.getQuote($('symbol').value.trim());if(typeof q.price!=='number'||!Number.isFinite(q.price)||q.price<=0||!['USD','JPY','CNY','HKD'].includes(q.currency)||!q.source||!q.asOf)throw Error('行情响应缺少有效价格、币种、来源或时间。');if(q.currency!==$('currency').value)throw Error(`行情币种为 ${q.currency}，与持仓币种不同。请先确认持仓单位。`);$('current').value=q.price;update();$('quoteStatus').textContent=`来源：${q.source} · 时间：${q.asOf}`}catch(e){$('quoteStatus').textContent=e.message}finally{btn.disabled=false}});update();
