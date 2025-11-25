// models/ad.model.ts
export interface AdModel {
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

  user?: {
    id: string;
    name: string;
    login: string;
  };

  category?: {
    id: string;
    parentId: string;
    name: string;
  };

  created?: string;
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

export interface UpdateAdRequest {
  name: string;
  description?: string;
  cost: number;
  email?: string;
  phone: string;
  location: string;
  categoryId: string;
}

export interface ShortAdDto {
  id: string;
  name: string;
  location: string;
  createdAt: string;
  isActive: boolean;
  imagesIds: string[];
  cost: number;
}

export interface AdSearchRequestDto {
  search?: string;
  showNonActive?: boolean;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
