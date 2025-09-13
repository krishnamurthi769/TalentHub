import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Flame, Medal, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";

export default function AchievementsBadges() {
  const { userProfile } = useUser();

  const { data: userAchievements } = useQuery({
    queryKey: ["/api/achievements/user"],
    enabled: !!userProfile,
  });

  const { data: allAchievements } = useQuery({
    queryKey: ["/api/achievements"],
  });

  const recentAchievements = (userAchievements || []).slice(0, 2);

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case "Bronze": return <Medal className="text-white h-4 w-4" />;
      case "Silver": return <Medal className="text-white h-4 w-4" />;
      case "Gold": return <Medal className="text-white h-4 w-4" />;
      case "Platinum": return <Crown className="text-white h-4 w-4" />;
      default: return <Medal className="text-white h-4 w-4" />;
    }
  };

  const getBadgeGradient = (badge: string) => {
    switch (badge) {
      case "Bronze": return "from-amber-400 to-amber-600";
      case "Silver": return "from-gray-300 to-gray-500";
      case "Gold": return "from-yellow-300 to-yellow-500";
      case "Platinum": return "from-purple-400 to-purple-600";
      default: return "from-amber-400 to-amber-600";
    }
  };

  const badgeCollection = ["Bronze", "Silver", "Gold", "Platinum"];
  const userBadgeLevel = userProfile?.badge || "Bronze";
  const unlockedBadges = badgeCollection.indexOf(userBadgeLevel) + 1;

  return (
    <Card className="card-hover" data-testid="card-achievements">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Achievements & Badges</CardTitle>
          <Button variant="ghost" size="sm" data-testid="button-view-all-achievements">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Recent Achievements */}
        <div className="space-y-4 mb-6">
          {recentAchievements.length > 0 ? (
            recentAchievements.map((achievement: any, index: number) => (
              <div 
                key={achievement.id || index} 
                className="flex items-center space-x-3 p-3 bg-accent/10 rounded-lg"
                data-testid={`achievement-${index}`}
              >
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                  <Star className="text-white h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-card-foreground">
                    {achievement.achievement?.name || "New Achievement"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {achievement.achievement?.description || "Achievement unlocked"}
                  </div>
                </div>
                <Badge variant="secondary" data-testid={`achievement-points-${index}`}>
                  +{achievement.pointsEarned || 50} pts
                </Badge>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <div className="text-muted-foreground text-sm">No recent achievements</div>
              <div className="text-xs text-muted-foreground mt-1">
                Complete tasks to unlock achievements!
              </div>
            </div>
          )}
        </div>
        
        {/* Badge Collection */}
        <div>
          <h4 className="font-semibold text-card-foreground mb-3">Badge Collection</h4>
          <div className="grid grid-cols-4 gap-3">
            {badgeCollection.map((badge, index) => {
              const isUnlocked = index < unlockedBadges;
              return (
                <div key={badge} className="text-center" data-testid={`badge-${badge.toLowerCase()}`}>
                  <div 
                    className={`w-12 h-12 bg-gradient-to-br ${getBadgeGradient(badge)} rounded-full flex items-center justify-center mx-auto mb-1 ${
                      !isUnlocked ? "opacity-30" : ""
                    }`}
                  >
                    {getBadgeIcon(badge)}
                  </div>
                  <div className={`text-xs ${isUnlocked ? "text-foreground" : "text-muted-foreground"}`}>
                    {badge}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
