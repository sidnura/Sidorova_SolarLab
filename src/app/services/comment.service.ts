import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment, CreateCommentRequest, UpdateCommentRequest } from '../models/comment.model';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = environment.baseApiURL;

  constructor(private http: HttpClient) {}

  // Получить комментарии объявления
  getComments(advertId: string): Observable<Comment[]> {
    const url = `${this.apiUrl}/Advert/${advertId}/Comments`;
    return this.http.get<Comment[]>(url);
  }

  // Создать комментарий - FormData
  createComment(adId: string, commentData: CreateCommentRequest): Observable<any> {
    const url = `${this.apiUrl}/Advert/${adId}/comments`;
    
    const formData = new FormData();
    formData.append('Text', commentData.text);

    if (commentData.parentId && commentData.parentId.trim() !== '') {
      formData.append('ParentId', commentData.parentId);
    }

    console.log('✅ Создание комментария с FormData');
    return this.http.post(url, formData);
  }

  // Получить комментарий по ID
  getCommentById(commentId: string): Observable<Comment> {
    const url = `${this.apiUrl}/Comment/${commentId}`;
    return this.http.get<Comment>(url);
  }

  // Обновить комментарий - ИСПРАВЛЕННАЯ ВЕРСИЯ
  updateComment(commentId: string, commentData: UpdateCommentRequest): Observable<any> {
    const url = `${this.apiUrl}/Comment/${commentId}`;
    
    // Для PUT запроса используем JSON с правильными заголовками
    const requestBody = {
      Text: commentData.text
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('✏️ Обновление комментария с JSON:', requestBody);
    
    return this.http.put(url, requestBody, { headers });
  }

  // Удалить комментарий
  deleteComment(commentId: string): Observable<any> {
    const url = `${this.apiUrl}/Comment/${commentId}`;
    console.log('🗑️ Удаление комментария URL:', url);
    return this.http.delete(url);
  }
}