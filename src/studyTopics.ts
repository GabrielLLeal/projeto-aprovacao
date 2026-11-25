import { curriculum, type Level } from "./curriculum.ts";
import type { PriorityTopic } from "./priority/guides.ts";

export type Topic = PriorityTopic & {
  subject: string; title: string; description: string; level: Level;
  order: number; prerequisites: string[];
};
export type Subject = { id: string; name: string; color: string };
export const colors = ["#7567e8","#2998c7","#20a486","#79a84b","#d58b45","#cc6c82","#4e91bd","#9671bd","#7770aa"];
export const initialSubjects: Subject[] = Object.keys(curriculum).map((name, i) => ({
  id: name, name, color: colors[i % colors.length]
}));
export const initialTopics: Topic[] = Object.entries(curriculum).flatMap(([subject, items]) =>
  items.map(([level, title, description], i) => ({
    id: subject + "-" + (i + 1), subject, title, description, level, order: i + 1,
    prerequisites: i ? [subject + "-" + i] : []
  }))
);

const normalized = (s: string) => s.trim().normalize("NFC").toLocaleLowerCase("pt-BR");
export const isPhilosophy = (name: string) => normalized(name) === "filosofia";
const philosophy = initialSubjects.find(s => s.name === "Filosofia")!;
const philosophyTopics = initialTopics.filter(t => t.subject === philosophy.name);

export function includePhilosophySubject(saved: Subject[]): Subject[] {
  return saved.some(s => isPhilosophy(s.name)) ? saved : [...saved, philosophy];
}

// Preserve local IDs and ordering because tasks, materials and prerequisites refer to them.
export function includePhilosophyTopics(saved: Topic[], subjectName: string): Topic[] {
  const local = saved.filter(t => t.subject === subjectName);
  const byId = new Map(local.map(t => [t.curriculumId ?? t.id, t]));
  const byTitle = new Map(local.map(t => [normalized(t.title), t]));
  const links = new Map<string, string>();
  const additions: Topic[] = [];
  let previous = local.reduce<Topic | undefined>((last, t) => !last || t.order > last.order ? t : last, undefined);
  for (const seed of philosophyTopics) {
    const existing = byId.get(seed.id) ?? byTitle.get(normalized(seed.title));
    if (existing) {
      if (seed.id !== existing.id && seed.id !== existing.curriculumId) links.set(existing.id, seed.id);
      continue;
    }
    const item: Topic = {
      ...seed, subject: subjectName, order: (previous?.order ?? 0) + 1,
      prerequisites: previous ? [previous.id] : []
    };
    additions.push(item);
    previous = item;
  }
  if (!additions.length && !links.size) return saved;
  return [...saved.map(t => links.has(t.id) ? { ...t, curriculumId: links.get(t.id) } : t), ...additions];
}
