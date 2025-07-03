import { Model, Provider, RuntimeConfig } from '@/config';

function getModelRate(runtimeConfig: RuntimeConfig, model: Model) {
  return model.rate ?? runtimeConfig.providers[model.provider].rate ?? 1;
}

function generateDistribution(runtimeConfig: RuntimeConfig, modelName: string): number[] {
  let distribution: number[] = [];
  const modelList = runtimeConfig.models[modelName];
  const sum = modelList.reduce((a, b) => {
    const rate = getModelRate(runtimeConfig, b);
    const currentFactor = rate == 0 ? 0 : 1 / rate;
    return a + currentFactor;
  }, 0);

  modelList.reduce((a, b) => {
    distribution.push(a / sum);
    const rate = getModelRate(runtimeConfig, b);
    const currentFactor = rate == 0 ? 0 : 1 / rate;
    return a + currentFactor;
  }, 0);

  return distribution;
}

function getIndex(distribution: number[], value: number): number {
  for (let i = 0; i < distribution.length; i++) {
    const element = distribution[i];
    const nextElement = i + 1 == distribution.length ? 1 : distribution[i + 1];

    if (value >= element && value <= nextElement) {
      return i;
    }
  }

  return 0;
}

export function chooseProvider(runtimeConfig: RuntimeConfig, modelName?: string): [Provider, Model] | null {
  if (modelName === undefined) return null;

  const modelList = runtimeConfig.models[modelName];
  if (!modelList) return null;

  let modelDistribution = runtimeConfig.modelDistributions[modelName];
  if (modelDistribution === undefined) {
    modelDistribution = generateDistribution(runtimeConfig, modelName);
    runtimeConfig.modelDistributions[modelName] = modelDistribution;
  }

  const index = getIndex(modelDistribution, Math.random());
  const model = modelList[index]

  return [runtimeConfig.providers[model.provider], model];
}