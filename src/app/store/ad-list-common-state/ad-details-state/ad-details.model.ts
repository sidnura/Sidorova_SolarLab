import { AdModel } from '@models/ad.model';

export const AD_DETAILS_STATE_KEY = 'ad-details-state';

export type AdDetailsStateModel = {
  loading: Record<string, boolean>;
  selectedId: string;
  data: AdModel;
};

export const initialState: AdDetailsStateModel = {
  data: undefined,
  loading: {},
  selectedId: undefined,
};
