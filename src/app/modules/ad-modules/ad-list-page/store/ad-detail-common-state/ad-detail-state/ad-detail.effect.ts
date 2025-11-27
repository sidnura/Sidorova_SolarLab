import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AdService } from '../../../../../../core/services/ad.service';
import * as stateAction from './ad-detail.action';

@Injectable()
export class AdDetailEffect {
  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(stateAction.load),
      switchMap(({ payload }) =>
        this.adService.getAdById(payload).pipe(
          map((ad) => stateAction.loadSuccess({ payload: ad })),
          catchError(() => of(stateAction.error()))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private adService: AdService
  ) {}
}
