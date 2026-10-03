export type Exam = {id:string;candidate:string;examiner:string;exam_date:string;scores:Record<string,number>;notes:Record<string,string>;general_note:string;status:'draft'|'completed';total:number;passed:boolean|null;revision:number;created_at:string;updated_at:string};
export const totalScore=(scores:Record<string,number>)=>Object.values(scores).reduce((a,b)=>a+b,0);
export function validateExam(body:unknown) {
 if(!body||typeof body!=='object') throw Error('Ungültige Prüfungsdaten.');
 const b=body as Record<string,unknown>;
 const text=(key:string,max:number)=>{const v=b[key];if(typeof v!=='string'||v.length>max)throw Error('Ungültiges Feld: '+key);return v.trim()};
 const candidate=text('candidate',160),examiner=text('examiner',160),exam_date=text('exam_date',10),general_note=text('general_note',10000);
 if(!candidate||!examiner)throw Error('Bitte Prüfling und Prüfer eintragen.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(exam_date)||!Number.isFinite(Date.parse(exam_date))||new Date(exam_date).toISOString().slice(0,10)!==exam_date)throw Error('Ungültiges Prüfungsdatum.');
 if(!b.scores||typeof b.scores!=='object'||Array.isArray(b.scores)||!b.notes||typeof b.notes!=='object'||Array.isArray(b.notes))throw Error('Ungültige Bewertungen.');
 const scores:Record<string,number>={},notes:Record<string,string>={};
 for(const [id,value] of Object.entries(b.scores)){if(!/^[1-9]\d?$/.test(id)||Number(id)>55||!Number.isInteger(value)||Number(value)<0||Number(value)>3)throw Error('Punkte müssen zwischen 0 und 3 liegen.');scores[id]=Number(value)}
 for(const [id,value] of Object.entries(b.notes)){if(!/^[1-9]\d?$/.test(id)||Number(id)>55||typeof value!=='string'||value.length>4000)throw Error('Ungültige Notiz.');notes[id]=value}
 if(b.status!=='draft'&&b.status!=='completed')throw Error('Ungültiger Prüfungsstatus.');
 if(b.status==='completed'&&Object.keys(scores).length!==55)throw Error('Bitte zuerst alle 55 Fragen bewerten.');
 const total=totalScore(scores);return {candidate,examiner,exam_date,scores,notes,general_note,status:b.status,total,passed:b.status==='completed'?total>=132:null};
}
