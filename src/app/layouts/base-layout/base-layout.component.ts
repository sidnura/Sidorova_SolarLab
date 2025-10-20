import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-base-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  template: `
    <app-header></app-header>
    
    <section class="content">
      <router-outlet />
    </section>
  `,
  styleUrls: ['./base-layout.component.scss']
})
export class BaseLayoutComponent {}