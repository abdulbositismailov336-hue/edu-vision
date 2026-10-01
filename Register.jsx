import { useEffect, useState } from "react";
import { ArrowLeft, UserPlus, ShieldCheck, CheckCircle2 } from "lucide-react";
import { api } from "../services/api";

export default function Register({onBack,onLogin,onSuccess}) {
  const [schools,setSchools]=useState([]);
  const [form,setForm]=useState({schoolId:"",firstName:"",lastName:"",username:"",password:"",confirmPassword:""});
  const [loading,setLoading]=useState(false),[error,setError]=useState(""),[done,setDone]=useState(false);
  useEffect(()=>{api.schools().then(x=>setSchools(x.schools||[])).catch(()=>{});},[]);
  const change=(key,value)=>setForm(f=>({...f,[key]:value}));
  const submit=async e=>{
    e.preventDefault();setError("");
    if(form.password.length<6)return setError("Parol kamida 6 ta belgidan iborat bo‘lsin.");
    if(form.password!==form.confirmPassword)return setError("Parollar bir xil emas.");
    if(!form.schoolId)return setError("Maktabni tanlang.");
    setLoading(true);
    try{
      const x=await api.register({schoolId:Number(form.schoolId),firstName:form.firstName,lastName:form.lastName,username:form.username,password:form.password});
      if(x.token){localStorage.setItem("school_ai_token",x.token);onSuccess(x.user);return;}
      setDone(true);
    }catch(err){setError(err.message)}finally{setLoading(false)}
  };
  return <div className="auth-page register-page">
    <div className="auth-orbit orbit-one"/><div className="auth-orbit orbit-two"/>
    <div className="auth-panel auth-animated register-panel">
      <button className="back-btn" onClick={onBack}><ArrowLeft size={17}/> Kirishga qaytish</button>
      <div className="auth-logo"><span className="brand-mark pulse-mark">S</span><div><b>School AI</b><small>Yagona ta'lim platformasi</small></div></div>
      {!done ? <>
        <div className="auth-title"><div className="register-kicker"><UserPlus size={15}/> Yangi akkaunt</div><h1>Ro‘yxatdan o‘ting</h1><p>School AI platformasiga o‘quvchi sifatida qo‘shiling.</p></div>
        <form onSubmit={submit} className="form register-form">
          <div className="form-two"><label>Ism<input required value={form.firstName} onChange={e=>change("firstName",e.target.value)} placeholder="Ismingiz"/></label><label>Familiya<input required value={form.lastName} onChange={e=>change("lastName",e.target.value)} placeholder="Familiyangiz"/></label></div>
          <label>Maktab<select required value={form.schoolId} onChange={e=>change("schoolId",e.target.value)}><option value="">Maktabni tanlang</option>{schools.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
          <label>Login<input required value={form.username} onChange={e=>change("username",e.target.value)} placeholder="Masalan: ali2026"/></label>
          <div className="form-two"><label>Parol<input required type="password" value={form.password} onChange={e=>change("password",e.target.value)} placeholder="Kamida 6 belgi"/></label><label>Parolni tasdiqlang<input required type="password" value={form.confirmPassword} onChange={e=>change("confirmPassword",e.target.value)} placeholder="Qayta kiriting"/></label></div>
          {error&&<div className="error-box shake">{error}</div>}
          <button className="primary-btn full register-submit" disabled={loading}>{loading?"Akkaunt yaratilmoqda...":<><UserPlus size={18}/> Ro‘yxatdan o‘tish</>}</button>
        </form>
        <div className="secure-note"><ShieldCheck size={17}/><span>Ro‘yxatdan o‘tgan foydalanuvchi <b>O‘quvchi</b> roli bilan yaratiladi. Direktor va o‘qituvchi akkauntlarini administrator yaratadi.</span></div>
        <button className="switch-auth" onClick={onLogin}>Akkauntingiz bormi? <b>Kirish</b></button>
      </> : <div className="register-success"><div className="success-icon"><CheckCircle2/></div><h1>Tabriklaymiz!</h1><p>Akkauntingiz muvaffaqiyatli yaratildi.</p><button className="primary-btn full" onClick={onLogin}>Kirish <ArrowLeft size={17}/></button></div>}
    </div>
  </div>
}
