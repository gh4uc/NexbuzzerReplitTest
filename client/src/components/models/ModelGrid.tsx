import { useState } from "react";
import ModelCard from "./ModelCard";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

interface Model {
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
}

interface ModelGridProps {
  initialModels?: Model[];
  queryKey?: string;
  pageSize?: number;
}

export default function ModelGrid({ initialModels, queryKey = "/api/models", pageSize = 8 }: ModelGridProps) {
  const [page, setPage] = useState(1);
  
  const { data, isLoading, isError, refetch } = useQuery<{ models: Model[] }>({
    queryKey: [queryKey],
    enabled: !initialModels
  });
  
  const models = initialModels || data?.models || [];
  const displayedModels = models.slice(0, page * pageSize);
  const hasMore = displayedModels.length < models.length;
  
  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
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
        ))}
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading models</h3>
        <p className="text-gray-500 mb-4">There was a problem loading the models. Please try again.</p>
        <Button 
          variant="default" 
          className="bg-primary text-white hover:bg-primary/90"
          onClick={() => refetch()}
        >
          Retry
        </Button>
      </div>
    );
  }
  
  if (models.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No models found</h3>
        <p className="text-gray-500">Try adjusting your filters or check back later.</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedModels.map((model) => (
          <ModelCard key={model.id} model={model} refetchModels={refetch} />
        ))}
      </div>
      
      {hasMore && (
        <div className="mt-10 mb-6 flex justify-center">
          <Button 
            variant="outline" 
            className="px-6 py-3 border border-gray-300 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
            onClick={handleLoadMore}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
