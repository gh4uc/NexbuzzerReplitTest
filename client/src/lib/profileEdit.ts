
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ProfileUpdateOptions {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export function useProfileUpdate() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  const updateUserProfile = async (data: any, options?: ProfileUpdateOptions) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to update your profile.",
        variant: "destructive",
      });
      return false;
    }

    try {
      await apiRequest("PUT", `/api/users/${user.id}`, data);
      
      // Refresh user data to get updated information
      refreshUser();
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
      options?.onSuccess?.();
      return true;
    } catch (error) {
      console.error("Profile update error:", error);
      
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
      
      options?.onError?.(error);
      return false;
    }
  };

  const updateModelProfile = async (data: any, options?: ProfileUpdateOptions) => {
    if (!user || user.role !== "model") {
      toast({
        title: "Authentication Error",
        description: "You must be logged in as a model to update your profile.",
        variant: "destructive",
      });
      return false;
    }

    try {
      await apiRequest("PUT", `/api/models/${user.id}`, data);
      
      // Refresh user data to get updated information
      refreshUser();
      
      toast({
        title: "Model Profile Updated",
        description: "Your model profile has been successfully updated.",
      });
      
      options?.onSuccess?.();
      return true;
    } catch (error) {
      console.error("Model profile update error:", error);
      
      toast({
        title: "Update Failed",
        description: "There was an error updating your model profile. Please try again.",
        variant: "destructive",
      });
      
      options?.onError?.(error);
      return false;
    }
  };

  return {
    updateUserProfile,
    updateModelProfile,
  };
}
