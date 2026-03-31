// packages/extension/src/content/main.ts
import { getConfigForUrl } from './sites/index';
import { startDetection } from './detector';

const config = getConfigForUrl(window.location.href);
if (config) {
  startDetection(config);
}
