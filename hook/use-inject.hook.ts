import { useAppSelector } from '../../../store/store';
import { interfaces } from 'inversify/lib/interfaces/interfaces';
import { useRef } from 'react';

export default function useInject<T>(
  serviceIdentifier: interfaces.ServiceIdentifier<T>,
): T {
  const { container } = useAppSelector((state) => state.container);

  return useRef(container.get(serviceIdentifier)).current;
}
