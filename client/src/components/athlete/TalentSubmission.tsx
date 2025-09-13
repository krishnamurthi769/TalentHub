import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertTalentSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { 
  TrainTrack, 
  Waves, 
  Volleyball, 
  Plus, 
  Trophy,
  Dumbbell,
  Target,
  Clock
} from "lucide-react";
import { z } from "zod";

const formSchema = insertTalentSchema.extend({
  sport: z.string().min(1, "Sport is required"),
  category: z.string().min(1, "Category is required"),
});

export default function TalentSubmission() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { userProfile } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      sport: "",
      category: "",
      description: "",
      userId: userProfile?.id || "",
    },
  });

  const { data: recentTalents } = useQuery({
    queryKey: ["/api/talents/user", userProfile?.id],
    enabled: !!userProfile?.id,
  });

  const addTalentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", "/api/talents", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/talents/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      toast({
        title: "Talent Added Successfully!",
        description: `You earned ${data.pointsAwarded} points for adding "${data.name}"`,
      });
      form.reset();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add talent",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    addTalentMutation.mutate({
      ...data,
      userId: userProfile?.id || "",
    });
  };

  const quickTalents = [
    { icon: TrainTrack, name: "TrainTrack", sport: "Athletics", categories: ["Sprint", "Marathon", "Middle Distance"] },
    { icon: Waves, name: "Swimming", sport: "Aquatics", categories: ["Freestyle", "Butterfly", "Backstroke", "Breaststroke"] },
    { icon: Volleyball, name: "Volleyball", sport: "Volleyball", categories: ["Guard", "Forward", "Center"] },
    { icon: Trophy, name: "Cricket", sport: "Cricket", categories: ["Batsman", "Bowler", "All-Rounder", "Wicket Keeper"] },
  ];

  const handleQuickAdd = (talent: typeof quickTalents[0], category: string) => {
    form.setValue("name", `${talent.name} - ${category}`);
    form.setValue("sport", talent.sport);
    form.setValue("category", category);
    setIsDialogOpen(true);
  };

  const recentSubmissions = Array.isArray(recentTalents) ? recentTalents.slice(0, 3) : [];

  return (
    <Card className="card-hover" data-testid="card-talent-submission">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Add New Talent</CardTitle>
          <Badge variant="secondary" data-testid="badge-points-per-talent">
            +10 pts per talent
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Quick Add Talents */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {quickTalents.map((talent) => (
            <Dialog key={talent.name}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="p-4 h-auto border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-all group"
                  data-testid={`button-quick-add-${talent.name.toLowerCase()}`}
                >
                  <div className="text-center">
                    <talent.icon className="h-8 w-8 mx-auto mb-2 text-muted-foreground group-hover:text-primary" />
                    <div className="font-medium text-card-foreground">{talent.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {talent.categories.slice(0, 2).join(", ")}
                    </div>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add {talent.name} Talent</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-2">
                  {talent.categories.map((category) => (
                    <Button
                      key={category}
                      variant="outline"
                      onClick={() => handleQuickAdd(talent, category)}
                      className="justify-start"
                      data-testid={`button-category-${category.toLowerCase().replace(" ", "-")}`}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>

        {/* Custom Talent Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full mb-6" 
              variant="default"
              data-testid="button-add-custom-talent"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Talent
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Talent</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Talent Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Cricket Wicket Keeper" 
                          {...field} 
                          data-testid="input-talent-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sport</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-sport">
                            <SelectValue placeholder="Select a sport" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Cricket">Cricket</SelectItem>
                          <SelectItem value="Football">Football</SelectItem>
                          <SelectItem value="Volleyball">Volleyball</SelectItem>
                          <SelectItem value="Tennis">Tennis</SelectItem>
                          <SelectItem value="Athletics">Athletics</SelectItem>
                          <SelectItem value="Swimming">Swimming</SelectItem>
                          <SelectItem value="Badminton">Badminton</SelectItem>
                          <SelectItem value="Hockey">Hockey</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category/Position</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., All-Rounder, Striker, Guard" 
                          {...field} 
                          data-testid="input-category"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your talent, achievements, or specializations..."
                          {...field} 
                          value={field.value || ""}
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={addTalentMutation.isPending}
                    data-testid="button-submit-talent"
                  >
                    {addTalentMutation.isPending ? "Adding..." : "Add Talent"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Recent Submissions */}
        <div>
          <h4 className="font-semibold text-card-foreground mb-3">Recent Submissions</h4>
          <div className="space-y-2">
            {recentSubmissions.length > 0 ? (
              recentSubmissions.map((talent: any) => (
                <div 
                  key={talent.id} 
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  data-testid={`recent-talent-${talent.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <Trophy className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium text-card-foreground" data-testid={`talent-name-${talent.id}`}>
                        {talent.name}
                      </div>
                      <div className="text-sm text-muted-foreground" data-testid={`talent-date-${talent.id}`}>
                        Added {new Date(talent.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" data-testid={`talent-points-${talent.id}`}>
                    +{talent.pointsAwarded} pts
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No talents added yet. Add your first talent to get started!
              </div>
            )}
          </div>
        </div>
        
        {/* Bonus Alert */}
        <div className="mt-4 p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-secondary" />
            <div className="text-sm">
              <span className="font-medium text-card-foreground">Bonus Alert!</span>
              <span className="text-muted-foreground"> Every 5 talents earns +50 bonus points</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
