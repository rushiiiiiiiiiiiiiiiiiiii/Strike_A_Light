import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Eye, EyeOff } from 'lucide-react';
import { UserRole } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('individual');
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const res = await fetch('http://192.168.0.110:8000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error('Invalid server response');
    }

    if (res.ok && data.success) {
      // Store role and user info in localStorage
   
      localStorage.setItem("userEmail", data.user?.email || "");

      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user?.name || 'User'}!`,
      });

      // Redirect based on role
      if (data.role === 'individual') {
        navigate('/dashboard/individual');
      } else if (data.role === 'institution') {
        navigate('/dashboard/institution');
      } else if (data.role === 'super_admin') {
        navigate('/admin');
      }
    } else {
      toast({
        title: "Login Failed",
        description: data.error || "Invalid credentials.",
        variant: "destructive",
      });
    }
  } catch (error) {
    toast({
      title: "Login Error",
      description: error.message || "Unexpected error.",
      variant: "destructive",
    });
  }
};

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="w-7 h-7 text-background" />
            </div>
            <div className="text-left">
              <h1 className="font-orbitron font-bold text-2xl text-primary">Strike A Light</h1>
              <p className="text-sm text-muted-foreground">PACECON Technosys</p>
            </div>
          </Link>
        </div>

        <Card className="bg-gradient-card border-primary/20 glow-effect">
          <CardHeader className="text-center">
            <CardTitle className="font-orbitron text-2xl text-primary">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="role" className="font-montserrat">Login As</Label>
                <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                  <SelectTrigger className="bg-background/50 border-primary/30">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual User</SelectItem>
                    <SelectItem value="institution">Institution Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-montserrat">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="bg-background/50 border-primary/30 focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-montserrat">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="bg-background/50 border-primary/30 focus:border-primary pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:shadow-glow font-orbitron text-lg py-6"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>

              <div className="text-center">
                <p className="text-muted-foreground">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary hover:text-secondary transition-colors">
                    Sign up here
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link 
            to="/" 
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
