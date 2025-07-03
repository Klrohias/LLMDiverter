import { Config } from './config';

export interface RuntimeConfig {
  providers: { [key: string]: Provider },
  models: { [key: string]: Model[] },
  modelDistributions: { [key: string]: number[] },
  acceptedKeys?: string[],
  adminToken?: string
}

export interface Provider {
  apiKey: string,
  apiRoot: string,
  rate?: number,
}

export interface Model {
  rate?: number,
  provider: string,
  rename?: string
}

export let currentRuntimeConfig = defaultRuntimeConfig();

function defaultRuntimeConfig(): RuntimeConfig {
  return { providers: {}, models: {}, modelDistributions: {} };
}

function getOrCreateModelList(config: RuntimeConfig, modelName: string): Model[] {
  if (config.models[modelName] === undefined) {
    config.models[modelName] = [];
  }

  return config.models[modelName];
}

export function loadRuntimeConfig(config: Config): RuntimeConfig {
  let newRuntimeConfig = defaultRuntimeConfig();

  // upstreams
  for (const upstreamDef of config.upstreams) {
    const providerName = upstreamDef.name ?? upstreamDef.apiRoot;
    // provider
    newRuntimeConfig.providers[providerName] = {
      apiKey: upstreamDef.apiKey,
      apiRoot: upstreamDef.apiRoot,
      rate: upstreamDef.rate
    };

    // models
    for (const modelDef of upstreamDef.models) {
      if (typeof modelDef == 'string') {
        getOrCreateModelList(newRuntimeConfig, modelDef).push({
          provider: providerName,
        });
      } else {
        getOrCreateModelList(newRuntimeConfig, modelDef.name).push({
          provider: providerName,
          rate: modelDef.rate,
          rename: modelDef.rename
        });
      }
    }
  }

  // api keys
  newRuntimeConfig.acceptedKeys = config.acceptedKeys;
  newRuntimeConfig.adminToken = config.adminToken;

  currentRuntimeConfig = newRuntimeConfig;
  return currentRuntimeConfig;
}