import { useEffect, useState } from "react";
import { ArrowLeft, LogIn, ShieldCheck } from "lucide-react";
import { api } from "../services/api";

export default function Login({onSuccess,onBack}) {
  const [schools,setSchools]=useState([]);
  const [form,setForm]=useState({schoolId:"",username:"",password:""});
  const [loading,setLoading]=useState(false); const [error,setError]=useState("");
  useEffect(()=>{api.schools().then(x=>setSchools(x.schools||[])).catch(()=>{});},[]);
  const submit=async e=>{e.preventDefault();setError("");setLoading(true);try{const x=await api.login(form);localStorage.setItem("school_ai_token",x.token);onSuccess(x.user)}catch(err){setError(err.message)}finally{setLoading(false)}};
  return <div className="auth-page"><div className="auth-panel">
    <button className="back-btn" onClick={onBack}><ArrowLeft size={17}/> Bosh sahifa</button>
    <div className="auth-logo"><span className="brand-mark">S</span><div><b>School AI</b><small>Yagona ta'lim platformasi</small></div></div>
    <div className="auth-title"><h1>Platformaga kirish</h1><p>Maktab hisobingiz orqali xavfsiz kiring.</p></div>
    <form onSubmit={submit} className="form">
      <label>Maktab<select value={form.schoolId} onChange={e=>setForm({...form,schoolId:e.target.value})}><option value="">Maktabni tanlang</option>{schools.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      <label>Login<input required value={form.username} onChange={e=>setForm({...form,username:e.target.value})} placeholder="Loginni kiriting"/></label>
      <label>Parol<input required type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="••••••••"/></label>
      {error&&<div className="error-box">{error}</div>}
      <button className="primary-btn full" disabled={loading}>{loading?"Tekshirilmoqda...":<><LogIn size={18}/> Kirish</>}</button>
    </form>
    <div className="secure-note"><ShieldCheck size={17}/><span>Akkauntlar nazorat ostida. Direktor, o‘qituvchi, o‘quvchi va ota-ona akkauntlari maktab administratori tomonidan yaratiladi.</span></div>
  </div></div>
}
