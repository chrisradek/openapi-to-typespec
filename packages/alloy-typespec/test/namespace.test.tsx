import * as core from "@alloy-js/core";
import { describe, expect, it } from "vitest";
import { Namespace } from "../src/components/Namespace.jsx";
import { SourceFile } from "../src/components/SourceFile.jsx";
import { ModelDeclaration } from "../src/components/ModelDeclaration.jsx";
import { assertFileContents, toSourceText } from "./utils.jsx";
import { d } from "@alloy-js/core/testing";
import { OperationDeclaration } from "../src/components/OperationDeclaration.jsx";

it("creates a namespace block", () => {
  expect(toSourceText(<Namespace name="MyApi" />)).toEqual(d`
    namespace MyApi {}
  `);
});

it("supports nesting namespaces", () => {
  expect(
    toSourceText(
      <Namespace name="MyApi" >
        <Namespace name="SubNs" />
      </Namespace>,
    ),
  ).toEqual(d`
    namespace MyApi {
      namespace SubNs {}
    }
  `);
});

it("supports file-level namespace", () => {
  expect(
    toSourceText(
      <Namespace name="MyApi" fileLevel >
        <Namespace name="SubNs" />
      </Namespace>,
    ),
  ).toEqual(d`
      namespace MyApi;
      namespace SubNs {}
    `);
});

describe("symbols", () => {
  it("supports resolving across namespaces within a module", () => {
    const output = core.render(
      <core.Output>
        <SourceFile path="main.tsp">
          <Namespace name="Api">
            <Namespace name="Models">
              <ModelDeclaration name="Foo" />
            </Namespace>
            <Namespace name="Operations">
              <OperationDeclaration name="getFoo" returnType={core.refkey("Foo")} />
            </Namespace>
          </Namespace>
        </SourceFile>
      </core.Output>,
    );

    assertFileContents(output, {
      "main.tsp": `
        namespace Api {
          namespace Models {
            model Foo {}
          }
          namespace Operations {
            op getFoo(): Models.Foo;
          }
        }
      `,
    });
  });

  it("supports resolving across same namespace in different modules", () => {
    const output = core.render(
      <core.Output>
        <SourceFile path="main.tsp">
          <Namespace name="Api">
            <Namespace name="Operations">
              <OperationDeclaration name="getFoo" returnType={core.refkey("Foo")} />
            </Namespace>
          </Namespace>
        </SourceFile>
        <SourceFile path="models.tsp">
          <Namespace name="Api">
            <Namespace name="Models">
              <ModelDeclaration name="Foo" />
            </Namespace>
          </Namespace>
        </SourceFile>
      </core.Output>,
    );

    assertFileContents(output, {
      "main.tsp": `
        import "./models.tsp";
        namespace Api {
          namespace Operations {
            op getFoo(): Api.Models.Foo;
          }
        }
      `,
      "models.tsp": `
        namespace Api {
          namespace Models {
            model Foo {}
          }
        }
      `,
    });
  });
});
