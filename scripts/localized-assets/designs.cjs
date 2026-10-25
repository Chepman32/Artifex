// Code-native redraws. All lettering is supplied separately by copy.json.
const stickers = [
  ['s2', 'love', 'hearts'], ['s3', 'helloLove', 'love'],
  ['s4', 'check', 'arrow'], ['s5', 'follow', 'script'],
  ['s6', 'bio', 'lettering'], ['s8', 'after', 'greenBurst'],
  ['s9', 'reel', 'reel'], ['s10', 'thanks', 'thanks'],
  ['s11', 'sundayMood', 'mood'], ['s12', 'attention', 'attention'],
  ['s13', 'nice', 'bubble'], ['s14', 'free', 'comic'],
  ['s15', 'free', 'tag'], ['s16', 'new', 'new'],
  ['s17', 'hardYear', 'hard'], ['s20', 'halloween', 'pumpkin'],
  ['s28', 'cool', 'cool'], ['s29', 'organic', 'organic'],
].map(([id, key, style]) => ({kind: 'stickers', id, key, style}));

const stamps = [
  ['approved-147677', 'qualityControl', 'qualitySeal', '#278916'],
  ['approved-1966719', 'approved', 'approval', '#a61d27'],
  ['approved-1966719-1', 'approved', 'approvalAlt', '#a61d27'],
  ['draft', 'draft', 'outline', '#d66525'],
  ['original', 'original', 'outline', '#0070c9'],
  ['paid-160126', 'paid', 'outline', '#3c930c'],
  ['received', 'received', 'outline', '#3c930c'],
  ['red-stamp', 'recorded', 'recorded', '#c52628'],
  ['seal', 'guaranteed', 'guarantee', '#252525'],
  ['best-seller', 'bestSeller', 'bestSeller', '#e22228'],
  ['cancelled', 'cancelled', 'solid', '#c82025'],
  ['do-not-copy', 'doNotCopy', 'outline', '#c82025'],
  ['paid-alt', 'paid', 'paidSeal', '#07854d'],
  ['quality-1', 'quality', 'quality', '#c82025'],
  ['quality-2', 'topQuality', 'quality', '#c82025'],
  ['real-stamp', 'real', 'approval', '#d62025'],
  ['sold', 'sold', 'solid', '#c82025'],
  ['stamp', 'wanted', 'wanted', '#b34b45'],
  ['success', 'success', 'success', '#26734e'],
  ['winner', 'winner', 'winner', '#c82025'],
].map(([id, key, style, color]) => ({kind: 'stamps', id, key, style, color}));

const escape = value => value.replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;'}[c]));
const star = (x, y, r, fill, points = 5, inner = r * 0.44) => {
  const coords = Array.from({length: points * 2}, (_, i) => {
    const a = -Math.PI / 2 + i * Math.PI / points;
    const radius = i % 2 ? inner : r;
    return `${x + Math.cos(a) * radius},${y + Math.sin(a) * radius}`;
  }).join(' ');
  return `<polygon points="${coords}" fill="${fill}"/>`;
};
const circle = (r, color, width = 7, extra = '') => `<circle cx="320" cy="320" r="${r}" fill="none" stroke="${color}" stroke-width="${width}" ${extra}/>`;
const heart = (x, y, s, fill, stroke = '#fff') => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 25 C-60 -30 -110 20 -78 65 L0 140 L78 65 C110 20 60 -30 0 25Z" fill="${fill}" stroke="${stroke}" stroke-width="9" stroke-linejoin="round"/>`;
const stars = color => [210, 270, 330, 390, 450].map((x, i) => star(x, 150 + Math.abs(i - 2) * 14, 18, color)).join('') + [225,320,415].map(x => star(x, 485, 20, color)).join('');
const text = (value, box, options = {}) => {
  const {fill = '#171717', stroke = 'none', strokeWidth = 0, size = 96, maxLines = 3, family = 'sans', weight = 900, italic = false} = options;
  const [x,y,w,h] = box;
  return `<g data-fit="true" data-text="${escape(value)}" data-box="${box.join(',')}" data-size="${size}" data-lines="${maxLines}" data-family="${family}" data-weight="${weight}" data-italic="${italic}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round" paint-order="stroke fill"/>`;
};

