// src/app/models/user.model.ts
export interface UserModel {
  id: string;
  name: string;
  login: string;
  role?: string;
  registeredTime?: string;
  adverts?: ShortAdModel[];
}

export interface ShortUserModel {
  id: string;
  name: string;
  login: string;
}

export interface UpdateUserRequestModel {
  name: string;
  login: string;
  password: string;
}

export interface ShortAdModel {
  id: string;
  name: string;
  location: string;
  createdAt: string;
  isActive: boolean;
  imagesIds: string[];
  cost: number;
}
