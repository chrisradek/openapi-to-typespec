import { Output, render } from "@alloy-js/core";
import { expect, it } from "vitest";
import { http } from "../src/libs/http.js";
import { Reference, SourceFile } from "../src/index.jsx";
import { AliasDeclaration } from "../src/components/AliasDeclaration.jsx";
import { PackageDirectory } from "../src/components/PackageDirectory.jsx";
import { assertFileContents } from "./utils.jsx";

it("can import", () => {
  const output = render(
    <Output externals={[http]}>
      <PackageDirectory path="." name="test" version="1.0.0">
        <SourceFile path="main.tsp">
          <AliasDeclaration name="OkResponse" type={<Reference refkey={http.Http.OkResponse} />} />
          <AliasDeclaration name="HttpStream" type={<Reference refkey={http["./streams"]["Http.Streams"].HttpStream} />} />
        </SourceFile>
      </PackageDirectory>
    </Output>,
  );

  assertFileContents(output, {
    "package.json": `
      {
        "name": "test",
        "version": "1.0.0",
        "type": "module",
        "dependencies": {},
        "peerDependencies": {
          "@typespec/compiler": "latest",
          "@typespec/http": "^0.63.0"
        },
        "devDependencies": {
          "@typespec/compiler": "latest",
          "@typespec/http": "^0.63.0"
        }
      }
    `,
    "main.tsp": `
      import "@typespec/http";
      import "@typespec/http/streams";
      alias OkResponse = Http.OkResponse;
      alias HttpStream = Http.Streams.HttpStream;
    `,
  });
});

it("can import without a package", () => {
  const output = render(
    <Output externals={[http]}>
      <SourceFile path="main.tsp">
        <AliasDeclaration name="OkResponse" type={<Reference refkey={http.Http.OkResponse} />} />
        <AliasDeclaration name="HttpStream" type={<Reference refkey={http["./streams"]["Http.Streams"].HttpStream} />} />
      </SourceFile>
    </Output>,
  );

  assertFileContents(output, {
    "main.tsp": `
      import "@typespec/http";
      import "@typespec/http/streams";
      alias OkResponse = Http.OkResponse;
      alias HttpStream = Http.Streams.HttpStream;
    `,
  });
});
