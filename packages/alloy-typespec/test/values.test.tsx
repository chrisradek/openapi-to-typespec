import { expect, it } from "vitest";
import { toSourceText } from "./utils.jsx";
import { d, renderToString } from "@alloy-js/core/testing";
import { reactive, renderTree } from "@alloy-js/core";
import { ValueExpression } from "../src/index.jsx";

it("renders an object", () => {
  const res = toSourceText(<ValueExpression value={{}} />);
  expect(res).toEqual(d`
    #{}
  `);
});

it("renders an object with properties", () => {
  const res = toSourceText(<ValueExpression value={{foo: 1, bar: 2}} />);
  expect(res).toEqual(d`
    #{
      foo: 1,
      bar: 2
    }
  `);
});

it("renders an array", () => {
  expect(toSourceText(<ValueExpression
    value={[]}
  />)).toEqual(d`
    #[]
  `);
});

it("renders an array with elements", () => {
  expect(
    toSourceText(
      <ValueExpression
    value={["abc", 123, true, { foo: "bar" }, null]}
  />,
    ),
  ).toEqual(d`
    #[
      "abc",
      123,
      true,
      #{
        foo: "bar"
      },
      null
    ]
  `);
});

it("renders strings", () => {
  expect(toSourceText(<ValueExpression
    value={"Hello World"}
  />)).toEqual(d`
    "Hello World"
  `);
});

it("renders numbers", () => {
  expect(toSourceText(<ValueExpression
    value={12345}
  />)).toEqual(d`
    12345
  `);
});

it("renders booleans", () => {
  expect(
    toSourceText(
      <>
    <ValueExpression value={true} />
    <ValueExpression value={false} />
  </>,
    ),
  ).toEqual(d`
    true
    false
  `);
});

it("renders null", () => {
  expect(toSourceText(<ValueExpression value={null} />)).toEqual(d`
    null
  `);
});

it("is reactive", () => {
  const jsValue = reactive(new Map());
  jsValue.set("hi", 1);

  const tree = renderTree(<ValueExpression value={jsValue} />);
  expect(renderToString(tree)).toEqual(d`
    #{
      hi: 1
    }
  `);

  jsValue.set("bye", 2);

  expect(renderToString(tree)).toEqual(d`
    #{
      hi: 1,
      bye: 2
    }
  `);
});

it("renders objects with arrays", () => {
  const jsValue = { a: [1, 2] };
  const res = toSourceText(<ValueExpression value={jsValue} />);

  expect(res).toEqual(d`
    #{
      a: #[
        1,
        2
      ]
    }
  `);
});

it("renders complex objects", () => {
  const jsValue = {
    a: 1,
    b: "hello",
    c: true,
    d: {
      prop: [1, 2, 3],
    },
  };
  const res = toSourceText(<ValueExpression value={jsValue} />);

  expect(res).toEqual(d`
    #{
      a: 1,
      b: "hello",
      c: true,
      d: #{
        prop: #[
          1,
          2,
          3
        ]
      }
    }
  `);
});

it("renders falsy values (not undefined)", () => {
  const jsValue = {
    a: 0,
    b: "",
    c: false,
    d: null,
    e: undefined,
  };

  const res = toSourceText(<ValueExpression value={jsValue} />);

  expect(res).toEqual(d`
    #{
      a: 0,
      b: "",
      c: false,
      d: null
    }
  `);
});
