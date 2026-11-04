import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, CalendarDays, BookOpen, ClipboardList, BarChart3,
  PenLine, Settings, GraduationCap, Bell, Search, Plus, Check,
  Clock3, Flame, Target, ChevronRight, CircleHelp, MoreHorizontal,
  BookMarked, Brain, Menu, X, Trash2, Play, Pause, RotateCcw
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";

type Page = "Visão geral" | "Meu cronograma" | "Disciplinas" | "Exercícios" | "Redação" | "Desempenho";
type Task = { id: number; time: string; subject: string; title: string; duration: number; done: boolean };
type Subject = { id: number; name: string; color: string; topics: number; completed: number };

const initialTasks: Task[] = [
  { id: 1, time: "08:30", subject: "Matemática", title: "Porcentagem e aumentos", duration: 50, done: true },
  { id: 2, time: "09:30", subject: "Física", title: "Movimento uniforme", duration: 45, done: true },
  { id: 3, time: "10:30", subject: "Química", title: "Estrutura atômica", duration: 50, done: false },
  { id: 4, time: "14:00", subject: "Português", title: "Interpretação de texto", duration: 45, done: false },
  { id: 5, time: "15:00", subject: "Redação", title: "Planejamento argumentativo", duration: 60, done: false },
];

const initialSubjects: Subject[] = [
  { id: 1, name: "Matemática", color: "#7567e8", topics: 32, completed: 12 },
  { id: 2, name: "Física", color: "#2998c7", topics: 28, completed: 8 },
  { id: 3, name: "Química", color: "#20a486", topics: 26, completed: 7 },
  { id: 4, name: "Biologia", color: "#79a84b", topics: 30, completed: 5 },
  { id: 5, name: "Português", color: "#d58b45", topics: 24, completed: 10 },
  { id: 6, name: "História", color: "#cc6c82", topics: 22, completed: 6 },
  { id: 7, name: "Geografia", color: "#4e91bd", topics: 20, completed: 4 },
  { id: 8, name: "Redação", color: "#9671bd", topics: 12, completed: 3 },
];

const weekData = [
  { day: "Seg", hours: 3.2 }, { day: "Ter", hours: 4.1 }, { day: "Qua", hours: 2.8 },
  { day: "Qui", hours: 4.5 }, { day: "Sex", hours: 3.7 }, { day: "Sáb", hours: 2.4 },
  { day: "Dom", hours: 0 },
];

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch { return fallback; }
}

