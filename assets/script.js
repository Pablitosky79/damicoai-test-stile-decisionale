// ---------- Config ----------
const GPT_LINKS = {
  Impulso: "https://chatgpt.com/g/g-685a78c5bf3081919226bf1c4800bb78-impulso-gpt-autenticato-orma",
  Scintilla: "https://chatgpt.com/g/g-685a687789348191b696dcaf184fab65-scintilla-gpt-autenticato-orma",
  Voce: "https://chatgpt.com/g/g-685ab949b5f481919c1323349c941947-voce-gpt-autenticato-orma",
  Focus: "https://chatgpt.com/g/g-685a8edd3d788191bc4b414845dc8a7a-focus-gpt-autenticato-orma",
};
const STYLES = ["Impulso","Scintilla","Voce","Focus"];
const SERVER_ENDPOINT = "/api/saveResults"; // serverless function on Vercel

// ---------- Domande ----------
const QUESTIONS = [
  { q:"Quando hai un’idea che ti entusiasma, cosa fai?", a:[
    "Parto subito senza pensarci troppo.", "Ne parlo con qualcuno…", "Ci rifletto bene…", "La segno per metterla in ordine."
  ]},
  { q:"Se devi scegliere in fretta…", a:[
    "Seguo l’istinto.", "Chiedo un parere veloce…", "Valuto pro e contro al volo.", "Faccio mente locale su cosa è più sensato."
  ]},
  { q:"In una giornata libera, cosa ti piace fare di più?", a:[
    "Provare qualcosa di nuovo e diverso.", "Stare in compagnia.", "Organizzare le cose in sospeso.", "Dedicarmi a un hobby creativo."
  ]},
  { q:"Quando qualcosa va storto…", a:[
    "Cambio subito strada e vado avanti.", "Cerco sostegno e consigli.", "Capisco dove ho sbagliato.", "Metto ordine per ripartire meglio."
  ]},
  { q:"In un gruppo di amici, sei quello che…", a:[
    "Propone attività spontanee.", "Tiene tutti uniti e coinvolti.", "Pensa ai dettagli.", "Trova il modo di rendere tutto speciale."
  ]},
  { q:"Se arriva un’occasione all’improvviso…", a:[
    "La prendo al volo.", "Ne parlo con qualcuno prima.", "Controllo bene se conviene.", "Vedo come incastrarla con i miei piani."
  ]},
  { q:"Quando organizzi un viaggio…", a:[
    "Prenoto e poi vedo il resto.", "Coinvolgo amici o famiglia.", "Faccio lista di tappe e orari.", "Lascio spazio per scoperte sul momento."
  ]},
  { q:"Se devi comprare qualcosa di importante…", a:[
    "Decido subito se mi convince.", "Chiedo consigli a chi l’ha già provato.", "Leggo tutte le recensioni.", "Valuto come si inserisce nelle mie abitudini."
  ]},
  { q:"Per imparare qualcosa di nuovo…", a:[
    "Mi butto e provo.", "Chiedo a qualcuno di spiegarmelo.", "Studio per conto mio.", "Seguo un metodo passo passo."
  ]},
  { q:"Alla fine della giornata ti senti soddisfatto se…", a:[
    "Ho vissuto momenti intensi.", "Ho passato tempo con persone care.", "Ho risolto problemi o imparato.", "Ho mantenuto ordine e serenità."
  ]},
];

// ---------- Mini-profili ----------
const PROFILES = {
  Impulso: "“Quando ti viene un’idea, il mondo deve stare al passo con te.” Sei rapido, diretto e pieno di energia. Le sfide ti accendono e preferisci agire piuttosto che aspettare.",
  Scintilla: "“Per te, ogni scelta è più bella se condivisa.” La tua forza è nelle relazioni e nel calore umano. Ami ascoltare, coinvolgere e ispirare.",
  Voce: "“Ogni decisione ha bisogno di un buon perché.” Ti piace capire a fondo prima di agire. Con i dati chiari ti muovi sicuro.",
  Focus: "“La calma è la tua superpotenza.” Sai mettere ordine anche nel caos. Cerchi stabilità e chiarezza, non ti fai trascinare dalla fretta."
};

