import { readFileSync } from 'node:fs';
import { parseMarket } from '../src/sources/oanor.js';

const read = (name) => JSON.parse(readFileSync(new URL(`./${name}`, import.meta.url), 'utf8'));

export const fixtureMarket = () => parseMarket(read('gold.json'), read('currencies.json'));
