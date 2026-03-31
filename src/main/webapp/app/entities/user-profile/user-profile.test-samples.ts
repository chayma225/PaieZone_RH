import dayjs from 'dayjs/esm';

import { IUserProfile, NewUserProfile } from './user-profile.model';

export const sampleWithRequiredData: IUserProfile = {
  id: 4033,
  jhiUserId: 'crever personnel drôlement',
  role: 'MANAGER',
  active: false,
};

export const sampleWithPartialData: IUserProfile = {
  id: 22011,
  jhiUserId: 'manier abriter quitte à',
  role: 'MANAGER',
  phoneNumber: 'être smack pourvu qu',
  avatarUrl: 'trop peu de peur de aux environs de',
  locale: 'hi',
  active: true,
};

export const sampleWithFullData: IUserProfile = {
  id: 9570,
  jhiUserId: 'antagoniste entrer circulaire',
  role: 'RH_COMPTABLE',
  phoneNumber: 'quasi',
  avatarUrl: 'en gratis',
  locale: 'outre',
  lastLoginAt: dayjs('2026-03-31T12:23'),
  twoFactorEnabled: false,
  twoFactorSecret: 'jusque',
  active: false,
};

export const sampleWithNewData: NewUserProfile = {
  jhiUserId: 'vouh outre altruiste',
  role: 'ADMIN',
  active: false,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
