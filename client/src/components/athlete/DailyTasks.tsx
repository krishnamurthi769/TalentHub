import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useUser } from "@/contexts/UserContext";
import { CheckCircle, Clock, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DailyTasks() {
  const { userProfile } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dailyTasks, isLoading } = useQuery({
    queryKey: ["/api/tasks/daily"],
    enabled: !!userProfile,
  });

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await apiRequest("PATCH", `/api/tasks/${taskId}/complete`, {});
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/daily"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      toast({
        title: "Task Completed!",
        description: `You earned ${data.pointsAwarded} points!`,
      });
    },
  });

  const handleCompleteTask = (taskId: string) => {
    completeTaskMutation.mutate(taskId);
  };

  if (isLoading) {
    return (
      <Card className="card-hover">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const tasks = Array.isArray(dailyTasks) ? dailyTasks : [];
  const completedTasks = tasks.filter((task: any) => task.completed);
  const completionPercentage = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  const getTaskIcon = (category: string) => {
    switch (category) {
      case "training": return <Zap className="h-4 w-4" />;
      case "nutrition": return <CheckCircle className="h-4 w-4" />;
      case "recovery": return <Clock className="h-4 w-4" />;
      case "analysis": return <CheckCircle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "training": return "text-primary";
      case "nutrition": return "text-accent";
      case "recovery": return "text-secondary";
      case "analysis": return "text-chart-4";
      default: return "text-muted-foreground";
    }
  };

  return (
    <Card className="card-hover" data-testid="card-daily-tasks">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Today's Challenges</CardTitle>
          <div className="text-sm text-muted-foreground" data-testid="text-task-progress">
            {completedTasks.length}/{tasks.length} completed
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Task List */}
        <div className="space-y-4 mb-6">
          {tasks.length > 0 ? (
            tasks.map((task: any) => (
              <div 
                key={task.id} 
                className={`flex items-center space-x-3 p-3 border rounded-lg transition-all ${
                  task.completed 
                    ? "border-accent bg-accent/5" 
                    : "border-border hover:border-primary/50"
                }`}
                data-testid={`task-${task.id}`}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => !task.completed && handleCompleteTask(task.id)}
                  disabled={task.completed || completeTaskMutation.isPending}
                  className="w-6 h-6"
                  data-testid={`checkbox-task-${task.id}`}
                />
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getCategoryColor(task.category)}`}>
                  {getTaskIcon(task.category)}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${task.completed ? "line-through text-muted-foreground" : "text-card-foreground"}`}>
                    {task.title}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center space-x-2">
                    <span>{task.description}</span>
                    {task.aiRecommended && <Badge variant="outline" className="text-xs">AI Recommended</Badge>}
                  </div>
                </div>
                <Badge variant={task.completed ? "secondary" : "default"} data-testid={`task-points-${task.id}`}>
                  +{task.points} pts
                </Badge>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-muted-foreground">No tasks available today</div>
              <div className="text-sm text-muted-foreground mt-1">
                Check back tomorrow for new challenges!
              </div>
            </div>
          )}
        </div>
        
        {/* Progress Bar */}
        {tasks.length > 0 && (
          <div>
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Daily Progress</span>
              <span data-testid="text-completion-percentage">{Math.round(completionPercentage)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" data-testid="progress-daily-tasks" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
