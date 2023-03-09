export function createMockModule<T>(module: Partial<T>): T {
  return module as T;
}
