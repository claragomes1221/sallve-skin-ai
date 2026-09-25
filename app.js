const CATALOG={
 cleanser:{name:"Gel de Limpeza Suave",cat:"Limpeza",emoji:"◯",bg:"var(--purple-pale)",daily:1.6},
 toner:{name:"Tônico Calmante",cat:"Preparação",emoji:"⌁",bg:"var(--rose)",daily:1.9},
 vitc:{name:"Sérum Vitamina C Antioxidante",cat:"Tratamento",emoji:"✦",bg:"var(--amber)",daily:2.6},
 ha:{name:"Sérum Ácido Hialurônico",cat:"Hidratação",emoji:"💧",bg:"var(--purple-pale)",daily:2.4},
 moisturizer:{name:"Hidratante Facial Diário",cat:"Hidratação",emoji:"○",bg:"var(--sage)",daily:1.3},
 spf:{name:"Protetor Solar FPS 60",cat:"Proteção",emoji:"☀",bg:"var(--amber)",daily:2.2},
 retinol:{name:"Sérum Noturno Retinol",cat:"Tratamento",emoji:"✧",bg:"var(--purple-pale)",daily:2.1},
 micellar:{name:"Água Micelar",cat:"Limpeza",emoji:"◌",bg:"var(--rose)",daily:1.7}
};
const ENV={
"Ciudad poluída, quente e úmida":{title:"Poluição e calor",body:"Priorizamos antioxidantes e uma limpeza mais completa à noite."},
"Clima seco e frio":{title:"Clima seco",body:"Ar seco pode reduzir a hidratação; a rotina reforça a camada hidratante."},
"Ar-condicionado o dia todo":{title:"Ambiente climatizado",body:"O ar-condicionado pode ressecar a pele; o hidratante ganha atenção ao longo do dia."},
"Rotina corrida, pouco tempo":{title:"Rotina enxuta",body:"A rotina foi simplificada para os passos essenciais."}
};
const state={phase:"onboarding",step:0,answers:{skinType:null,sensitivity:null,concerns:[],owned:[],environment:null},tab:"rotina",period:"AM",day:1,inventory:{},diagnosis:null};
const steps=["hero","skinType","sensitivity","concerns","owned","environment","loading","diagnosis"];
const $=s=>document.querySelector(s);
const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(t.h);t.h=setTimeout(()=>t.classList.remove("show"),2600)};
function progress(){const n=steps.indexOf(steps[state.step]);return `<div class="progress"><i style="width:${n/(steps.length-3)*100}%"></i></div>`}
function option(label,selected){return `<button class="option ${selected?"selected":""}" data-val="${label}"><span>${label}</span><span class="tick"></span></button>`}
function scores(a){
 const base={Oleosa:[78,58],Mista:[55,55],Normal:[35,70],Seca:[15,28]}[a.skinType];
 const clamp=x=>Math.max(6,Math.min(96,Math.round(x)));
 return {ole:clamp(base[0]+(a.concerns.includes("Oleosidade e poros")?14:0)-(a.environment==="Clima seco e frio"?10:0)),
 hid:clamp(base[1]-(a.concerns.includes("Ressecamento")?16:0)-(a.environment==="Ar-condicionado o dia todo"?10:0)-(a.environment==="Clima seco e frio"?14:0)),
 sens:clamp({Baixa:18,Média:50,Alta:82}[a.sensitivity]+(a.concerns.includes("Vermelhidão e sensibilidade")?10:0)),
 tex:clamp(88-a.concerns.length*6-(a.concerns.includes("Linhas finas e firmeza")?6:0)-(a.concerns.includes("Manchas e melanose")?6:0)-(a.concerns.includes("Acne e cravos")?8:0))};
}
function diagnosis(a,s){let x=`Pele ${a.skinType.toLowerCase()}`;if(a.concerns.length)x+=` com foco em ${a.concerns[0].toLowerCase()}`;if(s.sens>65)x+=", sensibilidade elevada";return x+"."}
function routine(a,inv){
 const has=id=>!!inv[id], am=[{id:"cleanser",label:"Limpeza suave"}];
 if(has("vitc"))am.push({id:"vitc",label:"Sérum de vitamina C",note:"Antioxidante para a rotina diurna."});
 am.push({id:"moisturizer",label:"Hidratante leve"},{id:"spf",label:"Protetor solar FPS 60",note:"Proteção diária."});
 const pm=[{id:has("micellar")?"micellar":"cleanser",label:has("micellar")?"Água micelar + limpeza":"Limpeza"}];
 if(a.sensitivity!=="Baixa"&&has("toner"))pm.push({id:"toner",label:"Tônico calmante",note:"Incluído por causa da sensibilidade."});
 if(a.concerns.some(x=>["Linhas finas e firmeza","Manchas e melanose","Acne e cravos"].includes(x)))pm.push({id:"retinol",label:"Sérum noturno de retinol",note:a.sensitivity==="Alta"?"Frequência reduzida para 2x/semana.":"Uso recomendado à noite."});
 if(has("ha"))pm.push({id:"ha",label:"Sérum de ácido hialurônico",note:"Reforço de hidratação."});
 pm.push({id:"moisturizer",label:"Hidratante noturno"});return{am,pm};
}
function initInventory(){state.answers.owned.forEach(id=>state.inventory[id]={level:65+Math.round(Math.random()*20),auto:true,arrival:null})}
function status(v){return v<=0?"out":v<=18?"low":"ok"}
function advance(n){for(let i=0;i<n;i++){state.day++;Object.entries(state.inventory).forEach(([id,x])=>{x.level=Math.max(0,+(x.level-CATALOG[id].daily).toFixed(1));if(status(x.level)!=="ok"&&x.auto&&!x.arrival)x.arrival=state.day+3;if(x.arrival&&state.day>=x.arrival){x.level=100;x.arrival=null;toast(`Refil de "${CATALOG[id].name}" chegou.`)}})}render()}
function renderHero(){return `<section class="hero"><h1 class="hero-mark">sallve skin ai</h1><p class="hero-sub">Uma rotina de skincare adaptada à sua pele, ao seu ambiente e aos produtos que você já tem.</p><div class="bullets"><div class="bullet"><i class="dot"></i>Diagnóstico guiado em poucos minutos.</div><div class="bullet"><i class="dot"></i>Rotina dinâmica usando seu estoque real.</div><div class="bullet"><i class="dot"></i>Acompanhamento de consumo e refil.</div></div><button class="primary" id="start">Começar diagnóstico</button></section>`}
function choice(title,hint,opts,key,multi=false){const sel=multi?state.answers[key]:[state.answers[key]].filter(Boolean);return `${progress()}<p class="eyebrow">Passo ${steps.indexOf(steps[state.step])} de ${steps.length-3}</p><h2 class="step-title">${title}</h2>${hint?`<p class="hint">${hint}</p>`:""}<div class="options">${opts.map(x=>option(x,sel.includes(x))).join("")}</div><div class="nav-row"><button class="back" id="back">‹</button><button class="primary" id="next" ${!sel.length?"disabled":""}>Continuar</button></div>`}
function owned(){return `${progress()}<p class="eyebrow">Passo 4 de 5</p><h2 class="step-title">O que você já tem em casa?</h2><p class="hint">A rotina vai priorizar produtos que você realmente possui.</p><div class="options">${Object.entries(CATALOG).map(([id,p])=>`<button class="option ${state.answers.owned.includes(id)?"selected":""}" data-id="${id}"><span>${p.emoji}&nbsp; ${p.name}</span><span class="tick"></span></button>`).join("")}</div><div class="nav-row"><button class="back" id="back">‹</button><button class="primary" id="next">Continuar</button></div>`}
function diagnosis(){const s=state.diagnosis,a=state.answers,rows=[["Oleosidade",s.ole],["Hidratação atual",s.hid],["Sensibilidade",s.sens],["Uniformidade da textura",s.tex]],env=ENV[a.environment];return `<span class="badge">Diagnóstico pronto</span><h2 class="diag-title">${diagnosis(a,s)}</h2><p class="diag-sub">A rotina foi combinada com o seu perfil e com os produtos que você informou.</p>${rows.map(r=>`<div class="score"><div class="score-head"><span>${r[0]}</span><span>${r[1]}/100</span></div><div class="track"><div class="fill" style="width:${r[1]}%"></div></div></div>`).join("")}${env?`<div class="env"><b>${env.title}</b>${env.body}</div>`:""}<button class="primary" id="enter">Começar minha rotina</button>`}
function loading(){setTimeout(()=>{initInventory();state.diagnosis=scores(state.answers);state.step++;render()},1600);return `<div class="loading"><div class="spinner"></div><p class="hint">Analisando suas respostas…</p></div>`}
function routineView(){const r=routine(state.answers,state.inventory),list=state.period==="AM"?r.am:r.pm,low=Object.values(state.inventory).filter(x=>status(x.level)!=="ok").length;return `<h2 class="section-title">Sua rotina de hoje</h2><p class="section-sub">Dia ${state.day} · adaptada ao seu estoque</p>${low?`<div class="alert"><div><b>${low===1?"Um produto está acabando":`${low} produtos estão acabando`}</b><p>Confira a aba Estoque para acompanhar os refis.</p></div></div>`:""}<div class="period"><button class="${state.period==="AM"?"active":""}" data-period="AM">Manhã</button><button class="${state.period==="PM"?"active":""}" data-period="PM">Noite</button></div><div class="cards">${list.map((s,i)=>{const p=CATALOG[s.id],x=state.inventory[s.id];if(!x)return `<div class="card routine-card"><div class="body"><p class="name">${i+1}. ${s.label}</p><p class="note">Você ainda não possui este produto.</p></div><button class="small-btn refill" data-add="${s.id}">Adicionar</button></div>`;return `<div class="card routine-card"><div class="icon" style="background:${p.bg}">${p.emoji}</div><div class="body"><p class="name">${i+1}. ${s.label}</p>${s.note?`<p class="note">${s.note}</p>`:""}<p class="level">${x.level.toFixed(0)}% restante${x.arrival?" · refil a caminho":""}</p></div></div>`}).join("")}</div>`}
function stock(){return `<h2 class="section-title">Estoque & refil</h2><p class="section-sub">O app acompanha o consumo e pode solicitar um novo produto automaticamente.</p><div class="cards">${Object.entries(state.inventory).map(([id,x])=>{const p=CATALOG[id],st=status(x.level);return `<div class="card stock-card"><div class="top"><div class="icon" style="background:${p.bg}">${p.emoji}</div><div><p class="name">${p.name}</p><p class="note">${p.cat}</p></div><span class="status ${st}">${st==="ok"?"Em dia":st==="low"?"Acabando":"Esgotado"}</span></div><div class="track" style="margin-top:12px"><div class="fill" style="width:${x.level}%;background:${st==="ok"?"var(--sage-ink)":st==="low"?"var(--amber-ink)":"var(--rose-ink)"}"></div></div><p class="level">${x.level.toFixed(0)}% restante${x.arrival?` · chega no dia ${x.arrival}`:""}</p><div class="actions"><button class="small-btn" data-use="${id}">Usar hoje</button>${x.arrival?`<button class="small-btn refill" disabled>Refil a caminho</button>`:st!=="ok"?`<button class="small-btn refill" data-refill="${id}">Pedir refil</button>`:""}<label class="auto">Auto-refil <button class="switch ${x.auto?"on":""}" data-auto="${id}" aria-label="Alternar auto-refil"></button></label></div></div>`}).join("")}</div>`}
function diagTab(){const a=state.answers,s=state.diagnosis;return `<h2 class="section-title">Seu diagnóstico</h2><p class="section-sub">${diagnosis(a,s)}</p>${[["Oleosidade",s.ole],["Hidratação atual",s.hid],["Sensibilidade",s.sens],["Uniformidade da textura",s.tex]].map(r=>`<div class="score"><div class="score-head"><span>${r[0]}</span><span>${r[1]}/100</span></div><div class="track"><div class="fill" style="width:${r[1]}%"></div></div></div>`).join("")}<p class="note" style="margin-top:20px">Preocupações: ${a.concerns.join(", ")||"nenhuma informada"}.</p><button class="ghost retake" id="retake">Refazer diagnóstico</button>`}
function render(){
 const main=$("#main"),tabs=$("#tabbar"),chip=$("#dayChip");
 if(state.phase==="onboarding"){tabs.classList.add("hidden");chip.classList.add("hidden");const n=steps[state.step];main.innerHTML=n==="hero"?renderHero():n==="skinType"?choice("Como você descreveria sua pele hoje?",null,["Oleosa","Seca","Mista","Normal"],"skinType"):n==="sensitivity"?choice("Sua pele costuma ser sensível?","Isso ajuda a ajustar a frequência de ativos.",["Baixa","Média","Alta"],"sensitivity"):n==="concerns"?choice("Quais são suas principais preocupações?","Pode escolher mais de uma.",["Oleosidade e poros","Acne e cravos","Manchas e melanose","Linhas finas e firmeza","Vermelhidão e sensibilidade","Ressecamento"],"concerns",true):n==="owned"?owned():n==="environment"?choice("Como é o ambiente do seu dia a dia?",null,Object.keys(ENV),"environment"):n==="loading"?loading():diagnosis();bindOnboarding()}else{tabs.classList.remove("hidden");chip.classList.remove("hidden");$("#dayPill").textContent=`dia ${state.day}`;document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.tab===state.tab));main.innerHTML=state.tab==="rotina"?routineView():state.tab==="estoque"?stock():diagTab();bindApp()}}
