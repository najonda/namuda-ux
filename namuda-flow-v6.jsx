import { useState, useEffect, useRef, useCallback } from "react";

/* ═══ BLOB ═══ */
function Blob({ state, size = 420 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);
  const sRef = useRef(state);
  sRef.current = state;
  const noise = useCallback((x,y,z) => { const p = Math.sin(x*12.9898+y*78.233+z*37.719)*43758.5453; return p-Math.floor(p); }, []);
  const sn = useCallback((x,y,z) => {
    const ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z),fx=x-ix,fy=y-iy,fz=z-iz;
    const sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy),sz=fz*fz*(3-2*fz),l=(a,b,t)=>a+t*(b-a);
    return l(l(l(noise(ix,iy,iz),noise(ix+1,iy,iz),sx),l(noise(ix,iy+1,iz),noise(ix+1,iy+1,iz),sx),sy),
             l(l(noise(ix,iy,iz+1),noise(ix+1,iy,iz+1),sx),l(noise(ix,iy+1,iz+1),noise(ix+1,iy+1,iz+1),sx),sy),sz);
  }, [noise]);
  useEffect(() => {
    const c=canvasRef.current; if(!c) return;
    const ctx=c.getContext("2d"), dpr=window.devicePixelRatio||1;
    c.width=size*dpr; c.height=size*dpr; ctx.scale(dpr,dpr);
    const cx=size/2,cy=size/2,br=size*0.27;
    const draw=()=>{
      const s=sRef.current; tRef.current+=s==="thinking"?0.022:0.004;
      const t=tRef.current, def=s==="thinking"?0.22:0.11;
      ctx.clearRect(0,0,size,size);
      const fy=Math.sin(t*0.55)*(s==="thinking"?2:6), fx=Math.cos(t*0.4)*(s==="thinking"?1:4);
      if(s==="thinking"){for(let r=0;r<5;r++){const rt=(t*1.2+r*1.3)%5.5,rr=br*0.7+rt*size*0.06,ra=Math.max(0,1-rt/5.5)*0.08;ctx.beginPath();ctx.arc(cx+fx,cy+fy,rr,0,Math.PI*2);ctx.strokeStyle=`rgba(160,170,190,${ra})`;ctx.lineWidth=0.7;ctx.stroke();}}
      const pts=120; ctx.beginPath();
      for(let i=0;i<=pts;i++){const a=(i/pts)*Math.PI*2,nx=Math.cos(a)*1.5,ny=Math.sin(a)*1.5;
        const n1=sn(nx+t,ny+t,t*0.2)-0.5,n2=sn(nx*2.5+t*0.5,ny*2.5,t*0.35)-0.5,n3=sn(nx*0.6-t*0.25,ny*0.6+t*0.15,t*0.5)-0.5;
        const d=1+n1*def+n2*def*0.4+n3*def*0.2,x=cx+fx+Math.cos(a)*br*d,y=cy+fy+Math.sin(a)*br*d;
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
      ctx.closePath();
      const g=ctx.createRadialGradient(cx+fx-br*0.3,cy+fy-br*0.3,0,cx+fx,cy+fy,br*1.4);
      g.addColorStop(0,"rgba(245,246,250,0.95)");g.addColorStop(0.35,"rgba(235,238,244,0.92)");g.addColorStop(0.7,"rgba(222,226,236,0.88)");g.addColorStop(1,"rgba(210,215,228,0.85)");
      ctx.fillStyle=g;ctx.fill();ctx.strokeStyle="rgba(185,192,210,0.2)";ctx.lineWidth=0.5;ctx.stroke();
      animRef.current=requestAnimationFrame(draw);};
    draw(); return ()=>cancelAnimationFrame(animRef.current);
  },[size,sn]);
  return <canvas ref={canvasRef} style={{width:size,height:size,display:"block"}} />;
}

/* ═══ DOT BACKGROUND ═══ */
function DotBackground({ isDark }) {
  const canvasRef = useRef(null);
  const darkRef = useRef(isDark);
  darkRef.current = isDark;
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const gap = 28, r = 0.8;
    const draw = () => {
      const w = window.innerWidth, h = window.innerHeight;
      c.width = w * dpr; c.height = h * dpr;
      c.style.width = w + "px"; c.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const dark = darkRef.current;
      ctx.fillStyle = dark ? "rgba(255,255,255,0.18)" : "rgba(160,168,184,0.3)";
      for (let x = gap / 2; x < w; x += gap) {
        for (let y = gap / 2; y < h; y += gap) {
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [isDark]);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />;
}

/* ═══ HELPERS ═══ */
function TW({text,onDone,speed=30}){const[s,setS]=useState("");const i=useRef(0);
  useEffect(()=>{i.current=0;setS("");const t=setInterval(()=>{i.current++;setS(text.slice(0,i.current));if(i.current>=text.length){clearInterval(t);onDone?.();}},speed);return()=>clearInterval(t);},[text]);
  return <>{s}{s.length<text.length&&<span style={{opacity:0.3}}>|</span>}</>;}

function Thoughts({items}){const[idx,setIdx]=useState(0);const[fade,setFade]=useState(true);
  useEffect(()=>{setIdx(0);setFade(true);},[items]);
  useEffect(()=>{if(items.length<=1)return;const t=setInterval(()=>{setFade(false);setTimeout(()=>{setIdx(p=>(p+1)%items.length);setFade(true);},250);},2000);return()=>clearInterval(t);},[items]);
  return <div style={{textAlign:"center",fontSize:14,color:"#8a8f9e",fontStyle:"italic",minHeight:22,transition:"opacity 0.25s",opacity:fade?1:0}}>{items[idx]||""}</div>;}

function Dots(){return<span style={{display:"inline-flex",gap:5,alignItems:"center",height:20}}>{[0,1,2].map(i=><span key={i} style={{width:5,height:5,borderRadius:"50%",background:"#b4bcc8",animation:`dp 1.2s ease infinite ${i*0.2}s`}}/>)}</span>;}

/* ═══ BLOB SPEECH — replaces on each new message ═══ */
function BlobSpeech({ text }) {
  const [fade, setFade] = useState(false);
  const [display, setDisplay] = useState(text);
  const prevRef = useRef(text);
  useEffect(() => {
    if (text !== prevRef.current) {
      setFade(true);
      const t = setTimeout(() => { setDisplay(text); setFade(false); prevRef.current = text; }, 200);
      return () => clearTimeout(t);
    }
  }, [text]);
  if (!display) return null;
  return (
    <div style={{ maxWidth: 460, textAlign: "center", padding: "0 24px", transition: "opacity 0.2s", opacity: fade ? 0 : 1 }}>
      <div style={{ fontSize: 15, lineHeight: 1.7, color: "#4a5060", fontWeight: 400 }}>
        {display.split("\n").map((line, i) => <span key={i}>{i > 0 && <br />}{line}</span>)}
      </div>
    </div>
  );
}

/* ═══ EDITABLE FIELD ═══ */
function EditableField({ value, onChange, style: s }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);
  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);
  if (editing) {
    return <input ref={inputRef} value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={() => { setEditing(false); onChange(draft); }}
      onKeyDown={e => { if (e.key === "Enter") { setEditing(false); onChange(draft); } }}
      style={{ ...s, border: "1px solid #d0d5e0", borderRadius: 6, padding: "2px 6px", outline: "none", background: "#fff", width: "100%", fontFamily: "'DM Sans',sans-serif" }}
    />;
  }
  return <div onClick={() => setEditing(true)} style={{ ...s, cursor: "pointer", borderRadius: 4, padding: "1px 4px", margin: "-1px -4px", transition: "background 0.15s" }}
    onMouseEnter={e => e.currentTarget.style.background = "#f0f1f5"}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
  >{value}<span style={{ fontSize: 10, color: "#b0b5c0", marginLeft: 6, opacity: 0.6 }}>edit</span></div>;
}

/* ═══ STYLES ═══ */
const ps={background:"#fff",borderRadius:14,boxShadow:"0 4px 28px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.03)",overflow:"hidden",animation:"panelIn 0.45s cubic-bezier(0.16,1,0.3,1)"};
const btnD={padding:"7px 18px",fontSize:12,fontWeight:600,background:"#1a1d23",color:"#fff",border:"none",borderRadius:8,cursor:"pointer"};
const btnG={padding:"7px 18px",fontSize:12,fontWeight:600,background:"transparent",color:"#7a8194",border:"1px solid #e2e5ea",borderRadius:8,cursor:"pointer"};

/* ═══ PANELS ═══ */
const demos=[
  {id:"glamox",name:"Glamox",desc:"Purchase-to-receive",cases:"91K",period:"12 months"},
  {id:"acme",name:"Acme Corp",desc:"Order-to-cash",cases:"24K",period:"6 months"},
  {id:"techflow",name:"TechFlow",desc:"Incident management",cases:"15K",period:"9 months"},
  {id:"medicare",name:"MediCare",desc:"Patient intake",cases:"8K",period:"12 months"},
];

