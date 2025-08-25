import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Trash2 } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [searchUser, setSearchUser] = useState("");
  const [searchInstitution, setSearchInstitution] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);

  const navigate = useNavigate();

  // Stats
  useEffect(() => {
    fetch("http://192.168.0.116:8000/super-admin/stats")
      .then((res) => res.json())
      .then(setStats);
  }, []);
const adminid = localStorage.getItem("id");
const [addata, setAddata] = useState<any>(null);

useEffect(() => {
  const getaddata = async () => {
    try {
      const res = await axios.get(`http://192.168.0.116:8000/admindata/${adminid}`);
      setAddata(res.data); // ✅ set resolved data
    } catch (err) {
      console.error("Error fetching admin data:", err);
    }
  };
  if (adminid) getaddata();
}, [adminid]);

  // Users
  useEffect(() => {
    fetch(`http://192.168.0.116:8000/super-admin/users?search=${searchUser}`)
      .then((res) => res.json())
      .then(setUsers);
  }, [searchUser]);

  // Institutions
  useEffect(() => {
    fetch(
      `http://192.168.0.116:8000/super-admin/institutions?search=${searchInstitution}`
    )
      .then((res) => res.json())
      .then(setInstitutions);
  }, [searchInstitution]);

  // Students of institution
  const loadStudents = (id: number) => {
    setSelectedInstitution(id);
    fetch(`http://192.168.0.116:8000/super-admin/institution/${id}/students`)
      .then((res) => res.json())
      .then(setStudents);
  };
  // Delete handler
  const handleDelete = async (type: "user" | "institution" | "student", id: number) => {
    try {
      await fetch(`http://192.168.0.116:8000/super-admin/${type}/${id}`, {
        method: "DELETE",
      });
      if (type === "user") setUsers((prev) => prev.filter((u) => u.id !== id));
      if (type === "institution") setInstitutions((prev) => prev.filter((i) => i.id !== id));
      if (type === "student") setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(`Failed to delete ${type}`, err);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white">
        <DashboardSidebar />
        <main className="flex-1 overflow-hidden">
      <header className="border-b border-primary/30 bg-background/80 backdrop-blur-lg p-4 flex items-center justify-between">
  {/* Left side: sidebar + title */}
  <div className="flex items-center gap-4">
    <SidebarTrigger />
    <div>
      <h1 className="font-orbitron text-3xl text-primary tracking-wide">
        Super Admin Dashboard
      </h1>
      <p className="text-sm text-muted-foreground">
        Super Admin: <span className="font-medium text-primary">{addata?.institution_name}</span>
      </p>
    </div>
  </div>

  {/* Right side (optional) → add avatar / logout button later */}
</header>

          <div className="p-6 space-y-8 overflow-y-auto h-[calc(100vh-80px)]">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-400/40 shadow-lg hover:shadow-purple-500/30 transition">
                <CardHeader>
                  <CardTitle>Total Institutions</CardTitle>
                </CardHeader>
                <CardContent className="text-4xl font-bold text-purple-400">
                  {stats.totalInstitutions || 0}
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-indigo-600/20 to-pink-600/20 border border-indigo-400/40 shadow-lg hover:shadow-pink-500/30 transition">
                <CardHeader>
                  <CardTitle>Total Users</CardTitle>
                </CardHeader>
                <CardContent className="text-4xl font-bold text-indigo-400">
                  {stats.totalUsers || 0}
                </CardContent>
              </Card>
            </div>

            {/* Users + Institutions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Users */}
              <Card className="bg-gradient-card border border-primary/20 shadow-lg">
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      className="pl-10 bg-background/50 border-primary/30"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {users
                      .filter((user) => user.role !== "super_admin")
                      .map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 bg-background/40 rounded-lg border border-primary/20 hover:bg-background/60 transition cursor-pointer"
                        >
                          <div onClick={() => navigate(`/student-details/${user.id}`)}>
                            <div className="font-medium text-primary">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="hover:text-red-500"
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete("user", user.id)}
                                >
                                  Yes, Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Institutions */}
              <Card className="bg-gradient-card border border-primary/20 shadow-lg">
                <CardHeader>
                  <CardTitle>All Institutions</CardTitle>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search institutions..."
                      value={searchInstitution}
                      onChange={(e) => setSearchInstitution(e.target.value)}
                      className="pl-10 bg-background/50 border-primary/30"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {institutions.map((inst) => (
                      <div
                        key={inst.id}
                        className="flex items-center justify-between p-3 bg-background/40 rounded-lg border border-primary/20 hover:bg-background/60 transition"
                      >
                        <div
                          onClick={() => loadStudents(inst.id)}
                          className="cursor-pointer"
                        >
                          <div className="font-medium text-primary">
                            {inst.institution_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {inst.email}
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="hover:text-red-500"
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Institution?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will also remove all related students.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete("institution", inst.id)}
                              >
                                Yes, Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Students of Institution */}
            {selectedInstitution && (
              <Card className="bg-gradient-card border border-primary/20 shadow-lg">
                <CardHeader>
                  <CardTitle>Students in Institution #{selectedInstitution}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {students.map((st) => (
                      <div
                        key={st.id}
                        className="flex items-center justify-between p-3 bg-background/40 rounded-lg border border-primary/20 hover:bg-background/60 transition"
                      >
                        <div
                          onClick={() => navigate(`/student-details/${st.id}`)}
                          className="cursor-pointer"
                        >
                          <div className="font-medium text-primary">{st.name}</div>
                          <div className="text-sm text-muted-foreground">{st.email}</div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="hover:text-red-500"
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Student?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete("student", st.id)}
                              >
                                Yes, Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default SuperAdminDashboard;
