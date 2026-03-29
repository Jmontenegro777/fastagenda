import { useState, useMemo } from "react";

// ──────────────────────────────────────────────
//  PALETA DE COLORES
// ──────────────────────────────────────────────
const COLOR_PALETTE = [
  { id: "red",    label: "Rojo",     hex: "#ef4444", color: "bg-red-500",    light: "bg-red-100 text-red-800",       dot: "bg-red-500"    },
  { id: "orange", label: "Naranja",  hex: "#f97316", color: "bg-orange-500", light: "bg-orange-100 text-orange-800", dot: "bg-orange-500" },
  { id: "yellow", label: "Amarillo", hex: "#facc15", color: "bg-yellow-400", light: "bg-yellow-100 text-yellow-800", dot: "bg-yellow-400" },
  { id: "green",  label: "Verde",    hex: "#16a34a", color: "bg-green-600",  light: "bg-green-100 text-green-800",   dot: "bg-green-600"  },
  { id: "teal",   label: "Teal",     hex: "#0d9488", color: "bg-teal-500",   light: "bg-teal-100 text-teal-800",     dot: "bg-teal-500"   },
  { id: "blue",   label: "Azul",     hex: "#3b82f6", color: "bg-blue-500",   light: "bg-blue-100 text-blue-800",     dot: "bg-blue-500"   },
  { id: "indigo", label: "Índigo",   hex: "#6366f1", color: "bg-indigo-500", light: "bg-indigo-100 text-indigo-800", dot: "bg-indigo-500" },
  { id: "purple", label: "Morado",   hex: "#a855f7", color: "bg-purple-500", light: "bg-purple-100 text-purple-800", dot: "bg-purple-500" },
  { id: "pink",   label: "Rosado",   hex: "#ec4899", color: "bg-pink-400",   light: "bg-pink-100 text-pink-800",     dot: "bg-pink-400"   },
  { id: "rose",   label: "Rosa",     hex: "#f43f5e", color: "bg-rose-500",   light: "bg-rose-100 text-rose-800",     dot: "bg-rose-500"   },
  { id: "cyan",   label: "Cian",     hex: "#06b6d4", color: "bg-cyan-500",   light: "bg-cyan-100 text-cyan-800",     dot: "bg-cyan-500"   },
  { id: "lime",   label: "Lima",     hex: "#84cc16", color: "bg-lime-500",   light: "bg-lime-100 text-lime-800",     dot: "bg-lime-500"   },
];

// Emojis sugeridos para categorías
const EMOJI_PALETTE = ["🏥","🩺","💊","🧬","🔬","🏃","🎂","🍽️","📅","📋","🎓","⚽","🏋️","🎯","✈️","🌙","☀️","⭐","🔔","🛡️","❤️","🧠","👶","🩻","🏨","📝","🤝","💪"];

// ──────────────────────────────────────────────
//  CATEGORÍAS INICIALES
// ──────────────────────────────────────────────
const INITIAL_CATEGORIES = {
  turno_noche_trabajo:    { label: "🌙 Turno noche trabajo",    colorId: "green",  color: "bg-green-600",  light: "bg-green-100 text-green-800",   dot: "bg-green-600"  },
  turno_noche_residencia: { label: "🌙 Turno noche residencia", colorId: "yellow", color: "bg-yellow-400", light: "bg-yellow-100 text-yellow-800", dot: "bg-yellow-400" },
  cumpleanos:             { label: "🎂 Cumpleaños",             colorId: "pink",   color: "bg-pink-400",   light: "bg-pink-100 text-pink-800",     dot: "bg-pink-400"   },
  comida:                 { label: "🍽️ Comida",                 colorId: "blue",   color: "bg-blue-500",   light: "bg-blue-100 text-blue-800",     dot: "bg-blue-500"   },
  turno_dia:              { label: "☀️ Turno día",              colorId: "orange", color: "bg-orange-500", light: "bg-orange-100 text-orange-800", dot: "bg-orange-500" },
  congreso:               { label: "🎓 Congreso",               colorId: "red",    color: "bg-red-500",    light: "bg-red-100 text-red-800",       dot: "bg-red-500"    },
  deporte:                { label: "⚽ Deporte",                colorId: "purple", color: "bg-purple-500", light: "bg-purple-100 text-purple-800", dot: "bg-purple-500" },
};

// ──────────────────────────────────────────────
//  FESTIVOS COLOMBIA
// ──────────────────────────────────────────────
function getEaster(year) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}
function nextMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  if (day === 1) return d;
  d.setDate(d.getDate() + (day === 0 ? 1 : 8 - day));
  return d;
}
function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return d; }
function fmtDate(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }

function getColombianHolidays(year) {
  const easter = getEaster(year);
  const fixed = [
    new Date(year, 0, 1),   // Año Nuevo
    new Date(year, 4, 1),   // Día del Trabajo
    new Date(year, 6, 20),  // Independencia
    new Date(year, 7, 7),   // Batalla de Boyacá
    new Date(year, 11, 8),  // Inmaculada
    new Date(year, 11, 25), // Navidad
  ];
  const emiliani = [
    new Date(year, 0, 6),   // Reyes
    new Date(year, 2, 19),  // San José
    new Date(year, 5, 29),  // San Pedro y San Pablo
    new Date(year, 7, 15),  // Asunción
    new Date(year, 9, 12),  // Raza
    new Date(year, 10, 1),  // Todos los Santos
    new Date(year, 10, 11), // Independencia Cartagena
  ].map(nextMonday);
  const easterBased = [
    addDays(easter, -3),              // Jueves Santo
    addDays(easter, -2),              // Viernes Santo
    nextMonday(addDays(easter, 39)),  // Ascensión
    nextMonday(addDays(easter, 60)),  // Corpus Christi
    nextMonday(addDays(easter, 68)),  // Sagrado Corazón
  ];
  return new Set([...fixed, ...emiliani, ...easterBased].map(fmtDate));
}

