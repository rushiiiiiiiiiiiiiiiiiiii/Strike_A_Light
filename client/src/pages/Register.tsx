import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'individual',
    institutionName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const body: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role === 'individual' ? 'student' : 'admin',
      };
      if (formData.role === 'institution') body.institutionName = formData.institutionName;

      const res = await fetch('http://192.168.0.108:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        toast({ title: 'Registration Successful', description: `Welcome ${formData.name}!` });
        navigate('/login'); // ✅ redirect to login only
      } else {
        toast({
          title: 'Registration Failed',
          description: data.error || 'Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Network Error',
        description: error.message || 'Could not connect to the server.',
        variant: 'destructive',
      });
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
            <CardTitle className="text-2xl font-orbitron text-primary">Create Account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Join Strike A Light
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role">Account Type</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual User</SelectItem>
                    <SelectItem value="institution">Institution Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">{formData.role === 'institution' ? 'Admin Name' : 'Full Name'}</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Institution Name */}
              {formData.role === 'institution' && (
                <div className="space-y-2">
                  <Label htmlFor="institutionName">Institution Name</Label>
                  <Input
                    id="institutionName"
                    type="text"
                    value={formData.institutionName}
                    onChange={(e) => setFormData(prev => ({ ...prev, institutionName: e.target.value }))}
                    placeholder="Enter institution name"
                    required
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Create a strong password"
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

              <Button type="submit" className="w-full py-4">Create Account</Button>

              <p className="text-center">
                Already have an account? <Link to="/login" className="text-primary">Sign in</Link>
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

export default Register;