function DataPanel({onSelect}){
  const[tab,setTab]=useState("demo");const[sel,setSel]=useState(null);const[hov,setHov]=useState(null);
  return<div style={{...ps,width:300}}>
    <div style={{padding:"18px 20px 0"}}><div style={{fontSize:14,fontWeight:700,color:"#1a1d23",marginBottom:2}}>Connect your data</div><div style={{fontSize:11.5,color:"#8a8f9e",marginBottom:14}}>Pick a demo or upload your own.</div>
    <div style={{display:"flex",borderBottom:"1px solid #eceef2",marginBottom:12}}>{[["demo","Demo Data"],["connect","Upload"]].map(([k,l])=><button key={k} onClick={()=>setTab(k)} style={{padding:"6px 14px",fontSize:11.5,fontWeight:600,color:tab===k?"#1a1d23":"#a0a8b8",background:"none",border:"none",borderBottom:tab===k?"2px solid #1a1d23":"2px solid transparent",cursor:"pointer",marginBottom:-1}}>{l}</button>)}</div></div>
    <div style={{padding:"0 20px 20px",maxHeight:300,overflowY:"auto"}}>{tab==="demo"?<div style={{display:"flex",flexDirection:"column",gap:5}}>{demos.map(d=><div key={d.id} onClick={()=>setSel(d.id)} onMouseEnter={()=>setHov(d.id)} onMouseLeave={()=>setHov(null)} style={{padding:"11px 13px",borderRadius:9,border:sel===d.id?"1.5px solid #1a1d23":"1.5px solid #eceef2",background:sel===d.id?"#f7f8fa":hov===d.id?"#fcfcfd":"#fff",cursor:"pointer",transition:"all 0.1s"}}><div style={{display:"flex",justifyContent:"space-between"}}><div><div style={{fontSize:13,fontWeight:600,color:"#1a1d23"}}>{d.name}</div><div style={{fontSize:11,color:"#8a8f9e"}}>{d.desc}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:11,fontWeight:600,color:"#5a5f6e"}}>{d.cases}</div><div style={{fontSize:10,color:"#a0a8b8"}}>{d.period}</div></div></div>{sel===d.id&&<div style={{marginTop:8,display:"flex",justifyContent:"flex-end"}}><button onClick={e=>{e.stopPropagation();onSelect(d);}} style={btnD}>Load →</button></div>}</div>)}</div>:<div style={{padding:"24px 0",textAlign:"center"}}><div style={{width:44,height:44,borderRadius:11,background:"#f7f8fa",border:"1.5px dashed #d4d8e0",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",fontSize:18,color:"#a0a8b8"}}>↑</div><div style={{fontSize:12,fontWeight:600,color:"#1a1d23",marginBottom:2}}>Upload event log</div><div style={{fontSize:11,color:"#8a8f9e"}}>CSV or Parquet</div></div>}</div></div>;}

const dimFields = [
  { n: "receiving_site", v: "17", guess: "Goods receipt location — the physical site where orders are delivered", sample: "PM1, PN1, PK3, PL2...", samples: ["PM1", "PN1", "PK3", "PL2", "PM2", "PK1", "PN2", "PL1", "PM3", "PK2"] },
  { n: "purchase_office", v: "28", guess: "The purchasing office that originates the order", sample: "DE01, DE02, NO01, SE01...", samples: ["DE01", "DE02", "NO01", "SE01", "DE03", "FI01", "DK01", "NO02", "SE02", "DE04"] },
  { n: "item_group", v: "427", guess: "Product category or material group for the ordered items", sample: "MECH, ELEC, RAW, PACK...", samples: ["MECH", "ELEC", "RAW", "PACK", "CHEM", "TOOL", "SAFE", "PIPE", "VALV", "INSTR"] },
  { n: "selection_code", v: "7", guess: "Order routing code — determines which approval workflow to use. 42% null may indicate manual orders.", sample: "A1, B2, C1, null...", samples: ["A1", "B2", "C1", "A2", "B1", "C2", "null", "null", "null", "A1"] },
  { n: "item_signal", v: "8", guess: "Procurement automation signal — 95% null suggests this field is rarely used or deprecated", sample: "AUTO, MANUAL, null...", samples: ["null", "null", "null", "AUTO", "null", "null", "null", "MANUAL", "null", "null"] },
];

function FieldPanel({ currentIdx, fields, onAccept, onAcceptField }) {
  const current = fields[currentIdx];
  const done = fields.filter(f => f.confirmed);
  const remaining = fields.length - done.length;
  return (
    <div style={{ ...ps, width: 640 }}>
      <div style={{ display: "flex" }}>
        {/* Left — all fields overview */}
        <div style={{ width: 220, borderRight: "1px solid #eceef2", padding: "18px 16px" }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>Core Fields</div>
          {[
            { n: "case_id", d: "91,179 unique orders" },
            { n: "activity_name", d: "9 activities" },
            { n: "timestamp", d: "Timestamps" },
          ].map(f => (
            <div key={f.n} style={{ padding: "5px 8px", borderRadius: 4, marginBottom: 2, background: "#f8f9fb", borderLeft: "3px solid #4f6df5" }}>
              <div style={{ fontFamily: "monospace", fontSize: 10.5, color: "#4f6df5", fontWeight: 600 }}>{f.n}</div>
              <div style={{ fontSize: 9.5, color: "#a0a8b8" }}>{f.d}</div>
            </div>
          ))}
          <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginTop: 12, marginBottom: 8 }}>Dimensions ({remaining} left)</div>
          {fields.map((f, i) => (
            <div key={f.n} style={{
              padding: "5px 8px", borderRadius: 4, marginBottom: 2,
              background: i === currentIdx ? "#f0f2ff" : f.confirmed ? "#f8f9fb" : "#fafbfc",
              borderLeft: `3px solid ${i === currentIdx ? "#4f6df5" : f.confirmed ? "#7bc67e" : "#e0e2e8"}`,
              opacity: f.confirmed && i !== currentIdx ? 0.6 : 1,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "monospace", fontSize: 10.5, color: i === currentIdx ? "#4f6df5" : "#3a3f4a", fontWeight: 600 }}>{f.n}</span>
                {f.confirmed && <span style={{ fontSize: 8, color: "#7bc67e" }}>✓</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Right — current field detail */}
        <div style={{ flex: 1, padding: "18px 22px" }}>
          {current ? (<>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 4 }}>Field {currentIdx + 1} of {fields.length}</div>
            <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700, color: "#1a1d23", marginBottom: 4 }}>{current.n}</div>
            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "#a0a8b8" }}>{current.v} unique values</div>
              <div style={{ fontSize: 11, color: "#a0a8b8" }}>Sample: {current.sample}</div>
            </div>

            <div style={{ fontSize: 9.5, fontWeight: 700, color: "#4f6df5", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 6 }}>My interpretation</div>
            <div style={{ padding: "12px 14px", background: "#f0f2ff", borderRadius: 9, border: "1px solid #d8ddf5", marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: "#2a2e60", lineHeight: 1.6 }}>{current.confirmed ? current.meaning : current.guess}</div>
            </div>

            {current.confirmed ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#7bc67e", fontWeight: 600 }}>Confirmed</span>
                <span style={{ fontSize: 11, color: "#a0a8b8" }}>{current.meaning !== current.guess ? "(corrected by you)" : ""}</span>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 11.5, color: "#7a8194", marginBottom: 10 }}>Does this look right? Accept it, or type a correction in the chat below.</div>
                <button onClick={() => onAcceptField(currentIdx)} style={btnD}>Accept interpretation →</button>
              </div>
            )}
          </>) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12 }}>
              <div style={{ fontSize: 24, color: "#7bc67e" }}>✓</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1d23" }}>All fields reviewed</div>
              <div style={{ fontSize: 12, color: "#7a8194" }}>You can go back and edit any field, or continue.</div>
              <button onClick={onAccept} style={btnD}>Continue →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══ FIELD CARD (inline chat) ═══ */
