// START/NOW v40 — reusable instructional exercise illustration library.
// Deliberately simple vector diagrams: body position + movement + simplified equipment.
(() => {
  const C = {
    ink: "#1F2937",
    muted: "#94A3B8",
    line: "#D9E0E8",
    bg: "#F8FAFC",
    surface: "#FFFFFF",
    blue: "#3B82F6",
    blueSoft: "#DBEAFE"
  };

  const stroke = (active = false, width = 8) => `stroke="${active ? C.blue : C.ink}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  const thin = `stroke="${C.ink}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  const eq = `stroke="#64748B" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  const head = (x, y, r = 12) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${C.ink}" stroke-width="4"/>`;
  const joint = (x, y, active = false, r = 5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${active ? C.blue : C.ink}"/>`;
  const limb = (x1, y1, x2, y2, active = false, width = 8) => `<path d="M${x1} ${y1} L${x2} ${y2}" ${stroke(active, width)}/>`;
  const torso = (x1, y1, x2, y2, active = false) => `<path d="M${x1} ${y1} L${x2} ${y2}" ${stroke(active, 11)}/>`;
  const dumbbell = (x, y, rotate = 0) => `<g transform="translate(${x} ${y}) rotate(${rotate})" ${thin}><path d="M-12 0H12"/><path d="M-14 -7v14M-18 -5v10M14 -7v14M18 -5v10"/></g>`;
  const barbell = (x1, y, x2) => `<g ${thin}><path d="M${x1} ${y}H${x2}"/><path d="M${x1+8} ${y-10}v20M${x1+14} ${y-7}v14M${x2-8} ${y-10}v20M${x2-14} ${y-7}v14"/></g>`;
  const bench = (x, y, w = 118, incline = 0) => incline ? `<g ${eq}><path d="M${x} ${y} l${w-36} -${incline}"/><path d="M${x+8} ${y+3}v28M${x+w-40} ${y-incline+3}v28"/></g>` : `<g ${eq}><path d="M${x} ${y}h${w}"/><path d="M${x+12} ${y}v30M${x+w-12} ${y}v30"/></g>`;
  const cable = (x, y = 30, h = 150) => `<g ${eq}><rect x="${x}" y="${y}" width="38" height="${h}" rx="6"/><path d="M${x+19} ${y+10}v${h-20}"/><circle cx="${x+19}" cy="${y+18}" r="5"/></g>`;
  const platform = (x, y, w = 72, h = 12, angle = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="#E2E8F0" stroke="#64748B" stroke-width="4" transform="rotate(${angle} ${x+w/2} ${y+h/2})"/>`;

  function scene(inner) {
    return `<svg viewBox="0 0 300 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true"><rect x="1" y="1" width="298" height="218" rx="22" fill="${C.bg}" stroke="${C.line}"/>${inner}</svg>`;
  }

  function standingPerson({headX=150, headY=45, shoulderY=72, hipY=130, leftHand=[115,112], rightHand=[185,112], leftFoot=[125,195], rightFoot=[175,195], armsActive=false, legsActive=false, torsoActive=false}={}) {
    return `${head(headX,headY)}${torso(headX,shoulderY,headX,hipY,torsoActive)}${limb(headX,shoulderY,leftHand[0],leftHand[1],armsActive)}${limb(headX,shoulderY,rightHand[0],rightHand[1],armsActive)}${limb(headX,hipY,leftFoot[0],leftFoot[1],legsActive)}${limb(headX,hipY,rightFoot[0],rightFoot[1],legsActive)}${joint(headX,shoulderY,torsoActive)}${joint(headX,hipY,legsActive)}`;
  }

  const LIB = {};
  const add = (key, start, finish) => { LIB[key] = { start: () => scene(start()), finish: () => scene(finish()) }; };

  add("rdl-barbell",
    () => `${barbell(95,154,205)}${head(135,48)}${torso(135,64,150,112,true)}${limb(150,112,115,148,true)}${limb(150,112,185,148,true)}${limb(150,112,122,190,true)}${limb(150,112,185,188,true)}`,
    () => `${barbell(96,135,204)}${head(118,52)}${torso(122,66,154,108,true)}${limb(154,108,115,132,true)}${limb(154,108,185,132,true)}${limb(154,108,127,190,true)}${limb(154,108,188,186,true)}`);

  add("rdl-dumbbell",
    () => `${dumbbell(112,150)}${dumbbell(188,150)}${head(150,44)}${torso(150,60,150,120,true)}${limb(150,75,112,145,true)}${limb(150,75,188,145,true)}${limb(150,120,125,192,true)}${limb(150,120,178,192,true)}`,
    () => `${dumbbell(105,132)}${dumbbell(195,132)}${head(120,50)}${torso(125,65,158,110,true)}${limb(158,88,105,128,true)}${limb(158,88,195,128,true)}${limb(158,110,130,192,true)}${limb(158,110,190,188,true)}`);

  add("bench-barbell",
    () => `${bench(76,150,150)}${barbell(78,78,225)}${head(112,125)}${torso(126,128,184,135,true)}${limb(137,128,112,80,true)}${limb(173,133,194,80,true)}${limb(184,135,205,154)}${limb(184,135,205,184)}`,
    () => `${bench(76,150,150)}${barbell(78,104,225)}${head(112,125)}${torso(126,128,184,135,true)}${limb(137,128,118,105,true)}${limb(173,133,190,105,true)}${limb(184,135,205,154)}${limb(184,135,205,184)}`);

  add("bench-dumbbell",
    () => `${bench(76,150,150)}${dumbbell(118,78)}${dumbbell(194,78)}${head(112,125)}${torso(126,128,184,135,true)}${limb(137,128,118,82,true)}${limb(173,133,194,82,true)}${limb(184,135,205,154)}${limb(184,135,205,184)}`,
    () => `${bench(76,150,150)}${dumbbell(128,109)}${dumbbell(187,109)}${head(112,125)}${torso(126,128,184,135,true)}${limb(137,128,128,111,true)}${limb(173,133,187,111,true)}${limb(184,135,205,154)}${limb(184,135,205,184)}`);

  add("chest-press-machine",
    () => `${platform(82,160,130,10)}<g ${eq}><path d="M100 58v105M205 58v105M100 67h105M118 106h70"/></g>${head(148,86)}${torso(148,100,148,143,true)}${limb(148,112,122,110,true)}${limb(148,112,184,110,true)}${limb(148,143,130,182)}${limb(148,143,171,182)}`,
    () => `${platform(82,160,130,10)}<g ${eq}><path d="M100 58v105M205 58v105M100 67h105M118 106h95"/></g>${head(148,86)}${torso(148,100,148,143,true)}${limb(148,112,102,110,true)}${limb(148,112,205,110,true)}${limb(148,143,130,182)}${limb(148,143,171,182)}`);

  add("lat-pulldown",
    () => `${cable(45,28,155)}<g ${eq}><path d="M64 42h152M216 42v35M180 77h72"/></g>${head(160,95)}${torso(160,108,160,157,true)}${limb(160,118,125,78,true)}${limb(160,118,195,78,true)}${limb(160,157,137,192)}${limb(160,157,183,192)}`,
    () => `${cable(45,28,155)}<g ${eq}><path d="M64 42h152M216 42v55M180 97h72"/></g>${head(160,95)}${torso(160,108,160,157,true)}${limb(160,118,125,104,true)}${limb(160,118,195,104,true)}${limb(160,157,137,192)}${limb(160,157,183,192)}`);

  add("seated-row-cable",
    () => `${cable(35,40,140)}<g ${eq}><path d="M54 54h165M219 54v72M105 168h110"/></g>${head(150,94)}${torso(150,108,150,152,true)}${limb(150,120,192,126,true)}${limb(150,152,124,184)}${limb(150,152,184,184)}`,
    () => `${cable(35,40,140)}<g ${eq}><path d="M54 54h165M219 54v72M105 168h110"/></g>${head(150,94)}${torso(150,108,150,152,true)}${limb(150,120,165,126,true)}${limb(150,152,124,184)}${limb(150,152,184,184)}`);

  add("barbell-row",
    () => `${barbell(85,150,215)}${head(124,55)}${torso(128,70,160,108,true)}${limb(160,90,112,146,true)}${limb(160,90,190,146,true)}${limb(160,108,132,191)}${limb(160,108,196,186)}`,
    () => `${barbell(92,120,208)}${head(124,55)}${torso(128,70,160,108,true)}${limb(160,90,125,120,true)}${limb(160,90,185,120,true)}${limb(160,108,132,191)}${limb(160,108,196,186)}`);

  add("dumbbell-row",
    () => `${bench(58,156,130)}${dumbbell(205,156)}${head(155,62)}${torso(158,76,140,120,true)}${limb(145,90,100,154)}${limb(150,100,205,150,true)}${limb(140,120,105,190)}${limb(140,120,186,184)}`,
    () => `${bench(58,156,130)}${dumbbell(187,118)}${head(155,62)}${torso(158,76,140,120,true)}${limb(145,90,100,154)}${limb(150,100,187,120,true)}${limb(140,120,105,190)}${limb(140,120,186,184)}`);

  add("leg-press",
    () => `${platform(198,54,78,14,-58)}${bench(70,160,95)}${head(112,128)}${torso(123,130,158,145,true)}${limb(158,145,190,125,true)}${limb(190,125,212,85,true)}${limb(158,145,182,154,true)}${limb(182,154,206,116,true)}`,
    () => `${platform(198,54,78,14,-58)}${bench(70,160,95)}${head(112,128)}${torso(123,130,158,145,true)}${limb(158,145,205,105,true)}${limb(205,105,225,72,true)}${limb(158,145,200,127,true)}${limb(200,127,226,92,true)}`);

  add("leg-extension",
    () => `<g ${eq}><path d="M90 105v65M90 112h82M172 112v48M172 160h45"/></g>${head(130,78)}${torso(130,92,130,138)}${limb(130,138,165,156,true)}${limb(165,156,205,178,true)}${limb(130,138,105,180)}`,
    () => `<g ${eq}><path d="M90 105v65M90 112h82M172 112v48M172 160h45"/></g>${head(130,78)}${torso(130,92,130,138)}${limb(130,138,165,156,true)}${limb(165,156,220,157,true)}${limb(130,138,105,180)}`);

  add("leg-curl",
    () => `${bench(62,138,170)}<g ${eq}><path d="M208 138v48M208 178h35"/></g>${head(96,112)}${torso(110,116,175,127)}${limb(175,127,205,142,true)}${limb(205,142,230,168,true)}`,
    () => `${bench(62,138,170)}<g ${eq}><path d="M208 138v48M208 178h35"/></g>${head(96,112)}${torso(110,116,175,127)}${limb(175,127,205,142,true)}${limb(205,142,223,120,true)}`);

  add("shoulder-press-dumbbell",
    () => `${dumbbell(118,94)}${dumbbell(182,94)}${standingPerson({leftHand:[118,98],rightHand:[182,98],armsActive:true,torsoActive:true})}`,
    () => `${dumbbell(120,45)}${dumbbell(180,45)}${standingPerson({leftHand:[120,50],rightHand:[180,50],armsActive:true,torsoActive:true})}`);

  add("shoulder-press-barbell",
    () => `${barbell(105,98,195)}${standingPerson({leftHand:[120,98],rightHand:[180,98],armsActive:true,torsoActive:true})}`,
    () => `${barbell(105,48,195)}${standingPerson({leftHand:[120,50],rightHand:[180,50],armsActive:true,torsoActive:true})}`);

  add("lateral-raise-dumbbell",
    () => `${dumbbell(112,120)}${dumbbell(188,120)}${standingPerson({leftHand:[112,116],rightHand:[188,116],armsActive:true})}`,
    () => `${dumbbell(78,82)}${dumbbell(222,82)}${standingPerson({leftHand:[82,82],rightHand:[218,82],armsActive:true})}`);

  add("triceps-pushdown",
    () => `${cable(42,32,148)}<g ${eq}><path d="M61 45h126M187 45v48M176 93h22"/></g>${standingPerson({headX:215,leftHand:[188,112],rightHand:[198,112],armsActive:true})}`,
    () => `${cable(42,32,148)}<g ${eq}><path d="M61 45h126M187 45v48M176 93h22"/></g>${standingPerson({headX:215,leftHand:[188,148],rightHand:[198,148],armsActive:true})}`);

  add("dumbbell-curl",
    () => `${dumbbell(116,120)}${dumbbell(184,120)}${standingPerson({leftHand:[116,116],rightHand:[184,116],armsActive:true})}`,
    () => `${dumbbell(128,84)}${dumbbell(172,84)}${standingPerson({leftHand:[128,84],rightHand:[172,84],armsActive:true})}`);

  add("barbell-curl",
    () => `${barbell(112,120,188)}${standingPerson({leftHand:[124,116],rightHand:[176,116],armsActive:true})}`,
    () => `${barbell(112,84,188)}${standingPerson({leftHand:[124,84],rightHand:[176,84],armsActive:true})}`);

  add("push-up",
    () => `${head(78,115)}${torso(91,117,190,143,true)}${limb(102,120,83,158,true)}${limb(190,143,229,168,true)}`,
    () => `${head(78,91)}${torso(91,96,190,126,true)}${limb(102,101,83,142,true)}${limb(190,126,229,151,true)}`);

  add("pull-up",
    () => `<g ${eq}><path d="M72 42h156"/></g>${head(150,94)}${torso(150,108,150,154,true)}${limb(150,112,115,46,true)}${limb(150,112,185,46,true)}${limb(150,154,128,190)}${limb(150,154,172,190)}`,
    () => `<g ${eq}><path d="M72 42h156"/></g>${head(150,70)}${torso(150,84,150,132,true)}${limb(150,90,115,46,true)}${limb(150,90,185,46,true)}${limb(150,132,128,176)}${limb(150,132,172,176)}`);

  add("bodyweight-squat",
    () => `${standingPerson({legsActive:true,torsoActive:true,leftHand:[125,94],rightHand:[175,94]})}`,
    () => `${head(150,72)}${torso(150,86,150,132,true)}${limb(150,100,116,110)}${limb(150,100,184,110)}${limb(150,132,118,154,true)}${limb(118,154,104,194,true)}${limb(150,132,182,154,true)}${limb(182,154,196,194,true)}`);

  add("lunge",
    () => `${standingPerson({legsActive:true,leftHand:[126,112],rightHand:[174,112]})}`,
    () => `${head(150,50)}${torso(150,64,150,122,true)}${limb(150,78,122,104)}${limb(150,78,178,104)}${limb(150,122,112,152,true)}${limb(112,152,88,188,true)}${limb(150,122,190,150,true)}${limb(190,150,226,154,true)}`);

  add("plank",
    () => `${head(80,96)}${torso(93,100,194,128,true)}${limb(105,104,84,146,true)}${limb(194,128,232,150,true)}`,
    () => `${head(80,96)}${torso(93,100,194,128,true)}${limb(105,104,84,146,true)}${limb(194,128,232,150,true)}`);

  add("dip",
    () => `<g ${eq}><path d="M82 92h58M160 92h58M92 92v95M208 92v95"/></g>${head(150,70)}${torso(150,84,150,136,true)}${limb(150,98,125,96,true)}${limb(150,98,175,96,true)}${limb(150,136,137,184)}${limb(150,136,163,184)}`,
    () => `<g ${eq}><path d="M82 92h58M160 92h58M92 92v95M208 92v95"/></g>${head(150,94)}${torso(150,108,150,154,true)}${limb(150,120,125,96,true)}${limb(150,120,175,96,true)}${limb(150,154,137,194)}${limb(150,154,163,194)}`);

  add("face-pull",
    () => `${cable(35,32,150)}<g ${eq}><path d="M54 45h120M174 45v44"/></g>${standingPerson({headX:220,leftHand:[188,105],rightHand:[195,105],armsActive:true})}`,
    () => `${cable(35,32,150)}<g ${eq}><path d="M54 45h120M174 45v44"/></g>${standingPerson({headX:220,leftHand:[210,84],rightHand:[228,84],armsActive:true})}`);

  add("hip-thrust",
    () => `${bench(55,132,90)}${head(116,104)}${torso(128,108,172,140,true)}${limb(172,140,198,164,true)}${limb(198,164,224,184,true)}${limb(172,140,146,178,true)}`,
    () => `${bench(55,132,90)}${head(116,92)}${torso(128,96,177,108,true)}${limb(177,108,204,143,true)}${limb(204,143,226,184,true)}${limb(177,108,151,150,true)}`);

  add("crunch",
    () => `${head(102,130)}${torso(114,132,178,142,true)}${limb(178,142,202,170)}${limb(202,170,225,174)}`,
    () => `${head(126,100)}${torso(138,106,180,142,true)}${limb(180,142,202,170)}${limb(202,170,225,174)}`);

  add("calf-raise",
    () => `${platform(102,186,96,8)}${standingPerson({leftFoot:[128,186],rightFoot:[172,186],legsActive:true})}`,
    () => `${platform(102,186,96,8)}${standingPerson({leftFoot:[128,174],rightFoot:[172,174],legsActive:true})}`);

  add("hip-abduction",
    () => `<g ${eq}><path d="M86 108v72M86 112h128M214 112v68"/></g>${head(150,78)}${torso(150,92,150,140)}${limb(150,140,125,180,true)}${limb(150,140,175,180,true)}`,
    () => `<g ${eq}><path d="M86 108v72M86 112h128M214 112v68"/></g>${head(150,78)}${torso(150,92,150,140)}${limb(150,140,108,174,true)}${limb(150,140,192,174,true)}`);

  add("hip-adduction",
    () => `<g ${eq}><path d="M86 108v72M86 112h128M214 112v68"/></g>${head(150,78)}${torso(150,92,150,140)}${limb(150,140,108,174,true)}${limb(150,140,192,174,true)}`,
    () => `<g ${eq}><path d="M86 108v72M86 112h128M214 112v68"/></g>${head(150,78)}${torso(150,92,150,140)}${limb(150,140,130,180,true)}${limb(150,140,170,180,true)}`);

  window.START_NOW_EXERCISE_ILLUSTRATIONS_V40 = LIB;
})();