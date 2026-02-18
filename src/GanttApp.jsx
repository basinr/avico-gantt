import { useState, useRef, useCallback, useEffect } from "react";

const CUSTOMERS = [
  { id: "maniya", name: "Maniya Health", color: "#58A6FF" },
  { id: "ar", name: "Adv. Retina", color: "#7EE787" },
  { id: "curreri", name: "Curreri", color: "#D2A8FF" },
  { id: "ain", name: "AIN", color: "#FFA657" },
];

const CUSTOMER_MAP = Object.fromEntries(CUSTOMERS.map((c) => [c.id, c]));

const DEFAULT_MILESTONES = [
  { id: "1", customer: "maniya", feature: "In/Out Network + Primary/Secondary Coverage", date: "2026-02-20" },
  { id: "2", customer: "maniya", feature: "Write Back to Practice Fusion", date: "2026-02-25" },
  { id: "3", customer: "maniya", feature: "Scheduled Runs (Hourly)", date: "2026-03-02" },
  { id: "4", customer: "ar", feature: "Benefits Verification — Production Testing", date: "2026-02-27" },
  { id: "5", customer: "ar", feature: "Referral Management — Production Testing", date: "2026-03-02" },
  { id: "6", customer: "ar", feature: "Benefits Verification — Production Launch", date: "2026-03-13" },
  { id: "7", customer: "ar", feature: "Referral Management — Production Launch", date: "2026-03-20" },
  { id: "8", customer: "curreri", feature: "Criterions EHR Integration Setup", date: "2026-03-09" },
  { id: "9", customer: "curreri", feature: "Benefits Verification — Production Testing", date: "2026-03-16" },
  { id: "10", customer: "ain", feature: "Veradigm Integration Setup", date: "2026-03-09" },
  { id: "11", customer: "curreri", feature: "Benefits Verification — Production Launch", date: "2026-03-23" },
  { id: "12", customer: "ar", feature: "Prior Authorization", date: "2026-04-22" },
  { id: "13", customer: "curreri", feature: "Prior Authorization", date: "2026-04-15" },
  { id: "14", customer: "ain", feature: "Benefits Verification + Cost Estimates", date: "2026-04-30" },
  { id: "15", customer: "ain", feature: "Prior Authorization", date: "2026-05-20" },
];

const STORAGE_KEY = "avico-gantt-milestones";

const START = new Date(2026, 1, 16);
const END = new Date(2026, 4, 24);
const TOTAL_DAYS = Math.round((END - START) / 86400000);
const TODAY = new Date(2026, 1, 18);

