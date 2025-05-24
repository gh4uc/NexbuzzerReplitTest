
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function useApiAuth() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const apiRequest = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return response;
  };

  const checkAuth = (redirectToAuth = true) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this feature.",
        variant: "destructive",
      });
      
      if (redirectToAuth) {
        setLocation("/auth");
      }
      return false;
    }
    return true;
  };

  const checkRole = (requiredRole: "user" | "model" | "admin", redirectToHome = true) => {
    if (!checkAuth(redirectToHome)) return false;
    
    if (user?.role !== requiredRole) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this feature.",
        variant: "destructive",
      });
      
      if (redirectToHome) {
        setLocation("/");
      }
      return false;
    }
    return true;
  };

  const checkModelAccess = (modelId: number, redirectToHome = true) => {
    if (!checkAuth(redirectToHome)) return false;
    
    // Allow access if user is the model or an admin
    if (user?.id === modelId || user?.role === "admin") {
      return true;
    }

    toast({
      title: "Access Denied",
      description: "You don't have permission to access this model's data.",
      variant: "destructive",
    });
    
    if (redirectToHome) {
      setLocation("/");
    }
    return false;
  };

  const checkUserAccess = (userId: number, redirectToHome = true) => {
    if (!checkAuth(redirectToHome)) return false;
    
    // Allow access if user is accessing their own data or is an admin
    if (user?.id === userId || user?.role === "admin") {
      return true;
    }

    toast({
      title: "Access Denied",
      description: "You don't have permission to access this user's data.",
      variant: "destructive",
    });
    
    if (redirectToHome) {
      setLocation("/");
    }
    return false;
  };

  const requireCallAccess = (callData: { userId: number; modelId: number }) => {
    if (!checkAuth()) return false;
    
    // Allow access if user is involved in the call or is an admin
    if (user?.id === callData.userId || user?.id === callData.modelId || user?.role === "admin") {
      return true;
    }
    
    toast({
      title: "Access Denied",
      description: "You don't have permission to access this call data.",
      variant: "destructive",
    });
    return false;
  };

  return {
    apiRequest,
    checkAuth,
    checkRole,
    checkModelAccess,
    checkUserAccess,
    requireCallAccess,
  };
}
