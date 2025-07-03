import { currentRuntimeConfig } from '@/config';
import { chooseProvider, isKeyAccepted } from '@/forward';
import { type Request, type Response } from 'express';

/** the value returned controls the authed request should continue executing */
export async function handleAuth(req: Request, res: Response) {
  let authorization = req.headers['authorization'];
  if (typeof authorization === 'string') {
    if (authorization.toLowerCase().startsWith('Bearer ')) {
      authorization = authorization.substring(7);
    }
  }

  const success = await isKeyAccepted(authorization);
  if (!success) {
    res.status(403).send({ error: 'API key has not been accepted' });
    return false;
  }

  return true;
}

/** the value returned controls the request about model should continue executing */
export async function handleModel(req: Request, res: Response) {
  const model = req.body['model'];
  if (!model) {
    res.status(400).send({ error: `Field "model" is required` });
    return null;
  }

  const provider = chooseProvider(currentRuntimeConfig, model);
  if (!provider) {
    res.status(400).send({ error: `Cannot find a upstream for this model, check your config` });
    return null;
  }

  return provider;
}

/** the value returned controls the admin endpoint should continue executing */
export async function handleAdmin(req: Request, res: Response) {
  let authorization = req.headers['authorization'];
  if (typeof authorization === 'string') {
    if (authorization.toLowerCase().startsWith('Bearer ')) {
      authorization = authorization.substring(7);
    }
  }

  const success = currentRuntimeConfig.adminToken === undefined
    ? true
    : currentRuntimeConfig.adminToken == authorization;

  if (!success) {
    res.sendStatus(403);
    return false;
  }

  return true;
}