import { useState, useEffect, useRef } from "react";

const MASTER_EXERCISES = [
  { name: "バーベルスクワット", defaultWeight: 60, defaultReps: 10, defaultSets: 3, rest: 180, muscle: "下半身" },
  { name: "レッグプレス", defaultWeight: 108, defaultReps: 10, defaultSets: 3, rest: 180, muscle: "下半身" },
  { name: "ブルガリアンスクワット", defaultWeight: 20, defaultReps: 10, defaultSets: 3, rest: 120, muscle: "下半身" },
  { name: "バーベルベンチプレス", defaultWeight: 60, defaultReps: 10, defaultSets: 3, rest: 180, muscle: "胸" },
  { name: "ダンベルベンチプレス", defaultWeight: 20, defaultReps: 10, defaultSets: 3, rest: 150, muscle: "胸" },
  { name: "懸垂", defaultWeight: 0, defaultReps: 8, defaultSets: 3, rest: 150, muscle: "背中" },
  { name: "ラットプルダウン", defaultWeight: 62, defaultReps: 10, defaultSets: 3, rest: 120, muscle: "背中" },
  { name: "ダンベルロウ", defaultWeight: 26, defaultReps: 10, defaultSets: 3, rest: 120, muscle: "背中" },
  { name: "チェストサポーテッドロウ", defaultWeight: 30, defaultReps: 10, defaultSets: 3, rest: 120, muscle: "背中" },
  { name: "デッドリフト（ルーマニアン）", defaultWeight: 60, defaultReps: 10, defaultSets: 3, rest: 180, muscle: "背中" },
  { name: "デッドリフト（コンベンション）", defaultWeight: 80, defaultReps: 5, defaultSets: 3, rest: 240, muscle: "背中" },
  { name: "デッドリフト（スモウ）", defaultWeight: 80, defaultReps: 5, defaultSets: 3, rest: 240, muscle: "背中" },
  { name: "バックエクステンション", defaultWeight: 0, defaultReps: 15, defaultSets: 3, rest: 90, muscle: "背中" },
  { name: "ショルダープレス", defaultWeight: 14, defaultReps: 12, defaultSets: 3, rest: 120, muscle: "肩" },
  { name: "インクラインサイドレイズ", defaultWeight: 7, defaultReps: 12, defaultSets: 3, rest: 90, muscle: "肩" },
  { name: "インクラインダンベルカール", defaultWeight: 10, defaultReps: 12, defaultSets: 3, rest: 90, muscle: "二頭" },
  { name: "ライイングエクステンション", defaultWeight: 31, defaultReps: 10, defaultSets: 3, rest: 90, muscle: "三頭" },
  { name: "アブローラー", defaultWeight: 0, defaultReps: 10, defaultSets: 3, rest: 90, muscle: "腹" },
  { name: "アドミナル", defaultWeight: 45, defaultReps: 10, defaultSets: 3, rest: 90, muscle: "腹" },
];

const DEFAULT_MENUS = [
  { id: "sat", name: "土曜メニュー（全身A）", exercises: ["レッグプレス","バーベルベンチプレス","懸垂","ラットプルダウン","ショルダープレス","ダンベルロウ","インクラインサイドレイズ","ライイングエクステンション","アドミナル"] },
  { id: "sun", name: "日曜メニュー（全身B）", exercises: ["レッグプレス","ブルガリアンスクワット","ラットプルダウン","ダンベルロウ","ショルダープレス","インクラインサイドレイズ","アドミナル"] },
];

const MUSCLE_COLORS = {
  "下半身":"#f97316","胸":"#3b82f6","背中":"#8b5cf6",
  "肩":"#06b6d4","二頭":"#10b981","三頭":"#10b981","腹":"#f59e0b",
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getMonth()+1}/${d.getDate()}(${["日","月","火","水","木","金","土"][d.getDay()]})`;
}
function formatTime(sec) {
  return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,"0")}`;
}
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

