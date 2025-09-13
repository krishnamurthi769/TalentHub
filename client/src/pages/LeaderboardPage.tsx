import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, Crown, TrendingUp, MapPin, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";

export default function LeaderboardPage() {
  const { userProfile } = useUser();
  const [currentRole, setCurrentRole] = useState<"athlete" | "coach">("athlete");
  const [scope, setScope] = useState("regional");
  const [sport, setSport] = useState("all");
  const [timeframe, setTimeframe] = useState("monthly");

  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ["/api/leaderboard", scope, sport, timeframe],
  });

  const handleRoleSwitch = (role: "athlete" | "coach") => {
    setCurrentRole(role);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Award className="h-6 w-6 text-amber-600" />;
      default: return null;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return "from-yellow-400 to-yellow-600";
      case 2: return "from-gray-300 to-gray-500";
      case 3: return "from-amber-400 to-amber-600";
      default: return "from-muted to-muted";
    }
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case "Platinum": return <Crown className="h-4 w-4" />;
      default: return <Medal className="h-4 w-4" />;
    }
  };

  const getScopeTitle = () => {
    const scopeMap: Record<string, string> = {
      regional: "Regional Rankings",
      state: "State Rankings", 
      national: "National Rankings",
      global: "Global Rankings"
    };
    return scopeMap[scope] || "Rankings";
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const athletes = leaderboardData?.athletes || [];
  const currentUserRank = leaderboardData?.currentUserRank || null;
  const topThree = athletes.slice(0, 3);
  const remaining = athletes.slice(3);

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentRole={currentRole} onRoleSwitch={handleRoleSwitch} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-2" data-testid="page-title">
              {getScopeTitle()}
            </h1>
            <p className="text-muted-foreground">
              Compete with athletes across {scope === "regional" ? "your region" : scope === "state" ? "your state" : "the nation"}
            </p>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <Select value={scope} onValueChange={setScope}>
                    <SelectTrigger className="w-40" data-testid="select-scope">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regional">Regional</SelectItem>
                      <SelectItem value="state">State</SelectItem>
                      <SelectItem value="national">National</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <Select value={sport} onValueChange={setSport}>
                    <SelectTrigger className="w-40" data-testid="select-sport">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sports</SelectItem>
                      <SelectItem value="Cricket">Cricket</SelectItem>
                      <SelectItem value="Football">Football</SelectItem>
                      <SelectItem value="Basketball">Basketball</SelectItem>
                      <SelectItem value="Tennis">Tennis</SelectItem>
                      <SelectItem value="Athletics">Athletics</SelectItem>
                      <SelectItem value="Swimming">Swimming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger className="w-40" data-testid="select-timeframe">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">This Week</SelectItem>
                      <SelectItem value="monthly">This Month</SelectItem>
                      <SelectItem value="yearly">This Year</SelectItem>
                      <SelectItem value="alltime">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="text-center space-y-3">
                        <div className="w-16 h-16 bg-muted rounded-full mx-auto" />
                        <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
                        <div className="h-3 bg-muted rounded w-1/3 mx-auto" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : athletes.length > 0 ? (
            <>
              {/* Top 3 Podium */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topThree.map((athlete: any, index: number) => {
                  const rank = index + 1;
                  const isCurrentUser = athlete.id === userProfile?.id;
                  
                  return (
                    <Card 
                      key={athlete.id} 
                      className={`card-hover ${rank === 1 ? "md:order-2 transform md:scale-110" : rank === 2 ? "md:order-1" : "md:order-3"} ${
                        isCurrentUser ? "ring-2 ring-primary" : ""
                      }`}
                      data-testid={`podium-${rank}`}
                    >
                      <CardContent className="p-6">
                        <div className="text-center">
                          {/* Rank Badge */}
                          <div className={`w-16 h-16 bg-gradient-to-r ${getRankBadge(rank)} rounded-full flex items-center justify-center mx-auto mb-4 relative`}>
                            {getRankIcon(rank) || (
                              <span className="text-white font-bold text-lg">{rank}</span>
                            )}
                            {rank === 1 && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                                <Crown className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Avatar */}
                          <Avatar className="w-20 h-20 mx-auto mb-4 border-4 border-primary">
                            <AvatarImage src={athlete.photoURL || ""} />
                            <AvatarFallback className="text-lg">
                              {athlete.displayName?.charAt(0) || "A"}
                            </AvatarFallback>
                          </Avatar>

                          {/* Name and Details */}
                          <h3 className="text-xl font-bold text-card-foreground mb-1" data-testid={`athlete-name-${rank}`}>
                            {athlete.displayName}
                            {isCurrentUser && <span className="text-primary ml-1">(You)</span>}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-2" data-testid={`athlete-sport-${rank}`}>
                            {athlete.sport} • {athlete.skillLevel}
                          </p>
                          <p className="text-xs text-muted-foreground mb-4">
                            {athlete.location}
                          </p>

                          {/* Points */}
                          <div className="space-y-2">
                            <div className="text-3xl font-bold text-card-foreground" data-testid={`athlete-points-${rank}`}>
                              {athlete.points.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">points</div>
                            
                            {/* Badge */}
                            <Badge variant="outline" className="mt-2">
                              {getBadgeIcon(athlete.badge)}
                              <span className="ml-1">{athlete.badge}</span>
                            </Badge>
                          </div>

                          {/* Improvement */}
                          <div className="mt-4 flex items-center justify-center text-xs text-accent">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +{Math.floor(Math.random() * 50) + 10}% this month
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Remaining Rankings */}
              {remaining.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Complete Rankings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {remaining.map((athlete: any, index: number) => {
                        const rank = index + 4;
                        const isCurrentUser = athlete.id === userProfile?.id;
                        
                        return (
                          <div 
                            key={athlete.id} 
                            className={`flex items-center space-x-4 p-4 rounded-lg transition-colors ${
                              isCurrentUser ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/30"
                            }`}
                            data-testid={`ranking-${rank}`}
                          >
                            {/* Rank */}
                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center font-bold text-muted-foreground">
                              {rank}
                            </div>

                            {/* Avatar */}
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={athlete.photoURL || ""} />
                              <AvatarFallback>{athlete.displayName?.charAt(0) || "A"}</AvatarFallback>
                            </Avatar>

                            {/* Details */}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <div className="font-medium text-card-foreground" data-testid={`athlete-name-${rank}`}>
                                  {athlete.displayName}
                                </div>
                                {isCurrentUser && <Badge variant="secondary" className="text-xs">You</Badge>}
                              </div>
                              <div className="text-sm text-muted-foreground" data-testid={`athlete-details-${rank}`}>
                                {athlete.sport} • {athlete.location}
                              </div>
                            </div>

                            {/* Badge */}
                            <Badge variant="outline">
                              {getBadgeIcon(athlete.badge)}
                              <span className="ml-1">{athlete.badge}</span>
                            </Badge>

                            {/* Points */}
                            <div className="text-right">
                              <div className="font-bold text-card-foreground" data-testid={`athlete-points-${rank}`}>
                                {athlete.points.toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground">points</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Current User Position (if not in top results) */}
              {currentUserRank && currentUserRank.rank > athletes.length && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Position</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                        {currentUserRank.rank}
                      </div>
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={userProfile.photoURL || ""} />
                        <AvatarFallback>{userProfile.displayName?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium text-card-foreground">
                          You ({userProfile.displayName})
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {userProfile.sport} • {userProfile.location}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {getBadgeIcon(userProfile.badge)}
                        <span className="ml-1">{userProfile.badge}</span>
                      </Badge>
                      <div className="text-right">
                        <div className="font-bold text-primary" data-testid="current-user-points">
                          {userProfile.points.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">points</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-12">
                <div className="text-center">
                  <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">
                    No Rankings Available
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to compete in this category!
                  </p>
                  <Button data-testid="button-start-competing">
                    Start Competing
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
