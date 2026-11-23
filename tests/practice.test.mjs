import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { curriculum } from "../src/curriculum.ts";

const catalog = JSON.parse(readFileSync(new URL("../src/practice/catalog.json", import.meta.url), "utf8"));

test("cada tema do currículo tem atividades próprias no catálogo", () => {
  const expected = Object.entries(curriculum).flatMap(([subject, topics]) =>
    topics.map((_, index) => subject + "-" + (index + 1))
  );
  assert.deepEqual(Object.keys(catalog).sort(), expected.sort());
  for (const [topicId, resources] of Object.entries(catalog)) {
    assert.ok(resources.length > 0, topicId);
    const destinations = new Set();
    for (const resource of resources) {
      for (const field of ["title", "source", "kind", "note"]) {
        assert.ok(resource[field]?.trim(), topicId + " · " + field);
      }
      assert.equal(new URL(resource.url).protocol, "https:", topicId);
      assert.ok(!destinations.has(resource.url), topicId + " · link repetido");
      destinations.add(resource.url);
    }
  }
});
