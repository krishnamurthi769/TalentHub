import { 
  type User, 
  type InsertUser, 
  type Talent, 
  type InsertTalent,
  type Achievement,
  type InsertAchievement,
  type UserAchievement,
  type InsertUserAchievement,
  type DailyTask,
  type InsertDailyTask,
  type CoachAthlete,
  type InsertCoachAthlete,
  type PerformanceRecord,
  type InsertPerformanceRecord,
  type InjuryAlert,
  type InsertInjuryAlert
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  updateUserPoints(id: string, points: number): Promise<void>;
  updateUserBadge(id: string, points: number): Promise<void>;
  getUserRank(userId: string, scope: string, sport?: string, timeframe?: string): Promise<any>;

  // Talent management
  createTalent(talent: InsertTalent): Promise<Talent>;
  getTalentsByUser(userId: string): Promise<Talent[]>;
  getAllTalents(): Promise<Talent[]>;
  approveTalent(id: string, approvedBy: string): Promise<Talent>;

  // Achievement system
  getAllAchievements(): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getUserAchievements(userId: string): Promise<any[]>;
  unlockAchievement(userId: string, achievementId: string, pointsEarned: number): Promise<UserAchievement>;

  // Daily tasks
  createDailyTask(task: InsertDailyTask): Promise<DailyTask>;
  getDailyTasksForUser(userId: string): Promise<DailyTask[]>;
  completeDailyTask(taskId: string): Promise<DailyTask | undefined>;

  // Leaderboard
  getLeaderboard(scope: string, sport?: string, timeframe?: string): Promise<User[]>;

  // Coach features
  getCoachAthletes(coachId: string): Promise<User[]>;
  getCoachMetrics(coachId: string): Promise<any>;
  getCoachAnalytics(coachId: string): Promise<any>;
  addCoachAthlete(coachAthlete: InsertCoachAthlete): Promise<CoachAthlete>;

  // Performance tracking
  createPerformanceRecord(record: InsertPerformanceRecord): Promise<PerformanceRecord>;
  getPerformanceRecords(userId: string): Promise<PerformanceRecord[]>;

  // Injury alerts
  createInjuryAlert(alert: InsertInjuryAlert): Promise<InjuryAlert>;
  getInjuryAlerts(coachId: string): Promise<InjuryAlert[]>;
  resolveInjuryAlert(alertId: string): Promise<InjuryAlert>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private talents: Map<string, Talent>;
  private achievements: Map<string, Achievement>;
  private userAchievements: Map<string, UserAchievement>;
  private dailyTasks: Map<string, DailyTask>;
  private coachAthletes: Map<string, CoachAthlete>;
  private performanceRecords: Map<string, PerformanceRecord>;
  private injuryAlerts: Map<string, InjuryAlert>;

  constructor() {
    this.users = new Map();
    this.talents = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.dailyTasks = new Map();
    this.coachAthletes = new Map();
    this.performanceRecords = new Map();
    this.injuryAlerts = new Map();
    
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default achievements
    const achievements = [
      {
        id: randomUUID(),
        name: "First Steps",
        description: "Added your first talent",
        icon: "trophy",
        pointsRequired: 10,
        type: "milestone",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Bronze Athlete",
        description: "Reached 50 points",
        icon: "medal",
        pointsRequired: 50,
        badge: "Bronze",
        type: "milestone",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Silver Athlete",
        description: "Reached 100 points",
        icon: "medal",
        pointsRequired: 100,
        badge: "Silver",
        type: "milestone",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Gold Athlete",
        description: "Reached 200 points",
        icon: "medal",
        pointsRequired: 200,
        badge: "Gold",
        type: "milestone",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Platinum Athlete",
        description: "Reached 500 points",
        icon: "crown",
        pointsRequired: 500,
        badge: "Platinum",
        type: "milestone",
        createdAt: new Date(),
      },
    ];

    achievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement as Achievement);
    });
  }

  // User management
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.firebaseUid === firebaseUid);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "athlete",
      points: 0,
      badge: "Bronze",
      rank: null,
      metrics: {
        speed: Math.random() * 4 + 6, // 6-10 range
        strength: Math.random() * 4 + 6,
        stamina: Math.random() * 4 + 6,
        technique: Math.random() * 4 + 6,
      },
      createdAt: now,
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserPoints(id: string, points: number): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.points = points;
      this.users.set(id, user);
    }
  }

  async updateUserBadge(id: string, points: number): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      if (points >= 500) user.badge = "Platinum";
      else if (points >= 200) user.badge = "Gold";
      else if (points >= 100) user.badge = "Silver";
      else if (points >= 50) user.badge = "Bronze";
      
      this.users.set(id, user);
    }
  }

  async getUserRank(userId: string, scope: string, sport?: string, timeframe?: string): Promise<any> {
    const users = Array.from(this.users.values())
      .filter(u => u.role === "athlete")
      .filter(u => !sport || sport === "all" || u.sport === sport)
      .sort((a, b) => b.points - a.points);

    const rank = users.findIndex(u => u.id === userId) + 1;
    return rank > 0 ? { rank, user: users[rank - 1] } : null;
  }

  // Talent management
  async createTalent(insertTalent: InsertTalent): Promise<Talent> {
    const id = randomUUID();
    const talent: Talent = { 
      ...insertTalent, 
      id,
      category: insertTalent.category || null,
      description: insertTalent.description || null,
      approved: false,
      approvedBy: null,
      pointsAwarded: 10,
      createdAt: new Date(),
    };
    
    this.talents.set(id, talent);
    return talent;
  }

  async getTalentsByUser(userId: string): Promise<Talent[]> {
    return Array.from(this.talents.values())
      .filter(talent => talent.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getAllTalents(): Promise<Talent[]> {
    return Array.from(this.talents.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async approveTalent(id: string, approvedBy: string): Promise<Talent> {
    const talent = this.talents.get(id);
    if (!talent) {
      throw new Error("Talent not found");
    }
    
    talent.approved = true;
    talent.approvedBy = approvedBy;
    this.talents.set(id, talent);
    return talent;
  }

  // Achievement system
  async getAllAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const id = randomUUID();
    const achievement: Achievement = { 
      ...insertAchievement, 
      id,
      badge: insertAchievement.badge || null,
      createdAt: new Date(),
    };
    
    this.achievements.set(id, achievement);
    return achievement;
  }

  async getUserAchievements(userId: string): Promise<any[]> {
    const userAchievements = Array.from(this.userAchievements.values())
      .filter(ua => ua.userId === userId);
    
    return userAchievements.map(ua => {
      const achievement = this.achievements.get(ua.achievementId);
      return { ...ua, achievement };
    });
  }

  async unlockAchievement(userId: string, achievementId: string, pointsEarned: number): Promise<UserAchievement> {
    const id = randomUUID();
    const userAchievement: UserAchievement = {
      id,
      userId,
      achievementId,
      pointsEarned,
      unlockedAt: new Date(),
    };
    
    this.userAchievements.set(id, userAchievement);
    return userAchievement;
  }

  // Daily tasks
  async createDailyTask(insertTask: InsertDailyTask): Promise<DailyTask> {
    const id = randomUUID();
    const task: DailyTask = { 
      ...insertTask, 
      id,
      points: insertTask.points || 10,
      difficulty: insertTask.difficulty || "medium",
      aiRecommended: insertTask.aiRecommended || false,
      userId: insertTask.userId || null,
      completed: false,
      completedAt: null,
      createdAt: new Date(),
    };
    
    this.dailyTasks.set(id, task);
    return task;
  }

  async getDailyTasksForUser(userId: string): Promise<DailyTask[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.dailyTasks.values())
      .filter(task => 
        (task.userId === userId || task.userId === null) &&
        new Date(task.dueDate).getTime() >= today.getTime()
      )
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  async completeDailyTask(taskId: string): Promise<DailyTask | undefined> {
    const task = this.dailyTasks.get(taskId);
    if (task && !task.completed) {
      task.completed = true;
      task.completedAt = new Date();
      this.dailyTasks.set(taskId, task);
      return task;
    }
    return task;
  }

  // Leaderboard
  async getLeaderboard(scope: string, sport?: string, timeframe?: string): Promise<User[]> {
    return Array.from(this.users.values())
      .filter(user => user.role === "athlete")
      .filter(user => !sport || sport === "all" || user.sport === sport)
      .sort((a, b) => b.points - a.points)
      .slice(0, 50); // Top 50 athletes
  }

  // Coach features
  async getCoachAthletes(coachId: string): Promise<User[]> {
    const coachRelationships = Array.from(this.coachAthletes.values())
      .filter(relation => relation.coachId === coachId);
    
    const athleteIds = coachRelationships.map(relation => relation.athleteId);
    
    return Array.from(this.users.values())
      .filter(user => athleteIds.includes(user.id));
  }

  async getCoachMetrics(coachId: string): Promise<any> {
    const athletes = await this.getCoachAthletes(coachId);
    
    const totalAthletes = athletes.length;
    const activeSessions = Math.floor(Math.random() * 10) + 1; // Mock data
    const avgPerformance = athletes.reduce((acc, athlete) => {
      const metrics = athlete.metrics as any;
      if (metrics) {
        return acc + (metrics.speed + metrics.strength + metrics.stamina + metrics.technique) / 4;
      }
      return acc;
    }, 0) / Math.max(athletes.length, 1);
    
    const injuryAlerts = Array.from(this.injuryAlerts.values())
      .filter(alert => alert.coachId === coachId && !alert.resolved).length;

    return {
      athleteCount: totalAthletes,
      activeSessions,
      avgPerformance,
      injuryAlerts,
      avgImprovement: Math.floor(Math.random() * 20) + 5, // Mock improvement percentage
    };
  }

  async getCoachAnalytics(coachId: string): Promise<any> {
    // Mock analytics data
    return {
      teamProgress: [
        { week: "Week 1", average: 7.8, topPerformer: 9.2 },
        { week: "Week 2", average: 8.1, topPerformer: 9.4 },
        { week: "Week 3", average: 8.3, topPerformer: 9.1 },
        { week: "Week 4", average: 8.5, topPerformer: 9.5 },
      ],
    };
  }

  async addCoachAthlete(insertCoachAthlete: InsertCoachAthlete): Promise<CoachAthlete> {
    const id = randomUUID();
    const coachAthlete: CoachAthlete = { 
      ...insertCoachAthlete, 
      id,
      approvedAt: new Date(),
      createdAt: new Date(),
    };
    
    this.coachAthletes.set(id, coachAthlete);
    return coachAthlete;
  }

  // Performance tracking
  async createPerformanceRecord(insertRecord: InsertPerformanceRecord): Promise<PerformanceRecord> {
    const id = randomUUID();
    const record: PerformanceRecord = { 
      ...insertRecord, 
      id,
      notes: insertRecord.notes || null,
      recordedBy: insertRecord.recordedBy || null,
      recordedAt: new Date(),
    };
    
    this.performanceRecords.set(id, record);
    return record;
  }

  async getPerformanceRecords(userId: string): Promise<PerformanceRecord[]> {
    return Array.from(this.performanceRecords.values())
      .filter(record => record.userId === userId)
      .sort((a, b) => new Date(b.recordedAt!).getTime() - new Date(a.recordedAt!).getTime());
  }

  // Injury alerts
  async createInjuryAlert(insertAlert: InsertInjuryAlert): Promise<InjuryAlert> {
    const id = randomUUID();
    const alert: InjuryAlert = { 
      ...insertAlert, 
      id,
      coachId: insertAlert.coachId || null,
      recommendations: insertAlert.recommendations || null,
      resolved: false,
      resolvedAt: null,
      createdAt: new Date(),
    };
    
    this.injuryAlerts.set(id, alert);
    return alert;
  }

  async getInjuryAlerts(coachId: string): Promise<InjuryAlert[]> {
    return Array.from(this.injuryAlerts.values())
      .filter(alert => alert.coachId === coachId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async resolveInjuryAlert(alertId: string): Promise<InjuryAlert> {
    const alert = this.injuryAlerts.get(alertId);
    if (!alert) {
      throw new Error("Injury alert not found");
    }
    
    alert.resolved = true;
    alert.resolvedAt = new Date();
    this.injuryAlerts.set(alertId, alert);
    return alert;
  }
}

export const storage = new MemStorage();