function App() {
  const [page, setPage] = useState<Page>("Visão geral");
  const [tasks, setTasks] = useState<Task[]>(() => readStorage("pa-tasks", initialTasks));
  const [subjects, setSubjects] = useState<Subject[]>(() => readStorage("pa-subjects", initialSubjects));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("Matemática");
  const [newTime, setNewTime] = useState("16:00");
  const [newDuration, setNewDuration] = useState(45);
  const [seconds, setSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => localStorage.setItem("pa-tasks", JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem("pa-subjects", JSON.stringify(subjects)), [subjects]);
  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => setSeconds(s => {
      if (s <= 1) { setTimerRunning(false); return 0; }
      return s - 1;
    }), 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const completed = tasks.filter(t => t.done).length;
  const totalMinutes = tasks.filter(t => t.done).reduce((sum, t) => sum + t.duration, 0);
  const completion = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
  const dateLabel = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  const filteredSubjects = useMemo(() => subjects.filter(s => s.name.toLowerCase().includes(search.toLowerCase())), [subjects, search]);

  function toggleTask(id: number) {
    setTasks(current => current.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }
  function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setTasks(current => [...current, { id: Date.now(), time: newTime, subject: newSubject, title: newTitle.trim(), duration: Number(newDuration), done: false }].sort((a,b) => a.time.localeCompare(b.time)));
    setNewTitle("");
    setShowTaskForm(false);
  }
  function addSubject() {
    const name = window.prompt("Nome da nova disciplina:");
    if (!name?.trim()) return;
    setSubjects(current => [...current, { id: Date.now(), name: name.trim(), color: "#7567e8", topics: 0, completed: 0 }]);
  }
  function removeTask(id: number) {
    if (window.confirm("Excluir esta atividade do cronograma?")) setTasks(current => current.filter(t => t.id !== id));
  }
  const nav: { label: Page; icon: typeof LayoutDashboard }[] = [
    { label: "Visão geral", icon: LayoutDashboard },
    { label: "Meu cronograma", icon: CalendarDays },
    { label: "Disciplinas", icon: BookOpen },
    { label: "Exercícios", icon: ClipboardList },
    { label: "Redação", icon: PenLine },
    { label: "Desempenho", icon: BarChart3 },
  ];

  const Sidebar = () => <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
    <div className="brand"><div className="brand-mark"><GraduationCap size={22}/></div><div><strong>Projeto Aprovação</strong><span>ÁREA DE ESTUDOS</span></div><button className="mobile-close icon-button" onClick={() => setMobileOpen(false)}><X size={18}/></button></div>
    <div className="side-label">MENU PRINCIPAL</div>
    <nav>{nav.map(item => <button key={item.label} className={`nav-item ${page === item.label ? "active" : ""}`} onClick={() => { setPage(item.label); setMobileOpen(false); }}><item.icon size={18}/><span>{item.label}</span>{item.label === "Meu cronograma" && <span className="nav-count">{tasks.filter(t => !t.done).length}</span>}</button>)}</nav>
    <div className="side-bottom">
      <div className="goal-card"><div className="goal-icon"><Target size={17}/></div><strong>Seu objetivo</strong><p>Uma rotina consistente hoje constrói sua aprovação amanhã.</p><div className="goal-line"><span/></div><small>Continue avançando!</small></div>
      <button className="nav-item settings-item" onClick={() => setPage("Desempenho")}><Settings size={18}/><span>Configurações</span></button>
      <div className="profile"><div className="avatar">E</div><div><strong>Estudante</strong><span>Minha preparação</span></div><MoreHorizontal size={18} className="muted"/></div>
    </div>
  </aside>;

  return <div className="app-shell">
    <Sidebar />
    {mobileOpen && <div className="scrim" onClick={() => setMobileOpen(false)} />}
    <main className="main-area">
      <header className="topbar">
        <div className="top-left"><button className="mobile-menu icon-button" onClick={() => setMobileOpen(true)}><Menu size={20}/></button><div className="breadcrumb">Workspace <ChevronRight size={14}/> <strong>{page}</strong></div></div>
        <div className="top-actions"><div className="today-chip"><CalendarDays size={15}/><span>{dateLabel}</span></div><button className="icon-button notification" aria-label="Notificações"><Bell size={18}/><i/></button><div className="top-avatar">E</div></div>
      </header>
      <div className="content">
        {page === "Visão geral" && <Dashboard tasks={tasks} subjects={subjects} completed={completed} totalMinutes={totalMinutes} completion={completion} onToggle={toggleTask} onAdd={() => setShowTaskForm(true)} onNavigate={setPage} />}
        {page === "Meu cronograma" && <Schedule tasks={tasks} onToggle={toggleTask} onAdd={() => setShowTaskForm(true)} onRemove={removeTask} />}
        {page === "Disciplinas" && <Subjects subjects={filteredSubjects} search={search} setSearch={setSearch} onAdd={addSubject} />}
        {page === "Exercícios" && <Exercises />}
        {page === "Redação" && <Essay />}
        {page === "Desempenho" && <Performance tasks={tasks} subjects={subjects} totalMinutes={totalMinutes} />}
      </div>
      <footer className="footer"><span>Projeto Aprovação © 2026</span><span><CircleHelp size={13}/> Sua evolução começa com um passo de cada vez.</span></footer>
    </main>
    {showTaskForm && <div className="modal-backdrop" onClick={() => setShowTaskForm(false)}><form className="modal" onSubmit={addTask} onClick={e => e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">PLANEJAMENTO</span><h2>Nova atividade</h2></div><button type="button" className="icon-button" onClick={() => setShowTaskForm(false)}><X size={18}/></button></div><label>O que você vai estudar?<input autoFocus value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Ex.: Equações de primeiro grau" required /></label><div className="form-grid"><label>Disciplina<select value={newSubject} onChange={e => setNewSubject(e.target.value)}>{subjects.map(s => <option key={s.id}>{s.name}</option>)}</select></label><label>Horário<input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} /></label></div><label>Duração estimada (minutos)<input type="number" min="5" max="300" step="5" value={newDuration} onChange={e => setNewDuration(Number(e.target.value))}/></label><button className="primary-button full" type="submit"><Plus size={17}/> Adicionar ao cronograma</button></form></div>}
  </div>;
}

function PageHeading({eyebrow, title, subtitle, action}: {eyebrow: string; title: string; subtitle: string; action?: React.ReactNode}) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>;
}

