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

  // 🔎 Search state

const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});


  const institutionId = localStorage.getItem("id");

  // Fetch students
  const fetchStudents = async () => {
    try {
      if (!institutionId) return;
      const res = await axios.get(
        `http://192.168.0.108:8000/students/${institutionId}`
      );
      setStudents(res.data);
      console.log(res.data.length);
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
  const totalPlaysUsed = 0;
  const activeStudents = 0;

  const handleSearchChange = (std: string, value: string) => {
  setSearchTerms((prev) => ({
    ...prev,
    [std]: value,
  }));
};

  // Delete student
  const confirmRemoveStudent = (student: any) => {
    setDeleteConfirmStudent(student);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmStudent) return;
    try {
      await axios.delete(
        `http://192.168.0.108:8000/students/${deleteConfirmStudent.id}`
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

  const handleGenerateQR = async () => {
    if (!qrFormStudent) return;

    try {
      const res = await axios.post("http://192.168.0.108:8000/vouchers", {
  userId: qrFormStudent.id,               // ✅ unified userId
  userType: "student",                    // ✅ must specify type
  institutionId: institutionId,
  name: qrFormStudent?.name,
  assignedPlays: Number(qrForm.plays),
  amountPaid: Number(qrForm.amount) || 0,
  expiresInMinutes: 60
});


      const voucher = res.data;

      setShowQRCode({
        name: qrFormStudent.name,
        type: "student",
        assignedPlays: voucher.assignedPlays,
        amountPaid: voucher.amountPaid,
        token: voucher.token, // ✅ pass token to QR
      });

      setQrFormStudent(null);
    } catch (err) {
      console.error("Error generating voucher:", err);
      toast({
        title: "Error",
        description: "Failed to generate QR",
        variant: "destructive",
      });
    }
  };

  // Institution details
  useEffect(() => {
    const getdata = async () => {
      try {
        const studata = await axios.get(
          `http://192.168.0.108:8000/instdata/${institutionId}`
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
      <div className="flex flex-col w-full min-h-screen lg:flex-row bg-gradient-hero">
        <DashboardSidebar />

        <main className="flex flex-col flex-1">
          {/* Header */}
          <header className="sticky top-0 z-10 p-4 border-b border-primary/20 bg-background/80 backdrop-blur-lg">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 shadow-md bg-gradient-secondary rounded-xl">
                    <Building2Icon className="w-6 h-6 text-background" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold font-orbitron sm:text-3xl text-primary">
                      {data?.institution_name || "Institution Dashboard"}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Admin: {data?.institution_name}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col w-full gap-3 sm:flex-row sm:w-auto">
                <Button
                  onClick={() => setShowAddStudent(true)}
                  className="w-full gap-2 bg-gradient-secondary hover:shadow-neon sm:w-auto"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Student
                </Button>
              </div>
            </div>
          </header>

          {/* Stats */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card className="transition bg-gradient-card border-primary/20 hover:shadow-xl">
                <CardHeader>
                  <CardTitle>Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {students.length}
                  </div>
                </CardContent>
              </Card>
              <Card className="transition bg-gradient-card border-primary/20 hover:shadow-xl">
                <CardHeader>
                  <CardTitle>Total Plays Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {totalPlaysUsed}
                  </div>
                </CardContent>
              </Card>
              <Card className="transition bg-gradient-card border-primary/20 hover:shadow-xl">
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
    {/* Students Grouped */}
<Card className="bg-gradient-card border-primary/20">
  <CardHeader>
    <CardTitle className="text-xl font-orbitron text-primary">
      Students by Class
    </CardTitle>
    <CardDescription>
      Manage students grouped by Standard & Division
    </CardDescription>
  </CardHeader>
  <CardContent>
    <Accordion type="multiple" className="space-y-4">
   {Object.entries(groupedStudents)
  .sort(([stdA], [stdB]) => {
    const numA = parseInt(stdA.replace("Std ", ""), 10);
    const numB = parseInt(stdB.replace("Std ", ""), 10);
    return numA - numB;
  })
  .map(([std, divisions]) => {
    // Get current search term for this standard
    const localSearch = searchTerms[std] || "";

    // Filter students in this standard
    const filteredDivisions = Object.entries(divisions).reduce(
      (acc, [div, studs]) => {
        const term = localSearch.toLowerCase();
        const filteredStuds = term
  ? studs.filter((s) =>
      [
        s.name,
        s.email,
        String(s.roll_number ?? s.rollNumber ?? ""),
        `div ${s.division}`,
      ]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(term))
    )
  : studs;

        if (filteredStuds.length > 0) acc[div] = filteredStuds;
        return acc;
      },
      {} as Record<string, any[]>
    );

    return (
      <AccordionItem key={std} value={std}>
        <AccordionTrigger className="font-bold text-primary">
          {std}
        </AccordionTrigger>
        <AccordionContent>
          {/* 🔎 Local Search Input */}
          <div className="mb-3">
            <Input
              placeholder={`Search within ${std}...`}
              value={localSearch}
              onChange={(e) => handleSearchChange(std, e.target.value)}
              className="w-full sm:w-1/2"
            />
          </div>

          {Object.entries(filteredDivisions)
            .sort(([divA], [divB]) => divA.localeCompare(divB))
            .map(([div, studs]) => (
              <div key={div} className="mb-4">
                <h4 className="mb-2 font-semibold text-secondary">
                  Division {div}
                </h4>
                <div className="space-y-2">
                  {studs
                    .sort(
                      (a, b) =>
                        (a.roll_number || 0) - (b.roll_number || 0)
                    )
                    .map((student) => (
                      <div
                        key={student.id}
                        className="flex flex-col items-start justify-between gap-4 p-3 transition border rounded-lg sm:flex-row sm:items-center bg-background/30 border-primary/10 hover:border-primary/30"
                      >
                        {/* Student Info */}
                        <div>
                          <p className="font-medium text-primary">
                            {student.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {student.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Roll {student.roll_number}
                          </p>
                        </div>

                        {/* Action Buttons */}
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
                            onClick={() =>
                              navigate(`/students/${student.id}`)
                            }
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              confirmRemoveStudent(student)
                            }
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
    );
  })}

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
            <DialogTitle>Generate QR for {qrFormStudent?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Number of Plays</Label>
            <Input
              type="number"
              value={qrForm.plays}
              onChange={(e) =>
                setQrForm({ ...qrForm, plays: parseInt(e.target.value) || 0 })
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
            Are you sure you want to remove this student? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmStudent(null)}
            >
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
