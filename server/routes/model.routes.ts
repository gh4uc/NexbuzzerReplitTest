
import { Request, Response, Router } from 'express';
import { requireAuth } from '../middleware/auth';

export function registerModelRoutes(router: Router, storage: any): void {
  router.get("/models", async (req: Request, res: Response) => {
    try {
      const { available, voiceCalls, videoCalls, languages, categories } = req.query;
      
      // Build filters
      const filters: any = {};
      
      if (available === 'true') {
        filters.isAvailable = true;
      }
      
      if (voiceCalls === 'true') {
        filters.offerVoiceCalls = true;
      }
      
      if (videoCalls === 'true') {
        filters.offerVideoCalls = true;
      }
      
      if (languages) {
        filters.languages = Array.isArray(languages) ? languages : [languages];
      }
      
      if (categories) {
        filters.categories = Array.isArray(categories) ? categories : [categories];
      }
      
      const modelsData = await storage.getAllModels(filters);
      
      // Transform the data to include favorite status if user is logged in
      const userId = req.session?.userId;
      const models = await Promise.all(
        modelsData.map(async (modelData: any) => {
          const { user, ...modelProfile } = modelData;
          
          let isFavorite = false;
          if (userId) {
            isFavorite = await storage.isFavorite(userId, user.id);
          }
          
          return {
            ...user,
            ...modelProfile,
            isFavorite
          };
        })
      );
      
      res.status(200).json({ models });
    } catch (error) {
      console.error("Get models error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.get("/models/:id", async (req: Request, res: Response) => {
    try {
      const modelId = parseInt(req.params.id);
      if (isNaN(modelId)) {
        return res.status(400).json({ message: "Invalid model ID" });
      }

      const modelUser = await storage.getUserWithProfile(modelId);
      if (!modelUser || modelUser.role !== "model") {
        return res.status(404).json({ message: "Model not found" });
      }

      // Check if user has favorited this model
      const userId = req.session?.userId;
      let isFavorite = false;
      if (userId) {
        isFavorite = await storage.isFavorite(userId, modelId);
      }

      const model = {
        ...modelUser,
        isFavorite
      };

      res.status(200).json({ model });
    } catch (error) {
      console.error("Get model error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
}