export default function GymNote() {
  const [view, setView] = useState("home");
  const [menus, setMenus] = useState(DEFAULT_MENUS);
  const [history, setHistory] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [menuName, setMenuName] = useState("");
  const [exercises, setExercises] = useState([]);
  const [checkedSets, setCheckedSets] = useState({});
  const [startMs, setStartMs] = useState(null);
  const [elapsedStr, setElapsedStr] = useState("");
  const [restTimer, setRestTimer] = useState(null);
  // editor state
  const [editingMenu, setEditingMenu] = useState(null); // {id, name, exercises:[]}
  const [editTab, setEditTab] = useState("exercises"); // "exercises" | "add"
  const [dragIdx, setDragIdx] = useState(null);
  const [menuDragIdx, setMenuDragIdx] = useState(null);
  const restRef = useRef(null);
  const elapsedRef = useRef(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem("gym_v4");
      if (s) {
        const d = JSON.parse(s);
        if (d.menus) setMenus(d.menus);
        if (d.history) setHistory(d.history);
      }
    } catch{}
  }, []);

  const save = (newMenus, newHistory) => {
    const m = newMenus ?? menus;
    const h = newHistory ?? history;
    setMenus(m); setHistory(h);
    try { localStorage.setItem("gym_v4", JSON.stringify({menus:m, history:h})); } catch{}
  };

  useEffect(() => {
    if (view === "workout" && startMs) {
      elapsedRef.current = setInterval(() => {
        const s = Math.floor((Date.now()-startMs)/1000);
        setElapsedStr(`${Math.floor(s/60)}分${s%60}秒`);
      }, 1000);
    }
    return () => clearInterval(elapsedRef.current);
  }, [view, startMs]);

  const launchWorkout = (name, exNames) => {
    const exs = exNames.map((n,i) => {
      const m = MASTER_EXERCISES.find(e=>e.name===n)||{name:n,defaultWeight:0,defaultReps:10,defaultSets:3,rest:120,muscle:"その他"};
      return {...m, id:i, weight:m.defaultWeight, reps:m.defaultReps, sets:m.defaultSets};
    });
    setMenuName(name); setExercises(exs); setCheckedSets({});
    setStartMs(Date.now()); setRestTimer(null); setElapsedStr("0分0秒");
    setView("workout");
  };

  const startRest = (sec, name) => {
    clearInterval(restRef.current);
    setRestTimer({rem:sec, total:sec, name});
    restRef.current = setInterval(() => {
      setRestTimer(p => {
        if(!p||p.rem<=1){clearInterval(restRef.current);return null;}
        return {...p, rem:p.rem-1};
      });
    },1000);
  };

  const stopRest = () => { clearInterval(restRef.current); setRestTimer(null); };

  const toggleSet = (exId, si) => {
    const key=`${exId}-${si}`;
    const wasDone=!!checkedSets[key];
    setCheckedSets(p=>({...p,[key]:!wasDone}));
    if(!wasDone){const ex=exercises.find(e=>e.id===exId); if(ex&&ex.rest>0) startRest(ex.rest,ex.name);}
    else stopRest();
  };

  const updateEx = (exId, field, val) => {
    setExercises(p=>p.map(e=>e.id===exId?{...e,[field]:field==="weight"?parseFloat(val)||0:parseInt(val)||1}:e));
  };

  const finishWorkout = () => {
    stopRest(); clearInterval(elapsedRef.current);
    const dur = Math.round((Date.now()-startMs)/60000);
    const rec = {
      id:Date.now(), date:new Date().toISOString().split("T")[0],
      menuName, duration:dur,
      exercises:exercises.map(ex=>({
        name:ex.name, muscle:ex.muscle, weight:ex.weight, reps:ex.reps, sets:ex.sets,
        done:Array.from({length:ex.sets},(_,i)=>!!checkedSets[`${ex.id}-${i}`]),
      })),
    };
    save(null, [rec,...history]);
    setView("home");
  };

  const totalSets=exercises.reduce((s,e)=>s+e.sets,0);
  const doneSets=Object.values(checkedSets).filter(Boolean).length;

  // ── メニュー編集画面 ──
  const openEditor = (menu) => {
    setEditingMenu({...menu, exercises:[...menu.exercises]});
    setEditTab("exercises");
    setView("editor");
  };

  const saveEditor = () => {
    const newMenus = menus.map(m => m.id===editingMenu.id ? editingMenu : m);
    save(newMenus, null);
    setView("home");
  };

  const copyMenu = (menu) => {
    const newMenu = { id: genId(), name: menu.name+"（コピー）", exercises:[...menu.exercises] };
    const newMenus = [...menus, newMenu];
    save(newMenus, null);
  };

  const deleteMenu = (id) => {
    if (!window.confirm("このメニューを削除しますか？")) return;
    save(menus.filter(m=>m.id!==id), null);
  };

  const addNewMenu = () => {
    const newMenu = { id: genId(), name: "新しいメニュー", exercises:[] };
    const newMenus = [...menus, newMenu];
    save(newMenus, null);
    setEditingMenu({...newMenu});
    setEditTab("exercises");
    setView("editor");
  };

  // drag & drop for exercises in editor
  const onExDragStart = (i) => setDragIdx(i);
  const onExDragOver = (e, i) => {
    e.preventDefault();
    if (dragIdx===null||dragIdx===i) return;
    const exs = [...editingMenu.exercises];
    const [removed] = exs.splice(dragIdx, 1);
    exs.splice(i, 0, removed);
    setEditingMenu(p=>({...p, exercises:exs}));
    setDragIdx(i);
  };

  // drag & drop for menus on home
  const onMenuDragStart = (i) => setMenuDragIdx(i);
  const onMenuDragOver = (e, i) => {
    e.preventDefault();
    if (menuDragIdx===null||menuDragIdx===i) return;
    const m = [...menus];
    const [removed] = m.splice(menuDragIdx, 1);
    m.splice(i, 0, removed);
    save(m, null);
    setMenuDragIdx(i);
  };

  // ── HOME ──
  if (view==="home") return (
    <div style={S.app}>
      <div style={S.homeTop}>
        <div style={S.logo}>🏋️‍♂️ <span style={S.logoText}>GYM NOTE</span></div>
        <div style={S.todayDate}>{new Date().toLocaleDateString("ja-JP",{month:"long",day:"numeric",weekday:"long"})}</div>
      </div>
      <div style={S.scroll}>
        <div style={S.section}>
          <div style={S.sectionTitle}>メニュー</div>
          {menus.map((menu, i) => (
            <div key={menu.id} draggable
              onDragStart={()=>onMenuDragStart(i)}
              onDragOver={e=>onMenuDragOver(e,i)}
              onDragEnd={()=>setMenuDragIdx(null)}
              style={{...S.menuCard, cursor:"grab", marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <button style={{...S.menuCardInner}} onClick={()=>launchWorkout(menu.name, menu.exercises)}>
                  <div style={S.menuCardName}>{menu.name}</div>
                  <div style={S.menuCardMeta}>{menu.exercises.length}種目 · タップしてスタート →</div>
                </button>
                <div style={{display:"flex",gap:4,flexShrink:0,paddingLeft:8}}>
                  <button style={S.iconBtn} onClick={()=>openEditor(menu)} title="編集">✏️</button>
                  <button style={S.iconBtn} onClick={()=>copyMenu(menu)} title="コピー">📋</button>
                  <button style={{...S.iconBtn,color:"#ef4444"}} onClick={()=>deleteMenu(menu.id)} title="削除">🗑</button>
                </div>
              </div>
            </div>
          ))}
          <button style={S.buildCard} onClick={addNewMenu}>
            ＋ 新しいメニューを作る
          </button>
        </div>
        <div style={S.section}>
          <div style={S.sectionTitle}>最近の記録</div>
          {history.length===0&&<div style={S.empty}>まだ記録がありません</div>}
          {history.slice(0,4).map(r=>{
            const td=r.exercises.reduce((s,e)=>s+e.done.filter(Boolean).length,0);
            const ta=r.exercises.reduce((s,e)=>s+e.sets,0);
            return(
              <button key={r.id} style={S.histRow} onClick={()=>{setSelectedHistory(r);setView("detail");}}>
                <div><div style={S.histDate}>{formatDate(r.date)}</div><div style={S.histMenu}>{r.menuName}</div></div>
                <div style={{textAlign:"right"}}><div style={S.histDur}>{r.duration}分</div><div style={S.histSets}>{td}/{ta}セット</div></div>
              </button>
            );
          })}
          {history.length>4&&<button style={S.moreBtn} onClick={()=>setView("history")}>すべての履歴 →</button>}
        </div>
      </div>
    </div>
  );

  // ── EDITOR ──
  if (view==="editor"&&editingMenu) {
    const grouped={};
    MASTER_EXERCISES.forEach(e=>{if(!grouped[e.muscle])grouped[e.muscle]=[];grouped[e.muscle].push(e.name);});
    return (
      <div style={S.app}>
        <div style={S.header}>
          <button style={S.backBtn} onClick={()=>setView("home")}>←</button>
          <div style={{flex:1}}>
            <input style={{...S.nameInputInline}} value={editingMenu.name}
              onChange={e=>setEditingMenu(p=>({...p,name:e.target.value}))}/>
            <div style={S.headerSub}>{editingMenu.exercises.length}種目</div>
          </div>
          <button style={S.finishBtn} onClick={saveEditor}>保存</button>
        </div>
        {/* タブ */}
        <div style={{display:"flex",borderBottom:"1px solid #1e293b"}}>
          <button style={{...S.tab, ...(editTab==="exercises"?S.tabActive:{})}} onClick={()=>setEditTab("exercises")}>種目一覧</button>
          <button style={{...S.tab, ...(editTab==="add"?S.tabActive:{})}} onClick={()=>setEditTab("add")}>種目を追加</button>
        </div>
        <div style={S.scroll}>
          {editTab==="exercises" && (
            <>
              {editingMenu.exercises.length===0 && <div style={S.empty}>種目がありません。「種目を追加」から追加してください。</div>}
              {editingMenu.exercises.map((name, i) => {
                const m = MASTER_EXERCISES.find(e=>e.name===name);
                const mc = MUSCLE_COLORS[m?.muscle]||"#94a3b8";
                return (
                  <div key={i} draggable
                    onDragStart={()=>onExDragStart(i)}
                    onDragOver={e=>onExDragOver(e,i)}
                    onDragEnd={()=>setDragIdx(null)}
                    style={{...S.exEditRow, borderLeftColor:mc}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
                      <span style={{color:"#475569",fontSize:18,cursor:"grab"}}>☰</span>
                      <div>
                        <div style={{...S.muscleBadge,color:mc,borderColor:mc,marginBottom:2}}>{m?.muscle||"その他"}</div>
                        <div style={{fontSize:14,fontWeight:600,color:"#f1f5f9"}}>{name}</div>
                      </div>
                    </div>
                    <button style={{background:"none",border:"none",color:"#ef4444",fontSize:20,cursor:"pointer",padding:"0 4px"}}
                      onClick={()=>setEditingMenu(p=>({...p,exercises:p.exercises.filter((_,j)=>j!==i)}))}>×</button>
                  </div>
                );
              })}
              <div style={{height:40}}/>
            </>
          )}
          {editTab==="add" && (
            <>
              {Object.entries(grouped).map(([muscle,names])=>(
                <div key={muscle}>
                  <div style={{...S.muscleLabel,color:MUSCLE_COLORS[muscle]||"#94a3b8"}}>{muscle}</div>
                  {names.map(n=>{
                    const already = editingMenu.exercises.includes(n);
                    return (
                      <button key={n} style={{...S.exPickRow,
                        background:already?"#1e3a5f":"#111827",
                        borderColor:already?"#3b82f6":"#1e293b",
                        opacity:already?0.6:1}}
                        onClick={()=>{
                          if(already) return;
                          setEditingMenu(p=>({...p,exercises:[...p.exercises,n]}));
                        }}>
                        <span style={{color:already?"#93c5fd":"#cbd5e1"}}>{n}</span>
                        <span style={{color:already?"#3b82f6":"#334155",fontSize:20,fontWeight:700}}>{already?"✓":"+"}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
              <div style={{height:40}}/>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── WORKOUT ──
  if (view==="workout") return(
    <div style={S.app}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={()=>{if(window.confirm("終了して破棄しますか？")){stopRest();clearInterval(elapsedRef.current);setView("home");}}}>←</button>
        <div style={{flex:1}}>
          <div style={S.headerTitle}>{menuName}</div>
          <div style={S.headerSub}>{doneSets}/{totalSets}セット完了 · {elapsedStr}</div>
        </div>
        <button style={S.finishBtn} onClick={finishWorkout}>保存</button>
      </div>
      <div style={S.progTrack}><div style={{...S.progBar,width:`${totalSets>0?doneSets/totalSets*100:0}%`}}/></div>
      {restTimer&&(
        <div style={S.timerBox}>
          <div style={S.timerName}>{restTimer.name} · レスト中</div>
          <div style={S.timerNum}>{formatTime(restTimer.rem)}</div>
          <div style={S.timerTrack}><div style={{...S.timerFill,width:`${(1-restTimer.rem/restTimer.total)*100}%`}}/></div>
          <button style={S.timerSkip} onClick={stopRest}>スキップ ×</button>
        </div>
      )}
      <div style={S.scroll}>
        {exercises.map(ex=>{
          const allDone=Array.from({length:ex.sets},(_,i)=>!!checkedSets[`${ex.id}-${i}`]).every(Boolean);
          const mc=MUSCLE_COLORS[ex.muscle]||"#94a3b8";
          return(
            <div key={ex.id} style={{...S.card,opacity:allDone?0.5:1,borderLeftColor:mc}}>
              <div style={S.cardTop}>
                <div>
                  <div style={{...S.muscleBadge,color:mc,borderColor:mc}}>{ex.muscle}</div>
                  <div style={S.exName}>{ex.name}</div>
                </div>
                <div style={S.restTag}>{ex.rest>0?`REST ${ex.rest}s`:"-"}</div>
              </div>
              <div style={S.editors}>
                {ex.weight>0&&(
                  <div style={S.edGroup}>
                    <div style={S.edLabel}>重量</div>
                    <input style={S.edInput} type="number" value={ex.weight} onChange={e=>updateEx(ex.id,"weight",e.target.value)}/>
                    <div style={S.edUnit}>kg</div>
                  </div>
                )}
                <div style={S.edGroup}>
                  <div style={S.edLabel}>回数</div>
                  <input style={S.edInput} type="number" value={ex.reps} onChange={e=>updateEx(ex.id,"reps",e.target.value)}/>
                  <div style={S.edUnit}>回</div>
                </div>
                <div style={S.edGroup}>
                  <div style={S.edLabel}>セット</div>
                  <input style={S.edInput} type="number" value={ex.sets} onChange={e=>updateEx(ex.id,"sets",e.target.value)}/>
                  <div style={S.edUnit}>set</div>
                </div>
              </div>
              <div style={S.setRow}>
                {Array.from({length:ex.sets},(_,i)=>{
                  const done=!!checkedSets[`${ex.id}-${i}`];
                  return(
                    <button key={i} style={{...S.setBtn,...(done?{background:mc,color:"#000",borderColor:mc}:{})}}
                      onClick={()=>toggleSet(ex.id,i)}>
                      {done?"✓":i+1}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        <div style={{height:60}}/>
      </div>
    </div>
  );

  // ── HISTORY ──
  if(view==="history") return(
    <div style={S.app}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={()=>setView("home")}>←</button>
        <div style={S.headerTitle}>トレーニング履歴</div>
      </div>
      <div style={S.scroll}>
        {history.length===0&&<div style={S.empty}>まだ記録がありません</div>}
        {history.map(r=>{
          const td=r.exercises.reduce((s,e)=>s+e.done.filter(Boolean).length,0);
          const ta=r.exercises.reduce((s,e)=>s+e.sets,0);
          return(
            <button key={r.id} style={S.histRow} onClick={()=>{setSelectedHistory(r);setView("detail");}}>
              <div><div style={S.histDate}>{formatDate(r.date)}</div><div style={S.histMenu}>{r.menuName}</div></div>
              <div style={{textAlign:"right"}}><div style={S.histDur}>{r.duration}分</div><div style={S.histSets}>{td}/{ta}セット</div></div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── DETAIL ──
  if(view==="detail"&&selectedHistory){
    const r=selectedHistory;
    return(
      <div style={S.app}>
        <div style={S.header}>
          <button style={S.backBtn} onClick={()=>setView("home")}>←</button>
          <div><div style={S.headerTitle}>{formatDate(r.date)}</div><div style={S.headerSub}>{r.menuName} · {r.duration}分</div></div>
        </div>
        <div style={S.scroll}>
          {r.exercises.map((ex,i)=>{
            const mc=MUSCLE_COLORS[ex.muscle]||"#94a3b8";
            const done=ex.done.filter(Boolean).length;
            return(
              <div key={i} style={{...S.card,borderLeftColor:mc}}>
                <div style={{...S.muscleBadge,color:mc,borderColor:mc,marginBottom:4}}>{ex.muscle}</div>
                <div style={S.exName}>{ex.name}</div>
                <div style={{color:"#94a3b8",fontSize:13,margin:"4px 0 8px"}}>
                  {ex.weight>0?`${ex.weight}kg × `:"BW × "}{ex.reps}回
                  <span style={{marginLeft:12,color:done===ex.sets?"#4ade80":"#64748b"}}>{done}/{ex.sets}セット完了</span>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {ex.done.map((c,si)=>(
                    <div key={si} style={{width:32,height:32,borderRadius:8,background:c?mc:"#1e293b",border:`1px solid ${c?mc:"#334155"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:c?"#000":"#475569"}}>
                      {c?"✓":si+1}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          <div style={{height:40}}/>
        </div>
      </div>
    );
  }
  return null;
}

const S={
  app:{fontFamily:"'Noto Sans JP',sans-serif",background:"#080f1a",minHeight:"100vh",color:"#e2e8f0",maxWidth:480,margin:"0 auto",display:"flex",flexDirection:"column"},
  homeTop:{padding:"28px 20px 20px",background:"linear-gradient(160deg,#0f1f3d 0%,#080f1a 100%)",borderBottom:"1px solid #1e293b"},
  logo:{display:"flex",alignItems:"center",gap:8,fontSize:22},
  logoText:{fontWeight:900,letterSpacing:2,color:"#f8fafc",fontSize:20},
  todayDate:{fontSize:13,color:"#475569",marginTop:6},
  scroll:{flex:1,overflowY:"auto",padding:"0 0 20px"},
  section:{padding:"20px 16px 4px"},
  sectionTitle:{fontSize:11,fontWeight:700,letterSpacing:2,color:"#475569",textTransform:"uppercase",marginBottom:10},
  menuCard:{background:"linear-gradient(135deg,#1e293b,#162032)",border:"1px solid #2d4160",borderRadius:14,padding:"12px 14px"},
  menuCardInner:{background:"none",border:"none",textAlign:"left",cursor:"pointer",flex:1,padding:0},
  menuCardName:{fontSize:16,fontWeight:700,color:"#f1f5f9",marginBottom:4},
  menuCardMeta:{fontSize:12,color:"#64748b"},
  iconBtn:{background:"#1e293b",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"},
  buildCard:{width:"100%",background:"transparent",border:"1px dashed #334155",borderRadius:14,padding:"14px 18px",color:"#64748b",fontSize:14,cursor:"pointer",textAlign:"left",marginTop:8},
  histRow:{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#111827",border:"none",borderBottom:"1px solid #1e293b",padding:"14px 16px",cursor:"pointer",textAlign:"left"},
  histDate:{fontSize:12,color:"#475569",marginBottom:3},
  histMenu:{fontSize:14,fontWeight:600,color:"#cbd5e1"},
  histDur:{fontSize:13,color:"#f97316",fontWeight:700,marginBottom:2},
  histSets:{fontSize:12,color:"#64748b"},
  moreBtn:{width:"100%",background:"none",border:"none",color:"#3b82f6",fontSize:13,padding:"12px 16px",cursor:"pointer",textAlign:"left"},
  empty:{padding:"24px 16px",color:"#475569",fontSize:14},
  header:{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",background:"#0d1526",borderBottom:"1px solid #1e293b",position:"sticky",top:0,zIndex:20},
  headerTitle:{fontSize:15,fontWeight:700,color:"#f1f5f9"},
  headerSub:{fontSize:11,color:"#64748b",marginTop:1},
  backBtn:{background:"#1e293b",border:"none",color:"#94a3b8",fontSize:18,width:36,height:36,borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},
  finishBtn:{background:"#f97316",border:"none",color:"#000",fontSize:13,fontWeight:800,padding:"8px 14px",borderRadius:10,cursor:"pointer",letterSpacing:1},
  progTrack:{height:3,background:"#1e293b"},
  progBar:{height:3,background:"linear-gradient(90deg,#f97316,#ef4444)",transition:"width .3s"},
  timerBox:{background:"#0f2340",borderBottom:"2px solid #1d4ed8",padding:"12px 16px",textAlign:"center"},
  timerName:{fontSize:11,color:"#64748b",marginBottom:4},
  timerNum:{fontSize:32,fontWeight:900,color:"#93c5fd",letterSpacing:2},
  timerTrack:{height:3,background:"#1e3a5f",borderRadius:2,margin:"8px 0 6px",overflow:"hidden"},
  timerFill:{height:3,background:"#3b82f6",transition:"width 1s linear"},
  timerSkip:{background:"none",border:"1px solid #1d4ed8",color:"#64748b",fontSize:12,padding:"4px 12px",borderRadius:8,cursor:"pointer"},
  card:{background:"#111827",borderLeft:"3px solid #334155",margin:"8px 12px 0",borderRadius:12,padding:"14px 14px 12px"},
  cardTop:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8},
  muscleBadge:{fontSize:10,fontWeight:700,letterSpacing:1,border:"1px solid",borderRadius:4,padding:"1px 6px",display:"inline-block",marginBottom:4},
  exName:{fontSize:15,fontWeight:700,color:"#f1f5f9",lineHeight:1.3},
  restTag:{fontSize:11,color:"#475569",background:"#1e293b",padding:"3px 8px",borderRadius:6,whiteSpace:"nowrap"},
  editors:{display:"flex",gap:8,margin:"10px 0"},
  edGroup:{display:"flex",alignItems:"center",gap:4,background:"#1e293b",borderRadius:8,padding:"6px 10px"},
  edLabel:{fontSize:10,color:"#475569",minWidth:20},
  edInput:{width:44,background:"none",border:"none",color:"#f1f5f9",fontSize:15,fontWeight:700,textAlign:"center",outline:"none"},
  edUnit:{fontSize:10,color:"#64748b"},
  setRow:{display:"flex",gap:8,flexWrap:"wrap"},
  setBtn:{width:44,height:44,borderRadius:10,background:"#1e293b",border:"1px solid #334155",color:"#64748b",fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},
  nameInputInline:{background:"none",border:"none",borderBottom:"1px solid #334155",color:"#f1f5f9",fontSize:15,fontWeight:700,outline:"none",width:"100%",padding:"2px 0"},
  tab:{flex:1,background:"none",border:"none",borderBottom:"2px solid transparent",color:"#64748b",fontSize:13,padding:"10px",cursor:"pointer"},
  tabActive:{color:"#f97316",borderBottomColor:"#f97316"},
  exEditRow:{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#111827",borderLeft:"3px solid #334155",margin:"6px 12px 0",borderRadius:10,padding:"10px 12px"},
  muscleLabel:{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",padding:"10px 16px 4px"},
  exPickRow:{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",border:"1px solid",borderRadius:0,padding:"13px 16px",cursor:"pointer",textAlign:"left",fontSize:14,borderLeft:"none",borderRight:"none",borderTop:"none"},
};
