import { useState } from "react";
import { NavLink, redirect, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Trophy, 
  BarChart3, 
  FileText, 
  User, 
  LogOut,
  Users,
  Settings,
  Zap
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const DashboardSidebar = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const redirect = useNavigate()

  const getMenuItems = () => {
    const commonItems = [
      { title: "Dashboard", icon: LayoutDashboard, url: "#dashboard" },
      // { title: "Analytics", icon: BarChart3, url: "#analytics" },
      { title: "Reports", icon: FileText, url: "#reports" },
      { title: "Profile", icon: User, url: "#profile" },
    ];

    if (user?.role === 'individual') {
      return [
        ...commonItems.slice(0, 1), // Dashboard
        { title: "My Scores", icon: Trophy, url: "#scores" },
        ...commonItems.slice(1), // Analytics, Reports, Profile
      ];
    }

    if (user?.role === 'institution') {
      return [
        ...commonItems.slice(0, 1), // Dashboard
        { title: "Students", icon: Users, url: "#students" },
        ...commonItems.slice(1), // Analytics, Reports, Profile
      ];
    }

    if (user?.role === 'super_admin') {
      return [
        ...commonItems.slice(0, 1), // Dashboard
        { title: "Institutions", icon: Users, url: "#institutions" },
        { title: "All Users", icon: User, url: "#users" },
        { title: "Settings", icon: Settings, url: "#settings" },
        ...commonItems.slice(1, -1), // Analytics, Reports (exclude Profile)
      ];
    }

    return commonItems;
  };

  const menuItems = getMenuItems();
  const logout = ()=>{
    sessionStorage.clear();
    redirect('/login')
  }
  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} bg-sidebar border-r border-primary/20`}>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-background" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-orbitron font-bold text-primary">Strike A Light</h2>
              <p className="text-xs text-muted-foreground">PACECON Technosys</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-orbitron text-primary">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a 
                      href={item.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-sidebar-accent hover:text-primary group"
                    >
                      <item.icon className="w-5 h-5 group-hover:text-primary transition-colors" />
                      {!collapsed && (
                        <span className="font-medium">{item.title}</span>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button
                    onClick={logout}
                    variant="ghost"
                    className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="w-5 h-5" />
                    {!collapsed && <span>Logout</span>}
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;