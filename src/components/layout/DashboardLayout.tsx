
import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Bell, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden text-muted-foreground hover:text-foreground transition-colors" />
              <h1 className="text-xl font-semibold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                {user?.role === 'teacher' ? 'Panel del Profesor' : 'Mi Aprendizaje'}
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-xl hover:bg-accent/60 transition-all duration-200 group">
                <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full shadow-sm animate-pulse"></span>
              </button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 bg-background/50">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
