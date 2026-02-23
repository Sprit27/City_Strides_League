export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  weeklyStats: {
    distance: number; // in km
    avgSpeed: number; // in km/h
    pace: number; // in min/km
  };
};
