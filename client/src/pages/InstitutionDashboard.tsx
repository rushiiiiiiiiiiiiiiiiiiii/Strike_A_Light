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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  UserPlus,
  QrCode,
  Trash2,
  Building2Icon,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  const [deleteConfirmStudent, setDeleteConfirmStudent] = useState<any>(null);

  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    standard: "",
    division: "",
    rollNumber: "",
  });

  const [qrForm, setQrForm] = useState({ plays: "", amount: "" });

  const institutionId = localStorage.getItem("id");

  // Fetch students
  const fetchStudents = async () => {
    try {
      if (!institutionId) return;
      const res = await axios.get(
        `http://192.168.0.116:8000/students/${institutionId}`
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
      const res = await axios.post(`http://192.168.0.116:8000/students`, {
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

  // Delete student
  const confirmRemoveStudent = (student: any) => {
    setDeleteConfirmStudent(student);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmStudent) return;
    try {
      await axios.delete(
        `http://192.168.0.116:8000/students/${deleteConfirmStudent.id}`
      );
      setStudents(students.filter((s) => s.id !== deleteConfirmStudent.id));
      toast({
        title: "Student Removed",
        description: `${deleteConfirmStudent.name} has been removed.`,
      });
    } catch (error) {
      console.error("Error removing student:", error);
      toast({
        title: "Error",
        description: "Failed to remove student.",
        variant: "destructive",
      });
    }
    setDeleteConfirmStudent(null);
  };

  // QR
  const openGenerateQR = (student: any) => {
    setQrFormStudent(student);
    setQrForm({ plays: "", amount: "" });
  };

  const handleGenerateQR = () => {
    if (!qrFormStudent) return;

    setShowQRCode({
      id: qrFormStudent.id,
      name: qrFormStudent.name,
      email: qrFormStudent.email,
      type: "student",
      assignedPlays: Number(qrForm.plays) || 0,
      amountPaid: Number(qrForm.amount) || 0,
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
          `http://192.168.0.116:8000/instdata/${institutionId}`
        );
        setData(studata.data[0]);
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

  // Group students by Standard & Division
  const groupedStudents = students.reduce((acc, student) => {
    const stdKey = `Std ${student.standard}`;
    const divKey = `Div ${student.division || "-"}`;

    if (!acc[stdKey]) acc[stdKey] = {};
    if (!acc[stdKey][divKey]) acc[stdKey][divKey] = [];
    acc[stdKey][divKey].push(student);

    return acc;
  }, {} as Record<string, Record<string, any[]>>);

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
                    <Building2Icon className="w-6 h-6 text-background" />
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

            {/* Students Grouped */}
            <Card className="bg-gradient-card border-primary/20">
              <CardHeader>
                <CardTitle className="font-orbitron text-xl text-primary">
                  Students by Class
                </CardTitle>
                <CardDescription>
                  Manage students grouped by Standard & Division
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="space-y-4">
                  {Object.entries(groupedStudents).map(([std, divisions]) => (
                    <AccordionItem key={std} value={std}>
                      <AccordionTrigger className="font-bold text-primary">
                        {std}
                      </AccordionTrigger>
                      <AccordionContent>
                        {Object.entries(divisions).map(([div, studs]) => (
                          <div key={div} className="mb-4">
                            <h4 className="font-semibold text-secondary mb-2">{div}</h4>
                            <div className="space-y-2">
                              {studs.map((student) => (
                                <div
                                  key={student.id}
                                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 bg-background/30 rounded-lg border border-primary/10 hover:border-primary/30 transition"
                                >
                                  <div>
                                    <p className="font-medium text-primary">{student.name}</p>
                                    <p className="text-sm text-muted-foreground">{student.email}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Roll {student.roll_number}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
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
                                      onClick={() => navigate(`/students/${student.id}`)}
                                    >
                                      View
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => confirmRemoveStudent(student)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
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
              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
            />
            <Label>Email</Label>
            <Input
              value={newStudent.email}
              onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
            />
            <Label>Standard</Label>
            <Input
              value={newStudent.standard}
              onChange={(e) => setNewStudent({ ...newStudent, standard: e.target.value })}
            />
            <Label>Division</Label>
            <Input
              value={newStudent.division}
              onChange={(e) => setNewStudent({ ...newStudent, division: e.target.value })}
            />
            <Label>Roll Number</Label>
            <Input
              value={newStudent.rollNumber}
              onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
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
            <DialogTitle>Generate QR for {qrFormStudent?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Number of Plays</Label>
            <Input
              type="number"
              value={qrForm.plays}
              onChange={(e) => setQrForm({ ...qrForm, plays: parseInt(e.target.value) || 0 })}
            />
            <Label>Amount Paid</Label>
            <Input
              type="number"
              value={qrForm.amount}
              onChange={(e) => setQrForm({ ...qrForm, amount: parseInt(e.target.value) || 0 })}
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

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!deleteConfirmStudent}
        onOpenChange={() => setDeleteConfirmStudent(null)}
      >
        <DialogContent className="bg-gradient-card border-primary/20">
          <DialogHeader>
            <DialogTitle>Delete {deleteConfirmStudent?.name}?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to remove this student? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmStudent(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default InstitutionDashboard;
