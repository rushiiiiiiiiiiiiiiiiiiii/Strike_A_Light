import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Target, BarChart3, Users, Brain, Trophy } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Navigation */}
      <nav className="border-b border-primary/20 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-background" />
              </div>
              <div>
                <h1 className="font-orbitron font-bold text-xl text-primary">Strike A Light</h1>
                <p className="text-xs text-muted-foreground">PACECON Technosys</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/login">
                <Button variant="outline" className="font-montserrat">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-primary hover:shadow-glow font-montserrat">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-orbitron text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-fade-in">
              Strike A Light
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 font-montserrat animate-fade-in">
              Revolutionary Gamified Neurotraining Platform
            </p>
            <p className="text-lg text-foreground/80 mb-12 max-w-2xl mx-auto leading-relaxed animate-slide-up">
              Train your reflexes, improve reaction time, and track your cognitive performance 
              with our cutting-edge gaming technology. Perfect for individuals, schools, gyms, 
              and therapy centers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in">
              <Link to="/register">
                <Button 
                  size="lg" 
                  className="bg-gradient-primary hover:shadow-glow font-orbitron text-lg px-8 py-6 animate-glow-pulse"
                >
                  Start Training Now
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="font-orbitron text-lg px-8 py-6 border-primary/30 hover:bg-primary/10"
                >
                  Access Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background/50">
        <div className="container mx-auto">
          <h2 className="font-orbitron text-4xl font-bold text-center mb-16 text-primary">
            Why Choose Strike A Light?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "Cognitive Enhancement",
                description: "Advanced algorithms track and improve your neural response patterns"
              },
              {
                icon: Target,
                title: "Precision Training",
                description: "Multiple game modes targeting specific cognitive skills and reflexes"
              },
              {
                icon: BarChart3,
                title: "Real-time Analytics",
                description: "Comprehensive performance tracking with detailed progress reports"
              },
              {
                icon: Users,
                title: "Institutional Support",
                description: "Perfect for schools, gyms, and therapy centers with group management"
              },
              {
                icon: Trophy,
                title: "Gamified Experience",
                description: "Engaging gameplay mechanics that make training fun and addictive"
              },
              {
                icon: Zap,
                title: "Instant Feedback",
                description: "Real-time performance metrics and immediate progress tracking"
              }
            ].map((feature, index) => (
              <Card 
                key={index} 
                className="bg-gradient-card border-primary/20 hover:shadow-glow transition-all duration-300 hover:scale-105"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-background" />
                  </div>
                  <CardTitle className="font-orbitron text-primary">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-foreground/70">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-orbitron text-4xl font-bold mb-6 text-primary">
              Ready to Level Up Your Mind?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of users who are already improving their cognitive performance 
              with Strike A Light's revolutionary neurotraining technology.
            </p>
            <Link to="/register">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:shadow-glow font-orbitron text-lg px-12 py-6"
              >
                Get Started Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/20 py-8 px-4 bg-background/80">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-background" />
            </div>
            <span className="font-orbitron font-bold text-primary">PACECON Technosys</span>
          </div>
          <p className="text-muted-foreground">
            © 2024 PACECON Technosys. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;