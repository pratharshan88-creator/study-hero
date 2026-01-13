import { User, Task, ScoreLog, MonthlyStat, RANKS, RankName } from '../types';

const KEYS = {
  USER: 'studyrun_user',
  TASKS: 'studyrun_tasks',
  SCORES: 'studyrun_scores',
  MONTHLY: 'studyrun_monthly'
};

// Initialize default user if not exists
const initUser = (): User => {
  const existing = localStorage.getItem(KEYS.USER);
  if (existing) return JSON.parse(existing);

  const newUser: User = {
    id: 'user_1',
    name: 'Student',
    totalPoints: 0,
    currentRank: 'Bronze',
    pin: '0001'
  };
  localStorage.setItem(KEYS.USER, JSON.stringify(newUser));
  return newUser;
};

export const getUser = (): User => {
  return initUser();
};

export const updateUser = (updates: Partial<User>): User => {
  const user = getUser();
  const updated = { ...user, ...updates };
  
  // Auto-calculate rank based on new total points
  let newRank: RankName = 'Bronze';
  if (updated.totalPoints > 80) newRank = 'Legend';
  else if (updated.totalPoints > 60) newRank = 'Diamond';
  else if (updated.totalPoints > 40) newRank = 'Gold';
  else if (updated.totalPoints > 20) newRank = 'Silver';
  
  updated.currentRank = newRank;
  
  localStorage.setItem(KEYS.USER, JSON.stringify(updated));
  return updated;
};

export const getTasks = (dateStr: string): Task[] => {
  const allTasks: Task[] = JSON.parse(localStorage.getItem(KEYS.TASKS) || '[]');
  return allTasks.filter(t => t.date === dateStr);
};

export const addTask = (task: Task): void => {
  const allTasks: Task[] = JSON.parse(localStorage.getItem(KEYS.TASKS) || '[]');
  allTasks.push(task);
  localStorage.setItem(KEYS.TASKS, JSON.stringify(allTasks));
};

export const updateTask = (taskId: string, updates: Partial<Task>): Task | undefined => {
  const allTasks: Task[] = JSON.parse(localStorage.getItem(KEYS.TASKS) || '[]');
  const index = allTasks.findIndex(t => t.id === taskId);
  if (index === -1) return undefined;
  
  const updatedTask = { ...allTasks[index], ...updates };
  allTasks[index] = updatedTask;
  localStorage.setItem(KEYS.TASKS, JSON.stringify(allTasks));
  return updatedTask;
};

export const addScore = (points: number, taskId: string): void => {
  const user = getUser();
  const newPoints = user.totalPoints + points;
  updateUser({ totalPoints: newPoints });

  const scores: ScoreLog[] = JSON.parse(localStorage.getItem(KEYS.SCORES) || '[]');
  scores.push({
    id: Date.now().toString(),
    taskId,
    points,
    date: new Date().toISOString()
  });
  localStorage.setItem(KEYS.SCORES, JSON.stringify(scores));
};

export const validatePin = (inputPin: string): boolean => {
  const user = getUser();
  return user.pin === inputPin;
};

export const getMonthlyStats = (): MonthlyStat[] => {
    // Mocking some data for the "Previous Month" so the UI isn't empty
    const saved = localStorage.getItem(KEYS.MONTHLY);
    if(saved) return JSON.parse(saved);

    const mock: MonthlyStat[] = [
        { month: '2023-10', totalHours: 12, totalPoints: 45, rank: 'Silver' },
        { month: '2023-11', totalHours: 20, totalPoints: 75, rank: 'Diamond' }
    ];
    localStorage.setItem(KEYS.MONTHLY, JSON.stringify(mock));
    return mock;
}
