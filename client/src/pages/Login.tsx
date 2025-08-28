import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/types/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("individual");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://192.168.0.108:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("userEmail", data.user?.email || "");
        localStorage.setItem("id", data.user?.id || "");
        localStorage.setItem("role", data.role);
        localStorage.setItem("isAuthenticated", "true");

        toast({ title: "Login Successful", description: `Welcome back, ${data.user?.name || "User"}!` });

        if (data.role === "individual") navigate("/dashboard/individual");
        else if (data.role === "institution") navigate("/dashboard/institution");
        else if (data.role === "super_admin") navigate("/dashboard/super-admin");
      } else {
        toast({ title: "Login Failed", description: data.error || "Invalid credentials.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Login Error", description: error.message || "Unexpected error.", variant: "destructive" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-hero">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-primary">
              <Zap className="w-7 h-7 text-background" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold font-orbitron text-primary">Strike A Light</h1>
              <p className="text-sm text-muted-foreground">PACECON Technosys</p>
            </div>
          </Link>
        </div>

        <Card className="bg-gradient-card border-primary/20 glow-effect">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-orbitron text-primary">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground">Sign in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="role">Login As</Label>
                <Select value={role} onValueChange={(v: UserRole) => setRole(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual User</SelectItem>
                    <SelectItem value="institution">Institution Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute transform -translate-y-1/2 right-3 top-1/2"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full py-4">Sign In</Button>

              <p className="text-center text-muted-foreground">
                Don't have an account? <Link to="/register" className="text-primary">Sign up here</Link>
              </p>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link to="/" className="text-muted-foreground hover:text-primary">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
