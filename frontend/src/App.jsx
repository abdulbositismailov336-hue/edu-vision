import { useEffect, useState } from "react";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { api } from "./services/api";

export default function App(){
  const [screen,setScreen]=useState("landing"),[user,setUser]=useState(null);
  useEffect(()=>{if(localStorage.getItem("school_ai_token"))api.me().then(x=>{setUser(x.user);setScreen("dashboard")}).catch(()=>localStorage.removeItem("school_ai_token"))},[]);
  if(screen==="landing")return <Landing onLogin={()=>setScreen("login")}/>;
  if(screen==="login")return <Login onBack={()=>setScreen("landing")} onSuccess={u=>{setUser(u);setScreen("dashboard")}}/>;
  return <Dashboard user={user} onLogout={()=>{localStorage.removeItem("school_ai_token");setUser(null);setScreen("landing")}}/>;
}
