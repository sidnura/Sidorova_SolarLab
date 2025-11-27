import { createAction, props } from '@ngrx/store';
import { AdModel } from '@models/ad.model';
import { AD_DETAIL_STATE_KEY } from './ad-detail.model';

export const load = createAction(
  `[${AD_DETAIL_STATE_KEY}] load`,
  props<{ payload: string }>()
);

export const loadSuccess = createAction(
  `[${AD_DETAIL_STATE_KEY}] load success`,
  props<{ payload: AdModel }>()
);

export const error = createAction(`[${AD_DETAIL_STATE_KEY}] error`);
export const clear = createAction(`[${AD_DETAIL_STATE_KEY}] clear`);
