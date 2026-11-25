import { priorityGuides, priorityLevels, type Priority, type PriorityTopic, type TopicGuide } from "./guides.ts";
import type { Topic } from "../studyTopics.ts";

export function guideFor(topic: PriorityTopic): TopicGuide | undefined {
  return priorityGuides[topic.curriculumId ?? topic.id];
}

export function priorityFor(topic: PriorityTopic): Priority | undefined {
  return priorityLevels.includes(topic.priorityOverride as Priority) ? topic.priorityOverride : guideFor(topic)?.level;
}

export type StudyOption = {
  topic: Topic;
  status: "pendente" | "em andamento" | "concluído" | "pulado";
  unlocked: boolean;
  practice: boolean;
};

function priorityRank(topic: PriorityTopic) {
  const level = priorityFor(topic);
  return level ? priorityLevels.indexOf(level) : priorityLevels.length;
}

export function shortDayOptions(options: StudyOption[], subject: string): StudyOption[] {
  const eligible = options.filter(({ topic, status, unlocked, practice }) =>
    (!subject || topic.subject === subject) && status !== "concluído" && status !== "pulado" && (unlocked || practice)
  ).sort((a, b) =>
    priorityRank(a.topic) - priorityRank(b.topic) ||
    Number(b.status === "em andamento") - Number(a.status === "em andamento") ||
    Number(b.unlocked) - Number(a.unlocked) ||
    a.topic.order - b.topic.order
  );
  if (subject) return eligible.slice(0, 3);
  const seen = new Set<string>();
  return eligible.filter(({ topic }) => {
    if (seen.has(topic.subject)) return false;
    seen.add(topic.subject);
    return true;
  }).slice(0, 3);
}
