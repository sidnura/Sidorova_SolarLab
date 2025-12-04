import { Component, EventEmitter, forwardRef, Output } from '@angular/core';
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
      useExisting: forwardRef(() => SearchInputComponent),
    },
  ],
  selector: 'app-search-input',
  styleUrl: './search-input.component.scss',
  templateUrl: './search-input.component.html',
})
export class SearchInputComponent implements ControlValueAccessor {
  @Output() search = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();

  protected value: string = '';
  private onChange: (...attr) => void;
  private onTouch: (...attr) => void;

  private searchExecuted: boolean = false;

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

  protected onModelChanged(event: string): void {
    this.value = event;
    this.searchExecuted = false;
    this.emitChanges();
  }

  protected onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.executeSearch();
    }
  }

  protected executeSearch(): void {
    this.searchExecuted = true;
    this.search.emit(this.value);
  }

  protected clearSearch(): void {
    this.value = '';
    this.searchExecuted = false;
    this.emitChanges();
    this.clear.emit();
  }

  protected shouldShowClearIcon(): boolean {
    return this.value.trim().length > 0 && this.searchExecuted;
  }

  protected shouldShowSearchIcon(): boolean {
    return this.value.trim().length === 0 || !this.searchExecuted;
  }

  private emitChanges(): void {
    this.onChange && this.onChange(this.value);
  }
}
