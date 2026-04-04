export type Role = 'admin' | 'employee';
export type ClientType = 'فرد' | 'شركة' | 'مزرعة';
export type TicketStatus = 'جديد' | 'جاري المتابعة' | 'محول' | 'بانتظار التقييم' | 'مغلق';
export type ActionType = 'CREATE' | 'EDIT' | 'UPDATE' | 'TRANSFER' | 'CLOSE';
export type TaskStatus = 'pending' | 'completed' | 'overdue';
export type TaskType = 'call' | 'email' | 'meeting' | 'update';

export interface User {
  id: string;
  name: string;
  role: Role;
  branch: string;
}

export interface ActivityLog {
  id: string;
  action: ActionType;
  actionLabel: string;
  details: string;
  performedBy: string; // User ID
  performedByName: string;
  createdAt: string;
}

export interface TicketUpdate {
  id: string;
  note: string;
  updatedBy: string; // User ID
  updatedByName: string;
  createdAt: string;
}

export interface TicketTransfer {
  id: string;
  fromEmployeeId: string;
  fromEmployeeName: string;
  toEmployeeId: string;
  toEmployeeName: string;
  createdAt: string;
}

export interface ClosingReport {
  result: 'مبيع' | 'لم يتم' | 'مؤجل';
  originalValue: number;
  finalValue: number;
  employeeEvaluation: number;
  transferredEmployeeEvaluation?: number;
  transferredEmployeeId?: string;
  transferredEmployeeName?: string;
  branchEvaluation: number;
  notes: string;
}

export interface Ticket {
  id: string;
  clientName: string;
  mobileNumber: string;
  location: string;
  mapUrl?: string;
  clientType: ClientType;
  clientNeed: string;
  employeeOpinion: string;
  status: TicketStatus;
  closeReason?: string;
  preliminaryResult?: 'مبيع' | 'لم يتم' | 'مؤجل';
  createdBy: string; // User ID
  createdByName: string;
  currentOwnerId: string; // User ID
  currentOwnerName: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  updates: TicketUpdate[];
  transfers: TicketTransfer[];
  activityLog: ActivityLog[];
  closingReport?: ClosingReport;
}

export interface CRMTask {
  id: string;
  title: string;
  dueDate: string;
  status: TaskStatus;
  type: TaskType;
  assignedToId: string;
  assignedToName: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
  ticketId?: string;
  clientName?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// Temporary empty states for real implementation
export let mockNotifications: AppNotification[] = [];
export let mockUsers: User[] = [];
export let mockTickets: Ticket[] = [];
export let mockTasks: CRMTask[] = [];
