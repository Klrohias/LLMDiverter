import { Router } from 'express';
import { handleAuth } from './handles';
import { currentRuntimeConfig } from '@/config';

export const metaController = Router();

metaController.get('/v1/models', async (req, res) => {
  if (!await handleAuth(req, res)) return;
  res.send({
    data: Object.keys(currentRuntimeConfig.models).map(x => ({
      id: x,
      object: 'model',
      owned_by: 'server',
      created: Number.parseInt((+Date.now() / 1000).toString())
    })),
    object: 'list'
  });
});

