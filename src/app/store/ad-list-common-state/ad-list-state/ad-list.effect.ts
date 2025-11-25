import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';

@Injectable()
export class AdListEffect {
  constructor(
    private readonly http: HttpClient,
    private readonly action$: Actions
  ) {}
}
