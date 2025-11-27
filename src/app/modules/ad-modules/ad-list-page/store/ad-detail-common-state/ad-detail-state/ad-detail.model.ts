import { AdModel } from '@models/ad.model';

export const AD_DETAIL_STATE_KEY = 'ad-detail-state';

export type AdDetailStateModel = {
  loading: Record<string, boolean>;
  selectedId: string;
  data: AdModel;
};

export const initialState: AdDetailStateModel = {
  data: undefined,
  loading: {},
  selectedId: undefined,
};
