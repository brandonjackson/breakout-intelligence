import { useMemo } from 'react';
import yaml from 'js-yaml';
import type { EventConfig } from '../lib/types';
import configRaw from '../config/event-config.yaml?raw';

export function useEventConfig(): EventConfig {
  return useMemo(() => yaml.load(configRaw) as EventConfig, []);
}
