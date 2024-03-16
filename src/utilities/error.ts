class ApplicationError extends Error {
  constructor(message: string, innerError?: unknown) {
    super(message);
    this.name = 'ApplicationError';
    this.cause = innerError;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      cause: this.cause,
      stack: this.stack,
    };
  }
}

export const createError = (message: string, innerError?: unknown) => {
  return new ApplicationError(message, innerError);
};
