import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { computed } from '@angular/core';
import { isNil } from 'lodash';

export type SearchInputStateModel = {
  value?: string;
};

export const initialState: SearchInputStateModel = {
  value: undefined,
};

export const SEARCH_INPUT_STORE = signalStore(
  withState<SearchInputStateModel>(initialState),
  withMethods((state) => ({
    patch(patchObj: Partial<SearchInputStateModel>): void {
      patchState(state, patchObj);
    },
  })),
  withComputed((state) => ({

    hasData: computed(() => {

      return !isNil(state.value());
    }),

  }))
);