function stickerArtwork(d, copy) {
  const word = copy[d.key];
  switch (d.style) {
    case 'hearts': return heart(140,110,.7,'#f2323e') + heart(504,107,.65,'#f2323e') + heart(320,165,2.25,'#ed1c24') + text(word,[180,240,280,122],{fill:'#fff',size:84,stroke:'#d51320',strokeWidth:4});
    case 'love': return heart(540,100,.33,'#fc5173') + heart(100,450,.32,'#fc5173') + text(word,[78,155,484,310],{fill:'#fb5276',family:'rounded',size:116}) + '<path d="M65 135V70H150 M490 70H575V140 M65 485V570H150 M490 570H575V490" fill="none" stroke="#fb5276" stroke-width="5"/>';
    case 'arrow': return '<path d="M280 440V498H208L320 592L432 498H360V440Z" fill="#9900ed" stroke="#ffe600" stroke-width="15" stroke-linejoin="round"/>' + text(word,[65,108,510,320],{fill:'#a200ec',stroke:'#ffd900',strokeWidth:18,family:'rounded',italic:true,size:114});
    case 'script': return text(word,[65,165,510,300],{fill:'#ffe000',stroke:'#7400d5',strokeWidth:20,family:'rounded',italic:true,size:108});
    case 'lettering': return '<path d="M88 125L93 150L120 155L96 162L88 188L80 162L54 154L80 147Z M545 458L553 482L580 490L553 499L545 523L537 499L511 490L537 482Z" fill="#151515"/>' + [105,535,80,560].map((x,i)=>`<circle cx="${x}" cy="${210+i*60}" r="7" fill="#151515"/>`).join('') + text(word,[92,162,456,315],{family:'serif',size:110});
    case 'greenBurst': return star(320,320,263,'#151515',14,178) + star(308,310,245,'#74bd1c',14,168) + text(word,[103,195,434,240],{fill:'#fff',stroke:'#1e3800',strokeWidth:12,italic:true,size:114});
    case 'reel': return text(word,[96,116,465,365],{fill:'#ff2929',stroke:'#ffdb00',strokeWidth:16,italic:true,size:142}) + '<path d="M100 533L530 497" stroke="#ffdb00" stroke-width="12" stroke-linecap="round"/>';
    case 'thanks': return text(word,[67,162,510,320],{fill:'#bc08c9',stroke:'#ffe000',strokeWidth:18,italic:true,size:128}) + heart(520,100,.32,'#bc08c9','#ffe000');
    case 'mood': return text(word,[75,128,490,365],{fill:'#fff',stroke:'#171717',strokeWidth:22,family:'rounded',size:116,italic:true});
    case 'attention': return star(320,320,274,'#d82025',42,253) + star(320,320,256,'#fff',42,236) + star(320,320,239,'#ffe121',42,219) + text(word,[142,205,356,230],{size:74});
    case 'bubble': return '<path d="M160 410C32 385 55 218 166 213C170 104 301 90 343 188C440 118 541 189 501 282C617 340 551 471 440 450C408 557 263 535 258 444C212 472 171 452 160 410Z" fill="#ef2bab" stroke="#fff1d7" stroke-width="16"/><circle cx="163" cy="535" r="23" fill="#ef2bab" stroke="#fff1d7" stroke-width="9"/>' + text(word,[142,239,360,168],{fill:'#fff',weight:600,family:'rounded',size:111});
    case 'comic': return star(320,320,280,'#191919',20,131) + star(320,320,257,'#ed1c24',20,139) + star(320,320,221,'#ffcf00',18,157) + text(word,[111,215,418,210],{fill:'#fff000',stroke:'#171717',strokeWidth:14,size:127});
    case 'tag': return '<rect x="80" y="196" width="480" height="248" rx="43" fill="#f02715"/><path d="M470 196H529Q560 196 560 230V286Z" fill="#bd1e0b"/>' + text(word,[115,220,410,195],{fill:'#fff',size:126});
    case 'new': return '<path d="M71 126H563V460H518V532L429 460H71Z" fill="#cf0016" stroke="#fff" stroke-width="15" stroke-linejoin="round"/>' + text(word,[97,185,441,205],{fill:'#fff',size:139});
    case 'hard': return text(word,[85,144,485,349],{fill:'#141414',stroke:'#f12525',strokeWidth:14,size:138});
    case 'pumpkin': return '<path d="M298 124Q264 74 329 61L345 148" fill="#477e34" stroke="#181b14" stroke-width="9"/><ellipse cx="320" cy="287" rx="229" ry="174" fill="#ff831e" stroke="#1a1916" stroke-width="14"/><path d="M190 285L242 224L280 285Z M360 285L398 224L450 285Z M190 329Q320 439 453 329L423 371L393 363L367 394L333 374L307 394L279 369L249 381Z" fill="#1b1b19"/>' + text(word,[72,439,496,117],{fill:'#fff',stroke:'#171717',strokeWidth:13,size:75,maxLines:2});
    case 'cool': return '<path d="M116 228C66 152 178 101 225 165C255 82 371 121 378 171C465 118 533 179 500 246C592 271 570 379 497 382C518 460 421 499 368 451C308 520 222 483 213 432C113 464 63 376 116 337C51 306 58 246 116 228Z" fill="#62d3d3" stroke="#171717" stroke-width="9"/>' + text(word,[140,220,359,205],{fill:'#fff',stroke:'#171717',strokeWidth:12,size:125});
    case 'organic': return circle(244,'#7ac821',10) + '<path d="M198 465C298 343 430 370 491 436C383 507 278 512 198 465Z" fill="#7ac821"/><path d="M179 481Q309 413 470 435" stroke="#fff" stroke-width="8" fill="none"/>' + text(word,[147,175,346,200],{fill:'#61b00d',size:92});
    default: throw new Error(`Unknown sticker style ${d.style}`);
  }
}

