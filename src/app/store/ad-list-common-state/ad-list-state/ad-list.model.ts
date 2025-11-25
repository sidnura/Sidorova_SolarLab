import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { AdModel } from '../../../core/models/ad.model';
import { PageViewStateModel } from '../../../core/models/page-view-state.model';

export const AD_LIST_STATE_KEY = 'ad-list-state';

export type AdListStateModel = PageViewStateModel<AdModel>;

export const adListEntityAdapter: EntityAdapter<AdModel> = createEntityAdapter({
  selectId: (model) => model.id,
});

export const initialState: AdListStateModel =
  adListEntityAdapter.getInitialState({
    count: 0,
    loading: {},
  });
