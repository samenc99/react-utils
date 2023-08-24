import { useCallback, useEffect, useState } from 'react';
import useRequest, {
  ClassMethod,
  IUserRequest,
  MethodArgs,
  MethodReturn,
  TUserRequestParams,
} from './use-request.hook';

interface IUserRequestState<T, M extends ClassMethod<T>>
  extends IUserRequest<T, M> {
  state?: MethodReturn<T, M>;
}

export const useRequestState = <T, M extends ClassMethod<T>>(
  serviceIdentifier: TUserRequestParams<T, M>[0],
  method: TUserRequestParams<T, M>[1],
  options?: IUserRequestState<T, M>,
) => {
  const [state, setState] = useState<MethodReturn<T, M> | undefined>(
    options?.state,
  );
  const { loading, query: action } = useRequest(serviceIdentifier, method, {
    ...options,
    now: undefined,
  });

  const { now, onAutomaticError, onError } = { ...options };

  const query = useCallback(async (data: MethodArgs<T, M>) => {
    const result = await action(data);
    setState(result);
    return result;
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
    loading,
    query,
    state,
    setState,
  };
};
