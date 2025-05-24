
// Model type with isFavorite property
export interface ModelWithFavorite {
  id: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  age: number | null;
  city: string | null;
  country: string | null;
  profileImage: string | null;
  bio: string | null;
  languages: string[] | null;
  categories: string[] | null;
  offerVoiceCalls: boolean | null;
  offerVideoCalls: boolean | null;
  voiceRate: number | null;
  videoRate: number | null;
  isAvailable: boolean | null;
  profileImages: string[] | null;
  isFavorite?: boolean; // Optional property for favorites
}

// Update ButtonProps to match the correct variant types
export interface ButtonExtendedProps {
  variant?: "default" | "destructive" | "secondary" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}