function bindOnboarding(){
 $("#start")?.addEventListener("click",()=>{state.step++;render()});
 $("#back")?.addEventListener("click",()=>{state.step--;render()});
 document.querySelectorAll("[data-val]").forEach(b=>b.addEventListener("click",()=>{const n=steps[state.step],v=b.dataset.val;if(n==="concerns"){const a=state.answers.concerns,i=a.indexOf(v);i>=0?a.splice(i,1):a.push(v)}else state.answers[n]=v;render()}));
 document.querySelectorAll("[data-id]").forEach(b=>b.addEventListener("click",()=>{const a=state.answers.owned,i=a.indexOf(b.dataset.id);i>=0?a.splice(i,1):a.push(b.dataset.id);render()}));
 $("#next")?.addEventListener("click",()=>{if(steps[state.step]==="concerns"&&!state.answers.concerns.length)return;if(steps[state.step]!=="owned"&&!state.answers[steps[state.step]])return;state.step++;render()});
 $("#enter")?.addEventListener("click",()=>{state.phase="app";render()})
}
function bindApp(){
 document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>{state.tab=b.dataset.tab;render()}));
 document.querySelectorAll("[data-period]").forEach(b=>b.addEventListener("click",()=>{state.period=b.dataset.period;render()}));
 document.querySelectorAll("[data-use]").forEach(b=>b.addEventListener("click",()=>{const x=state.inventory[b.dataset.use];x.level=Math.max(0,x.level-10);if(status(x.level)!=="ok"&&x.auto&&!x.arrival)x.arrival=state.day+3;render()}));
 document.querySelectorAll("[data-auto]").forEach(b=>b.addEventListener("click",()=>{const x=state.inventory[b.dataset.auto];x.auto=!x.auto;if(x.auto&&status(x.level)!=="ok"&&!x.arrival)x.arrival=state.day+3;render()}));
 document.querySelectorAll("[data-refill]").forEach(b=>b.addEventListener("click",()=>{const x=state.inventory[b.dataset.refill];x.arrival=state.day+3;toast("Refil solicitado — chega em 3 dias.");render()}));
 document.querySelectorAll("[data-add]").forEach(b=>b.addEventListener("click",()=>{const id=b.dataset.add;if(!state.answers.owned.includes(id))state.answers.owned.push(id);state.inventory[id]={level:100,auto:true,arrival:null};toast(`"${CATALOG[id].name}" adicionado.`);render()}));
 $("#retake")?.addEventListener("click",()=>{state.phase="onboarding";state.step=0;state.answers={skinType:null,sensitivity:null,concerns:[],owned:[],environment:null};state.inventory={};state.day=1;render()})
}
$("#ffBtn").addEventListener("click",()=>advance(7));
$("#brandBtn").addEventListener("click",()=>{if(state.phase==="app"){state.tab="rotina";render()}});
window.addEventListener("scroll",()=>$("#header").classList.toggle("scrolled",scrollY>5),{passive:true});
render();