import { readFileSync } from "node:fs";

import { dataItems, processors } from "./data-map";

describe("data map", () => {
  const doc = readFileSync("docs/DATA_MAP.md", "utf8");

  it("docs/DATA_MAP.md names every data item and processor the privacy page shows", () => {
    for (const item of dataItems) expect(doc).toContain(item.data);
    for (const processor of processors) expect(doc).toContain(processor.name);
  });

  it("only lists processors that are described", () => {
    const names = new Set(processors.map((p) => p.name));
    for (const item of dataItems) for (const name of item.processors) expect(names).toContain(name);
  });
});
