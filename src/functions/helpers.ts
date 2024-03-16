import z from 'zod';

/**
 * Helper to convert a string to a valid date
 */
export const stringToValidDate = z.string().transform((dateString, ctx) => {
  const date = new Date(dateString);
  if (!z.date().safeParse(date).success) {
    ctx.addIssue({
      code: z.ZodIssueCode.invalid_date,
    });
  }
  return date;
});
