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

/* ═══ CORE FIELDS EDUCATION — animated step-by-step build-up + field selection ═══ */
function CoreFieldsEducation({ onAccept }) {
  const [step, setStep] = useState(0); // 0=table, 1=highlight-case, 2=traces, 3=graph, 4=select-fields
  const [hlRow, setHlRow] = useState(-1);
  const [graphEdges, setGraphEdges] = useState(0);
  const [graphNodes, setGraphNodes] = useState(0);
  const [traceAnim, setTraceAnim] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  // Field selection state — user maps columns
  const [selections, setSelections] = useState({ case_id: null, activity: null, timestamp: null });

  const dataColumns = [
    { n: "case_id", samples: ["PO-2024-00142", "PO-2024-00143", "PO-2024-00144", "PO-2024-00145", "PO-2024-00146", "PO-2024-00147", "PO-2024-00148", "PO-2024-00149", "PO-2024-00150", "PO-2024-00151"] },
    { n: "activity_name", samples: ["Created", "Free", "Approved", "Sent", "In Process", "Confirmed", "Conf.Chgd", "Received", "Closed", "Blocked"] },
    { n: "timestamp", samples: ["2024-08-01 09:12", "2024-08-01 09:15", "2024-08-01 10:30", "2024-08-01 14:22", "2024-08-02 08:05", "2024-08-02 11:40", "2024-08-03 09:00", "2024-08-03 16:18", "2024-08-05 10:22", "2024-08-06 08:45"] },
    { n: "receiving_site", samples: ["PM1", "PN1", "PK3", "PL2", "PM2", "PK1", "PN2", "PL1", "PM3", "PK2"] },
    { n: "purchase_office", samples: ["DE01", "DE02", "NO01", "SE01", "DE03", "FI01", "DK01", "NO02", "SE02", "DE04"] },
    { n: "item_group", samples: ["MECH", "ELEC", "RAW", "PACK", "CHEM", "TOOL", "SAFE", "PIPE", "VALV", "INSTR"] },
  ];

  const roles = [
    { key: "case_id", label: "Case ID", desc: "The entity moving through the process", color: "#4f6df5", icon: "◉" },
    { key: "activity", label: "Activity", desc: "What happened at each step", color: "#e8a040", icon: "▸" },
    { key: "timestamp", label: "Timestamp", desc: "When each event occurred", color: "#45b080", icon: "◷" },
  ];

  const events = [
    { case_id: "PO-142", activity: "Created",   ts: "Aug 1  09:12" },
    { case_id: "PO-142", activity: "Free",       ts: "Aug 1  09:15" },
    { case_id: "PO-143", activity: "Created",   ts: "Aug 1  09:30" },
    { case_id: "PO-142", activity: "Approved",  ts: "Aug 1  10:30" },
    { case_id: "PO-143", activity: "Free",       ts: "Aug 1  10:45" },
    { case_id: "PO-144", activity: "Created",   ts: "Aug 1  11:00" },
    { case_id: "PO-142", activity: "Sent",      ts: "Aug 1  14:22" },
    { case_id: "PO-143", activity: "Approved",  ts: "Aug 2  08:10" },
    { case_id: "PO-144", activity: "Free",       ts: "Aug 2  08:30" },
    { case_id: "PO-142", activity: "Confirmed", ts: "Aug 2  11:40" },
    { case_id: "PO-143", activity: "Sent",      ts: "Aug 2  14:00" },
    { case_id: "PO-144", activity: "Approved",  ts: "Aug 3  09:00" },
    { case_id: "PO-142", activity: "Received",  ts: "Aug 3  16:18" },
    { case_id: "PO-143", activity: "Confirmed", ts: "Aug 3  16:30" },
    { case_id: "PO-144", activity: "Sent",      ts: "Aug 4  10:00" },
    { case_id: "PO-143", activity: "Received",  ts: "Aug 5  10:22" },
    { case_id: "PO-144", activity: "Confirmed", ts: "Aug 5  14:00" },
    { case_id: "PO-144", activity: "Received",  ts: "Aug 6  08:45" },
  ];

  const cases = {
    "PO-142": ["Created", "Free", "Approved", "Sent", "Confirmed", "Received"],
    "PO-143": ["Created", "Free", "Approved", "Sent", "Confirmed", "Received"],
    "PO-144": ["Created", "Free", "Approved", "Sent", "Confirmed", "Received"],
  };

  const activities = ["Created", "Free", "Approved", "Sent", "Confirmed", "Received"];
  const graphEdgesDef = [[0,1],[1,2],[2,3],[3,4],[4,5]];
  const caseColors = { "PO-142": "#4f6df5", "PO-143": "#e8a040", "PO-144": "#45b080" };

  // Step 1: highlight rows for PO-142 one by one
  useEffect(() => {
    if (step === 1) {
      setHlRow(-1);
      let row = 0;
      const caseRows = events.map((e, i) => e.case_id === "PO-142" ? i : -1).filter(i => i >= 0);
      const t = setInterval(() => {
        if (row < caseRows.length) { setHlRow(caseRows[row]); row++; }
        else clearInterval(t);
      }, 400);
      return () => clearInterval(t);
    }
  }, [step]);

  // Step 2: animate traces appearing
  useEffect(() => {
    if (step === 2) {
      setTraceAnim(0);
      let c = 0;
      const t = setInterval(() => { c++; setTraceAnim(c); if (c >= 3) clearInterval(t); }, 600);
      return () => clearInterval(t);
    }
  }, [step]);

  // Step 3: animate graph nodes then edges
  useEffect(() => {
    if (step === 3) {
      setGraphNodes(0); setGraphEdges(0);
      let n = 0;
      const nt = setInterval(() => { n++; setGraphNodes(n); if (n >= activities.length) { clearInterval(nt); let e = 0; const et = setInterval(() => { e++; setGraphEdges(e); if (e >= graphEdgesDef.length) clearInterval(et); }, 300); } }, 200);
      return () => clearInterval(nt);
    }
  }, [step]);

  // Step 4: auto-select correct fields on mount
  useEffect(() => {
    if (step === 4) {
      setSelections({ case_id: "case_id", activity: "activity_name", timestamp: "timestamp" });
    }
  }, [step]);

  const allSelected = selections.case_id && selections.activity && selections.timestamp;
  const selectedCols = new Set(Object.values(selections).filter(Boolean));

  const handleConfirm = () => {
    setFadeOut(true);
    setTimeout(() => onAccept(), 500);
  };

  const assignRole = (colName, roleKey) => {
    setSelections(prev => {
      const next = { ...prev };
      // Remove this column from any other role
      for (const k of Object.keys(next)) { if (next[k] === colName) next[k] = null; }
      next[roleKey] = colName;
      return next;
    });
  };

  const getRoleForCol = (colName) => {
    for (const [k, v] of Object.entries(selections)) { if (v === colName) return k; }
    return null;
  };

  const stepTitles = [
    "Every process starts as a table of events",
    "Each case_id is one journey through the process",
    "Sort by time — each case becomes a trace",
    "Connect the steps — a process map emerges",
    "Now, tell me which columns are which",
  ];

  const stepDescs = [
    "Three columns are all you need: which case, what happened, and when.",
    "Follow PO-142 — it's one purchase order moving through each step.",
    "Group by case, sort by time. Now you can see the path each case takes.",
    "When many cases follow the same path, the process structure reveals itself.",
    "I found these columns in your data. Click each column to assign it a role, or confirm my suggestions.",
  ];

  const nodePositions = activities.map((a, i) => ({ label: a, x: 12 + i * 48, y: 20 }));
  const totalSteps = 5;

  return (
    <div style={{
      width: "100%", maxWidth: 620, padding: "0 24px",
      animation: fadeOut ? "none" : "snapIn 0.45s cubic-bezier(0.34,1.56,0.64,1)",
      opacity: fadeOut ? 0 : 1, transform: fadeOut ? "scale(0.97) translateY(8px)" : "none",
      transition: fadeOut ? "opacity 0.4s ease, transform 0.4s cubic-bezier(0.4,0,0.2,1)" : "none",
    }}>
      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)", overflow: "hidden" }}>
        <div style={{ padding: "16px 18px 14px" }}>
          {/* Header */}
          <div style={{ fontSize: 10, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 4 }}>Core Fields — Building Blocks</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1d23", marginBottom: 2, transition: "all 0.3s" }}>{stepTitles[step]}</div>
          <div style={{ fontSize: 11.5, color: "#7a8194", marginBottom: 14, lineHeight: 1.5 }}>{stepDescs[step]}</div>

          {/* Column labels — steps 0 & 1 */}
          {(step === 0 || step === 1) && (
            <div style={{ display: "flex", gap: 0, marginBottom: 6 }}>
              {[
                { n: "case_id", desc: "Which journey", color: "#4f6df5" },
                { n: "activity", desc: "What happened", color: "#e8a040" },
                { n: "timestamp", desc: "When", color: "#45b080" },
              ].map((col, ci) => (
                <div key={ci} style={{ flex: ci === 2 ? 1.1 : 1, padding: "6px 8px", background: step === 1 && ci === 0 ? "rgba(79,109,245,0.06)" : "transparent", borderRadius: 6, transition: "background 0.3s" }}>
                  <div style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 700, color: col.color }}>{col.n}</div>
                  <div style={{ fontSize: 9, color: "#a0a8b8", marginTop: 1 }}>{col.desc}</div>
                </div>
              ))}
            </div>
          )}

          {/* Step 0 & 1: Event log table */}
          {(step === 0 || step === 1) && (
            <div style={{ maxHeight: 240, overflowY: "auto", border: "1px solid #eceef2", borderRadius: 8, marginBottom: 12 }}>
              {events.map((e, i) => {
                const isHl = step === 1 && e.case_id === "PO-142";
                const isActive = step === 1 && hlRow >= i && e.case_id === "PO-142";
                return (
                  <div key={i} style={{
                    display: "flex", padding: "4px 8px", fontSize: 10, fontFamily: "monospace",
                    background: isActive ? "rgba(79,109,245,0.08)" : isHl && hlRow < i ? "rgba(79,109,245,0.03)" : i % 2 === 0 ? "#fafbfc" : "#fff",
                    borderBottom: "1px solid rgba(0,0,0,0.03)",
                    transition: "background 0.3s",
                    opacity: step === 1 && e.case_id !== "PO-142" ? 0.35 : 1,
                  }}>
                    <span style={{ flex: 1, color: caseColors[e.case_id] || "#5a5f6e", fontWeight: isActive ? 700 : 400 }}>{e.case_id}</span>
                    <span style={{ flex: 1, color: "#5a5f6e" }}>{e.activity}</span>
                    <span style={{ flex: 1.1, color: "#a0a8b8" }}>{e.ts}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Step 2: Traces */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12, minHeight: 120 }}>
              {Object.entries(cases).map(([caseId, acts], ci) => (
                <div key={caseId} style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "8px 10px",
                  background: "#fafbfc", borderRadius: 8, border: "1px solid #eceef2",
                  opacity: ci < traceAnim ? 1 : 0, transform: ci < traceAnim ? "translateX(0)" : "translateX(-10px)",
                  transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                }}>
                  <span style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 700, color: caseColors[caseId], minWidth: 48 }}>{caseId}</span>
                  {acts.map((a, ai) => (
                    <span key={ai} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{
                        padding: "3px 7px", borderRadius: 5, fontSize: 9, fontWeight: 600,
                        background: "#f0f2ff", color: "#4f6df5", border: "1px solid rgba(79,109,245,0.15)",
                      }}>{a}</span>
                      {ai < acts.length - 1 && <span style={{ color: "#c0c5d0", fontSize: 10 }}>→</span>}
                    </span>
                  ))}
                </div>
              ))}
              {traceAnim >= 3 && (
                <div style={{ fontSize: 10, color: "#8a8f9e", fontStyle: "italic", padding: "4px 10px", animation: "snapIn 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}>
                  All 3 cases follow the same path — this is the "happy path" variant.
                </div>
              )}
            </div>
          )}

          {/* Step 3: Process graph */}
          {step === 3 && (
            <div style={{ marginBottom: 12, padding: "12px 0" }}>
              <svg width="100%" viewBox="0 0 300 70" style={{ display: "block" }}>
                {graphEdgesDef.map(([from, to], i) => {
                  if (i >= graphEdges) return null;
                  const a = nodePositions[from], b = nodePositions[to];
                  const ax = a.x + 22, bx = b.x + 22;
                  return <g key={`e${i}`} style={{ animation: "snapIn 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>
                    <line x1={ax} y1={a.y + 12} x2={bx} y2={b.y + 12} stroke="#c0c5d0" strokeWidth="1.5" />
                    <polygon points={`${bx-5},${b.y+9} ${bx-5},${b.y+15} ${bx},${b.y+12}`} fill="#c0c5d0" />
                    <text x={(ax+bx)/2} y={a.y + 6} textAnchor="middle" fontSize="7" fill="#a0a8b8">3</text>
                  </g>;
                })}
                {activities.map((a, i) => {
                  if (i >= graphNodes) return null;
                  const p = nodePositions[i];
                  return <g key={`n${i}`} style={{ animation: "snapIn 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}>
                    <rect x={p.x} y={p.y} width={44} height={24} rx="6" fill={i === 0 ? "#e8f0fe" : i === activities.length - 1 ? "#e6f7ee" : "#f0f2ff"} stroke={i === 0 ? "#4f6df5" : i === activities.length - 1 ? "#45b080" : "rgba(79,109,245,0.25)"} strokeWidth="1" />
                    <text x={p.x + 22} y={p.y + 15} textAnchor="middle" fontSize="7" fontWeight="600" fill="#3a3f4a">{a}</text>
                  </g>;
                })}
              </svg>
              {graphEdges >= graphEdgesDef.length && (
                <div style={{ fontSize: 10, color: "#8a8f9e", fontStyle: "italic", padding: "6px 0 0", animation: "snapIn 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}>
                  Each arrow shows a directly-follows relation — the backbone of process mining.
                </div>
              )}
            </div>
          )}

          {/* Step 4: Field selection */}
          {step === 4 && (
            <div style={{ animation: "snapIn 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>
              {/* Role badges at top */}
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {roles.map(r => (
                  <div key={r.key} style={{
                    flex: 1, padding: "8px 10px", borderRadius: 8,
                    background: selections[r.key] ? `${r.color}08` : "#fafbfc",
                    border: selections[r.key] ? `1.5px solid ${r.color}` : "1.5px solid #eceef2",
                    transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                      <span style={{ fontSize: 11, color: r.color }}>{r.icon}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: r.color }}>{r.label}</span>
                    </div>
                    <div style={{ fontSize: 9, color: "#8a8f9e", lineHeight: 1.3 }}>{r.desc}</div>
                    {selections[r.key] && (
                      <div style={{ marginTop: 4, fontFamily: "monospace", fontSize: 9, fontWeight: 700, color: r.color, animation: "snapIn 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}>
                        ✓ {selections[r.key]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Column cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 12 }}>
                {dataColumns.map((col) => {
                  const role = getRoleForCol(col.n);
                  const roleObj = role ? roles.find(r => r.key === role) : null;
                  return (
                    <div key={col.n} style={{
                      padding: "8px 8px 6px", borderRadius: 8, cursor: "pointer",
                      background: role ? `${roleObj.color}06` : "#fafbfc",
                      border: role ? `1.5px solid ${roleObj.color}` : "1.5px solid #eceef2",
                      transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                      transform: role ? "scale(1)" : "scale(1)",
                    }}
                    onMouseEnter={e => { if (!role) e.currentTarget.style.borderColor = "#b0b5c0"; }}
                    onMouseLeave={e => { if (!role) e.currentTarget.style.borderColor = "#eceef2"; }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 700, color: roleObj ? roleObj.color : "#1a1d23" }}>{col.n}</span>
                        {role && <span style={{ fontSize: 8, fontWeight: 700, color: roleObj.color, background: `${roleObj.color}15`, padding: "1px 5px", borderRadius: 4 }}>{roleObj.label}</span>}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        {col.samples.slice(0, 5).map((s, i) => (
                          <div key={i} style={{ fontFamily: "monospace", fontSize: 8.5, color: role ? "#5a5f6e" : "#b0b5c0", padding: "1px 0", transition: "color 0.2s" }}>{s}</div>
                        ))}
                      </div>
                      {/* Role assignment buttons */}
                      {!role && (
                        <div style={{ display: "flex", gap: 3, marginTop: 5 }}>
                          {roles.filter(r => !selections[r.key]).map(r => (
                            <button key={r.key} onClick={(e) => { e.stopPropagation(); assignRole(col.n, r.key); }}
                              style={{ padding: "2px 6px", fontSize: 8, fontWeight: 600, background: `${r.color}10`, color: r.color, border: `1px solid ${r.color}30`, borderRadius: 4, cursor: "pointer", transition: "all 0.15s" }}
                              onMouseEnter={e => { e.currentTarget.style.background = `${r.color}25`; }}
                              onMouseLeave={e => { e.currentTarget.style.background = `${r.color}10`; }}
                            >{r.icon} {r.label}</button>
                          ))}
                        </div>
                      )}
                      {role && (
                        <button onClick={(e) => { e.stopPropagation(); setSelections(prev => ({ ...prev, [role]: null })); }}
                          style={{ marginTop: 4, padding: "1px 5px", fontSize: 8, color: "#a0a8b8", background: "transparent", border: "1px solid #e0e3ea", borderRadius: 4, cursor: "pointer" }}
                        >change</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {Array.from({ length: totalSteps }).map((_, s) => (
                <div key={s} style={{
                  width: s === step ? 18 : 6, height: 6, borderRadius: 3,
                  background: s === step ? "#4f6df5" : s < step ? "#b0c4ff" : "#e0e3ea",
                  transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                }} />
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} style={btnG}>← Back</button>
              )}
              {step < 3 ? (
                <button onClick={() => setStep(s => s + 1)} style={btnD}>
                  {step === 0 ? "Show me a case →" : step === 1 ? "See the traces →" : "Build the map →"}
                </button>
              ) : step === 3 && graphEdges >= graphEdgesDef.length ? (
                <button onClick={() => setStep(4)} style={{ ...btnD, background: "#4f6df5" }}>Got it! Select my fields →</button>
              ) : step === 4 && allSelected ? (
                <button onClick={handleConfirm} style={{ ...btnD, background: "#4f6df5", animation: "snapIn 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>Confirm fields →</button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoalsPanel({onAccept, onSkip}){
  const gs=[
    {n:"Reduce throughput time", desc:"Orders take 18.8 days on average — your fastest site proves 7.7 is possible. We'll target the approval bottleneck and waiting times."},
    {n:"Lower rework rate", desc:"52% of orders loop through 'Confirmed Changed'. We'll investigate manual re-entry errors, vendor changes, and specification mismatches."},
    {n:"Improve data quality", desc:"Two key fields are mostly empty — limiting what we can analyze and automate. We'll fix population at source."},
    {n:"Increase conformance", desc:"1,175 process variants across 17 sites. We'll standardize high-volume paths and eliminate low-frequency deviations."},
  ];
  const [selected, setSelected] = useState(new Set([0,1,2,3]));
  const toggle = (i) => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(i)) next.delete(i); else next.add(i);
    return next;
  });
  return (
    <div style={{...ps, width: 480, maxWidth: "90vw"}}>
      <div style={{padding:"22px 26px 0"}}>
        <div style={{fontSize:15,fontWeight:700,color:"#1a1d23",marginBottom:3}}>Suggested Goals</div>
        <div style={{fontSize:12,color:"#8a8f9e",marginBottom:18}}>Select the goals that matter most for your process.</div>
      </div>
      <div style={{padding:"0 26px",maxHeight:"55vh",overflowY:"auto"}}>
        {gs.map((g,i) => {
          const active = selected.has(i);
          return (
            <div key={i} onClick={() => toggle(i)} style={{
              padding:"14px 16px", borderRadius:11, marginBottom:8, cursor:"pointer",
              border: active ? "1.5px solid #4f6df5" : "1.5px solid #e8ebf0",
              background: active ? "#f5f7ff" : "#fff",
              transition: "all 0.2s ease",
              display:"flex", gap:14, alignItems:"flex-start",
            }}>
              <div style={{
                width:28, height:28, borderRadius:8, flexShrink:0,
                display:"flex", alignItems:"center", justifyContent:"center",
                background: active ? "#4f6df5" : "#f0f2f5",
                color: active ? "#fff" : "#8a8f9e",
                fontSize:13, fontWeight:700,
                transition: "all 0.2s ease",
              }}>{i + 1}</div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:13.5,fontWeight:600,color:"#1a1d23",marginBottom:3}}>{g.n}</div>
                <div style={{fontSize:11.5,color:"#6a7086",lineHeight:1.55}}>{g.desc}</div>
              </div>
              <div style={{
                width:18, height:18, borderRadius:5, flexShrink:0, marginTop:2,
                border: active ? "none" : "1.5px solid #d0d5e0",
                background: active ? "#4f6df5" : "transparent",
                display:"flex", alignItems:"center", justifyContent:"center",
                transition: "all 0.2s ease",
              }}>
                {active && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{padding:"16px 26px",borderTop:"1px solid #eceef2",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <button onClick={onSkip} style={{...btnG, color:"#a0a8b8", border:"none", fontSize:12}}>Skip</button>
        <button onClick={() => onAccept([...selected])} style={{...btnD, opacity: selected.size === 0 ? 0.4 : 1, pointerEvents: selected.size === 0 ? "none" : "auto"}}>Accept {selected.size} goal{selected.size !== 1 ? "s" : ""} →</button>
      </div>
    </div>
  );
}

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

/* ═══ SCORE RING ═══ */
function ScoreRing({ score, size = 80 }) {
  const ref = useRef(null);
  const [animScore, setAnimScore] = useState(0);
  useEffect(() => {
    let frame = 0;
    const target = score;
    const animate = () => {
      frame++;
      const progress = Math.min(1, frame / 40);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimScore(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [score]);
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (animScore / 100) * circ;
  const color = animScore >= 70 ? "#45b080" : animScore >= 50 ? "#e8b84a" : "#d4685a";
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#eceef2" strokeWidth="5" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.16,1,0.3,1), stroke 0.3s" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 700, color, lineHeight: 1 }}>{animScore}</div>
        <div style={{ fontSize: 8, color: "#a0a8b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>/ 100</div>
      </div>
    </div>
  );
}

/* ═══ MINI BAR SPARK (tiny inline chart for findings) ═══ */
function MiniBarSpark({ data, width = 120, height = 32 }) {
  const max = Math.max(...data);
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {data.map((v, i) => {
        const bw = (width - (data.length - 1) * 2) / data.length;
        const bh = (v / max) * (height - 4);
        return <rect key={i} x={i * (bw + 2)} y={height - bh} width={bw} height={bh} rx="1.5"
          fill={i === data.length - 1 ? "#d4685a" : v / max > 0.7 ? "#45b080" : "#e8b84a"}
          opacity="0.8" />;
      })}
    </svg>
  );
}

/* ═══ DATA PROFILE PANEL ═══ */
function DataProfilePanel({ onAccept, narrativeStep }) {
  // narrativeStep drives the AI-guided spotlight sequence:
  // 0 = panel appearing (just header visible, rest dim)
  // 1 = score spotlight — hero ring glows
  // 2 = fields revealed — user can toggle omit/include
  // 3 = findings spotlight — list appears, blob encourages click
  // 4 = one finding auto-expands with detail/graphs
  // 5 = findings collapse back, blob wraps up
  // 6 = done — footer visible, all interactive
  const step = narrativeStep || 0;

  const activities = [
    { l: "Created", v: 91179 }, { l: "Free", v: 85200 }, { l: "Approved", v: 82100 },
    { l: "Sent", v: 78400 }, { l: "In Process", v: 74900 }, { l: "Confirmed", v: 71300 },
    { l: "Conf.Chgd", v: 47400, hl: true }, { l: "Received", v: 68800 }, { l: "Closed", v: 65200 },
  ];

  const [omit, setOmit] = useState(new Set(["item_signal"]));
  const toggle = (f) => setOmit(prev => { const n = new Set(prev); n.has(f) ? n.delete(f) : n.add(f); return n; });

  const fields = [
    { field: "case_id", status: "ok", pct: 100, note: "91,179 unique — no duplicates", canOmit: false },
    { field: "activity_name", status: "ok", pct: 100, note: "9 distinct values, no nulls", canOmit: false },
    { field: "timestamp", status: "warn", pct: 74, note: "25.7% duplicate timestamps", canOmit: false },
    { field: "receiving_site", status: "ok", pct: 100, note: "17 values, no nulls", canOmit: true },
    { field: "purchase_office", status: "ok", pct: 100, note: "28 values, no nulls", canOmit: true },
    { field: "item_group", status: "ok", pct: 98, note: "427 values, 2% null", canOmit: true },
    { field: "selection_code", status: "warn", pct: 58, note: "42% null — limits analysis", canOmit: true },
    { field: "item_signal", status: "bad", pct: 5, note: "95% null — recommend omit", canOmit: true, rec: "omit" },
  ];

  const included = fields.filter(f => !omit.has(f.field));
  const score = Math.round(included.reduce((a, f) => a + f.pct, 0) / included.length);
  const passColor = score >= 70 ? "#45b080" : score >= 50 ? "#e8b84a" : "#d4685a";

  const scoreSpotlight = step === 1;
  const fieldsVisible = step >= 2;
  const findingsSpotlight = step >= 3;
  const findingsExpanded = step === 4;
  const footerVisible = step >= 6;

  // Scroll to findings when spotlight hits
  const findingsRef = useRef(null);
  const scrollRef = useRef(null);
  useEffect(() => {
    if (step === 3 && findingsRef.current && scrollRef.current) {
      setTimeout(() => {
        findingsRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [step]);

  const findings = [
    { id: "dup-ts", severity: "Medium", sevColor: "#e8b84a", title: "Duplicate timestamps",
      desc: "25.7% of events share identical timestamps, masking true process sequences.",
      affected: "23,411 events", impact: "Throughput accuracy",
      detail: "When multiple activities share the same timestamp, the directly-follows relation becomes ambiguous. This affects 1 in 4 events in your data.",
      sparkData: [92, 88, 85, 80, 76, 72, 68, 48] },
    { id: "null-signal", severity: "High", sevColor: "#d4685a", title: "item_signal is deprecated",
      desc: "95% null values — this field adds noise without analytical value.",
      affected: "86,620 events", impact: "Analysis noise",
      detail: "Only 4,559 events have a value. The field appears to have been abandoned mid-migration. Recommend omitting.",
      sparkData: [5, 5, 4, 6, 5, 3, 4, 95] },
    { id: "null-selection", severity: "Medium", sevColor: "#e8b84a", title: "selection_code gaps",
      desc: "42% null values correlate with manual orders — fixing this unlocks automation analysis.",
      affected: "38,295 events", impact: "Segmentation depth",
      detail: "Orders without a selection_code can't be routed automatically. This is likely a data entry gap at order creation time.",
      sparkData: [58, 62, 55, 60, 58, 54, 52, 42] },
  ];

  return (
    <div style={{
      position: "absolute", top: 16, bottom: 16,
      right: "calc(50% + 250px)",
      width: "min(520px, calc(50% - 270px))", background: "#fff", borderRadius: 14,
      boxShadow: "0 4px 28px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.03)",
      display: "flex", flexDirection: "column",
      animation: "docIn 0.6s cubic-bezier(0.16,1,0.3,1)",
      overflow: "hidden", zIndex: 10,
    }}>
      {/* ── Hero: Score Ring + Verdict ── */}
      <div style={{
        padding: "20px 24px 16px", borderBottom: "1px solid #eceef2",
        transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
        background: scoreSpotlight ? "linear-gradient(135deg, #f0faf0 0%, #e8f8e8 100%)" : "#fff",
        boxShadow: scoreSpotlight ? "inset 0 -2px 12px rgba(69,176,128,0.08)" : "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{
            transition: "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
            transform: scoreSpotlight ? "scale(1.1)" : "scale(1)",
          }}>
            <ScoreRing score={step >= 1 ? score : 0} size={76} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1d23", marginBottom: 2 }}>Data Quality Assessment</div>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 6,
              opacity: step >= 1 ? 1 : 0, transition: "opacity 0.4s ease 0.3s",
            }}>
              <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10.5, fontWeight: 700, background: `${passColor}15`, color: passColor }}>
                {score >= 70 ? "Pass" : score >= 50 ? "Review" : "Fail"}
              </span>
              <span style={{ fontSize: 11, color: "#8a8f9e" }}>{included.length} of {fields.length} fields included</span>
            </div>
            <div style={{
              fontSize: 11, color: "#7a8194", lineHeight: 1.45,
              opacity: step >= 1 ? 1 : 0, transition: "opacity 0.4s ease 0.5s",
            }}>
              {score >= 70 ? "Data quality is strong. Ready for deep analysis." : "Some fields have quality issues. Review and decide which to include."}
            </div>
          </div>
        </div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "14px 24px 16px" }}>

        {/* ── Volume Stats ── */}
        <div style={{
          display: "flex", gap: 10, marginBottom: 16,
          opacity: step >= 1 ? 1 : 0.15, transition: "opacity 0.5s ease 0.2s",
        }}>
          {[
            { label: "Cases", value: "91,179", sub: "12 months" },
            { label: "Events", value: "624,800", sub: "6.9 per case" },
            { label: "Activities", value: "9", sub: "distinct" },
            { label: "Variants", value: "1,175", sub: "process paths" },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, padding: "10px 10px", background: "#f8f9fb", borderRadius: 8, border: "1px solid #eceef2" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1d23", letterSpacing: "-0.3px" }}>{s.value}</div>
              <div style={{ fontSize: 9.5, fontWeight: 600, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
              <div style={{ fontSize: 9, color: "#b0b5c0", marginTop: 1 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Activity Distribution (compact) ── */}
        <div style={{
          marginBottom: 16,
          opacity: step >= 1 ? 1 : 0.15, transition: "opacity 0.5s ease 0.4s",
        }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 6 }}>Activity Distribution</div>
          <div style={{ display: "flex", gap: 2, height: 28, borderRadius: 6, overflow: "hidden" }}>
            {activities.map((a, i) => {
              const max = activities[0].v;
              const w = (a.v / max) * 100;
              return (
                <div key={i} title={`${a.l}: ${(a.v/1000).toFixed(1)}K`} style={{
                  width: `${w}%`, height: "100%",
                  background: a.hl ? "#e8b84a" : `hsl(${220 + i * 5}, 25%, ${76 - i * 2}%)`,
                  transition: "width 0.5s ease",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {w > 8 && <span style={{ fontSize: 7.5, fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>{a.l}</span>}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
            <span style={{ fontSize: 9, color: "#b0b5c0" }}>9 activities</span>
            <span style={{ fontSize: 9, color: "#e8b84a", fontWeight: 600 }}>Conf.Chgd is anomalous</span>
          </div>
        </div>

        {/* ── Field Quality Bars ── */}
        <div style={{
          marginBottom: 16,
          opacity: fieldsVisible ? 1 : 0.15,
          transition: "opacity 0.5s ease",
        }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 6 }}>Field Quality</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {fields.map((d, i) => {
              const isOmitted = omit.has(d.field);
              const barColor = isOmitted ? "#d0d0d0" : d.status === "ok" ? "#45b080" : d.status === "warn" ? "#e8b84a" : "#d4685a";
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "4px 8px",
                  borderRadius: 5, background: isOmitted ? "#f5f5f5" : "#fafbfc",
                  opacity: isOmitted ? 0.45 : 1, transition: "all 0.2s",
                }}>
                  <span style={{ fontFamily: "monospace", fontSize: 10, color: "#3a3f4a", fontWeight: 600, width: 100, flexShrink: 0 }}>{d.field}</span>
                  <div style={{ flex: 1, height: 8, background: "#eceef2", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: fieldsVisible ? `${d.pct}%` : "0%", background: barColor, borderRadius: 4, transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)" }} />
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 600, color: barColor, width: 30, textAlign: "right", flexShrink: 0 }}>{d.pct}%</span>
                  {d.canOmit && fieldsVisible && (
                    <button onClick={() => toggle(d.field)} style={{
                      padding: "1px 6px", fontSize: 8.5, fontWeight: 600, flexShrink: 0,
                      background: isOmitted ? "#eceef2" : "transparent",
                      color: isOmitted ? "#7a8194" : "#d4685a",
                      border: `1px solid ${isOmitted ? "#d0d5e0" : "#e8c8c4"}`,
                      borderRadius: 3, cursor: "pointer",
                    }}>{isOmitted ? "Include" : "Omit"}</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Findings Section ── */}
        <div ref={findingsRef} style={{
          padding: findingsSpotlight ? "16px 16px" : "12px 16px", borderRadius: 12,
          background: findingsSpotlight ? "linear-gradient(135deg, #f0f2ff 0%, #e8eaff 100%)" : "#f8f9fb",
          border: findingsSpotlight ? "1.5px solid #b8c4f5" : "1px solid #eceef2",
          transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
          boxShadow: findingsSpotlight ? "0 6px 28px rgba(79,109,245,0.12)" : "none",
          opacity: step >= 3 ? 1 : 0.15,
        }}>
          {/* Findings header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: findingsSpotlight ? 12 : 6 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center",
              background: findingsSpotlight ? "#4f6df5" : "#d0d5e0",
              transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
              transform: findingsSpotlight ? "scale(1)" : "scale(0.9)",
            }}>
              <span style={{ fontSize: 14, color: "#fff", fontWeight: 700 }}>!</span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: findingsSpotlight ? "#2a2e60" : "#5a5f6e", transition: "color 0.4s" }}>Findings</div>
              <div style={{ fontSize: 9.5, color: "#8a8f9e" }}>The atomic unit of improvement</div>
            </div>
            {findingsSpotlight && (
              <div style={{ marginLeft: "auto", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: "#4f6df520", color: "#4f6df5", animation: "snapIn 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>
                3 found
              </div>
            )}
          </div>

          {/* Findings list */}
          {findingsSpotlight && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, animation: "fadeUp 0.5s ease" }}>
              {findings.map((f, i) => (
                <div key={f.id} style={{
                  padding: findingsExpanded ? "12px 14px" : "8px 12px",
                  background: "#fff", borderRadius: 8,
                  border: `1px solid ${findingsExpanded ? f.sevColor + "40" : "#e0e3ea"}`,
                  transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                  animation: `fadeUp ${0.3 + i * 0.12}s ease`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: findingsExpanded ? 6 : 2 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: f.sevColor }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#1a1d23" }}>{f.title}</span>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 600, color: f.sevColor, background: f.sevColor + "15", padding: "1px 6px", borderRadius: 3 }}>{f.severity}</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: "#5a5f6e", lineHeight: 1.5 }}>{f.desc}</div>

                  {/* Expanded detail with graph */}
                  {findingsExpanded && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #f0f1f5", animation: "fadeUp 0.4s ease" }}>
                      <div style={{ fontSize: 10.5, color: "#3a3f4a", lineHeight: 1.55, marginBottom: 8 }}>{f.detail}</div>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 8.5, fontWeight: 600, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Completeness trend</div>
                          <MiniBarSpark data={f.sparkData} width={140} height={28} />
                        </div>
                        <div style={{ display: "flex", gap: 12 }}>
                          <div>
                            <div style={{ fontSize: 8.5, color: "#a0a8b8" }}>Affected</div>
                            <div style={{ fontSize: 10, fontWeight: 600, color: "#5a5f6e" }}>{f.affected}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 8.5, color: "#a0a8b8" }}>Impact</div>
                            <div style={{ fontSize: 10, fontWeight: 600, color: "#5a5f6e" }}>{f.impact}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!findingsSpotlight && (
            <div style={{ fontSize: 10.5, color: "#8a8f9e", lineHeight: 1.5 }}>Quality issues become actionable findings.</div>
          )}
        </div>

      </div>

      {/* ── Footer ── */}
      <div style={{
        padding: "12px 24px", borderTop: "1px solid #eceef2",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        opacity: footerVisible ? 1 : 0, transition: "opacity 0.4s ease",
        pointerEvents: footerVisible ? "auto" : "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: passColor }} />
          <span style={{ fontSize: 11, color: "#7a8194" }}>{included.length} of {fields.length} fields</span>
        </div>
        <button onClick={onAccept} style={btnD}>Looks good →</button>
      </div>
    </div>
  );
}

const ALL_TARGETS = [
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

function SingleTargetCard({target, index, total, onAccept, onSkip}){
  return (
    <div style={{...ps, width: 460, maxWidth: "90vw"}}>
      <div style={{padding:"20px 24px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:15,fontWeight:700,color:"#1a1d23"}}>{target.n}</div>
          <div style={{fontSize:11,color:"#a0a8b8",fontWeight:500}}>{index + 1} of {total}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <div style={{flex:1,textAlign:"center",padding:"10px 0",background:"#f7f8fa",borderRadius:8}}>
            <div style={{fontSize:9.5,fontWeight:700,color:"#a0a8b8",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:2}}>Current</div>
            <div style={{fontSize:18,fontWeight:700,color:"#1a1d23"}}>{target.b}</div>
          </div>
          <svg width="20" height="12" viewBox="0 0 20 12"><path d="M2 6h16M14 2l4 4-4 4" stroke="#4f6df5" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <div style={{flex:1,textAlign:"center",padding:"10px 0",background:"#f0f2ff",borderRadius:8,border:"1.5px solid #d8ddf5"}}>
            <div style={{fontSize:9.5,fontWeight:700,color:"#4f6df5",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:2}}>Target</div>
            <div style={{fontSize:18,fontWeight:700,color:"#4f6df5"}}>{target.t}</div>
          </div>
        </div>
      </div>
      <div style={{padding:"0 24px 16px"}}>
        <div style={{fontSize:12.5,color:"#3a3f4a",lineHeight:1.65,marginBottom:12}}>{target.why}</div>
        <div style={{padding:"10px 14px",background:"#f7f8fa",borderRadius:8,marginBottom:12,borderLeft:"3px solid #d0d5e0"}}>
          <div style={{fontSize:9.5,fontWeight:700,color:"#a0a8b8",textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:3}}>Industry benchmark</div>
          <div style={{fontSize:11.5,color:"#5a5f6e",lineHeight:1.55}}>{target.benchmark}</div>
        </div>
        <div style={{fontSize:11.5,color:"#7a8194",lineHeight:1.55}}>
          <span style={{fontWeight:600,color:"#5a5f6e"}}>How to get there: </span>{target.how}
        </div>
      </div>
      <div style={{padding:"14px 24px",borderTop:"1px solid #eceef2",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <button onClick={onSkip} style={{...btnG, color:"#a0a8b8", border:"none", fontSize:12}}>Skip this target</button>
        <button onClick={onAccept} style={btnD}>Accept target →</button>
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
function DocPanel({ data, onUpdate, onImproveScore, narrativeStep }) {
  if (!data) return null;
  // narrativeStep drives AI-guided spotlight:
  // 0 = panel appearing, header visible, rest dim
  // 1 = score bar spotlight — explain the percentage
  // 2 = gathering — sections fill in as answers come, score animates
  // 3 = mission spotlight — glow on mission statement
  // 4 = all visible (normal mode)
  const step = narrativeStep || 0;
  const scoreSpotlight = step === 1;
  const missionSpotlight = step === 3;
  const missionRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (step === 3 && missionRef.current && scrollRef.current) {
      setTimeout(() => {
        missionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [step]);

  return (
    <div style={{
      position: "absolute", top: 16, bottom: 16,
      right: "calc(50% + 250px)",
      width: "min(520px, calc(50% - 270px))", background: "#fff", borderRadius: 14,
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

      {/* Context Score Bar — with spotlight */}
      {data.contextScore != null && (
        <div style={{
          transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
          background: scoreSpotlight ? "linear-gradient(135deg, #f0f2ff 0%, #e8eaff 100%)" : "#fff",
          boxShadow: scoreSpotlight ? "inset 0 0 16px rgba(79,109,245,0.06)" : "none",
          transform: scoreSpotlight ? "scale(1.02)" : "scale(1)",
          borderRadius: scoreSpotlight ? "0 0 8px 8px" : "0",
        }}>
          <ContextScore score={data.contextScore} onImprove={step >= 4 ? onImproveScore : null} />
        </div>
      )}

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px 22px 32px" }}>
        {/* Explanation text — visible during early narrative */}
        {step >= 1 && step <= 2 && !data.description && (
          <div style={{
            padding: "12px 14px", background: "#f8f9fb", borderRadius: 9, border: "1px solid #eceef2",
            marginBottom: 18, animation: "fadeUp 0.4s ease",
          }}>
            <div style={{ fontSize: 11.5, color: "#5a5f6e", lineHeight: 1.6 }}>
              The context score reflects how well I understand your process. Each answer you give adds knowledge — the higher the score, the sharper my analysis and recommendations.
            </div>
          </div>
        )}

        {data.kpis && data.kpis.length > 0 && <div style={{
          marginBottom: 18, opacity: step >= 2 ? 1 : 0.15, transition: "opacity 0.5s ease",
        }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 5 }}>Key Indicators</div>
          {data.kpis.map((k, i) => (<div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < data.kpis.length - 1 ? "1px solid #f0f1f5" : "none" }}>
            <span style={{ fontSize: 12, color: "#5a5f6e" }}>{k.l}</span><span style={{ fontSize: 13, fontWeight: 600, color: "#3a3f4a" }}>{k.v}</span></div>))}</div>}

        {data.mission && <div ref={missionRef} style={{
          marginBottom: 18,
          opacity: step >= 3 ? 1 : 0.15, transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: "#4f6df5", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 5 }}>Mission Statement</div>
          <div style={{
            padding: missionSpotlight ? "16px 18px" : "12px 14px",
            background: missionSpotlight ? "linear-gradient(135deg, #f0f2ff 0%, #e8eaff 100%)" : "#f0f2ff",
            borderRadius: 9,
            border: missionSpotlight ? "1.5px solid #b8c4f5" : "1px solid #d8ddf5",
            boxShadow: missionSpotlight ? "0 6px 28px rgba(79,109,245,0.12)" : "none",
            transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
            transform: missionSpotlight ? "scale(1.02)" : "scale(1)",
          }}>
            <div style={{ fontSize: 13.5, color: "#2a2e60", lineHeight: 1.6, fontWeight: 500 }}>{data.mission}</div>
          </div>
        </div>}

        {data.description && <div style={{
          marginBottom: 18, opacity: step >= 2 ? 1 : 0.15, transition: "opacity 0.5s ease",
        }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 5 }}>Process Description</div>
          <div style={{ fontSize: 12.5, color: "#3a3f4a", lineHeight: 1.6 }}>{data.description}</div></div>}

        {data.fieldAnnotations && data.fieldAnnotations.length > 0 && <div style={{
          marginBottom: 18, opacity: step >= 2 ? 1 : 0.15, transition: "opacity 0.5s ease",
        }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 5 }}>Field Context</div>
          {data.fieldAnnotations.map((f, i) => (<div key={i} style={{ padding: "6px 10px", borderRadius: 5, marginBottom: 3, background: "#f8f9fb", borderLeft: "3px solid #a0a8b8", animation: "fadeUp 0.4s ease" }}>
            <div style={{ fontFamily: "monospace", fontSize: 11.5, color: "#5a5f6e", fontWeight: 600 }}>{f.field}</div>
            <div style={{ fontSize: 10.5, color: "#7a8194" }}>{f.meaning}</div></div>))}</div>}

        {data.hypotheses && data.hypotheses.length > 0 && <div style={{
          marginBottom: 18, opacity: step >= 2 ? 1 : 0.15, transition: "opacity 0.5s ease",
        }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 5 }}>Hypotheses</div>
          {data.hypotheses.map((h, i) => (<div key={i} style={{ padding: "8px 12px", background: "#faf8f0", borderRadius: 7, border: "1px solid #ede8d8", marginBottom: 4, animation: "fadeUp 0.4s ease" }}>
            <div style={{ fontSize: 12, color: "#5a5040", lineHeight: 1.5 }}>{h}</div></div>))}</div>}

        {data.goals && <div style={{
          marginBottom: 18, opacity: step >= 2 ? 1 : 0.15, transition: "opacity 0.5s ease",
        }}>
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
      position: "absolute", top: 16, bottom: 16,
      right: "calc(50% + 250px)",
      width: "min(520px, calc(50% - 270px))", background: "#fff", borderRadius: 14,
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
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1d23" }}>{g.n}</div>
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

/* ═══ MISSION CONTROL OVERLAY ═══ */
function MissionControlOverlay() {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#0e0f14", zIndex: 100,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      animation: "mcFadeIn 0.8s ease",
    }}>
      <div style={{ fontSize: 32, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>Mission Control</div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 12 }}>Coming soon</div>
    </div>
  );
}

/* ═══ CANVAS VIEW — full-screen process mining canvas ═══ */
/* ═══ SPARKLES ICON (inline SVG) ═══ */
const SparklesIcon = ({ size = 10, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1z" fill={color} />
    <path d="M12 0l.75 2.25L15 3l-2.25.75L12 6l-.75-2.25L9 3l2.25-.75L12 0z" fill={color} opacity="0.6" />
  </svg>
);

/* ═══ CANVAS CHAT RESPONSES ═══ */
const CANVAS_RESPONSES = [
  { match: /bottleneck|slow|delay/i, text: "Last Confirmation Print is the primary bottleneck -- 35,092 cases with 5.7d average duration. The Approved to Last Confirmation transition alone adds 2.3d. I'd recommend investigating the confirmation approval rules and whether manual steps can be automated." },
  { match: /rework|loop|repeat/i, text: "Two major rework patterns: (1) Approved self-loop -- 10,009 cases cycling back at 1.5d each, likely re-approvals after spec changes. (2) Blocked to Approved return -- 12,457 cases at 10.1h, suggesting blocked orders require re-approval. Together these add ~3.2 days to average throughput." },
  { match: /block/i, text: "24,435 cases pass through Blocked (68% of total). The Blocked self-loop (9,826 cases, 7.0h) suggests orders get stuck in repeated blocking cycles. The Blocked to Free return path is rare (15 cases) -- most blocked orders route back through Approved." },
  { match: /free|start|begin/i, text: "Free is the entry point for 97.9% of cases. Average duration is just 5.5h -- it's not a bottleneck itself. The main split: 84% flow to Approved (happy path), 16% route directly to Blocked." },
  { match: /approv/i, text: "Approved handles 52,107 cases with 2.0d average duration. The self-loop (10,009 cases, 1.5d) is significant -- orders cycling back for re-approval. This is likely driven by specification changes or vendor modifications after initial approval." },
  { match: /improv|fix|recommend|action/i, text: "Based on the context, I'd prioritize: (1) Automate the Last Confirmation Print step where possible -- 5.7d is excessive. (2) Reduce Approved self-loops by catching spec changes earlier. (3) Investigate why 16% of orders go directly to Blocked from Free." },
];
const CANVAS_DEFAULT_RESPONSE = "I can see the items you've selected. Try asking about bottlenecks, rework loops, blocked orders, or what improvements I'd recommend.";

function CanvasView() {
  const [aiContext, setAiContext] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [hasNotified, setHasNotified] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [aiTyping, setAiTyping] = useState(false);
  const chatEndRef = useRef(null);

  const addContext = (item) => {
    setAiContext(prev => {
      const key = item.type === "node" ? item.label : item.id;
      if (prev.some(p => (p.type === "node" ? p.label : p.id) === key)) return prev;
      return [...prev, item];
    });
    if (!chatOpen) { setChatOpen(true); setHasNotified(true); }
  };

  const sendChat = () => {
    const text = chatInput.trim();
    if (!text || aiTyping) return;
    setChatMessages(prev => [...prev, { role: "user", text }]);
    setChatInput("");
    setAiTyping(true);
    setTimeout(() => {
      const match = CANVAS_RESPONSES.find(r => r.match.test(text));
      setChatMessages(prev => [...prev, { role: "ai", text: match ? match.text : CANVAS_DEFAULT_RESPONSE }]);
      setAiTyping(false);
    }, 800);
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages, aiTyping]);

  const nodes = [
    { id: "start", label: "Start", x: 380, y: 20, w: 56, type: "circle" },
    { id: "free", label: "Free", x: 290, y: 100, w: 180, h: 60, count: 35088, avgDuration: "5.5h", isBackbone: true, color: "rgba(99,102,241,0.12)", borderColor: "rgba(99,102,241,0.35)" },
    { id: "approved", label: "Approved", x: 310, y: 230, w: 180, h: 60, count: 52107, avgDuration: "2.0d", isBackbone: true, color: "rgba(99,102,241,0.18)", borderColor: "rgba(99,102,241,0.45)" },
    { id: "last_conf", label: "Last Confirmation Print", x: 260, y: 370, w: 200, h: 60, count: 35092, avgDuration: "5.7d", isBackbone: true, bottleneck: true, color: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.5)" },
    { id: "blocked", label: "Blocked", x: 150, y: 500, w: 180, h: 60, count: 24435, avgDuration: "13.5h", color: "#f8fafc", borderColor: "#e2e8f0" },
    { id: "end", label: "End", x: 330, y: 620, w: 56, type: "circle" },
  ];

  const edges = [
    { from: 0, to: 1, count: 35047, avgDuration: "" },
    { from: 1, to: 2, count: 29557, avgDuration: "5.2h", isBackbone: true },
    { from: 2, to: 3, count: 34490, avgDuration: "2.3d", isBackbone: true, isBottleneck: true },
    { from: 3, to: 5, count: 33473, avgDuration: "" },
    { from: 1, to: 4, count: 5475, avgDuration: "6.8h" },
    { from: 4, to: 2, count: 12457, avgDuration: "10.1h" },
    { from: 2, to: 4, count: 6790, avgDuration: "1.1d" },
    { from: 4, to: 3, count: 570, avgDuration: "8.3d", isBottleneck: true },
    { from: 3, to: 4, count: 1535, avgDuration: "5.9d", isBottleneck: true, rework: true },
    { from: 3, to: 2, count: 84, avgDuration: "1.4d", rework: true },
    { from: 2, to: 2, count: 10009, avgDuration: "1.5d", isBottleneck: true, selfLoop: true },
    { from: 4, to: 4, count: 9826, avgDuration: "7.0h", selfLoop: true },
  ];

  const kpis = [
    { l: "Cases", v: "35,856" },
    { l: "Events", v: "893,207" },
    { l: "Activities", v: "4" },
    { l: "Conformance", v: "72.45%" },
    { l: "Throughput", v: "7.05d" },
  ];

  const variantData = [
    { l: "Variant 1", v: 3492, hl: true }, { l: "Variant 2", v: 520, hl: true },
    { l: "Variant 3", v: 328 }, { l: "Variant 5", v: 104 },
    { l: "Variant 10", v: 72 }, { l: "Variant 4", v: 41 },
  ];
  const holdData = [
    { l: "180", v: 73, hl: true }, { l: "250", v: 54, hl: true },
    { l: "300", v: 34 }, { l: "221", v: 27 },
    { l: "290", v: 13 }, { l: "270", v: 10 },
  ];
  const releaseData = [
    { l: "Soft Released", v: 167, hl: true }, { l: "Firm Released", v: 72 }, { l: "Blocked", v: 8 },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", animation: "canvasEnter 0.7s cubic-bezier(0.16,1,0.3,1)" }}>
      {/* Top filter bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 20px", borderBottom: "1px solid #e8ebf0", background: "#fff", flexShrink: 0, zIndex: 5,
        animation: "slideInDown 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", background: "#f0f2f5", borderRadius: 6, fontSize: 11, color: "#5a5f6e", fontWeight: 500 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1.5 3h9M3 1.5v1.5M9 1.5v1.5M1.5 5.25h9v4.5a.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75v-4.5z" stroke="#8a8f9e" strokeWidth="0.9"/></svg>
            Period
          </div>
          <div style={{ fontSize: 11, color: "#7a8194" }}>Mar 20, 2025 - Mar 20, 2026</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", background: "#f0f2f5", borderRadius: 6, fontSize: 11, color: "#5a5f6e", fontWeight: 500 }}>
            sales_office
          </div>
          <div style={{ fontSize: 11, color: "#7a8194" }}>1/30</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {kpis.map((k, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "#a0a8b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{k.l}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1d23" }}>{k.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {/* Left sidebar — supporting information */}
        <div style={{
          width: 310, flexShrink: 0, borderRight: "1px solid #e8ebf0", background: "#fff",
          overflowY: "auto", padding: "16px 18px",
          animation: "slideInLeft 0.5s cubic-bezier(0.16,1,0.3,1) 0.2s both",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>Supporting information</div>
            <div style={{ display: "flex", gap: 4 }}>
              <div style={{ width: 20, height: 20, borderRadius: 4, border: "1px solid #e2e5ea", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#a0a8b8", cursor: "pointer" }}>^</div>
              <div style={{ width: 20, height: 20, borderRadius: 4, border: "1px solid #e2e5ea", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#a0a8b8", cursor: "pointer" }}>+</div>
            </div>
          </div>

          {/* Frequency by variant name */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: "#3a3f4a" }}>Frequency by variant name</div>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 4l3 3 3-3" stroke="#a0a8b8" strokeWidth="1.2"/></svg>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 9, color: "#a0a8b8", justifyContent: "flex-end" }}>
              <span>#</span><span style={{ opacity: 0.5 }}>|</span>
            </div>
            {variantData.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <div style={{ width: `${(d.v / 3492) * 100}%`, minWidth: 4, height: 18, background: d.hl ? "#7bc67e" : "#e0e2e8", borderRadius: 3, display: "flex", alignItems: "center", paddingLeft: 6 }}>
                  <span style={{ fontSize: 9.5, color: "#fff", fontWeight: 600, whiteSpace: "nowrap" }}>{d.l}</span>
                </div>
                <span style={{ fontSize: 10, color: "#7a8194", fontWeight: 500, flexShrink: 0 }}>{d.v.toLocaleString()}</span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 10, color: "#7a8194" }}>
              <span>Performance indicator</span>
              <span style={{ fontWeight: 600 }}>6.83 m.</span>
              <div style={{ flex: 1, height: 4, background: "#e0e2e8", borderRadius: 2, position: "relative" }}>
                <div style={{ width: "65%", height: "100%", background: "#4f6df5", borderRadius: 2 }} />
              </div>
              <span style={{ fontWeight: 600 }}>292.39 d.</span>
            </div>
          </div>

          {/* Frequency by blocked hold reason code */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: "#3a3f4a" }}>Frequency by blocked hold reason code</div>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 4l3 3 3-3" stroke="#a0a8b8" strokeWidth="1.2"/></svg>
            </div>
            {holdData.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <div style={{ width: `${(d.v / 73) * 100}%`, minWidth: 4, height: 18, background: d.hl ? "#7bc67e" : "#e0e2e8", borderRadius: 3, display: "flex", alignItems: "center", paddingLeft: 6 }}>
                  <span style={{ fontSize: 9.5, color: "#fff", fontWeight: 600, whiteSpace: "nowrap" }}>{d.l}</span>
                </div>
                <span style={{ fontSize: 10, color: "#7a8194", fontWeight: 500, flexShrink: 0 }}>{d.v}</span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 10, color: "#7a8194" }}>
              <span>Performance indicator</span>
              <span style={{ fontWeight: 600 }}>0</span>
              <div style={{ flex: 1, height: 4, background: "#e0e2e8", borderRadius: 2, position: "relative" }}>
                <div style={{ width: "45%", height: "100%", background: "#4f6df5", borderRadius: 2 }} />
              </div>
              <span style={{ fontWeight: 600 }}>155.78 d.</span>
            </div>
          </div>

          {/* Frequency by release type */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: "#3a3f4a" }}>Frequency by release type</div>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 4l3 3 3-3" stroke="#a0a8b8" strokeWidth="1.2"/></svg>
            </div>
            {releaseData.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <div style={{ width: `${(d.v / 167) * 100}%`, minWidth: 4, height: 18, background: d.hl ? "#7bc67e" : "#e0e2e8", borderRadius: 3, display: "flex", alignItems: "center", paddingLeft: 6 }}>
                  <span style={{ fontSize: 9.5, color: "#fff", fontWeight: 600, whiteSpace: "nowrap" }}>{d.l}</span>
                </div>
                <span style={{ fontSize: 10, color: "#7a8194", fontWeight: 500, flexShrink: 0 }}>{d.v}</span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 10, color: "#7a8194" }}>
              <span>Performance indicator</span>
              <span style={{ fontWeight: 600 }}>0 m.</span>
              <div style={{ flex: 1, height: 4, background: "#e0e2e8", borderRadius: 2, position: "relative" }}>
                <div style={{ width: "85%", height: "100%", background: "#4f6df5", borderRadius: 2 }} />
              </div>
              <span style={{ fontWeight: 600 }}>2.68 d.</span>
            </div>
          </div>
        </div>

        {/* Center — Process DAG */}
        <div style={{ flex: 1, position: "relative", background: "#fafbfc", overflow: "auto" }}>
          <div style={{ position: "relative", width: 720, height: 700, margin: "20px auto", animation: "canvasEnter 0.6s cubic-bezier(0.16,1,0.3,1) 0.3s both" }}>
            <svg width="720" height="700" viewBox="0 0 720 700" style={{ position: "absolute", inset: 0 }}>
              {/* Edges (lines only — labels rendered as HTML overlays) */}
              {edges.map((e, i) => {
                if (e.selfLoop) return null;
                const a = nodes[e.from], b = nodes[e.to];
                const aw = a.w || 56, ah = a.h || (a.type === "circle" ? 28 : 60);
                const bw = b.w || 56, bh = b.h || (b.type === "circle" ? 28 : 60);
                const ax = a.x + aw / 2, ay = a.y + ah;
                const bx = b.x + bw / 2, by = b.y;
                const stroke = e.isBottleneck ? "#f87171" : e.isBackbone ? "#94a3b8" : "#cbd5e1";
                const sw = e.isBackbone ? 2.5 : e.isBottleneck ? 2 : 1.5;
                if (e.rework) {
                  const cx = Math.max(ax, bx) + 90;
                  return <path key={`e${i}`} d={`M${ax},${ay} C${cx},${ay} ${cx},${by} ${bx},${by}`}
                    fill="none" stroke={stroke} strokeWidth={sw} strokeDasharray="6 4" opacity="0.7"
                    markerEnd="url(#arrowRed)" />;
                }
                return <g key={`e${i}`}>
                  <line x1={ax} y1={ay} x2={bx} y2={by} stroke={stroke} strokeWidth={sw} />
                  <polygon points={`${(ax+bx)/2-4},${(ay+by)/2-3} ${(ax+bx)/2+4},${(ay+by)/2-3} ${(ax+bx)/2},${(ay+by)/2+4}`} fill={stroke} />
                </g>;
              })}
              {/* Self-loop arcs */}
              {edges.map((e, i) => {
                if (!e.selfLoop) return null;
                const n = nodes[e.from];
                const nx = n.x + (n.w || 56), ny = n.y + (n.h || 60) / 2;
                const stroke = e.isBottleneck ? "#f87171" : "#c4b5fd";
                return <path key={`sl${i}`} d={`M${nx},${ny - 14} h22 a18,18 0 0 1 18,18 v0 a18,18 0 0 1 -18,18 h-22`}
                  fill="none" stroke={stroke} strokeWidth="2" markerEnd={e.isBottleneck ? "url(#arrowRed)" : "url(#arrowPurple)"} />;
              })}
              {/* Arrow markers */}
              <defs>
                <marker id="arrowRed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#f87171" />
                </marker>
                <marker id="arrowPurple" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#c4b5fd" />
                </marker>
              </defs>
            </svg>

            {/* Edge label pills (HTML overlays) */}
            {edges.map((e, i) => {
              if (!e.count || e.from === 0) return null;
              const a = nodes[e.from], b = nodes[e.to];
              let px, py;
              if (e.selfLoop) {
                px = a.x + (a.w || 56) + 58;
                py = a.y + (a.h || 60) / 2;
              } else if (e.rework) {
                const ax2 = a.x + (a.w || 56) / 2, ay2 = a.y + (a.h || 60);
                const bx2 = b.x + (b.w || 56) / 2, by2 = b.y;
                px = Math.max(ax2, bx2) + 80;
                py = (ay2 + by2) / 2;
              } else {
                const ax2 = a.x + (a.w || 56) / 2, ay2 = a.y + (a.h || 60);
                const bx2 = b.x + (b.w || 56) / 2, by2 = b.y;
                px = (ax2 + bx2) / 2 + 14;
                py = (ay2 + by2) / 2 - 4;
              }
              const edgeId = `${nodes[e.from].label} > ${nodes[e.to].label}`;
              const isHovered = hoveredEdge === i;
              return (
                <div key={`ep${i}`}
                  onMouseEnter={() => setHoveredEdge(i)} onMouseLeave={() => setHoveredEdge(null)}
                  style={{
                    position: "absolute", left: px, top: py, transform: "translate(-50%, -50%)",
                    display: "flex", alignItems: "center", gap: 4,
                    background: e.isBottleneck ? "#fef2f2" : "#fff",
                    border: `1px solid ${e.isBottleneck ? "#fecaca" : "#e5e7eb"}`,
                    borderRadius: 8, padding: "3px 8px", fontSize: 10, fontWeight: 500,
                    color: e.isBottleneck ? "#991b1b" : "#64748b",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)", cursor: "default", whiteSpace: "nowrap",
                    zIndex: isHovered ? 20 : 2,
                  }}>
                  {e.isBottleneck && <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><path d="M8 1L1 14h14L8 1z" stroke="#dc2626" strokeWidth="1.5" fill="none"/><line x1="8" y1="6" x2="8" y2="10" stroke="#dc2626" strokeWidth="1.5"/><circle cx="8" cy="12" r="0.8" fill="#dc2626"/></svg>}
                  <span># {e.count.toLocaleString()}</span>
                  {e.avgDuration && <span style={{ color: e.isBottleneck ? "#dc2626" : "#94a3b8" }}>{e.avgDuration}</span>}
                  {isHovered && (
                    <button onClick={(ev) => { ev.stopPropagation(); addContext({ type: "edge", id: edgeId, label: edgeId, count: e.count, avgDuration: e.avgDuration, severity: e.isBottleneck ? "bottleneck" : "none" }); }}
                      style={{
                        position: "absolute", top: -7, right: -7, width: 18, height: 18, borderRadius: "50%",
                        background: "#6366f1", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", boxShadow: "0 2px 6px rgba(99,102,241,0.3)", padding: 0,
                        animation: "sparkleAppear 0.15s ease",
                      }} title="Add to AI context">
                      <SparklesIcon size={8} />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Activity nodes (HTML overlays with hover sparkles) */}
            {nodes.map((n, i) => {
              if (n.type === "circle") {
                return (
                  <div key={`n${i}`} style={{
                    position: "absolute", left: n.x, top: n.y, width: 56, height: 56,
                    borderRadius: "50%", background: "#1e293b", border: "3px solid #334155",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", letterSpacing: "0.8px", textTransform: "uppercase" }}>{n.label}</span>
                  </div>
                );
              }
              const isHovered = hoveredNode === i;
              return (
                <div key={`n${i}`}
                  onMouseEnter={() => setHoveredNode(i)} onMouseLeave={() => setHoveredNode(null)}
                  style={{
                    position: "absolute", left: n.x, top: n.y, width: n.w, height: n.h || 60,
                    background: n.color || "#f8fafc",
                    border: `2px solid ${n.borderColor || "#e2e8f0"}`,
                    borderRadius: 10, padding: "10px 14px",
                    boxShadow: isHovered ? "0 4px 16px rgba(0,0,0,0.1)" : "0 1px 3px rgba(0,0,0,0.05)",
                    cursor: "default", transition: "box-shadow 0.15s ease",
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                    {n.bottleneck && <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 1L1 14h14L8 1z" stroke="#dc2626" strokeWidth="1.5" fill="none"/><line x1="8" y1="6" x2="8" y2="10" stroke="#dc2626" strokeWidth="1.5"/><circle cx="8" cy="12" r="0.8" fill="#dc2626"/></svg>}
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: n.bottleneck ? "#991b1b" : "#1e293b", lineHeight: "16px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "#64748b", fontWeight: 500 }}>
                    <span># {n.count.toLocaleString()}</span>
                    {n.avgDuration && <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="#94a3b8" strokeWidth="1.3"/><path d="M8 4.5V8l2.5 1.5" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round"/></svg>
                      {n.avgDuration}
                    </span>}
                  </div>
                  {isHovered && (
                    <button onClick={(ev) => { ev.stopPropagation(); addContext({ type: "node", label: n.label, count: n.count, avgDuration: n.avgDuration, severity: n.bottleneck ? "bottleneck" : "none" }); }}
                      style={{
                        position: "absolute", top: -9, right: -9, width: 24, height: 24, borderRadius: "50%",
                        background: "#6366f1", border: "2.5px solid #fff", display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", boxShadow: "0 2px 8px rgba(99,102,241,0.35)", padding: 0, zIndex: 10,
                        animation: "sparkleAppear 0.15s ease",
                      }} title="Add to AI context">
                      <SparklesIcon size={11} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Zoom controls */}
          <div style={{ position: "absolute", left: 20, bottom: 20, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fff", border: "1px solid #e2e5ea", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#5a5f6e", cursor: "pointer" }}>+</div>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fff", border: "1px solid #e2e5ea", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#5a5f6e", cursor: "pointer" }}>-</div>
          </div>
        </div>

        {/* Right — AI Chat Panel */}
        {!chatOpen ? (
          <div onClick={() => { setChatOpen(true); setHasNotified(true); }}
            style={{
              width: 48, flexShrink: 0, background: "#fff", borderLeft: "1px solid #e8ebf0",
              display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 16,
              cursor: "pointer", position: "relative",
              animation: "slideInLeft 0.4s cubic-bezier(0.16,1,0.3,1) 0.4s both",
            }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <SparklesIcon size={14} color="#6366f1" />
              </div>
              {!hasNotified && (
                <div style={{
                  position: "absolute", top: -3, right: -3, width: 10, height: 10, borderRadius: "50%",
                  background: "#6366f1", border: "2px solid #fff",
                  animation: "notifyPulse 2s ease infinite, notifyShake 0.5s ease 3s infinite",
                }} />
              )}
            </div>
            <div style={{ writingMode: "vertical-rl", fontSize: 11, color: "#94a3b8", fontWeight: 500, marginTop: 12, letterSpacing: "0.3px" }}>AI Context</div>
          </div>
        ) : (
          <div style={{
            width: 340, flexShrink: 0, background: "#fff", borderLeft: "1px solid #e8ebf0",
            display: "flex", flexDirection: "column", animation: "chatSlideIn 0.3s ease",
          }}>
            {/* Chat header */}
            <div style={{ padding: "12px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <SparklesIcon size={12} color="#6366f1" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>AI Context</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{aiContext.length} item{aiContext.length !== 1 ? "s" : ""} selected</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {aiContext.length > 0 && (
                  <button onClick={() => setAiContext([])} style={{ fontSize: 11, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", padding: "4px 6px" }}>Clear all</button>
                )}
                <button onClick={() => setChatOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#94a3b8", display: "flex" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 5l-4 4M5 5l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
              </div>
            </div>

            {/* Context items */}
            {aiContext.length > 0 && (
              <div style={{ padding: "8px 10px", maxHeight: 180, overflowY: "auto", borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}>
                {aiContext.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", borderRadius: 8, marginBottom: 4, background: "#f8fafc", fontSize: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: item.type === "node" ? "#6366f1" : "#0ea5e9", letterSpacing: "0.5px", flexShrink: 0 }}>{item.type}</span>
                      <span style={{ color: "#334155", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
                      {item.severity === "bottleneck" && <span style={{ fontSize: 9, fontWeight: 600, padding: "1px 5px", borderRadius: 3, background: "#fef2f2", color: "#dc2626", flexShrink: 0 }}>bottleneck</span>}
                    </div>
                    <button onClick={() => setAiContext(prev => prev.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "#cbd5e1", display: "flex", flexShrink: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Chat messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Welcome message */}
              <div style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: "4px 12px 12px 12px", fontSize: 12, color: "#475569", lineHeight: 1.6, maxWidth: "90%" }}>
                Click the sparkle icon on any node or edge to add it as context. Then ask me questions about bottlenecks, rework patterns, or improvement opportunities.
              </div>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    padding: "10px 12px", borderRadius: msg.role === "user" ? "12px 12px 4px 12px" : "4px 12px 12px 12px",
                    background: msg.role === "user" ? "#6366f1" : "#f8fafc",
                    color: msg.role === "user" ? "#fff" : "#475569",
                    fontSize: 12, lineHeight: 1.6, maxWidth: "85%",
                  }}>{msg.text}</div>
                </div>
              ))}
              {aiTyping && (
                <div style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: "4px 12px 12px 12px", fontSize: 12, color: "#94a3b8", maxWidth: "90%" }}>
                  <span style={{ animation: "notifyPulse 1s ease infinite" }}>Thinking...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat input */}
            <div style={{ padding: "10px 12px", borderTop: "1px solid #f1f5f9", flexShrink: 0 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", background: "#f8fafc", borderRadius: 10, padding: "8px 12px", border: "1px solid #e2e8f0" }}>
                <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") sendChat(); }}
                  placeholder="Ask about selected items..."
                  style={{ flex: 1, border: "none", background: "none", outline: "none", fontSize: 12, color: "#334155" }} />
                <button onClick={sendChat} style={{
                  width: 28, height: 28, borderRadius: 8, background: chatInput.trim() ? "#6366f1" : "#e2e8f0",
                  border: "none", display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: chatInput.trim() ? "pointer" : "default", transition: "background 0.15s ease", flexShrink: 0,
                }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M1 8h14M10 3l5 5-5 5" stroke={chatInput.trim() ? "#fff" : "#94a3b8"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div style={{
        padding: "6px 20px", borderTop: "1px solid #e8ebf0", background: "#fff", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10, color: "#a0a8b8",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>35.9K cases</span>
          <span>893K events</span>
          <div style={{ width: 60, height: 6, background: "linear-gradient(90deg, #f0f2f5, #6366f1)", borderRadius: 3 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span>69%</span>
          <div style={{ display: "flex", gap: 4 }}>
            {["[]", ">>", "v"].map((s, i) => (
              <div key={i} style={{ width: 24, height: 24, borderRadius: 4, border: "1px solid #e2e5ea", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#a0a8b8", cursor: "pointer" }}>{s}</div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", background: "#f0f2f5", borderRadius: 6, fontSize: 11, color: "#5a5f6e" }}>
            Cases
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ JUNCTION PANEL ═══ */
function JunctionPanel({ onSelect, goals }) {
  const goalFindings = [
    { goalIdx: 1, severity: "Critical", sevColor: "#c43030", label: "Lower rework rate",
      finding: "52% Confirmed Changed loop — 3 sites above 60% rework rate" },
    { goalIdx: 0, severity: "High", sevColor: "#d4685a", label: "Reduce throughput time",
      finding: "Approval bottleneck accounts for 22% of total cycle time" },
    { goalIdx: 3, severity: "High", sevColor: "#d4685a", label: "Increase conformance",
      finding: "1,167 of 1,175 variants cover only 30% of cases" },
    { goalIdx: 2, severity: "Medium", sevColor: "#e8b84a", label: "Improve data quality",
      finding: "item_signal 95% null, selection_code 42% null" },
  ];

  const hoverIn = (e) => { e.currentTarget.style.borderColor = "#c0c5d0"; e.currentTarget.style.transform = "translateY(-1px)"; };
  const hoverOut = (e) => { e.currentTarget.style.borderColor = "#e8ebf0"; e.currentTarget.style.transform = "translateY(0)"; };

  return (
    <div style={{ ...ps, width: 480, maxHeight: "85vh" }}>
      <div style={{ padding: "20px 22px 0" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1d23", marginBottom: 4 }}>What's next?</div>
        <div style={{ fontSize: 12, color: "#8a8f9e", marginBottom: 16, lineHeight: 1.5 }}>
          Choose how you'd like to continue.
        </div>
      </div>
      <div style={{ padding: "0 22px 16px", overflowY: "auto", maxHeight: "62vh" }}>
        {/* Option 1: Tour */}
        <button onClick={() => onSelect("tour")} style={{
          width: "100%", padding: "14px 16px", marginBottom: 8,
          background: "#fff", border: "1.5px solid #e8ebf0", borderRadius: 10,
          cursor: "pointer", textAlign: "left", transition: "all 0.15s",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#1a1d23", marginBottom: 3 }}>Take a tour of Namuda</div>
            <div style={{ fontSize: 11.5, color: "#7a8194", lineHeight: 1.5 }}>See how Mission Control works — a guided walkthrough of the platform.</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginLeft: 12 }}><path d="M6 4l4 4-4 4" stroke="#a0a8b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        {/* Option 2: Canvas — featured */}
        <button onClick={() => onSelect("canvas")} style={{
          width: "100%", padding: "16px 18px", marginBottom: 10,
          background: "linear-gradient(135deg, #f0f2ff 0%, #e8eaff 100%)",
          border: "1.5px solid #d0d5f5", borderRadius: 12, cursor: "pointer",
          textAlign: "left", display: "flex", gap: 14, alignItems: "center",
          transition: "all 0.15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#4f6df5"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#d0d5f5"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
            <rect x="4" y="2" width="24" height="8" rx="3" fill="#b080d0" opacity="0.6"/>
            <rect x="8" y="14" width="20" height="6" rx="2.5" fill="#e8a0b8" opacity="0.6"/>
            <rect x="2" y="24" width="16" height="6" rx="2.5" fill="#e0c8c0" opacity="0.6"/>
            <line x1="16" y1="10" x2="18" y2="14" stroke="#c0c5d0" strokeWidth="1"/>
            <line x1="18" y1="20" x2="10" y2="24" stroke="#c0c5d0" strokeWidth="1"/>
            <path d="M26 17 C32 17 32 11 24 8" stroke="#d0a0a0" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.6"/>
          </svg>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#2a2e60", marginBottom: 3 }}>Explore process in canvas</div>
            <div style={{ fontSize: 12, color: "#5a5f8a", lineHeight: 1.5 }}>
              See every path, bottleneck, and rework loop — fully visualized with filters and analytics.
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><path d="M6 4l4 4-4 4" stroke="#4f6df5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        {/* Option 3: Start improving — with ranked goals */}
        <div style={{ fontSize: 9.5, fontWeight: 700, color: "#a0a8b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8, marginTop: 6 }}>Start improving</div>
        <div style={{ fontSize: 11.5, color: "#7a8194", lineHeight: 1.5, marginBottom: 10 }}>
          Jump into findings ranked by severity and start working on improvements.
        </div>
        {goalFindings.map((gf, i) => (
          <button key={i} onClick={() => onSelect(`goal-${gf.goalIdx}`)} style={{
            width: "100%", padding: "12px 14px", marginBottom: 6,
            background: "#fff", border: "1.5px solid #e8ebf0", borderRadius: 9,
            cursor: "pointer", textAlign: "left", transition: "all 0.15s",
          }} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 700, color: "#fff", background: gf.sevColor,
                }}>{i + 1}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{gf.label}</div>
              </div>
              <div style={{
                padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600,
                background: gf.severity === "Critical" ? "#fde8e8" : gf.severity === "High" ? "#fef3e8" : "#f0f2f5",
                color: gf.sevColor,
              }}>{gf.severity}</div>
            </div>
            <div style={{ fontSize: 11.5, color: "#6a7086", lineHeight: 1.5, marginLeft: 26 }}>{gf.finding}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══ PROCESS TEASER ═══ */
function ProcessTeaser({ onClose, inline }) {
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
      ...(inline ? { width: "100%", maxWidth: 360 } : { position: "absolute", top: 16, right: 16, bottom: 16, width: 320 }),
      background: inline ? "#fff" : "transparent", borderRadius: 14,
      border: "1px solid rgba(160,168,184,0.2)",
      boxShadow: inline ? "0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)" : "none",
      display: "flex", flexDirection: "column",
      animation: inline ? "none" : "docIn 0.6s cubic-bezier(0.16,1,0.3,1)",
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
  { id: "fields", label: "Field mapping", phases: ["core-fields", "core-fields-reveal", "fields"] },
  { id: "profile", label: "Data quality", phases: ["data-profile"] },
  { id: "context", label: "Process context", phases: ["fact-gathering", "mission-review"] },
  { id: "review", label: "Review context", phases: ["review"] },
  { id: "goals", label: "Set goals", phases: ["pre-goals", "goals"] },
  { id: "targets", label: "Set targets", phases: ["targets"] },
  { id: "junction", label: "What's next", phases: ["junction"] },
  { id: "done", label: "Explore", phases: ["done", "tour", "canvas", "goal-dive"] },
];

function StepMap({ phase, onJump, fieldProgress }) {
  const currentIdx = steps.findIndex(s => s.phases.includes(phase));
  const isFieldPhase = phase === "core-fields" || phase === "core-fields-reveal" || phase === "fields";
  const coreFieldsDone = phase === "fields" || phase === "core-fields-reveal";
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
  const [targetIdx, setTargetIdx] = useState(0);
  const [activeTargets, setActiveTargets] = useState([]); // target indices matching selected goals
  const [acceptedTargets, setAcceptedTargets] = useState([]); // targets confirmed by user
  const [showProcessTeaser, setShowProcessTeaser] = useState(false);
  const [showCenterProcess, setShowCenterProcess] = useState(false);
  const [centerProcessFading, setCenterProcessFading] = useState(false);
  const [dqNarrativeStep, setDqNarrativeStep] = useState(0);
  const [ctxNarrativeStep, setCtxNarrativeStep] = useState(0);
  const [canvasTransitionPhase, setCanvasTransitionPhase] = useState(null);
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
      setCtxNarrativeStep(4);
      setBlobText("Please review the process context, and we will move one step closer to improvements!");
      setPhase("review");
    });
  };

  const goToMissionReview = () => {
    const proposedMission = "To have an efficient purchasing process that is uniform across all sales offices.";
    setDocData(prev => ({ ...prev, mission: proposedMission }));
    bumpScore(5);

    // Step 3: Spotlight on mission statement
    setCtxNarrativeStep(3);
    setBlobText("Based on what you've told me, I can now propose a mission statement.");

    setTimeout(() => {
      setBlobText(`The mission statement embodies the vision and direction of improvement for the process. We will later split it into actionable goals to be reached.\n\n"${proposedMission}"\n\nDoes my suggestion resonate with you, or should we change something?`);
      setPhase("mission-review");
    }, 2500);
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
      setTimeout(() => { setBlob("waiting"); setBlobText("Take a look at the data quality panel — I'm walking you through it. Click 'Looks good' when ready."); }, 500);

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
      setTimeout(() => { setBlob("waiting"); setBlobText("Review the target and accept or skip it. We'll go through them one by one."); }, 500);

    } else if (phase === "junction") {
      setBlob("thinking");
      setTimeout(() => { setBlob("waiting"); setBlobText("Pick from the options — or tell me what you'd like to explore."); }, 500);

    } else if (phase === "tour" || phase === "canvas") {
      // No text input handling for these phases
    } else if (phase === "done" || phase === "goal-dive") {
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
      setBlobText("Process mining works with just 3 columns. Let me show you how they build a process map — step by step.");
      setPhase("core-fields");
    });
  };

  const acceptCoreFields = () => {
    // Phase 1: Card fades out (handled by CoreFieldsEducation), show "Great!"
    setPhase("core-fields-reveal");
    setBlobText("Great, now I can see the process!");
    // Phase 2: Process map emerges in center after a beat
    setTimeout(() => {
      setShowCenterProcess(true);
    }, 800);
    // Phase 3: After viewing, blob reacts
    setTimeout(() => {
      setBlobText("Woa, a lot to unpack and improve here!");
    }, 3200);
    // Phase 4: "But wait, need more context"
    setTimeout(() => {
      setBlobText("But wait — I need a bit more context to really get this going.");
    }, 5500);
    // Phase 5: Fade out process map, transition to field mapping
    setTimeout(() => {
      setCenterProcessFading(true);
    }, 7500);
    setTimeout(() => {
      setShowCenterProcess(false);
      setCenterProcessFading(false);
      setBlobText("Let's review the dimension fields together — confirming their meaning helps me interpret patterns correctly.");
      setPhase("fields");
    }, 8200);
  };

  const acceptProfile = () => {
    setPanel(null);
    setShowProcessTeaser(true);
    setCtxNarrativeStep(0);
    setDocData({
      processName: "Purchase-to-Receive", processType: "Procurement", contextScore: 0,
    });

    // Step 0: Introduce the panel
    setBlobText("Excellent — your data is ready. Now let's build the Process Context.\n\nThis is the intelligence layer that turns raw data into actionable insights.");

    // Step 1: Spotlight on context score bar after 2.5s
    setTimeout(() => {
      setCtxNarrativeStep(1);
      setBlobText("See this progress bar? It reflects how well I understand your process.\n\nRight now it's at 0% — every answer you give adds knowledge. The higher the score, the sharper my analysis and recommendations will be.");
    }, 2500);

    // Step 2: Start gathering after 7s
    setTimeout(() => {
      setCtxNarrativeStep(2);
      setBlobText("Let's start building that understanding. I'll ask a few questions — say 'skip' anytime.");
      setTimeout(() => {
        setBlobText(factQs[0].q);
        setQIdx(0);
        setPhase("fact-gathering");
      }, 2000);
    }, 7000);
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
    setDqNarrativeStep(0);
    setTimeout(() => {
      setBlob("waiting");
      // Step 0: Panel appears, blob introduces
      setBlobText("This is the data quality report for your data.");
      setPanel("data-profile"); setPhase("data-profile");

      // Step 1: Spotlight score ring after 2s
      setTimeout(() => {
        setDqNarrativeStep(1);
      }, 2000);

      // Blob reacts to score after 3.5s
      setTimeout(() => {
        setBlobText("Great, it's a pass! Please review the fields to include.\n\nFields with low quality should be excluded.");
      }, 3500);

      // Step 2: Reveal fields after 5s
      setTimeout(() => {
        setDqNarrativeStep(2);
      }, 5000);

      // Step 3: Findings intro after 9s — list appears
      setTimeout(() => {
        setBlobText("Now let me introduce the concept of Findings.\n\nFindings are the lifeforce of improvement in Namuda.");
        setDqNarrativeStep(3);
      }, 9000);

      // Blob encourages user to explore after 12s
      setTimeout(() => {
        setBlobText("Here are the findings related to data quality. Click one to explore it.");
      }, 12000);

      // Step 4: Auto-expand first finding after 14s
      setTimeout(() => {
        setDqNarrativeStep(4);
      }, 14000);

      // Step 5: Auto-collapse findings after 18s
      setTimeout(() => {
        setDqNarrativeStep(5);
      }, 18000);

      // Step 6: Wrap up after 19.5s
      setTimeout(() => {
        setBlobText("We can work on these together later — I'll put them away for now.\n\nClick 'Looks good' when you're ready to continue.");
        setDqNarrativeStep(6);
      }, 19500);

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

  const ALL_GOALS = [
    { n: "Reduce throughput time", current: "18.8 days avg",
      why: "Throughput directly impacts working capital and supplier relationships. Faster cycles mean less inventory and quicker response to demand.",
      evidence: "PM1 achieves 7.7d while PN1 takes 34d — the gap proves structural improvement is possible." },
    { n: "Lower rework rate", current: "52%",
      why: "Every rework loop doubles handling cost and delays downstream steps. Rework is the primary driver of throughput variance.",
      evidence: "52% of orders hit 'Confirmed Changed' — this single loop accounts for an estimated 40% of excess cycle time." },
    { n: "Improve data quality", current: "50/100",
      why: "Low data quality limits what we can analyze and automate. Missing fields create blind spots in root-cause analysis.",
      evidence: "item_signal is 95% null, selection_code is 42% null — two fields that could unlock automation insights." },
    { n: "Increase conformance", current: "1,175 variants",
      why: "High variant count means the process behaves differently everywhere — making it hard to optimize, train, or automate.",
      evidence: "17 sites, 1,175 variants. Most variants have <10 cases — long-tail fragmentation across regional offices." },
  ];

  const acceptGoals = (selectedIndices) => {
    setPanel(null);
    const selectedGoals = selectedIndices.map(i => ALL_GOALS[i]);
    setGoalsDoc({
      mission: docData?.mission || "To have an efficient purchasing process that is uniform across all sales offices.",
      goals: selectedGoals,
    });
    // Set up targets flow — only targets for selected goals
    setActiveTargets(selectedIndices);
    setTargetIdx(0);
    setAcceptedTargets([]);
    setBlob("thinking");
    setTimeout(() => {
      setBlob("waiting");
      const firstTarget = ALL_TARGETS[selectedIndices[0]];
      setBlobText(`Goals confirmed! Now let's set targets.\n\nFirst up: ${firstTarget.n}. Here's where I think you can realistically get to:`);
      setTimeout(() => { setPanel("target-single"); setPhase("targets"); }, 600);
    }, 700);
  };

  const skipGoals = () => {
    setPanel(null);
    setBlob("thinking");
    setTimeout(() => {
      setBlob("waiting");
      setBlobText("No problem — we can come back to goals later. Let's move on:");
      setPanel("junction"); setPhase("junction");
    }, 600);
  };

  const acceptSingleTarget = () => {
    const currentTargetGlobalIdx = activeTargets[targetIdx];
    const target = ALL_TARGETS[currentTargetGlobalIdx];
    // Add target to goals doc
    setAcceptedTargets(prev => [...prev, target]);
    setGoalsDoc(prev => {
      const updatedGoals = prev.goals.map((g, i) => {
        if (i === targetIdx) return { ...g, b: target.b, t: target.t };
        return g;
      });
      return { ...prev, goals: updatedGoals };
    });
    // Move to next target or finish
    const nextIdx = targetIdx + 1;
    if (nextIdx < activeTargets.length) {
      setPanel(null);
      setBlob("thinking");
      setTargetIdx(nextIdx);
      const nextTarget = ALL_TARGETS[activeTargets[nextIdx]];
      setTimeout(() => {
        setBlob("waiting");
        setBlobText(`Target accepted! Next: ${nextTarget.n}.`);
        setTimeout(() => { setPanel("target-single"); }, 500);
      }, 500);
    } else {
      // All targets done
      setPanel(null);
      setBlob("thinking");
      setTimeout(() => {
        setBlob("waiting");
        setBlobText("All targets locked in! Now — here's what I'd suggest as your next move:");
        setPanel("junction"); setPhase("junction");
      }, 800);
    }
  };

  const skipSingleTarget = () => {
    const nextIdx = targetIdx + 1;
    if (nextIdx < activeTargets.length) {
      setPanel(null);
      setTargetIdx(nextIdx);
      const nextTarget = ALL_TARGETS[activeTargets[nextIdx]];
      setBlobText(`Skipped. Next: ${nextTarget.n}.`);
      setTimeout(() => { setPanel("target-single"); }, 400);
    } else {
      setPanel(null);
      setBlob("thinking");
      setTimeout(() => {
        setBlob("waiting");
        setBlobText("Targets done! Now — here's what I'd suggest as your next move:");
        setPanel("junction"); setPhase("junction");
      }, 800);
    }
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
      setDqNarrativeStep(6); // skip narrative on jump
      setPanel("data-profile"); setPhase("data-profile");
    } else if (step.id === "fields") {
      setBlobText("Review the field mapping.");
      setFieldIdx(0);
      setMappedFields(dimFields.map(f => ({ ...f, confirmed: false, meaning: f.guess })));
      setPanel("fields"); setPhase("fields");
    } else if (step.id === "context") {
      seedState();
      setCtxNarrativeStep(4); // skip narrative on jump
      setBlobText(factQs[0].q); setQIdx(0); setPhase("fact-gathering");
    } else if (step.id === "review") {
      seedState();
      setCtxNarrativeStep(4); // skip narrative on jump
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
            { n: "Reduce throughput time", current: "18.8 days avg", why: "Throughput directly impacts working capital.", evidence: "PM1 achieves 7.7d while PN1 takes 34d." },
            { n: "Lower rework rate", current: "52%", why: "Every rework loop doubles handling cost.", evidence: "52% of orders hit 'Confirmed Changed'." },
            { n: "Improve data quality", current: "50/100", why: "Low data quality limits analysis.", evidence: "item_signal 95% null, selection_code 42% null." },
            { n: "Increase conformance", current: "1,175 variants", why: "High variant count means fragmentation.", evidence: "17 sites, 1,175 variants." },
          ],
        });
      }
      setBlobText("Here are the suggested targets:");
      setActiveTargets([0,1,2,3]); setTargetIdx(0); setAcceptedTargets([]);
      setPanel("target-single"); setPhase("targets");
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
        @keyframes snapIn { 0% { opacity:0; transform:translateY(12px) scale(0.95); } 60% { opacity:1; transform:translateY(-2px) scale(1.01); } 100% { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes processEmerge { 0% { opacity:0; transform:scale(0.9) translateY(20px); } 50% { opacity:1; transform:scale(1.02) translateY(-4px); } 100% { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes dp { 0%,100% { opacity:0.3; transform:scale(0.8); } 50% { opacity:1; transform:scale(1.15); } }
        @keyframes riseIn { 0% { opacity:0; transform:translateY(100vh); } 40% { opacity:0.6; } 100% { opacity:1; transform:translateY(0); } }
        @keyframes canvasEnter { from { opacity:0; transform:scale(0.94); } to { opacity:1; transform:scale(1); } }
        @keyframes slideInLeft { from { opacity:0; transform:translateX(-30px); } to { opacity:1; transform:translateX(0); } }
        @keyframes slideInDown { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes mcFadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes notifyPulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.6; transform:scale(1.4); } }
        @keyframes notifyShake { 0%,100% { transform:translateX(0); } 20% { transform:translateX(-2px); } 40% { transform:translateX(2px); } 60% { transform:translateX(-1px); } 80% { transform:translateX(1px); } }
        @keyframes chatSlideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes sparkleAppear { from { opacity:0; transform:scale(0.5); } to { opacity:1; transform:scale(1); } }
      `}</style>

      {/* Top bar */}
      <div style={{ padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: isDark ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.04)", flexShrink: 0, opacity: bgLight, transition: "all 1s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: isDark ? "#fff" : "#1a1d23", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: isDark ? "#1a1d23" : "#fff", transition: "all 1s" }}>N</div>
          <span style={{ fontSize: 14, fontWeight: 600, color: isDark ? "#fff" : "#1a1d23", transition: "color 1s" }}>namuda</span>
        </div>
        <span style={{ fontSize: 11.5, color: isDark ? "rgba(255,255,255,0.25)" : "#b0b5c0", transition: "color 1s" }}>improvement flow</span>
      </div>

      {/* Mission Control overlay */}
      {phase === "tour" && <MissionControlOverlay />}

      {/* Canvas view — full screen */}
      {phase === "canvas" && <CanvasView />}

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative", ...(phase === "tour" || phase === "canvas" ? { display: "none" } : {}) }}>

        {/* DATA PROFILE — left side panel */}
        {panel === "data-profile" && (
          <DataProfilePanel onAccept={acceptProfile} narrativeStep={dqNarrativeStep} />
        )}

        {/* DOC PANEL — left during gathering */}
        {hasDoc && !isReview && (
          <DocPanel data={docData} onUpdate={d => setDocData(d)} onImproveScore={() => setBlobText("Tell me more about:\n• What triggers this process?\n• Are there known bottlenecks?\n• What does success look like?")} narrativeStep={ctxNarrativeStep} />
        )}

        {/* GOALS DOC — left during goals/targets phases */}
        {hasGoalsDoc && !hasDoc && <div style={{ transition: canvasTransitionPhase === "exit" ? "opacity 0.6s, transform 0.6s" : "none", opacity: canvasTransitionPhase === "exit" ? 0 : 1, transform: canvasTransitionPhase === "exit" ? "translateX(-40px)" : "none" }}><GoalsDocPanel data={goalsDoc} /></div>}

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
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", overflow: "hidden", position: "relative", marginRight: showProcessTeaser && !isThink && !hasDoc ? 352 : 0, transition: canvasTransitionPhase === "exit" ? "opacity 0.5s, transform 0.5s" : "margin 0.5s cubic-bezier(0.16,1,0.3,1)", opacity: canvasTransitionPhase === "exit" ? 0 : 1, transform: canvasTransitionPhase === "exit" ? "translateY(-40px)" : "none" }}>

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
                <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 8, gap: 2 }}>
                  <div style={{ marginBottom: -12, transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)" }}>
                    <Blob state={blob} size={blobSz} />
                  </div>
                  {blobText && <div style={{ marginBottom: 16, minHeight: phase === "fields" ? 70 : undefined }}><BlobSpeech text={blobText} /></div>}
                  {blob === "thinking" && !isThink && <div style={{ marginTop: 4 }}><Dots /></div>}
                </div>
                {/* Core fields educational animation */}
                {phase === "core-fields" && (
                  <CoreFieldsEducation onAccept={acceptCoreFields} />
                )}
                {/* Center process map — emerges after core fields confirmed */}
                {showCenterProcess && phase === "core-fields-reveal" && (
                  <div style={{
                    width: "100%", maxWidth: 500, padding: "0 24px", display: "flex", justifyContent: "center",
                    animation: centerProcessFading ? "none" : "processEmerge 0.7s cubic-bezier(0.34,1.56,0.64,1)",
                    opacity: centerProcessFading ? 0 : 1,
                    transform: centerProcessFading ? "scale(0.95) translateY(10px)" : "none",
                    transition: centerProcessFading ? "opacity 0.5s ease, transform 0.5s cubic-bezier(0.4,0,0.2,1)" : "none",
                  }}>
                    <ProcessTeaser onClose={() => {}} inline />
                  </div>
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
        {hasStarted && !isThink && !isDark && !showProcessTeaser && !showCenterProcess && phase !== "tour" && phase !== "canvas" && <div style={{ transition: canvasTransitionPhase === "exit" ? "opacity 0.6s, transform 0.6s" : "none", opacity: canvasTransitionPhase === "exit" ? 0 : 1, transform: canvasTransitionPhase === "exit" ? "translateX(40px)" : "none" }}><StepMap phase={phase} onJump={jumpTo} fieldProgress={(phase === "core-fields" || phase === "core-fields-reveal" || phase === "fields") ? { fields: mappedFields, currentIdx: fieldIdx } : null} /></div>}

        {/* FLOATING PANEL */}
        {panel && !isThink && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 15 }}>
            {panel === "data" && <DataPanel onSelect={pickData} />}
            {/* data-profile now rendered as side panel */}
            {/* FieldPanel removed — field mapping now inline via FieldCard */}
            {panel === "goals" && <GoalsPanel onAccept={acceptGoals} onSkip={skipGoals} />}
            {panel === "target-single" && activeTargets[targetIdx] !== undefined && (
              <SingleTargetCard
                target={ALL_TARGETS[activeTargets[targetIdx]]}
                index={targetIdx}
                total={activeTargets.length}
                onAccept={acceptSingleTarget}
                onSkip={skipSingleTarget}
              />
            )}
            {panel === "junction" && <JunctionPanel goals={goalsDoc?.goals || []} onSelect={(id) => {
              setPanel(null);
              if (id === "tour") {
                setBlobText("");
                setBgLight(0);
                setTimeout(() => { setPhase("tour"); }, 1200);
              } else if (id === "canvas") {
                setBlobText("");
                setCanvasTransitionPhase("exit");
                setTimeout(() => {
                  setCanvasTransitionPhase("enter");
                  setPhase("canvas");
                }, 1100);
                setTimeout(() => { setCanvasTransitionPhase("ready"); }, 2200);
              } else if (id.startsWith("goal-")) {
                const goalIdx = parseInt(id.replace("goal-", ""));
                const goalNames = ["Reduce throughput time", "Lower rework rate", "Improve data quality", "Increase conformance"];
                setBlobText(`Great choice. Let me generate the ${goalNames[goalIdx] || "improvement"} findings...`);
                setPhase("done");
              }
            }} />}
          </div>
        )}

      </div>

      {/* Input */}
      {phase !== "tour" && phase !== "canvas" && <div style={{ padding: "12px 28px 20px", display: "flex", justifyContent: "center", flexShrink: 0, opacity: canvasTransitionPhase === "exit" ? 0 : ((introDone || hasStarted) && !isThink ? 1 : 0), transform: canvasTransitionPhase === "exit" ? "translateY(40px)" : ((introDone || hasStarted) && !isThink ? "translateY(0)" : "translateY(14px)"), transition: canvasTransitionPhase === "exit" ? "opacity 0.4s, transform 0.4s" : "all 0.5s ease", pointerEvents: isThink ? "none" : "auto" }}>
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
      </div>}
    </div>
  );
}
