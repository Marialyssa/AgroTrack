import { useState } from "react";
import { ArrowUpRight, LoaderCircle, Send, Sparkles } from "lucide-react";
import "./AssistantPage.css";

function cleanAnswer(text = "") {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^\s{0,3}#{1,6}\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`/g, "")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const examples = [
  "Qual talhão precisa de mais atenção e qual é o problema?",
  "Quais ocorrências têm severidade alta?",
  "Que manejo inicial posso avaliar para o problema mais recente?",
];

export default function AssistantPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function ask(value = question) {
    const prompt = value.trim();
    if (!prompt || busy) return;
    setQuestion(prompt);
    setBusy(true);
    setError("");
    setAnswer(null);
    try {
      const response = await fetch("/api/assistente/perguntar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pergunta: prompt }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.erro || "Não foi possível consultar o assistente.");
      setAnswer(result);
    } catch (err) {
      setError(err.message || "Não foi possível conectar ao assistente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="assistant-page">
      <div className="assistant-heading">
        <div className="assistant-emblem"><Sparkles size={23} /></div>
        <div>
          <span className="section-kicker">CONSULTA AOS DADOS DO AGROTRACK</span>
          <h1>Assistente de campo</h1>
          <p>Pergunte sobre os talhões e ocorrências registrados.</p>
        </div>
      </div>

      <div className="assistant-card">
        <div className="assistant-intro">
          <Sparkles size={18} />
          <div><strong>Como posso ajudar?</strong><span>Vou responder com base nos registros atuais do seu banco.</span></div>
        </div>
        <div className="assistant-examples">
          {examples.map((example) => <button key={example} onClick={() => { setQuestion(example); ask(example); }}>{example}<ArrowUpRight size={15} /></button>)}
        </div>
        <form className="assistant-compose" onSubmit={(event) => { event.preventDefault(); ask(); }}>
          <textarea value={question} maxLength={500} onChange={(event) => setQuestion(event.target.value)} placeholder="Ex.: Qual talhão precisa de mais atenção e qual é o problema?" rows={3} />
          <div className="assistant-compose-footer"><span>{question.length}/500 caracteres</span><button type="submit" disabled={busy || !question.trim()}>{busy ? <LoaderCircle className="assistant-spin" size={17} /> : <Send size={17} />}{busy ? "Consultando" : "Perguntar"}</button></div>
        </form>
        <p className="assistant-privacy">A pergunta e os dados necessários dos talhões e ocorrências serão enviados ao OpenRouter para gerar a resposta. O assistente não altera registros.</p>
      </div>

      {busy && <div className="assistant-feedback">Consultando os registros e preparando uma resposta…</div>}
      {error && <div className="assistant-answer assistant-error" role="alert"><strong>Não foi possível responder</strong><p>{error}</p></div>}
      {answer && <article className="assistant-answer"><div className="assistant-answer-title"><span><Sparkles size={16} /> Resposta do assistente</span><small>Baseada em {answer.talhoesConsultados} talhões e {answer.ocorrenciasConsultadas} ocorrências</small></div><p>{cleanAnswer(answer.resposta)}</p><small className="assistant-disclaimer">Sugestões de apoio, sem confirmação de registro de produtos. Antes de usar defensivo, confira a indicação para cultura e alvo no <a href="https://agrofit.agricultura.gov.br/agrofit_cons/principal_agrofit_cons" target="_blank" rel="noreferrer">AGROFIT/MAPA</a>, leia a bula e valide com um(a) agrônomo(a).</small></article>}
    </section>
  );
}
