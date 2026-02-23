import type { User } from './types';
import { PlaceHolderImages } from './placeholder-images';

const avatarUrls = PlaceHolderImages.map(p => p.imageUrl);

export const users: User[] = [
  {
    id: 'user-1',
    name: 'Alex "Speedster" Chen',
    avatarUrl: avatarUrls[0],
    weeklyStats: {
      distance: 42.2,
      avgSpeed: 12.5,
      pace: 4.8,
    },
  },
  {
    id: 'user-2',
    name: 'Maria "Marathon" Garcia',
    avatarUrl: avatarUrls[1],
    weeklyStats: {
      distance: 55.1,
      avgSpeed: 10.2,
      pace: 5.88,
    },
  },
  {
    id: 'user-3',
    name: 'Sam "The Tortoise" Jones',
    avatarUrl: avatarUrls[2],
    weeklyStats: {
      distance: 25.6,
      avgSpeed: 8.0,
      pace: 7.5,
    },
  },
  {
    id: 'user-4',
    name: 'Jennifer "Jet" Lee',
    avatarUrl: avatarUrls[3],
    weeklyStats: {
      distance: 30.0,
      avgSpeed: 15.1,
      pace: 3.97,
    },
  },
  {
    id: 'user-5',
    name: 'David "Distance" Kim',
    avatarUrl: avatarUrls[4],
    weeklyStats: {
      distance: 60.5,
      avgSpeed: 9.5,
      pace: 6.31,
    },
  },
  {
    id: 'user-6',
    name: 'You',
    avatarUrl: avatarUrls[5],
    weeklyStats: {
      distance: 35.2,
      avgSpeed: 11.8,
      pace: 5.08,
    },
  },
  {
    id: 'user-7',
    name: 'Chloe "Pacer" Nguyen',
    avatarUrl: avatarUrls[6],
    weeklyStats: {
      distance: 48.9,
      avgSpeed: 13.0,
      pace: 4.61,
    },
  },
];

export const getCurrentUser = (): User => {
    return users.find(u => u.name === 'You')!;
}
