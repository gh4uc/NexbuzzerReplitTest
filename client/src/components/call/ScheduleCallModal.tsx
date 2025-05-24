import { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useWallet } from "@/contexts/WalletContext";
import AddFundsModal from "@/components/wallet/AddFundsModal";

interface Model {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  city?: string;
  country?: string;
  profileImage?: string;
  offerVoiceCalls: boolean;
  offerVideoCalls: boolean;
  voiceRate: number;
  videoRate: number;
}

interface ScheduleCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: Model;
}

export default function ScheduleCallModal({ isOpen, onClose, model }: ScheduleCallModalProps) {
  const { toast } = useToast();
  const { balance } = useWallet();
  
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [callType, setCallType] = useState<string>(
    model.offerVoiceCalls ? "voice" : "video"
  );
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [duration, setDuration] = useState<number>(5);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [requiredFunds, setRequiredFunds] = useState<number>(0);
  
  // Available times (in a real app, these would come from the model's availability)
  const availableTimes = ["9:00 AM", "10:30 AM", "12:00 PM", "1:30 PM", "3:00 PM", "4:30 PM"];
  
  // Available durations
  const durationOptions = [
    { value: 5, label: "5 minutes" },
    { value: 10, label: "10 minutes" },
    { value: 15, label: "15 minutes" },
    { value: 30, label: "30 minutes" }
  ];
  
  const rate = callType === "voice" ? model.voiceRate : model.videoRate;
  const totalCost = duration * rate;
  
  useEffect(() => {
    // Reset form when model changes
    setCallType(model.offerVoiceCalls ? "voice" : "video");
  }, [model]);
  
  useEffect(() => {
    // Check if user has enough funds
    if (balance < totalCost) {
      setRequiredFunds(totalCost - balance);
    } else {
      setRequiredFunds(0);
    }
  }, [callType, duration, balance, totalCost]);
  
  const handleSubmit = async () => {
    if (!selectedTime) {
      toast({
        title: "Please select a time",
        description: "You need to select an available time slot to schedule the call.",
        variant: "destructive",
      });
      return;
    }
    
    if (balance < totalCost) {
      toast({
        title: "Insufficient funds",
        description: "Please add more funds to your wallet to schedule this call.",
        variant: "destructive",
      });
      setShowAddFundsModal(true);
      return;
    }
    
    try {
      // Convert date and time to ISO string for the API
      const [hours, minutes] = selectedTime.split(':');
      const isPM = selectedTime.includes('PM');
      
      let hour = parseInt(hours);
      if (isPM && hour !== 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;
      
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(hour, parseInt(minutes), 0);
      
      const response = await apiRequest("POST", "/api/scheduled-calls", {
        modelId: model.id,
        scheduledTime: scheduledDateTime.toISOString(),
        duration,
        type: callType,
        rate
      });
      
      toast({
        title: "Call Scheduled",
        description: `Your call with ${model.firstName || model.username} has been scheduled successfully.`,
      });
      
      // Refresh scheduled calls data
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-calls/user'] });
      
      onClose();
    } catch (error) {
      console.error("Error scheduling call:", error);
      toast({
        title: "Scheduling Failed",
        description: "There was an error scheduling your call. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const modelDisplayName = model.firstName 
    ? `${model.firstName}${model.age ? `, ${model.age}` : ''}`
    : model.username;
  
  const modelLocation = model.city && model.country 
    ? `${model.city}, ${model.country}`
    : model.city || model.country || "";
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-heading font-semibold text-xl text-gray-900">
              Schedule a Call with {modelDisplayName}
            </h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={model.profileImage} alt={modelDisplayName} />
                <AvatarFallback>{modelDisplayName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-heading font-medium text-gray-900">{modelDisplayName}</h4>
                {modelLocation && <p className="text-sm text-gray-500">{modelLocation}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Date
                </Label>
                <div className="relative">
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="callType" className="block text-sm font-medium text-gray-700 mb-1">
                  Call Type
                </Label>
                <RadioGroup 
                  id="callType" 
                  value={callType}
                  onValueChange={setCallType}
                  className="flex space-x-4"
                >
                  {model.offerVoiceCalls && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="voice" id="voice" />
                      <Label htmlFor="voice">Voice Call - ${model.voiceRate}/min</Label>
                    </div>
                  )}
                  {model.offerVideoCalls && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="video" id="video" />
                      <Label htmlFor="video">Video Call - ${model.videoRate}/min</Label>
                    </div>
                  )}
                </RadioGroup>
              </div>
            </div>
            
            <div className="mb-6">
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Available Time Slots
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {availableTimes.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    className={selectedTime === time ? "bg-primary/5 text-primary border-primary" : ""}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <Label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Call Duration
              </Label>
              <Select 
                value={duration.toString()}
                onValueChange={(value) => setDuration(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label} - ${(option.value * rate).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">Summary</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Date & Time</span>
                  <span className="text-gray-900">
                    {selectedDate} - {selectedTime || "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Call Type</span>
                  <span className="text-gray-900">
                    {callType === "voice" ? "Voice Call" : "Video Call"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration</span>
                  <span className="text-gray-900">{duration} minutes</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span className="text-gray-800">Total Amount</span>
                  <span className="text-primary">${totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Wallet Balance</span>
                  <span className={balance < totalCost ? "text-danger" : "text-gray-900"}>
                    ${balance.toFixed(2)}
                  </span>
                </div>
                {requiredFunds > 0 && (
                  <div className="flex justify-between text-danger">
                    <span>Additional funds needed</span>
                    <span>${requiredFunds.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              {requiredFunds > 0 ? (
                <Button 
                  className="flex-1 bg-accent text-white hover:bg-accent/90" 
                  onClick={() => setShowAddFundsModal(true)}
                >
                  Add Funds
                </Button>
              ) : (
                <Button 
                  className="flex-1 bg-primary text-white hover:bg-primary/90" 
                  onClick={handleSubmit}
                >
                  Confirm Booking
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {showAddFundsModal && (
        <AddFundsModal 
          isOpen={showAddFundsModal}
          onClose={() => setShowAddFundsModal(false)}
          initialAmount={requiredFunds > 0 ? Math.ceil(requiredFunds) : undefined}
        />
      )}
    </div>
  );
}
