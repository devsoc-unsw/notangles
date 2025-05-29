declare module 'express' {
  interface Request {
    user?: {
      id: string;
      isGuest: boolean;
    };
    isAuthenticated(): boolean;
  }
}
