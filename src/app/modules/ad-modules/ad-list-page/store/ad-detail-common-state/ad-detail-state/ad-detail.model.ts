import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { AdModel } from '../../../../../../core/models/ad.model';

export const AD_DETAIL_STATE_KEY = 'ad-detail-state';

export interface AdDetailStateModel extends EntityState<AdModel> {
  loading: Record<string, boolean>;
}

export const adDetailEntityAdapter: EntityAdapter<AdModel> = createEntityAdapter({
  selectId: (model) => model.id,
});

export const initialState: AdDetailStateModel = adDetailEntityAdapter.getInitialState({
  loading: {},
});
