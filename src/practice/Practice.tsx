import { BookOpen, ChevronRight, ExternalLink, PenLine, X } from "lucide-react";
import { resourcesFor, type PracticeResource } from "./resources";
import type { PriorityTopic } from "../priority/guides";
import { PriorityBadge } from "../priority/Priority";
import "./practice.css";

export type PracticeTopic = PriorityTopic & { subject: string; title: string };

type BankProps = {
  topics: PracticeTopic[];
  subject: string;
  title: string;
  query: string;
  onOpen: (topic: PracticeTopic) => void;
};

function searchable(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

function matchesResource(item: PracticeResource, search: string) {
  return searchable([item.title, item.source, item.kind, item.note].join(" ")).includes(search);
}

export function PracticeBank({ topics, subject, title, query, onOpen }: BankProps) {
  const search = searchable(query.trim());
  const groups = new Map<string, PracticeTopic[]>();

  for (const topic of topics) {
    if (subject !== "Todas" && topic.subject !== subject) continue;
    if (title !== "Todos" && topic.title !== title) continue;
    const resources = resourcesFor(topic);
    if (!resources.length) continue;
    if (search && !searchable(topic.subject + " " + topic.title).includes(search)
      && !resources.some(item => matchesResource(item, search))) continue;
    const group = groups.get(topic.subject);
    if (group) group.push(topic);
    else groups.set(topic.subject, [topic]);
  }

  return (
    <section className="panel practice-bank" aria-labelledby="practice-bank-title">
      <h2 id="practice-bank-title">Exercícios por tema</h2>
      {Array.from(groups, ([name, items]) => (
        <details key={name} open={subject !== "Todas" || title !== "Todos" || Boolean(search)}>
          <summary>{name} <span>({items.length} {items.length === 1 ? "tema" : "temas"})</span></summary>
          <ul className="practice-topic-list">
            {items.map(topic => (
              <li key={topic.id}>
                <button type="button" aria-label={topic.title} aria-describedby={"bank-priority-" + topic.id} onClick={() => onOpen(topic)}>
                  {topic.title}<PriorityBadge topic={topic} id={"bank-priority-" + topic.id}/><ChevronRight size={16} aria-hidden="true"/>
                </button>
                {search && resourcesFor(topic).filter(item => matchesResource(item, search)).map(item => (
                  <a className="practice-match" key={item.url} href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.title} · {item.source}
                  </a>
                ))}
              </li>
            ))}
          </ul>
          {name === "Química" && title === "Todos" && !search && (
            <a href="https://olharquimico.com/quimica-geral/" target="_blank" rel="noopener noreferrer">
              Todas as listas de Química Geral do Olhar Químico
            </a>
          )}
        </details>
      ))}
      {!groups.size && <p className="muted">Nenhuma atividade sugerida para essa busca.</p>}
    </section>
  );
}

function ResourceList({ resources }: { resources: readonly PracticeResource[] }) {
  return (
    <ul className="practice-resources">
      {resources.map(resource => (
        <li key={resource.url}>
          <span className="practice-meta">{resource.kind} · {resource.source}</span>
          <a href={resource.url} target="_blank" rel="noopener noreferrer">
            {resource.title} <ExternalLink size={15} aria-hidden="true"/>
          </a>
          <p>{resource.note}</p>
        </li>
      ))}
    </ul>
  );
}

type DialogProps = {
  topic: PracticeTopic;
  saved: { id: string; title: string }[];
  onDismiss: () => void;
  onExercise: (id: string) => void;
  onRegister: () => void;
  onWrite: () => void;
};

export function PracticeDialog({ topic, saved, onDismiss, onExercise, onRegister, onWrite }: DialogProps) {
  const resources = resourcesFor(topic);
  const visibleCount = 3;
  const remaining = resources.length - visibleCount;

  return (
    <dialog className="modal practice-dialog" aria-labelledby="practice-heading" aria-describedby="practice-topic"
      ref={node => { if (node && !node.open) node.showModal(); }} onClose={onDismiss}>
      <div className="modal-head">
        <h2 id="practice-heading">Pratique agora</h2>
        <button type="button" className="icon-button" aria-label="Fechar exercícios" onClick={onDismiss}><X/></button>
      </div>
      <p id="practice-topic">{topic.subject} · {topic.title}</p>
      <PriorityBadge topic={topic}/>
      <ResourceList resources={resources.slice(0, visibleCount)}/>
      {remaining > 0 && (
        <details className="practice-more">
          <summary>Ver mais {remaining} {remaining === 1 ? "atividade" : "atividades"} do tema</summary>
          <ResourceList resources={resources.slice(visibleCount)}/>
        </details>
      )}
      {saved.length > 0 && (
        <section className="practice-saved">
          <h3>Meus exercícios deste tema</h3>
          {saved.map(exercise => (
            <button type="button" key={exercise.id} className="secondary-button" onClick={() => onExercise(exercise.id)}>
              {exercise.title}
            </button>
          ))}
        </section>
      )}
      <div className="practice-actions">
        {topic.subject === "Redação" && (
          <button type="button" className="primary-button" onClick={onWrite}><PenLine size={16}/> Abrir caderno de redação</button>
        )}
        <button type="button" className="secondary-button" onClick={onRegister}><BookOpen size={16}/> Registrar uma questão</button>
        <button type="button" className="text-button" onClick={onDismiss}>Continuar depois</button>
      </div>
    </dialog>
  );
}