function Dashboard({tasks, subjects, completed, totalMinutes, completion, onToggle, onAdd, onNavigate}: {
  tasks: Task[]; subjects: Subject[]; completed: number; totalMinutes: number; completion: number;
  onToggle: (id:number)=>void; onAdd:()=>void; onNavigate:(p:Page)=>void;
}) {
  const hours = Math.floor(totalMinutes / 60), mins = totalMinutes % 60;
  return <>
    <PageHeading eyebrow="QUARTA-FEIRA • SUA JORNADA CONTINUA" title="Bom dia! Vamos avançar?" subtitle="Aqui está o resumo da sua preparação. Um passo de cada vez." action={<button className="primary-button" onClick={onAdd}><Plus size={17}/> Nova atividade</button>}/>
    <section className="stats-grid">
      <Stat icon={<Clock3/>} label="Tempo estudado hoje" value={`${hours}h ${mins.toString().padStart(2,"0")}m`} note="Com base nas atividades concluídas" tone="purple"/>
      <Stat icon={<Check/>} label="Atividades concluídas" value={`${completed}/${tasks.length}`} note={`${completion}% do planejamento de hoje`} tone="green"/>
      <Stat icon={<BookOpen/>} label="Disciplinas ativas" value={String(subjects.length)} note="No seu plano de preparação" tone="blue"/>
      <Stat icon={<Flame/>} label="Constância" value="—" note="A sequência será calculada com histórico diário" tone="orange"/>
    </section>
    <div className="dashboard-grid">
      <section className="panel schedule-panel">
        <div className="panel-heading"><div><h2>Meu dia</h2><p>Atividades planejadas para hoje</p></div><button className="text-button" onClick={() => onNavigate("Meu cronograma")}>Ver cronograma <ChevronRight size={15}/></button></div>
        <div className="task-list">{tasks.length === 0 && <div className="empty-state">Nenhuma atividade planejada. Adicione sua primeira tarefa!</div>}{tasks.map(task => <div className={`task-row ${task.done ? "task-done" : ""}`} key={task.id}><button className={`task-check ${task.done ? "checked" : ""}`} onClick={() => onToggle(task.id)} aria-label="Marcar conclusão">{task.done && <Check size={14}/>}</button><div className="task-time">{task.time}</div><div className="task-info"><strong>{task.title}</strong><span>{task.subject} <i/> {task.duration} min</span></div><span className={`task-status ${task.done ? "status-done" : "status-pending"}`}>{task.done ? "Concluído" : "Pendente"}</span></div>)}</div>
        <button className="add-inline" onClick={onAdd}><Plus size={16}/> Adicionar atividade</button>
      </section>
      <section className="panel progress-panel">
        <div className="panel-heading"><div><h2>Visão da preparação</h2><p>Progresso dos conteúdos</p></div><button className="more-button"><MoreHorizontal size={19}/></button></div>
        <div className="progress-ring-wrap"><div className="progress-ring" style={{background:`conic-gradient(#7567e8 ${Math.round(subjects.reduce((a,s)=>a+s.completed,0)/Math.max(1,subjects.reduce((a,s)=>a+s.topics,0))*100)}%, #eeedf5 0)`}}><div className="ring-inner"><strong>{Math.round(subjects.reduce((a,s)=>a+s.completed,0)/Math.max(1,subjects.reduce((a,s)=>a+s.topics,0))*100)}%</strong><span>concluído</span></div></div></div>
        <div className="progress-legend"><span><i className="legend-purple"/>Conteúdos concluídos</span><strong>{subjects.reduce((a,s)=>a+s.completed,0)}</strong><span><i className="legend-gray"/>Conteúdos mapeados</span><strong>{subjects.reduce((a,s)=>a+s.topics,0)}</strong></div>
        <button className="outline-button full" onClick={() => onNavigate("Disciplinas")}>Acompanhar disciplinas <ChevronRight size={15}/></button>
      </section>
    </div>
    <div className="lower-grid">
      <section className="panel chart-panel"><div className="panel-heading"><div><h2>Ritmo de estudos</h2><p>Horas estudadas na semana (dados demonstrativos)</p></div><span className="period-tag">Esta semana</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={weekData} margin={{top:10,right:8,left:-22,bottom:0}}><defs><linearGradient id="studyGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8174ed" stopOpacity={0.22}/><stop offset="95%" stopColor="#8174ed" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#f0eff5" vertical={false}/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill:"#9291a1",fontSize:12}} dy={10}/><YAxis axisLine={false} tickLine={false} tick={{fill:"#9291a1",fontSize:11}}/><Tooltip contentStyle={{borderRadius:12,border:"1px solid #eeedf4",fontSize:12}} formatter={(v) => [`${v} horas`, "Estudo"]}/><Area type="monotone" dataKey="hours" stroke="#8174ed" strokeWidth={2.5} fill="url(#studyGradient)"/></AreaChart></ResponsiveContainer></div></section>
      <section className="panel focus-panel"><div className="panel-heading"><div><h2>Foco de estudo</h2><p>Use o temporizador para manter a concentração</p></div><Brain size={19} className="muted"/></div><FocusTimer/><div className="focus-tip"><Target size={16}/><span>Experimente 25 minutos de foco e 5 minutos de pausa.</span></div></section>
    </div>
  </>;
}

