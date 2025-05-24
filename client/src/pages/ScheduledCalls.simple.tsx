import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useApiAuth } from "@/hooks/useApiAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { 
  Calendar, Phone, Video, Clock, Check, X, Users, 
  CalendarDays, Filter, Info, AlertCircle, Play, Headphones, ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog";
import { 
  Popover, PopoverContent, PopoverTrigger 
} from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/layout/Navbar";

type User = {
  username: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
};

type ScheduledCall = {
  id: number;
  userId: number;
  modelId: number;
  scheduledTime: string;
  duration: number;
  type: "voice" | "video";
  rate: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: string;
  callSessionId?: number;
  model?: User;
  user?: User;
};

export default function ScheduledCallsSimple() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { checkAuth } = useApiAuth();
  const [activeTab, setActiveTab] = useState<string>("upcoming");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showCallDetails, setShowCallDetails] = useState<number | null>(null);
  const [showJoinCallDialog, setShowJoinCallDialog] = useState<boolean>(false);
  const [selectedCallToJoin, setSelectedCallToJoin] = useState<ScheduledCall | null>(null);
  
  // For development, create demo user mode based on URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const viewMode = urlParams.get('mode') || 'user';
  const isModel = viewMode === 'model';
  
  // Check if user has permission to view this page
  if (!checkAuth()) {
    return null;
  }

  // Check if user is trying to view model view without being a model
  if (isModel && user?.role !== "model") {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                You don't have permission to view the model dashboard. Please switch to user view.
              </p>
              <Button 
                variant="default" 
                className="bg-primary text-white hover:bg-primary/90"
                onClick={() => window.location.href = "?mode=user"}
              >
                Switch to User View
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }
  
  // Demo data for development
  const demoData: ScheduledCall[] = [
    {
      id: 1,
      userId: 2,
      modelId: 3,
      scheduledTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      duration: 30,
      type: "voice",
      rate: 2.99,
      status: "confirmed",
      createdAt: new Date().toISOString(),
      user: {
        username: "client123",
        firstName: "John",
        lastName: "Smith",
        profileImage: "https://randomuser.me/api/portraits/men/42.jpg"
      },
      model: {
        username: "sophia_model",
        firstName: "Sophia",
        lastName: "Taylor",
        profileImage: "https://randomuser.me/api/portraits/women/22.jpg"
      }
    },
    {
      id: 2,
      userId: 2,
      modelId: 4,
      scheduledTime: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      duration: 45,
      type: "video",
      rate: 4.99,
      status: "completed",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      user: {
        username: "client123",
        firstName: "John",
        lastName: "Smith",
        profileImage: "https://randomuser.me/api/portraits/men/42.jpg"
      },
      model: {
        username: "emma_model",
        firstName: "Emma",
        lastName: "Johnson",
        profileImage: "https://randomuser.me/api/portraits/women/28.jpg"
      }
    },
    {
      id: 3,
      userId: 2,
      modelId: 5,
      scheduledTime: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
      duration: 60,
      type: "video",
      rate: 3.99,
      status: "pending",
      createdAt: new Date(Date.now() - 43200000).toISOString(),
      user: {
        username: "client123",
        firstName: "John",
        lastName: "Smith",
        profileImage: "https://randomuser.me/api/portraits/men/42.jpg"
      },
      model: {
        username: "mia_model",
        firstName: "Mia",
        lastName: "Garcia",
        profileImage: "https://randomuser.me/api/portraits/women/35.jpg"
      }
    },
    {
      id: 4,
      userId: 2,
      modelId: 6,
      scheduledTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
      duration: 15,
      type: "voice",
      rate: 1.99,
      status: "cancelled",
      createdAt: new Date(Date.now() - 21600000).toISOString(),
      user: {
        username: "client123",
        firstName: "John",
        lastName: "Smith",
        profileImage: "https://randomuser.me/api/portraits/men/42.jpg"
      },
      model: {
        username: "olivia_model",
        firstName: "Olivia",
        lastName: "Brown",
        profileImage: "https://randomuser.me/api/portraits/women/15.jpg"
      }
    }
  ];
  
  const [scheduledCalls, setScheduledCalls] = useState<ScheduledCall[]>(demoData);
  
  // Filter calls based on active tab, search term, and filter type
  const filteredCalls = scheduledCalls.filter((call: ScheduledCall) => {
    const isPast = new Date(call.scheduledTime) < new Date();
    const otherPerson = isModel ? call.user : call.model;
    const searchMatch = searchTerm === "" || 
      (otherPerson?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        otherPerson?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        otherPerson?.username?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const typeMatch = filterType === "all" || call.type === filterType;
    
    // Tab filters
    let tabMatch = true;
    if (activeTab === "upcoming") {
      tabMatch = !isPast && call.status !== "cancelled";
    } else if (activeTab === "past") {
      tabMatch = isPast || call.status === "completed";
    } else if (activeTab === "cancelled") {
      tabMatch = call.status === "cancelled";
    }
    
    return tabMatch && searchMatch && typeMatch;
  });
  
  // Update call status (confirm or cancel)
  const updateCallStatus = async (callId: number, status: "confirmed" | "cancelled") => {
    try {
      setScheduledCalls(prev =>
        prev.map(call =>
          call.id === callId ? { ...call, status } : call
        )
      );

      toast({
        title: status === "confirmed" ? "Call Confirmed" : "Call Cancelled",
        description: status === "confirmed"
          ? "The scheduled call has been confirmed"
          : "The scheduled call has been cancelled",
        variant: status === "confirmed" ? "default" : "destructive",
      });
    } catch (error) {
      console.error(`Error ${status} call:`, error);
      toast({
        title: "Action Failed",
        description: `There was an error ${status === "confirmed" ? "confirming" : "cancelling"} the call`,
        variant: "destructive",
      });
    }
  };
  
  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(undefined, { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString(undefined, { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
    };
  };
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-heading font-semibold text-gray-900">Scheduled Calls</h1>
            {!isModel && (
              <Button 
                className="bg-primary text-white hover:bg-primary/90"
                onClick={() => window.location.href = "/schedule-call"}
              >
                <CalendarDays className="h-4 w-4 mr-2" /> Schedule New Call
              </Button>
            )}
          </div>
          
          <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Switch View Mode Button */}
          <div className="mb-6 flex justify-end">
            <Button 
              onClick={() => {
                const newMode = isModel ? 'user' : 'model';
                window.location.href = `?mode=${newMode}`;
              }}
              variant="outline"
            >
              Switch to {isModel ? 'User' : 'Model'} View
            </Button>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Input
                placeholder="Search by name or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    <span>{filterType === "all" ? "All Call Types" : filterType === "voice" ? "Voice Calls" : "Video Calls"}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Call Types</SelectItem>
                  <SelectItem value="voice">Voice Calls</SelectItem>
                  <SelectItem value="video">Video Calls</SelectItem>
                </SelectContent>
              </Select>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Info className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-medium">About Scheduled Calls</h4>
                    <p className="text-sm text-gray-500">
                      Scheduled calls allow you to book time with {isModel ? "clients" : "models"} in advance.
                      {isModel ? " You can confirm or decline requests from clients." : " Once confirmed, you'll be able to join at the scheduled time."}
                    </p>
                    <div className="pt-2">
                      <h5 className="text-sm font-medium">Status Colors</h5>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge>Confirmed</Badge>
                        <span className="text-xs text-gray-500">Ready to go at scheduled time</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">Pending</Badge>
                        <span className="text-xs text-gray-500">Waiting for confirmation</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="destructive">Cancelled</Badge>
                        <span className="text-xs text-gray-500">No longer happening</span>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <InfoIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    You're viewing this page in <strong>{isModel ? 'Model' : 'User'}</strong> mode. Use the switch button above to toggle between views.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {filteredCalls.length > 0 ? (
            <div className="grid gap-6">
              {filteredCalls.map((call) => {
                const { date, time } = formatDateTime(call.scheduledTime);
                const totalCost = call.duration * call.rate;
                
                const otherPerson = isModel 
                  ? call.user
                  : call.model;
                
                const displayName = otherPerson?.firstName || otherPerson?.username || "Unknown User";
                
                return (
                  <Card key={call.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={otherPerson?.profileImage} alt={displayName} />
                              <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            
                            <div>
                              <h3 className="font-medium text-lg text-gray-900">{displayName}</h3>
                              <div className="flex items-center text-sm text-gray-500 mb-2">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>{date} at {time}</span>
                              </div>
                              
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="outline" className="flex items-center gap-1">
                                  {call.type === "voice" ? (
                                    <Phone className="h-3 w-3" />
                                  ) : (
                                    <Video className="h-3 w-3" />
                                  )}
                                  <span>{call.type === "voice" ? "Voice" : "Video"} Call</span>
                                </Badge>
                                
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{call.duration} minutes</span>
                                </Badge>
                                
                                <Badge variant={
                                  call.status === "confirmed" ? "default" :
                                  call.status === "cancelled" ? "destructive" :
                                  "secondary"
                                } className="capitalize">
                                  {call.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 ml-16 md:ml-0">
                            <div className="text-right">
                              <div className="text-lg font-medium text-primary">${totalCost.toFixed(2)}</div>
                              <div className="text-sm text-gray-500">${call.rate.toFixed(2)}/min</div>
                            </div>
                            
                            <div className="flex gap-2">
                              {/* Join Call Button - Only show if it's confirmed and within 10 minutes of scheduled time */}
                              {call.status === "confirmed" && 
                                new Date(call.scheduledTime).getTime() - new Date().getTime() < 10 * 60 * 1000 && 
                                new Date(call.scheduledTime).getTime() > new Date().getTime() - 30 * 60 * 1000 && (
                                <Button 
                                  variant="default"
                                  className="bg-green-600 text-white hover:bg-green-700"
                                  onClick={() => {
                                    setSelectedCallToJoin(call);
                                    setShowJoinCallDialog(true);
                                  }}
                                >
                                  {call.type === "voice" ? (
                                    <Headphones className="h-4 w-4 mr-1" />
                                  ) : (
                                    <Play className="h-4 w-4 mr-1" />
                                  )}
                                  Join Call
                                </Button>
                              )}
                              
                              {/* Actions for pending calls */}
                              {call.status === "pending" && (
                                <>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="border-destructive text-destructive hover:bg-destructive/10"
                                    onClick={() => updateCallStatus(call.id, "cancelled")}
                                  >
                                    <X className="h-4 w-4 mr-1" /> Cancel
                                  </Button>
                                  
                                  <Button 
                                    size="sm"
                                    className="bg-primary text-white hover:bg-primary/90"
                                    onClick={() => updateCallStatus(call.id, "confirmed")}
                                  >
                                    <Check className="h-4 w-4 mr-1" /> Confirm
                                  </Button>
                                </>
                              )}
                              
                              {/* View Details Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowCallDetails(call.id === showCallDetails ? null : call.id)}
                              >
                                {showCallDetails === call.id ? "Hide Details" : "View Details"}
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Expanded Call Details */}
                        {showCallDetails === call.id && (
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-medium text-gray-700 mb-3">Call Details</h4>
                                <dl className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <dt className="text-gray-500">Scheduled For</dt>
                                    <dd className="font-medium">{new Date(call.scheduledTime).toLocaleString()}</dd>
                                  </div>
                                  <div className="flex justify-between">
                                    <dt className="text-gray-500">Call Type</dt>
                                    <dd className="font-medium capitalize">{call.type}</dd>
                                  </div>
                                  <div className="flex justify-between">
                                    <dt className="text-gray-500">Duration</dt>
                                    <dd className="font-medium">{call.duration} minutes</dd>
                                  </div>
                                  <div className="flex justify-between">
                                    <dt className="text-gray-500">Rate</dt>
                                    <dd className="font-medium">${call.rate.toFixed(2)}/min</dd>
                                  </div>
                                  <div className="flex justify-between">
                                    <dt className="text-gray-500">Total Cost</dt>
                                    <dd className="font-medium text-primary">${totalCost.toFixed(2)}</dd>
                                  </div>
                                  <div className="flex justify-between">
                                    <dt className="text-gray-500">Status</dt>
                                    <dd>
                                      <Badge variant={
                                        call.status === "confirmed" ? "default" :
                                        call.status === "cancelled" ? "destructive" :
                                        "secondary"
                                      } className="capitalize">
                                        {call.status}
                                      </Badge>
                                    </dd>
                                  </div>
                                  <div className="flex justify-between">
                                    <dt className="text-gray-500">Created On</dt>
                                    <dd className="font-medium">{new Date(call.createdAt).toLocaleDateString()}</dd>
                                  </div>
                                </dl>
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-gray-700 mb-3">{isModel ? "Client" : "Model"} Information</h4>
                                <div className="flex items-center gap-3 mb-4">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={otherPerson?.profileImage} alt={displayName} />
                                    <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{displayName}</p>
                                    <p className="text-sm text-gray-500">@{otherPerson?.username}</p>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <Button 
                                    variant="outline" 
                                    className="w-full justify-start"
                                    onClick={() => window.location.href = isModel ? `/profile/${call.userId}` : `/profile/${call.modelId}`}
                                  >
                                    <Users className="h-4 w-4 mr-2" /> View Full Profile
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-medium text-gray-900 mb-2">No scheduled calls</h2>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {activeTab === "upcoming" 
                    ? isModel 
                      ? "You don't have any upcoming calls with users."
                      : "You haven't scheduled any calls with models yet."
                    : activeTab === "past"
                      ? "You don't have any past calls."
                      : "You don't have any cancelled calls."
                  }
                </p>
                
                {activeTab === "upcoming" && !isModel && (
                  <Button 
                    variant="default" 
                    className="bg-primary text-white hover:bg-primary/90"
                    onClick={() => window.location.href = "/discover"}
                  >
                    <Users className="h-4 w-4 mr-2" /> Browse Models
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Join Call Dialog */}
          <Dialog open={showJoinCallDialog} onOpenChange={setShowJoinCallDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Join Call</DialogTitle>
                <DialogDescription>
                  You are about to join a {selectedCallToJoin?.type} call with {isModel ? 
                    selectedCallToJoin?.user?.firstName || selectedCallToJoin?.user?.username : 
                    selectedCallToJoin?.model?.firstName || selectedCallToJoin?.model?.username}.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-amber-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800">Call Information</h3>
                      <div className="mt-2 text-sm text-amber-700">
                        <p className="mb-1">• This call will be charged at a rate of ${selectedCallToJoin?.rate ? selectedCallToJoin.rate.toFixed(2) : '0.00'}/minute.</p>
                        <p className="mb-1">• Maximum duration: {selectedCallToJoin?.duration ?? 0} minutes.</p>
                        <p>• Total maximum cost: ${((selectedCallToJoin?.duration ?? 0) * (selectedCallToJoin?.rate ?? 0)).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-4">
                  {selectedCallToJoin?.type === "voice" ? (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
                        <Headphones className="h-8 w-8 text-green-600" />
                      </div>
                      <span className="text-sm font-medium">Voice Call</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                        <Video className="h-8 w-8 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">Video Call</span>
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter className="sm:justify-between">
                <Button 
                  variant="outline"
                  onClick={() => setShowJoinCallDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-green-600 text-white hover:bg-green-700"
                  onClick={() => {
                    // In a real app, this would navigate to a call room or launch the calling interface
                    toast({
                      title: "Connecting to Call",
                      description: `Joining ${selectedCallToJoin?.type} call with ${isModel ? 
                        selectedCallToJoin?.user?.firstName || selectedCallToJoin?.user?.username : 
                        selectedCallToJoin?.model?.firstName || selectedCallToJoin?.model?.username}...`,
                    });
                    // For demo purposes, we'll just close the dialog
                    setShowJoinCallDialog(false);
                    // In a real implementation, navigate to a call page, e.g.:
                    // window.location.href = `/call-room/${selectedCallToJoin?.id}`;
                  }}
                >
                  {selectedCallToJoin?.type === "voice" ? (
                    <>
                      <Headphones className="h-4 w-4 mr-2" />
                      Join Voice Call
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Join Video Call
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Empty State Message */}
          {filteredCalls.length === 0 && searchTerm && (
            <Card className="mt-4">
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No results found</h3>
                <p className="text-gray-500">No calls match your search for "{searchTerm}"</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}