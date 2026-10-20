const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const palette = {"Informatik":["#7cc7eb","#1d3440"],"Mathematik":["#a99aff","#292440"],"Sprache":["#edbf7a","#382d20"],"Gestaltung":["#ec9cc0","#382331"],"Produktivität":["#7ee0bc","#1c332d"],"Fächerübergreifend":["#a99aff","#292440"]};
let db={tools:[],materials:[],subjects:[]}, currentPage="home", currentSubject=null, searchTerm="", quizIndex=0, timerInterval=null, remaining=300;
const getJSON = async p => { const r=await fetch(p); if(!r.ok) throw new Error(p); return r.json(); };
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(toast.id);toast.id=setTimeout(()=>t.classList.remove("show"),2200);}
async function init(){
 try{const [t,m,s]=await Promise.all([getJSON("data/tools.json"),getJSON("data/materials.json"),getJSON("data/subjects.json")]);db={tools:t.tools||[],materials:m.materials||[],subjects:s.subjects||[]};}
 catch(e){console.error(e);$("#pageContent").innerHTML='<div class="empty"><strong>Daten konnten nicht geladen werden</strong>Bitte starte die Seite über einen Webserver und kontrolliere die JSON-Dateien.</div>';return;}
 $("#toolsNavCount").textContent=db.tools.length;
 renderSubjectNav(); renderPage();
}
function renderSubjectNav(){
 $("#subjectNav").innerHTML=db.subjects.map(s=>`<button class="nav-link" data-subject="${esc(s.id)}"><span>${esc(s.icon||"◈")}</span>${esc(s.name)}</button>`).join("");
}
const featureCards=[
 ["tools","⌘","HTML-Tools","Deine vorhandenen HTML-Helfer an einem Ort.","#b9adff","#292440"],
 ["materials","▤","Materialien & PDFs","Arbeitsblätter, Dokumente und geprüfte Links.","#7cc7eb","#1d3440"],
 ["live","◷","Live-Unterricht","Timer, Zufallsgruppen und Helfer für den Beamer.","#7ee0bc","#1c332d"],
 ["planner","☷","Unterrichtsplanung","Stundenideen und Planungsnotizen lokal verwalten.","#edbf7a","#382d20"],
 ["exercises","✎","Interaktive Übungen","Ein kleines Quiz-Beispiel und Platz für eigene Aufgaben.","#ec9cc0","#382331"],
 ["subjects","▦","Fächer & Klassen","Tools und Materialien nach Fach und Lerngruppe bündeln.","#b9adff","#292440"]
];
function cardIcon(icon,color,bg){return `<div class="card-icon" style="--tone:${color};--tint:${bg}">${esc(icon)}</div>`;}
function featureCard(f){return `<button class="feature-card" data-go="${f[0]}" style="--tone:${f[4]};--tint:${f[5]}"><span class="feature-icon" style="--tone:${f[4]};--tint:${f[5]}">${f[1]}</span><strong>${f[2]}</strong><small>${f[3]}</small></button>`;}
function toolCard(t){const [tone,bg]=palette[t.category]||palette["Fächerübergreifend"];return `<article class="tool-card">${cardIcon(t.icon||"✦",tone,bg)}<h3>${esc(t.name)}</h3><p>${esc(t.description)}</p><div class="card-foot"><span class="chip">${esc(t.category)}</span><button class="action-btn" data-tool="${esc(t.id)}">Öffnen ↗</button></div></article>`;}
function resourceCard(m){const [tone,bg]=palette["Fächerübergreifend"];const href=m.url||m.path;return `<article class="resource-card">${cardIcon(m.type==="Arbeitsblatt"?"▤":"↗",tone,bg)}<h3>${esc(m.title)}</h3><p>${esc(m.description)}</p><div class="card-foot"><span class="chip">${esc(m.type||"Material")}</span>${href?`<a class="resource-link" href="${esc(href)}" ${m.url?'target="_blank" rel="noopener noreferrer"': 'target="_blank"'}>Öffnen ↗</a>`:""}</div></article>`;}
function subjectCard(s){const [tone,bg]=palette[s.subject]||palette["Fächerübergreifend"];return `<button class="subject-card" data-subject="${esc(s.id)}">${cardIcon(s.icon||"◈",tone,bg)}<h3>${esc(s.name)}</h3><p>${esc(s.description)}</p><div class="card-foot"><span class="chip">${esc(s.class||s.subject)}</span><span class="resource-link">Bereich öffnen ↗</span></div></button>`;}
function heading(title,sub,tag){$("#pageTitle").textContent=title;$("#pageSubtitle").textContent=sub;$("#pageCount").textContent=tag.toUpperCase();$("#breadcrumb").textContent=title;}
function grid(cards){return `<div class="card-grid">${cards.join("")||'<div class="empty"><strong>Nichts gefunden</strong>Ändere den Suchbegriff oder ergänze Einträge in den JSON-Dateien.</div>'}</div>`;}
function renderPage(){
 document.querySelectorAll("[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===currentPage));
 document.querySelectorAll("#subjectNav [data-subject]").forEach(b=>b.classList.toggle("active",currentPage==="subject"&&b.dataset.subject===currentSubject));
 const q=searchTerm.trim().toLocaleLowerCase("de"); let html="";
 if(currentPage==="home"){
  heading("Dein Workspace","Wähle einen Bereich und leg los.","Startseite");
  html=`<div class="feature-grid">${featureCards.map(featureCard).join("")}</div><div style="height:27px"></div><div class="section-head"><div><h2>Zuletzt hinzugefügt</h2><p>Ein schneller Einstieg in deine Tool-Sammlung.</p></div></div>${grid(db.tools.slice(0,3).map(toolCard))}`;
 }else if(currentPage==="tools"){
  const items=db.tools.filter(t=>matches([t.name,t.description,t.category,...(t.tags||[])],q));
  heading("HTML-Tools","Deine eigenständigen Tools, zentral auffindbar.",`${items.length} Tools`);
  html=grid(items.map(toolCard));
 }else if(currentPage==="materials"){
  const items=db.materials.filter(m=>matches([m.title,m.description,m.subject,m.type],q));
  heading("Materialien & PDFs","Arbeitsblätter, Dateien und externe Lernressourcen.",`${items.length} Einträge`);
  html=`<div class="notice" style="margin-bottom:15px">Die Materialliste ist ein Beispiel. Lege öffentliche Dateien im Ordner <code>materials/</code> ab und ergänze <code>data/materials.json</code>. Veröffentliche keine vertraulichen oder personenbezogenen Schülerdaten.</div>${grid(items.map(resourceCard))}`;
 }else if(currentPage==="live"){
  heading("Live-Unterricht","Werkzeuge für Beamer, Gruppenarbeit und spontane Unterrichtsmomente.","Live-Tools");
  html=`<div class="card-grid"><section class="panel"><h3>⏱ Unterrichts-Timer</h3><p>Stelle eine Dauer ein und starte den Countdown.</p><input id="timerMinutes" class="field" type="number" min="1" max="180" value="5" aria-label="Minuten"><div id="timerDisplay" class="timer-display">05:00</div><div class="timer-controls"><button class="action-btn" id="timerStart">Start</button><button class="secondary-btn" id="timerPause">Pause</button><button class="secondary-btn" id="timerReset">Zurücksetzen</button></div></section><section class="panel"><h3>🎲 Zufallsgruppen</h3><p>Namen durch Kommas oder Zeilenumbrüche trennen. Verarbeitung erfolgt im Browser.</p><textarea class="field" id="namesInput" rows="5" placeholder="Alex, Sam, Kim, Luca"></textarea><div class="form-row"><label style="align-self:center;color:#9ba4b8;font-size:11px" for="groupCount">Anzahl Gruppen</label><select class="field" id="groupCount" style="max-width:110px"><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option></select><button class="action-btn" id="makeGroups">Gruppen mischen</button></div><div id="groupOutput" class="name-output"></div></section></div>`;
 }else if(currentPage==="planner"){
  heading("Unterrichtsplanung","Einfache Planungsnotizen – werden in diesem Browser gespeichert.","Planung");
  html=`<div class="card-grid"><section class="panel"><h3>Neue Unterrichtsidee</h3><p>Notiere Thema, Klasse und einen nächsten Schritt. Die Daten bleiben lokal auf diesem Gerät.</p><form id="plannerForm"><input id="planTitle" class="field" required maxlength="120" placeholder="Thema / Stunde"><div class="form-row"><input id="planClass" class="field" maxlength="60" placeholder="Fach / Klasse"><input id="planDate" class="field" type="date"></div><textarea id="planNotes" class="field" rows="4" maxlength="2000" placeholder="Ziel, Ablauf, Material …"></textarea><button class="action-btn" type="submit">Eintrag speichern</button></form></section><section class="panel"><h3>Deine gespeicherten Ideen</h3><p>Nur in diesem Browser sichtbar; kein Cloud-Sync.</p><div id="plannerList" class="list"></div><button class="secondary-btn" id="exportPlans" style="margin-top:12px">Planung exportieren (JSON)</button></section></div>`;
 }else if(currentPage==="exercises"){
  heading("Interaktive Übungen","Ein kleines Quiz als Muster für eigene Fachübungen.","Übungen");
  html=`<section class="panel" id="quizPanel"><div class="eyebrow">BEISPIELQUIZ</div><h3 id="quizQuestion" style="margin-top:12px">Frage wird geladen …</h3><div class="quiz-options" id="quizOptions"></div><div id="quizFeedback" class="quiz-feedback" aria-live="polite"></div><div class="timer-controls"><button class="secondary-btn" id="quizRestart">Quiz neu starten</button></div></section><p style="color:#8d96aa;font-size:11px">Das Quiz ist eine Demo. Ersetze die Fragen in <code>js/app.js</code> durch deine eigenen Inhalte.</p>`;
 }else if(currentPage==="subjects"){
  const items=db.subjects.filter(s=>matches([s.name,s.subject,s.class,s.description],q));
  heading("Fächer & Klassen","Bündle Tools und Materialien passend zu deinen Lerngruppen.",`${items.length} Bereiche`);
  html=grid(items.map(subjectCard));
 }else if(currentPage==="subject"){
  const s=db.subjects.find(x=>x.id===currentSubject);
  if(!s){currentPage="subjects";renderPage();return;}
  heading(s.name,s.description,"Fachbereich");
  const ts=db.tools.filter(t=>(s.tools||[]).includes(t.id));
  const ms=db.materials.filter(m=>(s.materials||[]).includes(m.id));
  html=`<div class="section-head"><div><h2>Passende Tools</h2><p>Verknüpfte Werkzeuge für diesen Bereich.</p></div></div>${grid(ts.map(toolCard))}<div style="height:24px"></div><div class="section-head"><div><h2>Materialien</h2><p>Verknüpfte Arbeitsblätter und Ressourcen.</p></div></div>${grid(ms.map(resourceCard))}<div class="notice" style="margin-top:16px">Dieser Fachbereich wird in <code>data/subjects.json</code> gepflegt. Du kannst dort Tool-IDs und Material-IDs zuordnen.</div>`;
 }
 if(q && currentPage==="home"){
  const results=[...db.tools.filter(t=>matches([t.name,t.description,t.category,...(t.tags||[])],q)).map(toolCard),...db.materials.filter(m=>matches([m.title,m.description,m.subject,m.type],q)).map(resourceCard),...db.subjects.filter(s=>matches([s.name,s.subject,s.class,s.description],q)).map(subjectCard)];
  heading("Suchergebnisse",`Treffer für „${searchTerm}“.`,"Suche");html=grid(results);
 }
 $("#pageContent").innerHTML=html;
 if(currentPage==="live")setupLive();
 if(currentPage==="planner")setupPlanner();
 if(currentPage==="exercises")setupQuiz();
}
function matches(values,q){return !q||values.join(" ").toLocaleLowerCase("de").includes(q);}
document.addEventListener("click",e=>{
 const page=e.target.closest("[data-page]"), go=e.target.closest("[data-go]"), tool=e.target.closest("[data-tool]"), subject=e.target.closest("[data-subject]");
 if(page){currentPage=page.dataset.page;currentSubject=null;searchTerm="";$("#globalSearch").value="";renderPage();closeNav();}
 if(go){currentPage=go.dataset.go;currentSubject=null;searchTerm="";$("#globalSearch").value="";renderPage();window.scrollTo(0,0);}
 if(tool){const t=db.tools.find(x=>x.id===tool.dataset.tool);if(t){window.open(new URL(t.path,location.href).href,"_blank","noopener,noreferrer");toast(`${t.name} wird geöffnet`);}}
 if(subject){currentPage="subject";currentSubject=subject.dataset.subject;renderPage();closeNav();}
});
$("#globalSearch").addEventListener("input",e=>{searchTerm=e.target.value;if(searchTerm)currentPage="home";renderPage();});
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();$("#globalSearch").focus();}});
$("#aboutBtn").addEventListener("click",()=>$("#aboutDialog").showModal());
$("#openNav").addEventListener("click",()=>{$("#sidebar").classList.add("open");$("#scrim").classList.remove("hidden");});
$("#closeNav").addEventListener("click",closeNav);$("#scrim").addEventListener("click",closeNav);
function closeNav(){$("#sidebar").classList.remove("open");$("#scrim").classList.add("hidden");}

