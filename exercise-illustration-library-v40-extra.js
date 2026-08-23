// START/NOW v40 — additional approved instructional diagrams.
(() => {
  const LIB = window.START_NOW_EXERCISE_ILLUSTRATIONS_V40;
  if (!LIB) return;
  const C={ink:"#1F2937",line:"#D9E0E8",bg:"#F8FAFC",blue:"#3B82F6"};
  const s=(active=false,w=8)=>`stroke="${active?C.blue:C.ink}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  const eq=`stroke="#64748B" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  const head=(x,y,r=12)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${C.ink}" stroke-width="4"/>`;
  const limb=(x1,y1,x2,y2,a=false,w=8)=>`<path d="M${x1} ${y1}L${x2} ${y2}" ${s(a,w)}/>`;
  const torso=(x1,y1,x2,y2,a=false)=>`<path d="M${x1} ${y1}L${x2} ${y2}" ${s(a,11)}/>`;
  const scene=inner=>`<svg viewBox="0 0 300 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true"><rect x="1" y="1" width="298" height="218" rx="22" fill="${C.bg}" stroke="${C.line}"/>${inner}</svg>`;
  const add=(key,start,finish)=>{LIB[key]={start:()=>scene(start()),finish:()=>scene(finish())}};
  const cable=(x,y=28,h=155)=>`<g ${eq}><rect x="${x}" y="${y}" width="40" height="${h}" rx="6"/><path d="M${x+20} ${y+12}v${h-24}"/><circle cx="${x+20}" cy="${y+20}" r="5"/></g>`;
  const dumbbell=(x,y)=>`<g transform="translate(${x} ${y})" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"><path d="M-12 0h24"/><path d="M-14-7v14M-18-5v10M14-7v14M18-5v10"/></g>`;

  add("shoulder-press-machine",
    ()=>`<g ${eq}><path d="M88 45v135M212 45v135M88 54h124M108 104h84"/></g>${head(150,85)}${torso(150,99,150,145,true)}${limb(150,111,121,105,true)}${limb(150,111,179,105,true)}${limb(150,145,129,190)}${limb(150,145,171,190)}`,
    ()=>`<g ${eq}><path d="M88 45v135M212 45v135M88 54h124M108 67h84"/></g>${head(150,85)}${torso(150,99,150,145,true)}${limb(150,111,122,68,true)}${limb(150,111,178,68,true)}${limb(150,145,129,190)}${limb(150,145,171,190)}`);

  add("lateral-raise-cable",
    ()=>`${cable(34,32,150)}<g ${eq}><path d="M54 52h80M134 52v82"/></g>${head(205,48)}${torso(205,62,205,128)}${limb(205,76,176,126,true)}${limb(205,76,230,116)}${limb(205,128,186,192)}${limb(205,128,226,192)}`,
    ()=>`${cable(34,32,150)}<g ${eq}><path d="M54 52h80M134 52v62"/></g>${head(205,48)}${torso(205,62,205,128)}${limb(205,76,157,78,true)}${limb(205,76,230,116)}${limb(205,128,186,192)}${limb(205,128,226,192)}`);

  add("lateral-raise-machine",
    ()=>`<g ${eq}><path d="M92 62v115M208 62v115M92 70h116M108 116h84"/></g>${head(150,88)}${torso(150,102,150,145)}${limb(150,114,124,124,true)}${limb(150,114,176,124,true)}${limb(150,145,132,190)}${limb(150,145,168,190)}`,
    ()=>`<g ${eq}><path d="M92 62v115M208 62v115M92 70h116M108 98h84"/></g>${head(150,88)}${torso(150,102,150,145)}${limb(150,114,108,98,true)}${limb(150,114,192,98,true)}${limb(150,145,132,190)}${limb(150,145,168,190)}`);

  add("pec-deck",
    ()=>`<g ${eq}><path d="M80 54v130M220 54v130M80 62h140M102 108h96"/></g>${head(150,85)}${torso(150,99,150,146,true)}${limb(150,112,110,108,true)}${limb(150,112,190,108,true)}${limb(150,146,130,190)}${limb(150,146,170,190)}`,
    ()=>`<g ${eq}><path d="M80 54v130M220 54v130M80 62h140M128 108h44"/></g>${head(150,85)}${torso(150,99,150,146,true)}${limb(150,112,132,108,true)}${limb(150,112,168,108,true)}${limb(150,146,130,190)}${limb(150,146,170,190)}`);

  add("dumbbell-fly",
    ()=>`<g ${eq}><path d="M72 150h160M90 150v28M214 150v28"/></g>${dumbbell(105,98)}${dumbbell(195,98)}${head(110,124)}${torso(124,128,186,135,true)}${limb(140,129,105,100,true)}${limb(174,133,195,100,true)}`,
    ()=>`<g ${eq}><path d="M72 150h160M90 150v28M214 150v28"/></g>${dumbbell(138,87)}${dumbbell(172,87)}${head(110,124)}${torso(124,128,186,135,true)}${limb(140,129,138,89,true)}${limb(174,133,172,89,true)}`);

  add("reverse-fly-machine",
    ()=>`<g ${eq}><path d="M82 55v130M218 55v130M82 63h136M106 112h88"/></g>${head(150,84)}${torso(150,98,150,145,true)}${limb(150,112,132,112,true)}${limb(150,112,168,112,true)}${limb(150,145,132,190)}${limb(150,145,168,190)}`,
    ()=>`<g ${eq}><path d="M82 55v130M218 55v130M82 63h136M90 112h120"/></g>${head(150,84)}${torso(150,98,150,145,true)}${limb(150,112,94,112,true)}${limb(150,112,206,112,true)}${limb(150,145,132,190)}${limb(150,145,168,190)}`);

  add("reverse-fly-cable",
    ()=>`${cable(38,32,148)}${cable(222,32,148)}${head(150,48)}${torso(150,62,150,128,true)}${limb(150,78,126,112,true)}${limb(150,78,174,112,true)}${limb(150,128,130,192)}${limb(150,128,170,192)}`,
    ()=>`${cable(38,32,148)}${cable(222,32,148)}${head(150,48)}${torso(150,62,150,128,true)}${limb(150,78,91,82,true)}${limb(150,78,209,82,true)}${limb(150,128,130,192)}${limb(150,128,170,192)}`);

  add("preacher-curl",
    ()=>`<g ${eq}><path d="M92 154h118M110 154l42-62M210 154v26"/></g>${head(150,58)}${torso(150,72,150,126)}${limb(150,88,132,116,true)}${limb(132,116,118,150,true)}`,
    ()=>`<g ${eq}><path d="M92 154h118M110 154l42-62M210 154v26"/></g>${head(150,58)}${torso(150,72,150,126)}${limb(150,88,132,116,true)}${limb(132,116,145,94,true)}`);

  add("glute-bridge",
    ()=>`${head(92,132)}${torso(104,134,174,148,true)}${limb(174,148,198,170,true)}${limb(198,170,225,174,true)}`,
    ()=>`${head(92,112)}${torso(104,116,174,116,true)}${limb(174,116,202,150,true)}${limb(202,150,225,174,true)}`);
})();