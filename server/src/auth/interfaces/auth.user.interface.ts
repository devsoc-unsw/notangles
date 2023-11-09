import { UserinfoResponse } from "openid-client";

export interface AuthUser { 
  id_token: string;
  access_token: string;
  refresh_token: string;
  userinfo: UserinfoResponse;
}