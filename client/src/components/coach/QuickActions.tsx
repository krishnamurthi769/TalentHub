import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Medal, AlertTriangle, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";

export default function QuickActions() {
  const { userProfile } = useUser();

  const { data: injuryAlerts } = useQuery({
    queryKey: ["/api/injury-alerts", userProfile?.id],
    enabled: !!userProfile && userProfile.role === "coach",
  });

  const activeAlerts = Array.isArray(injuryAlerts) ? injuryAlerts.filter((alert: any) => !alert.resolved) : [];
  const highPriorityAlerts = activeAlerts.filter((alert: any) => alert.riskLevel === "high" || alert.riskLevel === "critical");

  return (
    <div className="space-y-6">
      <Card className="card-hover" data-testid="card-quick-actions">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button 
              className="w-full justify-start"
              variant="outline"
              data-testid="button-create-session"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Plus className="text-primary h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-card-foreground">Create Session</div>
                  <div className="text-sm text-muted-foreground">Schedule training</div>
                </div>
              </div>
            </Button>
            
            <Button 
              className="w-full justify-start"
              variant="outline"
              data-testid="button-generate-report"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                  <FileText className="text-secondary h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-card-foreground">Generate Report</div>
                  <div className="text-sm text-muted-foreground">Download PDF</div>
                </div>
              </div>
            </Button>
            
            <Button 
              className="w-full justify-start"
              variant="outline"
              data-testid="button-award-badges"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <Medal className="text-accent h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-card-foreground">Award Badges</div>
                  <div className="text-sm text-muted-foreground">Recognize achievements</div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Injury Alerts */}
      <Card className="card-hover" data-testid="card-injury-alerts">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Injury Alerts</CardTitle>
            {activeAlerts.length > 0 && (
              <Badge variant={highPriorityAlerts.length > 0 ? "destructive" : "secondary"}>
                {activeAlerts.length}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeAlerts.length > 0 ? (
              activeAlerts.slice(0, 3).map((alert: any) => (
                <div 
                  key={alert.id} 
                  className={`flex items-center space-x-3 p-3 rounded-lg border ${
                    alert.riskLevel === "high" || alert.riskLevel === "critical"
                      ? "bg-destructive/10 border-destructive/20"
                      : "bg-secondary/10 border-secondary/20"
                  }`}
                  data-testid={`injury-alert-${alert.id}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    alert.riskLevel === "high" || alert.riskLevel === "critical"
                      ? "bg-destructive/20"
                      : "bg-secondary/20"
                  }`}>
                    {alert.riskLevel === "high" || alert.riskLevel === "critical" ? (
                      <AlertTriangle className="text-destructive h-4 w-4" />
                    ) : (
                      <Info className="text-secondary h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-card-foreground" data-testid={`alert-athlete-${alert.id}`}>
                      {alert.athlete?.displayName || "Unknown Athlete"}
                    </div>
                    <div className="text-sm text-muted-foreground" data-testid={`alert-description-${alert.id}`}>
                      {alert.riskLevel} risk - {alert.bodyPart}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <div className="text-muted-foreground text-sm">No active injury alerts</div>
                <div className="text-xs text-muted-foreground mt-1">
                  All athletes are healthy!
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
