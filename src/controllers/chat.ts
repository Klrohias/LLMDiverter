import { Router } from 'express';
import { handleAuth, handleModel } from './handles';
import { getUpstreamHeader, pipeFetch } from '@/forward';

export const chatController = Router();

chatController.post('/v1/chat/completions', async (req, res) => {
  if (!await handleAuth(req, res)) return;

  const chosenModel = await handleModel(req, res);
  if (!chosenModel) return;

  const apiKey = chosenModel.model.apiKey ?? chosenModel.provider.apiKey;

  // pre-process body
  const body = structuredClone(req.body);
  body['model'] = chosenModel.model.rename ?? body['model'];

  // forward request
  pipeFetch(await fetch(`${chosenModel.provider.apiRoot}/chat/completions`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: getUpstreamHeader(apiKey)
  }), res);
});

