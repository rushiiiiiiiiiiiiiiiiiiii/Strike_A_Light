import { useEffect, useState } from 'react';
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
  Bar
} from 'recharts';
import { Trophy, Target, Clock, BarChart3, Download, QrCode } from 'lucide-react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useMockData } from '@/hooks/useMockData';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "react-qr-code";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const IndividualDashboard = () => {
  const { user } = useAuth();
  const { mockGameRecords, generatePerformanceData, gameModeStats } = useMockData();
  const performanceData = generatePerformanceData();
  
  // Calculate stats
  const totalPlays = mockGameRecords.length;
  const bestScore = Math.max(...mockGameRecords.map(record => record.score));
  const avgReactionTime = (mockGameRecords.reduce((sum, record) => sum + record.reactionTime, 0) / totalPlays).toFixed(2);
  const avgAccuracy = Math.round(mockGameRecords.reduce((sum, record) => sum + record.accuracy, 0) / totalPlays);

  const [data, setData] = useState<any>(null);
  const id = localStorage.getItem('id');

  // QR Voucher states
  const [qrOpen, setQrOpen] = useState(false);
  const [plays, setPlays] = useState(1);
  const [amount, setAmount] = useState(0);
  const [qrToken, setQrToken] = useState<string | null>(null);

  // Fetch individual user details
  useEffect(() => {
    const getdata = async () => {
      try {
        const studata = await axios.get(`http://192.168.0.116:8000/userdata/${id}`);
        setData(studata.data);
        console.log(studata.data)
      } catch (err) {
        console.error("Error fetching User Data:", err);
      }
    };
    getdata();
  }, [id]);

  // -------- Download PDF Report --------
  const downloadReport = () => {
    if (!data) return;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("Individual Performance Report", 14, 20);

    // User Info
    doc.setFontSize(12);
    doc.text(`Name: ${data.name}`, 14, 35);
    doc.text(`Email: ${data.email}`, 14, 42);

    // Stats Summary
    doc.setFontSize(14);
    doc.text("Stats Summary", 14, 60);
    doc.setFontSize(12);
    doc.text(`Total Plays: ${totalPlays}`, 14, 70);
    doc.text(`Best Score: ${bestScore}`, 14, 78);
    doc.text(`Avg Reaction Time: ${avgReactionTime}s`, 14, 86);
    doc.text(`Accuracy: ${avgAccuracy}%`, 14, 94);

    // Recent Game History
    autoTable(doc, {
      startY: 110,
      head: [["Date", "Game Mode", "Score", "Accuracy", "Reaction Time"]],
      body: mockGameRecords.slice(0, 10).map((r) => [
        r.playedAt.toLocaleDateString(),
        r.gameMode,
        r.score,
        r.accuracy + "%",
        r.reactionTime + "s",
      ]),
      theme: "grid",
      headStyles: { fillColor: [0, 212, 255] },
    });

    doc.save(`${data.name}_Report.pdf`);
  };

  // -------- Generate Voucher & QR --------
  // -------- Generate Voucher & QR --------
const generateVoucher = async () => {
  try {
    const res = await axios.post("http://192.168.0.116:8000/vouchers", {
      userId: id,                          // ✅ unified userId
      userType: "individual",              // ✅ must specify type
      institutionId: data?.institution_id || null,
      name: data?.name,
      assignedPlays: plays,
      amountPaid: amount,
      expiresInMinutes: 30
    });

    setQrToken(res.data.token);
  } catch (err) {
    console.error("Error creating voucher:", err);
  }
};


  // Prepare chart data
  const reactionTimeData = performanceData.dates.map((date, index) => ({
    date,
    reactionTime: parseFloat(performanceData.reactionTimes[index])
  }));

  const gameModeChartData = gameModeStats.map(stat => ({
    mode: stat.mode.replace(' Mode', ''),
    avgScore: stat.averageScore
  }));

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
                  <p className="text-muted-foreground">Welcome back, {data?.name}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={downloadReport}
                  className="bg-gradient-primary hover:shadow-glow gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Report
                </Button>
                <Button 
                  onClick={() => setQrOpen(true)} 
                  className="bg-green-600 hover:bg-green-700 gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  Generate QR
                </Button>
              </div>
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
              {/* Reaction Time Trend */}
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

            {/* Game History */}
            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-gradient-card border-primary/20">
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
            </div>
          </div>
        </main>
      </div>

      {/* QR Voucher Dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Play QR</DialogTitle>
          </DialogHeader>

          {!qrToken ? (
            <div className="space-y-4">
              <div>
                <Label>Number of Plays</Label>
                <Input 
                  type="text" 
                  value={plays} 
                  onChange={(e) => setPlays(Number(e.target.value))} 
                  min={1}
                />
              </div>
              <div>
                <Label>Amount Paid</Label>
                <Input 
                  type="text" 
                  value={amount} 
                  onChange={(e) => setAmount(Number(e.target.value))} 
                />
              </div>
              <DialogFooter>
                <Button onClick={generateVoucher} className="bg-gradient-primary">
                  Generate QR
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-muted-foreground">Scan this QR to start playing</p>
              <QRCode value={`http://192.168.0.116:8000/vouchers/${qrToken}`} size={200} />
              <Button variant="outline" onClick={() => { setQrToken(null); setQrOpen(false); }}>
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default IndividualDashboard;
