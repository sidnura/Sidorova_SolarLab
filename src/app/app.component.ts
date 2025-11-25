import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdListCommonStateModule } from './store/ad-list-common-state/ad-list-common-state.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AdListCommonStateModule],
  template: `
    <router-outlet />
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Доска объявлений';
}
