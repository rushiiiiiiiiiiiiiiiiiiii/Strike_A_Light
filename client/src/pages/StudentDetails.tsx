import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// -------- MOCK GAME HISTORY --------
const mockGameHistory = [
  { datetime: "2025-08-01 10:30 AM", mode: "Speed", score: 75, accuracy: 85, reactionTime: "320ms" },
  { datetime: "2025-08-02 05:15 PM", mode: "Accuracy", score: 80, accuracy: 90, reactionTime: "300ms" },
  { datetime: "2025-08-03 11:45 AM", mode: "Focus", score: 60, accuracy: 70, reactionTime: "410ms" },
  { datetime: "2025-08-04 04:00 PM", mode: "Speed", score: 85, accuracy: 88, reactionTime: "295ms" },
  { datetime: "2025-08-05 09:20 AM", mode: "Endurance", score: 70, accuracy: 75, reactionTime: "350ms" },
  { datetime: "2025-08-06 03:40 PM", mode: "Accuracy", score: 90, accuracy: 95, reactionTime: "280ms" },
];

interface Student {
  id: string;
  name: string;
  email: string;
  standard: string;
  division: string;
  roll_number: string;
  totalPlays: number;
  lastPlayed: string;
}

const StudentDetails = () => {
  const { id } = useParams();
  console.log(id)

  const navigate = useNavigate();

  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await axios.get(`http://192.168.0.108:8000/students/${id}`);
        setStudent(res.data);
        console.log(res.data)
      } catch (err) {
        console.error("Error fetching student:", err);
      }
    };
    fetchStudent();
  }, [id]);

  if (!student) {
    return <p className="p-6">Loading student details...</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      {/* Student Info */}
      <Card className="bg-gradient-card border-primary/20">
        <CardHeader>
          <CardTitle>{student.name}</CardTitle>
          <CardDescription>
            Roll {student.roll_number} - Std {student.standard} {student.division}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Email: {student.email}</p>
          <p>Total Plays: {student.totalPlays ?? 0}</p>
          <p>Last Played: {student.lastPlayed ?? "N/A"}</p>
        </CardContent>
      </Card>

      {/* Performance Graph (Mock Data) */}
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

      {/* Game History (Mock Data) */}
      <Card className="bg-gradient-card border-primary/20">
        <CardHeader>
          <CardTitle>Game History</CardTitle>
          <CardDescription>Recent games played</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {mockGameHistory.map((game, idx) => (
              <li key={idx} className="p-3 border rounded bg-background/30 text-sm space-y-1">
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
