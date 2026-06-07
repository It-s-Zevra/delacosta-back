/**
 * Minimal in-process mutex keyed by string. Serialises async operations that
 * share a key (e.g. stock writes for the same product) to avoid read-modify-write
 * races within a single server instance.
 *
 * Note: this only protects against concurrency inside ONE Node process. For a
 * multi-instance deployment, move serialisation to a shared lock (Redis, etc.).
 */
const chains = new Map<string, Promise<unknown>>();

export function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = chains.get(key) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  // Keep the chain alive but swallow rejections so one failure doesn't poison
  // the lock for the next caller.
  chains.set(
    key,
    next.then(
      () => undefined,
      () => undefined,
    ),
  );
  return next;
}
