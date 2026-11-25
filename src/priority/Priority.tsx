import { useState } from "react";
import { Clock3 } from "lucide-react";
import { priorityLevels, type Basis, type Priority, type PriorityTopic } from "./guides";
import { guideFor, priorityFor, shortDayOptions, type StudyOption } from "./planning";
import type { Subject, Topic } from "../studyTopics";
import "./priority.css";

const sources = {
  sas: {
    label: "SAS Educação · Raio X ENEM, 2009–2025 (PDF)",
    url: "https://prod-assets-saseducacao.s3.amazonaws.com/public/2026-04/RAIO-X_ENEM%20SAS.pdf?VersionId=1qwKGl_vetiOrP1ROPpo8oO823hRWGF9"
  },
  base: {
    label: "Inep · Matriz de Referência do Enem",
    url: "https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem"
  },
  redacao: {
    label: "Inep · Cartilha da Redação do Enem 2026",
    url: "https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/a-redacao-do-enem-2026-cartilha-do-a-participante"
  },
  estetica: {
    label: "Inep · Estudo sobre filosofia no Enem, 1998–2018 (PDF)",
    url: "https://rbep.inep.gov.br/ojs3/index.php/relatos/article/download/4931/4140/"
  }
};
const dossierPages: Record<string, string> = {
  "Matemática":"matematica-no-enem", "Física":"assuntos-fisica-enem", "Química":"assuntos-quimica-enem",
  "Biologia":"biologia-enem", "Português":"questoes-portugues-enem", "História":"historia-no-enem",
  "Geografia":"geografia-no-enem", "Filosofia":"filosofia-no-enem"
};
function reference(basis: Basis, topic: Topic) {
  if (basis !== "dossie") return sources[basis];
  const subject = (topic.curriculumId ?? topic.id).split("-")[0];
  return {label: "Aprova Total · " + subject + " no Enem, 2016–2025", url: "https://aprovatotal.com.br/" + dossierPages[subject] + "/"};
}
const styles: Record<Priority, string> = {
  "Muito alta": "very-high", "Alta": "high", "Média": "medium", "Baixa": "low"
};

export function PriorityBadge({ topic, id }: { topic: PriorityTopic; id?: string }) {
  const level = priorityFor(topic);
  return <span id={id} className={"study-priority " + (level ? styles[level] : "unassigned")}>
    <i aria-hidden="true"/>{level ? "Prioridade " + level.toLocaleLowerCase("pt-BR") : "Prioridade a definir"}
  </span>;
}

export function PriorityKey() {
  return <details className="priority-key">
    <summary>Como a prioridade é definida</summary>
    <p>A indicação combina frequência em provas anteriores e utilidade para aprender outros temas. Os levantamentos agrupam assuntos de formas diferentes. Cada percentual se refere à disciplina e ao recorte citados no detalhe do tema. Em Redação, a referência são as cinco competências.</p>
    <dl>
      <dt>Muito alta</dt><dd>Primeira escolha para um bloco curto.</dd>
      <dt>Alta</dt><dd>Tema recorrente ou base útil em várias questões.</dd>
      <dt>Média</dt><dd>Consolide após os temas de maior prioridade.</dd>
      <dt>Baixa</dt><dd>Reserve para uma revisão pontual ou para uma dificuldade sua.</dd>
    </dl>
  </details>;
}

export function TopicPriority({ topic, onChange }: { topic: Topic; onChange: (value?: Priority) => void }) {
  const guide = guideFor(topic);
  const source = guide && reference(guide.basis, topic);
  return <section className="priority-detail" aria-label="Prioridade de estudo">
    <div className="priority-detail-top"><h2>Prioridade de estudo</h2><PriorityBadge topic={topic}/></div>
    {guide && source ? <>
      <p><b>Sugestão para o ENEM · {guide.level}</b></p>
      <p>{guide.reason}</p>
      <a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a>
    </> : <p>Escolha a prioridade deste tema de acordo com seu objetivo e as dificuldades que encontrou.</p>}
    <label>Minha prioridade
      <select value={topic.priorityOverride ?? ""} onChange={event => onChange(event.target.value as Priority || undefined)}>
        <option value="">{guide ? "Usar sugestão para o ENEM" : "A definir"}</option>
        {priorityLevels.map(level => <option key={level}>{level}</option>)}
      </select>
    </label>
  </section>;
}

type ShortDayProps = {
  subjects: Subject[];
  options: StudyOption[];
  onStudy: (topic: Topic) => void;
  onPractice: (topic: Topic) => void;
};

export function ShortDay({ subjects, options, onStudy, onPractice }: ShortDayProps) {
  const [subject, setSubject] = useState("");
  const picks = shortDayOptions(options, subject);
  return <section className="panel short-day" aria-label="Tenho pouco tempo hoje">
    <div className="short-day-head">
      <div><h2><Clock3 size={19} aria-hidden="true"/> Tenho pouco tempo hoje</h2>
        <p>Tem 15 minutos? Escolha um tema e tente uma questão antes de conferir a resolução.</p></div>
      <label>Matéria<select value={subject} onChange={e => setSubject(e.target.value)}>
        <option value="">Todas as matérias</option>
        {subjects.map(s => <option key={s.id}>{s.name}</option>)}
      </select></label>
    </div>
    {picks.length ? <ul>{picks.map(({ topic, unlocked, status, practice }) => (
      <li key={topic.id}>
        <div><PriorityBadge topic={topic}/><small>{topic.subject}</small>
          <strong>{topic.title}</strong>
          {!unlocked && <small>Prática avulsa enquanto a aula aguarda pré-requisitos.</small>}
        </div>
        <div className="short-day-actions">
          {practice && <button type="button" className="secondary-button" onClick={() => onPractice(topic)}>Praticar</button>}
          {unlocked && <button type="button" className="secondary-button" onClick={() => onStudy(topic)}>
            {status === "em andamento" ? "Retomar estudo" : "Iniciar estudo"}
          </button>}
        </div>
      </li>
    ))}</ul> : <p>Nenhum tema pendente disponível para esta seleção. Os exercícios continuam disponíveis no banco para revisão.</p>}
    <PriorityKey/>
  </section>;
}
