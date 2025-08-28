import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Trophy, Target, Clock, BarChart3, Download, QrCode } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useMockData } from "@/hooks/useMockData";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCodeDisplay from "@/components/QRCodeDisplay"; // New QR component
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const IndividualDashboard = () => {
  const { user } = useAuth();
  const { mockGameRecords, generatePerformanceData, gameModeStats } = useMockData();
  const performanceData = generatePerformanceData();

  const totalPlays = mockGameRecords.length;
  const bestScore = Math.max(...mockGameRecords.map(record => record.score));
  const avgReactionTime = (mockGameRecords.reduce((sum, r) => sum + r.reactionTime, 0) / totalPlays).toFixed(2);
  const avgAccuracy = Math.round(mockGameRecords.reduce((sum, r) => sum + r.accuracy, 0) / totalPlays);

  const [data, setData] = useState<any>(null);
  const id = localStorage.getItem("id");

  // QR Voucher states
  const [qrOpen, setQrOpen] = useState(false);
  const [plays, setPlays] = useState(1);
  const [amount, setAmount] = useState(0);
  const [qrData, setQrData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://192.168.0.108:8000/userdata/${id}`);
        setData(res.data);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    fetchData();
  }, [id]);

  const downloadReport = () => {
    if (!data) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Individual Performance Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`Name: ${data.name}`, 14, 35);
    doc.text(`Email: ${data.email}`, 14, 42);
    doc.setFontSize(14);
    doc.text("Stats Summary", 14, 60);
    doc.setFontSize(12);
    doc.text(`Total Plays: ${totalPlays}`, 14, 70);
    doc.text(`Best Score: ${bestScore}`, 14, 78);
    doc.text(`Avg Reaction Time: ${avgReactionTime}s`, 14, 86);
    doc.text(`Accuracy: ${avgAccuracy}%`, 14, 94);

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

  const generateVoucher = async () => {
    try {
      const res = await axios.post("http://192.168.0.108:8000/vouchers", {
        userId: id,
        userType: "individual",
        institutionId: data?.institution_id || null,
        name: data?.name,
        assignedPlays: plays,
        amountPaid: amount,
        expiresInMinutes: 30
      });
      setQrData({ ...res.data, assignedPlays: plays, amountPaid: amount });
    } catch (err) {
      console.error("Error creating voucher:", err);
    }
  };

  const reactionTimeData = performanceData.dates.map((date, index) => ({
    date,
    reactionTime: parseFloat(performanceData.reactionTimes[index])
  }));

  const gameModeChartData = gameModeStats.map(stat => ({
    mode: stat.mode.replace(" Mode", ""),
    avgScore: stat.averageScore
  }));

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen bg-gradient-hero">
        <DashboardSidebar />
        <main className="flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b border-primary/20 bg-background/80 backdrop-blur-lg">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold font-orbitron text-primary">Individual Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {data?.name}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={downloadReport} className="gap-2 bg-gradient-primary hover:shadow-glow">
                <Download className="w-4 h-4" /> Download Report
              </Button>
              <Button onClick={() => setQrOpen(true)} className="gap-2 bg-green-600 hover:bg-green-700">
                <QrCode className="w-4 h-4" /> Generate QR
              </Button>
            </div>
          </header>

          <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-80px)]">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[{title:"Total Plays", value:totalPlays, icon:<Trophy className="w-4 h-4 text-secondary"/>},
                {title:"Best Score", value:bestScore, icon:<Target className="w-4 h-4 text-accent"/>},
                {title:"Avg Reaction Time", value:`${avgReactionTime}s`, icon:<Clock className="w-4 h-4 text-secondary"/>},
                {title:"Accuracy", value:`${avgAccuracy}%`, icon:<BarChart3 className="w-4 h-4 text-accent"/>}].map((card,i)=>(
                <Card key={i} className="bg-gradient-card border-primary/20 glow-effect">
                  <CardHeader className="flex justify-between pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    {card.icon}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary font-orbitron">{card.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
                      <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #00D4FF', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="reactionTime" stroke="#00D4FF" strokeWidth={3} dot={{ fill: '#00D4FF', strokeWidth: 2, r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

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
                      <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #39FF14', borderRadius: '8px' }} />
                      <Bar dataKey="avgScore" fill="#39FF14" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Games */}
            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-gradient-card border-primary/20">
                <CardHeader>
                  <CardTitle className="font-orbitron text-primary">Recent Games</CardTitle>
                  <CardDescription>Your latest game sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockGameRecords.slice(0, 5).map(record => (
                      <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg bg-background/30 border-primary/10">
                        <div>
                          <div className="text-lg font-orbitron text-primary">{record.score}</div>
                          <div className="text-xs text-muted-foreground">{record.gameMode}</div>
                          <div className="text-xs text-muted-foreground">{record.playedAt.toLocaleDateString()} • {record.accuracy}% • {record.reactionTime}s</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* QR Voucher Dialog */}
          <Dialog open={qrOpen} onOpenChange={setQrOpen}>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Generate Play Voucher QR</DialogTitle>
              </DialogHeader>

              {!qrData ? (
                <div className="space-y-6">
  <div className="grid grid-cols-1 gap-4">
    <div className="flex flex-col">
      <Label className="pb-3">Number of Plays</Label>
      <Input
        type="text"
        value={plays}
        onChange={(e) => setPlays(Number(e.target.value))}
        min={1}
      />
    </div>
    <div className="flex flex-col">
      <Label>Amount Paid</Label>
      <Input
        type="text"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        // min={0}
      />
    </div>
  </div>

  <div className="text-sm text-muted-foreground">
    The voucher will expire in 30 minutes.
  </div>

  <DialogFooter className="flex justify-end">
    <Button
      onClick={generateVoucher}
      className="gap-2 bg-gradient-primary hover:shadow-glow"
    >
      <QrCode className="w-4 h-4" /> Generate QR
    </Button>
  </DialogFooter>
</div>

              ) : (
                <div className="flex flex-col items-center gap-6">
                  <QRCodeDisplay data={qrData} />
                  <Button onClick={() => { setQrData(null); setQrOpen(false); }} className="w-full mt-4 sm:w-auto">
                    Close
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default IndividualDashboard;
