
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function useSessionCheck() {
  const { isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [warningShown, setWarningShown] = useState(false);

  // Session timeout values (in milliseconds)
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const WARNING_BEFORE = 5 * 60 * 1000; // Show warning 5 minutes before expiry

  // Reset timeout on user activity
  const handleUserActivity = () => {
    setLastActivity(Date.now());
    setWarningShown(false);
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    // Add activity listeners
    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });

    // Check session status regularly
    const interval = setInterval(() => {
      const now = Date.now();
      const timeElapsed = now - lastActivity;
      const timeRemaining = SESSION_TIMEOUT - timeElapsed;

      // Show warning when approaching timeout
      if (timeRemaining < WARNING_BEFORE && !warningShown && timeElapsed < SESSION_TIMEOUT) {
        toast({
          title: "Session Expiring Soon",
          description: "Your session will expire soon due to inactivity. Please continue using the app to stay logged in.",
          duration: 10000, // 10 seconds
        });
        setWarningShown(true);
      }

      // Logout when session expires
      if (timeElapsed >= SESSION_TIMEOUT) {
        toast({
          title: "Session Expired",
          description: "Your session has expired due to inactivity. Please log in again.",
          variant: "destructive",
        });
        logout();
      }
    }, 60000); // Check every minute

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
      clearInterval(interval);
    };
  }, [isAuthenticated, lastActivity, logout, toast, warningShown]);

  return null; // This hook doesn't render anything
}
