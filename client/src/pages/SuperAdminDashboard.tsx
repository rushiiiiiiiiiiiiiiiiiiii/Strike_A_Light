import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { 
  Users, 
  Building, 
  Trophy, 
  TrendingUp, 
  Search,
  Download,
  Settings,
  Shield
} from 'lucide-react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useMockData } from '@/hooks/useMockData';
import { useAuth } from '@/contexts/AuthContext';

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const { mockInstitutions, mockStudents, generatePerformanceData } = useMockData();
  const [searchTerm, setSearchTerm] = useState('');
  
  const performanceData = generatePerformanceData();
  
  // Calculate platform stats
  const totalInstitutions = mockInstitutions.length;
  const totalUsers = mockStudents.length;
  const totalPlays = mockStudents.reduce((sum, student) => sum + student.totalPlays, 0);
  const avgPlatformScore = Math.round(mockStudents.reduce((sum, student) => sum + student.averageScore, 0) / totalUsers);

  // Prepare chart data
  const platformGrowthData = performanceData.dates.map((date, index) => ({
    date,
    users: Math.floor(Math.random() * 50) + (index * 2) + 100,
    institutions: Math.floor(Math.random() * 5) + Math.floor(index / 3) + 10
  }));

  const institutionPerformanceData = mockInstitutions.map(inst => ({
    name: inst.name.split(' ')[0],
    students: inst.studentsCount,
    avgScore: inst.averageScore
  }));

  const topPerformersData = mockStudents
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 10)
    .map(student => ({
      name: student.name.split(' ')[0],
      score: student.averageScore,
      institution: mockInstitutions.find(inst => inst.id === student.institutionId)?.name || 'Unknown'
    }));

  const userTypeDistribution = [
    { name: 'Institutions', value: totalInstitutions, color: '#00D4FF' },
    { name: 'Students', value: totalUsers, color: '#39FF14' },
  ];

  // Filter functions
  const filteredInstitutions = mockInstitutions.filter(inst =>
    inst.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStudents = mockStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-background" />
                  </div>
                  <div>
                    <h1 className="font-orbitron text-2xl font-bold text-primary">
                      Super Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground">Platform Overview & Management</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
                <Button className="bg-gradient-primary hover:shadow-glow gap-2">
                  <Download className="w-4 h-4" />
                  Export All Data
                </Button>
              </div>
            </div>
          </header>

          <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-80px)]">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-card border-primary/20 glow-effect">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Institutions</CardTitle>
                  <Building className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary font-orbitron">{totalInstitutions}</div>
                  <p className="text-xs text-muted-foreground">+2 this month</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-primary/20 glow-effect">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary font-orbitron">{totalUsers}</div>
                  <p className="text-xs text-muted-foreground">+12 this week</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-primary/20 glow-effect">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
                  <Trophy className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary font-orbitron">{totalPlays}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-primary/20 glow-effect">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Platform Average</CardTitle>
                  <TrendingUp className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary font-orbitron">{avgPlatformScore}</div>
                  <p className="text-xs text-muted-foreground">Global score</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Platform Growth */}
              <Card className="lg:col-span-2 bg-gradient-card border-primary/20">
                <CardHeader>
                  <CardTitle className="font-orbitron text-primary">Platform Growth</CardTitle>
                  <CardDescription>Users and institutions over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={platformGrowthData}>
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
                        dataKey="users" 
                        stroke="#00D4FF" 
                        strokeWidth={3}
                        name="Users"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="institutions" 
                        stroke="#39FF14" 
                        strokeWidth={3}
                        name="Institutions"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* User Distribution */}
              <Card className="bg-gradient-card border-primary/20">
                <CardHeader>
                  <CardTitle className="font-orbitron text-primary">User Distribution</CardTitle>
                  <CardDescription>Institutions vs Students</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={userTypeDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                      >
                        {userTypeDistribution.map((entry, index) => (
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
                    {userTypeDistribution.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-sm text-muted-foreground">{entry.name}</span>
                        </div>
                        <span className="text-sm font-medium text-primary">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Institution Performance and Top Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Institution Performance */}
              <Card className="bg-gradient-card border-primary/20">
                <CardHeader>
                  <CardTitle className="font-orbitron text-primary">Institution Performance</CardTitle>
                  <CardDescription>Average scores by institution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={institutionPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #8B5CF6',
                          borderRadius: '8px'
                        }} 
                      />
                      <Bar dataKey="avgScore" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card className="bg-gradient-card border-primary/20">
                <CardHeader>
                  <CardTitle className="font-orbitron text-primary">Top Performers</CardTitle>
                  <CardDescription>Highest scoring users across platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {topPerformersData.map((performer, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-primary/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center">
                            <span className="text-background font-bold text-sm">{index + 1}</span>
                          </div>
                          <div>
                            <div className="font-medium text-primary">{performer.name}</div>
                            <div className="text-xs text-muted-foreground">{performer.institution}</div>
                          </div>
                        </div>
                        <div className="text-lg font-orbitron text-secondary">
                          {performer.score}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Institutions List */}
              <Card className="bg-gradient-card border-primary/20">
                <CardHeader>
                  <CardTitle className="font-orbitron text-primary">All Institutions</CardTitle>
                  <CardDescription>Manage registered institutions</CardDescription>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search institutions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-background/50 border-primary/30"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {filteredInstitutions.map((institution) => (
                      <div 
                        key={institution.id} 
                        className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-primary/10"
                      >
                        <div>
                          <div className="font-medium text-primary">{institution.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {institution.studentsCount} students • Avg: {institution.averageScore}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {institution.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Users List */}
              <Card className="bg-gradient-card border-primary/20">
                <CardHeader>
                  <CardTitle className="font-orbitron text-primary">All Users</CardTitle>
                  <CardDescription>Manage all platform users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {filteredStudents.slice(0, 10).map((student) => (
                      <div 
                        key={student.id} 
                        className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-primary/10"
                      >
                        <div>
                          <div className="font-medium text-primary">{student.name}</div>
                          <div className="text-sm text-muted-foreground">{student.email}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-secondary">{student.averageScore}</div>
                          <div className="text-xs text-muted-foreground">{student.totalPlays} plays</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default SuperAdminDashboard;