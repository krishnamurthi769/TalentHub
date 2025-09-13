import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Medal } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export default function ProfileCard() {
  const { userProfile } = useUser();

  if (!userProfile) return null;

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "Bronze": return "from-amber-400 to-amber-600";
      case "Silver": return "from-gray-300 to-gray-500";
      case "Gold": return "from-yellow-400 to-yellow-600";
      case "Platinum": return "from-purple-400 to-purple-600";
      default: return "from-amber-400 to-amber-600";
    }
  };

  const getBadgeThresholds = () => {
    const thresholds = { Bronze: 50, Silver: 100, Gold: 200, Platinum: 500 };
    return thresholds;
  };

  const getProgressToNextBadge = () => {
    const thresholds = getBadgeThresholds();
    const currentPoints = userProfile.points;
    
    if (currentPoints >= thresholds.Platinum) return { progress: 100, nextBadge: "Platinum", pointsNeeded: 0 };
    if (currentPoints >= thresholds.Gold) return { 
      progress: ((currentPoints - thresholds.Gold) / (thresholds.Platinum - thresholds.Gold)) * 100, 
      nextBadge: "Platinum", 
      pointsNeeded: thresholds.Platinum - currentPoints 
    };
    if (currentPoints >= thresholds.Silver) return { 
      progress: ((currentPoints - thresholds.Silver) / (thresholds.Gold - thresholds.Silver)) * 100, 
      nextBadge: "Gold", 
      pointsNeeded: thresholds.Gold - currentPoints 
    };
    if (currentPoints >= thresholds.Bronze) return { 
      progress: ((currentPoints - thresholds.Bronze) / (thresholds.Silver - thresholds.Bronze)) * 100, 
      nextBadge: "Silver", 
      pointsNeeded: thresholds.Silver - currentPoints 
    };
    
    return { 
      progress: (currentPoints / thresholds.Bronze) * 100, 
      nextBadge: "Bronze", 
      pointsNeeded: thresholds.Bronze - currentPoints 
    };
  };

  const { progress, nextBadge, pointsNeeded } = getProgressToNextBadge();

  return (
    <Card className="card-hover" data-testid="card-profile">
      <CardContent className="p-6">
        <div className="text-center">
          <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary">
            <AvatarImage src={userProfile.photoURL || ""} />
            <AvatarFallback className="text-2xl">
              {userProfile.displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <h3 className="text-xl font-semibold text-card-foreground mb-1" data-testid="text-display-name">
            {userProfile.displayName}
          </h3>
          <p className="text-muted-foreground mb-2" data-testid="text-sport">
            {userProfile.sport} • {userProfile.skillLevel}
          </p>
          <p className="text-sm text-muted-foreground mb-4" data-testid="text-location">
            {userProfile.location}
          </p>
          
          {/* Current Badge */}
          <div className="flex items-center justify-center mb-4">
            <div className={`bg-gradient-to-r ${getBadgeColor(userProfile.badge)} p-3 rounded-full badge-animation`}>
              <Medal className="text-white h-6 w-6" />
            </div>
            <div className="ml-3 text-left">
              <div className="font-semibold text-card-foreground" data-testid="text-current-badge">
                {userProfile.badge} Athlete
              </div>
              <div className="text-sm text-muted-foreground" data-testid="text-points-to-next">
                {pointsNeeded > 0 ? `${pointsNeeded} pts to ${nextBadge}` : "Max Level!"}
              </div>
            </div>
          </div>
          
          {/* Progress to Next Badge */}
          {pointsNeeded > 0 && (
            <>
              <Progress value={progress} className="mb-2" data-testid="progress-badge" />
              <p className="text-xs text-muted-foreground" data-testid="text-progress-percentage">
                {Math.round(progress)}% to {nextBadge} Badge
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