// ---------- Elementi DOM ----------
const form = document.getElementById("user-form");
const startBtn = document.getElementById("startBtn");
const screenWelcome = document.getElementById("screen-welcome");
const screenQuiz = document.getElementById("screen-quiz");
const screenWait = document.getElementById("screen-wait");
const screenResult = document.getElementById("screen-result");
const qText = document.getElementById("questionText");
const options = document.getElementById("options");
const nextBtn = document.getElementById("nextBtn");
const progressText = document.getElementById("progressText");
const barFill = document.getElementById("barFill");
const resultTitle = document.getElementById("resultTitle");
const miniProfile = document.getElementById("miniProfile");
const ctaLink = document.getElementById("ctaLink");

let idx = 0;
let answers = []; // store index 0..3 for each question

// ---- Validazione form ----
function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
form.addEventListener("input", () => {
  const nome = document.getElementById("nome").value.trim();
  const cognome = document.getElementById("cognome").value.trim();
  const email = document.getElementById("email").value.trim();
  const consenso = document.getElementById("consenso").checked;
  const privacy = document.getElementById("privacy").checked;
  startBtn.disabled = !(nome && cognome && validEmail(email) && consenso && privacy);
});

form.addEventListener("submit", e=>{
  e.preventDefault();
  screenWelcome.classList.add("hidden");
  screenQuiz.classList.remove("hidden");
  idx = 0; answers = [];
  renderQuestion();
});

function renderQuestion(){
  const q = QUESTIONS[idx];
  qText.textContent = q.q;
  progressText.textContent = `${idx+1}/10`;
  barFill.style.width = `${((idx)/10)*100}%`;
  options.innerHTML = "";
  nextBtn.disabled = true;

  q.a.forEach((text, i)=>{
    const b = document.createElement("button");
    b.className = "option";
    b.textContent = text;
    b.onclick = ()=>{
      answers[idx] = i;
      [...options.children].forEach(el=>el.classList.remove("selected"));
      b.classList.add("selected");
      nextBtn.disabled = false;
    };
    options.appendChild(b);
  });
}

nextBtn.addEventListener("click", ()=>{
  if(idx < QUESTIONS.length - 1){
    idx++; renderQuestion();
  } else {
    // complete
    barFill.style.width = "100%";
    screenQuiz.classList.add("hidden");
    screenWait.classList.remove("hidden");
    setTimeout(showResult, 2000);
  }
});

// ---- Calcolo risultato + tie-break ----
function computeResult(){
  const scores = [0,0,0,0];
  answers.forEach(a => scores[a]++);
  const max = Math.max(...scores);
  let tied = [];
  scores.forEach((s,i)=>{ if(s===max) tied.push(i); });

  let winnerIdx = tied[0];
  if(tied.length>1){
    // tie-break: vince lo stile che compare per primo nell’ordine delle risposte che hanno generato il pareggio
    for(const a of answers){
      if(tied.includes(a)){ winnerIdx = a; break; }
    }
  }
  return { style: STYLES[winnerIdx], scores };
}

function showResult(){
  const nome = document.getElementById("nome").value.trim();
  const cognome = document.getElementById("cognome").value.trim();
  const email = document.getElementById("email").value.trim();
  const consenso = document.getElementById("consenso").checked;
  const privacy = document.getElementById("privacy").checked;

  const {style, scores} = computeResult();
  resultTitle.textContent = `✨ Il tuo stile decisionale è… ${style}`;
  miniProfile.textContent = PROFILES[style];
  ctaLink.href = GPT_LINKS[style];

  // invio best-effort (non blocca UX)
  fetch(SERVER_ENDPOINT, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      nome, cognome, email, consenso_informato: consenso, privacy,
      scores:{ impulso:scores[0], scintilla:scores[1], voce:scores[2], focus:scores[3] },
      result: style, gpt_link: GPT_LINKS[style], ua: navigator.userAgent
    })
  }).catch(()=>{ /* ignora errori */ });

  screenWait.classList.add("hidden");
  screenResult.classList.remove("hidden");
}
