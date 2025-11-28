import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  imports: [HeaderComponent, RouterOutlet],
  selector: 'app-base-layout',
  standalone: true,
  styleUrls: ['./base-layout.component.scss'],
  templateUrl: './base-layout.component.html',
})
export class BaseLayoutComponent {}
