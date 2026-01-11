import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { PageTransition } from "@/components/PageTransition";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <PageTransition>
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md w-full">
          <div className="bg-card rounded-2xl border border-border p-8 lg:p-12 text-center">
            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl lg:text-5xl">🔍</span>
            </div>
            <h1 className="mb-2 text-5xl lg:text-6xl font-bold">404</h1>
            <p className="mb-6 text-lg text-muted-foreground">Oops! Page not found</p>
            <a 
              href="/" 
              className="inline-flex items-center justify-center h-12 px-8 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors"
            >
              Return to Home
            </a>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default NotFound;
