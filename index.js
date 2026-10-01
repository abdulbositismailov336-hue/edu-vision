
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { askSchoolAI } = require("./ai/ai-engine.cjs");

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-in-vercel";
const now = () => new Date().toISOString();
const id = (arr) => arr.length ? Math.max(...arr.map(x => Number(x.id))) + 1 : 1;

// Vercel functions are stateless. This store survives warm invocations only.
// For permanent production data, connect a hosted DB (Neon/Supabase/etc.).
if (!globalThis.__schoolAIStore) {
  const school = { id: 1, name: "School AI Demo Maktabi", region: "Toshkent shahri", district: "Yunusobod", address: "Demo manzil", phone: "+998 71 000 00 00", logo: "", createdAt: now() };
  const users = [
    { id:1, username:"admin", password:bcrypt.hashSync("admin123",10), firstName:"Admin", lastName:"School", role:"SUPERADMIN", schoolId:null, createdAt:now() },
    { id:2, username:"director12", password:bcrypt.hashSync("123456",10), firstName:"Aziz", lastName:"Karimov", role:"DIRECTOR", schoolId:1, createdAt:now() },
    { id:3, username:"teacher12", password:bcrypt.hashSync("123456",10), firstName:"Madina", lastName:"Aliyeva", role:"TEACHER", schoolId:1, createdAt:now() },
    { id:4, username:"student12", password:bcrypt.hashSync("123456",10), firstName:"Muhammad", lastName:"Ali", role:"STUDENT", schoolId:1, createdAt:now() },
    { id:5, username:"parent12", password:bcrypt.hashSync("123456",10), firstName:"Dilshod", lastName:"Aliyev", role:"PARENT", schoolId:1, createdAt:now() }
  ];
  globalThis.__schoolAIStore = {
    schools:[school], users,
    news:[
      {id:1,schoolId:1,authorId:3,title:"School AI platformasi ishga tushdi",description:"Maktab jamoasi uchun yagona raqamli ta’lim platformasi ishga tushirildi.",image:"",createdAt:now()},
      {id:2,schoolId:1,authorId:3,title:"Yangi o‘quv mavsumi",description:"O‘quvchilar va o‘qituvchilar uchun yangi imkoniyatlar bir joyga jamlandi.",image:"",createdAt:now()}
    ],
    events:[], announcements:[], achievements:[]
  };
}
const db = globalThis.__schoolAIStore;

const publicUser = u => {
  if (!u) return null;
  const school = db.schools.find(s => s.id === u.schoolId);
  return {id:u.id,username:u.username,firstName:u.firstName,lastName:u.lastName,role:u.role,schoolId:u.schoolId,schoolName:school?.name || null};
};
const tokenFor = u => jwt.sign({id:u.id,role:u.role,schoolId:u.schoolId},JWT_SECRET,{expiresIn:"7d"});
function auth(req,res,next){
  try {
    const h=req.headers.authorization||"";
    if(!h.startsWith("Bearer ")) return res.status(401).json({error:"Avtorizatsiya talab qilinadi"});
    req.auth=jwt.verify(h.slice(7),JWT_SECRET); next();
  } catch { return res.status(401).json({error:"Token yaroqsiz yoki muddati tugagan"}); }
}
const roles=(...allowed)=>(req,res,next)=>allowed.includes(req.auth.role)?next():res.status(403).json({error:"Bu amal uchun ruxsat yo‘q"});
const schoolFor = id => db.schools.find(s=>Number(s.id)===Number(id));

app.get("/api/health",(req,res)=>res.json({ok:true,service:"School AI API",time:now(),vercel:true}));

app.post("/api/auth/login",(req,res)=>{
  const {username,password,schoolId}=req.body||{};
  const u=db.users.find(x=>x.username===String(username||""));
  if(!u || !bcrypt.compareSync(String(password||""),u.password)) return res.status(401).json({error:"Login yoki parol noto‘g‘ri"});
  if(u.role!=="SUPERADMIN"&&schoolId&&Number(u.schoolId)!==Number(schoolId)) return res.status(401).json({error:"Tanlangan maktab mos kelmaydi"});
  res.json({token:tokenFor(u),user:publicUser(u)});
});
app.get("/api/auth/me",auth,(req,res)=>{
  const u=db.users.find(x=>x.id===req.auth.id);
  if(!u) return res.status(401).json({error:"Foydalanuvchi topilmadi"});
  res.json({user:publicUser(u)});
});

