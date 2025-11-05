import { useMutation } from '@tanstack/react-query';

import type { UserSettings } from '../../interfaces/User';
import {
  setUserSettings,
  createFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
} from './routes';

export const useSetUserSettings = () =>
  useMutation({
    mutationFn: (settings: Partial<UserSettings>) => setUserSettings(settings),
    meta: {
      invalidatesQuery: ['settings'],
    },
  }).mutate;

export const useCreateFriendRequest = () =>
  useMutation({
    mutationFn: (requesteeCode: string) => createFriendRequest(requesteeCode),
    meta: {
      invalidatesQuery: ['friends', 'friendRequests'],
    },
  }).mutate;

export const useCancelFriendRequest = () =>
  useMutation({
    mutationFn: (requesteeCode: string) => cancelFriendRequest(requesteeCode),
    meta: {
      invalidatesQuery: ['friendRequests'],
    },
  }).mutate;

export const useAcceptFriendRequest = () =>
  useMutation({
    mutationFn: (requestorCode: string) => acceptFriendRequest(requestorCode),
    meta: {
      invalidatesQuery: ['friends', 'friendRequests'],
    },
  }).mutate;

export const useRejectFriendRequest = () =>
  useMutation({
    mutationFn: (requestorCode: string) => rejectFriendRequest(requestorCode),
    meta: {
      invalidatesQuery: ['friendRequests'],
    },
  }).mutate;

export const useRemoveFriend = () =>
  useMutation({
    mutationFn: (otherCode: string) => removeFriend(otherCode),
    meta: {
      invalidatesQuery: ['friends'],
    },
  }).mutate;
  