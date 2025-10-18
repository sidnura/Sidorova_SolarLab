// src/app/users/user-list/user-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ShortUser } from '../../models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  users: ShortUser[] = [];
  isLoading = false;
  errorMessage = '';
  currentUserId: string | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.currentUserId = this.authService.getUserId();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.isLoading = false;
        this.users = users;
        console.log(' Пользователи загружены:', users.length);
      },
      error: (error) => {
        this.isLoading = false;
        console.error(' Ошибка загрузки пользователей:', error);
        
        if (error.status === 403) {
          this.errorMessage = 'Доступ запрещен. Недостаточно прав.';
        } else if (error.status === 500) {
          this.errorMessage = 'Ошибка сервера при загрузке пользователей.';
        } else {
          this.errorMessage = 'Ошибка загрузки списка пользователей.';
        }
      }
    });
  }

  deleteUser(userId: string, userName: string): void {
    if (confirm(`Вы уверены, что хотите удалить пользователя "${userName}"?`)) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          console.log(' Пользователь удален:', userName);
          this.users = this.users.filter(user => user.id !== userId);
        },
        error: (error) => {
          console.error(' Ошибка удаления пользователя:', error);
          
          if (error.status === 403) {
            alert('Недостаточно прав для удаления пользователя.');
          } else if (error.status === 404) {
            alert('Пользователь не найден.');
          } else {
            alert('Ошибка при удалении пользователя.');
          }
        }
      });
    }
  }

  canDeleteUser(userId: string): boolean {
    // Нельзя удалить самого себя
    return userId !== this.currentUserId;
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}