function stampArtwork(d, copy, language) {
  const color = d.color;
  const upper = value => value.toLocaleUpperCase(language);
  const word = upper(copy[d.key]);
  const lettering = (box, size = 79, extra = {}) => text(word,box,{fill:color,size,...extra});
  switch (d.style) {
    case 'outline': return `<g transform="rotate(-18 320 320)"><rect x="73" y="188" width="494" height="264" rx="16" fill="none" stroke="${color}" stroke-width="11"/>${lettering([102,219,436,202],90)}</g>`;
    case 'solid': return `<rect x="56" y="196" width="528" height="250" rx="42" fill="${color}"/><rect x="70" y="210" width="500" height="222" rx="30" fill="none" stroke="#fff" stroke-width="6"/>${lettering([93,226,454,190],102,{fill:'#fff'})}`;
    case 'recorded': return `<g transform="rotate(-17 320 320)"><path d="M75 185H565M75 455H565" stroke="${color}" stroke-width="14"/>${lettering([91,225,458,190],105)}</g>`;
    case 'success': return `<g transform="rotate(-17 320 320)"><rect x="58" y="192" width="524" height="256" rx="17" fill="none" stroke="${color}" stroke-width="12"/><rect x="75" y="209" width="490" height="222" rx="9" fill="none" stroke="${color}" stroke-width="4"/>${lettering([101,235,438,171],96)}</g>`;
    case 'approval':
    case 'approvalAlt': return `<g transform="rotate(${d.style === 'approval' ? -15 : 12} 320 320)">${circle(251,color,7)}${circle(219,color,3)}${stars(color)}<rect x="64" y="235" width="512" height="170" fill="#fff" fill-opacity="0" stroke="${color}" stroke-width="6"/>${lettering([80,258,480,128],79)}</g>`;
    case 'qualitySeal': return circle(256,color,8) + circle(235,color,3) + text(upper(copy.qualityControl),[162,132,316,156],{fill:color,size:57}) + '<path d="M249 347L299 395L406 288" stroke="' + color + '" stroke-width="29" fill="none"/>' + text(upper(copy.approved),[151,441,338,84],{fill:color,size:44,maxLines:2});
    case 'paidSeal': return star(320,320,269,color,44,258) + circle(237,'#fff',3) + circle(214,'#fff',2) + text(upper(copy.thanks),[188,154,264,95],{fill:'#fff',size:45,maxLines:2}) + `<g transform="rotate(-14 320 320)"><rect x="69" y="254" width="502" height="135" fill="${color}" stroke="#fff" stroke-width="4"/>${lettering([90,270,460,104],89,{fill:'#fff'})}</g>` + text(upper(copy.thanks),[185,427,270,81],{fill:'#fff',size:40,maxLines:2});
    case 'bestSeller': return circle(260,color,7) + circle(244,color,3) + circle(216,color,4) + lettering([152,231,336,179],93) + star(320,143,24,color) + star(320,495,24,color);
    case 'quality': return circle(239,color,8) + circle(217,color,2) + circle(251,color,4,'stroke-dasharray="3 13"') + `<path d="M77 257H563M77 387H563" stroke="${color}" stroke-width="3"/>` + lettering([58,264,524,117],81) + star(320,167,21,color) + star(320,473,21,color);
    case 'winner': return circle(243,color,7) + circle(216,color,3) + circle(258,color,3,'stroke-dasharray="4 14"') + star(260,180,24,color) + star(380,180,24,color) + star(320,161,34,color) + star(320,475,34,color) + lettering([52,247,536,149],96);
    case 'wanted': return `<g transform="rotate(-17 320 320)">${circle(251,color,8)}${circle(229,color,3)}<rect x="120" y="245" width="400" height="150" fill="none" stroke="${color}" stroke-width="5"/>${lettering([135,261,370,119],78)}</g>`;
    case 'guarantee': return circle(253,color,7) + circle(231,color,3) + text(upper(copy.moneyBack),[159,115,322,131],{fill:color,size:43,maxLines:3}) + `<g transform="rotate(-14 320 320)"><rect x="64" y="252" width="512" height="136" fill="none" stroke="${color}" stroke-width="6"/>${lettering([80,270,480,101],67)}</g>` + star(320,470,33,'#db2828') + star(235,470,20,'#db2828') + star(405,470,20,'#db2828');
    default: throw new Error(`Unknown stamp style ${d.style}`);
  }
}

// A seeded perforation mask gives ink marks a consistent worn texture.
function inkMask() {
  let seed = 731;
  const random = () => {seed = (seed * 16807) % 2147483647; return seed / 2147483647;};
  const holes = Array.from({length: 650}, () => `<ellipse cx="${(random()*640).toFixed(1)}" cy="${(random()*640).toFixed(1)}" rx="${(1+random()*1.8).toFixed(1)}" ry="${(.6+random()*1.8).toFixed(1)}" fill="#000"/>`).join('');
  return `<defs><mask id="ink"><rect width="640" height="640" fill="#fff"/>${holes}</mask></defs>`;
}

function svg(d, copy, language) {
  const artwork = d.kind === 'stickers' ? stickerArtwork(d,copy) : stampArtwork(d,copy,language);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640" lang="${language}">${d.kind === 'stamps' ? inkMask() : ''}<g ${d.kind === 'stamps' ? 'mask="url(#ink)"' : ''}>${artwork}</g></svg>`;
}

module.exports = {designs:[...stickers,...stamps],svg};
