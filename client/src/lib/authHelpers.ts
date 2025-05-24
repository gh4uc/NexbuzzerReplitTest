
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export function useAuthRedirect() {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const requireAuth = (redirectTo = "/auth") => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this feature.",
        variant: "destructive",
      });
      setLocation(redirectTo);
      return false;
    }
    return true;
  };

  const requireGuest = (redirectTo = "/discover") => {
    if (isAuthenticated) {
      setLocation(redirectTo);
      return false;
    }
    return true;
  };

  const requireRole = (role: "user" | "model" | "admin", redirectTo = "/") => {
    if (!requireAuth()) return false;
    
    if (user?.role !== role) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      setLocation(redirectTo);
      return false;
    }
    return true;
  };

  const getDefaultRedirect = () => {
    if (!isAuthenticated) return "/";
    
    switch (user?.role) {
      case "admin":
        return "/admin";
      case "model":
        return "/model-dashboard";
      default:
        return "/discover";
    }
  };

  return {
    requireAuth,
    requireGuest,
    requireRole,
    getDefaultRedirect,
  };
}
