import { Component, effect, forwardRef, inject } from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { SEARCH_INPUT_STORE } from './search-input.model';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [FormsModule, NgClass],
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchInputComponent),
    },
  ],
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss']
})
export class SearchInputComponent implements ControlValueAccessor {
  public store = inject(SEARCH_INPUT_STORE);

  protected value: string = '';
  private onChange: (...attr) => void;
  private onTouch: (...attr) => void;

  constructor() {
    effect(() => {
      const storeValue = this.store.value();
      const newValue = storeValue || '';

      if (newValue !== this.value) {
        this.value = newValue;
        if (this.onChange) {
          this.onChange(this.value);
        }
      }
    });
  }

  public writeValue(obj: string): void {
    const newValue = obj || '';
    if (newValue !== this.value) {
      this.value = newValue;
      this.store.patch({ value: obj || undefined });
    }
  }

  public registerOnChange(fn: (...attr) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: (...attr) => void): void {
    this.onTouch = fn;
  }

  protected emitTouched(): void {
    this.onTouch?.();
  }

  protected onModelChanged(event: string): void {
    this.store.patch({ value: event || undefined });
  }

  protected resetSearch(): void {
    this.store.reset();
  }
}
