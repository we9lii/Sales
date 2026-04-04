import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Ticket, CRMTask, AppNotification } from '../data/mockData';
import { useAuth } from './AuthContext';

export interface AppUser {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'employee';
  branch: string;
  mobileNumber?: string;
  email?: string;
}

export interface CreateTicketInput {
  clientName: string;
  mobileNumber: string;
  location: string;
  mapUrl?: string;
  clientType: string;
  clientNeed: string;
  employeeOpinion: string;
}

export interface UpdateTicketInfoInput {
  clientName: string;
  mobileNumber: string;
  location: string;
  clientType: string;
  clientNeed: string;
}

interface DataContextType {
  // Tickets
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  loading: boolean;
  refreshTickets: () => Promise<void>;
  createTicket: (data: CreateTicketInput) => Promise<Ticket | null>;
  addTicketNote: (ticketId: string, note: string) => Promise<boolean>;
  transferTicket: (ticketId: string, toEmployeeId: string, toEmployeeName: string) => Promise<boolean>;
  changeTicketStatus: (ticketId: string, status: string, closeReason?: string) => Promise<boolean>;
  evaluateTicket: (ticketId: string, closingReport: object, closeReason?: string) => Promise<boolean>;
  updateTicketInfo: (ticketId: string, data: UpdateTicketInfoInput) => Promise<boolean>;
  addTicket: (t: Ticket) => void;
  updateTicket: (t: Ticket) => void;
  // Tasks
  tasks: CRMTask[];
  tasksLoading: boolean;
  refreshTasks: () => Promise<void>;
  createTask: (data: CreateTaskInput) => Promise<CRMTask | null>;
  completeTask: (taskId: string) => Promise<boolean>;
  uncompleteTask: (taskId: string) => Promise<boolean>;
  // Users
  users: AppUser[];
  // Notifications
  notifications: AppNotification[];
  refreshNotifications: () => Promise<void>;
  markNotificationsRead: () => Promise<void>;
  sendNotification: (userId: string, title: string, message: string) => Promise<void>;
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
}

export interface CreateTaskInput {
  title: string;
  dueDate: string;
  type: string;
  assignedToId?: string;
  assignedToName?: string;
  ticketId?: string;
  clientName?: string;
}

const DataContext = createContext<DataContextType | null>(null);

