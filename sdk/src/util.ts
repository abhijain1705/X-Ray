export function safeJson(data: unknown) {
  try {
    return JSON.parse(JSON.stringify(data));
  } catch {
    return "[unserializable]";
  }
}