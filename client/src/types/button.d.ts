
import { ButtonVariant, ButtonSize } from "@/components/ui/button-variants";

export interface ButtonProps {
  variant?: "default" | "destructive" | "secondary" | "outline";
  size?: ButtonSize;
  asChild?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}
