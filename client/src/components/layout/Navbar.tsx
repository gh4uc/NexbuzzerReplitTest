
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Menu, Bell, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import WalletDisplay from "@/components/wallet/WalletDisplay";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const [location] = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Define navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { name: "Discover", path: "/discover" },
      { name: "Scheduled Calls", path: "/scheduled-calls" },
    ];

    if (!isAuthenticated) {
      return baseItems;
    }

    if (user?.role === "model") {
      return [
        ...baseItems,
        { name: "Dashboard", path: "/model-dashboard" }
      ];
    }

    if (user?.role === "admin") {
      return [
        ...baseItems,
        { name: "Admin", path: "/admin" }
      ];
    }

    return [
      ...baseItems,
      { name: "Favorites", path: "/favorites" }
    ];
  };

  const navItems = getNavItems();

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    } else if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <a className="font-heading font-bold text-2xl text-primary cursor-pointer">
                  Nexbuzzer
                </a>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link href={item.path} key={item.path}>
                  <a
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location === item.path
                        ? "border-primary text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    {item.name}
                  </a>
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {/* Show wallet balance or earnings based on user role */}
            {isAuthenticated && (
              <>
                {user?.role === "user" && <WalletDisplay label="Wallet Balance" />}
                {user?.role === "model" && <WalletDisplay label="Total Earnings" />}
              </>
            )}

            {/* Notifications dropdown */}
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-4 py-2 text-sm font-medium">Notifications</div>
                  <DropdownMenuSeparator />
                  <div className="p-4 text-sm text-center text-gray-500">No new notifications</div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Profile dropdown */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar>
                      <AvatarImage src={user?.profileImage} alt={user?.username} />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-4 py-2 text-sm font-medium">
                    {user?.username} <span className="text-xs text-muted-foreground capitalize">({user?.role})</span>
                  </div>
                  <DropdownMenuSeparator />
                  {user?.role === "model" && (
                    <DropdownMenuItem>
                      <a href="/model-dashboard" className="w-full">
                        Model Dashboard
                      </a>
                    </DropdownMenuItem>
                  )}
                  {user?.role === "admin" && (
                    <DropdownMenuItem>
                      <Link href="/admin">
                        <a className="w-full">Admin Dashboard</a>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <Link href="/profile">
                      <a className="w-full">Profile</a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/settings">
                      <a className="w-full">Settings</a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-destructive">
                    <LogOut className="h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button className="bg-primary text-white hover:bg-primary/90">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navItems={navItems}
      />
    </nav>
  );
}
