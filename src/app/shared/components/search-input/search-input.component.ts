import { Component, forwardRef } from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { isNil } from 'lodash';

@Component({
  imports: [FormsModule],
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchInputComponent)
    },
  ],
  selector: 'app-search-input',
  styleUrl: './search-input.component.scss',
  templateUrl: './search-input.component.html',
})
export class SearchInputComponent implements ControlValueAccessor {
  protected value: string;
  private onChange: (...attr) => void;
  private onTouch: (...attr) => void;

  public writeValue(obj: string): void {
    this.value = obj;

    if (isNil(obj)) {
      this.emitChanges();
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

  protected onModelChnaged(event: string): void {
    this.value = event;

    this.emitChanges();
  }

  private emitChanges(): void {
    this.onChange && this.onChange(this.value);
  }
}
