import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Target, Clock, BarChart3, Download } from "lucide-react";

// -------- MOCK GAME HISTORY --------
const mockGameHistory = [
  { datetime: "2025-08-01 10:30 AM", mode: "Speed", score: 75, accuracy: 85, reactionTime: "320ms" },
  { datetime: "2025-08-02 05:15 PM", mode: "Accuracy", score: 80, accuracy: 90, reactionTime: "300ms" },
  { datetime: "2025-08-03 11:45 AM", mode: "Focus", score: 60, accuracy: 70, reactionTime: "410ms" },
  { datetime: "2025-08-04 04:00 PM", mode: "Speed", score: 85, accuracy: 88, reactionTime: "295ms" },
  { datetime: "2025-08-05 09:20 AM", mode: "Endurance", score: 70, accuracy: 75, reactionTime: "350ms" },
  { datetime: "2025-08-06 03:40 PM", mode: "Accuracy", score: 90, accuracy: 95, reactionTime: "280ms" },
];

interface User {
  id: string;
  name: string;
  email: string;
  standard?: string;
  division?: string;
  roll_number?: string;
  totalPlays?: number;
  lastPlayed?: string;
}

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://192.168.0.108:8000/studentsdata/${id}`);
        setUser(res.data);
      } catch (err1) {
        try {
          const res2 = await axios.get(`http://192.168.0.108:8000/userdata/${id}`);
          setUser(res2.data);
        } catch (err2) {
          console.error("User not found in both tables");
        }
      }
    };
    fetchUser();
  }, [id]);

  if (!user) {
    return <p className="p-6">Loading user details...</p>;
  }

  // -------- Stats (calculated from mockGameHistory for now) --------
  const totalPlays = mockGameHistory.length;
  const bestScore = Math.max(...mockGameHistory.map((g) => g.score));
  const avgReactionTime =
    mockGameHistory.reduce(
      (sum, g) => sum + parseInt(g.reactionTime.replace("ms", "")),
      0
    ) /
    mockGameHistory.length /
    1000;
  const avgAccuracy =
    mockGameHistory.reduce((sum, g) => sum + g.accuracy, 0) /
    mockGameHistory.length;

  // -------- Download PDF Report --------
const downloadReport = () => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text("Student Performance Report", 14, 20);

  // Student Info
  doc.setFontSize(12);
  doc.text(`Name: ${user.name}`, 14, 35);
  doc.text(`Email: ${user.email}`, 14, 42);
  if (user.roll_number) {
    doc.text(`Roll No: ${user.roll_number}`, 14, 49);
    doc.text(`Standard: ${user.standard || ""} ${user.division || ""}`, 14, 56);
  } else {
    doc.text("Individual User", 14, 49);
  }

  // Stats Summary
  doc.setFontSize(14);
  doc.text("Stats Summary", 14, 70);
  doc.setFontSize(12);
  doc.text(`Total Plays: ${totalPlays}`, 14, 78);
  doc.text(`Best Score: ${bestScore}`, 14, 85);
  doc.text(`Avg Reaction Time: ${avgReactionTime.toFixed(2)}s`, 14, 92);
  doc.text(`Accuracy: ${avgAccuracy.toFixed(1)}%`, 14, 99);

  // ✅ FIXED: use autoTable(doc, {...}) instead of doc.autoTable
  autoTable(doc, {
    startY: 110,
    head: [["Date & Time", "Mode", "Score", "Accuracy", "Reaction Time"]],
    body: mockGameHistory.map((g) => [
      g.datetime,
      g.mode,
      g.score,
      g.accuracy + "%",
      g.reactionTime,
    ]),
    theme: "grid",
    headStyles: { fillColor: [139, 92, 246] },
  });

  doc.save(`${user.name}_Report.pdf`);
};


  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <Button
          onClick={downloadReport}
          className="flex items-center gap-2 text-white bg-primary hover:bg-primary/90"
        >
          <Download className="w-4 h-4" /> Download Report
        </Button>
      </div>

      {/* User Info */}
      <Card className="bg-gradient-card border-primary/20">
        <CardHeader>
          <CardTitle>{user.name}</CardTitle>
          <CardDescription>
            {user.roll_number
              ? `Roll ${user.roll_number} - Std ${user.standard + "th" || ""} ${user.division  || ""}`
              : "Individual User"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Email: {user.email}</p>
          <p>Total Plays: {user.totalPlays ?? 0}</p>
          <p>Last Played: {user.lastPlayed ?? "N/A"}</p>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-card border-primary/20 glow-effect">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
            <Trophy className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary font-orbitron">{totalPlays}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-primary/20 glow-effect">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Best Score</CardTitle>
            <Target className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary font-orbitron">{bestScore}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-primary/20 glow-effect">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Avg Reaction Time</CardTitle>
            <Clock className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary font-orbitron">{avgReactionTime.toFixed(2)}s</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-primary/20 glow-effect">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <BarChart3 className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary font-orbitron">{avgAccuracy.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Graph */}
      <Card className="bg-gradient-card border-primary/20">
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
          <CardDescription>Weekly game scores</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockGameHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="datetime" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #8B5CF6" }} />
              <Line type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Game History */}
      <Card className="bg-gradient-card border-primary/20">
        <CardHeader>
          <CardTitle>Game History</CardTitle>
          <CardDescription>Recent games played</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {mockGameHistory.map((game, idx) => (
              <li key={idx} className="p-3 space-y-1 text-sm border rounded bg-background/30">
                <div><strong>Date & Time:</strong> {game.datetime}</div>
                <div><strong>Mode:</strong> {game.mode}</div>
                <div><strong>Score:</strong> {game.score}</div>
                <div><strong>Accuracy:</strong> {game.accuracy}%</div>
                <div><strong>Reaction Time:</strong> {game.reactionTime}</div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDetails;
