
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import WalletDisplay from '@/components/wallet/WalletDisplay';

// Type definitions for dashboard data
interface DashboardStats {
  totalEarnings: number;
  totalCalls: number;
  completedCalls: number;
  averageRating: number;
  pendingCalls: number;
}

interface Call {
  id: number;
  userId: number;
  type: 'voice' | 'video';
  status: 'active' | 'completed' | 'cancelled';
  startTime: string;
  duration?: number;
  rate: number;
  totalCost?: number;
  username?: string;
}

interface ScheduledCall {
  id: number;
  userId: number;
  scheduledTime: string;
  duration: number;
  type: 'voice' | 'video';
  status: 'pending' | 'confirmed' | 'cancelled';
  username?: string;
  rate: number;
}

interface ModelSettings {
  bio: string;
  languages: string[];
  categories: string[];
  offerVoiceCalls: boolean;
  offerVideoCalls: boolean;
  voiceRate: number;
  videoRate: number;
  isAvailable: boolean;
  profileImages: string[];
}

const ModelDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { balance } = useWallet();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalEarnings: 0,
    totalCalls: 0,
    completedCalls: 0,
    averageRating: 0,
    pendingCalls: 0,
  });
  
  const [callHistory, setCallHistory] = useState<Call[]>([]);
  const [scheduledCalls, setScheduledCalls] = useState<ScheduledCall[]>([]);
  const [settings, setSettings] = useState<ModelSettings>({
    bio: '',
    languages: [],
    categories: [],
    offerVoiceCalls: true,
    offerVideoCalls: true,
    voiceRate: 0,
    videoRate: 0,
    isAvailable: true,
    profileImages: [],
  });
  
  const [newLanguage, setNewLanguage] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Fetch dashboard data
  useEffect(() => {
    if (!user) return;
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch model stats
        const statsResponse = await fetch(`/api/models/${user.id}/stats`, {
          credentials: 'include',
        });
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
        
        // Fetch call history
        const callsResponse = await fetch(`/api/models/${user.id}/calls`, {
          credentials: 'include',
        });
        
        if (callsResponse.ok) {
          const callsData = await callsResponse.json();
          setCallHistory(callsData);
        }
        
        // Fetch scheduled calls
        const scheduledResponse = await fetch(`/api/models/${user.id}/scheduled-calls`, {
          credentials: 'include',
        });
        
        if (scheduledResponse.ok) {
          const scheduledData = await scheduledResponse.json();
          setScheduledCalls(scheduledData);
        }
        
        // Fetch model settings
        const settingsResponse = await fetch(`/api/models/${user.id}/profile`, {
          credentials: 'include',
        });
        
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          setSettings({
            bio: settingsData.bio || '',
            languages: settingsData.languages || [],
            categories: settingsData.categories || [],
            offerVoiceCalls: settingsData.offerVoiceCalls !== null ? settingsData.offerVoiceCalls : true,
            offerVideoCalls: settingsData.offerVideoCalls !== null ? settingsData.offerVideoCalls : true,
            voiceRate: settingsData.voiceRate || 0,
            videoRate: settingsData.videoRate || 0,
            isAvailable: settingsData.isAvailable !== null ? settingsData.isAvailable : true,
            profileImages: settingsData.profileImages || [],
          });
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user, toast]);
  
  // Update call status
  const updateCallStatus = async (callId: number, status: string) => {
    try {
      const response = await fetch(`/api/calls/${callId}/update-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        // Update local state to reflect the change
        setCallHistory(prevCalls =>
          prevCalls.map(call =>
            call.id === callId ? { ...call, status: status as 'active' | 'completed' | 'cancelled' } : call
          )
        );
        
        toast({
          title: "Success",
          description: `Call status updated to ${status}`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update call status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating call status:', error);
      toast({
        title: "Error",
        description: "An error occurred while updating call status",
        variant: "destructive",
      });
    }
  };
  
  // Update scheduled call status
  const updateScheduledCallStatus = async (callId: number, status: 'confirmed' | 'cancelled') => {
    try {
      const response = await fetch(`/api/scheduled-calls/${callId}/update-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        // Update local state to reflect the change
        setScheduledCalls(prevCalls =>
          prevCalls.map(call =>
            call.id === callId ? { ...call, status } : call
          )
        );
        
        toast({
          title: "Success",
          description: `Scheduled call ${status === 'confirmed' ? 'confirmed' : 'cancelled'}`,
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to ${status} scheduled call`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating scheduled call status:', error);
      toast({
        title: "Error",
        description: "An error occurred while updating scheduled call",
        variant: "destructive",
      });
    }
  };
  
  // Save model settings
  const saveSettings = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/models/${user.id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile settings saved successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save profile settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "An error occurred while saving settings",
        variant: "destructive",
      });
    }
  };
  
  // Add language
  const addLanguage = () => {
    if (!newLanguage.trim()) return;
    
    if (!settings.languages.includes(newLanguage.trim())) {
      setSettings({
        ...settings,
        languages: [...settings.languages, newLanguage.trim()]
      });
    }
    
    setNewLanguage('');
  };
  
  // Remove language
  const removeLanguage = (language: string) => {
    setSettings({
      ...settings,
      languages: settings.languages.filter(lang => lang !== language)
    });
  };
  
  // Add category
  const addCategory = () => {
    if (!newCategory.trim()) return;
    
    if (!settings.categories.includes(newCategory.trim())) {
      setSettings({
        ...settings,
        categories: [...settings.categories, newCategory.trim()]
      });
    }
    
    setNewCategory('');
  };
  
  // Remove category
  const removeCategory = (category: string) => {
    setSettings({
      ...settings,
      categories: settings.categories.filter(cat => cat !== category)
    });
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Loading dashboard...</h1>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Model Dashboard</h1>
        <WalletDisplay label="Earnings" value={balance} isEarnings={true} />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calls">Call History</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Calls</TabsTrigger>
          <TabsTrigger value="settings">Profile Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Completed Calls</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats.completedCalls} / {stats.totalCalls}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Average Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)} / 5.0</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Pending Calls</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats.pendingCalls}</p>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle>Availability Status</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="text-lg">You are currently {settings.isAvailable ? 'available' : 'unavailable'} for calls</p>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={settings.isAvailable}
                    onCheckedChange={(checked) => {
                      setSettings({...settings, isAvailable: checked});
                      // Auto-save availability status change
                      setTimeout(() => saveSettings(), 300);
                    }}
                  />
                  <span>{settings.isAvailable ? 'Available' : 'Unavailable'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="calls">
          <Card>
            <CardHeader>
              <CardTitle>Recent Calls</CardTitle>
            </CardHeader>
            <CardContent>
              {callHistory.length === 0 ? (
                <p className="text-muted-foreground">No call history found.</p>
              ) : (
                <div className="space-y-4">
                  {callHistory.map((call) => (
                    <div key={call.id} className="border p-4 rounded-lg flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <p><span className="font-medium">User:</span> {call.username || 'Anonymous'}</p>
                        <p><span className="font-medium">Type:</span> {call.type === 'voice' ? '🎤 Voice' : '📹 Video'}</p>
                        <p><span className="font-medium">Time:</span> {formatDate(call.startTime)}</p>
                        <p><span className="font-medium">Duration:</span> {call.duration ? `${call.duration} minutes` : 'N/A'}</p>
                        <p><span className="font-medium">Rate:</span> ${call.rate}/min</p>
                        <p><span className="font-medium">Total:</span> ${call.totalCost?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div className="flex items-center space-x-2 md:flex-col md:space-y-2 md:space-x-0">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                          ${call.status === 'active' ? 'bg-green-100 text-green-800' : 
                            call.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                            'bg-red-100 text-red-800'}`
                        }>
                          {call.status.toUpperCase()}
                        </span>
                        
                        {call.status === 'active' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">End Call</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>End Call</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to end this call? This will complete the session and finalize the charges.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => updateCallStatus(call.id, 'completed')}>
                                  End Call
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Calls</CardTitle>
            </CardHeader>
            <CardContent>
              {scheduledCalls.length === 0 ? (
                <p className="text-muted-foreground">No scheduled calls found.</p>
              ) : (
                <div className="space-y-4">
                  {scheduledCalls.map((call) => (
                    <div key={call.id} className="border p-4 rounded-lg flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <p><span className="font-medium">User:</span> {call.username || 'Anonymous'}</p>
                        <p><span className="font-medium">Type:</span> {call.type === 'voice' ? '🎤 Voice' : '📹 Video'}</p>
                        <p><span className="font-medium">Scheduled:</span> {formatDate(call.scheduledTime)}</p>
                        <p><span className="font-medium">Duration:</span> {call.duration} minutes</p>
                        <p><span className="font-medium">Rate:</span> ${call.rate}/min</p>
                        <p><span className="font-medium">Estimated Total:</span> ${(call.rate * call.duration).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                          ${call.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            call.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                            'bg-red-100 text-red-800'}`
                        }>
                          {call.status.toUpperCase()}
                        </span>
                        
                        {call.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateScheduledCallStatus(call.id, 'confirmed')}
                            >
                              Confirm
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline">Cancel</Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Scheduled Call</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel this scheduled call? This cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Call</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => updateScheduledCallStatus(call.id, 'cancelled')}
                                  >
                                    Cancel Call
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={(e) => {
                e.preventDefault();
                saveSettings();
              }}>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    value={settings.bio} 
                    onChange={(e) => setSettings({...settings, bio: e.target.value})}
                    placeholder="Describe yourself and what you offer..."
                    className="min-h-[150px]"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="voiceRate">Voice Call Rate ($ per minute)</Label>
                    <Input 
                      id="voiceRate" 
                      type="number"
                      min="0"
                      step="0.01"
                      value={settings.voiceRate} 
                      onChange={(e) => setSettings({...settings, voiceRate: parseFloat(e.target.value)})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="videoRate">Video Call Rate ($ per minute)</Label>
                    <Input 
                      id="videoRate" 
                      type="number"
                      min="0"
                      step="0.01"
                      value={settings.videoRate} 
                      onChange={(e) => setSettings({...settings, videoRate: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="offerVoiceCalls"
                      checked={settings.offerVoiceCalls}
                      onCheckedChange={(checked) => setSettings({...settings, offerVoiceCalls: checked})}
                    />
                    <Label htmlFor="offerVoiceCalls">Offer Voice Calls</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="offerVideoCalls"
                      checked={settings.offerVideoCalls}
                      onCheckedChange={(checked) => setSettings({...settings, offerVideoCalls: checked})}
                    />
                    <Label htmlFor="offerVideoCalls">Offer Video Calls</Label>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Languages</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {settings.languages.map((lang) => (
                        <div key={lang} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md flex items-center gap-1">
                          <span>{lang}</span>
                          <button 
                            type="button"
                            onClick={() => removeLanguage(lang)}
                            className="text-secondary-foreground/70 hover:text-secondary-foreground"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex">
                      <Input
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        placeholder="Add language..."
                        className="max-w-sm"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={addLanguage}
                        className="ml-2"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Categories</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {settings.categories.map((category) => (
                        <div key={category} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md flex items-center gap-1">
                          <span>{category}</span>
                          <button 
                            type="button"
                            onClick={() => removeCategory(category)}
                            className="text-secondary-foreground/70 hover:text-secondary-foreground"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex">
                      <Input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Add category..."
                        className="max-w-sm"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={addCategory}
                        className="ml-2"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Button type="submit">Save Settings</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModelDashboard;
