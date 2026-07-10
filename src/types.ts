export interface Task {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  category: "Personal" | "Work" | "Urgent" | "Shopping" | "Other";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  dueTime?: string;
  alarmEnabled?: boolean;
  alarmTriggered?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  createdAt: string;
}
