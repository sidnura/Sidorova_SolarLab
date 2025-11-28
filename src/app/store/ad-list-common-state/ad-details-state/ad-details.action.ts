import { createAction, props } from '@ngrx/store';
import { AdModel } from '@models/ad.model';
import { AD_DETAILS_STATE_KEY } from './ad-details.model';

export const load = createAction(
  `[${AD_DETAILS_STATE_KEY}] load`,
  props<{ payload: string }>()
);

export const loadSuccess = createAction(
  `[${AD_DETAILS_STATE_KEY}] load success`,
  props<{ payload: AdModel }>()
);

export const error = createAction(`[${AD_DETAILS_STATE_KEY}] error`);
export const clear = createAction(`[${AD_DETAILS_STATE_KEY}] clear`);
