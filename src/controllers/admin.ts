import { Router } from 'express';
import { handleAdmin } from './handles';
import { currentRuntimeConfig, loadConfig, loadRuntimeConfig } from '@/config';

export const adminController = Router();

adminController.get('/admin/reload', async (req, res) => {
  if (!await handleAdmin(req, res)) return;
  const config = await loadConfig();
  loadRuntimeConfig(config);
  res.send('Reloaded');
});

adminController.get('/admin/runtime-config', async (req, res) => {
  if (!await handleAdmin(req, res)) return;

  res.send(currentRuntimeConfig);
});

