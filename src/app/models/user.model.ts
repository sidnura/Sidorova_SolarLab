// src/app/models/user.model.ts
export interface User {
  id: string;
  name: string;
  login: string;
  role?: string;
  registeredTime?: string;
  adverts?: ShortAd[];
}

export interface ShortUser {
  id: string;
  name: string;
  login: string;
}

export interface UpdateUserRequest {
  name: string;
  login: string;
  password: string;
}

export interface ShortAd {
  id: string;
  name: string;
  location: string;
  createdAt: string;
  isActive: boolean;
  imagesIds: string[];
  cost: number;
}