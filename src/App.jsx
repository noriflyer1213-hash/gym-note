import { useState, useEffect, useRef } from "react";

const DEFAULT_EXERCISES = [
  { name: "バーベルスクワット", defaultWeight: 60, defaultReps: 10, defaultSets: 3, rest: 180, muscle: "下半身" },
  { name: "レッグプレス", defaultWeight: 108, defaultReps: 10, defaultSets: 3, rest: 180, muscle: "下半身" },
  { name: "ブルガリアンスクワット", defaultWeight: 16, defaultReps: 10, defaultSets: 3, rest: 90, muscle: "下半身" },
  { name: "バーベルベンチプレス", defaultWeight: 70, defaultReps: 6, defaultSets: 3, rest: 100, muscle: "胸" },
  { name: "ダンベルベンチプレス", defaultWeight: 20, defaultReps: 10, defaultSets: 3, rest: 90, muscle: "胸" },
  { name: "懸垂", defaultWeight: 0, defaultReps: 8, defaultSets: 3, rest: 90, muscle: "背中" },
  { name: "ラットプルダウン", defaultWeight: 62, defaultReps: 10, defaultSets: 3, rest: 90, muscle: "背中" },
  { name: "ダンベルロウ", defaultWeight: 26, defaultReps: 10, defaultSets: 3, rest: 90, muscle: "背中" },
  { name: "チェストサポーテッドロウ", defaultWeight: 32, defaultReps: 10, defaultSets: 3, rest: 90, muscle: "背中" },
  { name: "デッドリフト（ルーマニアン）", defaultWeight: 60, defaultReps: 10, defaultSets: 3, rest: 180, muscle: "背中" },
  { name: "デッドリフト（コンベンション）", defaultWeight: 80, defaultReps: 5, defaultSets: 3, rest: 240, muscle: "背中" },
  { name: "デッドリフト（スモウ）", defaultWeight: 80, defaultReps: 5, defaultSets: 3, rest: 240, muscle: "背中" },
  { name: "バックエクステンション", defaultWeight: 0, defaultReps: 15, defaultSets: 3, rest: 90, muscle: "背中" },
  { name: "ショルダープレス", defaultWeight: 32, defaultReps: 12, defaultSets: 3, rest: 90, muscle: "肩" },
  { name: "インクラインサイドレイズ", defaultWeight: 8, defaultReps: 12, defaultSets: 3, rest: 90, muscle: "肩" },
  { name: "インクラインダンベルカール", defaultWeight: 10, defaultReps: 12, defaultSets: 3, rest: 90, muscle: "二頭" },
  { name: "ライイングエクステンション", defaultWeight: 31, defaultReps: 10, defaultSets: 3, rest: 90, muscle: "三頭" },
  { name: "アブローラー", defaultWeight: 0, defaultReps: 10, defaultSets: 3, rest: 90, muscle: "腹" },
  { name: "アドミナル", defaultWeight: 45, defaultReps: 10, defaultSets: 3, rest: 90, muscle: "腹" },
];

const MUSCLE_OPTIONS = ["下半身","胸","背中","肩","二頭","三頭","腹","その他"];

const DEFAULT_MENUS = [
  { id: "sat", name: "土曜メニュー（全身A）", exercises: ["レッグプレス","バーベルベンチプレス","懸垂","ラットプルダウン","ショルダープレス","ダンベルロウ","インクラインサイドレイズ","ライイングエクステンション","アドミナル"] },
  { id: "sun", name: "日曜メニュー（全身B）", exercises: ["レッグプレス","ブルガリアンスクワット","ラットプルダウン","ダンベルロウ","ショルダープレス","インクラインサイドレイズ","アドミナル"] },
];

const MUSCLE_COLORS = {
  "下半身":"#f97316","胸":"#3b82f6","背中":"#8b5cf6",
  "肩":"#06b6d4","二頭":"#10b981","三頭":"#10b981","腹":"#f59e0b","その他":"#94a3b8",
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getMonth()+1}/${d.getDate()}(${["日","月","火","水","木","金","土"][d.getDay()]})`;
}
function formatTime(sec) {
  return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,"0")}`;
}
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

const S = {
  app:{fontFamily:"'Noto Sans JP',sans-serif",background:"#080f1a",height:"100dvh",color:"#e2e8f0",maxWidth:480,margin:"0 auto",display:"flex",flexDirection:"column",overflow:"hidden"},
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
  timerFloat:{background:"#0d1f40",borderBottom:"2px solid #1d4ed8",padding:"8px 16px",display:"flex",alignItems:"center",gap:8,flexShrink:0},
  timerFloatNum:{fontSize:26,fontWeight:900,color:"#93c5fd",letterSpacing:2,minWidth:52},
  timerName:{fontSize:11,color:"#64748b",marginBottom:4},
  timerTrack:{height:3,background:"#1e3a5f",borderRadius:2,margin:"4px 0 0",overflow:"hidden"},
  timerFill:{height:3,background:"#3b82f6",transition:"width 1s linear"},
  timerSkip:{background:"none",border:"1px solid #1d4ed8",color:"#64748b",fontSize:12,padding:"4px 12px",borderRadius:8,cursor:"pointer"},
  card:{background:"#111827",borderLeft:"3px solid #334155",margin:"8px 12px 0",borderRadius:12,padding:"14px 14px 12px"},
  cardTop:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8},
  muscleBadge:{fontSize:10,fontWeight:700,letterSpacing:1,border:"1px solid",borderRadius:4,padding:"1px 6px",display:"inline-block",marginBottom:4},
  exName:{fontSize:15,fontWeight:700,color:"#f1f5f9",lineHeight:1.3},
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
  modalOverlay:{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100},
  modalBox:{background:"#0d1526",border:"1px solid #1e293b",borderRadius:16,padding:"24px 20px",width:280,boxShadow:"0 20px 60px rgba(0,0,0,0.5)"},
  modalField:{display:"flex",flexDirection:"column",alignItems:"center",gap:6},
  modalLabel:{fontSize:11,color:"#64748b",fontWeight:700,letterSpacing:1},
  modalInput:{width:72,background:"#1e293b",border:"1px solid #334155",borderRadius:10,color:"#f1f5f9",fontSize:22,fontWeight:700,textAlign:"center",padding:"8px 4px",outline:"none"},
  modalUnit:{fontSize:12,color:"#64748b"},
  modalBtn:{border:"none",borderRadius:10,padding:"10px",fontSize:14,cursor:"pointer"},
};