function Stat({icon,label,value,note,tone}:{icon:React.ReactNode;label:string;value:string;note:string;tone:string}) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong><span className="stat-note">{note}</span></div>;
}

function FocusTimer() {
  const [seconds,setSeconds] = useState(25*60), [running,setRunning] = useState(false);
  useEffect(()=>{ if(!running)return; const id=window.setInterval(()=>setSeconds(s=>{if(s<=1){setRunning(false);return 0;}return s-1;}),1000); return ()=>window.clearInterval(id);},[running]);
  const display = `${Math.floor(seconds/60).toString().padStart(2,"0")}:${(seconds%60).toString().padStart(2,"0")}`;
  return <div className="timer"><strong>{display}</strong><div><button className="timer-play" onClick={()=>setRunning(!running)}>{running?<Pause size={15}/>:<Play size={15}/>} {running?"Pausar":"Iniciar foco"}</button><button className="timer-reset" onClick={()=>{setRunning(false);setSeconds(25*60)}} aria-label="Reiniciar"><RotateCcw size={16}/></button></div></div>;
}

function Schedule({tasks,onToggle,onAdd,onRemove}:{tasks:Task[];onToggle:(id:number)=>void;onAdd:()=>void;onRemove:(id:number)=>void}) {
  return <><PageHeading eyebrow="ORGANIZAÇÃO" title="Meu cronograma" subtitle="Organize suas sessões e acompanhe o que foi realizado." action={<button className="primary-button" onClick={onAdd}><Plus size={17}/> Nova atividade</button>}/><section className="panel full-panel"><div className="panel-heading"><div><h2>Agenda do dia</h2><p>Marque cada atividade quando terminar.</p></div><span className="period-tag">{tasks.filter(t=>t.done).length} de {tasks.length} concluídas</span></div><div className="schedule-full-list">{tasks.length===0&&<div className="empty-state">Seu cronograma está vazio. Adicione uma atividade para começar.</div>}{tasks.map(t=><div className="schedule-card" key={t.id}><div className="schedule-time">{t.time}</div><div className="schedule-dot"/><div className="schedule-detail"><strong className={t.done?"strike":""}>{t.title}</strong><span>{t.subject} · {t.duration} minutos</span></div><span className={`task-status ${t.done?"status-done":"status-pending"}`}>{t.done?"Concluído":"Pendente"}</span><button className="icon-button delete-button" onClick={()=>onRemove(t.id)} title="Excluir atividade"><Trash2 size={16}/></button><button className={`task-check ${t.done?"checked":""}`} onClick={()=>onToggle(t.id)} aria-label="Alternar conclusão">{t.done&&<Check size={14}/>}</button></div>)}</div></section></>;
}

