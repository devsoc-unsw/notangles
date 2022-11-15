export interface Self {
  userId: string;
  firstname: string;
  lastname: string;
  profileURL: string;
  email: string;
}

export interface User {
  userId: string;
  firstname: string;
  lastname: string;
  profileURL: string;
  email: string;
}

export interface SearchResult {
  user: User;
  hasSentRequest: boolean;
  isAlreadyFriend: boolean;
}
