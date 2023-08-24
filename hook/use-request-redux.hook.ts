import useRequest, {
  ClassMethod,
  IUserRequest,
  MethodArgs,
  MethodReturn,
  TUserRequestParams,
} from './use-request.hook';
import { useAppDispatch } from '../../../store/store';
import { useCallback, useEffect } from 'react';

interface IUserRequestRedux<T, M extends ClassMethod<T>>
  extends IUserRequest<T, M> {
  action: (state: Exclude<MethodReturn<T, M>, void>) => any;
}

export default function useRequestRedux<T, M extends ClassMethod<T>>(
  serviceIdentifier: TUserRequestParams<T, M>[0],
  method: TUserRequestParams<T, M>[1],
  options: IUserRequestRedux<T, M>,
) {
  const { loading, query: action } = useRequest(serviceIdentifier, method, {
    ...options,
    now: undefined,
  });
  const dispatch = useAppDispatch();

  const { now, onAutomaticError, onError } = { ...options };

  const query = useCallback(async (data: MethodArgs<T, M>) => {
    const result = await action(data);
    dispatch(options.action(result as any));
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
  };
}
