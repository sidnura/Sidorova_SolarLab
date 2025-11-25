import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

@Injectable()
export class AdListFacade {
  constructor(private readonly store: Store) {}
}
