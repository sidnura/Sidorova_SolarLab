import { EntityState } from '@ngrx/entity';

export type PageViewStateModel<T> = EntityState<T> & {
  loading: any;
  count: number;
};
