
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Mic, BarChart3, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect authenticated users to their dashboard
  React.useEffect(() => {
    if (user) {
      navigate(user.role === 'teacher' ? '/classes' : '/student');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: <Mic className="h-8 w-8 text-primary" />,
      title: "Transcripción Automática",
      description: "Convierte tus clases habladas en texto de forma automática y precisa."
    },
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: "Gestión de Contenido",
      description: "Organiza y gestiona todo el contenido educativo de manera eficiente."
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Colaboración",
      description: "Facilita la colaboración entre profesores y estudiantes."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      title: "Análisis y Progreso",
      description: "Obtén insights sobre el progreso de aprendizaje de tus estudiantes."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-2xl font-bold text-primary">EduTranscribe</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/auth')}
              >
                Iniciar Sesión
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-primary hover:bg-primary/90"
              >
                Registrarse
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-foreground mb-6">
            Transforma tu enseñanza con
            <span className="text-primary block">inteligencia artificial</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            EduTranscribe convierte automáticamente tus clases habladas en contenido educativo estructurado, 
            facilitando la creación de materiales y el seguimiento del progreso estudiantil.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-primary hover:bg-primary/90 text-lg px-8 py-3"
            >
              Comenzar Gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-3"
            >
              Ver Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Características principales
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Todo lo que necesitas para mejorar tu experiencia educativa en una sola plataforma
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 bg-white/80 backdrop-blur-sm border-muted hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="bg-primary text-white p-8">
            <CardHeader>
              <CardTitle className="text-3xl font-bold mb-4">
                ¿Listo para transformar tu enseñanza?
              </CardTitle>
              <CardDescription className="text-primary-foreground/80 text-lg mb-6">
                Únete a miles de educadores que ya están usando EduTranscribe para mejorar su metodología de enseñanza.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate('/auth')}
                className="text-lg px-8 py-3"
              >
                Comenzar Ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-muted py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <BookOpen className="h-6 w-6 text-primary mr-2" />
              <span className="text-lg font-semibold text-primary">EduTranscribe</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 EduTranscribe. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
