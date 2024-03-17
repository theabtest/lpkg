import { RunnableConfig } from '@langchain/core/runnables';
import { Run } from '@langchain/core/tracers/base';
import chalk from 'chalk';
import debug from 'debug';
debug.enable('lpkg:*');

type Logger = {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  trace: (...args: any[]) => void;
};

const createLogger = (
  namespace: string,
  colors = {
    log: chalk.greenBright,
    error: chalk.redBright,
    trace: chalk.gray,
  },
): Logger => {
  const _logger = debug(namespace);
  return {
    log: (...args: any[]) => {
      _logger(colors.log(...args));
    },
    error: (...args: any[]) => {
      _logger(colors.error(...args));
    },
    trace: (...args: any[]) => {
      _logger(colors.trace(...args));
    },
  };
};

export const debugStream = (
  tag: string,
): {
  onStart?: (run: Run, config?: RunnableConfig) => void | Promise<void>;
  onEnd?: (run: Run, config?: RunnableConfig) => void | Promise<void>;
  onError?: (run: Run, config?: RunnableConfig) => void | Promise<void>;
} => {
  return {
    onStart: (...args) => {
      console.log(tag, 'onStart', ...args);
    },
    onEnd: (...args) => {
      console.log(tag, 'onEnd', ...args);
    },
    onError: (...args) => {
      console.error(tag, 'onError', ...args);
    },
  };
};

export default createLogger;
