export interface User {
  user: {
    userId: string;
    firstname: string;
    lastname: string;
    profileURL: string;
    email: string;
  };
  hasSentRequest: boolean;
  isAlreadyFriend: boolean;
}
