import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommentModel, CreateCommentRequestModel, UpdateCommentRequestModel } from '../models/comment.model';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = environment.baseApiURL;

  constructor(private http: HttpClient) {}

  getComments(advertId: string): Observable<CommentModel[]> {
    const url = `${this.apiUrl}/Advert/${advertId}/Comments`;
    return this.http.get<CommentModel[]>(url);
  }

  createComment(adId: string, commentData: CreateCommentRequestModel): Observable<any> {
    const url = `${this.apiUrl}/Advert/${adId}/comments`;

    const formData = new FormData();
    formData.append('Text', commentData.text);

    if (commentData.parentId && commentData.parentId.trim() !== '') {
      formData.append('ParentId', commentData.parentId);
    }

    return this.http.post(url, formData);
  }

  getCommentById(commentId: string): Observable<CommentModel> {
    const url = `${this.apiUrl}/Comment/${commentId}`;
    return this.http.get<CommentModel>(url);
  }

  updateComment(commentId: string, commentData: UpdateCommentRequestModel): Observable<any> {
    const url = `${this.apiUrl}/Comment/${commentId}`;

    const requestBody = {
      Text: commentData.text
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put(url, requestBody, { headers });
  }

  deleteComment(commentId: string): Observable<any> {
    const url = `${this.apiUrl}/Comment/${commentId}`;
    return this.http.delete(url);
  }
}
