import { useState } from "react";
import Navigation from "@/components/Navigation";
import TalentSubmission from "@/components/athlete/TalentSubmission";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Trophy, Clock, CheckCircle, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";

export default function TalentPage() {
  const { userProfile } = useUser();
  const [currentRole, setCurrentRole] = useState<"athlete" | "coach">("athlete");
  const [searchTerm, setSearchTerm] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: talents, isLoading } = useQuery({
    queryKey: ["/api/talents/user", userProfile?.id],
    enabled: !!userProfile,
  });

  const { data: allTalents } = useQuery({
    queryKey: ["/api/talents/all"],
    enabled: currentRole === "coach",
  });

  const handleRoleSwitch = (role: "athlete" | "coach") => {
    setCurrentRole(role);
  };

  const talentsList = Array.isArray(talents) ? talents : [];
  const filteredTalents = talentsList.filter((talent: any) => {
    const matchesSearch = talent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         talent.sport.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = sportFilter === "all" || talent.sport === sportFilter;
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "approved" && talent.approved) ||
                         (statusFilter === "pending" && !talent.approved);
    
    return matchesSearch && matchesSport && matchesStatus;
  });

  const getStatusIcon = (approved: boolean) => {
    return approved ? (
      <CheckCircle className="h-4 w-4 text-accent" />
    ) : (
      <Clock className="h-4 w-4 text-secondary" />
    );
  };

  const getStatusText = (approved: boolean) => {
    return approved ? "Approved" : "Pending";
  };

  const getStatusVariant = (approved: boolean) => {
    return approved ? "default" : "secondary";
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentRole={currentRole} onRoleSwitch={handleRoleSwitch} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="page-title">
                {currentRole === "athlete" ? "My Talents" : "All Talents"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {currentRole === "athlete" 
                  ? "Manage and track your sports talents" 
                  : "Review and approve athlete talents"}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <Badge variant="outline" data-testid="total-talents">
                {filteredTalents.length} talents
              </Badge>
              {currentRole === "athlete" && (
                <Badge variant="secondary" data-testid="total-points">
                  {userProfile.points} points earned
                </Badge>
              )}
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search talents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
                
                <Select value={sportFilter} onValueChange={setSportFilter}>
                  <SelectTrigger className="w-40" data-testid="select-sport-filter">
                    <SelectValue placeholder="All Sports" />
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
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40" data-testid="select-status-filter">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Talent List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Talents</span>
                    {searchTerm && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSearchTerm("")}
                        data-testid="button-clear-search"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-3 p-4 border rounded-lg animate-pulse">
                          <div className="w-12 h-12 bg-muted rounded-full" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-1/2" />
                            <div className="h-3 bg-muted rounded w-1/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredTalents.length > 0 ? (
                    <div className="space-y-4">
                      {filteredTalents.map((talent: any) => (
                        <div 
                          key={talent.id} 
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                          data-testid={`talent-item-${talent.id}`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                              <Trophy className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-card-foreground" data-testid={`talent-name-${talent.id}`}>
                                {talent.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {talent.sport} • {talent.category}
                              </div>
                              {talent.description && (
                                <div className="text-xs text-muted-foreground mt-1 max-w-md truncate">
                                  {talent.description}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Badge variant={getStatusVariant(talent.approved)} data-testid={`talent-status-${talent.id}`}>
                              {getStatusIcon(talent.approved)}
                              <span className="ml-1">{getStatusText(talent.approved)}</span>
                            </Badge>
                            <Badge variant="outline" data-testid={`talent-points-${talent.id}`}>
                              +{talent.pointsAwarded} pts
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {new Date(talent.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <div className="text-muted-foreground mb-2">
                        {searchTerm ? "No talents found matching your search" : "No talents added yet"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {searchTerm 
                          ? "Try adjusting your search or filters" 
                          : currentRole === "athlete" 
                            ? "Add your first talent to get started!" 
                            : "No talents to review at this time"}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Talent Submission (for athletes only) */}
            {currentRole === "athlete" && (
              <div>
                <TalentSubmission />
              </div>
            )}

            {/* Summary Stats (for coaches) */}
            {currentRole === "coach" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Talent Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Submissions</span>
                        <span className="font-semibold" data-testid="total-submissions">
                          {Array.isArray(allTalents) ? allTalents.length : 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Pending Review</span>
                        <span className="font-semibold text-secondary" data-testid="pending-review">
                          {Array.isArray(allTalents) ? allTalents.filter((t: any) => !t.approved).length : 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Approved</span>
                        <span className="font-semibold text-accent" data-testid="approved-count">
                          {Array.isArray(allTalents) ? allTalents.filter((t: any) => t.approved).length : 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button className="w-full justify-start" variant="outline" data-testid="button-review-talents">
                        <Trophy className="h-4 w-4 mr-2" />
                        Review Pending Talents
                      </Button>
                      <Button className="w-full justify-start" variant="outline" data-testid="button-talent-analytics">
                        <Filter className="h-4 w-4 mr-2" />
                        View Talent Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
