export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  // Netlify's Next.js Runtime serves every API route from one shared function process. A single
  // unhandled promise rejection anywhere (a dependency's internal bug, a missing module, etc.) can
  // otherwise crash or corrupt that warm container, causing unrelated requests to fail generically
  // until a fresh container spins up. Logging instead of letting it propagate keeps one route's
  // failure from taking down others sharing the same container.
  process.on('unhandledRejection', (reason) => {
    console.error('[instrumentation] Unhandled promise rejection:', reason);
  });
  process.on('uncaughtException', (err) => {
    console.error('[instrumentation] Uncaught exception:', err);
  });
}