function parseDate(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function shortDate(str) {
  const d = parseDate(str);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function dayOffset(date) {
  return Math.round((date - START) / 86400000);
}

function pct(days) {
  return (days / TOTAL_DAYS) * 100;
}

function getWeeks() {
  const weeks = [];
  let d = new Date(START);
  while (d < END) {
    weeks.push(new Date(d));
    d = new Date(d.getTime() + 7 * 86400000);
  }
  return weeks;
}

const WEEKS = getWeeks();

const MONTHS = [
  { name: "February", start: new Date(2026, 1, 16), end: new Date(2026, 1, 28) },
  { name: "March", start: new Date(2026, 2, 1), end: new Date(2026, 2, 31) },
  { name: "April", start: new Date(2026, 3, 1), end: new Date(2026, 3, 30) },
  { name: "May", start: new Date(2026, 4, 1), end: new Date(2026, 4, 24) },
];

function nextId(milestones) {
  return String(Math.max(0, ...milestones.map((m) => parseInt(m.id))) + 1);
}

// Modal component
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />
      <div style={{ position: "relative", background: "#1C2330", border: "1px solid #2A3140", borderRadius: 14, padding: "28px 32px", width: 420, maxWidth: "90vw", zIndex: 101, boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#E6EDF3", margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#8B949E", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: 4 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "8px 12px",
  background: "#0E1117",
  border: "1px solid #2A3140",
  borderRadius: 8,
  color: "#E6EDF3",
  fontSize: 13,
  fontFamily: "'DM Sans', sans-serif",
  outline: "none",
};

const selectStyle = { ...inputStyle, cursor: "pointer" };

const btnPrimary = {
  padding: "8px 20px",
  background: "#58A6FF",
  color: "#0E1117",
  border: "none",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
};

const btnSecondary = {
  padding: "8px 20px",
  background: "transparent",
  color: "#8B949E",
  border: "1px solid #2A3140",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
};

const btnDanger = {
  padding: "8px 20px",
  background: "#F8514922",
  color: "#F85149",
  border: "1px solid #F8514944",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
};

const labelStyle = { display: "block", fontSize: 11, fontWeight: 600, color: "#8B949E", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 };

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < breakpoint);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

export default function GanttApp() {
  const isMobile = useIsMobile();
  const [milestones, setMilestones] = useState(DEFAULT_MILESTONES);
  const [loaded, setLoaded] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOrigDate, setDragOrigDate] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const chartRefs = useRef({});

  // Load from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMilestones(parsed);
        }
      }
    } catch (e) { /* no stored data */ }
    setLoaded(true);
  }, []);

  // Save to storage
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(milestones));
    } catch (e) { /* ignore */ }
  }, [milestones, loaded]);

  const sorted = [...milestones].sort((a, b) => {
    const cOrder = CUSTOMERS.findIndex((c) => c.id === a.customer) - CUSTOMERS.findIndex((c) => c.id === b.customer);
    if (cOrder !== 0) return cOrder;
    return a.date.localeCompare(b.date);
  });

  // Drag logic (mouse + touch)
  const getClientX = (e) => e.touches ? e.touches[0].clientX : e.clientX;

  const handleDragStart = useCallback((e, id) => {
    e.preventDefault();
    const m = milestones.find((x) => x.id === id);
    if (!m) return;
    setDragId(id);
    setDragStartX(getClientX(e));
    setDragOrigDate(m.date);
  }, [milestones]);

  const handleDragMove = useCallback((e) => {
    if (!dragId) return;
    const ref = chartRefs.current[dragId];
    if (!ref) return;
    const rect = ref.getBoundingClientRect();
    const chartWidth = rect.width;
    const dx = getClientX(e) - dragStartX;
    const daysDelta = Math.round((dx / chartWidth) * TOTAL_DAYS);
    const origDate = parseDate(dragOrigDate);
    const newDate = new Date(origDate.getTime() + daysDelta * 86400000);
    if (newDate >= START && newDate <= END) {
      setMilestones((prev) => prev.map((m) => (m.id === dragId ? { ...m, date: formatDate(newDate) } : m)));
    }
  }, [dragId, dragStartX, dragOrigDate]);

  const handleDragEnd = useCallback(() => {
    setDragId(null);
    setDragOrigDate(null);
  }, []);

  useEffect(() => {
    if (dragId) {
      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchmove", handleDragMove, { passive: false });
      window.addEventListener("touchend", handleDragEnd);
      return () => {
        window.removeEventListener("mousemove", handleDragMove);
        window.removeEventListener("mouseup", handleDragEnd);
        window.removeEventListener("touchmove", handleDragMove);
        window.removeEventListener("touchend", handleDragEnd);
      };
    }
  }, [dragId, handleDragMove, handleDragEnd]);

  // Add form
  const [addForm, setAddForm] = useState({ customer: "maniya", feature: "", date: "2026-03-01" });

  const handleAdd = () => {
    if (!addForm.feature.trim()) return;
    setMilestones((prev) => [...prev, { id: nextId(prev), customer: addForm.customer, feature: addForm.feature.trim(), date: addForm.date }]);
    setAddForm({ customer: "maniya", feature: "", date: "2026-03-01" });
    setAddOpen(false);
  };

  // Edit form
  const editMilestone = milestones.find((m) => m.id === editId);
  const [editForm, setEditForm] = useState({ customer: "", feature: "", date: "" });

  useEffect(() => {
    if (editMilestone) {
      setEditForm({ customer: editMilestone.customer, feature: editMilestone.feature, date: editMilestone.date });
    }
  }, [editId]);

  const handleEditSave = () => {
    if (!editForm.feature.trim()) return;
    setMilestones((prev) => prev.map((m) => (m.id === editId ? { ...m, ...editForm, feature: editForm.feature.trim() } : m)));
    setEditId(null);
  };

  const handleDelete = () => {
    setMilestones((prev) => prev.filter((m) => m.id !== editId));
    setEditId(null);
  };

  const handleReset = () => {
    setMilestones(DEFAULT_MILESTONES);
    try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
  };

  const todayPct = pct(dayOffset(TODAY));

  return (
    <div style={{ background: "#0E1117", color: "#E6EDF3", fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", padding: isMobile ? "16px 12px" : "20px 24px", userSelect: dragId ? "none" : "auto" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, letterSpacing: -0.5, margin: 0 }}>Feature Launch Schedule</h1>
          <p style={{ color: "#8B949E", fontSize: 12, fontFamily: "'DM Mono', monospace", margin: "4px 0 0" }}>Avico Health AI · Feb – May 2026</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setAddOpen(true)} style={btnPrimary}>{isMobile ? "+" : "+ Add Milestone"}</button>
          <button onClick={handleReset} style={btnSecondary}>Reset</button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: isMobile ? 10 : 16, flexWrap: "wrap", marginBottom: 14 }}>
        {CUSTOMERS.map((c) => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500 }}>
            <div style={{ width: 8, height: 8, borderRadius: 3, background: c.color, flexShrink: 0 }} />
            <span>{c.name}</span>
          </div>
        ))}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, marginLeft: 8, color: "#8B949E" }}>
            <span style={{ fontSize: 11 }}>⟵ drag bars to reschedule · click to edit ⟶</span>
          </div>
        )}
      </div>

      {/* Gantt */}
      <div style={{ background: "#161B22", border: "1px solid #2A3140", borderRadius: 12, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "150px 1fr" : "220px 1fr", minWidth: 700 }}>
            {/* Month header */}
            <div style={{ padding: "10px 16px", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.2, color: "#8B949E", borderBottom: "1px solid #2A3140", borderRight: "1px solid #2A3140", background: "#161B22", position: "sticky", top: 0, zIndex: 20 }}>
              Feature
            </div>
            <div style={{ borderBottom: "1px solid #2A3140", background: "#161B22", display: "flex", position: "sticky", top: 0, zIndex: 20 }}>
              {MONTHS.map((m, i) => {
                const mStart = m.start < START ? START : m.start;
                const mEnd = m.end > END ? END : m.end;
                const mDays = Math.round((mEnd - mStart) / 86400000) + 1;
                return (
                  <div key={i} style={{ flex: mDays, textAlign: "center", padding: "10px 0", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.2, color: "#8B949E", borderRight: i < MONTHS.length - 1 ? "1px solid #2A3140" : "none" }}>
                    {m.name}
                  </div>
                );
              })}
            </div>

            {/* Week sub-header */}
            <div style={{ borderBottom: "1px solid #2A3140", borderRight: "1px solid #2A3140", background: "#161B22", position: "sticky", top: 37, zIndex: 20 }} />
            <div style={{ borderBottom: "1px solid #2A3140", display: "flex", background: "#161B22", position: "sticky", top: 37, zIndex: 20 }}>
              {WEEKS.map((w, i) => (
                <div key={i} style={{ flex: 1, textAlign: "center", padding: "3px 0", fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#8B949E", borderRight: i < WEEKS.length - 1 ? "1px solid rgba(42,49,64,0.5)" : "none", opacity: 0.7 }}>
                  {w.getMonth() + 1}/{w.getDate()}
                </div>
              ))}
            </div>

            {/* Rows */}
            {sorted.map((m, idx) => {
              const c = CUSTOMER_MAP[m.customer];
              const d = parseDate(m.date);
              const off = dayOffset(d);
              const leftPct = pct(off);
              const isHover = hoverId === m.id;
              const isDrag = dragId === m.id;

              return [
                // Label
                <div
                  key={`label-${m.id}`}
                  onClick={() => setEditId(m.id)}
                  style={{
                    padding: isMobile ? "4px 8px" : "5px 14px",
                    borderBottom: idx < sorted.length - 1 ? "1px solid #2A3140" : "none",
                    borderRight: "1px solid #2A3140",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    minHeight: 36,
                    cursor: "pointer",
                    background: isHover ? "rgba(255,255,255,0.03)" : idx % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={() => setHoverId(m.id)}
                  onMouseLeave={() => setHoverId(null)}
                >
                  <div style={{ fontSize: isMobile ? 8 : 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: isMobile ? 0.5 : 1, color: c?.color || "#8B949E", marginBottom: 1 }}>
                    {c?.name || m.customer}
                  </div>
                  <div style={{ fontSize: isMobile ? 10 : 12, fontWeight: 500, lineHeight: 1.3 }}>{m.feature}</div>
                </div>,
                // Chart
                <div
                  key={`chart-${m.id}`}
                  ref={(el) => (chartRefs.current[m.id] = el)}
                  style={{
                    borderBottom: idx < sorted.length - 1 ? "1px solid #2A3140" : "none",
                    position: "relative",
                    minHeight: 36,
                    background: isHover ? "rgba(255,255,255,0.02)" : idx % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={() => setHoverId(m.id)}
                  onMouseLeave={() => setHoverId(null)}
                >
                  {/* Week grid lines */}
                  {WEEKS.map((w, i) => (
                    <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: `${pct(dayOffset(w))}%`, width: 1, background: "rgba(42,49,64,0.4)" }} />
                  ))}
                  {/* Today line */}
                  <div style={{ position: "absolute", top: 0, bottom: 0, left: `${todayPct}%`, width: 2, background: "#F85149", zIndex: 5, opacity: 0.6 }}>
                    {idx === 0 && (
                      <div style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", fontSize: 8, fontFamily: "'DM Mono', monospace", color: "#F85149", whiteSpace: "nowrap", fontWeight: 500 }}>
                        TODAY
                      </div>
                    )}
                  </div>
                  {/* Bar */}
                  <div
                    onMouseDown={(e) => handleDragStart(e, m.id)}
                    onTouchStart={(e) => handleDragStart(e, m.id)}
                    onClick={(e) => { if (!dragOrigDate) setEditId(m.id); }}
                    style={{
                      position: "absolute",
                      top: "50%",
                      transform: "translateY(-50%)",
                      left: `${leftPct}%`,
                      minWidth: 42,
                      width: `${Math.max(pct(3), 2.5)}%`,
                      height: 22,
                      borderRadius: 5,
                      background: c?.color || "#888",
                      color: "#0E1117",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 600,
                      fontFamily: "'DM Mono', monospace",
                      cursor: isDrag ? "grabbing" : "grab",
                      zIndex: isDrag ? 15 : 2,
                      boxShadow: isDrag ? `0 0 16px ${c?.color}44` : isHover ? `0 0 12px ${c?.color}33` : "none",
                      transition: isDrag ? "none" : "box-shadow 0.2s",
                      whiteSpace: "nowrap",
                      touchAction: "none",
                    }}
                  >
                    {shortDate(m.date)}
                  </div>
                </div>,
              ];
            })}
        </div>
      </div>

      <div style={{ marginTop: 12, textAlign: "center", color: "#8B949E", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
        {milestones.length} milestones · Feb 16 – May 24, 2026{isMobile && " · swipe to scroll"}
      </div>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Milestone">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>Customer</label>
            <select value={addForm.customer} onChange={(e) => setAddForm((f) => ({ ...f, customer: e.target.value }))} style={selectStyle}>
              {CUSTOMERS.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Feature Name</label>
            <input value={addForm.feature} onChange={(e) => setAddForm((f) => ({ ...f, feature: e.target.value }))} placeholder="e.g. Benefits Verification — Production Launch" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Target Date</label>
            <input type="date" value={addForm.date} onChange={(e) => setAddForm((f) => ({ ...f, date: e.target.value }))} style={inputStyle} />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <button onClick={() => setAddOpen(false)} style={btnSecondary}>Cancel</button>
            <button onClick={handleAdd} style={btnPrimary}>Add</button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editId} onClose={() => setEditId(null)} title="Edit Milestone">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>Customer</label>
            <select value={editForm.customer} onChange={(e) => setEditForm((f) => ({ ...f, customer: e.target.value }))} style={selectStyle}>
              {CUSTOMERS.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Feature Name</label>
            <input value={editForm.feature} onChange={(e) => setEditForm((f) => ({ ...f, feature: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Target Date</label>
            <input type="date" value={editForm.date} onChange={(e) => setEditForm((f) => ({ ...f, date: e.target.value }))} style={inputStyle} />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <button onClick={handleDelete} style={btnDanger}>Delete</button>
            <div style={{ flex: 1 }} />
            <button onClick={() => setEditId(null)} style={btnSecondary}>Cancel</button>
            <button onClick={handleEditSave} style={btnPrimary}>Save</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
