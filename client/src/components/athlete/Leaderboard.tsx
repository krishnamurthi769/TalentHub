import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";

export default function Leaderboard() {
  const { userProfile } = useUser();

  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ["/api/leaderboard", "regional"],
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground font-bold text-sm">{rank}</span>;
    }
  };

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1: return "from-yellow-400 to-yellow-600";
      case 2: return "from-gray-300 to-gray-500";
      case 3: return "from-amber-400 to-amber-600";
      default: return "from-muted to-muted";
    }
  };

  if (isLoading) {
    return (
      <Card className="card-hover">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
                <div className="h-4 bg-muted rounded w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const athletes = Array.isArray(leaderboardData?.athletes) ? leaderboardData.athletes : [];
  const currentUserRank = leaderboardData?.currentUserRank || null;

  return (
    <Card className="card-hover" data-testid="card-leaderboard">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Regional Leaderboard</CardTitle>
          <Select defaultValue="regional">
            <SelectTrigger className="w-40" data-testid="select-leaderboard-scope">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regional">Regional</SelectItem>
              <SelectItem value="state">State</SelectItem>
              <SelectItem value="national">National</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {athletes.slice(0, 3).map((athlete: any, index: number) => {
            const rank = index + 1;
            return (
              <div 
                key={athlete.id} 
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  rank === 1 ? "bg-muted/50" : "bg-muted/30"
                }`}
                data-testid={`leaderboard-rank-${rank}`}
              >
                <div className={`w-8 h-8 bg-gradient-to-r ${getRankBgColor(rank)} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                  {rank}
                </div>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={athlete.photoURL || ""} />
                  <AvatarFallback>{athlete.displayName?.charAt(0) || "A"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium text-card-foreground" data-testid={`athlete-name-${rank}`}>
                    {athlete.displayName}
                  </div>
                  <div className="text-sm text-muted-foreground" data-testid={`athlete-sport-${rank}`}>
                    {athlete.sport} • {athlete.skillLevel}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-card-foreground" data-testid={`athlete-points-${rank}`}>
                    {athlete.points.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">points</div>
                </div>
              </div>
            );
          })}
          
          {/* Current User Position */}
          {currentUserRank && currentUserRank.rank > 3 && (
            <div className="border-t border-border pt-3 mt-3">
              <div 
                className="flex items-center space-x-3 p-3 bg-primary/10 rounded-lg border-2 border-primary/20"
                data-testid="leaderboard-current-user"
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {currentUserRank.rank}
                </div>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={userProfile?.photoURL || ""} />
                  <AvatarFallback>{userProfile?.displayName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium text-card-foreground">
                    You ({userProfile?.displayName})
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {userProfile?.sport} • {userProfile?.skillLevel}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary" data-testid="current-user-points">
                    {userProfile?.points.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">points</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
