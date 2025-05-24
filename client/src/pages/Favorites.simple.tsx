import { useState, useEffect } from "react";
import { Heart, Search, Filter, X, Star, User, Phone, Video, Trash2, MapPin, Grid, List, CalendarDays, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";

interface Model {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  city?: string;
  country?: string;
  gender?: string;
  profileImage?: string;
  bio?: string;
  languages?: string[];
  categories?: string[];
  offerVoiceCalls: boolean;
  offerVideoCalls: boolean;
  voiceRate: number;
  videoRate: number;
  isAvailable: boolean;
  isOnline: boolean;
  profileImages?: string[];
  rating: number;
  reviewCount: number;
  isFavorite: boolean;
  lastActive?: string;
  createdAt: string;
  favoriteNotes?: string;
  favoritedAt?: string;
}

export default function FavoritesSimple() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterAvailability, setFilterAvailability] = useState<string>("all");
  const [showRemoveDialog, setShowRemoveDialog] = useState<boolean>(false);
  const [modelToRemove, setModelToRemove] = useState<Model | null>(null);
  const [showNoteDialog, setShowNoteDialog] = useState<boolean>(false);
  const [modelForNote, setModelForNote] = useState<Model | null>(null);
  const [noteText, setNoteText] = useState<string>("");
  const [demoModels, setDemoModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Generate a set of demo models for the favorites page
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const models: Model[] = [
        {
          id: 1,
          username: "sophia_model",
          firstName: "Sophia",
          lastName: "Taylor",
          age: 28,
          city: "Los Angeles",
          country: "USA",
          gender: "female",
          profileImage: "https://randomuser.me/api/portraits/women/22.jpg",
          bio: "I love deep conversations about psychology and personal growth. Let's talk about mindfulness and self-improvement!",
          languages: ["English", "Spanish"],
          categories: ["Psychology", "Meditation"],
          offerVoiceCalls: true,
          offerVideoCalls: true,
          voiceRate: 2.99,
          videoRate: 5.99,
          isAvailable: true,
          isOnline: true,
          profileImages: [
            "https://randomuser.me/api/portraits/women/22.jpg",
            "https://randomuser.me/api/portraits/women/23.jpg",
          ],
          rating: 4.8,
          reviewCount: 156,
          isFavorite: true,
          createdAt: "2023-01-15T12:00:00Z",
          lastActive: "2023-05-20T14:35:00Z",
          favoritedAt: "2023-02-10T09:15:00Z",
          favoriteNotes: "Great conversations about mindfulness techniques, book recommendations were excellent."
        },
        {
          id: 2,
          username: "emma_j",
          firstName: "Emma",
          lastName: "Johnson",
          age: 26,
          city: "New York",
          country: "USA",
          gender: "female",
          profileImage: "https://randomuser.me/api/portraits/women/28.jpg",
          bio: "Professional relationship advisor and certified life coach. Happy to provide advice on dating, relationships, or personal development.",
          languages: ["English", "French"],
          categories: ["Relationships", "Career Advice"],
          offerVoiceCalls: true,
          offerVideoCalls: true,
          voiceRate: 3.49,
          videoRate: 6.99,
          isAvailable: false,
          isOnline: false,
          profileImages: [
            "https://randomuser.me/api/portraits/women/28.jpg",
            "https://randomuser.me/api/portraits/women/29.jpg",
          ],
          rating: 4.9,
          reviewCount: 203,
          isFavorite: true,
          createdAt: "2023-03-05T15:30:00Z",
          lastActive: "2023-05-19T19:42:00Z",
          favoritedAt: "2023-04-22T16:45:00Z"
        },
        {
          id: 3,
          username: "alex_fitness",
          firstName: "Alex",
          lastName: "Morgan",
          age: 31,
          city: "Miami",
          country: "USA",
          gender: "male",
          profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
          bio: "Certified personal trainer and nutrition specialist. Let's talk about your fitness goals and how to reach them!",
          languages: ["English"],
          categories: ["Fitness", "Nutrition"],
          offerVoiceCalls: true,
          offerVideoCalls: true,
          voiceRate: 2.99,
          videoRate: 5.49,
          isAvailable: true,
          isOnline: true,
          profileImages: [
            "https://randomuser.me/api/portraits/men/32.jpg",
            "https://randomuser.me/api/portraits/men/33.jpg",
          ],
          rating: 4.7,
          reviewCount: 89,
          isFavorite: true,
          createdAt: "2022-11-18T09:20:00Z",
          lastActive: "2023-05-20T10:15:00Z",
          favoritedAt: "2023-01-05T11:30:00Z",
          favoriteNotes: "Great workout tips, helped me create a custom fitness plan that actually works!"
        },
        {
          id: 4,
          username: "mia_astrology",
          firstName: "Mia",
          lastName: "Garcia",
          age: 29,
          city: "Austin",
          country: "USA",
          gender: "female",
          profileImage: "https://randomuser.me/api/portraits/women/35.jpg",
          bio: "Professional astrologer and tarot reader. Let me help you understand your life path and future possibilities.",
          languages: ["English", "Portuguese"],
          categories: ["Astrology", "Tarot"],
          offerVoiceCalls: true,
          offerVideoCalls: false,
          voiceRate: 3.99,
          videoRate: 0,
          isAvailable: true,
          isOnline: false,
          profileImages: [
            "https://randomuser.me/api/portraits/women/35.jpg",
            "https://randomuser.me/api/portraits/women/36.jpg",
          ],
          rating: 4.6,
          reviewCount: 112,
          isFavorite: true,
          createdAt: "2022-10-05T14:20:00Z",
          lastActive: "2023-05-18T16:33:00Z",
          favoritedAt: "2023-03-12T14:20:00Z"
        },
        {
          id: 5,
          username: "james_tech",
          firstName: "James",
          lastName: "Wilson",
          age: 34,
          city: "San Francisco",
          country: "USA",
          gender: "male",
          profileImage: "https://randomuser.me/api/portraits/men/42.jpg",
          bio: "Tech consultant and software engineer. Need help choosing tech products or understanding the digital world? I've got you covered.",
          languages: ["English"],
          categories: ["Technology", "Career Advice"],
          offerVoiceCalls: true,
          offerVideoCalls: true,
          voiceRate: 4.99,
          videoRate: 8.99,
          isAvailable: true,
          isOnline: true,
          profileImages: [
            "https://randomuser.me/api/portraits/men/42.jpg",
            "https://randomuser.me/api/portraits/men/43.jpg",
          ],
          rating: 4.9,
          reviewCount: 76,
          isFavorite: true,
          createdAt: "2023-02-12T11:15:00Z",
          lastActive: "2023-05-20T09:45:00Z",
          favoritedAt: "2023-04-01T10:10:00Z",
          favoriteNotes: "Excellent tech product recommendations, saved me from making several expensive mistakes."
        }
      ];
      setDemoModels(models);
      setIsLoading(false);
    }, 1500);
  }, []);

  // Filter and sort logic
  const filteredModels = demoModels.filter(model => {
    // Search term filter
    const searchMatch = searchTerm === "" || 
      model.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.categories?.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase())) ||
      model.languages?.some(lang => lang.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Category filter
    const categoryMatch = filterCategory === "all" || 
      model.categories?.includes(filterCategory);
    
    // Availability filter
    const availabilityMatch = 
      filterAvailability === "all" || 
      (filterAvailability === "available" && model.isAvailable) ||
      (filterAvailability === "online" && model.isOnline);
    
    return searchMatch && categoryMatch && availabilityMatch;
  });

  // Sort the models based on the selected sort option
  const sortedModels = [...filteredModels].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.favoritedAt || "").getTime() - new Date(a.favoritedAt || "").getTime();
      case "name":
        return (a.firstName || a.username).localeCompare(b.firstName || b.username);
      case "rating":
        return b.rating - a.rating;
      case "price_low":
        return a.voiceRate - b.voiceRate;
      case "price_high":
        return b.voiceRate - a.voiceRate;
      default:
        return 0;
    }
  });

  // Get all unique categories from models
  const allCategories = Array.from(
    new Set(demoModels.flatMap(model => model.categories || []))
  ).sort();

  // Format date to readable string
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Handle removing model from favorites
  const handleRemoveFavorite = (model: Model) => {
    setModelToRemove(model);
    setShowRemoveDialog(true);
  };

  // Confirm removal of model from favorites
  const confirmRemoveFavorite = () => {
    if (!modelToRemove) return;
    
    // Update the model list
    setDemoModels(prevModels => 
      prevModels.filter(model => model.id !== modelToRemove.id)
    );
    
    // Show success message
    toast({
      title: "Removed from favorites",
      description: `${modelToRemove.firstName || modelToRemove.username} has been removed from your favorites.`,
    });
    
    // Close dialog
    setShowRemoveDialog(false);
    setModelToRemove(null);
  };

  // Handle adding/editing note
  const handleNoteClick = (model: Model) => {
    setModelForNote(model);
    setNoteText(model.favoriteNotes || "");
    setShowNoteDialog(true);
  };

  // Save note
  const saveNote = () => {
    if (!modelForNote) return;
    
    // Update the model with new note
    setDemoModels(prevModels => 
      prevModels.map(model => 
        model.id === modelForNote.id 
          ? { ...model, favoriteNotes: noteText } 
          : model
      )
    );
    
    // Show success message
    toast({
      title: "Note saved",
      description: "Your note has been saved successfully.",
    });
    
    // Close dialog
    setShowNoteDialog(false);
    setModelForNote(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-2xl font-heading font-semibold text-gray-900 mb-4 md:mb-0">Your Favorite Models</h1>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-primary text-white" : ""}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-primary text-white" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Search and filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search favorites by name, category, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search className="h-4 w-4" />
              </div>
              {searchTerm && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <span>Sort by</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recently added</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="rating">Highest rated</SelectItem>
                  <SelectItem value="price_low">Price: Low to high</SelectItem>
                  <SelectItem value="price_high">Price: High to low</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <span>Category</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {allCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterAvailability} onValueChange={setFilterAvailability}>
                <SelectTrigger className="w-[160px]">
                  <User className="h-4 w-4 mr-2" />
                  <span>Availability</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All models</SelectItem>
                  <SelectItem value="online">Online now</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
            {Array.from({ length: 4 }).map((_, index) => (
              viewMode === "grid" ? (
                <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden h-[450px] animate-pulse">
                  <div className="bg-gray-200 h-60 w-full"></div>
                  <div className="p-4">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                    <div className="h-16 bg-gray-200 rounded mb-4"></div>
                    <div className="flex gap-1 mb-4">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                      <div className="flex gap-2">
                        <div className="h-5 bg-gray-200 rounded w-20"></div>
                      </div>
                      <div className="h-9 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="bg-gray-200 h-16 w-16 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                      <div className="h-12 bg-gray-200 rounded w-full mb-3"></div>
                      <div className="flex gap-2 mb-2">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div>
                      <div className="h-10 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        ) : sortedModels.length > 0 ? (
          <>
            <div className="mb-4 text-gray-500 text-sm">
              Showing {sortedModels.length} of {demoModels.length} favorites
            </div>
            
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedModels.map((model) => {
                  const displayName = model.firstName 
                    ? `${model.firstName}${model.age ? `, ${model.age}` : ''}`
                    : model.username;
                  
                  const location = model.city && model.country 
                    ? `${model.city}, ${model.country}`
                    : model.city || model.country || "";
                  
                  return (
                    <Card key={model.id} className="overflow-hidden transition-transform hover:shadow-md">
                      <div className="relative">
                        <img 
                          src={model.profileImage} 
                          alt={`${displayName} profile picture`} 
                          className="w-full h-60 object-cover"
                        />
                        <div className="absolute top-3 right-3 flex space-x-2">
                          {model.isOnline ? (
                            <Badge variant="default" className="bg-green-500 text-white flex items-center">
                              <div className="w-2 h-2 rounded-full bg-white mr-1"></div> Online
                            </Badge>
                          ) : model.isAvailable ? (
                            <Badge variant="default" className="bg-blue-500 text-white flex items-center">
                              <div className="w-2 h-2 rounded-full bg-white mr-1"></div> Available
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-500 text-white flex items-center">
                              <div className="w-2 h-2 rounded-full bg-white mr-1"></div> Away
                            </Badge>
                          )}
                        </div>
                        <div className="absolute top-3 left-3">
                          <div className="flex items-center bg-black/60 text-white px-2 py-1 rounded text-xs">
                            <Star className="h-3 w-3 text-yellow-400 mr-1" />
                            <span>{model.rating}</span>
                            <span className="mx-1">•</span>
                            <span>{model.reviewCount} reviews</span>
                          </div>
                        </div>
                      </div>
                      
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-heading font-medium text-gray-900">
                              {displayName}
                            </h3>
                            {location && (
                              <div className="flex items-center text-sm text-gray-500">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span>{location}</span>
                              </div>
                            )}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-accent -mt-1 -mr-2"
                            onClick={() => handleRemoveFavorite(model)}
                            title="Remove from favorites"
                          >
                            <Heart className="h-5 w-5 fill-current" />
                          </Button>
                        </div>
                        
                        {model.bio && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{model.bio}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {model.categories?.slice(0, 3).map((cat) => (
                            <Badge key={cat} variant="outline" className="bg-gray-100 text-gray-800 font-normal text-xs">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                          <div>
                            <div className="flex flex-col gap-1">
                              {model.offerVoiceCalls && (
                                <div className="flex items-center text-accent text-sm">
                                  <Phone className="h-3 w-3 mr-1" />
                                  <span className="font-medium">${model.voiceRate}/min</span>
                                </div>
                              )}
                              {model.offerVideoCalls && (
                                <div className="flex items-center text-accent text-sm">
                                  <Video className="h-3 w-3 mr-1" />
                                  <span className="font-medium">${model.videoRate}/min</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNoteClick(model)}
                              className="mr-1 h-8"
                            >
                              {model.favoriteNotes ? (
                                <span className="text-xs">View Note</span>
                              ) : (
                                <span className="text-xs">Add Note</span>
                              )}
                            </Button>
                            
                            <Button 
                              variant="default" 
                              size="sm"
                              className="bg-primary text-white hover:bg-primary/90 h-8"
                            >
                              Connect
                            </Button>
                          </div>
                        </div>
                        
                        {model.favoritedAt && (
                          <div className="text-xs text-gray-400 mt-2">
                            Added {formatDate(model.favoritedAt)}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedModels.map((model) => {
                  const displayName = model.firstName 
                    ? `${model.firstName} ${model.lastName || ""}${model.age ? `, ${model.age}` : ''}`
                    : model.username;
                  
                  const location = model.city && model.country 
                    ? `${model.city}, ${model.country}`
                    : model.city || model.country || "";
                  
                  return (
                    <Card key={model.id} className="overflow-hidden hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={model.profileImage} alt={displayName} />
                              <AvatarFallback>{model.firstName?.charAt(0) || model.username.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="absolute -top-1 -right-1">
                              {model.isOnline ? (
                                <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                              ) : model.isAvailable ? (
                                <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                              ) : (
                                <div className="w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-heading font-medium text-gray-900 flex items-center">
                                  {displayName}
                                  <div className="ml-2 flex items-center text-sm">
                                    <Star className="h-3 w-3 text-yellow-400 mr-1" />
                                    <span>{model.rating}</span>
                                    <span className="text-gray-400 mx-1">•</span>
                                    <span className="text-gray-400">{model.reviewCount} reviews</span>
                                  </div>
                                </h3>
                                
                                {location && (
                                  <div className="flex items-center text-sm text-gray-500 mb-1">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    <span>{location}</span>
                                  </div>
                                )}
                              </div>
                              
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-accent"
                                onClick={() => handleRemoveFavorite(model)}
                                title="Remove from favorites"
                              >
                                <Heart className="h-5 w-5 fill-current" />
                              </Button>
                            </div>
                            
                            {model.bio && (
                              <p className="text-gray-600 text-sm mb-2">{model.bio}</p>
                            )}
                            
                            <div className="flex flex-wrap gap-1 mb-2">
                              {model.categories?.map((cat) => (
                                <Badge key={cat} variant="outline" className="bg-gray-100 text-gray-800 font-normal text-xs">
                                  {cat}
                                </Badge>
                              ))}
                              {model.languages?.map((lang) => (
                                <Badge key={lang} variant="outline" className="bg-blue-50 text-blue-800 font-normal text-xs">
                                  {lang}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex gap-3">
                                {model.offerVoiceCalls && (
                                  <div className="flex items-center text-accent text-sm">
                                    <Phone className="h-3 w-3 mr-1" />
                                    <span className="font-medium">${model.voiceRate}/min</span>
                                  </div>
                                )}
                                {model.offerVideoCalls && (
                                  <div className="flex items-center text-accent text-sm">
                                    <Video className="h-3 w-3 mr-1" />
                                    <span className="font-medium">${model.videoRate}/min</span>
                                  </div>
                                )}
                                {model.favoritedAt && (
                                  <div className="flex items-center text-xs text-gray-400">
                                    <CalendarDays className="h-3 w-3 mr-1" />
                                    <span>Added {formatDate(model.favoritedAt)}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleNoteClick(model)}
                                  className="h-8"
                                >
                                  {model.favoriteNotes ? "View Note" : "Add Note"}
                                </Button>
                                
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  className="bg-primary text-white hover:bg-primary/90 h-8"
                                >
                                  Connect
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-900 mb-2">No favorites found</h2>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterCategory !== "all" || filterAvailability !== "all" ? (
                  "No favorites match your current filters. Try adjusting your search criteria."
                ) : (
                  "You haven't added any models to your favorites list yet. Browse models and click the heart icon to add them to your favorites."
                )}
              </p>
              <Button 
                variant="default" 
                className="bg-primary text-white hover:bg-primary/90"
                onClick={() => window.location.href = "/discover"}
              >
                Browse Models
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
      
      {/* Remove from favorites confirmation dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove from Favorites</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {modelToRemove?.firstName || modelToRemove?.username} from your favorites?
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={modelToRemove?.profileImage} />
              <AvatarFallback>{modelToRemove?.firstName?.charAt(0) || modelToRemove?.username?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button 
              variant="outline"
              onClick={() => setShowRemoveDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRemoveFavorite}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add/Edit Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {modelForNote?.favoriteNotes ? "Edit Note" : "Add Note"}
            </DialogTitle>
            <DialogDescription>
              Add a personal note about {modelForNote?.firstName || modelForNote?.username} to help you remember details about your conversations.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center mb-4">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={modelForNote?.profileImage} />
              <AvatarFallback>{modelForNote?.firstName?.charAt(0) || modelForNote?.username?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="text-sm font-medium">
                {modelForNote?.firstName 
                  ? `${modelForNote.firstName} ${modelForNote.lastName || ""}`
                  : modelForNote?.username}
              </h4>
              <p className="text-xs text-gray-500">
                {modelForNote?.categories?.join(", ")}
              </p>
            </div>
          </div>
          
          <textarea
            className="w-full border rounded-md p-3 h-32 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Write your personal notes here..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
          
          <DialogFooter className="sm:justify-between">
            <Button 
              variant="outline"
              onClick={() => setShowNoteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={saveNote}
              className="bg-primary text-white hover:bg-primary/90"
            >
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}