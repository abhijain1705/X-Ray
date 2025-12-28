export function safeJson(obj: unknown): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return JSON.stringify({
      error: "Circular reference or non-serializable data",
    });
  }
}

export function parseJson(str: string): unknown {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}
