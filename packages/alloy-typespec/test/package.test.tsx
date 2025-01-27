import * as core from "@alloy-js/core";
import { it } from "vitest";
import { PackageDirectory } from "../src/components/PackageDirectory.jsx";
import {
  ModelDeclaration,
  ModelProperty,
  Namespace,
  Reference,
  SourceFile,
} from "../src/index.jsx";
import { assertFileContents } from "./utils.jsx";
import { AliasDeclaration } from "../src/components/AliasDeclaration.jsx";

it("exports source files", () => {
  const output = core.render(
    <core.Output>
      <PackageDirectory name="my-api" version="1.0.0">
        <SourceFile path="main.tsp">
          <Namespace name="TestService">
            <ModelDeclaration name="Foo">
              <ModelProperty name="foo" type="string" />
            </ModelDeclaration>
          </Namespace>
        </SourceFile>
      </PackageDirectory>
    </core.Output>,
  );

  assertFileContents(output, {
    "package.json": `
      {
        "name": "my-api",
        "version": "1.0.0",
        "type": "module",
        "dependencies": {},
        "peerDependencies": {
          "@typespec/compiler": "latest"
        },
        "devDependencies": {
          "@typespec/compiler": "latest"
        }
      }
    `,
    "main.tsp": `
      namespace TestService {
        model Foo {
          foo: string;
        }
      }
    `,
  });
});

it("imports from other packages", () => {
  const output = core.render(
    <core.Output>
      <PackageDirectory name="my-api" path="my-api" version="1.0.0">
        <SourceFile path="main.tsp" export=".">
          <Namespace name="TestService">
            <ModelDeclaration name="Foo">
              <ModelProperty name="foo" type="string" />
            </ModelDeclaration>
          </Namespace>
        </SourceFile>
      </PackageDirectory>

      <PackageDirectory name="my-client" path="my-client" version="1.0.0">
        <SourceFile path="client.tsp">
          <Namespace name="TestClient">
            <AliasDeclaration name="ClientFoo" type={<Reference refkey={core.refkey("Foo")} />} />
          </Namespace>
        </SourceFile>
      </PackageDirectory>
    </core.Output>,
  );

  assertFileContents(output, {
    "my-api/package.json": `
      {
        "name": "my-api",
        "version": "1.0.0",
        "type": "module",
        "dependencies": {},
        "peerDependencies": {
          "@typespec/compiler": "latest"
        },
        "devDependencies": {
          "@typespec/compiler": "latest"
        },
        "exports": {
          ".": {
            "typespec": "./my-api/main.tsp"
          }
        }
      }
    `,
    "my-api/main.tsp": `
      namespace TestService {
        model Foo {
          foo: string;
        }
      }
    `,
    "my-client/package.json": `
      {
        "name": "my-client",
        "version": "1.0.0",
        "type": "module",
        "dependencies": {},
        "peerDependencies": {
          "@typespec/compiler": "latest",
          "my-api": "^1.0.0"
        },
        "devDependencies": {
          "@typespec/compiler": "latest",
          "my-api": "^1.0.0"
        }
      }
    `,
    "my-client/client.tsp": `
      import "my-api";
      namespace TestClient {
        alias ClientFoo = TestService.Foo;
      }
    `,
  });
});