function authFetch(url: string, token: string | null, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [tasks, setTasks] = useState<CRMTask[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);

  // ─── Tickets ───────────────────────────────────────────────
  const refreshTickets = useCallback(async () => {
    if (!token) return;
    try {
      const res = await authFetch('/api/tickets', token);
      if (res.ok) setTickets(await res.json());
    } catch (err) { console.error('refreshTickets:', err); }
  }, [token]);

  const createTicket = async (data: CreateTicketInput): Promise<Ticket | null> => {
    try {
      const res = await authFetch('/api/tickets', token, { method: 'POST', body: JSON.stringify(data) });
      if (!res.ok) return null;
      await refreshTickets();
      return await res.json();
    } catch { return null; }
  };

  const addTicketNote = async (ticketId: string, note: string): Promise<boolean> => {
    try {
      const res = await authFetch(`/api/tickets/${ticketId}/notes`, token, { method: 'POST', body: JSON.stringify({ note }) });
      if (res.ok) await refreshTickets();
      return res.ok;
    } catch { return false; }
  };

  const transferTicket = async (ticketId: string, toEmployeeId: string, toEmployeeName: string): Promise<boolean> => {
    try {
      const res = await authFetch(`/api/tickets/${ticketId}/transfer`, token, {
        method: 'POST', body: JSON.stringify({ toEmployeeId, toEmployeeName }),
      });
      if (res.ok) await refreshTickets();
      return res.ok;
    } catch { return false; }
  };

  const changeTicketStatus = async (ticketId: string, status: string, closeReason?: string): Promise<boolean> => {
    try {
      const res = await authFetch(`/api/tickets/${ticketId}/status`, token, {
        method: 'PATCH', body: JSON.stringify({ status, closeReason }),
      });
      if (res.ok) await refreshTickets();
      return res.ok;
    } catch { return false; }
  };

  const evaluateTicket = async (ticketId: string, closingReport: object, closeReason?: string): Promise<boolean> => {
    try {
      const res = await authFetch(`/api/tickets/${ticketId}/evaluate`, token, {
        method: 'POST', body: JSON.stringify({ closingReport, closeReason }),
      });
      if (res.ok) await refreshTickets();
      return res.ok;
    } catch { return false; }
  };

  const updateTicketInfo = async (ticketId: string, data: UpdateTicketInfoInput): Promise<boolean> => {
    try {
      const res = await authFetch(`/api/tickets/${ticketId}/info`, token, {
        method: 'PATCH', body: JSON.stringify(data),
      });
      if (res.ok) await refreshTickets();
      return res.ok;
    } catch { return false; }
  };

  const addTicket = (t: Ticket) => setTickets(prev => [t, ...prev]);
  const updateTicket = (t: Ticket) => setTickets(prev => prev.map(x => x.id === t.id ? t : x));

  // ─── Tasks ─────────────────────────────────────────────────
  const refreshTasks = useCallback(async () => {
    if (!token) return;
    setTasksLoading(true);
    try {
      const res = await authFetch('/api/tasks', token);
      if (res.ok) setTasks(await res.json());
    } catch (err) { console.error('refreshTasks:', err); }
    finally { setTasksLoading(false); }
  }, [token]);

  const createTask = async (data: CreateTaskInput): Promise<CRMTask | null> => {
    try {
      const res = await authFetch('/api/tasks', token, { method: 'POST', body: JSON.stringify(data) });
      if (!res.ok) return null;
      await refreshTasks();
      return await res.json();
    } catch { return null; }
  };

  const completeTask = async (taskId: string): Promise<boolean> => {
    try {
      const res = await authFetch(`/api/tasks/${taskId}/status`, token, {
        method: 'PATCH', body: JSON.stringify({ status: 'completed' }),
      });
      if (res.ok) await refreshTasks();
      return res.ok;
    } catch { return false; }
  };

  const uncompleteTask = async (taskId: string): Promise<boolean> => {
    try {
      const task = tasks.find(t => t.id === taskId);
      const newStatus = task && new Date(task.dueDate) < new Date() ? 'overdue' : 'pending';
      const res = await authFetch(`/api/tasks/${taskId}/status`, token, {
        method: 'PATCH', body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) await refreshTasks();
      return res.ok;
    } catch { return false; }
  };

  // ─── Notifications ─────────────────────────────────────────
  const refreshNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await authFetch('/api/notifications', token);
      if (res.ok) setNotifications(await res.json());
    } catch (err) { console.error('refreshNotifications:', err); }
  }, [token]);

  const markNotificationsRead = async () => {
    try {
      await authFetch('/api/notifications/read-all', token, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch { /* silent */ }
  };

  const sendNotification = async (userId: string, title: string, message: string) => {
    try {
      await authFetch('/api/notifications', token, {
        method: 'POST', body: JSON.stringify({ userId, title, message }),
      });
    } catch { /* silent */ }
  };

  // ─── Users ─────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    if (!token) return;
    try {
      const res = await authFetch('/api/users', token);
      if (res.ok) setUsers(await res.json());
    } catch (err) { console.error('fetchUsers:', err); }
  }, [token]);

  // ─── Bootstrap ─────────────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated && token) {
      setLoading(true);
      Promise.all([refreshTickets(), fetchUsers(), refreshTasks(), refreshNotifications()])
        .finally(() => setLoading(false));
    } else {
      setTickets([]); setUsers([]); setTasks([]); setNotifications([]);
    }
  }, [isAuthenticated, token, refreshTickets, fetchUsers, refreshTasks, refreshNotifications]);

  return (
    <DataContext.Provider value={{
      tickets, setTickets, loading, refreshTickets,
      createTicket, addTicketNote, transferTicket, changeTicketStatus,
      evaluateTicket, updateTicketInfo, addTicket, updateTicket,
      tasks, tasksLoading, refreshTasks, createTask, completeTask, uncompleteTask,
      users,
      notifications, refreshNotifications, markNotificationsRead,
      sendNotification, setNotifications,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
