import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import ProfileCard from "@/components/athlete/ProfileCard";
import PerformanceMetrics from "@/components/athlete/PerformanceMetrics";
import AchievementsBadges from "@/components/athlete/AchievementsBadges";
import DailyTasks from "@/components/athlete/DailyTasks";
import Leaderboard from "@/components/athlete/Leaderboard";
import TalentSubmission from "@/components/athlete/TalentSubmission";
import AthleteManagement from "@/components/coach/AthleteManagement";
import QuickActions from "@/components/coach/QuickActions";
import TeamAnalytics from "@/components/coach/TeamAnalytics";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/contexts/UserContext";
import { Trophy, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

// Define the type for coach metrics
interface CoachMetrics {
  athleteCount: number;
  activeSessions: number;
  avgPerformance: number;
  injuryAlerts: number;
  avgImprovement: number;
}

export default function Dashboard() {
  const { userProfile, loading, error, refetchUser } = useUser();
  const [currentRole, setCurrentRole] = useState<"athlete" | "coach">("athlete");

  // Set role based on user profile
  useEffect(() => {
    if (userProfile?.role) {
      setCurrentRole(userProfile.role as "athlete" | "coach");
    }
  }, [userProfile]);

  const { data: coachMetrics } = useQuery<CoachMetrics>({
    queryKey: ["/api/coach/metrics", userProfile?.id],
    enabled: !!userProfile && userProfile.role === "coach",
  });

  const handleRoleSwitch = (role: "athlete" | "coach") => {
    setCurrentRole(role);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-32 bg-muted rounded animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-64 bg-muted rounded animate-pulse" />
              <div className="lg:col-span-2 h-64 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertTitle>Error Loading Dashboard</AlertTitle>
            <AlertDescription className="mb-4">
              {error}
            </AlertDescription>
            <Button onClick={refetchUser} variant="outline">
              Try Again
            </Button>
          </Alert>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-32 bg-muted rounded animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-64 bg-muted rounded animate-pulse" />
              <div className="lg:col-span-2 h-64 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentRole={currentRole} onRoleSwitch={handleRoleSwitch} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentRole === "athlete" ? (
          <div className="space-y-8" data-testid="athlete-dashboard">
            {/* Welcome Section */}
            <div className="gradient-bg rounded-xl p-6 text-white">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2" data-testid="welcome-message">
                    Welcome back, {userProfile.displayName}!
                  </h2>
                  <p className="text-white/80">Ready to push your limits today? Let's achieve greatness!</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold" data-testid="total-points">
                      {userProfile.points}
                    </div>
                    <div className="text-sm text-white/80">Total Points</div>
                  </div>
                  <div className="h-12 w-px bg-white/20"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold" data-testid="regional-rank">
                      #{userProfile.rank || "NR"}
                    </div>
                    <div className="text-sm text-white/80">Regional Rank</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Top Row: Profile Card and Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ProfileCard />
              <PerformanceMetrics />
            </div>
            
            {/* Middle Row: Achievements and Daily Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AchievementsBadges />
              <DailyTasks />
            </div>
            
            {/* Bottom Row: Leaderboard and Talent Submission */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Leaderboard />
              <TalentSubmission />
            </div>
          </div>
        ) : (
          <div className="space-y-8" data-testid="coach-dashboard">
            {/* Coach Welcome Section */}
            <div className="gradient-bg rounded-xl p-6 text-white">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2" data-testid="coach-welcome-message">
                    Welcome, Coach {userProfile.displayName}
                  </h2>
                  <p className="text-white/80">Monitor your athletes' progress and help them achieve excellence!</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold" data-testid="athlete-count">
                      {coachMetrics?.athleteCount ?? 0}
                    </div>
                    <div className="text-sm text-white/80">Active Athletes</div>
                  </div>
                  <div className="h-12 w-px bg-white/20"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold" data-testid="avg-improvement">
                      +{coachMetrics?.avgImprovement ?? 0}%
                    </div>
                    <div className="text-sm text-white/80">Avg Improvement</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Coach Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">Total Athletes</p>
                      <p className="text-2xl font-bold text-card-foreground" data-testid="metric-total-athletes">
                        {coachMetrics?.athleteCount ?? 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="text-primary h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-accent">+3 this month</div>
                </CardContent>
              </Card>
              
              <Card className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">Active Sessions</p>
                      <p className="text-2xl font-bold text-card-foreground" data-testid="metric-active-sessions">
                        {coachMetrics?.activeSessions ?? 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                      <Trophy className="text-secondary h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-accent">2 ending today</div>
                </CardContent>
              </Card>
              
              <Card className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">Avg Performance</p>
                      <p className="text-2xl font-bold text-card-foreground" data-testid="metric-avg-performance">
                        {coachMetrics?.avgPerformance?.toFixed(1) ?? "0.0"}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-chart-3/10 rounded-full flex items-center justify-center">
                      <TrendingUp className="text-chart-3 h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-accent">+0.7 this week</div>
                </CardContent>
              </Card>
              
              <Card className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">Injury Alerts</p>
                      <p className="text-2xl font-bold text-card-foreground" data-testid="metric-injury-alerts">
                        {coachMetrics?.injuryAlerts ?? 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                      <AlertTriangle className="text-destructive h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-destructive">Requires attention</div>
                </CardContent>
              </Card>
            </div>
            
            {/* Coach Content Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AthleteManagement />
              <QuickActions />
            </div>
            
            {/* Team Analytics */}
            <TeamAnalytics />
          </div>
        )}
      </div>
    </div>
  );
}