function ExModal({ exModal, setExModal, onSave }) {
  if (!exModal) return null;
  const ex = exModal.ex;
  const update = (field, val) => setExModal(p => ({ ...p, ex: { ...p.ex, [field]: val } }));
  return (
    <div style={S.modalOverlay} onClick={() => setExModal(null)}>
      <div style={{ ...S.modalBox, width: 320 }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>
          {exModal.mode === "new" ? "種目を追加" : "種目を編集"}
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={S.modalLabel}>種目名</div>
          <input style={{ ...S.modalInput, width: "100%", fontSize: 14, padding: "8px 10px", marginTop: 4 }}
            value={ex.name} onChange={e => update("name", e.target.value)} placeholder="種目名" />
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={S.modalLabel}>部位</div>
          <select style={{ ...S.modalInput, width: "100%", fontSize: 14, padding: "8px 10px", marginTop: 4 }}
            value={ex.muscle} onChange={e => update("muscle", e.target.value)}>
            {MUSCLE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={S.modalLabel}>重量(kg)</div>
            <input style={{ ...S.modalInput, width: "100%", fontSize: 14, padding: "8px 6px", marginTop: 4 }} type="number"
              value={ex.defaultWeight} onChange={e => update("defaultWeight", parseFloat(e.target.value) || 0)} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={S.modalLabel}>回数</div>
            <input style={{ ...S.modalInput, width: "100%", fontSize: 14, padding: "8px 6px", marginTop: 4 }} type="number"
              value={ex.defaultReps} onChange={e => update("defaultReps", parseInt(e.target.value) || 1)} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={S.modalLabel}>セット数</div>
            <input style={{ ...S.modalInput, width: "100%", fontSize: 14, padding: "8px 6px", marginTop: 4 }} type="number"
              value={ex.defaultSets} onChange={e => update("defaultSets", parseInt(e.target.value) || 1)} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={S.modalLabel}>REST(秒)</div>
            <input style={{ ...S.modalInput, width: "100%", fontSize: 14, padding: "8px 6px", marginTop: 4 }} type="number"
              value={ex.rest} onChange={e => update("rest", parseInt(e.target.value) || 0)} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ ...S.modalBtn, background: "#1e293b", color: "#94a3b8", flex: 1 }} onClick={() => setExModal(null)}>キャンセル</button>
          <button style={{ ...S.modalBtn, background: "#f97316", color: "#000", flex: 1, fontWeight: 800 }} onClick={onSave}>保存</button>
        </div>
      </div>
    </div>
  );
}

function useTouchSort(items, setItems, scrollRef) {
  const dragIdx = useRef(null);
  const itemRefs = useRef([]);
  const autoScrollRef = useRef(null);
  const onTouchStart = (i) => () => { dragIdx.current = i; };
  const onTouchMove = (e) => {
    if (dragIdx.current === null) return;
    e.preventDefault();
    const touch = e.touches[0];
    const scrollEl = scrollRef?.current;
    if (scrollEl) {
      const rect = scrollEl.getBoundingClientRect();
      const threshold = 100;
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
      if (touch.clientY < rect.top + threshold) {
        const speed = Math.max(4, Math.round((rect.top + threshold - touch.clientY) / 5));
        autoScrollRef.current = setInterval(() => { scrollEl.scrollTop -= speed; }, 16);
      } else if (touch.clientY > rect.bottom - threshold) {
        const speed = Math.max(4, Math.round((touch.clientY - (rect.bottom - threshold)) / 5));
        autoScrollRef.current = setInterval(() => { scrollEl.scrollTop += speed; }, 16);
      }
    }
    for (let j = 0; j < itemRefs.current.length; j++) {
      const el = itemRefs.current[j];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom && j !== dragIdx.current) {
        const arr = [...items];
        const [r] = arr.splice(dragIdx.current, 1);
        arr.splice(j, 0, r);
        dragIdx.current = j;
        setItems(arr);
        break;
      }
    }
  };
  const onTouchEnd = () => { clearInterval(autoScrollRef.current); dragIdx.current = null; };
  return { itemRefs, onTouchStart, onTouchMove, onTouchEnd };
}

