import { currentRuntimeConfig, Model, Provider } from '@/config';
import { chooseProvider, isKeyAccepted } from '@/forward';
import { type Request, type Response } from 'express';

/** the value returned controls the authed request should continue executing */
export async function handleAuth(req: Request, res: Response) {
  let authorization = req.header('authorization');
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
export async function handleModel(req: Request, res: Response): Promise<[Provider, Model]> {
  const modelName = req.body['model'];
  if (!modelName) {
    res.status(400).send({ error: `Field "model" is required` });
    return null;
  }

  const specifiedProvider = req.header('x-upstream');
  if (specifiedProvider !== undefined) {
    // provider specified
    const models = currentRuntimeConfig.models[modelName];
    if (!models) {
      res.status(400).send({ error: `Cannot the model, check your config` });
      return null;
    }

    const model = models.find(x => x.provider == specifiedProvider);
    if (!model) {
      res.status(400).send({ error: `Cannot the model, check your config` });
      return null;
    }

    return [currentRuntimeConfig.providers[specifiedProvider], model];
  } else {
    // choose a provider randomly
    const tuple = chooseProvider(currentRuntimeConfig, modelName);
    if (!tuple) {
      res.status(400).send({ error: `Cannot find a upstream for this model, check your config` });
      return null;
    }
    return tuple;
  }
}

/** the value returned controls the admin endpoint should continue executing */
export async function handleAdmin(req: Request, res: Response) {
  let authorization = req.header('authorization');
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