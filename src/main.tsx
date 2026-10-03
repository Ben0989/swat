import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ShieldCheck,LockKeyhole} from 'lucide-react';
import App from './App';
import {unlock,storedCode,logout} from './database';
import './styles.css';
function Access(){
 const [ready,setReady]=useState(false),[code,setCode]=useState(''),[busy,setBusy]=useState(true),[error,setError]=useState('');
 useEffect(()=>{const c=storedCode();if(!c){setBusy(false);return}unlock(c).then(()=>setReady(true)).catch(e=>setError(e.message)).finally(()=>setBusy(false))},[]);
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');try{await unlock(code);setReady(true);setCode('')}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 if(ready)return <><App/><div className="sessionbar no-print"><button className="secondary" onClick={()=>{if(!window.confirm('Prüfungsänderungen vorher speichern. Zugang jetzt schließen?'))return;logout();setReady(false)}}>Prüfer-Zugang schließen</button></div></>;
 return <><header><div className="top"><div className="brand"><ShieldCheck size={38}/><div><strong>S.W.A.T.</strong><small>AUSBILDUNG & PRÜFUNG</small></div></div></div></header><main className="access-main"><section className="panel"><div className="eyebrow">Prüferportal · Glendale</div><h1>Prüfer-Zugang</h1><p className="subtle">Gib den gemeinsamen Zugangscode ein, um Prüfungen durchzuführen und gespeicherte Ergebnisse aufzurufen.</p>{error&&<div className="error" role="alert">{error}</div>}<form onSubmit={submit}><label htmlFor="access">Zugangscode<input id="access" type="password" autoComplete="current-password" required value={code} onChange={e=>setCode(e.target.value)} disabled={busy}/></label><div className="actions"><button className="primary" disabled={busy}><LockKeyhole size={18}/>{busy?'Zugang wird geprüft …':'Prüfungsportal öffnen'}</button></div></form><p className="subtle tiny" style={{marginTop:20}}>55 Originalfragen · 0–3 Punkte · Bestanden ab 80 %</p></section></main></>;
}
createRoot(document.getElementById('root')!).render(<Access/>);
