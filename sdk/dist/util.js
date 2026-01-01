export function safeJson(data) {
    try {
        return JSON.parse(JSON.stringify(data));
    }
    catch {
        return "[unserializable]";
    }
}
