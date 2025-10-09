export interface Ad {
  id: string;
  name: string;
  location: string;
  createdAt: string;
  isActive: boolean;
  imagesIds: string[];
  cost: number;
  description?: string;
  email?: string;
  phone?: string;
}

export interface CreateAdRequest {
  name: string;
  description?: string;
  images?: File[];
  cost: number;
  email?: string;
  phone: string;
  location: string;
  categoryId: string;
}

export interface Category {
  id: string;
  parentId: string;
  name: string;
  children?: Category[];
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface ErrorResponse {
  errorCode: string;
  userMessage: string;
  internalErrors: string[];
}