app.get("/api/schools",(req,res)=>res.json({schools:[...db.schools].sort((a,b)=>b.id-a.id)}));
app.post("/api/schools",auth,roles("SUPERADMIN"),(req,res)=>{
  const {name,region,district,address,phone,logo}=req.body||{};
  if(!name)return res.status(400).json({error:"Maktab nomi kerak"});
  const school={id:id(db.schools),name,region:region||"",district:district||"",address:address||"",phone:phone||"",logo:logo||"",createdAt:now()};
  db.schools.push(school); res.status(201).json({school});
});
app.patch("/api/schools/:id",auth,roles("SUPERADMIN"),(req,res)=>{
  const s=schoolFor(req.params.id); if(!s)return res.status(404).json({error:"Maktab topilmadi"});
  for(const k of ["name","region","district","address","phone","logo"]) if(req.body?.[k]!==undefined)s[k]=req.body[k];
  res.json({ok:true,school:s});
});
app.delete("/api/schools/:id",auth,roles("SUPERADMIN"),(req,res)=>{
  const i=db.schools.findIndex(s=>s.id===Number(req.params.id)); if(i<0)return res.status(404).json({error:"Maktab topilmadi"});
  db.schools.splice(i,1); res.json({ok:true});
});

app.get("/api/users",auth,(req,res)=>{
  const rows=db.users.filter(u=>req.auth.role==="SUPERADMIN"||u.schoolId===req.auth.schoolId)
    .sort((a,b)=>b.id-a.id).map(u=>({...publicUser(u),createdAt:u.createdAt}));
  res.json({users:rows});
});
app.post("/api/users",auth,roles("SUPERADMIN","DIRECTOR"),(req,res)=>{
  const {username,password,firstName,lastName,role,schoolId}=req.body||{};
  if(!username||!password||!firstName||!lastName||!role)return res.status(400).json({error:"Barcha majburiy maydonlarni to‘ldiring"});
  if(db.users.some(u=>u.username===username))return res.status(409).json({error:"Bu login allaqachon mavjud"});
  if(req.auth.role==="DIRECTOR"&&!["TEACHER","STUDENT","PARENT"].includes(role))return res.status(403).json({error:"Direktor faqat maktab jamoasi akkauntlarini yaratadi"});
  const sid=req.auth.role==="DIRECTOR"?req.auth.schoolId:(schoolId?Number(schoolId):null);
  const u={id:id(db.users),username,password:bcrypt.hashSync(password,10),firstName,lastName,role,schoolId:sid,createdAt:now()};
  db.users.push(u); res.status(201).json({user:publicUser(u)});
});
app.patch("/api/users/:id",auth,roles("SUPERADMIN","DIRECTOR"),(req,res)=>{
  const u=db.users.find(x=>x.id===Number(req.params.id)); if(!u)return res.status(404).json({error:"Foydalanuvchi topilmadi"});
  if(req.auth.role==="DIRECTOR"&&u.schoolId!==req.auth.schoolId)return res.status(403).json({error:"Ruxsat yo‘q"});
  for(const k of ["firstName","lastName","role"]) if(req.body?.[k]!==undefined)u[k]=req.body[k];
  res.json({ok:true});
});
app.delete("/api/users/:id",auth,roles("SUPERADMIN"),(req,res)=>{
  const i=db.users.findIndex(u=>u.id===Number(req.params.id)); if(i<0)return res.status(404).json({error:"Foydalanuvchi topilmadi"});
  db.users.splice(i,1); res.json({ok:true});
});

