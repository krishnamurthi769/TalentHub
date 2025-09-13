import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertTalentSchema, insertDailyTaskSchema, insertPerformanceRecordSchema, insertInjuryAlertSchema } from "@shared/schema";
import { generateTrainingRecommendations, analyzeInjuryRisk } from "../client/src/lib/openai";

// Check if OpenAI API key is available
const isAIEnabled = !!(process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY);

export async function registerRoutes(app: Express): Promise<Server> {
  
  // User Management Routes
  app.post("/api/user/create", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByFirebaseUid(userData.firebaseUid);
      if (existingUser) {
        // User already exists, return the existing user
        return res.json(existingUser);
      }
      
      // Create new user
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error: any) {
      console.error("Error creating user:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/user/profile", async (req, res) => {
    try {
      // In a real app, get user ID from authenticated session
      const firebaseUid = req.headers["firebase-uid"] as string;
      console.log("Received request for user profile with firebase-uid:", firebaseUid);
      
      if (!firebaseUid) {
        console.log("No firebase-uid header provided");
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUserByFirebaseUid(firebaseUid);
      console.log("Found user:", user);
      
      if (!user) {
        console.log("User not found in database");
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error: any) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/user/profile", async (req, res) => {
    try {
      const firebaseUid = req.headers["firebase-uid"] as string;
      if (!firebaseUid) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUserByFirebaseUid(firebaseUid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.updateUser(user.id, req.body);
      res.json(updatedUser);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Talent Management Routes
  app.post("/api/talents", async (req, res) => {
    try {
      const talentData = insertTalentSchema.parse(req.body);
      const talent = await storage.createTalent(talentData);
      
      // Award points to user
      const user = await storage.getUser(talent.userId);
      if (user) {
        let pointsToAward = 10; // Base points for adding talent
        let bonusPoints = 0;
        
        // Check for first talent bonus
        const userTalents = await storage.getTalentsByUser(user.id);
        if (userTalents.length === 1) {
          bonusPoints += 20; // First talent bonus
        }
        
        // Check for every 5 talents bonus
        if (userTalents.length % 5 === 0) {
          bonusPoints += 50; // Every 5 talents bonus
        }
        
        const totalPoints = pointsToAward + bonusPoints;
        await storage.updateUserPoints(user.id, user.points + totalPoints);
        await storage.updateUserBadge(user.id, user.points + totalPoints);
        
        res.json({ 
          ...talent, 
          pointsAwarded: totalPoints,
          bonusPoints 
        });
      } else {
        res.json({ ...talent, pointsAwarded: 10 });
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/talents/user/:userId", async (req, res) => {
    try {
      const talents = await storage.getTalentsByUser(req.params.userId);
      res.json(talents);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/talents/all", async (req, res) => {
    try {
      const talents = await storage.getAllTalents();
      res.json(talents);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/talents/:id/approve", async (req, res) => {
    try {
      const talent = await storage.approveTalent(req.params.id, req.body.approvedBy);
      res.json(talent);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Daily Tasks Routes
  app.get("/api/tasks/daily", async (req, res) => {
    try {
      const firebaseUid = req.headers["firebase-uid"] as string;
      if (!firebaseUid) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUserByFirebaseUid(firebaseUid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get existing daily tasks for user
      let tasks = await storage.getDailyTasksForUser(user.id);
      
      // If no tasks exist or it's a new day, generate new AI tasks (if AI is enabled)
      if (tasks.length === 0 || shouldGenerateNewTasks(tasks)) {
        if (isAIEnabled) {
          try {
            const metrics = user.metrics as any || { speed: 7, strength: 7, stamina: 7, technique: 7 };
            const recommendations = await generateTrainingRecommendations(
              user.sport || "General",
              metrics,
              user.skillLevel || "beginner",
              []
            );
            
            // Create tasks from AI recommendations
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            for (const rec of recommendations) {
              const taskData = insertDailyTaskSchema.parse({
                title: rec.title,
                description: rec.description,
                points: rec.points,
                category: rec.category,
                difficulty: rec.difficulty,
                aiRecommended: true,
                userId: user.id,
                dueDate: tomorrow,
              });
              
              await storage.createDailyTask(taskData);
            }
          } catch (aiError) {
            console.error("AI task generation failed:", aiError);
            // Continue with fallback tasks below
          }
        }
        
        // Create fallback tasks if AI is disabled or failed
        const existingTasks = await storage.getDailyTasksForUser(user.id);
        if (existingTasks.length === 0) {
          const fallbackTasks = [
            {
              title: "Complete 30-minute practice session",
              description: "Focus on fundamental skills and techniques",
              points: 20,
              category: "training" as const,
              difficulty: "medium" as const,
              aiRecommended: false,
              userId: user.id,
              dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
            {
              title: "Log your nutrition intake",
              description: "Track meals and hydration for better performance",
              points: 10,
              category: "nutrition" as const,
              difficulty: "easy" as const,
              aiRecommended: false,
              userId: user.id,
              dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
          ];
          
          for (const task of fallbackTasks) {
            await storage.createDailyTask(task);
          }
        }
        
        tasks = await storage.getDailyTasksForUser(user.id);
      }
      
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/tasks/:id/complete", async (req, res) => {
    try {
      const task = await storage.completeDailyTask(req.params.id);
      
      if (task) {
        // Award points to user
        const user = await storage.getUser(task.userId!);
        if (user) {
          await storage.updateUserPoints(user.id, user.points + task.points);
          await storage.updateUserBadge(user.id, user.points + task.points);
        }
        
        res.json({ ...task, pointsAwarded: task.points });
      } else {
        res.status(404).json({ message: "Task not found" });
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Achievements Routes
  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.getAllAchievements();
      res.json(achievements);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/achievements/user", async (req, res) => {
    try {
      const firebaseUid = req.headers["firebase-uid"] as string;
      if (!firebaseUid) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUserByFirebaseUid(firebaseUid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const achievements = await storage.getUserAchievements(user.id);
      res.json(achievements);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Leaderboard Routes
  app.get("/api/leaderboard/:scope", async (req, res) => {
    try {
      const scope = req.params.scope;
      const sport = req.query.sport as string;
      const timeframe = req.query.timeframe as string;
      const firebaseUid = req.headers["firebase-uid"] as string;
      
      const leaderboard = await storage.getLeaderboard(scope, sport, timeframe);
      
      let currentUserRank = null;
      if (firebaseUid) {
        const user = await storage.getUserByFirebaseUid(firebaseUid);
        if (user) {
          currentUserRank = await storage.getUserRank(user.id, scope, sport, timeframe);
        }
      }
      
      res.json({
        athletes: leaderboard,
        currentUserRank,
        scope,
        sport: sport || "all",
        timeframe: timeframe || "monthly"
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Coach Routes
  app.get("/api/coach/athletes/:coachId", async (req, res) => {
    try {
      const athletes = await storage.getCoachAthletes(req.params.coachId);
      res.json(athletes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/coach/metrics/:coachId", async (req, res) => {
    try {
      const metrics = await storage.getCoachMetrics(req.params.coachId);
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/coach/analytics/:coachId", async (req, res) => {
    try {
      const analytics = await storage.getCoachAnalytics(req.params.coachId);
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Performance Records Routes
  app.post("/api/performance-records", async (req, res) => {
    try {
      const recordData = insertPerformanceRecordSchema.parse(req.body);
      const record = await storage.createPerformanceRecord(recordData);
      res.json(record);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/performance-records/:userId", async (req, res) => {
    try {
      const records = await storage.getPerformanceRecords(req.params.userId);
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Injury Alerts Routes
  app.get("/api/injury-alerts/:coachId", async (req, res) => {
    try {
      const alerts = await storage.getInjuryAlerts(req.params.coachId);
      res.json(alerts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/injury-alerts", async (req, res) => {
    try {
      const alertData = insertInjuryAlertSchema.parse(req.body);
      const alert = await storage.createInjuryAlert(alertData);
      res.json(alert);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // AI Analysis Routes
  app.post("/api/ai/injury-analysis", async (req, res) => {
    try {
      // Check if AI features are enabled
      if (!isAIEnabled) {
        return res.status(501).json({ 
          message: "AI features are not enabled. Please configure the OPENAI_API_KEY environment variable." 
        });
      }
      
      const { athleteData } = req.body;
      const analysis = await analyzeInjuryRisk(athleteData);
      res.json(analysis);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function shouldGenerateNewTasks(tasks: any[]): boolean {
  if (tasks.length === 0) return true;
  
  const lastTaskDate = new Date(tasks[0].createdAt);
  const today = new Date();
  
  // Check if it's a new day
  return lastTaskDate.toDateString() !== today.toDateString();
}
