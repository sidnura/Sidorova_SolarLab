export interface Comment {
  id: string;
  text: string;
  created: string;
  parentId: string | null;
  user: {
    id: string;
    name: string;
    login: string;
  };
  // Добавляем необязательное поле для построения дерева комментариев
  replies?: Comment[];
}

// Модель для создания комментария - поля в camelCase для Angular
export interface CreateCommentRequest {
  text: string;
  parentId?: string;
}

// Модель для обновления комментария - поля в camelCase для Angular
export interface UpdateCommentRequest {
  text: string;
}

// Интерфейсы для API (поля с заглавной буквы)
export interface CreateCommentRequestAPI {
  Text: string;
  ParentId?: string;
}

export interface UpdateCommentRequestAPI {
  Text: string;
}