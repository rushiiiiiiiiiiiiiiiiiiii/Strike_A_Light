import { GameRecord, Student, Institution } from '@/types/auth';

export const useMockData = () => {
  // Mock game records for charts and tables
  const mockGameRecords: GameRecord[] = [
    { id: '1', playerId: 'player1', score: 850, accuracy: 92, reactionTime: 0.32, gameMode: 'Speed Mode', playedAt: new Date('2024-01-15') },
    { id: '2', playerId: 'player1', score: 720, accuracy: 88, reactionTime: 0.45, gameMode: 'Precision Mode', playedAt: new Date('2024-01-16') },
    { id: '3', playerId: 'player1', score: 950, accuracy: 95, reactionTime: 0.28, gameMode: 'Speed Mode', playedAt: new Date('2024-01-17') },
    { id: '4', playerId: 'player1', score: 680, accuracy: 85, reactionTime: 0.52, gameMode: 'Endurance Mode', playedAt: new Date('2024-01-18') },
    { id: '5', playerId: 'player1', score: 780, accuracy: 90, reactionTime: 0.38, gameMode: 'Precision Mode', playedAt: new Date('2024-01-19') },
    { id: '6', playerId: 'player1', score: 820, accuracy: 93, reactionTime: 0.35, gameMode: 'Speed Mode', playedAt: new Date('2024-01-20') },
    { id: '7', playerId: 'player1', score: 900, accuracy: 94, reactionTime: 0.30, gameMode: 'Speed Mode', playedAt: new Date('2024-01-21') },
  ];

  // Mock students for institution dashboard
  const mockStudents: Student[] = [
    {
      id: 'student1',
      name: 'Alice Johnson',
      email: 'alice.johnson@school.edu',
      institutionId: 'inst1',
      averageScore: 825,
      lastPlayed: new Date('2024-01-21'),
      totalPlays: 15,
      assignedPlays: 20,
    },
    {
      id: 'student2',
      name: 'Bob Smith',
      email: 'bob.smith@school.edu',
      institutionId: 'inst1',
      averageScore: 760,
      lastPlayed: new Date('2024-01-20'),
      totalPlays: 12,
      assignedPlays: 20,
    },
    {
      id: 'student3',
      name: 'Carol Davis',
      email: 'carol.davis@school.edu',
      institutionId: 'inst1',
      averageScore: 890,
      lastPlayed: new Date('2024-01-22'),
      totalPlays: 18,
      assignedPlays: 20,
    },
    {
      id: 'student4',
      name: 'David Wilson',
      email: 'david.wilson@school.edu',
      institutionId: 'inst1',
      averageScore: 720,
      lastPlayed: new Date('2024-01-19'),
      totalPlays: 10,
      assignedPlays: 20,
    },
  ];

  // Mock institutions for super admin dashboard
  const mockInstitutions: Institution[] = [
    {
      id: 'inst1',
      name: 'Tech High School',
      adminId: 'admin1',
      studentsCount: 45,
      averageScore: 798,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'inst2',
      name: 'Fitness Plus Gym',
      adminId: 'admin2',
      studentsCount: 32,
      averageScore: 856,
      createdAt: new Date('2024-01-05'),
    },
    {
      id: 'inst3',
      name: 'Neuro Therapy Center',
      adminId: 'admin3',
      studentsCount: 28,
      averageScore: 743,
      createdAt: new Date('2024-01-10'),
    },
  ];

  // Generate chart data for performance trends
  const generatePerformanceData = () => {
    const dates = [];
    const scores = [];
    const reactionTimes = [];
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString());
      scores.push(Math.floor(Math.random() * 200) + 700); // 700-900 range
      reactionTimes.push((Math.random() * 0.3 + 0.2).toFixed(2)); // 0.2-0.5 range
    }
    
    return { dates, scores, reactionTimes };
  };

  // Game mode statistics
  const gameModeStats = [
    { mode: 'Speed Mode', totalPlays: 45, averageScore: 835 },
    { mode: 'Precision Mode', totalPlays: 32, averageScore: 780 },
    { mode: 'Endurance Mode', totalPlays: 28, averageScore: 720 },
    { mode: 'Challenge Mode', totalPlays: 15, averageScore: 890 },
  ];

  return {
    mockGameRecords,
    mockStudents,
    mockInstitutions,
    generatePerformanceData,
    gameModeStats,
  };
};