export interface User {
  user: {
    firstname: string;
    lastname: string;
    google_uid: string;
  };
  hasSentRequest: boolean;
  isAlreadyFriend: boolean;
}
