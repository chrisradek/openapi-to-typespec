export function modulePath(path: string) {
  if (path[0] !== ".") {
    path = `./${path}`;
  }

  return path;
}

export function removeFileExtension(path: string): string {
  if (!path || path === ".") return path;
  const extensionIndex = path.lastIndexOf(".");
  if (extensionIndex === 0) return path;

  return path.substring(0, extensionIndex);
}
