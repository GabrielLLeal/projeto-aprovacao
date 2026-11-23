import catalog from "./catalog.json";

export type PracticeResource = {
  title: string;
  url: string;
  source: string;
  kind: string;
  note: string;
};

const resourcesByTopic = new Map<string, PracticeResource[]>(Object.entries(catalog));

export function resourcesFor(topicId: string): readonly PracticeResource[] {
  return resourcesByTopic.get(topicId) ?? [];
}
