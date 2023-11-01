export interface User {
  id_token?: string;
  access_token?: string;
  refresh_token?: string;
  userinfo?: UserInfo;
}

export interface UserInfo {
  name?: string;
}
