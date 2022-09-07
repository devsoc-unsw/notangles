import { Injectable } from '@nestjs/common';

@Injectable({})
export class UserService {
  constructor() {}

  // Returning some dummy strings for now
  profile() {
    return { msg: 'user profile' };
  }
  timetable() {
    return { msg: 'user timetable' };
  }
}