function Subjects({subjects,search,setSearch,onAdd}:{subjects:Subject[];search:string;setSearch:(v:string)=>void;onAdd:()=>void}) {
  return <><PageHeading eyebrow="SEU CONTEÚDO" title="Disciplinas" subtitle="Acompanhe o avanço em cada matéria da sua preparação." action={<button className="primary-button" onClick={onAdd}><Plus size={17}/> Nova disciplina</button>}/><div className="toolbar"><div className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar disciplina..."/></div><span className="muted small">{subjects.length} disciplinas</span></div><div className="subject-grid">{subjects.map(s=><div className="subject-card" key={s.id}><div className="subject-card-top"><div className="subject-symbol" style={{background:`${s.color}18`,color:s.color}}><BookMarked size={20}/></div><button className="more-button"><MoreHorizontal size={19}/></button></div><h3>{s.name}</h3><p>{s.completed} de {s.topics} conteúdos concluídos</p><div className="subject-progress"><span style={{width:`${s.topics?Math.min(100,s.completed/s.topics*100):0}%`,background:s.color}}/></div><div className="subject-card-bottom"><span>{s.topics?Math.round(s.completed/s.topics*100):0}% concluído</span><button className="text-button">Ver conteúdos <ChevronRight size={14}/></button></div></div>)}</div>{subjects.length===0&&<div className="empty-state panel">Nenhuma disciplina encontrada.</div>}</>;
}

function Exercises() {
  const [subject,setSubject]=useState("Matemática"),[topic,setTopic]=useState("Porcentagem"),[total,setTotal]=useState("15"),[correct,setCorrect]=useState("11"),[records,setRecords]=useState<{id:number;subject:string;topic:string;total:number;correct:number;date:string}[]>(()=>readStorage("pa-exercises",[]));
  useEffect(()=>localStorage.setItem("pa-exercises",JSON.stringify(records)),[records]);
  const pct=Number(total)>0?Math.round(Number(correct)/Number(total)*100):0;
  function save(e:React.FormEvent){e.preventDefault();if(Number(correct)>Number(total)||Number(total)<1)return;setRecords(r=>[{id:Date.now(),subject,topic,total:Number(total),correct:Number(correct),date:new Date().toLocaleDateString("pt-BR")},...r]);}
  return <><PageHeading eyebrow="PRÁTICA E FIXAÇÃO" title="Exercícios" subtitle="Registre suas questões e descubra onde precisa melhorar."/><div className="exercise-grid"><form className="panel exercise-form" onSubmit={save}><div className="panel-heading"><div><h2>Novo registro</h2><p>Informe o resultado da sua sessão.</p></div><ClipboardList size={19} className="muted"/></div><label>Disciplina<select value={subject} onChange={e=>setSubject(e.target.value)}>{["Matemática","Física","Química","Biologia","Português","História","Geografia"].map(x=><option>{x}</option>)}</select></label><label>Conteúdo<input value={topic} onChange={e=>setTopic(e.target.value)} required/></label><div className="form-grid"><label>Questões feitas<input type="number" min="1" value={total} onChange={e=>setTotal(e.target.value)}/></label><label>Acertos<input type="number" min="0" value={correct} onChange={e=>setCorrect(e.target.value)}/></label></div><div className="accuracy-preview"><span>Taxa de acerto</span><strong>{pct}%</strong></div><button className="primary-button full" type="submit"><Plus size={16}/> Salvar resultado</button></form><section className="panel exercise-history"><div className="panel-heading"><div><h2>Histórico de exercícios</h2><p>Seus registros mais recentes</p></div></div>{records.length===0?<div className="empty-state">Seus registros aparecerão aqui depois de salvar uma sessão.</div>:records.map(r=><div className="history-row" key={r.id}><div className="history-icon"><ClipboardList size={17}/></div><div className="history-info"><strong>{r.topic}</strong><span>{r.subject} · {r.date}</span></div><div className="history-score"><strong>{r.correct}/{r.total}</strong><span>{Math.round(r.correct/r.total*100)}% de acerto</span></div></div>)}</section></div></>;
}

