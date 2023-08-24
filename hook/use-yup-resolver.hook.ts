import yup, { AnyObject, Maybe, ValidationError } from 'yup';
import { useCallback } from 'react';

export default function useYupResolver<P extends Maybe<AnyObject>, Q, R>(
  schema: yup.ObjectSchema<P, Q, R>,
) {
  return useCallback(
    async (data: any) => {
      try {
        const values = await schema.validate(data, {
          abortEarly: false,
        });

        return {
          values,
          errors: {},
        };
      } catch (errors: any) {
        return {
          values: {},
          errors: errors.inner.reduce(
            (allErrors: any, currentError: ValidationError) => ({
              ...allErrors,
              [currentError.path!]: {
                type: currentError.type ?? 'validation',
                message: currentError.message,
              },
            }),
            {},
          ),
        };
      }
    },
    [schema],
  );
}
