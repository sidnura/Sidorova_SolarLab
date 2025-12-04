import { Component, effect, forwardRef, inject } from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { isNil } from 'lodash';
import { SEARCH_INPUT_STORE } from './search-input.model';
import { NgClass } from '@angular/common';

@Component({
  imports: [FormsModule, NgClass],
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchInputComponent),
    },
    SEARCH_INPUT_STORE,
  ],
  selector: 'app-search-input',
  styleUrl: './search-input.component.scss',
  templateUrl: './search-input.component.html',
})
export class SearchInputComponent implements ControlValueAccessor {
  public store = inject(SEARCH_INPUT_STORE);

  protected value: string = '';
  private onChange: (...attr) => void;
  private onTouch: (...attr) => void;

  private searchExecuted: boolean = false;

  constructor() {

    effect(() => {

      this.emitChanges(this.store.value());
    });

  }

  public writeValue(obj: string): void {
    this.value = obj;

    if (isNil(obj)) {
      this.emitChanges(undefined);
    }
  }

  public registerOnChange(fn: (...attr) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: (...attr) => void): void {
    this.onTouch = fn;
  }

  protected emitTouched(): void {
    this.onTouch && this.onTouch();
  }

  protected onModelChanged(event: string): void {
    this.store.patch({ value: event });
  }


  protected executeSearch(): void {
    this.searchExecuted = true;
  }

  protected clearSearch(): void {
    this.value = '';
    this.searchExecuted = false;
    //this.emitChanges();
  }

  protected shouldShowClearIcon(): boolean {
    return this.value.trim().length > 0 && this.searchExecuted;
  }

  protected shouldShowSearchIcon(): boolean {
    return this.value.trim().length === 0 || !this.searchExecuted;
  }

  private emitChanges(value): void {
    this.onChange && this.onChange(value);
  }
}
