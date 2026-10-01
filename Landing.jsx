import { BrainCircuit, BookOpen, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";

export default function Landing({onLogin}) {
  return <div className="landing">
    <nav className="landing-nav"><div className="brand"><span className="brand-mark">S</span><span>School <b>AI</b></span></div><button className="ghost-btn" onClick={onLogin}>Kirish <ArrowRight size={17}/></button></nav>
    <main className="hero">
      <div className="hero-glow"/>
      <div className="eyebrow"><Sparkles size={15}/> YAGONA TA'LIM PLATFORMASI</div>
      <h1>Ta'limning yangi <span>raqamli davri</span> shu yerdan boshlanadi.</h1>
      <p>Maktab, o‘qituvchi, o‘quvchi va ota-onalarni yagona xavfsiz platformada birlashtiradigan zamonaviy School AI tizimi.</p>
      <div className="hero-actions"><button className="primary-btn" onClick={onLogin}>Platformaga kirish <ArrowRight size={18}/></button><button className="secondary-btn" onClick={onLogin}>Maktabimni tanlash</button></div>
      <div className="feature-grid">
        <div className="glass-card"><BrainCircuit/><div><b>AI yordamchi</b><span>Ta'lim uchun aqlli yordam</span></div></div>
        <div className="glass-card"><BookOpen/><div><b>Elektron ta'lim</b><span>Material va yangiliklar</span></div></div>
        <div className="glass-card"><ShieldCheck/><div><b>Xavfsiz tizim</b><span>Rollar va himoyalangan API</span></div></div>
      </div>
    </main>
  </div>
}
