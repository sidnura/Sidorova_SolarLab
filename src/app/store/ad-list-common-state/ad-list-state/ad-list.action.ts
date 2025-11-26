import { createAction, props } from '@ngrx/store';
import { AD_LIST_STATE_KEY } from './ad-list.model';
import { AdModel, AdSearchRequestModel } from '../../../core/models/ad.model';

export const load = createAction(
  `[${AD_LIST_STATE_KEY}] load`,
  props<{ payload: AdSearchRequestModel }>()
);
export const loadSuccess = createAction(
  `[${AD_LIST_STATE_KEY}] load success`,
  props<{ payload: AdModel[] }>()
);
export const error = createAction(`[${AD_LIST_STATE_KEY}] error`);
