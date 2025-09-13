import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, ClipboardList, Award, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";

export default function AthleteManagement() {
  const { userProfile } = useUser();
  const [selectedSport, setSelectedSport] = useState("all");

  const { data: athletes, isLoading } = useQuery({
    queryKey: ["/api/coach/athletes", userProfile?.id],
    enabled: !!userProfile && userProfile.role === "coach",
  });

  if (isLoading) {
    return (
      <Card className="lg:col-span-2 card-hover">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
                <div className="h-4 bg-muted rounded w-16" />
                <div className="h-4 bg-muted rounded w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const athletesList = Array.isArray(athletes) ? athletes : [];
  const filteredAthletes = selectedSport === "all" 
    ? athletesList
    : athletesList.filter((athlete: any) => athlete.sport === selectedSport);

  return (
    <Card className="lg:col-span-2 card-hover" data-testid="card-athlete-management">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>My Athletes</CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger className="w-32" data-testid="select-sport-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                <SelectItem value="Cricket">Cricket</SelectItem>
                <SelectItem value="Football">Football</SelectItem>
                <SelectItem value="Tennis">Tennis</SelectItem>
                <SelectItem value="Basketball">Basketball</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" data-testid="button-add-athlete">
              <Plus className="w-4 h-4 mr-1" />
              Add Athlete
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredAthletes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Athlete</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Sport</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Performance</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Progress</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAthletes.map((athlete: any) => {
                  const metrics = athlete.metrics || {};
                  const avgPerformance = Object.keys(metrics).length > 0
                    ? Object.values(metrics).reduce((a: any, b: any) => a + b, 0) / Object.values(metrics).length 
                    : 0;
                  const isImproving = Math.random() > 0.5; // In real app, calculate from performance history
                  
                  return (
                    <tr key={athlete.id} className="border-b border-border" data-testid={`athlete-row-${athlete.id}`}>
                      <td className="py-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={athlete.photoURL || ""} />
                            <AvatarFallback>{athlete.displayName?.charAt(0) || "A"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-card-foreground" data-testid={`athlete-name-${athlete.id}`}>
                              {athlete.displayName}
                            </div>
                            <div className="text-sm text-muted-foreground" data-testid={`athlete-age-${athlete.id}`}>
                              {athlete.age} years
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-card-foreground" data-testid={`athlete-sport-${athlete.id}`}>
                        {athlete.sport}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium text-card-foreground" data-testid={`athlete-performance-${athlete.id}`}>
                            {avgPerformance.toFixed(1)}
                          </div>
                          <div className={`text-xs flex items-center ${isImproving ? "text-accent" : "text-destructive"}`}>
                            {isImproving ? (
                              <>+0.3 <TrendingUp className="w-3 h-3 ml-1" /></>
                            ) : (
                              <>-0.1 <TrendingDown className="w-3 h-3 ml-1" /></>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="w-20">
                          <Progress value={avgPerformance * 10} className="h-2" />
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            data-testid={`button-view-${athlete.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            data-testid={`button-assign-task-${athlete.id}`}
                          >
                            <ClipboardList className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            data-testid={`button-award-${athlete.id}`}
                          >
                            <Award className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-2">No athletes found</div>
            <div className="text-sm text-muted-foreground">
              {selectedSport === "all" 
                ? "Start by adding athletes to your coaching roster" 
                : `No athletes found for ${selectedSport}`}
            </div>
            <Button className="mt-4" data-testid="button-add-first-athlete">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Athlete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
