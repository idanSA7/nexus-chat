export interface User {
  _id: string;
  username: string;
}

export interface AuthResponse {
  message: string;
  username: string;
  userId: string;
}