export default function GymNote() {
  const [view, setView] = useState("home");
  const [masterExercises, setMasterExercises] = useState(DEFAULT_EXERCISES);
  const [menus, setMenus] = useState(DEFAULT_MENUS);
  const [history, setHistory] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [menuName, setMenuName] = useState("");
  const [menuId, setMenuId] = useState(null);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [checkedSets, setCheckedSets] = useState({});
  const [setOverrides, setSetOverrides] = useState({});
  const [startMs, setStartMs] = useState(null);
  const [elapsedStr, setElapsedStr] = useState("");
  const [restTimer, setRestTimer] = useState(null);
  const [showAddEx, setShowAddEx] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [edTab, setEdTab] = useState("list");
  const [erTab, setErTab] = useState("list"); // ← ここに移動（元はeditRecord view内にあってHooks違反だった）
  const [setModal, setSetModal] = useState(null);
  const [nextSetModal, setNextSetModal] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [exModal, setExModal] = useState(null);

  const restRef = useRef(null);
  const elapsedRef = useRef(null);
  const nextSetShownRef = useRef(false);
  const menusRef = useRef(menus);
  const historyRef = useRef(history);
  const masterRef = useRef(masterExercises);
  useEffect(() => { menusRef.current = menus; }, [menus]);
  useEffect(() => { historyRef.current = history; }, [history]);
  useEffect(() => { masterRef.current = masterExercises; }, [masterExercises]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        if (startMs) {
          const s = Math.floor((Date.now() - startMs) / 1000);
          setElapsedStr(`${Math.floor(s/60)}分${s%60}秒`);
        }
        setRestTimer(p => {
          if (!p) return null;
          const elapsed = Math.floor((Date.now() - p.resumeAt) / 1000);
          const newRem = Math.max(0, p.remAtPause - elapsed);
          if (newRem <= 0) { clearInterval(restRef.current); return null; }
          clearInterval(restRef.current);
          restRef.current = setInterval(() => {
            setRestTimer(pp => {
              if (!pp || pp.rem <= 1) { clearInterval(restRef.current); return null; }
              const newR = pp.rem - 1;
              return { ...pp, rem: newR, remAtPause: newR, resumeAt: Date.now() };
            });
          }, 1000);
          return { ...p, rem: newRem, remAtPause: newRem, resumeAt: Date.now() };
        });
      } else {
        setRestTimer(p => p ? { ...p, remAtPause: p.rem, resumeAt: Date.now() } : null);
        clearInterval(restRef.current);
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [startMs]);

  useEffect(() => {
    try {
      const s = localStorage.getItem("gym_v4");
      if (s) {
        const d = JSON.parse(s);
        if (d.menus) setMenus(d.menus);
        if (d.history) setHistory(d.history);
        if (d.masterExercises) setMasterExercises(d.masterExercises);
      }
    } catch {}
  }, []);

  const saveData = (newMenus, newHistory, newMaster) => {
    const m = newMenus !== undefined ? newMenus : menusRef.current;
    const h = newHistory !== undefined ? newHistory : historyRef.current;
    const x = newMaster !== undefined ? newMaster : masterRef.current;
    setMenus(m); setHistory(h); setMasterExercises(x);
    try { localStorage.setItem("gym_v4", JSON.stringify({ menus: m, history: h, masterExercises: x })); } catch {}
  };

  useEffect(() => {
    if (view === "workout" && startMs) {
      elapsedRef.current = setInterval(() => {
        const s = Math.floor((Date.now() - startMs) / 1000);
        setElapsedStr(`${Math.floor(s/60)}分${s%60}秒`);
      }, 1000);
    }
    return () => clearInterval(elapsedRef.current);
  }, [view, startMs]);

  const getMasterEx = (name) => masterExercises.find(e => e.name === name) || { name, defaultWeight: 0, defaultReps: 10, defaultSets: 3, rest: 90, muscle: "その他" };

  const launchWorkout = (name, exNames, mid, recordId) => {
    const exs = exNames.map(n => {
      const m = getMasterEx(n);
      return { ...m, id: genId(), weight: m.defaultWeight, reps: m.defaultReps, sets: m.defaultSets };
    });
    setMenuName(name); setMenuId(mid || null); setEditingRecordId(recordId || null);
    setExercises(exs); setCheckedSets({}); setSetOverrides({});
    setStartMs(Date.now()); setRestTimer(null); setElapsedStr("0分0秒");
    setShowAddEx(false); setNextSetModal(null); setView("workout");
  };

  const resumeFromRecord = (rec) => {
    const exs = rec.exercises.map(ex => ({
      ...ex, id: genId(),
      rest: getMasterEx(ex.name).rest ?? 90,
    }));
    const checked = {}, overrides = {};
    exs.forEach(ex => {
      rec.exercises.find(e => e.name === ex.name)?.done?.forEach((d, i) => { if (d) checked[`${ex.id}-${i}`] = true; });
      rec.exercises.find(e => e.name === ex.name)?.setData?.forEach((sd, i) => {
        if (sd && (sd.weight !== ex.weight || sd.reps !== ex.reps)) overrides[`${ex.id}-${i}`] = { weight: sd.weight, reps: sd.reps };
      });
    });
    setMenuName(rec.menuName); setMenuId(null); setEditingRecordId(rec.id);
    setExercises(exs); setCheckedSets(checked); setSetOverrides(overrides);
    setStartMs(Date.now()); setRestTimer(null); setElapsedStr("0分0秒");
    setShowAddEx(false); setNextSetModal(null); setView("workout");
  };

  const getSetVal = (ex, si) => { const ov = setOverrides[`${ex.id}-${si}`]; return { weight: ov?.weight ?? ex.weight, reps: ov?.reps ?? ex.reps }; };

  const startRest = (sec, name, completedExId, completedSi) => {
    clearInterval(restRef.current);
    nextSetShownRef.current = false;
    const now = Date.now();
    setRestTimer({ rem: sec, total: sec, name, completedExId, completedSi, remAtPause: sec, resumeAt: now });
    restRef.current = setInterval(() => {
      setRestTimer(p => {
        if (!p || p.rem <= 1) { clearInterval(restRef.current); return null; }
        const newRem = p.rem - 1;
        if (newRem === 20 && !nextSetShownRef.current) {
          nextSetShownRef.current = true;
          setExercises(exs => {
            setCheckedSets(ch => {
              setSetOverrides(ov => {
                let found = null;
                const sameEx = exs.find(e => e.id === p.completedExId);
                if (sameEx) {
                  for (let i = p.completedSi + 1; i < sameEx.sets; i++) {
                    if (!ch[`${sameEx.id}-${i}`]) { found = { ex: sameEx, si: i }; break; }
                  }
                }
                if (!found) {
                  for (const ex of exs) {
                    for (let i = 0; i < ex.sets; i++) {
                      if (!(ex.id === p.completedExId && i === p.completedSi) && !ch[`${ex.id}-${i}`]) { found = { ex, si: i }; break; }
                    }
                    if (found) break;
                  }
                }
                if (found) {
                  const o = ov[`${found.ex.id}-${found.si}`];
                  setNextSetModal({ exId: found.ex.id, si: found.si, weight: o?.weight ?? found.ex.weight, reps: o?.reps ?? found.ex.reps, exName: found.ex.name, muscle: found.ex.muscle, editing: false });
                }
                return ov;
              });
              return ch;
            });
            return exs;
          });
        }
        return { ...p, rem: newRem, remAtPause: newRem, resumeAt: Date.now() };
      });
    }, 1000);
  };

  const stopRest = () => { clearInterval(restRef.current); setRestTimer(null); };

  const toggleSet = (exId, si) => {
    const key = `${exId}-${si}`;
    const wasDone = !!checkedSets[key];
    setCheckedSets(p => ({ ...p, [key]: !wasDone }));
    if (!wasDone) {
      const ex = exercises.find(e => e.id === exId);
      if (ex && ex.rest > 0) startRest(ex.rest, ex.name, exId, si);
      setTimeout(() => {
        setCheckedSets(cur => {
          const allDone = Array.from({ length: ex.sets }, (_, i) => i === si ? true : !!cur[`${exId}-${i}`]).every(Boolean);
          if (allDone) {
            const nextEx = exercises.find(e => e.id !== exId && Array.from({ length: e.sets }, (_, i) => !!cur[`${e.id}-${i}`]).some(d => !d));
            if (nextEx && cardRefs.current[nextEx.id]) cardRefs.current[nextEx.id].scrollIntoView({ behavior: "smooth", block: "start" });
          }
          return cur;
        });
      }, 300);
    } else stopRest();
  };

  const updateEx = (exId, field, val) => {
    setExercises(p => p.map(e => {
      if (e.id !== exId) return e;
      if (val === "" || val === "-") return { ...e, [field + "_raw"]: val };
      const num = field === "weight" ? parseFloat(val) : parseInt(val);
      if (isNaN(num)) return e;
      return { ...e, [field]: num, [field + "_raw"]: undefined };
    }));
  };
  const exDV = (ex, f) => ex[f + "_raw"] !== undefined ? ex[f + "_raw"] : ex[f];

  const removeEx = (exId) => {
    setExercises(p => p.filter(e => e.id !== exId));
    setCheckedSets(p => { const n = {}; Object.entries(p).forEach(([k, v]) => { if (!k.startsWith(exId + "-")) n[k] = v; }); return n; });
    setSetOverrides(p => { const n = {}; Object.entries(p).forEach(([k, v]) => { if (!k.startsWith(exId + "-")) n[k] = v; }); return n; });
  };

  const addExToWorkout = (name) => {
    const m = getMasterEx(name);
    setExercises(p => [...p, { ...m, id: genId(), weight: m.defaultWeight, reps: m.defaultReps, sets: m.defaultSets }]);
  };

  const finishWorkout = () => {
    stopRest(); clearInterval(elapsedRef.current);
    const dur = Math.round((Date.now() - startMs) / 60000);
    const rec = {
      id: editingRecordId || Date.now(), date: new Date().toISOString().split("T")[0],
      menuName, duration: dur,
      exercises: exercises.map(ex => ({
        name: ex.name, muscle: ex.muscle, weight: ex.weight, reps: ex.reps, sets: ex.sets,
        done: Array.from({ length: ex.sets }, (_, i) => !!checkedSets[`${ex.id}-${i}`]),
        setData: Array.from({ length: ex.sets }, (_, i) => getSetVal(ex, i)),
      })),
    };
    const newHistory = editingRecordId ? historyRef.current.map(r => r.id === editingRecordId ? rec : r) : [rec, ...historyRef.current];
    saveData(undefined, newHistory, undefined);
    setView("home");
  };

  const saveToMenu = () => {
    if (!menuId) return;
    saveData(menusRef.current.map(m => m.id === menuId ? { ...m, exercises: exercises.map(e => e.name) } : m), undefined, undefined);
    alert("メニューに保存しました！");
  };

  const deleteRecord = (id) => {
    if (!window.confirm("この記録を削除しますか？")) return;
    saveData(undefined, historyRef.current.filter(r => r.id !== id), undefined);
    setView("home");
  };

  const totalSets = exercises.reduce((s, e) => s + e.sets, 0);
  const doneSets = Object.values(checkedSets).filter(Boolean).length;

  // 種目管理
  const saveExModal = () => {
    if (!exModal) return;
    const ex = exModal.ex;
    if (!ex.name.trim()) return alert("種目名を入力してください");
    if (exModal.mode === "new") {
      if (masterRef.current.find(e => e.name === ex.name)) return alert("同じ名前の種目が既に存在します");
      saveData(undefined, undefined, [...masterRef.current, ex]);
    } else {
      const oldName = exModal.originalName;
      const newMaster = masterRef.current.map(e => e.name === oldName ? ex : e);
      const newMenus = ex.name !== oldName
        ? menusRef.current.map(m => ({ ...m, exercises: m.exercises.map(n => n === oldName ? ex.name : n) }))
        : menusRef.current;
      saveData(newMenus, undefined, newMaster);
    }
    setExModal(null);
  };

  const deleteExercise = (name) => {
    if (!window.confirm(`「${name}」を削除しますか？`)) return;
    saveData(undefined, undefined, masterRef.current.filter(e => e.name !== name));
  };

  // Editor
  const [editorExercises, setEditorExercises] = useState([]);
  useEffect(() => { if (editingMenu) setEditorExercises([...editingMenu.exercises]); }, [editingMenu?.id]);
  const editorSort = useTouchSort(editorExercises, setEditorExercises);
  const openEditor = (menu) => { setEditingMenu({ ...menu, exercises: [...menu.exercises] }); setEditorExercises([...menu.exercises]); setEdTab("list"); setView("editor"); };
  const saveEditor = () => { const u = { ...editingMenu, exercises: editorExercises }; saveData(menusRef.current.map(m => m.id === u.id ? u : m), undefined, undefined); setView("home"); };
  const copyMenu = (menu) => saveData([...menusRef.current, { id: genId(), name: menu.name + "（コピー）", exercises: [...menu.exercises] }], undefined, undefined);
  const deleteMenu = (id) => { if (!window.confirm("削除しますか？")) return; saveData(menusRef.current.filter(m => m.id !== id), undefined, undefined); };
  const addNewMenu = () => { const nm = { id: genId(), name: "新しいメニュー", exercises: [] }; saveData([...menusRef.current, nm], undefined, undefined); setEditingMenu({ ...nm }); setEditorExercises([]); setEdTab("list"); setView("editor"); };

  const workoutScrollRef = useRef(null);
  const workoutSort = useTouchSort(exercises, setExercises, workoutScrollRef);
  const cardRefs = useRef({});
  const startEditRecord = (rec) => { setEditingRecord(JSON.parse(JSON.stringify(rec))); setErTab("list"); setView("editRecord"); };
  const saveEditRecord = () => { saveData(undefined, historyRef.current.map(r => r.id === editingRecord.id ? editingRecord : r), undefined); setSelectedHistory(editingRecord); setView("detail"); };

  const grouped = {};
  masterExercises.forEach(e => { if (!grouped[e.muscle]) grouped[e.muscle] = []; grouped[e.muscle].push(e); });



  // ── HOME ──
  if (view === "home") return (
    <div style={S.app}>
      <ExModal exModal={exModal} setExModal={setExModal} onSave={saveExModal} />
      <div style={S.homeTop}>
        <div style={S.logo}>🏋️‍♂️ <span style={S.logoText}>GYM NOTE</span></div>
        <div style={S.todayDate}>{new Date().toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "long" })}</div>
      </div>
      <div style={S.scroll}>
        <div style={S.section}>
          <div style={S.sectionTitle}>メニュー</div>
          {menus.map((menu) => (
            <div key={menu.id} style={{ ...S.menuCard, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <button style={S.menuCardInner} onClick={() => launchWorkout(menu.name, menu.exercises, menu.id)}>
                  <div style={S.menuCardName}>{menu.name}</div>
                  <div style={S.menuCardMeta}>{menu.exercises.length}種目 · タップしてスタート →</div>
                </button>
                <div style={{ display: "flex", gap: 4, flexShrink: 0, paddingLeft: 8 }}>
                  <button style={S.iconBtn} onClick={() => openEditor(menu)}>✏️</button>
                  <button style={S.iconBtn} onClick={() => copyMenu(menu)}>📋</button>
                  <button style={S.iconBtn} onClick={() => deleteMenu(menu.id)}>🗑</button>
                </div>
              </div>
            </div>
          ))}
          <button style={S.buildCard} onClick={addNewMenu}>＋ 新しいメニューを作る</button>
        </div>
        <div style={S.section}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={S.sectionTitle}>最近の記録</div>
          </div>
          {history.length === 0 && <div style={S.empty}>まだ記録がありません</div>}
          {history.slice(0, 4).map(r => {
            const td = r.exercises.reduce((s, e) => s + e.done.filter(Boolean).length, 0);
            const ta = r.exercises.reduce((s, e) => s + e.sets, 0);
            return (
              <button key={r.id} style={S.histRow} onClick={() => { setSelectedHistory(r); setView("detail"); }}>
                <div><div style={S.histDate}>{formatDate(r.date)}</div><div style={S.histMenu}>{r.menuName}</div></div>
                <div style={{ textAlign: "right" }}><div style={S.histDur}>{r.duration}分</div><div style={S.histSets}>{td}/{ta}セット</div></div>
              </button>
            );
          })}
          {history.length > 4 && <button style={S.moreBtn} onClick={() => setView("history")}>すべての履歴 →</button>}
        </div>
        <div style={S.section}>
          <button style={{ ...S.buildCard, marginTop: 0 }} onClick={() => setView("exManager")}>⚙️ 種目を管理する</button>
        </div>
        <div style={{ height: 20 }} />
      </div>
    </div>
  );

  // ── 種目管理 ──
  if (view === "exManager") return (
    <div style={S.app}>
      <ExModal exModal={exModal} setExModal={setExModal} onSave={saveExModal} />
      <div style={S.header}>
        <button style={S.backBtn} onClick={() => setView("home")}>←</button>
        <div style={{ flex: 1 }}>
          <div style={S.headerTitle}>種目を管理</div>
          <div style={S.headerSub}>{masterExercises.length}種目</div>
        </div>
        <button style={S.finishBtn} onClick={() => setExModal({ mode: "new", ex: { name: "", muscle: "下半身", defaultWeight: 0, defaultReps: 10, defaultSets: 3, rest: 90 } })}>＋追加</button>
      </div>
      <div style={S.scroll}>
        {Object.entries(grouped).map(([muscle, exList]) => (
          <div key={muscle}>
            <div style={{ ...S.muscleLabel, color: MUSCLE_COLORS[muscle] || "#94a3b8" }}>{muscle}</div>
            {exList.map(ex => (
              <div key={ex.name} style={{ ...S.exEditRow, borderLeftColor: MUSCLE_COLORS[ex.muscle] || "#94a3b8" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{ex.name}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                    {ex.defaultWeight > 0 ? `${ex.defaultWeight}kg × ` : "BW × "}{ex.defaultReps}回 · {ex.defaultSets}set · REST {ex.rest}s
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button style={S.iconBtn} onClick={() => setExModal({ mode: "edit", originalName: ex.name, ex: { ...ex } })}>✏️</button>
                  <button style={{ ...S.iconBtn, color: "#ef4444" }} onClick={() => deleteExercise(ex.name)}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div style={{ height: 40 }} />
      </div>
    </div>
  );

  // ── EDITOR ──
  if (view === "editor" && editingMenu) {
    return (
      <div style={S.app}>
        <ExModal exModal={exModal} setExModal={setExModal} onSave={saveExModal} />
        <div style={S.header}>
          <button style={S.backBtn} onClick={() => setView("home")}>←</button>
          <div style={{ flex: 1 }}>
            <input style={S.nameInputInline} value={editingMenu.name} onChange={e => setEditingMenu(p => ({ ...p, name: e.target.value }))} />
            <div style={S.headerSub}>{editorExercises.length}種目</div>
          </div>
          <button style={S.finishBtn} onClick={saveEditor}>保存</button>
        </div>
        <div style={{ display: "flex", borderBottom: "1px solid #1e293b" }}>
          <button style={{ ...S.tab, ...(edTab === "list" ? S.tabActive : {}) }} onClick={() => setEdTab("list")}>種目一覧</button>
          <button style={{ ...S.tab, ...(edTab === "add" ? S.tabActive : {}) }} onClick={() => setEdTab("add")}>種目を追加</button>
        </div>
        <div style={S.scroll} onTouchMove={edTab === "list" ? editorSort.onTouchMove : undefined} onTouchEnd={edTab === "list" ? editorSort.onTouchEnd : undefined}>
          {edTab === "list" && (
            <>
              {editorExercises.length === 0 && <div style={S.empty}>「種目を追加」から追加してください。</div>}
              {editorExercises.map((name, i) => {
                const m = masterExercises.find(e => e.name === name);
                const mc = MUSCLE_COLORS[m?.muscle] || "#94a3b8";
                return (
                  <div key={name + i} ref={el => editorSort.itemRefs.current[i] = el} style={{ ...S.exEditRow, borderLeftColor: mc }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                      <span style={{ color: "#64748b", fontSize: 22, cursor: "grab", padding: "4px 6px", touchAction: "none" }} onTouchStart={editorSort.onTouchStart(i)}>☰</span>
                      <div>
                        <div style={{ ...S.muscleBadge, color: mc, borderColor: mc, marginBottom: 2 }}>{m?.muscle || "その他"}</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{name}</div>
                      </div>
                    </div>
                    <button style={{ background: "none", border: "none", color: "#ef4444", fontSize: 20, cursor: "pointer", padding: "0 8px" }}
                      onClick={() => setEditorExercises(p => p.filter((_, j) => j !== i))}>×</button>
                  </div>
                );
              })}
            </>
          )}
          {edTab === "add" && Object.entries(grouped).map(([muscle, exList]) => (
            <div key={muscle}>
              <div style={{ ...S.muscleLabel, color: MUSCLE_COLORS[muscle] || "#94a3b8" }}>{muscle}</div>
              {exList.map(ex => {
                const already = editorExercises.includes(ex.name);
                return (
                  <button key={ex.name} style={{ ...S.exPickRow, background: already ? "#1e3a5f" : "#111827", borderColor: already ? "#3b82f6" : "#1e293b" }}
                    onClick={() => setEditorExercises(p => already ? p.filter(x => x !== ex.name) : [...p, ex.name])}>
                    <span style={{ color: already ? "#93c5fd" : "#cbd5e1" }}>{ex.name}</span>
                    <span style={{ color: already ? "#ef4444" : "#334155", fontSize: 20, fontWeight: 700 }}>{already ? "×" : "+"}</span>
                  </button>
                );
              })}
            </div>
          ))}
          <div style={{ height: 40 }} />
        </div>
      </div>
    );
  }

  // ── WORKOUT ──
  if (view === "workout") {
    return (
      <div style={S.app}>
        <ExModal exModal={exModal} setExModal={setExModal} onSave={saveExModal} />
        {setModal && !setModal.isRecordEdit && (
          <div style={S.modalOverlay} onClick={() => setSetModal(null)}>
            <div style={S.modalBox} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 13, color: MUSCLE_COLORS[setModal.muscle] || "#94a3b8", fontWeight: 700, marginBottom: 2 }}>{setModal.exName}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>セット {setModal.si + 1} の記録を編集</div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 20 }}>
                <div style={S.modalField}><div style={S.modalLabel}>重量</div><input style={S.modalInput} type="number" value={setModal.weight} onChange={e => setSetModal(p => ({ ...p, weight: parseFloat(e.target.value) || 0 }))} /><div style={S.modalUnit}>kg</div></div>
                <div style={S.modalField}><div style={S.modalLabel}>回数</div><input style={S.modalInput} type="number" value={setModal.reps} onChange={e => setSetModal(p => ({ ...p, reps: parseInt(e.target.value) || 0 }))} /><div style={S.modalUnit}>回</div></div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ ...S.modalBtn, background: "#1e293b", color: "#94a3b8", flex: 1 }} onClick={() => setSetModal(null)}>キャンセル</button>
                <button style={{ ...S.modalBtn, background: "#f97316", color: "#000", flex: 1, fontWeight: 800 }} onClick={() => { setSetOverrides(p => ({ ...p, [`${setModal.exId}-${setModal.si}`]: { weight: setModal.weight, reps: setModal.reps } })); setSetModal(null); }}>保存</button>
              </div>
            </div>
          </div>
        )}
        {nextSetModal && (
          <div style={S.modalOverlay}>
            <div style={S.modalBox}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>🔔 レスト終了まで20秒</div>
              <div style={{ fontSize: 13, color: MUSCLE_COLORS[nextSetModal.muscle] || "#94a3b8", fontWeight: 700, marginBottom: 2 }}>{nextSetModal.exName}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>次のセット（{nextSetModal.si + 1}）の内容</div>
              {!nextSetModal.editing ? (
                <>
                  <div style={{ display: "flex", gap: 12, justifyContent: "center", margin: "16px 0" }}>
                    <div style={{ textAlign: "center" }}><div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>重量</div><div style={{ fontSize: 24, fontWeight: 800, color: "#f1f5f9" }}>{nextSetModal.weight}<span style={{ fontSize: 12, color: "#64748b", marginLeft: 2 }}>kg</span></div></div>
                    <div style={{ textAlign: "center" }}><div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>回数</div><div style={{ fontSize: 24, fontWeight: 800, color: "#f1f5f9" }}>{nextSetModal.reps}<span style={{ fontSize: 12, color: "#64748b", marginLeft: 2 }}>回</span></div></div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ ...S.modalBtn, background: "#1e293b", color: "#94a3b8", flex: 1, fontSize: 13 }} onClick={() => setNextSetModal(p => ({ ...p, editing: true }))}>変更する</button>
                    <button style={{ ...S.modalBtn, background: "#f97316", color: "#000", flex: 2, fontWeight: 800 }} onClick={() => setNextSetModal(null)}>そのままでOK</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", gap: 12, justifyContent: "center", margin: "16px 0" }}>
                    <div style={S.modalField}><div style={S.modalLabel}>重量</div><input style={S.modalInput} type="number" value={nextSetModal.weight} onChange={e => setNextSetModal(p => ({ ...p, weight: parseFloat(e.target.value) || 0 }))} /><div style={S.modalUnit}>kg</div></div>
                    <div style={S.modalField}><div style={S.modalLabel}>回数</div><input style={S.modalInput} type="number" value={nextSetModal.reps} onChange={e => setNextSetModal(p => ({ ...p, reps: parseInt(e.target.value) || 0 }))} /><div style={S.modalUnit}>回</div></div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ ...S.modalBtn, background: "#1e293b", color: "#94a3b8", flex: 1 }} onClick={() => setNextSetModal(p => ({ ...p, editing: false }))}>戻る</button>
                    <button style={{ ...S.modalBtn, background: "#f97316", color: "#000", flex: 1, fontWeight: 800 }} onClick={() => { setSetOverrides(p => ({ ...p, [`${nextSetModal.exId}-${nextSetModal.si}`]: { weight: nextSetModal.weight, reps: nextSetModal.reps } })); setNextSetModal(null); }}>保存</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        <div style={S.header}>
          <button style={S.backBtn} onClick={() => { if (window.confirm("終了して破棄しますか？")) { stopRest(); clearInterval(elapsedRef.current); setView("home"); } }}>←</button>
          <div style={{ flex: 1 }}>
            <div style={S.headerTitle}>{menuName}</div>
            <div style={S.headerSub}>{doneSets}/{totalSets}セット · {elapsedStr}</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {menuId && <button style={{ ...S.iconBtn, background: "#1e3a5f" }} onClick={saveToMenu}>💾</button>}
            <button style={S.finishBtn} onClick={finishWorkout}>保存</button>
          </div>
        </div>
        <div style={S.progTrack}><div style={{ ...S.progBar, width: `${totalSets > 0 ? doneSets / totalSets * 100 : 0}%` }} /></div>
        {restTimer && (
          <div style={S.timerFloat}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
              <div style={S.timerFloatNum}>{formatTime(restTimer.rem)}</div>
              <div style={{ flex: 1 }}>
                <div style={S.timerName}>{restTimer.name} · レスト中</div>
                <div style={S.timerTrack}><div style={{ ...S.timerFill, width: `${(1 - restTimer.rem / restTimer.total) * 100}%` }} /></div>
              </div>
            </div>
            <button style={S.timerSkip} onClick={stopRest}>スキップ ×</button>
          </div>
        )}
        <div style={S.scroll} ref={workoutScrollRef} onTouchMove={workoutSort.onTouchMove} onTouchEnd={workoutSort.onTouchEnd}>
          {exercises.map((ex, idx) => {
            const allDone = Array.from({ length: ex.sets }, (_, i) => !!checkedSets[`${ex.id}-${i}`]).every(Boolean) && ex.sets > 0;
            const mc = MUSCLE_COLORS[ex.muscle] || "#94a3b8";
            return (
              <div key={ex.id} ref={el => { workoutSort.itemRefs.current[idx] = el; cardRefs.current[ex.id] = el; }} style={{ ...S.card, opacity: allDone ? 0.5 : 1, borderLeftColor: mc }}>
                <div style={S.cardTop}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ color: "#475569", fontSize: 22, cursor: "grab", marginTop: 2, padding: "2px 4px", touchAction: "none" }} onTouchStart={workoutSort.onTouchStart(idx)}>☰</span>
                    <div>
                      <div style={{ ...S.muscleBadge, color: mc, borderColor: mc }}>{ex.muscle}</div>
                      <div style={S.exName}>{ex.name}</div>
                    </div>
                  </div>
                  <button style={{ background: "none", border: "none", color: "#475569", fontSize: 18, cursor: "pointer", padding: "0 4px" }} onClick={() => removeEx(ex.id)}>×</button>
                </div>
                <div style={{ ...S.editors, marginBottom: 4 }}>
                  <div style={S.edGroup}><div style={S.edLabel}>重量</div><input style={S.edInput} type="number" value={exDV(ex, "weight")} onChange={e => updateEx(ex.id, "weight", e.target.value)} onBlur={e => { if (e.target.value === "") setExercises(p => p.map(v => v.id === ex.id ? { ...v, weight: 0, weight_raw: undefined } : v)); }} /><div style={S.edUnit}>kg</div></div>
                  <div style={S.edGroup}><div style={S.edLabel}>回数</div><input style={S.edInput} type="number" value={exDV(ex, "reps")} onChange={e => updateEx(ex.id, "reps", e.target.value)} onBlur={e => { if (e.target.value === "") setExercises(p => p.map(v => v.id === ex.id ? { ...v, reps: 1, reps_raw: undefined } : v)); }} /><div style={S.edUnit}>回</div></div>
                  <div style={S.edGroup}><div style={S.edLabel}>セット</div><input style={S.edInput} type="number" value={exDV(ex, "sets")} onChange={e => updateEx(ex.id, "sets", e.target.value)} onBlur={e => { if (e.target.value === "") setExercises(p => p.map(v => v.id === ex.id ? { ...v, sets: 0, sets_raw: undefined } : v)); }} /><div style={S.edUnit}>set</div></div>
                </div>
                <div style={{ ...S.editors, marginTop: 0 }}>
                  <div style={S.edGroup}><div style={S.edLabel}>REST</div><input style={{ ...S.edInput, width: 56 }} type="number" value={exDV(ex, "rest")} onChange={e => updateEx(ex.id, "rest", e.target.value)} onBlur={e => { if (e.target.value === "") setExercises(p => p.map(v => v.id === ex.id ? { ...v, rest: 0, rest_raw: undefined } : v)); }} /><div style={S.edUnit}>秒</div></div>
                </div>
                <div style={S.setRow}>
                  {ex.sets > 0 && Array.from({ length: ex.sets }, (_, i) => {
                    const done = !!checkedSets[`${ex.id}-${i}`];
                    const ov = setOverrides[`${ex.id}-${i}`];
                    return (
                      <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <button style={{ ...S.setBtn, ...(done ? { background: mc, color: "#000", borderColor: mc } : {}), ...(ov ? { borderColor: "#f97316" } : {}) }} onClick={() => toggleSet(ex.id, i)}>{done ? "✓" : i + 1}</button>
                          <button style={{ background: "none", border: "none", color: "#475569", fontSize: 13, cursor: "pointer", padding: "0 2px" }} onClick={() => { const { weight, reps } = getSetVal(ex, i); setSetModal({ exId: ex.id, si: i, weight, reps, exName: ex.name, muscle: ex.muscle }); }}>✏️</button>
                        </div>
                        {ov && <div style={{ fontSize: 9, color: "#f97316", textAlign: "center", lineHeight: 1.2 }}>{ov.weight}kg<br />{ov.reps}回</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div style={{ padding: "8px 12px" }}>
            <button style={{ ...S.buildCard, marginTop: 0 }} onClick={() => setShowAddEx(p => !p)}>{showAddEx ? "▲ 閉じる" : "＋ 種目を追加"}</button>
          </div>
          {showAddEx && Object.entries(grouped).map(([muscle, exList]) => (
            <div key={muscle}>
              <div style={{ ...S.muscleLabel, color: MUSCLE_COLORS[muscle] || "#94a3b8" }}>{muscle}</div>
              {exList.map(ex => {
                const already = exercises.some(e => e.name === ex.name);
                return (
                  <button key={ex.name} style={{ ...S.exPickRow, background: already ? "#1a2a1a" : "#111827", borderColor: already ? "#334155" : "#1e293b" }} onClick={() => { if (!already) addExToWorkout(ex.name); }}>
                    <span style={{ color: already ? "#4ade80" : "#cbd5e1" }}>{ex.name}</span>
                    <span style={{ color: already ? "#4ade80" : "#334155", fontSize: 16 }}>{already ? "✓" : "+"}</span>
                  </button>
                );
              })}
            </div>
          ))}
          <div style={{ height: 60 }} />
        </div>
      </div>
    );
  }

  // ── HISTORY ──
  if (view === "history") return (
    <div style={S.app}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={() => setView("home")}>←</button>
        <div style={S.headerTitle}>トレーニング履歴</div>
      </div>
      <div style={S.scroll}>
        {history.length === 0 && <div style={S.empty}>まだ記録がありません</div>}
        {history.map(r => {
          const td = r.exercises.reduce((s, e) => s + e.done.filter(Boolean).length, 0);
          const ta = r.exercises.reduce((s, e) => s + e.sets, 0);
          return (
            <button key={r.id} style={S.histRow} onClick={() => { setSelectedHistory(r); setView("detail"); }}>
              <div><div style={S.histDate}>{formatDate(r.date)}</div><div style={S.histMenu}>{r.menuName}</div></div>
              <div style={{ textAlign: "right" }}><div style={S.histDur}>{r.duration}分</div><div style={S.histSets}>{td}/{ta}セット</div></div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── DETAIL ──
  if (view === "detail" && selectedHistory) {
    const r = selectedHistory;
    return (
      <div style={S.app}>
        <div style={S.header}>
          <button style={S.backBtn} onClick={() => setView("home")}>←</button>
          <div style={{ flex: 1 }}>
            <div style={S.headerTitle}>{formatDate(r.date)}</div>
            <div style={S.headerSub}>{r.menuName} · {r.duration}分</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={{ ...S.iconBtn, background: "#1e3a5f", fontSize: 16 }} onClick={() => resumeFromRecord(r)}>▶</button>
            <button style={{ ...S.iconBtn, fontSize: 16 }} onClick={() => startEditRecord(r)}>✏️</button>
            <button style={{ ...S.iconBtn, color: "#ef4444" }} onClick={() => deleteRecord(r.id)}>🗑</button>
          </div>
        </div>
        <div style={S.scroll}>
          {r.exercises.map((ex, i) => {
            const mc = MUSCLE_COLORS[ex.muscle] || "#94a3b8";
            const done = ex.done.filter(Boolean).length;
            return (
              <div key={i} style={{ ...S.card, borderLeftColor: mc }}>
                <div style={{ ...S.muscleBadge, color: mc, borderColor: mc, marginBottom: 4 }}>{ex.muscle}</div>
                <div style={S.exName}>{ex.name}</div>
                <div style={{ color: "#94a3b8", fontSize: 12, margin: "6px 0 8px" }}>
                  デフォルト：{ex.weight > 0 ? `${ex.weight}kg × ` : "BW × "}{ex.reps}回
                  <span style={{ marginLeft: 10, color: done === ex.sets ? "#4ade80" : "#64748b" }}>{done}/{ex.sets}セット完了</span>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {ex.done.map((c, si) => {
                    const sd = ex.setData?.[si];
                    return (
                      <div key={si} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: c ? mc : "#1e293b", border: `1px solid ${c ? mc : "#334155"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: c ? "#000" : "#475569" }}>{c ? "✓" : si + 1}</div>
                        {sd && (sd.weight !== ex.weight || sd.reps !== ex.reps) && <div style={{ fontSize: 9, color: "#f97316", textAlign: "center", lineHeight: 1.3 }}>{sd.weight}kg<br />{sd.reps}回</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div style={{ height: 40 }} />
        </div>
      </div>
    );
  }

  // ── EDIT RECORD ──
  if (view === "editRecord" && editingRecord) {
    return (
      <div style={S.app}>
        {setModal?.isRecordEdit && (
          <div style={S.modalOverlay} onClick={() => setSetModal(null)}>
            <div style={S.modalBox} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 13, color: MUSCLE_COLORS[setModal.muscle] || "#94a3b8", fontWeight: 700, marginBottom: 2 }}>{setModal.exName}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>セット {setModal.si + 1} の記録を編集</div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 20 }}>
                <div style={S.modalField}><div style={S.modalLabel}>重量</div><input style={S.modalInput} type="number" value={setModal.weight} onChange={e => setSetModal(p => ({ ...p, weight: parseFloat(e.target.value) || 0 }))} /><div style={S.modalUnit}>kg</div></div>
                <div style={S.modalField}><div style={S.modalLabel}>回数</div><input style={S.modalInput} type="number" value={setModal.reps} onChange={e => setSetModal(p => ({ ...p, reps: parseInt(e.target.value) || 0 }))} /><div style={S.modalUnit}>回</div></div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ ...S.modalBtn, background: "#1e293b", color: "#94a3b8", flex: 1 }} onClick={() => setSetModal(null)}>キャンセル</button>
                <button style={{ ...S.modalBtn, background: "#f97316", color: "#000", flex: 1, fontWeight: 800 }} onClick={() => {
                  setEditingRecord(p => ({ ...p, exercises: p.exercises.map((x, j) => j !== setModal.ei ? x : { ...x, setData: x.setData.map((sd, k) => k === setModal.si ? { weight: setModal.weight, reps: setModal.reps } : sd) }) }));
                  setSetModal(null);
                }}>保存</button>
              </div>
            </div>
          </div>
        )}
        <div style={S.header}>
          <button style={S.backBtn} onClick={() => setView("detail")}>←</button>
          <div style={{ flex: 1 }}>
            <div style={S.headerTitle}>{formatDate(editingRecord.date)}</div>
            <div style={S.headerSub}>{editingRecord.menuName} を編集中</div>
          </div>
          <button style={S.finishBtn} onClick={saveEditRecord}>保存</button>
        </div>
        <div style={{ display: "flex", borderBottom: "1px solid #1e293b" }}>
          <button style={{ ...S.tab, ...(erTab === "list" ? S.tabActive : {}) }} onClick={() => setErTab("list")}>記録を編集</button>
          <button style={{ ...S.tab, ...(erTab === "add" ? S.tabActive : {}) }} onClick={() => setErTab("add")}>種目を追加</button>
        </div>
        <div style={S.scroll}>
          {erTab === "list" && editingRecord.exercises.map((ex, ei) => {
            const mc = MUSCLE_COLORS[ex.muscle] || "#94a3b8";
            return (
              <div key={ei} style={{ ...S.card, borderLeftColor: mc }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ ...S.muscleBadge, color: mc, borderColor: mc, marginBottom: 4 }}>{ex.muscle}</div>
                    <div style={S.exName}>{ex.name}</div>
                  </div>
                  <button style={{ background: "none", border: "none", color: "#ef4444", fontSize: 18, cursor: "pointer" }}
                    onClick={() => setEditingRecord(p => ({ ...p, exercises: p.exercises.filter((_, j) => j !== ei) }))}>×</button>
                </div>
                <div style={{ ...S.editors, marginBottom: 4 }}>
                  <div style={S.edGroup}><div style={S.edLabel}>重量</div><input style={S.edInput} type="number" value={ex.weight} onChange={e => setEditingRecord(p => ({ ...p, exercises: p.exercises.map((x, j) => j === ei ? { ...x, weight: parseFloat(e.target.value) || 0 } : x) }))} /><div style={S.edUnit}>kg</div></div>
                  <div style={S.edGroup}><div style={S.edLabel}>回数</div><input style={S.edInput} type="number" value={ex.reps} onChange={e => setEditingRecord(p => ({ ...p, exercises: p.exercises.map((x, j) => j === ei ? { ...x, reps: parseInt(e.target.value) || 0 } : x) }))} /><div style={S.edUnit}>回</div></div>
                  <div style={S.edGroup}><div style={S.edLabel}>セット</div>
                    <input style={S.edInput} type="number" value={ex.sets} onChange={e => {
                      const ns = parseInt(e.target.value) || 0;
                      setEditingRecord(p => ({ ...p, exercises: p.exercises.map((x, j) => j !== ei ? x : { ...x, sets: ns, done: Array.from({ length: ns }, (_, k) => x.done[k] ?? false), setData: Array.from({ length: ns }, (_, k) => x.setData?.[k] ?? { weight: x.weight, reps: x.reps }) }) }));
                    }} /><div style={S.edUnit}>set</div></div>
                </div>
                <div style={S.setRow}>
                  {ex.done.map((c, si) => {
                    const sd = ex.setData?.[si] || { weight: ex.weight, reps: ex.reps };
                    const isCustom = sd.weight !== ex.weight || sd.reps !== ex.reps;
                    return (
                      <div key={si} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <button style={{ ...S.setBtn, ...(c ? { background: mc, color: "#000", borderColor: mc } : {}), ...(isCustom ? { borderColor: "#f97316" } : {}) }}
                            onClick={() => setEditingRecord(p => ({ ...p, exercises: p.exercises.map((x, j) => j !== ei ? x : { ...x, done: x.done.map((d, k) => k === si ? !d : d) }) }))}>
                            {c ? "✓" : si + 1}
                          </button>
                          <button style={{ background: "none", border: "none", color: "#475569", fontSize: 13, cursor: "pointer", padding: "0 2px" }}
                            onClick={() => setSetModal({ exId: String(ei), si, weight: sd.weight, reps: sd.reps, exName: ex.name, muscle: ex.muscle, isRecordEdit: true, ei })}>✏️</button>
                        </div>
                        {isCustom && <div style={{ fontSize: 9, color: "#f97316", textAlign: "center", lineHeight: 1.2 }}>{sd.weight}kg<br />{sd.reps}回</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {erTab === "add" && Object.entries(grouped).map(([muscle, exList]) => (
            <div key={muscle}>
              <div style={{ ...S.muscleLabel, color: MUSCLE_COLORS[muscle] || "#94a3b8" }}>{muscle}</div>
              {exList.map(ex => {
                const already = editingRecord.exercises.some(e => e.name === ex.name);
                return (
                  <button key={ex.name} style={{ ...S.exPickRow, background: already ? "#1a2a1a" : "#111827", borderColor: already ? "#334155" : "#1e293b" }}
                    onClick={() => {
                      if (already) return;
                      const newEx = { name: ex.name, muscle: ex.muscle, weight: ex.defaultWeight, reps: ex.defaultReps, sets: ex.defaultSets, done: Array.from({ length: ex.defaultSets }, () => false), setData: Array.from({ length: ex.defaultSets }, () => ({ weight: ex.defaultWeight, reps: ex.defaultReps })) };
                      setEditingRecord(p => ({ ...p, exercises: [...p.exercises, newEx] }));
                    }}>
                    <span style={{ color: already ? "#4ade80" : "#cbd5e1" }}>{ex.name}</span>
                    <span style={{ color: already ? "#4ade80" : "#334155", fontSize: 16 }}>{already ? "✓" : "+"}</span>
                  </button>
                );
              })}
            </div>
          ))}
          <div style={{ height: 60 }} />
        </div>
      </div>
    );
  }

  return null;
}
