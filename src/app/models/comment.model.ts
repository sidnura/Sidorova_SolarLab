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
  replies?: Comment[];
}

export interface CreateCommentRequest {
  text: string;
  parentId?: string;
}

export interface UpdateCommentRequest {
  text: string;
}

export interface CreateCommentRequestAPI {
  Text: string;
  ParentId?: string;
}

export interface UpdateCommentRequestAPI {
  Text: string;
}