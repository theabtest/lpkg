import camelCase from 'lodash/camelCase.js';
import fs from 'node:fs';
import path from 'node:path';
import { businessSearchTool } from './functions/businessSearch/index.js';
import { ENVIRONMENT } from './utilities/config.js';
import createLogger from './utilities/logger.js';

const logger = createLogger('lpkg:main');

const businesses = [
  'Mixed Pantry',
  'Macadons',
  'Firefly Slime',
  'Story Cafe Bellevue',
  'Kothu Seattle',
  'Driftwood Seattle',
  'Cedar River Smokehouse',
  'Phin Coffee',
  'HappyBody Soaps',
  'Saigon Drip Cafe',
  'Tabletop Village',
];

async function main() {
  // const name = await ask('What is the name of the business?');
  for (const name of businesses) {
    const location = 'Seattle, Washington, United States';

    logger.log(`Invoking businessSearchAgent with ${name} and ${location}`);

    const result = await businessSearchTool.invoke({
      name,
      location,
    });

    const outputFile = path.resolve(`./dist/${camelCase(name)}.json`);
    if (fs.existsSync(outputFile)) {
      logger.error(
        `File: ${outputFile} already exists, please delete it first.`,
      );
      return;
    }

    fs.writeFileSync(outputFile, result, 'utf8');

    logger.log('Result:', result);
  }
}

logger.log(`Starting ${ENVIRONMENT.NAME}`);
await main();
logger.log('Done!');
