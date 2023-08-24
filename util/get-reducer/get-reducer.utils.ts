import { PayloadAction } from '@reduxjs/toolkit';

type Actions<T> = {
  [P in keyof T]: (state: T[P]) => any;
} & {
  setState: (state: Partial<T>) => void;
};

export default function getReducer<T extends Record<string, any>>(
  initialState: T,
) {
  const reducers: any = {};

  for (const key in initialState) {
    reducers[key] = (state: T, action: PayloadAction<T[keyof T]>) => {
      state[key] = action.payload[key];
    };
  }

  reducers.setState = (state: T, action: PayloadAction<Partial<T>>) => {
    for (const key in action.payload) {
      if (
        initialState[key] !== undefined &&
        action.payload[key] === undefined
      ) {
        return;
      }

      if (action.payload.hasOwnProperty(key)) {
        state[key] = action.payload[key]!;
      }
    }
  };

  return reducers as Actions<T>;
}