function Essay() {
  const [theme,setTheme]=useState(""),[text,setText]=useState(""),[essays,setEssays]=useState<{id:number;theme:string;text:string;date:string}[]>(()=>readStorage("pa-essays",[]));
  useEffect(()=>localStorage.setItem("pa-essays",JSON.stringify(essays)),[essays]);
  function save(){if(!theme.trim()||!text.trim())return;setEssays(e=>[{id:Date.now(),theme,text,date:new Date().toLocaleDateString("pt-BR")},...e]);setTheme("");setText("");}
  return <><PageHeading eyebrow="PRODUÇÃO TEXTUAL" title="Redação" subtitle="Organize seus temas, pratique e acompanhe sua evolução."/><div className="essay-layout"><section className="panel essay-editor"><div className="panel-heading"><div><h2>Nova redação</h2><p>Escreva e salve seu texto para consultar depois.</p></div><PenLine size={19} className="muted"/></div><label>Tema da redação<input value={theme} onChange={e=>setTheme(e.target.value)} placeholder="Ex.: Desafios da educação digital no Brasil"/></label><label>Seu texto<textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Comece a escrever sua redação aqui..." rows={12}/></label><div className="essay-bottom"><span>{text.trim()?text.trim().split(/\s+/).length:0} palavras</span><button className="primary-button" onClick={save}>Salvar redação</button></div></section><section className="panel essay-history"><div className="panel-heading"><div><h2>Minhas redações</h2><p>Textos salvos neste dispositivo</p></div></div>{essays.length===0?<div className="empty-state">Suas redações salvas aparecerão aqui.</div>:essays.map(e=><div className="essay-record" key={e.id}><div><strong>{e.theme}</strong><span>{e.date} · {e.text.trim().split(/\s+/).length} palavras</span></div><button className="text-button" onClick={()=>{setTheme(e.theme);setText(e.text)}}>Abrir</button></div>)}</section></div></>;
}

function Performance({tasks,subjects,totalMinutes}:{tasks:Task[];subjects:Subject[];totalMinutes:number}) {
  const done=tasks.filter(t=>t.done).length, total=subjects.reduce((a,s)=>a+s.topics,0), finished=subjects.reduce((a,s)=>a+s.completed,0);
  return <><PageHeading eyebrow="ANÁLISE DA JORNADA" title="Desempenho" subtitle="Acompanhe seus indicadores e identifique oportunidades de melhoria."/><div className="stats-grid"><Stat icon={<Clock3/>} label="Tempo registrado" value={`${Math.floor(totalMinutes/60)}h ${totalMinutes%60}m`} note="Atividades concluídas no cronograma" tone="purple"/><Stat icon={<Check/>} label="Atividades concluídas" value={`${done}/${tasks.length}`} note="No cronograma atual" tone="green"/><Stat icon={<BookOpen/>} label="Conteúdos concluídos" value={`${finished}/${total}`} note="Em todas as disciplinas" tone="blue"/><Stat icon={<Target/>} label="Progresso dos conteúdos" value={`${total?Math.round(finished/total*100):0}%`} note="Com base no mapa inicial" tone="orange"/></div><section className="panel full-panel"><div className="panel-heading"><div><h2>Progresso por disciplina</h2><p>Percentual de conteúdos marcados como concluídos.</p></div></div>{subjects.map(s=><div className="performance-row" key={s.id}><span>{s.name}</span><div className="subject-progress"><span style={{width:`${s.topics?Math.min(100,s.completed/s.topics*100):0}%`,background:s.color}}/></div><strong>{s.topics?Math.round(s.completed/s.topics*100):0}%</strong></div>)}</section><p className="disclaimer">Os indicadores são calculados a partir dos registros feitos nesta versão inicial. Alguns dados demonstrativos serão substituídos por seu histórico real conforme você utilizar a plataforma.</p></>;
}

export default App;