function FieldCard({ field, index, total, onAccept, onRefine }) {
  const [refining, setRefining] = useState(false);
  const [draft, setDraft] = useState("");
  return (
    <div style={{ width: "100%", maxWidth: 400, padding: "0 24px", animation: "fadeUp 0.4s ease" }}>
      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)", overflow: "hidden" }}>
        <div style={{ padding: "16px 18px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px" }}>Field {index + 1} of {total}</span>
            <span style={{ fontSize: 10, color: "#a0a8b8" }}>{field.v} values</span>
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700, color: "#1a1d23", marginBottom: 8 }}>{field.n}</div>
          {field.samples && (
            <div style={{ background: "#f8f9fb", borderRadius: 8, padding: "6px 10px", marginBottom: 12, border: "1px solid #eceef2" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Sample values</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {field.samples.map((s, i) => (
                  <div key={i} style={{ fontFamily: "monospace", fontSize: 9.5, color: "#5a5f6e", padding: "1.5px 0", borderBottom: i < field.samples.length - 1 ? "1px solid rgba(0,0,0,0.03)" : "none" }}>{s}</div>
                ))}
              </div>
            </div>
          )}
          <div style={{ padding: "10px 13px", background: "#f0f2ff", borderRadius: 9, border: "1px solid #d8ddf5", marginBottom: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#4f6df5", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>AI interpretation</div>
            <div style={{ fontSize: 13, color: "#2a2e60", lineHeight: 1.6 }}>{field.guess}</div>
          </div>
          {!refining ? (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onAccept} style={{ ...btnD, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <span style={{ fontSize: 13 }}>✓</span> Accept
              </button>
              <button onClick={() => { setRefining(true); setDraft(""); }} style={{ ...btnG, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <span style={{ fontSize: 13 }}>✎</span> Refine
              </button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 11, color: "#7a8194", marginBottom: 6 }}>What does this field actually mean?</div>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  autoFocus
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && draft.trim()) { onRefine(draft.trim()); } }}
                  placeholder="Type your interpretation..."
                  style={{ flex: 1, padding: "8px 12px", fontSize: 12.5, fontFamily: "'DM Sans',sans-serif", border: "1px solid #d8ddf5", borderRadius: 8, outline: "none", background: "#fafbff" }}
                />
                <button onClick={() => { if (draft.trim()) onRefine(draft.trim()); }} style={{ ...btnD, padding: "8px 14px" }}>Submit</button>
              </div>
              <button onClick={() => setRefining(false)} style={{ marginTop: 6, fontSize: 11, color: "#a0a8b8", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══ FIELD PROGRESS (sidebar) ═══ */
function FieldProgress({ fields, currentIdx }) {
  const coreFields = [
    { n: "case_id", d: "91,179 unique" },
    { n: "activity_name", d: "9 activities" },
    { n: "timestamp", d: "Timestamps" },
  ];
  return (
    <div style={{
      position: "absolute", top: 16, right: 16, width: 180,
      background: "#fff", borderRadius: 12, padding: "14px 14px",
      boxShadow: "0 2px 16px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.03)",
      animation: "panelIn 0.45s cubic-bezier(0.16,1,0.3,1)", zIndex: 8,
    }}>
      <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>Core Fields</div>
      {coreFields.map(f => (
        <div key={f.n} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}>
          <span style={{ fontSize: 10, color: "#7bc67e" }}>✓</span>
          <span style={{ fontFamily: "monospace", fontSize: 10, color: "#7a8194" }}>{f.n}</span>
        </div>
      ))}
      <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginTop: 10, marginBottom: 6 }}>Dimensions</div>
      {fields.map((f, i) => {
        const isCurrent = i === currentIdx;
        const isDone = f.confirmed;
        return (
          <div key={f.n} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}>
            <span style={{ fontSize: 10, color: isDone ? "#7bc67e" : isCurrent ? "#4f6df5" : "#d0d5e0" }}>
              {isDone ? "✓" : isCurrent ? "●" : "○"}
            </span>
            <span style={{ fontFamily: "monospace", fontSize: 10, color: isCurrent ? "#4f6df5" : isDone ? "#7a8194" : "#b0b5c0", fontWeight: isCurrent ? 600 : 400 }}>{f.n}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ═══ CORE FIELDS CARD (educational intro — 3 columns with sample data) ═══ */
function CoreFieldsCard({ onAccept }) {
  const fields = [
    { n: "case_id", desc: "The case — the entity that moves through the process", samples: ["PO-2024-00142", "PO-2024-00143", "PO-2024-00144", "PO-2024-00145", "PO-2024-00146", "PO-2024-00147", "PO-2024-00148", "PO-2024-00149", "PO-2024-00150", "PO-2024-00151"] },
    { n: "activity_name", desc: "The steps — what happens to the case at each point", samples: ["Created", "Free", "Approved", "Sent", "In Process", "Confirmed", "Conf.Chgd", "Received", "Closed", "Blocked"] },
    { n: "timestamp", desc: "When — how I measure time, speed, and delays", samples: ["2024-08-01 09:12", "2024-08-01 09:15", "2024-08-01 10:30", "2024-08-01 14:22", "2024-08-02 08:05", "2024-08-02 11:40", "2024-08-03 09:00", "2024-08-03 16:18", "2024-08-05 10:22", "2024-08-06 08:45"] },
  ];
  const [selected, setSelected] = useState(new Set(["case_id", "activity_name", "timestamp"]));
  const toggle = (n) => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(n)) next.delete(n); else next.add(n);
    return next;
  });
  return (
    <div style={{ width: "100%", maxWidth: 560, padding: "0 24px", animation: "fadeUp 0.4s ease" }}>
      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)", overflow: "hidden" }}>
        <div style={{ padding: "16px 18px 14px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 12 }}>Core Fields — Building Blocks</div>
          <div style={{ display: "flex", gap: 8 }}>
            {fields.map(f => {
              const active = selected.has(f.n);
              return (
                <div key={f.n} onClick={() => toggle(f.n)} style={{
                  flex: 1, padding: "10px 10px 8px", borderRadius: 10, cursor: "pointer", transition: "all 0.2s",
                  background: active ? "#f0f2ff" : "#fafbfc",
                  border: active ? "1.5px solid #4f6df5" : "1.5px solid #eceef2",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                    <div style={{ width: 14, height: 14, borderRadius: 4, border: active ? "none" : "1.5px solid #d0d5e0", background: active ? "#4f6df5" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {active && <span style={{ color: "#fff", fontSize: 9, fontWeight: 700 }}>✓</span>}
                    </div>
                    <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: active ? "#4f6df5" : "#1a1d23" }}>{f.n}</span>
                  </div>
                  <div style={{ fontSize: 10, color: "#7a8194", lineHeight: 1.4, marginBottom: 8, minHeight: 28 }}>{f.desc}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {f.samples.map((s, i) => (
                      <div key={i} style={{ fontFamily: "monospace", fontSize: 9, color: active ? "#5a5f6e" : "#b0b5c0", padding: "1.5px 0", borderBottom: i < f.samples.length - 1 ? "1px solid rgba(0,0,0,0.03)" : "none", transition: "color 0.2s" }}>{s}</div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={onAccept} disabled={selected.size < 3} style={{ ...btnD, width: "100%", marginTop: 14, padding: "9px 18px", opacity: selected.size < 3 ? 0.4 : 1 }}>
            {selected.size < 3 ? `Select all 3 core fields` : `Confirm core fields →`}
          </button>
        </div>
      </div>
    </div>
  );
}

function GoalsPanel({onAccept}){
  const gs=[{n:"Reduce throughput time",icon:"⏱"},{n:"Lower rework rate",icon:"🔄"},{n:"Improve data quality",icon:"📊"},{n:"Increase conformance",icon:"📐"}];
  return<div style={{...ps,width:340}}>
    <div style={{padding:"18px 22px 0"}}><div style={{fontSize:14,fontWeight:700,color:"#1a1d23",marginBottom:4}}>Suggested Goals</div>
    <div style={{fontSize:11.5,color:"#8a8f9e",marginBottom:14}}>Areas with the most room for improvement.</div></div>
    <div style={{padding:"0 22px",maxHeight:280,overflowY:"auto"}}>{gs.map((g,i)=><div key={i} style={{padding:"11px 14px",border:"1.5px solid #e8ebf0",borderRadius:9,marginBottom:6,display:"flex",alignItems:"center",gap:10}}>
      <span style={{fontSize:16}}>{g.icon}</span>
      <div style={{fontSize:13,fontWeight:600,color:"#1a1d23"}}>{g.n}</div>
    </div>)}</div>
    <div style={{padding:"12px 22px",borderTop:"1px solid #eceef2",display:"flex",justifyContent:"flex-end",gap:6}}><button style={btnG}>Edit</button><button onClick={onAccept} style={btnD}>Accept goals →</button></div></div>;}

/* ═══ HORIZONTAL BAR CHART (CSS-based) ═══ */
function HBar({ data }) {
  const max = Math.max(...data.map(d => d.v));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 10, color: "#7a8194", width: 70, textAlign: "right", flexShrink: 0, fontFamily: "monospace" }}>{d.l}</div>
          <div style={{ flex: 1, height: 14, background: "#eceef2", borderRadius: 3, overflow: "hidden", position: "relative" }}>
            <div style={{ height: "100%", width: `${(d.v / max) * 100}%`, background: d.hl ? "#e8b84a" : "#c0c5d0", borderRadius: 3, transition: "width 0.5s ease" }} />
          </div>
          <div style={{ fontSize: 9.5, color: "#a0a8b8", width: 42, textAlign: "right", flexShrink: 0 }}>{(d.v/1000).toFixed(1)}k</div>
        </div>
      ))}
    </div>
  );
}

/* ═══ MINI LINE CHART (canvas) ═══ */
function MiniLine({ data, width=280, height=60 }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"), dpr = window.devicePixelRatio || 1;
    c.width = width * dpr; c.height = height * dpr; ctx.scale(dpr, dpr);
    const max = Math.max(...data); const min = Math.min(...data);
    const range = max - min || 1;
    const px = width / (data.length - 1);
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = i * px, y = height - 8 - ((v - min) / range) * (height - 16);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#7a8194"; ctx.lineWidth = 1.5; ctx.lineJoin = "round"; ctx.stroke();
    ctx.lineTo(width, height); ctx.lineTo(0, height); ctx.closePath();
    ctx.fillStyle = "rgba(122,129,148,0.06)"; ctx.fill();
  }, [data, width, height]);
  return <canvas ref={ref} style={{ width, height, display: "block" }} />;
}

/* ═══ DATA PROFILE PANEL ═══ */
function DataProfilePanel({ onAccept }) {
  const activities = [
    { l: "Created", v: 91179 }, { l: "Free", v: 85200 }, { l: "Approved", v: 82100 },
    { l: "Sent", v: 78400 }, { l: "In Process", v: 74900 }, { l: "Confirmed", v: 71300 },
    { l: "Conf.Chgd", v: 47400, hl: true }, { l: "Received", v: 68800 }, { l: "Closed", v: 65200 },
  ];
  const caseVolume = [9800, 9200, 8700, 8100, 7600, 7200, 6800, 6400, 5900, 5500, 5100, 4700];

  const [omit, setOmit] = useState(new Set(["item_signal"]));
  const toggle = (f) => setOmit(prev => { const n = new Set(prev); n.has(f) ? n.delete(f) : n.add(f); return n; });

  const fields = [
    { field: "case_id", status: "ok", note: "91,179 unique — no duplicates", canOmit: false },
    { field: "activity_name", status: "ok", note: "9 distinct values, no nulls", canOmit: false },
    { field: "timestamp", status: "warn", note: "23,411 duplicate timestamps (25.7%)", canOmit: false },
    { field: "receiving_site", status: "ok", note: "17 values, no nulls", canOmit: true },
    { field: "purchase_office", status: "ok", note: "28 values, no nulls", canOmit: true },
    { field: "item_group", status: "ok", note: "427 values, no nulls", canOmit: true },
    { field: "selection_code", status: "warn", note: "42% null — may reduce analysis scope", canOmit: true },
    { field: "item_signal", status: "bad", note: "95% null — recommend omitting", canOmit: true, rec: "omit" },
  ];

  return (
    <div style={{ ...ps, width: 620, maxHeight: "85vh" }}>
      <div style={{ padding: "20px 24px 0" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1d23", marginBottom: 2 }}>Data Quality Assessment</div>
        <div style={{ fontSize: 11.5, color: "#8a8f9e", marginBottom: 12 }}>Is the data good enough to work with? Review the quality flags and decide which fields to include.</div>

        {/* Summary verdict — top */}
        <div style={{ padding: "10px 14px", background: omit.size > 0 ? "#f0faf0" : "#faf8f0", borderRadius: 8, border: `1px solid ${omit.size > 0 ? "#d0e8d0" : "#ede8d8"}`, marginBottom: 16 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: omit.size > 0 ? "#4a8a4a" : "#b8a060", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 4 }}>
            {omit.size > 0 ? "Ready to proceed" : "Review recommended"}
          </div>
          <div style={{ fontSize: 11.5, color: "#5a5040", lineHeight: 1.55 }}>
            {omit.size > 0
              ? `${fields.length - omit.size} of ${fields.length} fields included. ${omit.size} field${omit.size > 1 ? "s" : ""} omitted (${[...omit].join(", ")}). Core fields look solid.`
              : "item_signal is 95% null and will likely add noise. Consider omitting it before proceeding."
            }
          </div>
        </div>
      </div>
      <div style={{ padding: "0 24px 16px", overflowY: "auto", maxHeight: "65vh" }}>

        {/* Two-column: activities + volume */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>Activities ({activities.length})</div>
            <HBar data={activities} />
          </div>
          <div>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>Case Volume — 91,179 total</div>
            <div style={{ background: "#f7f8fa", borderRadius: 10, padding: "12px 12px 6px" }}>
              <MiniLine data={caseVolume} width={260} height={64} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#a0a8b8", marginTop: 2 }}>
                <span>Aug '24</span><span>Aug '25</span>
              </div>
            </div>
          </div>
        </div>

        {/* Field quality — main evaluation */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 6 }}>Field Quality</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {fields.map((d, i) => {
              const isOmitted = omit.has(d.field);
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "7px 10px",
                  background: isOmitted ? "#f5f5f5" : "#fafbfc", borderRadius: 6,
                  borderLeft: `3px solid ${isOmitted ? "#d0d0d0" : d.status === "ok" ? "#7bc67e" : d.status === "warn" ? "#e8b84a" : "#d4685a"}`,
                  opacity: isOmitted ? 0.5 : 1, transition: "all 0.2s",
                }}>
                  <span style={{ fontSize: 10, width: 14, textAlign: "center", flexShrink: 0 }}>{d.status === "ok" ? "✓" : d.status === "warn" ? "⚠" : "✗"}</span>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: "#3a3f4a", fontWeight: 600, minWidth: 110, flexShrink: 0 }}>{d.field}</span>
                  <span style={{ fontSize: 11, color: "#7a8194", flex: 1 }}>{d.note}</span>
                  {d.canOmit && (
                    <button onClick={() => toggle(d.field)} style={{
                      padding: "2px 8px", fontSize: 9.5, fontWeight: 600, flexShrink: 0,
                      background: isOmitted ? "#eceef2" : "transparent",
                      color: isOmitted ? "#7a8194" : "#d4685a",
                      border: `1px solid ${isOmitted ? "#d0d5e0" : "#e8c8c4"}`,
                      borderRadius: 4, cursor: "pointer",
                    }}>{isOmitted ? "Include" : "Omit"}</button>
                  )}
                  {d.rec === "omit" && !isOmitted && (
                    <span style={{ fontSize: 9, color: "#d4685a", fontWeight: 600, flexShrink: 0 }}>rec: omit</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
      <div style={{ padding: "12px 24px", borderTop: "1px solid #eceef2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 11, color: "#a0a8b8" }}>{fields.length - omit.size} fields included</div>
        <button onClick={onAccept} style={btnD}>Looks good →</button>
      </div>
    </div>
  );
}

function TargetsPanel({onAccept}){
  const ts=[
    { n: "Throughput time", b: "18.8d", t: "14d",
      why: "Your fastest site PM1 already achieves 7.7 days — proving 14 days is realistic across the board.",
      benchmark: "Industry benchmark for purchase-to-receive in manufacturing is 10–15 days (APQC median: 12.4d). Your target of 14d aligns with the 50th percentile.",
      how: "Focus on the approval bottleneck (Free → Approved) and reduce wait times between Sent and In Process." },
    { n: "Rework rate", b: "52%", t: "35%",
      why: "52% of orders loop through 'Confirmed Changed' — this is the single biggest structural issue in your process.",
      benchmark: "Best-in-class procurement processes see rework rates below 15% (Hackett Group). Even 35% keeps you above median, but represents a 30% relative improvement.",
      how: "Investigate root causes: manual re-entry errors, vendor-side changes, and specification mismatches at confirmation." },
    { n: "Data quality", b: "50/100", t: "70+",
      why: "Two fields (item_signal at 95% null, selection_code at 42% null) severely limit what we can analyze.",
      benchmark: "Data quality scores above 70 are considered 'actionable' for process mining. Below 50 means significant blind spots in variant and root-cause analysis.",
      how: "Fix selection_code population at order creation. Decide whether item_signal should be deprecated or enforced." },
    { n: "Conformance", b: "1,175 variants", t: "<400",
      why: "1,175 process variants across 17 sites indicates extreme fragmentation — most variants have fewer than 10 cases.",
      benchmark: "Well-governed procurement processes typically have 50–200 variants (Celonis benchmark). Under 400 is a pragmatic first milestone that preserves regional flexibility.",
      how: "Standardize the top 5 sites first (they represent 60% of volume). Eliminate low-frequency deviation paths." },
  ];
  return (
    <div style={{...ps, width: 520, maxHeight: "85vh"}}>
      <div style={{padding:"20px 22px 0"}}>
        <div style={{fontSize:15,fontWeight:700,color:"#1a1d23",marginBottom:4}}>Suggested Targets</div>
        <div style={{fontSize:11.5,color:"#8a8f9e",marginBottom:16}}>Each target is grounded in your data and industry benchmarks. Adjust any that don't feel right.</div>
      </div>
      <div style={{padding:"0 22px 16px", overflowY:"auto", maxHeight:"68vh"}}>
        {ts.map((t,i) => (
          <div key={i} style={{padding:"14px 16px", border:"1.5px solid #e8ebf0", borderRadius:10, marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontSize:14,fontWeight:700,color:"#1a1d23"}}>{t.n}</div>
              <div style={{padding:"3px 10px",background:"#f0f2ff",borderRadius:6,fontSize:12,fontWeight:600,color:"#4f6df5"}}>{t.b} → {t.t}</div>
            </div>
            <div style={{fontSize:12,color:"#3a3f4a",lineHeight:1.6,marginBottom:8}}>{t.why}</div>
            <div style={{padding:"8px 12px",background:"#f7f8fa",borderRadius:7,marginBottom:8,borderLeft:"3px solid #d0d5e0"}}>
              <div style={{fontSize:9.5,fontWeight:700,color:"#a0a8b8",textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:3}}>Industry benchmark</div>
              <div style={{fontSize:11.5,color:"#5a5f6e",lineHeight:1.5}}>{t.benchmark}</div>
            </div>
            <div style={{fontSize:11,color:"#7a8194",lineHeight:1.5}}>
              <span style={{fontWeight:600,color:"#5a5f6e"}}>How to get there: </span>{t.how}
            </div>
          </div>
        ))}
      </div>
      <div style={{padding:"14px 22px",borderTop:"1px solid #eceef2",display:"flex",justifyContent:"flex-end",gap:6}}>
        <button style={btnG}>Adjust</button>
        <button onClick={onAccept} style={btnD}>Confirm targets →</button>
      </div>
    </div>
  );
}

/* ═══ CONTEXT SCORE ═══ */
function ContextScore({ score, onImprove }) {
  const pct = Math.max(0, Math.min(100, score));
  const color = pct < 40 ? "#a0a8b8" : pct < 70 ? "#7a8194" : "#4f6df5";
  return (
    <div style={{ padding: "14px 22px", borderBottom: "1px solid #eceef2" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px" }}>Context Score</div>
          <div style={{ fontSize: 14, fontWeight: 700, color }}>{pct}%</div>
        </div>
        {onImprove && <button onClick={onImprove} style={{
          padding: "4px 10px", fontSize: 10.5, fontWeight: 600,
          background: "transparent", color: "#4f6df5", border: "1px solid #d8ddf5",
          borderRadius: 6, cursor: "pointer", transition: "all 0.15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "#f0f2ff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >Improve score →</button>}
      </div>
      <div style={{ width: "100%", height: 4, background: "#eceef2", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)" }} />
      </div>
    </div>
  );
}

/* ═══ DOCUMENT PANEL ═══ */
function DocPanel({ data, onUpdate, onImproveScore }) {
  if (!data) return null;
  return (
    <div style={{
      position: "absolute", top: 16, bottom: 16,
      left: 16,
      width: "min(680px, calc(100vw - 500px))", background: "#fff", borderRadius: 14,
      boxShadow: "0 4px 28px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.03)",
      display: "flex", flexDirection: "column",
      animation: "docIn 0.6s cubic-bezier(0.16,1,0.3,1)",
      overflow: "hidden", zIndex: 10,
    }}>
      <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid #eceef2" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>Process Context</div>
        <EditableField value={data.processName || "Untitled"} onChange={v => onUpdate({ ...data, processName: v })} style={{ fontSize: 17, fontWeight: 700, color: "#1a1d23", letterSpacing: "-0.3px" }} />
        <EditableField value={data.processType || "Process type"} onChange={v => onUpdate({ ...data, processType: v })} style={{ fontSize: 12, color: "#7a8194", marginTop: 4 }} />
      </div>
      {data.contextScore != null && <ContextScore score={data.contextScore} onImprove={onImproveScore} />}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 22px 32px" }}>
        {data.kpis && data.kpis.length > 0 && <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 5 }}>Key Indicators</div>
          {data.kpis.map((k, i) => (<div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < data.kpis.length - 1 ? "1px solid #f0f1f5" : "none" }}>
            <span style={{ fontSize: 12, color: "#5a5f6e" }}>{k.l}</span><span style={{ fontSize: 13, fontWeight: 600, color: "#3a3f4a" }}>{k.v}</span></div>))}</div>}
        {data.mission && <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: "#4f6df5", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 5 }}>Mission Statement</div>
          <div style={{ padding: "12px 14px", background: "#f0f2ff", borderRadius: 9, border: "1px solid #d8ddf5" }}>
            <div style={{ fontSize: 13.5, color: "#2a2e60", lineHeight: 1.6, fontWeight: 500 }}>{data.mission}</div></div></div>}
        {data.description && <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 5 }}>Process Description</div>
          <div style={{ fontSize: 12.5, color: "#3a3f4a", lineHeight: 1.6 }}>{data.description}</div></div>}
        {data.fieldAnnotations && data.fieldAnnotations.length > 0 && <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 5 }}>Field Context</div>
          {data.fieldAnnotations.map((f, i) => (<div key={i} style={{ padding: "6px 10px", borderRadius: 5, marginBottom: 3, background: "#f8f9fb", borderLeft: "3px solid #a0a8b8" }}>
            <div style={{ fontFamily: "monospace", fontSize: 11.5, color: "#5a5f6e", fontWeight: 600 }}>{f.field}</div>
            <div style={{ fontSize: 10.5, color: "#7a8194" }}>{f.meaning}</div></div>))}</div>}
        {data.hypotheses && data.hypotheses.length > 0 && <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 5 }}>Hypotheses</div>
          {data.hypotheses.map((h, i) => (<div key={i} style={{ padding: "8px 12px", background: "#faf8f0", borderRadius: 7, border: "1px solid #ede8d8", marginBottom: 4 }}>
            <div style={{ fontSize: 12, color: "#5a5040", lineHeight: 1.5 }}>{h}</div></div>))}</div>}
        {data.goals && <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 5 }}>Goals & Targets</div>
          {data.goals.map((g, j) => (<div key={j} style={{ padding: "9px 12px", border: "1px solid #e8ebf0", borderRadius: 8, marginBottom: 5 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1d23" }}>{g.n}</div>
              {g.b && <div style={{ fontSize: 11, fontWeight: 600, color: "#4f6df5" }}>{g.b} → {g.t}</div>}
            </div></div>))}</div>}
      </div>
    </div>
  );
}

/* ═══ GOALS DOCUMENT PANEL ═══ */
function GoalsDocPanel({ data }) {
  if (!data) return null;
  return (
    <div style={{
      position: "absolute", top: 16, left: 16, bottom: 16,
      width: 520, background: "#fff", borderRadius: 14,
      boxShadow: "0 4px 28px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.03)",
      display: "flex", flexDirection: "column",
      animation: "docIn 0.6s cubic-bezier(0.16,1,0.3,1)",
      overflow: "hidden", zIndex: 10,
    }}>
      <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid #eceef2" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>Goals & Targets</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 22px 32px" }}>
        {/* Mission restated */}
        {data.mission && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: "#4f6df5", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 5 }}>Mission Statement</div>
            <div style={{ padding: "12px 14px", background: "#f0f2ff", borderRadius: 9, border: "1px solid #d8ddf5" }}>
              <div style={{ fontSize: 13.5, color: "#2a2e60", lineHeight: 1.6, fontWeight: 500 }}>{data.mission}</div>
            </div>
          </div>
        )}
        {/* Goals */}
        {data.goals && data.goals.length > 0 && (
          <div>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>Goals</div>
            {data.goals.map((g, i) => (
              <div key={i} style={{ padding: "14px 16px", border: "1.5px solid #e8ebf0", borderRadius: 10, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: g.why ? 8 : 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {g.icon && <span style={{ fontSize: 16 }}>{g.icon}</span>}
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1d23" }}>{g.n}</div>
                  </div>
                  {g.b ? (
                    <div style={{ padding: "3px 10px", background: "#f0f2ff", borderRadius: 6, fontSize: 12, fontWeight: 600, color: "#4f6df5" }}>{g.b} → {g.t}</div>
                  ) : g.current ? (
                    <div style={{ fontSize: 12, color: "#7a8194", fontWeight: 500 }}>Current: {g.current}</div>
                  ) : null}
                </div>
                {g.why && (
                  <div style={{ fontSize: 12, color: "#3a3f4a", lineHeight: 1.6, marginBottom: 6 }}>{g.why}</div>
                )}
                {g.evidence && (
                  <div style={{ padding: "6px 10px", background: "#f7f8fa", borderRadius: 6, borderLeft: "3px solid #d0d5e0" }}>
                    <div style={{ fontSize: 11, color: "#5a5f6e", lineHeight: 1.5 }}>{g.evidence}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══ JUNCTION PANEL ═══ */
function JunctionPanel({ onSelect }) {
  const findings = [
    { id: "rework", rank: 1, label: "Rework loop analysis", impact: "High",
      desc: "52% of orders loop through 'Confirmed Changed'. I've found patterns in which sites and item groups trigger this most.",
      teaser: "I can show you exactly where the loop starts and which 3 changes would cut it by 30%." },
    { id: "throughput", rank: 2, label: "Throughput bottlenecks", impact: "High",
      desc: "The gap between PM1 (7.7d) and PN1 (34d) isn't just about volume — there are structural differences in how they process.",
      teaser: "I've identified 2 approval steps that account for 60% of the delay at slow sites." },
    { id: "conformance", rank: 3, label: "Variant reduction", impact: "Medium",
      desc: "1,175 variants, but the top 8 cover 70% of cases. The remaining 1,167 are noise and special cases.",
      teaser: "I can show which variants to standardize first for maximum impact." },
    { id: "quality", rank: 4, label: "Data quality fixes", impact: "Medium",
      desc: "selection_code nulls correlate with manual orders — fixing this at intake would unlock automation analysis.",
      teaser: "Quick win: a single field-validation rule could improve the quality score by 15 points." },
  ];

  return (
    <div style={{ ...ps, width: 480, maxHeight: "85vh" }}>
      <div style={{ padding: "20px 22px 0" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1d23", marginBottom: 4 }}>What's next?</div>
        <div style={{ fontSize: 12, color: "#8a8f9e", marginBottom: 16, lineHeight: 1.5 }}>
          I've ranked the most impactful areas to explore. Pick one to dive in, or take a tour of the process first.
        </div>
      </div>
      <div style={{ padding: "0 22px 12px", overflowY: "auto", maxHeight: "58vh" }}>
        {/* Process canvas teaser — featured */}
        <button onClick={() => onSelect("canvas")} style={{
          width: "100%", padding: "16px 18px", marginBottom: 14,
          background: "linear-gradient(135deg, #f0f2ff 0%, #e8eaff 100%)",
          border: "1.5px solid #d0d5f5", borderRadius: 12, cursor: "pointer",
          textAlign: "left", display: "flex", gap: 14, alignItems: "center",
          transition: "all 0.15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#4f6df5"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#d0d5f5"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <div style={{ fontSize: 28, flexShrink: 0 }}>🗺</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#2a2e60", marginBottom: 3 }}>Explore the process canvas</div>
            <div style={{ fontSize: 12, color: "#5a5f8a", lineHeight: 1.5 }}>
              I can't wait to show you how your process looks! See every path, every bottleneck, every rework loop — all visualized.
            </div>
          </div>
          <div style={{ fontSize: 18, color: "#4f6df5", flexShrink: 0 }}>→</div>
        </button>

        {/* Ranked findings */}
        <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>Ranked improvement areas</div>
        {findings.map(f => (
          <button key={f.id} onClick={() => onSelect(f.id)} style={{
            width: "100%", padding: "14px 16px", marginBottom: 8,
            background: "#fff", border: "1.5px solid #e8ebf0", borderRadius: 10,
            cursor: "pointer", textAlign: "left", transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#c0c5d0"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8ebf0"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700, color: "#fff",
                  background: f.rank <= 2 ? "#4f6df5" : "#a0a8b8",
                }}>{f.rank}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{f.label}</div>
              </div>
              <div style={{
                padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600,
                background: f.impact === "High" ? "#fef3e8" : "#f0f2f5",
                color: f.impact === "High" ? "#c47a20" : "#7a8194",
              }}>{f.impact} impact</div>
            </div>
            <div style={{ fontSize: 12, color: "#5a5f6e", lineHeight: 1.5, marginBottom: 6 }}>{f.desc}</div>
            <div style={{ fontSize: 11, color: "#4f6df5", fontWeight: 500 }}>{f.teaser}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══ PROCESS TEASER ═══ */
function ProcessTeaser({ onClose }) {
  const nodes = [
    { label: "Start", x: 120, y: 18, w: 50, type: "circle" },
    { label: "Free", x: 80, y: 70, w: 100, count: "215K", color: "#e8a0b8" },
    { label: "Approved", x: 100, y: 140, w: 110, count: "313K", color: "#b080d0" },
    { label: "Last confirmation", x: 80, y: 215, w: 130, count: "228K", color: "#e8a0b8", warn: true },
    { label: "First confirmation", x: 160, y: 290, w: 120, count: "77K", color: "#e0c8c0" },
    { label: "Blocked", x: 100, y: 355, w: 110, count: "71K", color: "#e0c8c0" },
    { label: "End", x: 50, y: 420, w: 50, type: "circle" },
  ];
  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
    [3, 2], // rework loop
    [4, 3], // rework loop
  ];

  return (
    <div style={{
      position: "absolute", top: 16, right: 16, bottom: 16, width: 320,
      background: "transparent", borderRadius: 14,
      border: "1px solid rgba(160,168,184,0.2)",
      display: "flex", flexDirection: "column",
      animation: "docIn 0.6s cubic-bezier(0.16,1,0.3,1)",
      overflow: "hidden", zIndex: 8,
    }}>
      <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid rgba(160,168,184,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: "#8a8f9e", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 2 }}>Process Preview</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#3a3f4a" }}>Purchase-to-Receive</div>
        </div>
        <button onClick={onClose} style={{
          width: 24, height: 24, borderRadius: 6, border: "1px solid rgba(160,168,184,0.25)",
          background: "transparent", cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 12, color: "#a0a8b8", transition: "all 0.15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,0.04)"; e.currentTarget.style.color = "#5a5f6e"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#a0a8b8"; }}
        >✕</button>
      </div>
      <div style={{ flex: 1, padding: "12px 16px", overflowY: "auto" }}>
        <svg width="288" height="450" viewBox="0 0 288 450" style={{ display: "block" }}>
          {/* Edges */}
          {edges.map(([from, to], i) => {
            const a = nodes[from], b = nodes[to];
            const ax = a.x + (a.w || 50) / 2, ay = a.y + (a.type === "circle" ? 14 : 18);
            const bx = b.x + (b.w || 50) / 2, by = b.y;
            const isRework = from > to;
            if (isRework) {
              const cx = Math.max(ax, bx) + 40;
              return <path key={i} d={`M${ax},${ay} C${cx},${ay} ${cx},${by} ${bx},${by}`}
                fill="none" stroke="#d0a0a0" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.6" />;
            }
            return <line key={i} x1={ax} y1={ay} x2={bx} y2={by} stroke="#c0c5d0" strokeWidth="1.2" />;
          })}
          {/* Arrow markers on straight edges */}
          {edges.filter(([f, t]) => f < t).map(([from, to], i) => {
            const a = nodes[from], b = nodes[to];
            const ax = a.x + (a.w || 50) / 2, ay = a.y + (a.type === "circle" ? 14 : 18);
            const bx = b.x + (b.w || 50) / 2, by = b.y;
            const mx = (ax + bx) / 2, my = (ay + by) / 2;
            return <polygon key={`arr${i}`} points={`${mx-3},${my-2} ${mx+3},${my-2} ${mx},${my+3}`} fill="#c0c5d0" />;
          })}
          {/* Nodes */}
          {nodes.map((n, i) => {
            if (n.type === "circle") {
              return <g key={i}>
                <circle cx={n.x + 25} cy={n.y + 10} r={14} fill="#fff" stroke="#c0c5d0" strokeWidth="1.5" />
                <text x={n.x + 25} y={n.y + 14} textAnchor="middle" fontSize="9" fontWeight="600" fill="#5a5f6e">{n.label}</text>
              </g>;
            }
            return <g key={i}>
              <rect x={n.x} y={n.y} width={n.w} height={32} rx="6" fill={n.color || "#e0e2e8"} stroke={n.warn ? "#d08080" : "rgba(160,168,184,0.3)"} strokeWidth={n.warn ? "1.5" : "1"} strokeDasharray={n.warn ? "3 2" : "none"} />
              <text x={n.x + n.w / 2} y={n.y + 14} textAnchor="middle" fontSize="9" fontWeight="600" fill="#3a3040">{n.label}</text>
              <text x={n.x + n.w / 2} y={n.y + 25} textAnchor="middle" fontSize="8" fill="#7a7080">{n.count}</text>
            </g>;
          })}
          {/* Rework annotation */}
          <text x="250" y="180" fontSize="8" fill="#d08080" fontWeight="600" fontStyle="italic">rework</text>
          <text x="250" y="190" fontSize="8" fill="#d08080" fontStyle="italic">loop</text>
        </svg>
        <div style={{ padding: "10px 0", borderTop: "1px solid rgba(160,168,184,0.15)", marginTop: 8 }}>
          <div style={{ fontSize: 11, color: "#7a8194", lineHeight: 1.5 }}>
            This is a preview of your process flow. The full interactive canvas will be available after the onboarding.
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            {[{ l: "7 activities", c: "#b080d0" }, { l: "Rework loop detected", c: "#d08080" }].map(t => (
              <div key={t.l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: t.c }} />
                <span style={{ fontSize: 10, color: "#8a8f9e" }}>{t.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ STEP MAP ═══ */
const steps = [
  { id: "data", label: "Connect data", phases: ["intro", "data"] },
  { id: "fields", label: "Field mapping", phases: ["core-fields", "fields"] },
  { id: "profile", label: "Data quality", phases: ["data-profile"] },
  { id: "context", label: "Process context", phases: ["fact-gathering", "mission-review"] },
  { id: "review", label: "Review context", phases: ["review"] },
  { id: "goals", label: "Set goals", phases: ["pre-goals", "goals"] },
  { id: "targets", label: "Set targets", phases: ["targets"] },
  { id: "junction", label: "What's next", phases: ["junction"] },
  { id: "done", label: "Explore", phases: ["done"] },
];

function StepMap({ phase, onJump, fieldProgress }) {
  const currentIdx = steps.findIndex(s => s.phases.includes(phase));
  const isFieldPhase = phase === "core-fields" || phase === "fields";
  const coreFieldsDone = phase === "fields";
  return (
    <div style={{
      position: "absolute", top: 16, right: 16, width: 175,
      background: "#fff", borderRadius: 12, padding: "16px 14px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.03)",
      zIndex: 5, animation: "fadeUp 0.4s ease",
    }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Progress</div>
      {steps.map((s, i) => {
        const isCurrent = i === currentIdx;
        const isDone = i < currentIdx;
        const showSubItems = s.id === "fields" && isCurrent && isFieldPhase && fieldProgress;
        return (
          <div key={s.id}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 16, flexShrink: 0 }}>
                <div style={{
                  width: isCurrent ? 10 : 8, height: isCurrent ? 10 : 8, borderRadius: "50%",
                  background: isDone ? "#7bc67e" : isCurrent ? "#4f6df5" : "#e0e2e8",
                  border: isCurrent ? "2px solid #d0d8ff" : "none",
                  transition: "all 0.3s",
                }} />
                {(i < steps.length - 1 && !showSubItems) && (
                  <div style={{ width: 1.5, height: 20, background: isDone ? "#7bc67e" : "#e8eaef", transition: "background 0.3s" }} />
                )}
              </div>
              <button
                onClick={() => !isCurrent && onJump(s)}
                disabled={isCurrent}
                style={{
                  background: "none", border: "none", padding: "0 0 12px 0", cursor: isCurrent ? "default" : "pointer",
                  fontSize: 11.5, fontWeight: isCurrent ? 600 : 400, textAlign: "left",
                  color: isDone ? "#4a5060" : isCurrent ? "#1a1d23" : "#b0b5c0",
                  textDecoration: "none", transition: "color 0.2s",
                }}
                onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.color = "#4f6df5"; }}
                onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.color = isDone ? "#4a5060" : "#b0b5c0"; }}
              >
                {isDone && <span style={{ marginRight: 4, fontSize: 9, color: "#7bc67e" }}>✓</span>}
                {s.label}
              </button>
            </div>
            {/* Sub-items for field mapping */}
            {showSubItems && (
              <div style={{ marginLeft: 8, paddingLeft: 8, borderLeft: "1.5px solid #e8eaef", paddingBottom: 8, marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "2px 0" }}>
                  <span style={{ fontSize: 9, color: coreFieldsDone ? "#7bc67e" : "#4f6df5" }}>{coreFieldsDone ? "✓" : "●"}</span>
                  <span style={{ fontSize: 10, color: coreFieldsDone ? "#7a8194" : "#4f6df5", fontWeight: coreFieldsDone ? 400 : 600 }}>Core fields</span>
                </div>
                {fieldProgress.fields.map((f, fi) => {
                  const isActive = coreFieldsDone && fi === fieldProgress.currentIdx;
                  const fDone = f.confirmed;
                  return (
                    <div key={f.n} style={{ display: "flex", alignItems: "center", gap: 5, padding: "2px 0" }}>
                      <span style={{ fontSize: 9, color: fDone ? "#7bc67e" : isActive ? "#4f6df5" : "#d0d5e0" }}>{fDone ? "✓" : isActive ? "●" : "○"}</span>
                      <span style={{ fontFamily: "monospace", fontSize: 9, color: isActive ? "#4f6df5" : fDone ? "#7a8194" : "#b0b5c0", fontWeight: isActive ? 600 : 400 }}>{f.n}</span>
                    </div>
                  );
                })}
                {i < steps.length - 1 && (
                  <div style={{ position: "relative", left: -9, width: 1.5, height: 8, background: "#e8eaef", marginTop: 2 }} />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══ QUIRKY THOUGHTS ═══ */
const qt = {
  loading: ["Unboxing your data...", "Counting rows enthusiastically...", "Befriending your timestamps..."],
  fields: ["Interrogating every column...", "Playing field detective...", "Sorting dimensions by vibes..."],
  drafting: ["Putting it all together...", "Drafting the document...", "Composing the narrative..."],
  goals: ["Identifying improvement areas...", "Looking for opportunities...", "Benchmarking against the best..."],
};

/* ═══ FACT-GATHERING QUESTIONS (single sequence) ═══ */
const factQs = [
  // General
  { q: "Tell me about this process — what's it for? Procurement, manufacturing, logistics?", group: "general", idx: 0 },
  { q: "Which teams or departments handle these orders?", group: "general", idx: 1 },
  { q: "Are any steps automated, or is it mostly manual?", group: "general", idx: 2 },
  { q: "Any known pain points the team already complains about?", group: "general", idx: 3 },
  // Field meanings
  { q: "`selection_code` has 42% null values and 7 unique values. What does this field represent? Why might it be null so often?", group: "field", field: "selection_code" },
  { q: "`item_signal` is 95% null with only 8 values. Is this field still in use, or should we ignore it?", group: "field", field: "item_signal" },
  { q: "`receiving_site` has 17 values like PM1, PN1, PK3. What do these codes stand for?", group: "field", field: "receiving_site" },
  // Hypotheses
  { q: "52% of orders hit a 'Confirmed Changed' rework loop. Do you suspect this is data entry errors, or a process design issue?", group: "hypothesis", idx: 0 },
  { q: "PM1 is significantly faster than other sites — any idea why? Different team, product mix?", group: "hypothesis", idx: 1 },
  { q: "Volume dropped 50% over the period — seasonal, or did something change?", group: "hypothesis", idx: 2 },
];

const SKIP_RE = /^(skip|enough|pass|later|no thanks|not now|enough for now|move on|next)$/i;

/* ═══ MAIN ═══ */
const INTRO = "Welcome to Namuda, we have been waiting for you. Improvement lives off data, should we get started?";

export default function App() {
  const [scene, setScene] = useState("dark");
  const [phase, setPhase] = useState("intro");
  const [introDone, setIntroDone] = useState(false);
  const [input, setInput] = useState("");
  const [userMsgs, setUserMsgs] = useState([]); // only user bubbles at bottom
  const [blobText, setBlobText] = useState(""); // current blob speech
  const [blob, setBlob] = useState("idle");
  const [panel, setPanel] = useState(null);
  const [thoughts, setThoughts] = useState([]);
  const [thinking, setThinking] = useState(false);
  const [bgLight, setBgLight] = useState(0);
  const [showIntro, setShowIntro] = useState(false);
  const [docData, setDocData] = useState(null);
  const [docVisible, setDocVisible] = useState(true);
  const [goalsDoc, setGoalsDoc] = useState(null);
  const [showProcessTeaser, setShowProcessTeaser] = useState(false);
  const [qIdx, setQIdx] = useState(0);
  const [fieldIdx, setFieldIdx] = useState(0);
  const [mappedFields, setMappedFields] = useState(() => dimFields.map(f => ({ ...f, confirmed: false, meaning: f.guess })));
  const userMsgRef = useRef(null);

  useEffect(() => { if (userMsgRef.current) userMsgRef.current.scrollTop = userMsgRef.current.scrollHeight; }, [userMsgs]);

  // Moonrise
  useEffect(() => {
    setTimeout(() => setScene("rising"), 600);
    setTimeout(() => setBgLight(0.4), 2000);
    setTimeout(() => setBgLight(1), 3400);
    setTimeout(() => { setScene("intro"); setShowIntro(true); }, 4800);
  }, []);

  const addUser = useCallback((t) => setUserMsgs(m => [...m, { text: t, id: Date.now() + Math.random() }]), []);
  const clearUser = () => setUserMsgs([]);


  const doThink = (key, dur, cb) => {
    setThinking(true); setBlob("thinking"); setThoughts(qt[key] || [""]);
    clearUser(); setPanel(null); setBlobText("");
    setTimeout(() => { setThinking(false); setBlob("waiting"); setThoughts([]); cb(); }, dur);
  };

  const bumpScore = (amount) => {
    setDocData(prev => prev ? { ...prev, contextScore: Math.min(100, (prev.contextScore || 0) + amount) } : prev);
  };

  const finishDraft = () => {
    doThink("drafting", 4000, () => {
      setDocData(prev => ({
        ...prev,
        contextScore: Math.max(prev?.contextScore || 0, 30),
        mission: prev?.mission || "To have an efficient purchasing process that is uniform across all sales offices.",
        description: prev?.description || "Orders are created, released, approved, sent to vendors, processed, confirmed, and received across 17 sites.",
        kpis: [
          { l: "Avg throughput time", v: "18.8 days" }, { l: "Rework rate", v: "52%" },
          { l: "Process variants", v: "1,175" }, { l: "Data quality score", v: "50 / 100" },
          { l: "Fastest site (PM1)", v: "7.7 days" }, { l: "Slowest site (PN1)", v: "34.0 days" },
        ],
      }));
      setBlobText("Please review the process context, and we will move one step closer to improvements!");
      setPhase("review");
    });
  };

  const goToMissionReview = () => {
    const proposedMission = "To have an efficient purchasing process that is uniform across all sales offices.";
    setDocData(prev => ({ ...prev, mission: proposedMission }));
    bumpScore(5);
    setBlobText(`Based on what you've told me, I now feel confident that this could be the mission statement:\n\n"${proposedMission}"\n\nDo you agree, or have I missed something?`);
    setPhase("mission-review");
  };

  const goToDraft = () => {
    setBlobText("No problem — you can always come back to improve the score later.");
    setTimeout(() => goToMissionReview(), 800);
  };

  // Process a fact-gathering answer and update doc
  const applyFactAnswer = (fq, answer) => {
    if (fq.group === "general") {
      if (fq.idx === 0) setDocData(prev => ({ ...prev, description: "A procurement process where orders are created, routed, and received across multiple sites." }));
      else if (fq.idx === 1) setDocData(prev => ({ ...prev, description: (prev.description || "") + " Handled by purchasing teams across regional offices." }));
      else if (fq.idx === 2) setDocData(prev => ({ ...prev, description: (prev.description || "") + " Mix of manual approvals and automated routing." }));
      else if (fq.idx === 3) setDocData(prev => ({ ...prev, description: (prev.description || "") + " Key pain point: excessive rework in the confirmation step." }));
      bumpScore(8);
    } else if (fq.group === "field") {
      const meanings = { selection_code: "Order routing code — determines approval path", item_signal: "Procurement signal for automation — mostly unused", receiving_site: "Physical site codes — PM1 = main plant, PN1 = north facility" };
      setDocData(prev => {
        const existing = prev.fieldAnnotations || [];
        if (existing.some(a => a.field === fq.field)) return prev;
        return { ...prev, fieldAnnotations: [...existing, { field: fq.field, meaning: answer.length > 10 ? answer : meanings[fq.field] }] };
      });
      bumpScore(8);
    } else if (fq.group === "hypothesis") {
      const hyps = ["Rework likely caused by process design — confirmation step requires manual re-entry", "PM1 speed advantage may be due to dedicated team and simpler product mix", "Volume drop appears structural — not seasonal"];
      setDocData(prev => {
        const existing = prev.hypotheses || [];
        if (existing.length > fq.idx) return prev;
        return { ...prev, hypotheses: [...existing, hyps[fq.idx]] };
      });
      bumpScore(8);
    }
  };

  const send = () => {
    const v = input.trim(); if (!v) return; setInput("");
    addUser(v);

    if (phase === "intro") {
      if (/^(yes|yeah|yep|sure|let'?s|ok|go|start|y|absolutely|definitely)$/i.test(v)) {
        setBlob("thinking");
        setTimeout(() => {
          setBlob("waiting");
          setBlobText("First, I need your data — this is what I'll analyze to understand the process.");
          setPanel("data"); setPhase("data");
        }, 800);
      } else {
        setBlob("thinking");
        setTimeout(() => { setBlob("waiting"); setBlobText("No rush. Say the word when ready."); }, 500);
      }
    } else if (phase === "data") {
      setBlob("thinking");
      setTimeout(() => { setBlob("waiting"); setBlobText("Pick from the panel — or tell me about your data."); }, 500);

    } else if (phase === "core-fields") {
      setBlob("thinking");
      setTimeout(() => { setBlob("waiting"); setBlobText("Review the core fields above and click 'Got it' when ready."); }, 500);

    } else if (phase === "data-profile") {
      setBlob("thinking");
      setTimeout(() => { setBlob("waiting"); setBlobText("Review the data profile. Click 'Looks good' when ready."); }, 500);

    } else if (phase === "fields") {
      setBlob("thinking");
      const idx = fieldIdx;
      setTimeout(() => {
        setBlob("waiting");
        setMappedFields(prev => prev.map((f, i) => i === idx ? { ...f, confirmed: true, meaning: v } : f));
        setBlobText(`Got it — updated \`${mappedFields[idx]?.n}\`.`);
        setTimeout(() => advanceField(idx), 1000);
      }, 500);

    } else if (phase === "fact-gathering") {
      if (SKIP_RE.test(v)) { goToDraft(); return; }
      setBlob("thinking");
      const fq = factQs[qIdx];
      setTimeout(() => {
        setBlob("waiting");
        applyFactAnswer(fq, v);
        const next = qIdx + 1;
        if (next < factQs.length) {
          // Announce group transitions
          const nextFq = factQs[next];
          if (fq.group !== nextFq.group) {
            const intros = {
              field: "Now some questions about specific fields — this helps me understand what your data actually means.\n\nSay 'skip' anytime.",
              hypothesis: "Last group — some hypotheses I'd love your input on.\n\nOr say 'enough for now'.",
            };
            setBlobText(intros[nextFq.group] || "");
            setTimeout(() => { setBlobText(nextFq.q); setQIdx(next); }, 2000);
          } else {
            setBlobText(nextFq.q); setQIdx(next);
          }
        } else {
          setBlobText("Excellent. One more thing before I draft the document...");
          setTimeout(() => goToMissionReview(), 1200);
        }
      }, 700);

    } else if (phase === "mission-review") {
      setBlob("thinking");
      const isAccept = /^(yes|yeah|yep|sure|ok|agree|looks good|correct|perfect|great|y|absolutely|definitely|that'?s right|spot on)$/i.test(v);
      setTimeout(() => {
        setBlob("waiting");
        if (isAccept) {
          setBlobText("Great — mission locked in. Let me draft the full document now.");
          setTimeout(() => finishDraft(), 800);
        } else {
          // User provided a correction — use their text as the new mission
          setDocData(prev => ({ ...prev, mission: v }));
          setBlobText(`Updated the mission to:\n\n"${v}"\n\nLet me draft the full document now.`);
          setTimeout(() => finishDraft(), 1500);
        }
      }, 600);

    } else if (phase === "review") {
      setBlob("thinking");
      setTimeout(() => { setBlob("waiting"); setBlobText("Take your time reviewing. Approve when you're happy with it."); }, 500);

    } else if (phase === "pre-goals") {
      setBlob("thinking");
      setTimeout(() => {
        setBlob("waiting");
        setBlobText("Without goals, we don't have a direction for what to improve. I already have some in mind:");
        setTimeout(() => { setPanel("goals"); setPhase("goals"); }, 600);
      }, 700);

    } else if (phase === "goals") {
      setBlob("thinking");
      setTimeout(() => { setBlob("waiting"); setBlobText("Review the suggested goals. Accept when ready."); }, 500);

    } else if (phase === "targets") {
      setBlob("thinking");
      setTimeout(() => { setBlob("waiting"); setBlobText("Review the targets — each has a reason. Confirm when ready."); }, 500);

    } else if (phase === "junction") {
      setBlob("thinking");
      setTimeout(() => { setBlob("waiting"); setBlobText("Pick from the options — or tell me what you'd like to explore."); }, 500);

    } else if (phase === "done") {
      setBlob("thinking");
      setTimeout(() => { setBlob("waiting"); setBlobText("Ready to generate findings. What should we focus on?"); }, 700);
    }
  };

  // ─── PANEL ACTIONS ───
  const pickData = () => {
    setPanel(null);
    setFieldIdx(0);
    setMappedFields(dimFields.map(f => ({ ...f, confirmed: false, meaning: f.guess })));
    doThink("loading", 4000, () => {
      setBlobText("Your data has 3 core fields — these are the building blocks of process mining.\n\nLet me explain what each one means.");
      setPhase("core-fields");
    });
  };

  const acceptCoreFields = () => {
    setBlobText("Great, now I can see the process!");
    setTimeout(() => setShowProcessTeaser(true), 600);
    setTimeout(() => {
      setShowProcessTeaser(false);
      setBlobText("Woa, a lot of potential for improvement here. Let's get back to that later.\n\nTo do things right I need more context — I think I understand the dimensional data, but two heads think better than one.");
      setTimeout(() => {
        setBlobText("Let's review the dimension fields together — confirming their meaning ensures I interpret patterns correctly.");
        setPhase("fields");
      }, 3000);
    }, 4000);
  };

  const acceptProfile = () => {
    setPanel(null);
    setShowProcessTeaser(true);
    setDocData({
      processName: "Purchase-to-Receive", processType: "Procurement", contextScore: 0,
    });
    setBlobText("Excellent — your data is ready. Now let's build the Process Context.\n\nThis is the intelligence layer that turns raw data into actionable insights. The more I understand about your business, the sharper my analysis.\n\nTake a peek at the process preview on the right. I'll ask a few questions — say 'skip' anytime.");
    setTimeout(() => { setBlobText(factQs[0].q); setQIdx(0); setPhase("fact-gathering"); }, 3500);
  };

  const advanceField = (idx) => {
    const next = idx + 1;
    if (next < dimFields.length) {
      setFieldIdx(next);
      const f = dimFields[next];
      setBlobText(`Next: \`${f.n}\` (${f.v} values)\n\nI think this is:\n"${f.guess}"\n\nAccept or correct me.`);
    } else {
      setFieldIdx(next); // past the end — shows "all done" in panel
      setBlobText("All fields reviewed. Continue when ready.");
    }
  };

  const acceptFieldItem = (idx) => {
    setMappedFields(prev => prev.map((f, i) => i === idx ? { ...f, confirmed: true } : f));
    advanceField(idx);
  };

  const acceptFields = () => {
    setPanel(null); setBlob("thinking");
    setTimeout(() => {
      setBlob("waiting");
      setBlobText("Now that I understand your fields, I can give you a proper data quality assessment.\n\nData quality isn't just about completeness — it determines whether I can answer the questions that matter. Missing or unreliable fields create blind spots in the analysis.\n\nReview the assessment and decide which fields to include.");
      setPanel("data-profile"); setPhase("data-profile");
    }, 800);
  };

  const approveDoc = () => {
    setDocVisible(false);
    setBlobText("Thank you, that's saved!");
    setPhase("pre-goals");
    setTimeout(() => {
      setBlobText("Now we need goals — without them, we don't have a direction for what to improve. I already have some in mind:");
      setTimeout(() => { setPanel("goals"); setPhase("goals"); }, 800);
    }, 1500);
  };

  const acceptGoals = () => {
    setPanel(null);
    setGoalsDoc({
      mission: docData?.mission || "To have an efficient purchasing process that is uniform across all sales offices.",
      goals: [
        { n: "Reduce throughput time", current: "18.8 days avg", icon: "⏱",
          why: "Throughput directly impacts working capital and supplier relationships. Faster cycles mean less inventory and quicker response to demand.",
          evidence: "PM1 achieves 7.7d while PN1 takes 34d — the gap proves structural improvement is possible." },
        { n: "Lower rework rate", current: "52%", icon: "🔄",
          why: "Every rework loop doubles handling cost and delays downstream steps. Rework is the primary driver of throughput variance.",
          evidence: "52% of orders hit 'Confirmed Changed' — this single loop accounts for an estimated 40% of excess cycle time." },
        { n: "Improve data quality", current: "50/100", icon: "📊",
          why: "Low data quality limits what we can analyze and automate. Missing fields create blind spots in root-cause analysis.",
          evidence: "item_signal is 95% null, selection_code is 42% null — two fields that could unlock automation insights." },
        { n: "Increase conformance", current: "1,175 variants", icon: "📐",
          why: "High variant count means the process behaves differently everywhere — making it hard to optimize, train, or automate.",
          evidence: "17 sites, 1,175 variants. Most variants have <10 cases — long-tail fragmentation across regional offices." },
      ],
    });
    setBlob("thinking");
    setTimeout(() => {
      setBlob("waiting");
      setBlobText("Goals confirmed. Now let me suggest specific targets for each — here's where I think you can realistically get to:");
      setTimeout(() => { setPanel("targets"); setPhase("targets"); }, 600);
    }, 700);
  };

  const acceptTargets = () => {
    setPanel(null);
    setGoalsDoc(prev => ({ ...prev, goals: [
      { n: "Throughput time", b: "18.8d", t: "14d" }, { n: "Rework rate", b: "52%", t: "35%" },
      { n: "Data quality", b: "50/100", t: "70+" }, { n: "Conformance", b: "1,175 var", t: "<400" },
    ]}));
    setBlob("thinking");
    setTimeout(() => {
      setBlob("waiting");
      setBlobText("Targets locked in! Now — here's what I'd suggest as your next move:");
      setPanel("junction"); setPhase("junction");
    }, 800);
  };

  // Seed state needed for any phase so forward jumps work
  const seedState = () => {
    if (!docData) {
      setDocData({
        processName: "Purchase-to-Receive", processType: "Procurement", contextScore: 62,
        mission: "To have an efficient purchasing process that is uniform across all sales offices.",
        description: "A procurement process where orders are created, routed, and received across multiple sites. Handled by purchasing teams across regional offices. Mix of manual approvals and automated routing. Key pain point: excessive rework in the confirmation step.",
        kpis: [
          { l: "Avg throughput time", v: "18.8 days" }, { l: "Rework rate", v: "52%" },
          { l: "Process variants", v: "1,175" }, { l: "Data quality score", v: "50 / 100" },
          { l: "Fastest site (PM1)", v: "7.7 days" }, { l: "Slowest site (PN1)", v: "34.0 days" },
        ],
        fieldAnnotations: [
          { field: "selection_code", meaning: "Order routing code — determines approval path" },
          { field: "item_signal", meaning: "Procurement signal for automation — mostly unused" },
          { field: "receiving_site", meaning: "Physical site codes — PM1 = main plant, PN1 = north facility" },
        ],
        hypotheses: [
          "Rework likely caused by process design — confirmation step requires manual re-entry",
          "PM1 speed advantage may be due to dedicated team and simpler product mix",
          "Volume drop appears structural — not seasonal",
        ],
      });
      setDocVisible(true);
    }
  };

  const jumpTo = (step) => {
    setPanel(null);
    clearUser();
    setShowProcessTeaser(false);
    if (step.id === "data") {
      setBlobText("Pick a dataset or upload your own.");
      setPanel("data"); setPhase("data");
    } else if (step.id === "profile") {
      setBlobText("Review the data quality assessment.");
      setPanel("data-profile"); setPhase("data-profile");
    } else if (step.id === "fields") {
      setBlobText("Review the field mapping.");
      setFieldIdx(0);
      setMappedFields(dimFields.map(f => ({ ...f, confirmed: false, meaning: f.guess })));
      setPanel("fields"); setPhase("fields");
    } else if (step.id === "context") {
      seedState();
      setBlobText(factQs[0].q); setQIdx(0); setPhase("fact-gathering");
    } else if (step.id === "review") {
      seedState();
      setBlobText("Please review the process context.");
      setPhase("review");
    } else if (step.id === "goals") {
      seedState(); setDocVisible(false);
      setBlobText("Let's set some goals.");
      setPanel("goals"); setPhase("goals");
    } else if (step.id === "targets") {
      seedState(); setDocVisible(false);
      if (!goalsDoc) {
        setGoalsDoc({
          mission: docData?.mission || "To have an efficient purchasing process that is uniform across all sales offices.",
          goals: [
            { n: "Reduce throughput time", current: "18.8 days avg", icon: "⏱", why: "Throughput directly impacts working capital.", evidence: "PM1 achieves 7.7d while PN1 takes 34d." },
            { n: "Lower rework rate", current: "52%", icon: "🔄", why: "Every rework loop doubles handling cost.", evidence: "52% of orders hit 'Confirmed Changed'." },
            { n: "Improve data quality", current: "50/100", icon: "📊", why: "Low data quality limits analysis.", evidence: "item_signal 95% null, selection_code 42% null." },
            { n: "Increase conformance", current: "1,175 variants", icon: "📐", why: "High variant count means fragmentation.", evidence: "17 sites, 1,175 variants." },
          ],
        });
      }
      setBlobText("Here are the suggested targets:");
      setPanel("targets"); setPhase("targets");
    } else if (step.id === "junction") {
      seedState(); setDocVisible(false);
      if (!goalsDoc) {
        setGoalsDoc({ mission: "To have an efficient purchasing process that is uniform across all sales offices.", goals: [
          { n: "Throughput time", b: "18.8d", t: "14d" }, { n: "Rework rate", b: "52%", t: "35%" },
          { n: "Data quality", b: "50/100", t: "70+" }, { n: "Conformance", b: "1,175 var", t: "<400" },
        ]});
      }
      setBlobText("Targets locked in! Here's what I'd suggest next:");
      setPanel("junction"); setPhase("junction");
    } else if (step.id === "done") {
      seedState(); setDocVisible(false);
      setBlobText("Ready to explore. What should we focus on?");
      setPhase("done");
    }
  };

  const hasStarted = userMsgs.length > 0 || blobText;
  const isThink = thinking;
  const isDark = bgLight < 0.5;
  const hasDoc = docData !== null && docVisible;
  const hasGoalsDoc = goalsDoc !== null;
  const isReview = phase === "review";
  const blobSz = isThink ? 420 : (!hasStarted && scene !== "dark" && scene !== "rising") ? 420 : hasStarted ? 140 : 420;

  return (
    <div style={{ position: "fixed", inset: 0, background: isDark ? "#0e0f14" : "#f4f5f8", transition: "background 1.5s ease", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', -apple-system, sans-serif", overflow: "hidden" }}>
      <DotBackground isDark={isDark} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
        @keyframes panelIn { from { opacity:0; transform:translateY(10px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes docIn { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes msgIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes dp { 0%,100% { opacity:0.3; transform:scale(0.8); } 50% { opacity:1; transform:scale(1.15); } }
        @keyframes riseIn { 0% { opacity:0; transform:translateY(100vh); } 40% { opacity:0.6; } 100% { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Top bar */}
      <div style={{ padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: isDark ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.04)", flexShrink: 0, opacity: bgLight, transition: "all 1s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: isDark ? "#fff" : "#1a1d23", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: isDark ? "#1a1d23" : "#fff", transition: "all 1s" }}>N</div>
          <span style={{ fontSize: 14, fontWeight: 600, color: isDark ? "#fff" : "#1a1d23", transition: "color 1s" }}>namuda</span>
        </div>
        <span style={{ fontSize: 11.5, color: isDark ? "rgba(255,255,255,0.25)" : "#b0b5c0", transition: "color 1s" }}>improvement flow</span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

        {/* DOC PANEL — left during gathering */}
        {hasDoc && !isReview && (
          <DocPanel data={docData} onUpdate={d => setDocData(d)} onImproveScore={() => setBlobText("Tell me more about:\n• What triggers this process?\n• Are there known bottlenecks?\n• What does success look like?")} />
        )}

        {/* GOALS DOC — left during goals/targets phases */}
        {hasGoalsDoc && !hasDoc && <GoalsDocPanel data={goalsDoc} />}

        {/* REVIEW MODE — doc centered with approve button */}
        {isReview && hasDoc && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", overflow: "hidden" }}>
            <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 8 }}>
              <div style={{ marginBottom: -20 }}><Blob state={blob} size={blobSz} /></div>
              {blobText && <BlobSpeech text={blobText} />}
            </div>
            <div style={{ flex: 1, width: "100%", maxWidth: 720, overflowY: "auto", padding: "16px 24px 24px" }}>
              <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 4px 28px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.03)", overflow: "hidden", animation: "panelIn 0.5s ease" }}>
                <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid #eceef2" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>Process Context</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#1a1d23" }}>{docData.processName}</div>
                  <div style={{ fontSize: 12, color: "#7a8194", marginTop: 2 }}>{docData.processType}</div>
                </div>
                {docData.contextScore != null && <ContextScore score={docData.contextScore} />}
                <div style={{ padding: "16px 22px 24px" }}>
                  {docData.kpis && docData.kpis.length > 0 && <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 5 }}>Key Indicators</div>
                    {docData.kpis.map((k, i) => (<div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < docData.kpis.length - 1 ? "1px solid #f0f1f5" : "none" }}>
                      <span style={{ fontSize: 12, color: "#5a5f6e" }}>{k.l}</span><span style={{ fontSize: 13, fontWeight: 600, color: "#3a3f4a" }}>{k.v}</span></div>))}</div>}
                  {docData.mission && <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: "#4f6df5", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 5 }}>Mission Statement</div>
                    <div style={{ padding: "12px 14px", background: "#f0f2ff", borderRadius: 9, border: "1px solid #d8ddf5" }}>
                      <div style={{ fontSize: 13.5, color: "#2a2e60", lineHeight: 1.6, fontWeight: 500 }}>{docData.mission}</div></div></div>}
                  {docData.description && <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 5 }}>Process Description</div>
                    <div style={{ fontSize: 12.5, color: "#3a3f4a", lineHeight: 1.6 }}>{docData.description}</div></div>}
                  {docData.fieldAnnotations && docData.fieldAnnotations.length > 0 && <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 5 }}>Field Context</div>
                    {docData.fieldAnnotations.map((f, i) => (<div key={i} style={{ padding: "6px 10px", borderRadius: 5, marginBottom: 3, background: "#f8f9fb", borderLeft: "3px solid #a0a8b8" }}>
                      <div style={{ fontFamily: "monospace", fontSize: 11.5, color: "#5a5f6e", fontWeight: 600 }}>{f.field}</div>
                      <div style={{ fontSize: 10.5, color: "#7a8194" }}>{f.meaning}</div></div>))}</div>}
                  {docData.hypotheses && docData.hypotheses.length > 0 && <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 5 }}>Hypotheses</div>
                    {docData.hypotheses.map((h, i) => (<div key={i} style={{ padding: "8px 12px", background: "#faf8f0", borderRadius: 7, border: "1px solid #ede8d8", marginBottom: 4 }}>
                      <div style={{ fontSize: 12, color: "#5a5040", lineHeight: 1.5 }}>{h}</div></div>))}</div>}
                </div>
                <div style={{ padding: "14px 22px", borderTop: "1px solid #eceef2", display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={approveDoc} style={{ ...btnD, padding: "10px 24px", fontSize: 13 }}>Approve & continue →</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BLOB + CHAT column — pushes right when doc is visible */}
        {!isReview && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", overflow: "hidden", position: "relative", marginLeft: hasDoc ? "min(696px, calc(100vw - 484px))" : hasGoalsDoc ? 536 : 0, marginRight: showProcessTeaser && !isThink ? 352 : 0, transition: "margin 0.5s cubic-bezier(0.16,1,0.3,1)" }}>

            {(isThink || !hasStarted) ? (
              <div style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                animation: scene === "rising" ? "riseIn 3.2s cubic-bezier(0.22,0.9,0.36,1)" : "none",
              }}>
                <Blob state={blob} size={blobSz} />
                {isThink && thoughts.length > 0 && <div style={{ marginTop: 20, animation: "fadeUp 0.4s ease" }}><Thoughts items={thoughts} /></div>}
                {showIntro && !isThink && !hasStarted && (
                  <div style={{ textAlign: "center", padding: "20px 24px 0", maxWidth: 480, animation: "fadeUp 0.8s ease" }}>
                    <div style={{ fontSize: 18, lineHeight: 1.75, color: isDark ? "rgba(255,255,255,0.65)" : "#4a5060", fontWeight: 400, transition: "color 1s" }}>
                      <TW text={INTRO} onDone={() => { setIntroDone(true); setBlob("waiting"); }} speed={30} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 8 }}>
                  <div style={{ marginBottom: -20, transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)" }}>
                    <Blob state={blob} size={blobSz} />
                  </div>
                  {blobText && <BlobSpeech text={blobText} />}
                  {blob === "thinking" && !isThink && <div style={{ marginTop: 8 }}><Dots /></div>}
                </div>
                {/* Core fields educational card */}
                {phase === "core-fields" && (
                  <CoreFieldsCard onAccept={acceptCoreFields} />
                )}
                {/* Inline field mapping card */}
                {phase === "fields" && mappedFields[fieldIdx] && (
                  <FieldCard
                    key={fieldIdx}
                    field={mappedFields[fieldIdx]}
                    index={fieldIdx}
                    total={mappedFields.length}
                    onAccept={() => acceptFieldItem(fieldIdx)}
                    onRefine={(meaning) => {
                      setMappedFields(prev => prev.map((f, i) => i === fieldIdx ? { ...f, confirmed: true, meaning } : f));
                      advanceField(fieldIdx);
                    }}
                  />
                )}
                {phase === "fields" && fieldIdx >= dimFields.length && (
                  <div style={{ width: "100%", maxWidth: 400, padding: "0 24px", animation: "fadeUp 0.4s ease" }}>
                    <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)", padding: "20px 18px", textAlign: "center" }}>
                      <div style={{ fontSize: 24, color: "#7bc67e", marginBottom: 8 }}>✓</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1d23", marginBottom: 4 }}>All fields mapped</div>
                      <div style={{ fontSize: 12, color: "#7a8194", marginBottom: 14 }}>Your field interpretations are locked in.</div>
                      <button onClick={acceptFields} style={btnD}>Continue to data quality →</button>
                    </div>
                  </div>
                )}
                <div style={{ flex: 1 }} />
                {userMsgs.length > 0 && (
                  <div ref={userMsgRef} style={{ width: "100%", maxWidth: 420, padding: "0 24px 8px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, flexShrink: 0, maxHeight: 180 }}>
                    {userMsgs.map(m => (
                      <div key={m.id} style={{ display: "flex", justifyContent: "flex-end", animation: "msgIn 0.3s ease" }}>
                        <div style={{ maxWidth: 360, padding: "8px 15px", fontSize: 14, lineHeight: 1.65, color: "#fff", background: "#2a2e38", borderRadius: "15px 3px 15px 15px", fontWeight: 500 }}>{m.text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* PROCESS TEASER — right side, closable */}
        {showProcessTeaser && !isThink && <ProcessTeaser onClose={() => setShowProcessTeaser(false)} />}

        {/* STEP MAP — right side (shift left when teaser is open) */}
        {hasStarted && !isThink && !isDark && !showProcessTeaser && <StepMap phase={phase} onJump={jumpTo} fieldProgress={(phase === "core-fields" || phase === "fields") ? { fields: mappedFields, currentIdx: fieldIdx } : null} />}

        {/* FLOATING PANEL */}
        {panel && !isThink && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 15 }}>
            {panel === "data" && <DataPanel onSelect={pickData} />}
            {panel === "data-profile" && <DataProfilePanel onAccept={acceptProfile} />}
            {/* FieldPanel removed — field mapping now inline via FieldCard */}
            {panel === "goals" && <GoalsPanel onAccept={acceptGoals} />}
            {panel === "targets" && <TargetsPanel onAccept={acceptTargets} />}
            {panel === "junction" && <JunctionPanel onSelect={(id) => {
              setPanel(null);
              if (id === "canvas") {
                setBlobText("Let me load the process canvas for you...");
                setPhase("done");
              } else {
                const labels = { rework: "rework loop", throughput: "throughput bottlenecks", conformance: "variant reduction", quality: "data quality" };
                setBlobText(`Great choice. Let me generate the ${labels[id] || id} findings...`);
                setPhase("done");
              }
            }} />}
          </div>
        )}

      </div>

      {/* Input */}
      <div style={{ padding: "12px 28px 20px", display: "flex", justifyContent: "center", flexShrink: 0, opacity: (introDone || hasStarted) && !isThink ? 1 : 0, transform: (introDone || hasStarted) && !isThink ? "translateY(0)" : "translateY(14px)", transition: "all 0.5s ease", pointerEvents: isThink ? "none" : "auto" }}>
        <div style={{ width: "100%", maxWidth: 520, display: "flex", gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
            placeholder={phase === "fact-gathering" ? "Answer or type 'skip'..." : "Type your response..."}
            style={{ flex: 1, padding: "10px 15px", fontSize: 13.5, fontFamily: "'DM Sans',sans-serif", border: "1px solid #e2e5ea", borderRadius: 10, background: "#fff", color: "#1a1d23", outline: "none", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
            onFocus={e => { e.target.style.borderColor = "#c0c5d0"; e.target.style.boxShadow = "0 1px 3px rgba(0,0,0,0.03), 0 0 0 3px rgba(0,0,0,0.02)"; }}
            onBlur={e => { e.target.style.borderColor = "#e2e5ea"; e.target.style.boxShadow = "0 1px 3px rgba(0,0,0,0.03)"; }}
          />
          <button onClick={send} style={{ padding: "10px 17px", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", background: "#1a1d23", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer" }}
            onMouseEnter={e => e.target.style.background = "#2d3340"} onMouseLeave={e => e.target.style.background = "#1a1d23"}>Send</button>
        </div>
      </div>
    </div>
  );
}
