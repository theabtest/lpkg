import chalk from 'chalk';
import debug from 'debug';

debug.enable('lpkg:*');

const logger = debug('lpkg');

const _agentLogger = logger.extend('agent');
export const agentLogger = {
  log: (...args: any[]) => {
    _agentLogger(chalk.greenBright(...args));
  },
};

const _userLogger = logger.extend('user');
export const userLogger = {
  log: (...args: any[]) => {
    _userLogger(chalk.blueBright(...args));
  },
};

export default logger;
