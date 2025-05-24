import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import WalletDisplay from "@/components/wallet/WalletDisplay";

type NavItem = {
  name: string;
  path: string;
};

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
}

export default function MobileMenu({ isOpen, onClose, navItems }: MobileMenuProps) {
  const [location] = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    } else if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="pt-5 pb-6 px-5">
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <a className="font-heading font-bold text-2xl text-primary cursor-pointer">
              Nexbuzzer
            </a>
          </Link>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        {isAuthenticated && (
          <div className="flex items-center space-x-3 mb-6">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.profileImage} alt={user?.username} />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-base font-medium text-gray-800">
                {user?.firstName} {user?.lastName || user?.username}
              </div>
              {user?.email && (
                <div className="text-sm font-medium text-gray-500">
                  {user.email}
                </div>
              )}
            </div>
          </div>
        )}

        {isAuthenticated && (
          <div className="mb-6">
            <WalletDisplay />
          </div>
        )}

        <div className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location === item.path
                    ? "bg-gray-50 text-primary border-l-4 border-primary"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={onClose}
              >
                {item.name}
              </a>
            </Link>
          ))}
        </div>

        <Separator className="my-6" />

        {isAuthenticated ? (
          <div className="space-y-1">
            {user?.role === "model" && (
              <Link href="/model-dashboard">
                <a
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  onClick={onClose}
                >
                  Model Dashboard
                </a>
              </Link>
            )}
            {user?.role === "admin" && (
              <Link href="/admin">
                <a
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  onClick={onClose}
                >
                  Admin Dashboard
                </a>
              </Link>
            )}
            <Link href="/profile">
              <a
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                onClick={onClose}
              >
                Profile
              </a>
            </Link>
            <Link href="/settings">
              <a
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                onClick={onClose}
              >
                Settings
              </a>
            </Link>
            <button
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-destructive hover:bg-gray-50 hover:text-destructive flex items-center gap-2"
              onClick={() => {
                logout();
                onClose();
              }}
            >
              <LogOut className="h-5 w-5 mr-2" /> Sign out
            </button>
          </div>
        ) : (
          <div className="mt-6">
            <Link href="/auth">
              <Button className="w-full bg-primary text-white hover:bg-primary/90" onClick={onClose}>
                Sign In
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
