import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommentService } from '../../../core/services/comment.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommentModel, CreateCommentRequestModel } from '../../../core/models/comment.model';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {
  @Input() adId!: string;

  comments: CommentModel[] = [];
  commentForm: FormGroup;
  replyForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isLoggedIn = false;
  replyingTo: string | null = null;

  constructor(
    private commentService: CommentService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.commentForm = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(1)]]
    });

    this.replyForm = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.loadComments();

    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      this.isLoggedIn = isAuthenticated;
    });
  }

  loadComments(): void {
    this.isLoading = true;
    this.commentService.getComments(this.adId).subscribe({
      next: (comments: CommentModel[]) => {
        this.isLoading = false;
        this.comments = this.buildCommentTree(comments);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = 'Ошибка загрузки комментариев';
      }
    });
  }

  onSubmit(): void {
    if (this.commentForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const commentText = this.commentForm.get('text')?.value?.trim();

      if (!commentText) {
        this.errorMessage = 'Введите текст комментария';
        this.isLoading = false;
        return;
      }

      const commentData: CreateCommentRequestModel = {
        text: commentText
      };

      this.commentService.createComment(this.adId, commentData).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.commentForm.reset();
          this.successMessage = 'Комментарий добавлен!';
          this.loadComments();

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = 'Ошибка при добавлении комментария';
        }
      });
    } else {
      this.markFormGroupTouched(this.commentForm);
      this.errorMessage = 'Введите текст комментария';
    }
  }

  onReply(parentCommentId: string): void {
    if (this.replyForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const replyText = this.replyForm.get('text')?.value?.trim();

      if (!replyText) {
        this.errorMessage = 'Введите текст ответа';
        this.isLoading = false;
        return;
      }

      const replyData: CreateCommentRequestModel = {
        text: replyText,
        parentId: parentCommentId
      };

      this.commentService.createComment(this.adId, replyData).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.replyForm.reset();
          this.replyingTo = null;
          this.successMessage = 'Ответ добавлен!';
          this.loadComments();

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = 'Ошибка при добавлении ответа';
        }
      });
    } else {
      this.markFormGroupTouched(this.replyForm);
      this.errorMessage = 'Введите текст ответа';
    }
  }

  private buildCommentTree(comments: CommentModel[]): CommentModel[] {
    const commentMap = new Map<string, CommentModel & { replies?: CommentModel[] }>();
    const rootComments: (CommentModel & { replies?: CommentModel[] })[] = [];

    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    comments.forEach(comment => {
      if (comment.parentId && commentMap.has(comment.parentId)) {
        const parentComment = commentMap.get(comment.parentId)!;
        if (!parentComment.replies) {
          parentComment.replies = [];
        }
        parentComment.replies.push(commentMap.get(comment.id)!);
      } else {
        rootComments.push(commentMap.get(comment.id)!);
      }
    });

    return rootComments;
  }

  startReply(commentId: string): void {
    this.replyingTo = commentId;
    this.replyForm.reset();
  }

  cancelReply(): void {
    this.replyingTo = null;
    this.replyForm.reset();
  }

  canEditComment(comment: CommentModel): boolean {
    const currentUserId = this.authService.getUserId();
    return currentUserId === comment.user.id;
  }

  editComment(comment: CommentModel): void {
    const newText = prompt('Редактировать комментарий:', comment.text);
    if (newText && newText.trim() !== comment.text) {
      this.commentService.updateComment(comment.id, { text: newText.trim() }).subscribe({
        next: () => {
          this.loadComments();
          this.successMessage = 'Комментарий обновлен!';
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: () => {
          this.errorMessage = 'Ошибка при редактировании комментария';
        }
      });
    }
  }

  deleteComment(comment: CommentModel): void {
    if (confirm('Удалить комментарий?')) {
      this.commentService.deleteComment(comment.id).subscribe({
        next: () => {
          this.loadComments();
          this.successMessage = 'Комментарий удален!';
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: () => {
          this.errorMessage = 'Ошибка при удалении комментария';
        }
      });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин. назад`;
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays < 7) return `${diffDays} дн. назад`;

    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
