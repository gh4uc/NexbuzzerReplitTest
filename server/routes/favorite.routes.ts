
import { Request, Response, Router } from 'express';
import { requireAuth } from '../middleware/auth';

export function registerFavoriteRoutes(router: Router, storage: any): void {
  router.get("/favorites", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const favorites = await storage.getFavorites(userId);
      
      // Transform the data to match the expected format
      const favoritesWithUser = favorites.map((favorite: any) => ({
        ...favorite.model,
        modelProfile: favorite.model.modelProfile,
        isFavorite: true
      }));

      res.status(200).json({ favorites: favoritesWithUser });
    } catch (error) {
      console.error("Get favorites error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post("/favorites/:modelId", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const modelId = parseInt(req.params.modelId);
      if (isNaN(modelId)) {
        return res.status(400).json({ message: "Invalid model ID" });
      }

      // Check if already favorited
      const isAlreadyFavorite = await storage.isFavorite(userId, modelId);
      if (isAlreadyFavorite) {
        return res.status(400).json({ message: "Model already in favorites" });
      }

      const favorite = await storage.createFavorite({
        userId,
        modelId
      });

      res.status(201).json({ favorite });
    } catch (error) {
      console.error("Add favorite error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.delete("/favorites/:modelId", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const modelId = parseInt(req.params.modelId);
      if (isNaN(modelId)) {
        return res.status(400).json({ message: "Invalid model ID" });
      }

      const success = await storage.deleteFavorite(userId, modelId);
      if (!success) {
        return res.status(404).json({ message: "Favorite not found" });
      }

      res.status(200).json({ message: "Favorite removed" });
    } catch (error) {
      console.error("Remove favorite error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
}
