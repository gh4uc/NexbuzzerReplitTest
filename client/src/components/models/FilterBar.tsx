import { useState } from "react";
import { FilterIcon, SortAscIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

interface FilterBarProps {
  onFilterChange: (filters: FilterOptions) => void;
  onSortChange: (sortOption: string) => void;
}

export interface FilterOptions {
  voiceCalls: boolean;
  videoCalls: boolean;
  availableNow: boolean;
  languages: string[];
  ageRange: [number, number];
  categories: string[];
}

const availableLanguages = ["English", "Spanish", "French", "German", "Chinese", "Russian", "Korean"];
const availableCategories = ["Psychology", "Wellness", "Yoga", "Technology", "Music", "Art", "Fitness", "Nutrition", "Comedy"];

export default function FilterBar({ onFilterChange, onSortChange }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    voiceCalls: true,
    videoCalls: false,
    availableNow: true,
    languages: ["English"],
    ageRange: [25, 35],
    categories: [],
  });

  const [activeFilters, setActiveFilters] = useState<string[]>([
    "Voice Calls",
    "English",
    "Available Now",
    "Age: 25-35",
  ]);

  const handleFilterChange = (updatedFilters: Partial<FilterOptions>) => {
    const newFilters = { ...filters, ...updatedFilters };
    setFilters(newFilters);
    
    // Update active filters display
    const newActiveFilters: string[] = [];
    
    if (newFilters.voiceCalls) newActiveFilters.push("Voice Calls");
    if (newFilters.videoCalls) newActiveFilters.push("Video Calls");
    if (newFilters.availableNow) newActiveFilters.push("Available Now");
    
    newFilters.languages.forEach(lang => {
      newActiveFilters.push(lang);
    });
    
    newFilters.categories.forEach(cat => {
      newActiveFilters.push(cat);
    });
    
    newActiveFilters.push(`Age: ${newFilters.ageRange[0]}-${newFilters.ageRange[1]}`);
    
    setActiveFilters(newActiveFilters);
    onFilterChange(newFilters);
  };

  const removeFilter = (filter: string) => {
    const newActiveFilters = activeFilters.filter(f => f !== filter);
    setActiveFilters(newActiveFilters);
    
    // Update actual filter object
    const newFilters = { ...filters };
    
    if (filter === "Voice Calls") newFilters.voiceCalls = false;
    if (filter === "Video Calls") newFilters.videoCalls = false;
    if (filter === "Available Now") newFilters.availableNow = false;
    
    if (filter.startsWith("Age:")) {
      // Reset to default age range
      newFilters.ageRange = [18, 60];
    } else if (availableLanguages.includes(filter)) {
      newFilters.languages = newFilters.languages.filter(lang => lang !== filter);
    } else if (availableCategories.includes(filter)) {
      newFilters.categories = newFilters.categories.filter(cat => cat !== filter);
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleLanguage = (language: string) => {
    const languageIndex = filters.languages.indexOf(language);
    const newLanguages = [...filters.languages];
    
    if (languageIndex === -1) {
      newLanguages.push(language);
    } else {
      newLanguages.splice(languageIndex, 1);
    }
    
    handleFilterChange({ languages: newLanguages });
  };

  const toggleCategory = (category: string) => {
    const categoryIndex = filters.categories.indexOf(category);
    const newCategories = [...filters.categories];
    
    if (categoryIndex === -1) {
      newCategories.push(category);
    } else {
      newCategories.splice(categoryIndex, 1);
    }
    
    handleFilterChange({ categories: newCategories });
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h1 className="text-2xl font-heading font-semibold text-gray-900 mb-4 md:mb-0">Discover Models</h1>
        
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <SortAscIcon className="mr-2 h-4 w-4" />
                Sort by
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onSortChange("availability")}>
                Availability
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange("priceAsc")}>
                Price: Low to High
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange("priceDesc")}>
                Price: High to Low
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange("nameAsc")}>
                Name: A to Z
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <FilterIcon className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Call Type</h4>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="voice" 
                      checked={filters.voiceCalls}
                      onCheckedChange={(checked) => handleFilterChange({ voiceCalls: checked as boolean })}
                    />
                    <Label htmlFor="voice">Voice Calls</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="video" 
                      checked={filters.videoCalls}
                      onCheckedChange={(checked) => handleFilterChange({ videoCalls: checked as boolean })}
                    />
                    <Label htmlFor="video">Video Calls</Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Availability</h4>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="available" 
                      checked={filters.availableNow}
                      onCheckedChange={(checked) => handleFilterChange({ availableNow: checked as boolean })}
                    />
                    <Label htmlFor="available">Available Now</Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Age Range: {filters.ageRange[0]} - {filters.ageRange[1]}</h4>
                  <Slider
                    defaultValue={[25, 35]}
                    min={18}
                    max={60}
                    step={1}
                    value={filters.ageRange}
                    onValueChange={(value) => handleFilterChange({ ageRange: value as [number, number] })}
                  />
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Languages</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {availableLanguages.map(language => (
                      <div key={language} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`lang-${language}`} 
                          checked={filters.languages.includes(language)}
                          onCheckedChange={() => toggleLanguage(language)}
                        />
                        <Label htmlFor={`lang-${language}`}>{language}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Categories</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {availableCategories.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`cat-${category}`} 
                          checked={filters.categories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <Label htmlFor={`cat-${category}`}>{category}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Active Filters */}
      <div className="flex flex-wrap gap-2">
        {activeFilters.map((filter) => (
          <Badge key={filter} variant="secondary" className="flex items-center gap-1 bg-gray-100 text-gray-800">
            {filter}
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => removeFilter(filter)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
