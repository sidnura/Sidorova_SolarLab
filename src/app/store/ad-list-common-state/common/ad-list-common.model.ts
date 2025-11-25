import { ActionReducerMap } from '@ngrx/store';
import {
  AD_LIST_STATE_KEY,
  AdListStateModel,
} from '../ad-list-state/ad-list.model';
import { adListReducerFn } from '../ad-list-state/ad-list.reducer';

export const AD_LIST_COMMON_STATE_KEY = 'ad-list-common-state';

export type AdListCommonStateModel = {
  [AD_LIST_STATE_KEY]: AdListStateModel,
};

export const adListCommonActionReducerMap: ActionReducerMap<AdListCommonStateModel> =
  {
    [AD_LIST_STATE_KEY]: adListReducerFn
  };
