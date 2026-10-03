import {validateExam,type Exam} from './exam';
const URL='https://roqvdfjbxxiymhhfwlvp.supabase.co';
const KEY='sb_publishable_v86ambzCwgK2l_fQggNHOg_JmJGJfY8';
let accessCode='';
const storageKey='swat-exam-access';
export function storedCode(){try{return sessionStorage.getItem(storageKey)||''}catch{return ''}}
export function logout(){accessCode='';try{sessionStorage.removeItem(storageKey)}catch{}}
async function request<T>(path:string,init:RequestInit={}){
 if(!accessCode)throw Error('Bitte zuerst den Prüfer-Zugangscode eingeben.');
 const response=await fetch(URL+'/rest/v1/'+path,{...init,headers:{apikey:KEY,'x-swat-access':accessCode,'Content-Type':'application/json',Prefer:'return=representation',...init.headers},signal:AbortSignal.timeout(15000)});
 const data=await response.json();
 if(!response.ok){if(response.status===401||response.status===403)throw Error('Zugriff abgelehnt. Bitte den Zugangscode prüfen.');throw Error('Speichern oder Laden fehlgeschlagen. Bitte erneut versuchen.');}
 return data as T;
}
export async function unlock(code:string){accessCode=code.trim();try{const rows=await request<{id:number}[]>('swat_questions?select=id&order=id');if(rows.length!==55)throw Error('Der Zugangscode ist ungültig oder nicht mehr aktiv.');try{sessionStorage.setItem(storageKey,accessCode)}catch{}}catch(e){logout();throw e}}
export async function api<T>(url:string,options?:RequestInit):Promise<T>{
 if(options?.method==='POST'){
  const body=JSON.parse(String(options.body));const data=validateExam(body);
  if(body.id){if(!/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(body.id)||!Number.isInteger(body.revision))throw Error('Ungültiger Speicherstand.');const rows=await request<Exam[]>(`swat_exams?id=eq.${body.id}&revision=eq.${body.revision}&status=eq.draft`,{method:'PATCH',body:JSON.stringify(data)});if(!rows.length)throw Error('Die Prüfung wurde inzwischen geändert oder abgeschlossen. Öffne sie erneut in der Übersicht.');return rows[0] as T;}
  const rows=await request<Exam[]>('swat_exams',{method:'POST',body:JSON.stringify(data)});return rows[0] as T;
 }
 const id=new globalThis.URL(url,'https://local.invalid').searchParams.get('id');
 if(id){if(!/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(id))throw Error('Ungültige Prüfung.');const rows=await request<Exam[]>(`swat_exams?id=eq.${id}&limit=1`);return (rows[0]??null) as T;}
 return request<T>('swat_exams?select=id,candidate,examiner,exam_date,status,total,passed,revision,created_at,updated_at&order=updated_at.desc&limit=500');
}
