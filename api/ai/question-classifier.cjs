const SUBJECTS={
 matematika:['matematika','algebra','geometriya','tenglama','kasr','foiz','funksiya','ildiz','uchburchak'],
 fizika:['fizika','nyuton','tezlik','kuch','massa','tezlanish','energiya'],
 kimyo:['kimyo','atom','molekula','element','reaksiya'],
 biologiya:['biologiya','hujayra','fotosintez','organizm'],
 'ingliz tili':['ingliz','english','grammar','present simple','past simple'],
 informatika:['informatika','algoritm','javascript','python','html','css','dasturlash','kod']
};
const normalize=s=>String(s||'').toLowerCase().replace(/[ʻ’`]/g,"'").replace(/\s+/g,' ').trim();
function classify(input){const q=normalize(input);let subject=null,score=0,keywords=[];for(const [s,words] of Object.entries(SUBJECTS)){const hits=words.filter(w=>q.includes(w));if(hits.length>score){score=hits.length;subject=s;keywords=hits}}let intent='general';if(/^(salom|assalomu alaykum|hello|hi)\b/.test(q))intent='greeting';else if(/(dars rejasi|dars plan|lesson plan|reja tuz)/.test(q))intent='lesson_plan';else if(/(yangilik|e'lon|tadbir|maktabim|maktab haqida)/.test(q))intent='school_data';else if(subject==='matematika'||/[0-9]+\s*[+\-*/^=]/.test(q))intent='math';else if(subject==='informatika'&&/(kod|code|javascript|python|html|css|algoritm)/.test(q))intent='programming';return {intent,subject,keywords,confidence:Math.min(.98,.45+score*.15)}}
module.exports={classify,normalize};