app.get("/api/news",auth,(req,res)=>{
  const rows=db.news.filter(n=>req.auth.role==="SUPERADMIN"||n.schoolId===req.auth.schoolId).map(n=>({
    ...n,authorName:db.users.find(u=>u.id===n.authorId)?.firstName+" "+(db.users.find(u=>u.id===n.authorId)?.lastName||"")
  })).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
  res.json({news:rows});
});
app.post("/api/news",auth,roles("SUPERADMIN","DIRECTOR","TEACHER"),(req,res)=>{
  const {title,description,image}=req.body||{};
  if(!title||!description)return res.status(400).json({error:"Sarlavha va tavsif kerak"});
  const n={id:id(db.news),schoolId:req.auth.schoolId,authorId:req.auth.id,title,description,image:image||"",createdAt:now()};
  db.news.push(n); res.status(201).json({news:n});
});
app.patch("/api/news/:id",auth,roles("SUPERADMIN","DIRECTOR","TEACHER"),(req,res)=>{
  const n=db.news.find(x=>x.id===Number(req.params.id)); if(!n)return res.status(404).json({error:"Yangilik topilmadi"});
  if(req.auth.role!=="SUPERADMIN"&&n.schoolId!==req.auth.schoolId)return res.status(403).json({error:"Ruxsat yo‘q"});
  if(req.auth.role==="TEACHER"&&n.authorId!==req.auth.id)return res.status(403).json({error:"Faqat o‘zingizning yangiligingizni tahrirlashingiz mumkin"});
  for(const k of ["title","description","image"]) if(req.body?.[k]!==undefined)n[k]=req.body[k];
  res.json({ok:true});
});
app.delete("/api/news/:id",auth,roles("SUPERADMIN","DIRECTOR","TEACHER"),(req,res)=>{
  const i=db.news.findIndex(x=>x.id===Number(req.params.id)); if(i<0)return res.status(404).json({error:"Yangilik topilmadi"});
  const n=db.news[i]; if(req.auth.role!=="SUPERADMIN"&&n.schoolId!==req.auth.schoolId)return res.status(403).json({error:"Ruxsat yo‘q"});
  if(req.auth.role==="TEACHER"&&n.authorId!==req.auth.id)return res.status(403).json({error:"Faqat o‘zingizning yangiligingizni o‘chirishingiz mumkin"});
  db.news.splice(i,1); res.json({ok:true});
});

for(const [name,path] of [["events","/api/events"],["announcements","/api/announcements"],["achievements","/api/achievements"]]){
  app.get(path,auth,(req,res)=>{
    const rows=db[name].filter(x=>req.auth.role==="SUPERADMIN"||x.schoolId===req.auth.schoolId).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
    res.json({[name]:rows});
  });
  app.post(path,auth,roles("SUPERADMIN","DIRECTOR","TEACHER"),(req,res)=>{
    const {title,description}=req.body||{}; if(!title)return res.status(400).json({error:"Sarlavha kerak"});
    const item={id:id(db[name]),schoolId:req.auth.schoolId,title,description:description||"",createdAt:now()}; db[name].push(item);
    const singular=name==="announcements"?"announcement":name==="achievements"?"achievement":"event";
    res.status(201).json({[singular]:item});
  });
}

app.post("/api/ai",auth,async(req,res)=>{
  try{
    const message=String(req.body?.message||req.body?.question||"").trim();
    const schoolId=req.auth.schoolId;
    const schoolContext={
      school:schoolFor(schoolId),
      news:db.news.filter(x=>x.schoolId===schoolId).slice(-5).map(x=>({title:x.title})),
      events:db.events.filter(x=>x.schoolId===schoolId).slice(-5).map(x=>({title:x.title,createdAt:x.createdAt}))
    };
    const openAI=async(q)=>{
      const key=process.env.OPENAI_API_KEY;if(!key)return null;
      const model=process.env.OPENAI_MODEL||"gpt-5.6-luna";
      const r=await fetch("https://api.openai.com/v1/chat/completions",{
        method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${key}`},
        body:JSON.stringify({model,messages:[
          {role:"system",content:"Sen School AI ta’lim yordamchisisan. O‘zbek tilida aniq, tushunarli va xavfsiz javob ber."},
          {role:"user",content:q}
        ]})
      });
      if(!r.ok)throw Error("OpenAI xatosi");
      const j=await r.json(); return j.choices?.[0]?.message?.content||null;
    };
    const result=await askSchoolAI(message,{schoolContext,openAI});
    res.status(result.ok?200:400).json(result);
  }catch(e){console.error(e);res.status(500).json({error:"AI server xatosi"});}
});

app.use((err,req,res,next)=>{console.error(err);res.status(500).json({error:"Server ichki xatosi"});});
export default app;
