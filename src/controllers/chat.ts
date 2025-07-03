import { Router } from "express";
import { handleAuth, handleModel } from "./handles";
import { pipeFetch } from "@/forward";


export const chatController = Router();

chatController.post('/v1/chat/completions', async (req, res) => {
  if (!await handleAuth(req, res)) return;

  const chosen = await handleModel(req, res);
  if (!chosen) return;
  const [provider, model] = chosen;

  // pre-process body
  const body = structuredClone(req.body);
  if (model.rename !== undefined) {
    body['model'] = model.rename;
  }

  // forward request
  pipeFetch(await fetch(`${provider.apiRoot}${req.path}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Authorization': `Bearer ${provider.apiKey}`,
      'Content-Type': 'application/json'
    }
  }), res);
});

