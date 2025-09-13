import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bell, Trophy, Users, Plus, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { logout } from "@/lib/auth";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavigationProps {
  currentRole: "athlete" | "coach";
  onRoleSwitch: (role: "athlete" | "coach") => void;
}

export default function Navigation({ currentRole, onRoleSwitch }: NavigationProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const { userProfile } = useUser();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isMobile) {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="grid grid-cols-4 py-2">
          <Link href="/dashboard">
            <a className={`flex flex-col items-center py-2 ${location === "/dashboard" ? "text-primary" : "text-muted-foreground"}`}
               data-testid="nav-dashboard">
              <Trophy className="h-5 w-5 mb-1" />
              <span className="text-xs">Dashboard</span>
            </a>
          </Link>
          <Link href="/leaderboard">
            <a className={`flex flex-col items-center py-2 ${location === "/leaderboard" ? "text-primary" : "text-muted-foreground"}`}
               data-testid="nav-leaderboard">
              <Users className="h-5 w-5 mb-1" />
              <span className="text-xs">Leaderboard</span>
            </a>
          </Link>
          <Link href="/talent">
            <a className={`flex flex-col items-center py-2 ${location === "/talent" ? "text-primary" : "text-muted-foreground"}`}
               data-testid="nav-talent">
              <Plus className="h-5 w-5 mb-1" />
              <span className="text-xs">Add Talent</span>
            </a>
          </Link>
          <button 
            onClick={handleLogout}
            className="flex flex-col items-center py-2 text-muted-foreground"
            data-testid="button-logout"
          >
            <User className="h-5 w-5 mb-1" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Trophy className="text-primary h-8 w-8 mr-3" />
              <h1 className="text-xl font-bold text-foreground">TalentHub</h1>
            </div>
            <div className="hidden md:ml-8 md:flex md:space-x-4">
              <Link href="/dashboard">
                <a className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location === "/dashboard" 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground"
                }`} data-testid="nav-dashboard">
                  Dashboard
                </a>
              </Link>
              <Link href="/leaderboard">
                <a className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location === "/leaderboard" 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground"
                }`} data-testid="nav-leaderboard">
                  Leaderboard
                </a>
              </Link>
              <Link href="/talent">
                <a className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location === "/talent" 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground"
                }`} data-testid="nav-talent">
                  Talents
                </a>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Role Switcher */}
            {userProfile?.role && (
              <div className="hidden md:flex bg-muted rounded-lg p-1">
                <Button
                  variant={currentRole === "athlete" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onRoleSwitch("athlete")}
                  className="px-3 py-1 text-sm"
                  data-testid="button-role-athlete"
                >
                  <User className="w-4 h-4 mr-1" />
                  Athlete
                </Button>
                <Button
                  variant={currentRole === "coach" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onRoleSwitch("coach")}
                  className="px-3 py-1 text-sm"
                  data-testid="button-role-coach"
                >
                  <Users className="w-4 h-4 mr-1" />
                  Coach
                </Button>
              </div>
            )}
            
            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="sm" data-testid="button-notifications">
                <Bell className="h-5 w-5" />
              </Button>
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                3
              </Badge>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.photoURL || userProfile?.photoURL || ""} />
                <AvatarFallback>
                  {userProfile?.displayName?.charAt(0) || user?.displayName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="hidden md:flex"
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
