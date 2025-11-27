import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-auth-layout',
  standalone: true,
  styleUrls: ['./auth-layout.component.scss'],
  templateUrl: './auth-layout.component.html',
})
export class AuthLayoutComponent {}