function setupLive(){
 clearInterval(timerInterval);timerInterval=null;remaining=Math.max(1,Number($("#timerMinutes").value)||5)*60;updateTimer();
 $("#timerMinutes").addEventListener("change",()=>{remaining=Math.max(1,Math.min(180,Number($("#timerMinutes").value)||5))*60;updateTimer();});
 $("#timerStart").addEventListener("click",()=>{if(timerInterval)return;timerInterval=setInterval(()=>{remaining--;updateTimer();if(remaining<=0){clearInterval(timerInterval);timerInterval=null;toast("Zeit ist um!");}},1000);});
 $("#timerPause").addEventListener("click",()=>{clearInterval(timerInterval);timerInterval=null;});
 $("#timerReset").addEventListener("click",()=>{clearInterval(timerInterval);timerInterval=null;remaining=Math.max(1,Math.min(180,Number($("#timerMinutes").value)||5))*60;updateTimer();});
 $("#makeGroups").addEventListener("click",()=>{
  const names=$("#namesInput").value.split(/[,\n;]/).map(n=>n.trim()).filter(Boolean);
  if(names.length<2){toast("Bitte mindestens zwei Namen eingeben.");return;}
  const count=Math.min(Number($("#groupCount").value),names.length);
  for(let i=names.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[names[i],names[j]]=[names[j],names[i]];}
  const groups=Array.from({length:count},()=>[]);names.forEach((n,i)=>groups[i%count].push(n));
  $("#groupOutput").innerHTML=groups.map((g,i)=>`<div class="panel" style="flex:1;min-width:125px"><strong>Gruppe ${i+1}</strong><div style="margin-top:9px;color:#c8cde0;font-size:11px;line-height:1.9">${g.map(esc).join("<br>")}</div></div>`).join("");
 });
}
function updateTimer(){const m=Math.floor(Math.max(0,remaining)/60),s=Math.max(0,remaining)%60;const el=$("#timerDisplay");if(el)el.textContent=String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");}

function readPlans(){try{return JSON.parse(localStorage.getItem("classroomhub:plans")||"[]")}catch{return[]}}
function setupPlanner(){
 const form=$("#plannerForm"),list=$("#plannerList");
 const paint=()=>{const plans=readPlans();list.innerHTML=plans.length?plans.map((p,i)=>`<div class="planner-item"><strong>${esc(p.title)}</strong><small>${esc([p.subject,p.date].filter(Boolean).join(" · "))}</small><p style="white-space:pre-wrap">${esc(p.notes||"")}</p><button class="danger-btn" data-delete-plan="${i}">Löschen</button></div>`).join(""):'<div class="empty">Noch keine Einträge gespeichert.</div>';};
 form.addEventListener("submit",e=>{e.preventDefault();const plans=readPlans();plans.unshift({title:$("#planTitle").value.trim(),subject:$("#planClass").value.trim(),date:$("#planDate").value,notes:$("#planNotes").value.trim(),created:new Date().toISOString()});localStorage.setItem("classroomhub:plans",JSON.stringify(plans));form.reset();paint();toast("Idee lokal gespeichert.");});
 list.addEventListener("click",e=>{const b=e.target.closest("[data-delete-plan]");if(!b)return;const plans=readPlans();plans.splice(Number(b.dataset.deletePlan),1);localStorage.setItem("classroomhub:plans",JSON.stringify(plans));paint();});
 $("#exportPlans").addEventListener("click",()=>{const blob=new Blob([JSON.stringify(readPlans(),null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="unterrichtsplanung.json";a.click();URL.revokeObjectURL(a.href);});
 paint();
}
const quiz=[
 {q:"Welche Datei legt die zentralen Tools dieser Vorlage fest?",opts:["index.html","data/tools.json","styles.css"],correct:1,why:"Richtig: data/tools.json enthält Namen, Kategorien und Pfade der Tools."},
 {q:"Welche Aussage zu GitHub Pages stimmt?",opts:["Es ist ein statischer Website-Host.","Es bietet automatisch eine sichere Schülerdatenbank.","Es schützt beliebige PDFs automatisch mit Login."],correct:0,why:"GitHub Pages hostet statische Dateien. Authentifizierung und private Daten benötigen eine separate Lösung."},
 {q:"Was sollte nicht öffentlich hochgeladen werden?",opts:["Öffentliche Links","Allgemeine Unterrichtsvorlagen","Personenbezogene Schülerdaten"],correct:2,why:"Richtig: Schülerdaten und vertrauliche Informationen dürfen nicht ungeschützt veröffentlicht werden."}
];
function setupQuiz(){
 quizIndex=0;paintQuiz();
 $("#quizOptions").addEventListener("click",e=>{const b=e.target.closest("[data-answer]");if(!b)return;const item=quiz[quizIndex];$("#quizOptions").querySelectorAll("button").forEach(x=>x.disabled=true);if(Number(b.dataset.answer)===item.correct){b.classList.add("selected");$("#quizFeedback").textContent=item.why;}else{$("#quizFeedback").textContent="Noch nicht ganz. "+item.why;$("#quizOptions").querySelectorAll("button")[item.correct].classList.add("selected");}const next=document.createElement("button");next.className="action-btn";next.textContent=quizIndex===quiz.length-1?"Nochmal starten":"Nächste Frage";next.addEventListener("click",()=>{quizIndex=(quizIndex+1)%quiz.length;paintQuiz();});$("#quizFeedback").appendChild(document.createElement("br"));$("#quizFeedback").appendChild(next);});
 $("#quizRestart").addEventListener("click",()=>{quizIndex=0;paintQuiz();});
}
function paintQuiz(){const item=quiz[quizIndex];$("#quizQuestion").textContent=`Frage ${quizIndex+1} von ${quiz.length}: ${item.q}`;$("#quizOptions").innerHTML=item.opts.map((o,i)=>`<button class="quiz-option" data-answer="${i}">${esc(o)}</button>`).join("");$("#quizFeedback").textContent="Wähle eine Antwort."; }
init();
