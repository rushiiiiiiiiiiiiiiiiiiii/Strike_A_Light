import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserPlus, QrCode, Download, Trash2, Building } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const InstitutionDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [students, setStudents] = useState<any[]>([]);
  const [data, setData] = useState<any>(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showQRCode, setShowQRCode] = useState<any>(null);
  const [qrFormStudent, setQrFormStudent] = useState<any>(null);
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    standard: "",
    division: "",
    rollNumber: "",
  });
  const [qrForm, setQrForm] = useState({ plays: 0, amount: 0 });

  const institutionId = localStorage.getItem("id");

  // Fetch students
  const fetchStudents = async () => {
    try {
      if (!institutionId) return;
      const res = await axios.get(
        `http://192.168.0.108:8000/students/${institutionId}`
      );
      setStudents(res.data);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to fetch students.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [user]);

  

  // Add student
  const handleAddStudent = async () => {
    if (
      !newStudent.name ||
      !newStudent.email ||
      !newStudent.standard ||
      !newStudent.division ||
      !newStudent.rollNumber
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await axios.post(`http://192.168.0.108:8000/students`, {
        ...newStudent,
        institutionId: institutionId || "inst1",
      });
      setStudents([res.data, ...students]);
      setNewStudent({
        name: "",
        email: "",
        standard: "",
        division: "",
        rollNumber: "",
      });
      setShowAddStudent(false);

      toast({
        title: "Student Added",
        description: `${res.data.name} has been added successfully.`,
      });
    } catch (error) {
      console.error("Error adding student:", error);
      toast({
        title: "Error",
        description: "Failed to add student.",
        variant: "destructive",
      });
    }
  };

  // Remove student
  const handleRemoveStudent = async (studentId: string) => {
    try {
      await axios.delete(`http://192.168.0.108:8000/students/${studentId}`);
      setStudents(students.filter((s) => s.id !== studentId));
      toast({
        title: "Student Removed",
        description: "Student has been removed from the institution.",
      });
    } catch (error) {
      console.error("Error removing student:", error);
      toast({
        title: "Error",
        description: "Failed to remove student.",
        variant: "destructive",
      });
    }
  };

  // QR
  const openGenerateQR = (student: any) => {
    setQrFormStudent(student);
    setQrForm({ plays: 0, amount: 0 });
  };

  const handleGenerateQR = () => {
    if (!qrFormStudent) return;

    setShowQRCode({
      plays: qrForm.plays,          // 👈 plays instead of id
      name: qrFormStudent.name,
      email: qrFormStudent.email,
      type: "student",
      amountPaid: qrForm.amount,
    });

    setQrFormStudent(null);
  };

  const totalStudents = students.length;
  const totalPlaysUsed = students.reduce(
    (sum, s) => sum + (s.total_plays || 0),
    0
  );
  const activeStudents = students.filter((s) => {
    const lastPlayed = s.last_played ? new Date(s.last_played) : null;
    if (!lastPlayed) return false;
    const daysSinceLastPlay = Math.floor(
      (Date.now() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceLastPlay <= 7;
  }).length;


  // Institution details
  useEffect(() => {
    const getdata = async () => {
      try {
        const studata = await axios.get(
          `http://192.168.0.108:8000/instdata/${institutionId}`
        );
        setData(studata.data[0]);
        console.log(studata.data)
      } catch (err) {
        console.error("Error fetching Institution Data:", err);
        toast({
          title: "Error",
          description: "Failed to fetch Institution Data.",
          variant: "destructive",
        });
      }
    };
    getdata();
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col lg:flex-row w-full bg-gradient-hero">
        <DashboardSidebar />

        <main className="flex-1 overflow-hidden">
          {/* Header */}
          <header className="border-b border-primary/20 bg-background/80 backdrop-blur-lg p-4 sticky top-0 z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center shadow-md">
                    <Building className="w-6 h-6 text-background" />
                  </div>
                  <div>
                    <h1 className="font-orbitron text-2xl sm:text-3xl font-bold text-primary">
                      {data?.institution_name || "Institution Dashboard"}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                      Admin: {data?.institution_name}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button
                  onClick={() => setShowAddStudent(true)}
                  className="bg-gradient-secondary hover:shadow-neon gap-2 w-full sm:w-auto"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Student
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 w-full sm:w-auto border-primary/40"
                >
                  <Download className="w-4 h-4" />
                  Export Report
                </Button>
              </div>
            </div>
          </header>

          {/* Stats */}
          <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-80px)]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-card border-primary/20 hover:shadow-xl transition">
                <CardHeader>
                  <CardTitle>Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {totalStudents}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-primary/20 hover:shadow-xl transition">
                <CardHeader>
                  <CardTitle>Total Plays Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {totalPlaysUsed}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-primary/20 hover:shadow-xl transition">
                <CardHeader>
                  <CardTitle>Active Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {activeStudents}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Students Table */}
            <Card className="bg-gradient-card border-primary/20">
              <CardHeader>
                <CardTitle className="font-orbitron text-xl text-primary">
                  Students
                </CardTitle>
                <CardDescription>
                  Manage your students and generate QR codes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-background/30 rounded-lg border border-primary/10 hover:border-primary/30 transition"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-primary">
                          {student.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {student.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Std {student.standard} - Div {student.division} | Roll{" "}
                          {student.roll_number}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openGenerateQR(student)}
                        >
                          <QrCode className="w-4 h-4" /> QR
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            navigate(`/students/${student.id}`)
                          }
                        >
                          View
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

      {/* Add Student Modal */}
      <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
        <DialogContent className="bg-gradient-card border-primary/20">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Student Name</Label>
            <Input
              value={newStudent.name}
              onChange={(e) =>
                setNewStudent({ ...newStudent, name: e.target.value })
              }
            />
            <Label>Email</Label>
            <Input
              value={newStudent.email}
              onChange={(e) =>
                setNewStudent({ ...newStudent, email: e.target.value })
              }
            />
            <Label>Standard</Label>
            <Input
              value={newStudent.standard}
              onChange={(e) =>
                setNewStudent({ ...newStudent, standard: e.target.value })
              }
            />
            <Label>Division</Label>
            <Input
              value={newStudent.division}
              onChange={(e) =>
                setNewStudent({ ...newStudent, division: e.target.value })
              }
            />
            <Label>Roll Number</Label>
            <Input
              value={newStudent.rollNumber}
              onChange={(e) =>
                setNewStudent({ ...newStudent, rollNumber: e.target.value })
              }
            />
            <Button
              onClick={handleAddStudent}
              className="w-full bg-gradient-primary hover:shadow-neon"
            >
              Add Student
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generate QR Modal */}
      <Dialog open={!!qrFormStudent} onOpenChange={() => setQrFormStudent(null)}>
        <DialogContent className="bg-gradient-card border-primary/20">
          <DialogHeader>
            <DialogTitle>
              Generate QR for {qrFormStudent?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Number of Plays</Label>
            <Input
              type="number"
              value={qrForm.plays}
              onChange={(e) =>
                setQrForm({ ...qrForm, plays: parseInt(e.target.value) || 0 }) // ✅ fix for NaN
              }
            />
            <Label>Amount Paid</Label>
            <Input
              type="number"
              value={qrForm.amount}
              onChange={(e) =>
                setQrForm({ ...qrForm, amount: parseInt(e.target.value) || 0 })
              }
            />
            <Button
              onClick={handleGenerateQR}
              className="w-full bg-gradient-primary hover:shadow-neon"
            >
              Generate
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Display Modal */}
      {showQRCode && (
        <Dialog open={!!showQRCode} onOpenChange={() => setShowQRCode(null)}>
          <DialogContent className="max-w-md bg-gradient-card border-primary/20">
            <DialogHeader>
              <DialogTitle>Student QR Code</DialogTitle>
            </DialogHeader>
            <QRCodeDisplay data={showQRCode} />
          </DialogContent>
        </Dialog>
      )}
    </SidebarProvider>
  );
};

export default InstitutionDashboard;