// ──────────────────────────────────────────────
//  DATOS INICIALES
// ──────────────────────────────────────────────
const today = new Date();
const fmt = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const INITIAL_TASKS = [
  { id: 1,  cat: "turno_dia",              date: fmt(today.getFullYear(), today.getMonth(), today.getDate()),       time: "07:00", done: false, notes: "Guardia diurna 7h-15h",  reminder: "1h"   },
  { id: 2,  cat: "comida",                 date: fmt(today.getFullYear(), today.getMonth(), today.getDate()),       time: "13:30", done: false, notes: "Restaurante Central",     reminder: "15min"},
  { id: 3,  cat: "turno_noche_trabajo",    date: fmt(today.getFullYear(), today.getMonth(), today.getDate() + 1),  time: "20:00", done: false, notes: "20h-08h",                 reminder: "1h"   },
  { id: 4,  cat: "cumpleanos",             date: fmt(today.getFullYear(), today.getMonth(), today.getDate() + 2),  time: "09:00", done: false, notes: "Traer regalo Dra. López", reminder: "1day" },
  { id: 5,  cat: "congreso",               date: fmt(today.getFullYear(), today.getMonth(), today.getDate() + 5),  time: "08:30", done: false, notes: "Hotel confirmado",         reminder: "1day" },
  { id: 6,  cat: "turno_noche_residencia", date: fmt(today.getFullYear(), today.getMonth(), today.getDate() + 3),  time: "20:00", done: false, notes: "Residencia piso 4",       reminder: "1h"   },
  { id: 7,  cat: "deporte",               date: fmt(today.getFullYear(), today.getMonth(), today.getDate() - 1),   time: "07:00", done: true,  notes: "10 km parque",            reminder: null   },
  { id: 8,  cat: "congreso",               date: fmt(today.getFullYear(), today.getMonth(), today.getDate() + 10), time: "09:00", done: false, notes: "Madrid 3 días",           reminder: "1week"},
  { id: 9,  cat: "cumpleanos",             date: fmt(today.getFullYear(), today.getMonth(), today.getDate() + 4),  time: "21:00", done: false, notes: "Cena mamá – Restaurante Lucía", reminder: "1day" },
  { id: 10, cat: "deporte",               date: fmt(today.getFullYear(), today.getMonth() + 1, 5),                 time: "18:00", done: false, notes: "Pádel – Club Norte",      reminder: null   },
  { id: 11, cat: "turno_dia",              date: fmt(today.getFullYear(), today.getMonth(), today.getDate() + 6),  time: "08:00", done: false, notes: "Cubrir al Dr. Pérez",     reminder: "1h"   },
  { id: 12, cat: "comida",                 date: fmt(today.getFullYear(), today.getMonth(), today.getDate() + 7),  time: "14:00", done: false, notes: "Jefe de servicio – rotación", reminder: "30min" },
];

const REMINDERS = [
  { value: null,    label: "Sin recordatorio" },
  { value: "15min", label: "15 minutos antes" },
  { value: "30min", label: "30 minutos antes" },
  { value: "1h",    label: "1 hora antes"     },
  { value: "1day",  label: "1 día antes"      },
  { value: "1week", label: "1 semana antes"   },
];

