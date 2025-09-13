import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trophy, Mail, Lock, UserPlus } from "lucide-react";
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["athlete", "coach"], { required_error: "Please select a role" }),
  sport: z.string().min(1, "Please select a sport"),
  skillLevel: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  age: z.number().min(10).max(100).optional(),
});

export default function Login() {
  const [activeTab, setActiveTab] = useState("login");
  const { toast } = useToast();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      displayName: "",
      role: undefined,
      sport: "",
      skillLevel: "",
      location: "",
      age: undefined,
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest("POST", "/api/user/create", userData);
      return response.json();
    },
  });

  const onLogin = async (data: z.infer<typeof loginSchema>) => {
    try {
      await signInWithEmail(data.email, data.password);
      toast({
        title: "Welcome back!",
        description: "Successfully signed in.",
      });
    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message || "Failed to sign in",
        variant: "destructive",
      });
    }
  };

  const onSignup = async (data: z.infer<typeof signupSchema>) => {
    try {
      const userCredential = await signUpWithEmail(data.email, data.password);
      
      // Create user profile in our database
      await createUserMutation.mutateAsync({
        firebaseUid: userCredential.user.uid,
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        sport: data.sport,
        skillLevel: data.skillLevel,
        location: data.location,
        age: data.age,
        photoURL: userCredential.user.photoURL,
      });

      toast({
        title: "Account Created!",
        description: "Welcome to TalentHub. Your journey begins now!",
      });
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Note: Google sign-in redirects, so success handling happens in AuthContext
    } catch (error: any) {
      toast({
        title: "Google Sign In Failed",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl" data-testid="card-login">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="h-12 w-12 text-primary mr-3" />
            <div>
              <CardTitle className="text-2xl font-bold">TalentHub</CardTitle>
              <p className="text-muted-foreground text-sm">AI-Powered Sports Talent Ecosystem</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="tabs-auth">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">Sign In</TabsTrigger>
              <TabsTrigger value="signup" data-testid="tab-signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="Enter your email" 
                              className="pl-10" 
                              {...field} 
                              data-testid="input-login-email"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="password" 
                              placeholder="Enter your password" 
                              className="pl-10" 
                              {...field} 
                              data-testid="input-login-password"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginForm.formState.isSubmitting}
                    data-testid="button-sign-in"
                  >
                    {loginForm.formState.isSubmitting ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </Form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleGoogleSignIn}
                data-testid="button-google-signin"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                  <FormField
                    control={signupForm.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your full name" 
                            {...field} 
                            data-testid="input-signup-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your email" 
                            {...field} 
                            data-testid="input-signup-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Create a password" 
                            {...field} 
                            data-testid="input-signup-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>I am a</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-role">
                              <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="athlete">Athlete</SelectItem>
                            <SelectItem value="coach">Coach</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="sport"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Sport</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-sport">
                              <SelectValue placeholder="Select your sport" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Cricket">Cricket</SelectItem>
                            <SelectItem value="Football">Football</SelectItem>
                            <SelectItem value="Basketball">Basketball</SelectItem>
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
                    control={signupForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="City, State" 
                            {...field} 
                            data-testid="input-location"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={signupForm.formState.isSubmitting || createUserMutation.isPending}
                    data-testid="button-sign-up"
                  >
                    {(signupForm.formState.isSubmitting || createUserMutation.isPending) ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
