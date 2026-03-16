export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { migrate } = await import('./db/migrate');
      await migrate();
    } catch (err) {
      console.error('[instrumentation] Migration failed:', err);
    }
  }
}