// ──────────────────────────────────────────────
//  HELPERS
// ──────────────────────────────────────────────
const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAYS_SHORT = ["L","M","X","J","V","S","D"];

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { const d = new Date(year, month, 1).getDay(); return d === 0 ? 6 : d - 1; }
function getWeekDays(ref) {
  const day = ref.getDay(), diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(ref); mon.setDate(ref.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d; });
}
function dateKey(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function slugify(str) { return str.toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"").slice(0,30) || `cat_${Date.now()}`; }
function getCatInfo(categories, key) { return categories[key] || { label: key, color: "bg-gray-400", light: "bg-gray-100 text-gray-600", dot: "bg-gray-400" }; }
function isWeekend(dateObj) { const d = dateObj.getDay(); return d === 0 || d === 6; }
function monthKey(date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`; }

// ──────────────────────────────────────────────
//  MODAL: GESTIÓN DE CATEGORÍAS (con emojis)
// ──────────────────────────────────────────────
function CategoryManagerModal({ categories, tasks, onSave, onClose }) {
  const [cats, setCats] = useState({ ...categories });
  const [form, setForm] = useState({ key: "", label: "", colorId: "blue" });
  const [editKey, setEditKey] = useState(null);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const usageCount = (key) => tasks.filter(t => t.cat === key).length;

  const startEdit = (key) => {
    const c = cats[key];
    setEditKey(key);
    setForm({ key, label: c.label, colorId: c.colorId || "blue" });
    setError("");
  };
  const cancelEdit = () => { setEditKey(null); setForm({ key: "", label: "", colorId: "blue" }); setError(""); };

  const handleSave = () => {
    if (!form.label.trim()) { setError("El nombre es obligatorio."); return; }
    const palette = COLOR_PALETTE.find(c => c.id === form.colorId) || COLOR_PALETTE[5];
    const newCat = { label: form.label.trim(), colorId: palette.id, color: palette.color, light: palette.light, dot: palette.dot };
    if (editKey) {
      setCats(prev => ({ ...prev, [editKey]: newCat }));
    } else {
      const key = slugify(form.label.replace(/[^\w\s]/g, "").trim()) || `cat_${Date.now()}`;
      if (cats[key]) { setError("Ya existe una categoría con ese nombre."); return; }
      setCats(prev => ({ ...prev, [key]: newCat }));
    }
    cancelEdit();
  };

  const handleDelete = (key) => {
    const count = usageCount(key);
    if (count > 0) setConfirmDelete({ key, count });
    else setCats(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const selectedColor = COLOR_PALETTE.find(c => c.id === form.colorId) || COLOR_PALETTE[5];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col overflow-hidden" style={{ maxHeight: "90vh" }}>

        <div className="bg-gradient-to-r from-violet-600 to-purple-500 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white bg-opacity-20 flex items-center justify-center text-lg">🏷️</div>
            <div>
              <h2 className="text-white font-bold text-base">Gestionar categorías</h2>
              <p className="text-purple-200 text-xs">{Object.keys(cats).length} categorías</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white opacity-70 hover:opacity-100 text-2xl leading-none">&times;</button>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Categorías actuales</p>
          {Object.keys(cats).length === 0 && <div className="text-center text-gray-300 py-8 text-sm">Sin categorías. Crea una abajo.</div>}
          {Object.entries(cats).map(([key, cat]) => {
            const count = usageCount(key);
            const isEditing = editKey === key;
            return (
              <div key={key} className={`rounded-xl border transition ${isEditing ? "border-purple-300 bg-purple-50" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 ${cat.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">{cat.label}</div>
                    <div className="text-xs text-gray-400">{count} tarea{count !== 1 ? "s" : ""}</div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => isEditing ? cancelEdit() : startEdit(key)} className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${isEditing ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-700"}`}>
                      {isEditing ? "Cancelar" : "Editar"}
                    </button>
                    <button onClick={() => handleDelete(key)} className="text-xs px-2.5 py-1 rounded-lg font-medium bg-red-50 text-red-500 hover:bg-red-100 transition">Eliminar</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Formulario */}
        <div className="border-t border-gray-100 p-4 bg-gray-50 flex-shrink-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            {editKey ? `✏️ Editando: ${cats[editKey]?.label}` : "➕ Nueva categoría"}
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre (puedes incluir emoji)</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 outline-none bg-white"
                value={form.label}
                onChange={e => setF("label", e.target.value)}
                placeholder="Ej: 🏥 Guardia hospital..."
                onKeyDown={e => e.key === "Enter" && handleSave()}
              />
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>

            {/* Selector rápido de emojis */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Emojis sugeridos (click para insertar)</label>
              <div className="flex flex-wrap gap-1">
                {EMOJI_PALETTE.map(emoji => (
                  <button key={emoji} onClick={() => setF("label", emoji + " " + form.label.replace(/^[\p{Emoji}\s]+/u, ""))}
                    className="w-8 h-8 text-lg rounded-lg hover:bg-purple-100 transition flex items-center justify-center" title={emoji}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {COLOR_PALETTE.map(c => (
                  <button key={c.id} title={c.label} onClick={() => setF("colorId", c.id)}
                    className={`w-7 h-7 rounded-full border-2 transition hover:scale-110 ${form.colorId === c.id ? "border-gray-800 scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: c.hex }} />
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${selectedColor.dot}`} />
                <span className="text-xs text-gray-500">Color: <strong>{selectedColor.label}</strong></span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selectedColor.light}`}>{form.label || "Vista previa"}</span>
              </div>
            </div>

            <div className="flex gap-2">
              {editKey && <button onClick={cancelEdit} className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2 text-sm font-medium hover:bg-gray-100 transition">Cancelar edición</button>}
              <button onClick={handleSave} className="flex-1 bg-gradient-to-r from-violet-600 to-purple-500 text-white rounded-lg py-2 text-sm font-semibold hover:opacity-90 transition shadow">
                {editKey ? "Guardar cambios" : "Crear categoría"}
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-gray-100 bg-white flex-shrink-0">
          <button onClick={() => { onSave(cats); onClose(); }} className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-bold hover:bg-gray-700 transition">
            ✓ Aplicar todos los cambios
          </button>
        </div>
      </div>

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-60">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="font-bold text-gray-800 mb-2">¿Eliminar categoría?</h3>
            <p className="text-sm text-gray-500 mb-4">Tiene <strong>{confirmDelete.count} tarea{confirmDelete.count !== 1 ? "s" : ""}</strong> asignada{confirmDelete.count !== 1 ? "s" : ""}. Quedarán sin categoría.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2 text-sm font-medium hover:bg-gray-50">Cancelar</button>
              <button onClick={() => { setCats(prev => { const n = {...prev}; delete n[confirmDelete.key]; return n; }); setConfirmDelete(null); }} className="flex-1 bg-red-500 text-white rounded-lg py-2 text-sm font-semibold hover:bg-red-600">Eliminar igual</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
//  MODAL: Crear / Editar Tarea (sin título, sin prioridad)
// ──────────────────────────────────────────────
function TaskModal({ task, categories, onSave, onClose, defaultDate }) {
  const firstCat = Object.keys(categories)[0] || "";
  const blank = { id: null, cat: firstCat, date: defaultDate || dateKey(new Date()), time: "09:00", done: false, notes: "", reminder: null };
  const [form, setForm] = useState(task ? { ...task } : blank);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">{task ? "Editar evento" : "Nuevo evento"}</h2>
          <button onClick={onClose} className="text-white opacity-80 hover:opacity-100 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-5 space-y-4">
          {/* Categoría */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Categoría</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none" value={form.cat} onChange={e => set("cat", e.target.value)}>
              {Object.entries(categories).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          {/* Fecha y hora */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Fecha</label>
              <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none" value={form.date} onChange={e => set("date", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Hora</label>
              <input type="time" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none" value={form.time} onChange={e => set("time", e.target.value)} />
            </div>
          </div>

          {/* Nota */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Nota</label>
            <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none resize-none" rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Observaciones..." />
          </div>

          {/* Recordatorio */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">🔔 Recordatorio</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none" value={form.reminder ?? ""} onChange={e => set("reminder", e.target.value || null)}>
              {REMINDERS.map(r => <option key={String(r.value)} value={r.value ?? ""}>{r.label}</option>)}
            </select>
            {form.reminder && (
              <p className="text-xs text-indigo-500 mt-1">✓ Recibirás un aviso {REMINDERS.find(r => r.value === form.reminder)?.label?.toLowerCase()}</p>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition">Cancelar</button>
            <button onClick={() => { onSave({ ...form, id: form.id || Date.now() }); onClose(); }} className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg py-2 text-sm font-semibold hover:opacity-90 transition shadow">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
//  CHIP DE TAREA
// ──────────────────────────────────────────────
function TaskChip({ task, categories, onClick }) {
  const cat = getCatInfo(categories, task.cat);
  const label = task.notes ? task.notes : cat.label;
  return (
    <div onClick={e => { e.stopPropagation(); onClick(task); }}
      className={`text-white text-xs rounded px-1.5 py-0.5 cursor-pointer truncate flex items-center gap-1 ${cat.color} ${task.done ? "opacity-50 line-through" : ""} hover:opacity-80 transition`}
      title={`${task.time} · ${cat.label}${task.notes ? " · " + task.notes : ""}${task.reminder ? " 🔔" : ""}`}>
      {task.time} {label}
      {task.reminder && <span className="opacity-75">🔔</span>}
    </div>
  );
}

// ──────────────────────────────────────────────
//  VISTA SEMANA
// ──────────────────────────────────────────────
function WeekView({ tasks, categories, currentDate, holidays, onDayClick, onTaskClick }) {
  const days = getWeekDays(currentDate);
  const tasksByDay = useMemo(() => {
    const map = {};
    tasks.forEach(t => { if (!map[t.date]) map[t.date] = []; map[t.date].push(t); });
    return map;
  }, [tasks]);
  const todayKey = dateKey(new Date());

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="grid grid-cols-7 border-b border-gray-100">
        {days.map((d, i) => {
          const key = dateKey(d);
          const isToday = key === todayKey;
          const isHoliday = holidays.has(key) && !isWeekend(d);
          const isRest = isWeekend(d) || isHoliday;
          return (
            <div key={i}
              className={`py-2 text-center cursor-pointer transition border-b-2
                ${isToday    ? "bg-indigo-50 border-indigo-400"
                : isHoliday  ? "bg-red-50 border-red-400"
                : isWeekend(d) ? "bg-gray-50 border-transparent"
                : "border-transparent hover:bg-indigo-50"}`}
              onClick={() => onDayClick(d)}>
              <div className={`text-xs font-semibold ${isHoliday ? "text-red-500" : isRest ? "text-gray-400" : "text-gray-400"}`}>
                {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"][i]}
              </div>
              <div className={`w-8 h-8 mx-auto mt-1 flex items-center justify-center rounded-full text-sm font-bold
                ${isToday   ? "bg-indigo-600 text-white"
                : isHoliday ? "bg-red-500 text-white"
                : isRest    ? "text-gray-400"
                : "text-gray-700"}`}>{d.getDate()}</div>
              {isHoliday && (
                <div className="mt-1 mx-auto inline-flex items-center gap-0.5 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                  🇨🇴 <span>Festivo</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-7 flex-1 overflow-y-auto divide-x divide-gray-100">
        {days.map((d, i) => {
          const key = dateKey(d);
          const dayTasks = (tasksByDay[key] || []).sort((a, b) => a.time.localeCompare(b.time));
          const isToday = key === todayKey;
          const isHoliday = holidays.has(key) && !isWeekend(d);
          const isRest = isWeekend(d) || isHoliday;
          return (
            <div key={i}
              className={`p-2 space-y-1 min-h-32 cursor-pointer transition
                ${isToday   ? "bg-indigo-50/40"
                : isHoliday ? "bg-red-50/50"
                : isRest    ? "bg-gray-50/70"
                : "hover:bg-gray-50"}`}
              onClick={() => onDayClick(d)}>
              {dayTasks.map(t => <TaskChip key={t.id} task={t} categories={categories} onClick={onTaskClick} />)}
              {dayTasks.length === 0 && <div className="text-xs text-gray-300 text-center mt-4">—</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
//  VISTA MES
// ──────────────────────────────────────────────
function MonthView({ tasks, categories, currentDate, holidays, onDayClick, onTaskClick }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const todayKey = dateKey(new Date());

  const tasksByDay = useMemo(() => {
    const map = {};
    tasks.forEach(t => { if (!map[t.date]) map[t.date] = []; map[t.date].push(t); });
    return map;
  }, [tasks]);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="grid grid-cols-7 border-b border-gray-100">
        {DAYS_SHORT.map((d, i) => (
          <div key={d} className={`py-2 text-center text-xs font-semibold ${i >= 5 ? "text-gray-400" : "text-gray-400"}`}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 overflow-y-auto">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className="border-b border-r border-gray-100 bg-gray-50/30" />;
          const key = fmt(year, month, day);
          const dayTasks = (tasksByDay[key] || []).sort((a, b) => a.time.localeCompare(b.time));
          const isToday = key === todayKey;
          const dayObj = new Date(year, month, day);
          const isRest = isWeekend(dayObj) || holidays.has(key);
          const isHoliday = holidays.has(key) && !isWeekend(dayObj);

          return (
            <div key={key}
              className={`p-1 min-h-20 cursor-pointer transition border-b border-r
                ${isToday   ? "bg-indigo-50/60 border-gray-100"
                : isHoliday ? "bg-red-50 border-red-200"
                : isWeekend(dayObj) ? "bg-gray-100/50 border-gray-100 hover:bg-gray-200/40"
                : "border-gray-100 hover:bg-gray-50"}`}
              onClick={() => onDayClick(dayObj)}>
              <div className="flex items-center gap-1 mb-0.5 flex-wrap">
                <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0
                  ${isToday   ? "bg-indigo-600 text-white"
                  : isHoliday ? "bg-red-500 text-white"
                  : isWeekend(dayObj) ? "text-gray-400"
                  : "text-gray-700"}`}>{day}</div>
                {isHoliday && (
                  <span className="inline-flex items-center gap-0.5 bg-red-500 text-white text-xs font-bold px-1 py-0.5 rounded-full leading-none">
                    🇨🇴 <span style={{fontSize:"0.6rem"}}>Festivo</span>
                  </span>
                )}
              </div>
              <div className="space-y-0.5">
                {dayTasks.slice(0, 3).map(t => <TaskChip key={t.id} task={t} categories={categories} onClick={onTaskClick} />)}
                {dayTasks.length > 3 && <div className="text-xs text-gray-400 pl-1">+{dayTasks.length - 3} más</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
//  VISTA AÑO
// ──────────────────────────────────────────────
function YearView({ tasks, categories, currentDate, onMonthClick }) {
  const year = currentDate.getFullYear();
  const tasksByMonth = useMemo(() => {
    const map = {};
    tasks.forEach(t => {
      const m = parseInt(t.date.split("-")[1]) - 1;
      if (!map[m]) map[m] = { total: 0, cats: {} };
      map[m].total++;
      map[m].cats[t.cat] = (map[m].cats[t.cat] || 0) + 1;
    });
    return map;
  }, [tasks]);
  const todayMonth = new Date().getMonth();
  const todayYear = new Date().getFullYear();

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid grid-cols-3 gap-4">
        {MONTHS_ES.map((name, mi) => {
          const info = tasksByMonth[mi] || { total: 0, cats: {} };
          const isCurrentMonth = mi === todayMonth && year === todayYear;
          return (
            <div key={mi} onClick={() => onMonthClick(mi)} className={`rounded-xl border p-4 cursor-pointer transition hover:shadow-md hover:-translate-y-0.5 ${isCurrentMonth ? "border-indigo-400 bg-indigo-50" : "border-gray-200 bg-white hover:border-indigo-200"}`}>
              <div className={`font-bold text-sm mb-2 ${isCurrentMonth ? "text-indigo-700" : "text-gray-700"}`}>{name}</div>
              {info.total > 0 ? (
                <>
                  <div className="text-xs text-gray-500 mb-2">{info.total} evento{info.total !== 1 ? "s" : ""}</div>
                  <div className="flex gap-1 flex-wrap">
                    {Object.entries(info.cats).map(([cat, count]) => (
                      <span key={cat} className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${getCatInfo(categories, cat).light}`}>{count}</span>
                    ))}
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden flex">
                    {Object.entries(categories).map(([cat]) => {
                      const w = ((info.cats[cat] || 0) / info.total) * 100;
                      return w > 0 ? <div key={cat} className={`h-full ${getCatInfo(categories, cat).color}`} style={{ width: `${w}%` }} /> : null;
                    })}
                  </div>
                </>
              ) : (
                <div className="text-xs text-gray-300">Sin eventos</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
//  PANEL LATERAL: Tareas del día
// ──────────────────────────────────────────────
function DayPanel({ date, tasks, categories, onAdd, onEdit, onToggle, onDelete }) {
  const key = dateKey(date);
  const dayTasks = tasks.filter(t => t.date === key).sort((a, b) => a.time.localeCompare(b.time));
  const DAYS_ES = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  const reminderLabel = (r) => REMINDERS.find(x => x.value === r)?.label || "";

  return (
    <div className="w-72 flex-shrink-0 bg-white border-l border-gray-100 flex flex-col overflow-hidden">
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400 font-medium">{DAYS_ES[date.getDay()]}</div>
            <div className="text-lg font-bold text-gray-800">{date.getDate()} de {MONTHS_ES[date.getMonth()]}</div>
          </div>
          <button onClick={onAdd} className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-lg font-bold hover:bg-indigo-700 transition shadow">+</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {dayTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-300">
            <div className="text-4xl mb-2">📋</div>
            <div className="text-sm">Sin eventos este día</div>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {dayTasks.map(t => {
              const cat = getCatInfo(categories, t.cat);
              return (
                <div key={t.id} className={`rounded-xl border p-3 transition ${t.done ? "opacity-50 bg-gray-50 border-gray-100" : "bg-white border-gray-200 hover:border-indigo-200 hover:shadow-sm"}`}>
                  <div className="flex items-start gap-2">
                    <button onClick={() => onToggle(t.id)} className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 transition ${t.done ? "bg-green-500 border-green-500" : "border-gray-300 hover:border-indigo-400"}`}>
                      {t.done && <svg viewBox="0 0 10 10" className="w-full h-full text-white fill-current"><path d="M2 5l2.5 2.5L8 3"/></svg>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-gray-500">{t.time}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${cat.light}`}>{cat.label}</span>
                        {t.reminder && <span className="text-xs text-indigo-400" title={reminderLabel(t.reminder)}>🔔</span>}
                      </div>
                      {t.notes && <div className={`text-sm mt-1 leading-snug ${t.done ? "line-through text-gray-400" : "text-gray-700"}`}>{t.notes}</div>}
                      {t.reminder && <div className="text-xs text-indigo-400 mt-1">{reminderLabel(t.reminder)}</div>}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                    <button onClick={() => onEdit(t)} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium">Editar</button>
                    <button onClick={() => onDelete(t.id)} className="text-xs text-red-400 hover:text-red-600 font-medium">Eliminar</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
//  PANEL FLOTANTE: NOTAS DEL MES (con Checklist)
// ──────────────────────────────────────────────
function MonthNotesPanel({ currentDate, monthNotes, onSave }) {
  const [open, setOpen]         = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab]           = useState("notes"); // "notes" | "checklist"
  const mk = monthKey(currentDate);
  const monthLabel = `${MONTHS_ES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  // Leer datos del mes actual
  const noteData = monthNotes[mk] || { text: "", checklist: [] };
  const [text, setText]           = useState(noteData.text);
  const [checklist, setChecklist] = useState(noteData.checklist);
  const [newItem, setNewItem]     = useState("");

  // Sincronizar cuando cambia el mes
  useMemo(() => {
    const d = monthNotes[mk] || { text: "", checklist: [] };
    setText(d.text);
    setChecklist(d.checklist);
  }, [mk, monthNotes]);

  const persist = (t, cl) => onSave(mk, { text: t, checklist: cl });

  const handleBlurText = () => persist(text, checklist);

  // Checklist actions
  const addItem = () => {
    if (!newItem.trim()) return;
    const cl = [...checklist, { id: Date.now(), text: newItem.trim(), checked: false }];
    setChecklist(cl);
    persist(text, cl);
    setNewItem("");
  };
  const toggleItem = (id) => {
    const cl = checklist.map(it => it.id === id ? { ...it, checked: !it.checked } : it);
    setChecklist(cl);
    persist(text, cl);
  };
  const deleteItem = (id) => {
    const cl = checklist.filter(it => it.id !== id);
    setChecklist(cl);
    persist(text, cl);
  };
  const editItem = (id, val) => {
    const cl = checklist.map(it => it.id === id ? { ...it, text: val } : it);
    setChecklist(cl);
  };

  const done  = checklist.filter(it => it.checked).length;
  const total = checklist.length;
  const hasNotes = text.trim().length > 0 || total > 0;
  const panelW = expanded ? 360 : 300;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {open ? (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ width: panelW, maxHeight: expanded ? 480 : 320 }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-400 px-4 py-2.5 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">📝</span>
              <div>
                <div className="text-white font-bold text-sm">Notas del mes</div>
                <div className="text-amber-100 text-xs">{monthLabel}</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setExpanded(e => !e)} className="text-white opacity-70 hover:opacity-100 text-base px-1" title={expanded ? "Contraer" : "Expandir"}>
                {expanded ? "⊟" : "⊞"}
              </button>
              <button onClick={() => setOpen(false)} className="text-white opacity-70 hover:opacity-100 text-xl leading-none">×</button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 flex-shrink-0">
            {[
              { id: "notes",     label: "📄 Notas"     },
              { id: "checklist", label: `✅ Lista ${total > 0 ? `(${done}/${total})` : ""}` },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 py-2 text-xs font-semibold transition ${tab === t.id ? "text-amber-600 border-b-2 border-amber-500 bg-amber-50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* NOTAS */}
          {tab === "notes" && (
            <>
              <textarea
                className="flex-1 p-3 text-sm text-gray-700 resize-none outline-none border-none focus:ring-0 placeholder-gray-300"
                style={{ minHeight: expanded ? 200 : 110 }}
                value={text}
                onChange={e => setText(e.target.value)}
                onBlur={handleBlurText}
                placeholder={`Notas generales de ${monthLabel}...\n\nMetas, pendientes, observaciones del mes...`}
              />
              <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
                <span className="text-xs text-gray-400">{text.length} caracteres</span>
                <button onClick={() => persist(text, checklist)}
                  className="text-xs bg-amber-500 text-white px-3 py-1 rounded-lg font-medium hover:bg-amber-600 transition">
                  Guardar
                </button>
              </div>
            </>
          )}

          {/* CHECKLIST */}
          {tab === "checklist" && (
            <>
              {/* Progress bar */}
              {total > 0 && (
                <div className="px-3 pt-2 flex-shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">{done} de {total} completados</span>
                    <span className="text-xs font-bold text-amber-600">{Math.round((done/total)*100)}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${(done/total)*100}%` }} />
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
                {checklist.length === 0 && (
                  <div className="text-center text-gray-300 text-xs py-6">
                    <div className="text-3xl mb-1">☑️</div>
                    <div>Agrega elementos a tu lista</div>
                  </div>
                )}
                {checklist.map(item => (
                  <div key={item.id} className={`flex items-center gap-2 group rounded-lg px-2 py-1.5 transition ${item.checked ? "bg-green-50" : "hover:bg-gray-50"}`}>
                    <button onClick={() => toggleItem(item.id)}
                      className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition
                        ${item.checked ? "bg-green-500 border-green-500" : "border-gray-300 hover:border-amber-400"}`}>
                      {item.checked && (
                        <svg viewBox="0 0 10 10" className="w-3 h-3 fill-white">
                          <path d="M1.5 5l2.5 2.5L8.5 2"/>
                        </svg>
                      )}
                    </button>
                    <input
                      className={`flex-1 text-sm bg-transparent outline-none border-none focus:ring-0 ${item.checked ? "line-through text-gray-400" : "text-gray-700"}`}
                      value={item.text}
                      onChange={e => editItem(item.id, e.target.value)}
                      onBlur={() => persist(text, checklist)}
                      onKeyDown={e => e.key === "Enter" && e.target.blur()}
                    />
                    <button onClick={() => deleteItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs px-1 transition">
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Add item */}
              <div className="px-3 py-2 border-t border-gray-100 flex gap-2 flex-shrink-0">
                <input
                  className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-amber-300 outline-none placeholder-gray-300"
                  placeholder="Nuevo elemento..."
                  value={newItem}
                  onChange={e => setNewItem(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addItem()}
                />
                <button onClick={addItem}
                  className="bg-amber-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-amber-600 transition">
                  +
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Botón flotante colapsado */
        <button onClick={() => setOpen(true)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg border transition hover:shadow-xl hover:-translate-y-0.5
            ${hasNotes ? "bg-amber-500 text-white border-amber-400" : "bg-white text-gray-600 border-gray-200"}`}>
          <span className="text-lg">📝</span>
          <div className="text-left">
            <div className="text-xs font-bold">{hasNotes ? "Notas del mes" : "Agregar notas del mes"}</div>
            {hasNotes
              ? <div className="text-xs opacity-80">
                  {text.trim() ? text.slice(0, 28) + (text.length > 28 ? "…" : "") : ""}
                  {total > 0 ? ` · ✅ ${done}/${total}` : ""}
                </div>
              : <div className="text-xs opacity-60">{monthLabel}</div>}
          </div>
        </button>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
//  BARRA DE ESTADÍSTICAS
// ──────────────────────────────────────────────
function StatsBar({ tasks }) {
  const done = tasks.filter(t => t.done).length;
  const pending = tasks.length - done;
  const withReminder = tasks.filter(t => t.reminder && !t.done).length;
  const todayCount = tasks.filter(t => t.date === dateKey(new Date()) && !t.done).length;

  return (
    <div className="flex gap-3 px-4 py-2 bg-white border-b border-gray-100 flex-shrink-0">
      {[
        { label: "Hoy",          value: todayCount,    color: "text-indigo-600", bg: "bg-indigo-50" },
        { label: "Pendientes",   value: pending,       color: "text-yellow-600", bg: "bg-yellow-50" },
        { label: "Completados",  value: done,          color: "text-green-600",  bg: "bg-green-50"  },
        { label: "Con recordatorio", value: withReminder, color: "text-orange-500", bg: "bg-orange-50" },
      ].map(s => (
        <div key={s.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${s.bg}`}>
          <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
          <span className="text-xs text-gray-500 font-medium">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────
//  COMPONENTE PRINCIPAL
// ──────────────────────────────────────────────
export default function MedTaskManager() {
  const [tasks, setTasks]             = useState(INITIAL_TASKS);
  const [categories, setCategories]   = useState(INITIAL_CATEGORIES);
  const [view, setView]               = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [modal, setModal]             = useState(null);
  const [catModal, setCatModal]       = useState(false);
  const [filterCat, setFilterCat]     = useState("all");
  const [search, setSearch]           = useState("");
  const [monthNotes, setMonthNotes]   = useState({});

  // Festivos del año actual y siguiente (por si el calendario los cruza)
  const holidays = useMemo(() => {
    const yr = currentDate.getFullYear();
    const h1 = getColombianHolidays(yr);
    const h2 = getColombianHolidays(yr + 1);
    return new Set([...h1, ...h2]);
  }, [currentDate]);

  const filtered = useMemo(() => tasks.filter(t => {
    if (filterCat !== "all" && t.cat !== filterCat) return false;
    if (search && !t.notes.toLowerCase().includes(search.toLowerCase()) && !getCatInfo(categories, t.cat).label.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [tasks, filterCat, search, categories]);

  const saveTask   = t => setTasks(ts => t.id && ts.find(x => x.id === t.id) ? ts.map(x => x.id === t.id ? t : x) : [...ts, t]);
  const toggleDone = id => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask = id => setTasks(ts => ts.filter(t => t.id !== id));
  const saveNote   = (mk, data) => setMonthNotes(n => ({ ...n, [mk]: data }));

  const navigate = dir => {
    const d = new Date(currentDate);
    if (view === "week")  d.setDate(d.getDate() + dir * 7);
    if (view === "month") d.setMonth(d.getMonth() + dir);
    if (view === "year")  d.setFullYear(d.getFullYear() + dir);
    setCurrentDate(d);
  };
  const goToday = () => { setCurrentDate(new Date()); setSelectedDay(new Date()); };

  const navLabel = () => {
    if (view === "year")  return String(currentDate.getFullYear());
    if (view === "month") return `${MONTHS_ES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    const days = getWeekDays(currentDate);
    return `${days[0].getDate()} – ${days[6].getDate()} ${MONTHS_ES[days[6].getMonth()]} ${days[6].getFullYear()}`;
  };

  const handleDayClick   = d  => { setSelectedDay(d); if (view === "year") { setView("month"); setCurrentDate(d); } };
  const handleMonthClick = mi => { const d = new Date(currentDate.getFullYear(), mi, 1); setCurrentDate(d); setSelectedDay(d); setView("month"); };

  return (
    <div className="h-screen flex flex-col bg-gray-50 font-sans overflow-hidden">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-700 to-blue-600 text-white px-6 py-3 flex items-center justify-between shadow-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white bg-opacity-20 flex items-center justify-center text-xl">🏥</div>
          <div>
            <h1 className="font-bold text-lg leading-tight">MedTask</h1>
            <p className="text-xs text-indigo-200">Gestión de actividades médicas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
            className="bg-white bg-opacity-15 border border-white border-opacity-30 rounded-lg px-3 py-1.5 text-sm placeholder-indigo-200 text-white focus:outline-none focus:bg-opacity-25 w-40" />
          <button onClick={() => setCatModal(true)}
            className="flex items-center gap-1.5 bg-white bg-opacity-15 border border-white border-opacity-30 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-opacity-25 transition">
            🏷️ <span>Categorías</span>
          </button>
          <button onClick={() => setModal("new")}
            className="bg-white text-indigo-700 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-50 transition shadow">
            + Evento
          </button>
        </div>
      </div>

      {/* STATS */}
      <StatsBar tasks={tasks} />

      {/* FILTROS + NAVEGACIÓN */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-100 gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-indigo-300 outline-none">
            <option value="all">Todas las categorías</option>
            {Object.entries(categories).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition">‹</button>
          <span className="text-sm font-semibold text-gray-700 min-w-40 text-center">{navLabel()}</span>
          <button onClick={() => navigate(1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition">›</button>
          <button onClick={goToday} className="text-xs text-indigo-600 border border-indigo-200 px-2 py-1 rounded-lg hover:bg-indigo-50 transition font-medium">Hoy</button>
        </div>

        <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
          {["week","month","year"].map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-3 py-1 rounded-md text-xs font-semibold transition ${view === v ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {{ week:"Semana", month:"Mes", year:"Año" }[v]}
            </button>
          ))}
        </div>
      </div>

      {/* CUERPO */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          {view === "week"  && <WeekView  tasks={filtered} categories={categories} currentDate={currentDate} holidays={holidays} onDayClick={handleDayClick} onTaskClick={t => setModal(t)} />}
          {view === "month" && <MonthView tasks={filtered} categories={categories} currentDate={currentDate} holidays={holidays} onDayClick={handleDayClick} onTaskClick={t => setModal(t)} />}
          {view === "year"  && <YearView  tasks={filtered} categories={categories} currentDate={currentDate} onMonthClick={handleMonthClick} />}
        </div>
        {view !== "year" && (
          <DayPanel date={selectedDay} tasks={tasks} categories={categories}
            onAdd={() => setModal("new")} onEdit={t => setModal(t)} onToggle={toggleDone} onDelete={deleteTask} />
        )}
      </div>

      {/* LEYENDA */}
      <div className="flex items-center gap-4 px-4 py-2 bg-white border-t border-gray-100 flex-shrink-0 flex-wrap">
        {Object.entries(categories).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${v.dot}`} />
            <span className="text-xs text-gray-500">{v.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-gray-200">
          <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300" />
          <span className="text-xs text-gray-400">Fin de semana / Festivo</span>
        </div>
      </div>

      {/* MODAL EVENTO */}
      {modal && (
        <TaskModal task={modal !== "new" ? modal : null} categories={categories}
          defaultDate={dateKey(selectedDay)} onSave={saveTask} onClose={() => setModal(null)} />
      )}

      {/* MODAL CATEGORÍAS */}
      {catModal && (
        <CategoryManagerModal categories={categories} tasks={tasks}
          onSave={newCats => setCategories(newCats)} onClose={() => setCatModal(false)} />
      )}

      {/* PANEL NOTAS DEL MES */}
      <MonthNotesPanel currentDate={currentDate} monthNotes={monthNotes} onSave={saveNote} />
    </div>
  );
}
