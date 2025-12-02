import {
  Component,
  computed,
  effect,
  ElementRef,
  input,
  Renderer2,
  Signal,
} from '@angular/core';
import { patchState, signalState } from '@ngrx/signals';
import { isNil } from 'lodash';
import { environment } from '../../../../environments/environment.development';
import {
  ImageLazyLoaderStateModel,
  initialState,
} from './image-lazy-loader.model';

@Component({
  imports: [],
  selector: 'image-lazy-loader',
  styleUrl: './image-lazy-loader.component.scss',
  templateUrl: './image-lazy-loader.component.html',
})
export class ImageLazyLoaderComponent {
  public url = input<string>();
  public readonly state = signalState<ImageLazyLoaderStateModel>(initialState);
  public link: Signal<string> = computed(() => {
    const hasData = this.state.hasData();

    return hasData
      ? `${environment.baseApiURL}/Images/${this.state.url()}`
      : this.state.url();
  });

  constructor(
    private readonly elementRef: ElementRef,
    private readonly renderer: Renderer2
  ) {
    effect(() => {
      const hasData = !isNil(this.url());

      patchState(this.state, { hasData, url: this.url() ?? initialState.url });
    });

    effect(() => {
      const hasData = this.state.hasData();

      !hasData && this.renderer.addClass(elementRef.nativeElement, 'pad');
      hasData && this.renderer.removeClass(elementRef.nativeElement, 'pad');
    });
  }
}
