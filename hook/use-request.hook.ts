import { useCallback, useEffect, useState } from 'react';
import { interfaces } from 'inversify/lib/interfaces/interfaces';
import useInject from './use-inject.hook';

export type ClassMethod<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

export type MethodArgs<T, M extends ClassMethod<T>> = T[M] extends (
  ...args: infer Args
) => any
  ? Args[0]
  : never;

export type MethodReturn<T, M extends ClassMethod<T>> = T[M] extends (
  ...args: any[]
) => infer ReturnType
  ? Awaited<ReturnType>
  : never;

export interface IUserRequest<T, M extends ClassMethod<T>> {
  loading?: boolean;
  stopLoadingOnError?: boolean;
  now?: {
    data: MethodArgs<T, M>;
  };
  onAutomaticError?: (err: Error) => void;
  onError?: (err: Error) => void;
}

export default function useRequest<T, M extends ClassMethod<T>>(
  serviceIdentifier: interfaces.ServiceIdentifier<T>,
  method: M,
  options?: IUserRequest<T, M>,
) {
  const service = useInject(serviceIdentifier);

  const { loading, stopLoadingOnError, now, onAutomaticError, onError } = {
    loading: false,
    stopLoadingOnError: true,
    ...options,
  };

  const [_loading, _setLoading] = useState(loading);

  const query = useCallback(async (data: MethodArgs<T, M>) => {
    try {
      _setLoading(true);

      const result = await (
        service[method] as (...args: MethodArgs<T, M>[]) => MethodReturn<T, M>
      )(data);
      _setLoading(false);
      return result;
    } catch (err) {
      if (stopLoadingOnError) {
        _setLoading(false);
      }
      if (onError) {
        onError(err as Error);
      }

      throw err;
    }
  }, []);

  useEffect(() => {
    if (now) {
      query(now.data).catch((err) => {
        if (!onError && onAutomaticError) {
          onAutomaticError(err);
        }
      });
    }
  }, []);

  return {
    loading: _loading,
    query,
  };
}

export type TUserRequestParams<T, M extends ClassMethod<T>> = Parameters<
  typeof useRequest<T, M>
>;
