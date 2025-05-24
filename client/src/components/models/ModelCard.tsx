import { useState } from "react";
import { Link } from "wouter";
import { Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { useCall } from "@/contexts/CallContext";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ModelCardProps {
  model: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    age?: number;
    city?: string;
    country?: string;
    profileImage?: string;
    bio?: string;
    languages?: string[];
    categories?: string[];
    offerVoiceCalls: boolean;
    offerVideoCalls: boolean;
    voiceRate: number;
    videoRate: number;
    isAvailable: boolean;
    profileImages?: string[];
    isFavorite?: boolean;
  };
  refetchModels?: () => void;
}

export default function ModelCard({ model, refetchModels }: ModelCardProps) {
  const { isAuthenticated } = useAuth();
  const { balance } = useWallet();
  const { initiateCall } = useCall();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(model.isFavorite || false);
  const [isToggling, setIsToggling] = useState(false);

  const displayName = model.firstName 
    ? `${model.firstName}${model.age ? `, ${model.age}` : ''}`
    : model.username;

  const location = model.city && model.country 
    ? `${model.city}, ${model.country}`
    : model.city || model.country || "";

  const profileImage = model.profileImage || model.profileImages?.[0] || "";

  const handleCallClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to connect with models.",
        variant: "destructive",
      });
      return;
    }
    
    initiateCall(model);
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add favorites.",
        variant: "destructive",
      });
      return;
    }
    
    setIsToggling(true);
    
    try {
      if (isFavorite) {
        await apiRequest("DELETE", `/api/favorites/${model.id}`);
        setIsFavorite(false);
        toast({
          title: "Removed from favorites",
          description: `${displayName} has been removed from your favorites.`,
          variant: "default",
        });
      } else {
        await apiRequest("POST", "/api/favorites", { modelId: model.id });
        setIsFavorite(true);
        toast({
          title: "Added to favorites",
          description: `${displayName} has been added to your favorites.`,
          variant: "default",
        });
      }
      
      if (refetchModels) {
        refetchModels();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites.",
        variant: "destructive",
      });
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Card className="overflow-hidden transition-transform hover:shadow-md hover:scale-[1.01]">
      <div className="relative">
        <Link href={`/model/${model.id}`}>
          <img 
            src={profileImage || "https://via.placeholder.com/400x300?text=No+Image"} 
            alt={`${displayName} profile picture`} 
            className="w-full h-60 object-cover cursor-pointer"
          />
        </Link>
        <div className="absolute top-3 right-3 flex space-x-2">
          {model.isAvailable ? (
            <Badge variant="default" className="bg-success text-white flex items-center">
              <div className="w-2 h-2 rounded-full bg-white mr-1"></div> Available
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-gray-500 text-white flex items-center">
              <div className="w-2 h-2 rounded-full bg-white mr-1"></div> Away
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <Link href={`/model/${model.id}`}>
            <h3 className="text-lg font-heading font-medium text-gray-900 cursor-pointer">
              {displayName}
            </h3>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className={isFavorite ? "text-accent" : "text-gray-400 hover:text-accent"} 
            onClick={toggleFavorite}
            disabled={isToggling}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
          </Button>
        </div>
        
        {location && (
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{location}</span>
          </div>
        )}
        
        {model.bio && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{model.bio}</p>
        )}
        
        <div className="flex flex-wrap gap-1 mb-4">
          {model.languages?.map((lang) => (
            <Badge key={lang} variant="outline" className="bg-gray-100 text-gray-800 font-normal">
              {lang}
            </Badge>
          ))}
          {model.categories?.map((cat) => (
            <Badge key={cat} variant="outline" className="bg-gray-100 text-gray-800 font-normal">
              {cat}
            </Badge>
          ))}
        </div>
        
        <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {model.offerVoiceCalls && (
                <div className="flex items-center text-accent">
                  <i className="ri-phone-line mr-1"></i>
                  <span className="font-medium">${model.voiceRate}/min</span>
                </div>
              )}
              {model.offerVideoCalls && (
                <div className="flex items-center text-accent">
                  <i className="ri-vidicon-line mr-1"></i>
                  <span className="font-medium">${model.videoRate}/min</span>
                </div>
              )}
            </div>
          </div>
          
          <div>
            {model.isAvailable ? (
              <Button 
                variant="default" 
                className="bg-primary text-white hover:bg-primary/90"
                onClick={handleCallClick}
              >
                Connect
              </Button>
            ) : (
              <Button 
                variant="secondary"
                className="bg-gray-200 text-gray-500 cursor-not-allowed"
                disabled
              >
                Unavailable
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
