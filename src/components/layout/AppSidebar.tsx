
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  BookOpen,
  BarChart3,
  User,
  LogOut,
  GraduationCap,
  Settings,
  HelpCircle,
  CreditCard,
  UserCircle,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
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
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';

const teacherNavItems = [
  { title: 'Clases', url: '/', icon: Calendar },
  { title: 'Estudiantes', url: '/students', icon: Users },
];

const studentNavItems = [
  { title: 'Dashboard', url: '/student', icon: LayoutDashboard },
  { title: 'Deberes y Resúmenes', url: '/student/homework', icon: BookOpen },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const handleNavigate = (path: string) => {
    navigate(path);
    setIsProfileOpen(false);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  if (!user) return null;

  const navItems = user.role === 'teacher' ? teacherNavItems : studentNavItems;
  
  const getNavClassName = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? 'bg-primary/10 text-primary border-primary/20 shadow-sm' 
      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground border-transparent';

  return (
    <Sidebar className="w-64 border-r border-border/50 bg-sidebar backdrop-blur-sm">
      <SidebarHeader className="border-b border-border/50 p-6">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 w-full hover:bg-accent/60 rounded-xl p-3 -m-3 transition-all duration-200 group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg group-hover:shadow-xl transition-all">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div className="text-left">
            <h2 className="font-bold text-xl bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">EduTranscribe</h2>
            <p className="text-sm text-muted-foreground capitalize font-medium">{user.role}</p>
          </div>
        </button>
      </SidebarHeader>

      <SidebarContent className="p-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider mb-4 px-3">
            Navegación
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={`${getNavClassName} rounded-xl p-3 border transition-all duration-200 flex items-center gap-3 font-medium`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-6">
        <div className="relative" ref={dropdownRef}>
          {/* Profile Button - Clickeable */}
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 w-full p-3 hover:bg-accent/60 rounded-xl transition-all duration-200 group"
          >
            <img 
              src={user.avatar} 
              alt={user.name}
              className="h-11 w-11 rounded-xl ring-2 ring-border group-hover:ring-primary/30 transition-all shadow-sm"
            />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <div className="text-muted-foreground group-hover:text-foreground transition-colors">
              {isProfileOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-3 bg-card/95 backdrop-blur-sm rounded-xl shadow-card-hover border border-border/50 z-50 overflow-hidden">
              {/* User Info Header */}
              <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/30">
                <div className="flex items-center gap-3">
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="h-12 w-12 rounded-xl ring-2 ring-primary/20 shadow-sm"
                  />
                  <div>
                    <h3 className="font-semibold text-foreground">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-lg mt-1">
                      {user.role === 'teacher' ? 'Profesor' : 'Estudiante'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu Options */}
              <div className="py-2">
                <button 
                  onClick={() => handleNavigate('/profile')}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-foreground hover:bg-accent/60 transition-colors"
                >
                  <UserCircle className="h-4 w-4 text-muted-foreground" />
                  <span>Mi Perfil</span>
                </button>
                
                {user.role === 'teacher' && (
                  <button 
                    onClick={() => handleNavigate('/billing')}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-foreground hover:bg-accent/60 transition-colors"
                  >
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>Facturación</span>
                  </button>
                )}
                
                <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-foreground hover:bg-accent/60 transition-colors">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  <span>Ayuda</span>
                </button>
                
                <div className="border-t border-border/50 my-1"></div>
                
                <button
                  onClick={logout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
