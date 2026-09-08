import puppeteer from 'puppeteer';
const b = await puppeteer.launch({headless:'new', protocolTimeout:180000});
const p = await b.newPage();
await p.setViewport({width:1440,height:900});
await p.goto('http://127.0.0.1:7788/',{waitUntil:'networkidle0'});
await p.evaluate(()=>document.fonts.ready);

const out = await p.evaluate(()=>{
  const lum = c => { const [r,g,b]=c.match(/\d+(\.\d+)?/g).slice(0,3).map(Number)
    .map(v=>{v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4);});
    return 0.2126*r+0.7152*g+0.0722*b; };
  const ratio = (a,bg)=>{const L1=lum(a),L2=lum(bg);const hi=Math.max(L1,L2),lo=Math.min(L1,L2);
    return +(((hi+0.05)/(lo+0.05)).toFixed(2));};
  const bgOf = el => { let n=el; while(n){const c=getComputedStyle(n).backgroundColor;
    if(c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c; n=n.parentElement;} return 'rgb(255,255,255)'; };

  const targets = [
    ['panel copy',           '.panel-copy p'],
    ['panel number',         '.panel-copy h3 i'],
    ['services lead',        '.services .lead'],
    ['eyebrow label',        '.label'],
    ['card detail',          '.card p'],
    ['card number',          '.card h3 i'],
    ['datum note',           '.datum-note'],
    ['datum eyebrow',        '.datum-head .label'],
    ['review body',          '.quote p'],
    ['review byline',        '.quote footer'],
    ['fact label (ink)',     '.fact dt'],
    ['fact small (ink)',     '.fact dd small'],
    ['gen lead (ink)',       '.gen .lead'],
    ['cta meta (ink)',       '.cta-meta p'],
    ['cta meta label (ink)', '.cta-meta h3'],
    ['footer',               '.ftr .wrap > span'],
    ['footer note',          '.ftr .note'],
    ['nav link',             '.nav a'],
    ['header rating',        '.hdr-rating'],
  ];

  const rows = targets.map(([name,sel])=>{
    const el=document.querySelector(sel); if(!el) return {name, missing:true};
    const cs=getComputedStyle(el);
    const size=parseFloat(cs.fontSize), weight=+cs.fontWeight;
    const large = size>=24 || (size>=18.66 && weight>=700);
    const r=ratio(cs.color, bgOf(el));
    return {name, size:+size.toFixed(1), ratio:r, need: large?3:4.5, pass: r >= (large?3:4.5)};
  });

  // buttons
  const btns=[...document.querySelectorAll('.btn,.tel')].map(el=>{
    const cs=getComputedStyle(el);
    const r=ratio(cs.color, bgOf(el));
    const size=parseFloat(cs.fontSize);
    const large = size>=24;
    return {name:'btn: '+el.textContent.trim().slice(0,22), size:+size.toFixed(1), ratio:r, need:large?3:4.5, pass:r>=(large?3:4.5)};
  });

  return {rows:[...rows,...btns]};
});

const fails = out.rows.filter(r=>r.missing || !r.pass);
console.log(out.rows.map(r=> (r.missing?'MISSING ':(r.pass?'  ok    ':'  FAIL  ')) + String(r.ratio).padStart(6) + ' (need '+r.need+')  ' + r.name).join('\n'));
console.log('\n' + fails.length + ' contrast problems');

// reduced motion
await p.emulateMediaFeatures([{name:'prefers-reduced-motion', value:'reduce'}]);
await p.reload({waitUntil:'networkidle0'});
await new Promise(r=>setTimeout(r,900));
const rmOK = await p.evaluate(()=>{
  const hidden=[...document.querySelectorAll('.rv,.divider .dl')].filter(e=>+getComputedStyle(e).opacity<0.95).length;
  const anims=document.getAnimations().length;
  return {hiddenUnderReducedMotion:hidden, runningAnimations:anims};
});
console.log('\nreduced motion:', JSON.stringify(rmOK));
await b.close();
