import assert from "node:assert/strict";
import { test } from "node:test";
import { includePhilosophySubject, includePhilosophyTopics, initialSubjects, initialTopics } from "../src/studyTopics.ts";
import { priorityGuides, priorityLevels } from "../src/priority/guides.ts";
import { guideFor, priorityFor, shortDayOptions } from "../src/priority/planning.ts";

test("todos os temas oficiais têm prioridade, justificativa e critério", () => {
  assert.deepEqual(Object.keys(priorityGuides).sort(), initialTopics.map(t => t.id).sort());
  for (const topic of initialTopics) {
    const guide = guideFor(topic);
    assert.ok(priorityLevels.includes(priorityFor(topic)), topic.id);
    assert.ok(guide.basis && guide.reason.trim(), topic.id);
  }
});

test("a indicação pessoal substitui a sugerida e pode voltar ao padrão", () => {
  const topic = initialTopics.find(t => t.id === "História-5");
  assert.equal(priorityFor(topic), "Muito alta");
  assert.equal(priorityFor({...topic, priorityOverride:"Média"}), "Média");
  assert.equal(priorityFor({...topic, priorityOverride:undefined}), "Muito alta");
  assert.equal(priorityFor({id:"tema-pessoal"}), undefined);
  assert.equal(priorityFor({id:"tema-pessoal",priorityOverride:"Alta"}), "Alta");
});

test("um perfil antigo recebe Filosofia sem duplicatas, inclusive após uma restauração", () => {
  const subjects = includePhilosophySubject(initialSubjects.filter(s => s.name !== "Filosofia"));
  const old = initialTopics.filter(t => t.subject !== "Filosofia");
  const next = includePhilosophyTopics(old, "Filosofia");
  assert.deepEqual(subjects, initialSubjects);
  assert.deepEqual(next, initialTopics);
  assert.equal(includePhilosophyTopics(next, "Filosofia"), next);
  assert.equal(includePhilosophySubject(subjects), subjects);
  assert.equal(next[0], old[0]);
});

test("reutiliza a disciplina e os temas de Filosofia que o aluno já cadastrou", () => {
  const subjects = [{id:"minha-disciplina", name:"filosofia", color:"blue"}];
  assert.equal(includePhilosophySubject(subjects), subjects);
  const previous = {id:"meu-tema", subject:"filosofia", title:"Ética e moral", description:"Minhas notas", level:"Básico", order:1, prerequisites:[], priorityOverride:"Média"};
  const merged = includePhilosophyTopics([previous], "filosofia");
  assert.equal(merged.length, 7);
  assert.deepEqual(merged[0], {...previous, curriculumId:"Filosofia-2"});
  assert.equal(guideFor(merged[0]).level, "Muito alta");
  assert.equal(priorityFor(merged[0]), "Média");
  assert.deepEqual(merged[1].prerequisites, ["meu-tema"]);
  assert.deepEqual(merged.map(t => t.order), [1,2,3,4,5,6,7]);
  assert.equal(includePhilosophyTopics(merged, "filosofia"), merged);
});

test("dias curtos priorizam temas elegíveis, respeitando matéria, status e prática avulsa", () => {
  const option = (id, unlocked, practice, status = "pendente", priorityOverride) => ({
    topic:{...initialTopics.find(t => t.id === id), priorityOverride}, unlocked, practice, status
  });
  const options = [
    option("História-1",true,true), option("História-5",false,true),
    option("História-7",false,false), option("História-9",true,true,"concluído"),
    option("História-2",true,true,"pulado"), option("Filosofia-1",true,true,"em andamento"),
    option("Geografia-5",false,true), option("Geografia-1",true,true,"pendente","Baixa")
  ];
  assert.deepEqual(shortDayOptions(options, "História").map(o => o.topic.id), ["História-5","História-1"]);
  const picks = shortDayOptions(options, "");
  assert.equal(picks.length, 3);
  assert.equal(new Set(picks.map(o => o.topic.subject)).size, 3);
  assert.equal(picks[0].topic.id, "Filosofia-1");
  assert.equal(shortDayOptions(options, "Redação").length, 0);
});
