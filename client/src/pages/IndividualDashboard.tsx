import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Trophy, Target, Clock, BarChart3, Download, Share2 } from 'lucide-react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useMockData } from '@/hooks/useMockData';
import { useAuth } from '@/contexts/AuthContext';

const IndividualDashboard = () => {
  const { user } = useAuth();
  const { mockGameRecords, generatePerformanceData, gameModeStats } = useMockData();
  const performanceData = generatePerformanceData();
  
  // Calculate stats
  const totalPlays = mockGameRecords.length;
  const bestScore = Math.max(...mockGameRecords.map(record => record.score));
  const avgReactionTime = (mockGameRecords.reduce((sum, record) => sum + record.reactionTime, 0) / totalPlays).toFixed(2);
  const avgAccuracy = Math.round(mockGameRecords.reduce((sum, record) => sum + record.accuracy, 0) / totalPlays);

  // Prepare chart data
  const reactionTimeData = performanceData.dates.map((date, index) => ({
    date,
    reactionTime: parseFloat(performanceData.reactionTimes[index])
  }));

  const gameModeChartData = gameModeStats.map(stat => ({
    mode: stat.mode.replace(' Mode', ''),
    plays: stat.totalPlays,
    avgScore: stat.averageScore
  }));

  const accuracyData = [
    { name: 'Accurate', value: avgAccuracy, color: '#39FF14' },
    { name: 'Missed', value: 100 - avgAccuracy, color: '#FF4444' }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-hero">
        <DashboardSidebar />
        
        <main className="flex-1 overflow-hidden">
          {/* Header */}
          <header className="border-b border-primary/20 bg-background/80 backdrop-blur-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="font-orbitron text-2xl font-bold text-primary">
                    Individual Dashboard
                  </h1>
                  <p className="text-muted-foreground">Welcome back, {user?.name}</p>
                </div>
              </div>
              <Button className="bg-gradient-primary hover:shadow-glow gap-2">
                <Download className="w-4 h-4" />
                Download Report
              </Button>
            </div>
          </header>

          <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-80px)]">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-card border-primary/20 glow-effect">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
                  <Trophy className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary font-orbitron">{totalPlays}</div>
                  <p className="text-xs text-muted-foreground">+2 from last week</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-primary/20 glow-effect">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Best Score</CardTitle>
                  <Target className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary font-orbitron">{bestScore}</div>
                  <p className="text-xs text-muted-foreground">Personal record</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-primary/20 glow-effect">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Reaction Time</CardTitle>
                  <Clock className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary font-orbitron">{avgReactionTime}s</div>
                  <p className="text-xs text-muted-foreground">-0.05s improvement</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-primary/20 glow-effect">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
                  <BarChart3 className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary font-orbitron">{avgAccuracy}%</div>
                  <p className="text-xs text-muted-foreground">+3% from last week</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Trend */}
              <Card className="bg-gradient-card border-primary/20">
                <CardHeader>
                  <CardTitle className="font-orbitron text-primary">Reaction Time Trend</CardTitle>
                  <CardDescription>Your reaction time over the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reactionTimeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #00D4FF',
                          borderRadius: '8px'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="reactionTime" 
                        stroke="#00D4FF" 
                        strokeWidth={3}
                        dot={{ fill: '#00D4FF', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Game Mode Performance */}
              <Card className="bg-gradient-card border-primary/20">
                <CardHeader>
                  <CardTitle className="font-orbitron text-primary">Game Mode Performance</CardTitle>
                  <CardDescription>Average scores by game mode</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={gameModeChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="mode" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #39FF14',
                          borderRadius: '8px'
                        }} 
                      />
                      <Bar dataKey="avgScore" fill="#39FF14" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Game History and Accuracy */}
            <div className="grid grid-cols-1 lg:grid-cols gap-6">
              {/* Game History */}
              <Card className="lg:col-span-2 bg-gradient-card border-primary/20">
                <CardHeader>
                  <CardTitle className="font-orbitron text-primary">Recent Games</CardTitle>
                  <CardDescription>Your latest game sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockGameRecords.slice(0, 5).map((record) => (
                      <div 
                        key={record.id} 
                        className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-primary/10"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="text-lg font-orbitron text-primary">{record.score}</div>
                            <div className="text-sm text-muted-foreground">{record.gameMode}</div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {record.playedAt.toLocaleDateString()} • {record.accuracy}% accuracy • {record.reactionTime}s
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-secondary">{record.accuracy}%</div>
                          <div className="text-xs text-muted-foreground">{record.reactionTime}s</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Accuracy Pie Chart */}
              {/* <Card className="bg-gradient-card border-primary/20">
                <CardHeader>
                  <CardTitle className="font-orbitron text-primary">Accuracy Split</CardTitle>
                  <CardDescription>Hit vs miss ratio</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={accuracyData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                      >
                        {accuracyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #8B5CF6',
                          borderRadius: '8px'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {accuracyData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {entry.name}: {entry.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card> */}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default IndividualDashboard;