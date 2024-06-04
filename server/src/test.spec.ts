import { FriendService } from './friend/friend.service';
import { UserService } from './user/user.service';
import { prismaMock } from './mock/singleton';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma/prisma.service';

// https://www.prisma.io/docs/orm/prisma-client/testing/unit-testing#mocking-the-prisma-client
describe('UserService', () => {
  let userService: UserService;
  let friendService: FriendService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        FriendService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    friendService = module.get<FriendService>(FriendService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
    expect(friendService).toBeDefined();
  });

  it('should create new user ', async () => {
    prismaMock.user.create.mockResolvedValue({
      userId: '55555555',
      createdAt: new Date('December 17, 1995 03:24:00'),
      lastLogin: new Date('December 17, 1995 03:24:00'),
      loggedIn: true,
      firstname: 'First',
      lastname: 'Last',
      email: 'z55555555@ad.unsw.edu.au',
      profileURL: '',
    });

    await expect(
      userService.setUserProfile({
        userId: '123',
        firstname: 'Michael',
        lastname: 'Siu',
        email: 'michael@gmail.com',
      }),
    ).resolves.toEqual({
      id: 1,
      name: 'Rich',
      email: 'hello@prisma.io',
      acceptTermsAndConditions: true,
    });
  });
});
