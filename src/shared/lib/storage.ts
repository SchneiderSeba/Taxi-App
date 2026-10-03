type VersionedValue<T> = {
  version: number;
  value: T;
};

export function readVersionedStorage<T>(
  key: string,
  version: number,
  isValid: (value: unknown) => value is T,
): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isVersionedValue(parsed) || parsed.version !== version || !isValid(parsed.value)) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed.value;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export function writeVersionedStorage<T>(key: string, version: number, value: T): void {
  const payload: VersionedValue<T> = { version, value };
  localStorage.setItem(key, JSON.stringify(payload));
}

function isVersionedValue(value: unknown): value is VersionedValue<unknown> {
  return typeof value === 'object' && value !== null && 'version' in value && 'value' in value;
}
