
import { useEffect, useState } from "react";
import {
  Sprout, LayoutDashboard, Map, ClipboardList, ChartNoAxesCombined,
  Settings, Bell, Plus, Leaf, AlertTriangle, Activity, CloudSun,
  Search, X, ArrowUpRight, CalendarDays, ChevronRight,
  ShieldCheck, Droplets, ThermometerSun, TrendingUp, Eye,
  ScanLine, CircleAlert, CheckCircle2, Sparkles
} from "lucide-react";
import "./App.css";
import AssistantPage from "./AssistantPage.jsx";

const API = "/api/ocorrencias";
const TALHOES_API = "/api/talhoes";
const today = new Date().toISOString().slice(0, 10);
const fromApi = (item) => ({
  id: item.id,
  talhao: item.nomeTalhao || "",
  cultura: item.cultura || "",
  doenca: item.doenca || "",
  severidade: item.severidade || "Média",
  data: item.dataOcorrencia ? item.dataOcorrencia.split("T")[0].split("-").reverse().join("/") : "",
  observacoes: item.observacoes || "",
  status: "Registrada",
});


const demoPlots = ["Talhão Norte", "Talhão Sul", "Talhão Oeste", "Talhão Sudeste"];

function App() {
  const [activePage, setActivePage] = useState("Visão geral");
  const [occurrences, setOccurrences] = useState([]);
  const [talhoes, setTalhoes] = useState([]);
  const [plotFormOpen, setPlotFormOpen] = useState(false);
  const [editingPlotId, setEditingPlotId] = useState(null);
  const [plotForm, setPlotForm] = useState({ nome: "", cultura: "Soja", areaHectares: "", observacoes: "" });
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    talhao: "",
    cultura: "Soja",
    doenca: "",
    severidade: "Média",
    data: today,
    observacoes: "",
  });

  async function loadOccurrences() {
    setLoading(true);
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error("Não foi possível carregar as ocorrências.");
      const data = await response.json();
      setOccurrences(data.map(fromApi));
      setApiError("");
    } catch (error) {
      setApiError(`${error.message} Verifique se o backend está ativo.`);
    } finally {
      setLoading(false);
    }
  }

  async function loadTalhoes() {
    try {
      const response = await fetch(TALHOES_API);
      if (!response.ok) throw new Error("Não foi possível carregar os talhões.");
      setTalhoes(await response.json());
    } catch (error) { setApiError(`${error.message} Verifique se o backend está ativo.`); }
  }

  useEffect(() => { loadOccurrences(); loadTalhoes(); }, []);

  const menuItems = [
    { name: "Visão geral", icon: LayoutDashboard },
    { name: "Ocorrências", icon: ClipboardList },
    { name: "Talhões", icon: Map },
    { name: "Relatórios", icon: ChartNoAxesCombined },
    { name: "Assistente IA", icon: Sparkles },
  ];

  const highCount = occurrences.filter(
    (item) => item.severidade === "Alta"
  ).length;

  const filteredOccurrences = occurrences.filter((item) =>
    `${item.talhao} ${item.cultura} ${item.doenca}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const severitySummary = ["Alta", "Média", "Baixa"].map((label) => ({
    label,
    count: occurrences.filter((item) => item.severidade === label).length,
    tone: label === "Alta" ? "high" : label === "Média" ? "medium" : "low",
  }));
  const cultureSummary = Object.entries(occurrences.reduce((counts, item) => {
    const culture = item.cultura || "Não informada";
    counts[culture] = (counts[culture] || 0) + 1;
    return counts;
  }, {})).sort((a, b) => b[1] - a[1]);
  const affectedPlots = new Set(occurrences.map((item) => item.talhao).filter(Boolean)).size;
  const validOccurrenceDates = occurrences.map((item) => {
    const [day, month, year] = (item.data || "").split("/");
    return year && month && day ? new Date(Number(year), Number(month) - 1, Number(day)) : null;
  }).filter((date) => date && !Number.isNaN(date.getTime()));
  const lastOccurrenceDate = validOccurrenceDates.length
    ? new Date(Math.max(...validOccurrenceDates.map((date) => date.getTime())))
    : new Date();
  const monthlySummary = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(lastOccurrenceDate.getFullYear(), lastOccurrenceDate.getMonth() - 5 + index, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return {
      key,
      label: date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
      count: occurrences.filter((item) => {
        const parts = (item.data || "").split("/");
        return parts.length === 3 && `${parts[2]}-${parts[1]}` === key;
      }).length,
    };
  });
  const maxMonthlyCount = Math.max(1, ...monthlySummary.map((item) => item.count));
  const maxCultureCount = Math.max(1, ...cultureSummary.map(([, count]) => count));

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      nomeTalhao: form.talhao.trim(), cultura: form.cultura,
      doenca: form.doenca.trim(), severidade: form.severidade,
      dataOcorrencia: form.data, observacoes: form.observacoes.trim(),
    };
    try {
      const response = await fetch(editingId ? `${API}/${editingId}` : API, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Não foi possível salvar. Confira os dados e a conexão com o backend.");
      await loadOccurrences();
      setForm({ talhao: "", cultura: "Soja", doenca: "", severidade: "Média", data: today, observacoes: "" });
      setEditingId(null);
      setShowForm(false);
    } catch (error) { setApiError(error.message); }
  }

  function editOccurrence(item) {
    setForm({ talhao: item.talhao, cultura: item.cultura, doenca: item.doenca, severidade: item.severidade, data: item.data.split("/").reverse().join("-"), observacoes: item.observacoes });
    setEditingId(item.id);
    setShowForm(true);
  }

  async function deleteOccurrence(id) {
    if (!window.confirm("Excluir esta ocorrência? Esta ação não pode ser desfeita.")) return;
    try {
      const response = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Não foi possível excluir a ocorrência.");
      await loadOccurrences();
      setApiError("");
    } catch (error) { setApiError(error.message); }
  }

  function openNewForm() {
    setForm({ talhao: "", cultura: "Soja", doenca: "", severidade: "Média", data: today, observacoes: "" });
    setEditingId(null);
    setShowForm(true);
  }

  async function submitPlot(e) {
    e.preventDefault();
    const payload = { ...plotForm, nome: plotForm.nome.trim(), areaHectares: Number(plotForm.areaHectares), observacoes: plotForm.observacoes.trim() };
    try {
      const response = await fetch(editingPlotId ? `${TALHOES_API}/${editingPlotId}` : TALHOES_API, {
        method: editingPlotId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Não foi possível salvar o talhão.");
      await loadTalhoes();
      setPlotForm({ nome: "", cultura: "Soja", areaHectares: "", observacoes: "" });
      setEditingPlotId(null);
      setPlotFormOpen(false);
      setApiError("");
    } catch (error) { setApiError(error.message); }
  }

  function editPlot(plot) {
    setPlotForm({ nome: plot.nome, cultura: plot.cultura, areaHectares: String(plot.areaHectares), observacoes: plot.observacoes || "" });
    setEditingPlotId(plot.id);
    setPlotFormOpen(true);
  }

  async function deletePlot(id) {
    if (!window.confirm("Excluir este talhão? Esta ação não pode ser desfeita.")) return;
    try {
      const response = await fetch(`${TALHOES_API}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Não foi possível excluir o talhão.");
      await loadTalhoes();
      setApiError("");
    } catch (error) { setApiError(error.message); }
  }

  function openPlotForm() {
    setPlotForm({ nome: "", cultura: "Soja", areaHectares: "", observacoes: "" });
    setEditingPlotId(null);
    setPlotFormOpen(true);
  }

  return (
    <div className="agro-app">
      <header className="main-header">
        <button className="brand" onClick={() => setActivePage("Visão geral")}>
          <span className="brand-symbol"><Sprout size={25} /></span>
          <span className="brand-name">
            <strong>AgroTrack</strong>
            <small>INTELIGÊNCIA NO CAMPO</small>
          </span>
        </button>

        <nav className="main-navigation">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`navigation-item ${activePage === item.name ? "selected" : ""}`}
              onClick={() => setActivePage(item.name)}
            >
              <item.icon size={17} />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="header-tools">
          <span className="system-status"><i /> Sistema ativo</span>
          <button className="header-icon" aria-label="Notificações">
            <Bell size={19} />
            <i />
          </button>
          <div className="user-avatar">AT</div>
        </div>
      </header>

      <main className="page-container">
        <div className="page-topline">
          <div className="breadcrumb">
            AGROTRACK <ChevronRight size={13} /> <strong>{activePage.toUpperCase()}</strong>
          </div>
          <div className="current-date">
            <CalendarDays size={15} /> 09 de novembro de 2026
          </div>
        </div>

        {apiError && <div className="api-message error" role="alert">{apiError} <button onClick={() => { loadOccurrences(); loadTalhoes(); }}>Tentar novamente</button></div>}
        {!apiError && loading && <div className="api-message">Conectando ao AgroTrack…</div>}

        {activePage === "Visão geral" && (
          <>
            <section className="intro-section">
              <div>
                <span className="section-kicker">CENTRAL DE INTELIGÊNCIA AGRÍCOLA</span>
                <h1>Visão geral da propriedade</h1>
                <p>Dados do campo para decisões mais inteligentes.</p>
              </div>
              <button className="action-button" onClick={openNewForm}>
                <Plus size={18} /> Registrar ocorrência
              </button>
            </section>

            <section className="kpi-grid">
              <KpiCard
                icon={Map}
                label="Áreas monitoradas"
                value={talhoes.length}
                detail="Talhões cadastrados"
                color="green"
              />
              <KpiCard
                icon={ClipboardList}
                label="Ocorrências registradas"
                value={occurrences.length}
                detail="Registros no sistema"
                color="sand"
              />
              <KpiCard
                icon={AlertTriangle}
                label="Alertas prioritários"
                value={highCount}
                detail="Exigem acompanhamento"
                color="orange"
              />
              <KpiCard
                icon={Activity}
                label="Saúde média das áreas"
                value="81%"
                detail="Índice demonstrativo"
                color="blue"
              />
            </section>

            <section className="analysis-grid">
              <div className="analysis-card health-card">
                <div className="card-title-row">
                  <div>
                    <span className="section-kicker">CONDIÇÃO VEGETATIVA</span>
                    <h2>Saúde das culturas</h2>
                    <p>Indicadores ilustrativos de monitoramento</p>
                  </div>
                  <span className="tag-neutral"><ScanLine size={14} /> Análise geral</span>
                </div>

                <div className="health-main">
                  <div className="health-gauge">
                    <div className="gauge-inner">
                      <strong>81<span>%</span></strong>
                      <small>ÍNDICE GERAL</small>
                    </div>
                  </div>
                  <div className="health-description">
                    <span className="health-status"><CheckCircle2 size={16} /> Condição favorável</span>
                    <h3>Áreas em acompanhamento</h3>
                    <p>Uma das áreas apresenta alerta de severidade alta e precisa de avaliação.</p>
                    <div className="health-legend">
                      <span><i className="dot-good" /> Saudável</span>
                      <span><i className="dot-warning" /> Atenção</span>
                      <span><i className="dot-risk" /> Crítico</span>
                    </div>
                  </div>
                </div>

                <div className="crop-bars">
                  <CropBar name="Soja" value={72} />
                  <CropBar name="Milho" value={94} />
                  <CropBar name="Café" value={87} />
                </div>
              </div>

              <div className="analysis-card alert-card">
                <div className="card-title-row">
                  <div>
                    <span className="section-kicker">CENTRAL DE ALERTAS</span>
                    <h2>Pontos de atenção</h2>
                    <p>Ocorrências que precisam de análise</p>
                  </div>
                  <span className="alert-counter">{highCount}</span>
                </div>

                {occurrences.length > 0 ? (
                  <div className="alert-item">
                    <div className="alert-symbol"><CircleAlert size={19} /></div>
                    <div className="alert-content">
                      <span className="alert-label">SEVERIDADE ALTA</span>
                      <strong>{occurrences[0].doenca}</strong>
                      <p>{occurrences[0].talhao} · {occurrences[0].cultura}</p>
                      <small>{occurrences[0].data}</small>
                    </div>
                  </div>
                ) : (
                  <div className="no-alerts">
                    <ShieldCheck size={30} />
                    <strong>Nenhum alerta registrado</strong>
                    <span>As ocorrências aparecerão aqui.</span>
                  </div>
                )}

                <button
                  className="subtle-link"
                  onClick={() => setActivePage("Ocorrências")}
                >
                  Acessar ocorrências <ArrowUpRight size={15} />
                </button>
              </div>
            </section>

            <section className="environment-strip">
              <div className="environment-heading">
                <div>
                  <span className="section-kicker">CONTEXTO OPERACIONAL</span>
                  <h2>Condições de monitoramento</h2>
                </div>
                <span className="demo-label">DADOS DEMONSTRATIVOS</span>
              </div>
              <div className="environment-metrics">
                <EnvironmentMetric icon={CloudSun} label="Condição climática" value="Não integrada" />
                <EnvironmentMetric icon={ThermometerSun} label="Temperatura" value="Aguardando dados" />
                <EnvironmentMetric icon={Droplets} label="Umidade" value="Aguardando dados" />
                <EnvironmentMetric icon={TrendingUp} label="Tendência" value="Em acompanhamento" />
              </div>
            </section>

            <section className="recent-section">
              <div className="section-heading-row">
                <div>
                  <span className="section-kicker">HISTÓRICO</span>
                  <h2>Últimas ocorrências</h2>
                </div>
                <button className="subtle-link" onClick={() => setActivePage("Ocorrências")}>
                  Ver histórico completo <ArrowUpRight size={15} />
                </button>
              </div>
              <OccurrenceTable occurrences={occurrences.slice(0, 4)} onEdit={editOccurrence} onDelete={deleteOccurrence} />
            </section>
          </>
        )}

        {activePage === "Ocorrências" && (
          <>
            <section className="intro-section">
              <div>
                <span className="section-kicker">GESTÃO FITOSSANITÁRIA</span>
                <h1>Ocorrências da propriedade</h1>
                <p>Registre e acompanhe doenças e situações identificadas no campo.</p>
              </div>
              <button className="action-button" onClick={openNewForm}>
                <Plus size={18} /> Nova ocorrência
              </button>
            </section>

            <section className="list-summary">
              <div><strong>{occurrences.length}</strong><span>Total de registros</span></div>
              <div><strong>{highCount}</strong><span>Alta severidade</span></div>
              <div><strong>{occurrences.filter((o) => o.severidade === "Média").length}</strong><span>Média severidade</span></div>
            </section>

            <section className="data-card">
              <div className="data-card-heading">
                <div>
                  <h2>Histórico de registros</h2>
                  <p>Consulte as ocorrências cadastradas</p>
                </div>
                <div className="search-box">
                  <Search size={16} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar ocorrência..."
                  />
                </div>
              </div>
              <OccurrenceTable occurrences={filteredOccurrences} onEdit={editOccurrence} onDelete={deleteOccurrence} />
            </section>
          </>
        )}

        {activePage === "Talhões" && (
          <>
            <section className="intro-section">
              <div>
                <span className="section-kicker">GESTÃO TERRITORIAL</span>
                <h1>Áreas de cultivo</h1>
                <p>Cadastre e mantenha os dados dos seus talhões.</p>
              </div>
              <button className="action-button" onClick={openPlotForm}><Plus size={18} /> Novo talhão</button>
            </section>

            <div className="plot-summary">
              <div><strong>{talhoes.length || demoPlots.length}</strong><span>{talhoes.length ? "Talhões cadastrados" : "Talhões de exemplo"}</span></div>
              <div><strong>{talhoes.length ? `${talhoes.reduce((sum, plot) => sum + (Number(plot.areaHectares) || 0), 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ha` : "—"}</strong><span>{talhoes.length ? "Área total cadastrada" : "Área real ainda não informada"}</span></div>
              <div><strong>{talhoes.length ? new Set(talhoes.map((plot) => plot.cultura).filter(Boolean)).size : "—"}</strong><span>{talhoes.length ? "Culturas cadastradas" : "Culturas não informadas"}</span></div>
            </div>

            {!talhoes.length && <div className="demo-notice">Demonstração: estes nomes são exemplos visuais e não estão salvos no banco. Use “Novo talhão” para cadastrar as áreas reais.</div>}
            <section className="plots-grid">
              {(talhoes.length ? talhoes : demoPlots.map((nome) => ({ nome }))).map((plot, index) => (
                <div className="plot-card" key={plot.id || plot.nome}>
                  <div className={`plot-visual ${["healthy", "warning", "monitor"][index % 3]}`}>
                    <div className="plot-visual-lines" /><Sprout size={35} /><span>{plot.nome.toUpperCase()}</span>
                  </div>
                  <div className="plot-info">
                    <div className="plot-name-row">
                      <div><h3>{plot.nome}</h3><p>{talhoes.length ? `${plot.cultura} · ${Number(plot.areaHectares).toLocaleString("pt-BR")} ha` : "Talhão demonstrativo"}</p></div>
                    </div>
                    {talhoes.length > 0 && plot.observacoes && <p className="plot-notes">{plot.observacoes}</p>}
                    {talhoes.length > 0 && <div className="plot-actions"><button onClick={() => editPlot(plot)}>Editar</button><button onClick={() => deletePlot(plot.id)}>Excluir</button></div>}
                  </div>
                </div>
              ))}
            </section>
          </>
        )}

        {activePage === "Relatórios" && (
          <>
            <section className="intro-section">
              <div>
                <span className="section-kicker">ANÁLISE DE DADOS</span>
                <h1>Relatórios agrícolas</h1>
                <p>Indicadores e tendências calculados a partir das ocorrências cadastradas.</p>
              </div>
            </section>
            <section className="report-grid">
              <div className="report-card"><ClipboardList size={22} /><span>Total de ocorrências</span><strong>{occurrences.length}</strong></div>
              <div className="report-card"><AlertTriangle size={22} /><span>Severidade alta</span><strong>{highCount}</strong></div>
              <div className="report-card"><Map size={22} /><span>Talhões com registros</span><strong>{affectedPlots}</strong></div>
            </section>

            {occurrences.length ? <>
              <section className="report-analytics-grid">
                <article className="report-analysis-card">
                  <div className="report-analysis-heading"><h2>Ocorrências por severidade</h2><p>Distribuição dos registros atuais</p></div>
                  <div className="report-bars-list">
                    {severitySummary.map((item) => (
                      <div className="report-bar-row" key={item.label}>
                        <span>{item.label}</span>
                        <div className="report-meter-track"><div className={`report-meter-fill ${item.tone}`} style={{ width: `${occurrences.length ? (item.count / occurrences.length) * 100 : 0}%` }} /></div>
                        <strong>{item.count}</strong>
                      </div>
                    ))}
                  </div>
                  <p className="report-chart-note">A severidade reflete o que foi informado no cadastro; não é uma avaliação automática da lavoura.</p>
                </article>

                <article className="report-analysis-card">
                  <div className="report-analysis-heading"><h2>Registros por cultura</h2><p>Comparação das culturas cadastradas</p></div>
                  <div className="report-bars-list">
                    {cultureSummary.map(([culture, count]) => (
                      <div className="report-bar-row culture-row" key={culture}>
                        <span title={culture}>{culture}</span>
                        <div className="report-meter-track"><div className="report-meter-fill culture" style={{ width: `${(count / maxCultureCount) * 100}%` }} /></div>
                        <strong>{count}</strong>
                      </div>
                    ))}
                  </div>
                </article>
              </section>

              <section className="report-analysis-card report-trend-card">
                <div className="report-analysis-heading"><h2>Evolução mensal</h2><p>Ocorrências nos seis meses até o registro mais recente</p></div>
                <div className="report-month-bars">
                  {monthlySummary.map((month) => (
                    <div className="report-month-column" key={month.key}>
                      <strong>{month.count}</strong>
                      <div className="report-month-track"><div className="report-month-fill" style={{ height: `${month.count ? Math.max(8, (month.count / maxMonthlyCount) * 100) : 0}%` }} /></div>
                      <span>{month.label}</span>
                    </div>
                  ))}
                </div>
              </section>
            </> : <section className="report-empty-state">
              <ClipboardList size={30} />
              <strong>Ainda não há registros para analisar</strong>
              <span>Cadastre ocorrências para gerar os indicadores e as tendências deste relatório.</span>
              <button onClick={() => setActivePage("Ocorrências")}>Ir para Ocorrências</button>
            </section>}
          </>
        )}

        {activePage === "Assistente IA" && <AssistantPage />}

        <footer className="app-footer">
          <span>AGROTRACK</span> · Inteligência e tecnologia para o agronegócio
          <span className="footer-version">PROJETO ACADÊMICO</span>
        </footer>
      </main>

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <form className="occurrence-form" onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
            <div className="form-heading">
              <div>
                <span className="section-kicker">GESTÃO FITOSSANITÁRIA</span>
                <h2>{editingId ? "Editar ocorrência" : "Nova ocorrência"}</h2>
                <p>Informe os dados identificados na lavoura.</p>
              </div>
              <button type="button" className="modal-close" onClick={() => { setShowForm(false); setEditingId(null); }}>
                <X size={20} />
              </button>
            </div>

            <label>Nome do talhão
              <input required value={form.talhao} onChange={(e) => setForm({ ...form, talhao: e.target.value })} placeholder="Ex.: Talhão Norte" />
            </label>

            <div className="form-row">
              <label>Cultura
                <select value={form.cultura} onChange={(e) => setForm({ ...form, cultura: e.target.value })}>
                  <option>Soja</option><option>Milho</option><option>Café</option>
                  <option>Algodão</option><option>Trigo</option><option>Outra</option>
                </select>
              </label>
              <label>Severidade
                <select value={form.severidade} onChange={(e) => setForm({ ...form, severidade: e.target.value })}>
                  <option>Baixa</option><option>Média</option><option>Alta</option>
                </select>
              </label>
            </div>

            <label>Doença ou ocorrência
              <input required value={form.doenca} onChange={(e) => setForm({ ...form, doenca: e.target.value })} placeholder="Ex.: Ferrugem asiática" />
            </label>

            <label>Data da ocorrência
              <input required type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
            </label>

            <label>Observações
              <textarea rows="3" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Descreva os sinais observados na cultura..." />
            </label>

            <div className="form-actions">
              <button type="button" className="cancel-button" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancelar</button>
              <button type="submit" className="action-button"><Plus size={17} /> {editingId ? "Salvar alterações" : "Salvar ocorrência"}</button>
            </div>
          </form>
        </div>
      )}
      {plotFormOpen && (
        <div className="modal-backdrop" onClick={() => setPlotFormOpen(false)}>
          <form className="occurrence-form" onSubmit={submitPlot} onClick={(e) => e.stopPropagation()}>
            <div className="form-heading"><div><span className="section-kicker">GESTÃO TERRITORIAL</span><h2>{editingPlotId ? "Editar talhão" : "Novo talhão"}</h2><p>Informe os dados da área de cultivo.</p></div>
              <button type="button" className="modal-close" onClick={() => setPlotFormOpen(false)}><X size={20} /></button>
            </div>
            <label>Nome do talhão<input required maxLength="100" value={plotForm.nome} onChange={(e) => setPlotForm({ ...plotForm, nome: e.target.value })} placeholder="Ex.: Talhão Norte" /></label>
            <div className="form-row">
              <label>Cultura<select value={plotForm.cultura} onChange={(e) => setPlotForm({ ...plotForm, cultura: e.target.value })}><option>Soja</option><option>Milho</option><option>Café</option><option>Algodão</option><option>Trigo</option><option>Outra</option></select></label>
              <label>Área (hectares)<input required type="number" min="0.01" step="0.01" value={plotForm.areaHectares} onChange={(e) => setPlotForm({ ...plotForm, areaHectares: e.target.value })} placeholder="Ex.: 12,5" /></label>
            </div>
            <label>Observações<textarea rows="3" value={plotForm.observacoes} onChange={(e) => setPlotForm({ ...plotForm, observacoes: e.target.value })} placeholder="Anotações sobre o talhão (opcional)" /></label>
            <div className="form-actions"><button type="button" className="cancel-button" onClick={() => setPlotFormOpen(false)}>Cancelar</button><button type="submit" className="action-button">{editingPlotId ? "Salvar alterações" : "Salvar talhão"}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, detail, color }) {
  return (
    <article className="kpi-card">
      <div className={`kpi-icon ${color}`}><Icon size={20} /></div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function CropBar({ name, value }) {
  return (
    <div className="crop-bar">
      <div><span>{name}</span><strong>{value}%</strong></div>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${value}%` }} /></div>
    </div>
  );
}

function EnvironmentMetric({ icon: Icon, label, value }) {
  return (
    <div className="environment-metric">
      <div className="environment-icon"><Icon size={19} /></div>
      <div><span>{label}</span><strong>{value}</strong></div>
    </div>
  );
}

function OccurrenceTable({ occurrences, onEdit, onDelete }) {
  if (!occurrences.length) {
    return (
      <div className="empty-state">
        <ClipboardList size={30} />
        <strong>Nenhuma ocorrência encontrada</strong>
        <span>Cadastre uma ocorrência para começar.</span>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>TALHÃO</th><th>CULTURA</th><th>DOENÇA / OCORRÊNCIA</th>
            <th>SEVERIDADE</th><th>DATA</th><th>AÇÕES</th>
          </tr>
        </thead>
        <tbody>
          {occurrences.map((item) => (
            <tr key={item.id}>
              <td><strong>{item.talhao}</strong></td>
              <td>{item.cultura}</td>
              <td>{item.doenca}</td>
              <td><span className={`severity ${item.severidade.toLowerCase()}`}>{item.severidade}</span></td>
              <td>{item.data}</td>
              <td className="row-actions"><button onClick={() => onEdit(item)} aria-label="Editar ocorrência">Editar</button><button onClick={() => onDelete(item.id)} aria-label="Excluir ocorrência">Excluir</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
