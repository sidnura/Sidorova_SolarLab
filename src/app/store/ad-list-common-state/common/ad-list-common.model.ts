import { ActionReducerMap } from '@ngrx/store';
import {
  AD_LIST_STATE_KEY,
  AdListStateModel,
} from '../ad-list-state/ad-list.model';
import { adListReducerFn } from '../ad-list-state/ad-list.reducer';
import {
  AD_DETAILS_STATE_KEY,
  AdDetailsStateModel,
} from '../ad-details-state/ad-details.model';
import { adDetailsReducerFn } from '../ad-details-state/ad-details.reducer';

export const AD_LIST_COMMON_STATE_KEY = 'ad-list-common-state';

export type AdListCommonStateModel = {
  [AD_LIST_STATE_KEY]: AdListStateModel;
  [AD_DETAILS_STATE_KEY]: AdDetailsStateModel;
};

export const adListCommonActionReducerMap: ActionReducerMap<AdListCommonStateModel> =
  {
    [AD_LIST_STATE_KEY]: adListReducerFn,
    [AD_DETAILS_STATE_KEY]: adDetailsReducerFn,
  };
