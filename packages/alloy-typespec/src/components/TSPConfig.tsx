import { stringify } from "yaml";
import { usePackage } from "./PackageDirectory.jsx";
import { memo, SourceFile } from "@alloy-js/core";

export interface TSPConfigProps {
  emit?: string[];
}

const placeholderConfig = `
# emit:
#   - "<emitter-name>"
# options:
#   <emitter-name>:
#     "<option-name>": "<option-value>"
`.trim();

export function TSPConfig(props: TSPConfigProps) {
  const pkg = usePackage();
  if (!pkg) {
    throw new Error(
      "TSPConfig component needs to be inside a PackageDirectory",
    );
  }

  const yamlContent = memo(() => {
    const jsonContent: Record<string, any> = {};

    if (props.emit) {
      jsonContent.emit = props.emit;
    }

    if (!Object.keys(jsonContent).length) {
      return placeholderConfig;
    }

    return stringify(jsonContent, {
      aliasDuplicateObjects: false,
      lineWidth: 0,
      singleQuote: true,
    });
  });

  return <SourceFile path="tspconfig.yaml" filetype="yaml">
    {yamlContent}
  </SourceFile>;
}
