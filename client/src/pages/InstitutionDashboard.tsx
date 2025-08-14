import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  Bar
} from 'recharts';
import { Users, UserPlus, QrCode, Download, Trash2, Building } from 'lucide-react';
import DashboardSidebar from '@/components/DashboardSidebar';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { useMockData } from '@/hooks/useMockData';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const InstitutionDashboard = () => {
  const { user } = useAuth();
  const { mockStudents, generatePerformanceData } = useMockData();
  const { toast } = useToast();
  const [students, setStudents] = useState(mockStudents);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showQRCode, setShowQRCode] = useState<any>(null);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', assignedPlays: 20 });
  
  const performanceData = generatePerformanceData();
  
  // Calculate institution stats
  const totalStudents = students.length;
  const avgScore = Math.round(students.reduce((sum, student) => sum + student.averageScore, 0) / totalStudents);
  const totalPlays = students.reduce((sum, student) => sum + student.totalPlays, 0);
  const activeStudents = students.filter(student => {
    const daysSinceLastPlay = Math.floor((Date.now() - student.lastPlayed.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceLastPlay <= 7;
  }).length;

  // Prepare chart data
  const institutionPerformanceData = performanceData.dates.map((date, index) => ({
    date,
    avgScore: performanceData.scores[index]
  }));

  const studentPerformanceData = students.map(student => ({
    name: student.name.split(' ')[0],
    score: student.averageScore,
    plays: student.totalPlays
  }));

  const handleAddStudent = () => {
    if (!newStudent.name || !newStudent.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const studentWithId = {
      id: `student_${Date.now()}`,
      ...newStudent,
      institutionId: user?.id || 'inst1',
      averageScore: 0,
      lastPlayed: new Date(),
      totalPlays: 0,
    };

    setStudents([...students, studentWithId]);
    setNewStudent({ name: '', email: '', assignedPlays: 20 });
    setShowAddStudent(false);
    
    toast({
      title: "Student Added",
      description: `${newStudent.name} has been added successfully.`,
    });
  };

  const handleRemoveStudent = (studentId: string) => {
    setStudents(students.filter(student => student.id !== studentId));
    toast({
      title: "Student Removed",
      description: "Student has been removed from the institution.",
    });
  };

  const generateQRForStudent = (student: any) => {
    setShowQRCode({
      id: student.id,
      name: student.name,
      type: 'student',
      assignedPlays: student.assignedPlays,
    });
  };

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
                  <div className="w-10 h-10 bg-gradient-secondary rounded-lg flex items-center justify-center">
                    <Building className="w-6 h-6 text-background" />
                  </div>
                  <div>
                    <h1 className="font-orbitron text-2xl font-bold text-primary">
                      {user?.institutionName || 'Institution Dashboard'}
                    </h1>
                    <p className="text-muted-foreground">Admin: {user?.name}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-secondary hover:shadow-neon gap-2">
                      <UserPlus className="w-4 h-4" />
                      Add Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gradient-card border-primary/20">
                    <DialogHeader>
                      <DialogTitle className="font-orbitron text-primary">Add New Student</DialogTitle>
                      <DialogDescription>
                        Add a student to your institution and assign game plays.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="studentName">Student Name</Label>
                        <Input
                          id="studentName"
                          value={newStudent.name}
                          onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter student name"
                          className="bg-background/50 border-primary/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="studentEmail">Email</Label>
                        <Input
                          id="studentEmail"
                          type="email"
                          value={newStudent.email}
                          onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="student@email.com"
                          className="bg-background/50 border-primary/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="assignedPlays">Assigned Plays</Label>
                        <Input
                          id="assignedPlays"
                          type="number"
                          value={newStudent.assignedPlays}
                          onChange={(e) => setNewStudent(prev => ({ ...prev, assignedPlays: parseInt(e.target.value) || 0 }))}
                          placeholder="20"
                          className="bg-background/50 border-primary/30"
                        />
                      </div>
                      <Button 
                        onClick={handleAddStudent}
                        className="w-full bg-gradient-primary hover:shadow-glow"
                      >
                        Add Student
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export Report
                </Button>
              </div>
            </div>
          </header>

          <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-80px)]">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-card border-primary/20 glow-effect">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary font-orbitron">{totalStudents}</div>
                  <p className="text-xs text-muted-foreground">+2 this month</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-primary/20 glow-effect">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <Building className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary font-orbitron">{avgScore}</div>
                  <p className="text-xs text-muted-foreground">+15 from last month</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-primary/20 glow-effect">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
                  <QrCode className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary font-orbitron">{totalPlays}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-primary/20 glow-effect">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                  <Users className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary font-orbitron">{activeStudents}</div>
                  <p className="text-xs text-muted-foreground">Played this week</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Institution Performance Trend */}
              <Card className="bg-gradient-card border-primary/20">
                <CardHeader>
                  <CardTitle className="font-orbitron text-primary">Institution Performance</CardTitle>
                  <CardDescription>Average scores over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={institutionPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #8B5CF6',
                          borderRadius: '8px'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="avgScore" 
                        stroke="#8B5CF6" 
                        strokeWidth={3}
                        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Student Performance Comparison */}
              <Card className="bg-gradient-card border-primary/20">
                <CardHeader>
                  <CardTitle className="font-orbitron text-primary">Student Performance</CardTitle>
                  <CardDescription>Individual student average scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={studentPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #39FF14',
                          borderRadius: '8px'
                        }} 
                      />
                      <Bar dataKey="score" fill="#39FF14" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Students Table */}
            <Card className="bg-gradient-card border-primary/20">
              <CardHeader>
                <CardTitle className="font-orbitron text-primary">Students</CardTitle>
                <CardDescription>Manage your students and generate QR codes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {students.map((student) => (
                    <div 
                      key={student.id} 
                      className="flex items-center justify-between p-4 bg-background/30 rounded-lg border border-primary/10"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-medium text-primary">{student.name}</h3>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-orbitron text-secondary">{student.averageScore}</div>
                            <div className="text-xs text-muted-foreground">Avg Score</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-orbitron text-accent">{student.totalPlays}/{student.assignedPlays}</div>
                            <div className="text-xs text-muted-foreground">Plays</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">{student.lastPlayed.toLocaleDateString()}</div>
                            <div className="text-xs text-muted-foreground">Last Played</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => generateQRForStudent(student)}
                          className="gap-2"
                        >
                          <QrCode className="w-4 h-4" />
                          QR Code
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleRemoveStudent(student.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <Dialog open={!!showQRCode} onOpenChange={() => setShowQRCode(null)}>
          <DialogContent className="max-w-md bg-gradient-card border-primary/20">
            <DialogHeader>
              <DialogTitle className="font-orbitron text-primary text-center">
                Student QR Code
              </DialogTitle>
            </DialogHeader>
            <QRCodeDisplay data={showQRCode} />
          </DialogContent>
        </Dialog>
      )}
    </SidebarProvider>
  );
};

export default InstitutionDashboard;