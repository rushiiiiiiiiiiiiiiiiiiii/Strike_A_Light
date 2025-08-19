export type UserRole = 'individual' | 'institution' | 'super_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institutionName?: string;
  createdAt: Date;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  institutionId: string;
  averageScore: number;
  lastPlayed: Date;
  totalPlays: number;
  assignedPlays: number;
}

export interface GameRecord {
  id: string;
  playerId: string;
  score: number;
  accuracy: number;
  reactionTime: number;
  gameMode: string;
  playedAt: Date;
}

export interface Institution {
  id: string;
  name: string;
  adminId: string;
  studentsCount: number;
  averageScore: number;
  createdAt: Date;
}