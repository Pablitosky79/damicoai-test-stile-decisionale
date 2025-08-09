# damico.ai – Test Stile Decisionale (consumer)

Sito statico (HTML+CSS+JS) con funzione serverless `/api/saveResults` che salva `results.csv`.

## Deploy su Vercel
- Framework: **Other**
- Root Directory: `./`
- Build Command: *(vuoto)*
- Output Directory: *(vuoto)*
- I file principali sono `index.html`, `assets/`, `api/saveResults.js`, `vercel.json`.

## Dati inviati al CSV
`created_at,nome,cognome,email,consenso_informato,privacy,scores_impulso,scores_scintilla,scores_voce,scores_focus,result,gpt_link,ip,user_agent`

## Note
- L’UX **non** dipende dal server: se la POST fallisce, il risultato viene comunque mostrato.
- Per cambiare il logo sostituisci `assets/logo.png`.
