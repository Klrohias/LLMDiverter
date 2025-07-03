import { readFile } from 'node:fs/promises';
import yaml from 'js-yaml';

// const CONFIG_FILENAME = 'config.json';
const CONFIG_FILENAME = 'config.yml';

export interface Config {
  upstreams: UpstreamDefintion[],
  acceptedKeys?: string[],
  adminToken?: string,
  listenPort?: number,
}

export interface UpstreamDefintion {
  name: string | undefined,
  apiRoot: string,
  apiKey: string,
  rate?: number,
  models: (string | ModelDefinition)[]
}

export interface ModelDefinition {
  name: string,
  rate?: number,
  rename?: string,
  apiKey?: string,
}

export async function loadConfig(): Promise<Config> {
  let fileBuffer = await readFile(CONFIG_FILENAME);
  // const config = JSON.parse(fileBuffer.toString());
  const config = yaml.load(fileBuffer.toString()) as Config;
  return config;
}