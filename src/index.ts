import { loadRuntimeConfig, loadConfig } from '@/config';
import app from '@/app';

(async () => {
  let config = await loadConfig();
  loadRuntimeConfig(config);

  const listenAddr = config.listenPort ?? 8081;
  app.listen(listenAddr, (e) => {
    if (e) {
      console.error(e);
    } else {
      console.log(`Listen on ${listenAddr}`);
    }
  });
})();
