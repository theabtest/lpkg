import chalk from 'chalk';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { argv, stdin as input, stdout as output } from 'node:process';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';
import ora from 'ora';

/**
 * This is an ESM replacement for `__filename`.
 *
 * Use it like this: `__filename(import.meta)`.
 */
export const __filename = (meta: ImportMeta): string => fileURLToPath(meta.url);

/**
 * This is an ESM replacement for `__dirname`.
 *
 * Use it like this: `__dirname(import.meta)`.
 */
export const __dirname = (meta: ImportMeta): string =>
  dirname(__filename(meta));

/**
 * Indicates that the script was run directly.
 * This is an ESM replacement for `require.main === module`.
 *
 * Use it like this: `isMain(import.meta)`.
 */
export const isMain = (meta: ImportMeta): boolean => {
  if (!meta || !argv[1]) return false;
  const require = createRequire(meta.url);
  const scriptPath = require.resolve(argv[1]);
  const modulePath = __filename(meta);
  return scriptPath === modulePath;
};

export const ask = async (question: string): Promise<string> => {
  const rl = readline.createInterface({ input, output });
  const result = await rl.question(chalk.cyanBright(question + ': '));
  rl.close();
  return result;
};

export const showSpinner = (text: string) => {
  const spinner = ora(text);
  spinner.color = 'yellow';
  spinner.start();
  return () => {
    spinner.stop();
  };
};
