import { useState, useEffect } from "react";
import { X, Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import AddFundsModal from "@/components/wallet/AddFundsModal";

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callData: {
    id: number;
    modelId: number;
    modelName: string;
    modelLocation?: string;
    modelImage: string;
    callType: "voice" | "video";
    rate: number;
  } | null;
}

export default function CallModal({ isOpen, onClose, callData }: CallModalProps) {
  const { toast } = useToast();
  const { balance, refreshWallet } = useWallet();
  
  const [isLive, setIsLive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callCost, setCallCost] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [willBeChargedSoon, setWillBeChargedSoon] = useState(0);
  
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours > 0 ? hours.toString().padStart(2, '0') : null,
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].filter(Boolean).join(':');
  };
  
  useEffect(() => {
    if (isOpen && callData) {
      let timer: number;
      
      // Initialize call
      const startCall = async () => {
        try {
          // In a production app, we would initialize Twilio here
          setIsLive(true);
          
          // Start timer
          timer = window.setInterval(() => {
            setCallDuration(prev => {
              const newDuration = prev + 1;
              // Calculate cost (rate is per minute, so divide by 60 for per second)
              const newCost = parseFloat(((newDuration / 60) * callData.rate).toFixed(2));
              setCallCost(newCost);
              
              // Calculate if they'll need to add funds soon
              const remainingBalance = balance - newCost;
              if (remainingBalance < 0) {
                setWillBeChargedSoon(Math.abs(remainingBalance));
              } else {
                setWillBeChargedSoon(0);
              }
              
              return newDuration;
            });
          }, 1000);
        } catch (error) {
          console.error("Error starting call:", error);
          toast({
            title: "Call Failed",
            description: "Could not establish connection. Please try again.",
            variant: "destructive",
          });
          onClose();
        }
      };
      
      startCall();
      
      return () => {
        // Clean up timer and call resources
        if (timer) clearInterval(timer);
        if (isLive) {
          // End call and record charges
          endCall();
        }
      };
    }
  }, [isOpen, callData]);
  
  const endCall = async () => {
    if (!callData) return;
    
    try {
      // In production this would disconnect from Twilio and update the call record
      await apiRequest("PUT", `/api/calls/${callData.id}/end`, {});
      
      // Refresh wallet balance
      refreshWallet();
      
      // Invalidate calls cache so call history is updated
      queryClient.invalidateQueries({ queryKey: ['/api/calls/user'] });
      
      setIsLive(false);
      
      toast({
        title: "Call Ended",
        description: `Call duration: ${formatDuration(callDuration)}. Total cost: $${callCost.toFixed(2)}`,
      });
      
    } catch (error) {
      console.error("Error ending call:", error);
      toast({
        title: "Error",
        description: "There was an issue ending the call. Your account will be updated shortly.",
        variant: "destructive",
      });
    }
    
    onClose();
  };
  
  if (!isOpen || !callData) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 bg-gray-900 relative">
          {/* Video/Profile area */}
          <img 
            src={callData.modelImage} 
            alt={`Call with ${callData.modelName}`} 
            className="w-full h-full object-cover opacity-90"
          />
          
          <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-2 py-1 bg-red-500 rounded-full text-xs font-medium inline-flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-1"></span> LIVE
                </span>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className="px-3 py-1 bg-gray-800/80 rounded-full text-sm font-medium">
                  <span className="mr-1">{formatDuration(callDuration)}</span>
                </span>
                <span className="px-3 py-1 bg-accent/80 rounded-full text-sm font-medium">
                  <span className="mr-1">${callCost.toFixed(2)}</span>
                </span>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-heading font-medium">{callData.modelName}</h3>
              {callData.modelLocation && (
                <div className="flex items-center text-sm opacity-90 mb-4">
                  <span className="mr-1">{callData.modelLocation}</span>
                </div>
              )}
              
              <div className="flex justify-center space-x-3 mt-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`w-12 h-12 rounded-full ${isAudioMuted ? 'bg-red-500/80' : 'bg-gray-800/80'} text-white hover:bg-gray-700/80`}
                  onClick={() => setIsAudioMuted(!isAudioMuted)}
                >
                  {isAudioMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                
                {callData.callType === "video" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`w-12 h-12 rounded-full ${!isVideoEnabled ? 'bg-red-500/80' : 'bg-gray-800/80'} text-white hover:bg-gray-700/80`}
                    onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                  >
                    {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                  </Button>
                )}
                
                <Button
                  variant="destructive"
                  size="icon"
                  className="w-12 h-12 rounded-full bg-red-500 text-white hover:bg-red-600"
                  onClick={endCall}
                >
                  <PhoneOff className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-1/2 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-heading font-semibold text-xl text-gray-900">Call Details</h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium text-gray-900">Current Session</div>
                <div className="text-primary font-medium">${callData.rate.toFixed(2)}/min</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration</span>
                  <span className="text-gray-900 font-medium">{formatDuration(callDuration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Current cost</span>
                  <span className="text-gray-900 font-medium">${callCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Wallet balance</span>
                  <span className="text-gray-900 font-medium">${balance.toFixed(2)}</span>
                </div>
                
                {willBeChargedSoon > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Will be charged soon</span>
                    <span className="text-danger font-medium">${willBeChargedSoon.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-gray-900 font-medium mb-2">Send a Tip</h4>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline">$5</Button>
                <Button variant="outline">$10</Button>
                <Button variant="outline">$20</Button>
                <Button variant="outline">$50</Button>
                <Button variant="outline">$100</Button>
                <Button variant="outline">Custom</Button>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-gray-900 font-medium mb-2">Schedule Another Call</h4>
              <Button 
                variant="outline" 
                className="w-full border-primary text-primary hover:bg-primary/5 flex items-center justify-center"
              >
                <i className="ri-calendar-line mr-2"></i> View Available Times
              </Button>
            </div>
            
            <div>
              <h4 className="text-gray-900 font-medium mb-2">Add More Funds</h4>
              <Button 
                variant="default" 
                className="w-full bg-accent text-white hover:bg-accent/90 flex items-center justify-center"
                onClick={() => setShowAddFundsModal(true)}
              >
                <i className="ri-add-line mr-2"></i> Add Funds to Wallet
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {showAddFundsModal && (
        <AddFundsModal 
          isOpen={showAddFundsModal}
          onClose={() => setShowAddFundsModal(false)}
          initialAmount={Math.max(50, willBeChargedSoon * 2)}
        />
      )}
    </div>
  );
}
