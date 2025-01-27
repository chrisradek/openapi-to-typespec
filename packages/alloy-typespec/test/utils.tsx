import {
  Children,
  Output,
  OutputDirectory,
  OutputFile,
  render,
} from "@alloy-js/core";
import { SourceFile } from "../src/components/SourceFile.jsx";
import { expect } from "vitest";
import { dedent } from "@alloy-js/core/testing";

export function toSourceText(c: Children): string {
  const res = render(
    <Output>
      <SourceFile path="test.tsp">{c}</SourceFile>
    </Output>,
  );

  return (
    res.contents.find((content) => content.kind === "file")?.contents ?? ""
  );
}

export function findFile(res: OutputDirectory, path: string): OutputFile {
  const result = findFileWorker(res, path);

  if (!result) {
    throw new Error("Expected to find file " + path);
  }
  return result;

  function findFileWorker(
    res: OutputDirectory,
    path: string,
  ): OutputFile | null {
    for (const item of res.contents) {
      if (item.kind === "file") {
        if (item.path === path) {
          return item;
        }
        continue;
      } else {
        const found = findFileWorker(item, path);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }
}

export function assertFileContents(
  res: OutputDirectory,
  expectedFiles: Record<string, string>,
) {
  for (const [path, contents] of Object.entries(expectedFiles)) {
    const file = findFile(res, path);
    expect(file.contents).toBe(dedent(contents));
  }
}
