export interface Self {
  sub: string;
  given_name: string;
  family_name: string;
  email: string;
  picture: string;
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
