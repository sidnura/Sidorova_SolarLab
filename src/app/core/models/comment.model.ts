export interface CommentModel {
  id: string;
  text: string;
  created: string;
  parentId: string | null;
  user: {
    id: string;
    name: string;
    login: string;
  };
  replies?: CommentModel[];
}

export interface CreateCommentRequestModel {
  text: string;
  parentId?: string;
}

export interface UpdateCommentRequestModel {
  text: string;
}

export interface CreateCommentRequestAPI {
  Text: string;
  ParentId?: string;
}

export interface UpdateCommentRequestAPI {
  Text: string;
}
