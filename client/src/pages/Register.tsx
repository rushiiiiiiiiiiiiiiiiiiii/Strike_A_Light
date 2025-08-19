import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCodeDisplay from '@/components/QRCodeDisplay';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'individual',
    institutionName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    let body: any = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
    };

    if (formData.role === 'individual') {
      body.role = 'student';
    } else {
      body.role = 'admin';
      body.institutionName = formData.institutionName;
    }

    const res = await fetch('http://192.168.0.108:8000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.ok) {
      if (formData.role === 'individual') {
        // ✅ Show QR code for individual users
        setRegisteredUser({
          id: data.userId,
          name: formData.name,
        });
      } else {
        // ✅ Institution: No QR, go to dashboard
        toast({
          title: 'Registration Successful',
          description: 'Institution account created successfully!',
        });

        // Store institution info in localStorage (optional)
        localStorage.setItem("role", "institution");
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userEmail", data?.email || formData.email);

        navigate('/dashboard/institution');
      }
    } else {
      toast({
        title: 'Registration Failed',
        description: data.error || 'Please try again.',
        variant: 'destructive',
      });
    }
  } catch (error) {
    toast({
      title: 'Network Error',
      description: 'Could not connect to the server.',
      variant: 'destructive',
    });
  }
};

 const handleContinue = () => {
    if (formData.role === 'individual') navigate('/dashboard/individual');
    else navigate('/dashboard/institution');
  };

if (registeredUser && formData.role === 'individual') {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="font-orbitron text-3xl font-bold text-primary mb-4">
            Registration Complete!
          </h1>
          <p className="text-muted-foreground">
            Your QR code has been generated. Save or download it to access the gaming machine.
          </p>
        </div>

        <QRCodeDisplay
          data={{
            id: registeredUser.id,
            name: registeredUser.name,
            type: 'individual',
            assignedPlays: 1,
          }}
        />

        <div className="text-center mt-8">
          <Button
            onClick={() => navigate('/dashboard/individual')}
            className="bg-gradient-primary hover:shadow-glow font-orbitron text-lg px-8 py-3"
          >
            Continue to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

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
            <CardTitle className="font-orbitron text-2xl text-primary">Create Account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Join Strike A Light and start your neurotraining journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role" className="font-montserrat">Account Type</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger className="bg-background/50 border-primary/30">
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
                <Label htmlFor="name" className="font-montserrat">
                  {formData.role === 'institution' ? 'Admin Name' : 'Full Name'}
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  className="bg-background/50 border-primary/30 focus:border-primary"
                  required
                />
              </div>

              {/* Institution Name */}
              {formData.role === 'institution' && (
                <div className="space-y-2">
                  <Label htmlFor="institutionName" className="font-montserrat">Institution Name</Label>
                  <Input
                    id="institutionName"
                    type="text"
                    value={formData.institutionName}
                    onChange={(e) => setFormData(prev => ({ ...prev, institutionName: e.target.value }))}
                    placeholder="e.g., Tech High School, Fitness Plus Gym"
                    className="bg-background/50 border-primary/30 focus:border-primary"
                    required
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="font-montserrat">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@example.com"
                  className="bg-background/50 border-primary/30 focus:border-primary"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="font-montserrat">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Create a strong password"
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

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:shadow-glow font-orbitron text-lg py-6"
              >
                Create Account
              </Button>

              {/* Link to Login */}
              <div className="text-center">
                <p className="text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:text-secondary transition-colors">
                    Sign in here
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

export default Register;
