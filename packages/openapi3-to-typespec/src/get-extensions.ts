export type Extensions = { [name: `x-${string}`]: any };

export function getExtensions(
  element?: Record<string, any>,
): Map<`x-${string}`, any> {
  const extensions = new Map<`x-${string}`, any>();
  if (!element) return extensions;

  for (const key of Object.keys(element)) {
    if (isExtensionKey(key)) {
      extensions.set(key, element[key]);
    }
  }

  return extensions;
}

function isExtensionKey(key: string): key is `x-${string}` {
  return key.startsWith("x-");
}
