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

interface DataContextType {
  tickets: Ticket[];
  users: AppUser[];
  tasks: CRMTask[];
  setTasks: React.Dispatch<React.SetStateAction<CRMTask[]>>;
  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  loading: boolean;
  refreshTickets: () => Promise<void>;
  // Ticket mutations
  createTicket: (data: CreateTicketInput) => Promise<Ticket | null>;
  addTicketNote: (ticketId: string, note: string) => Promise<boolean>;
  transferTicket: (ticketId: string, toEmployeeId: string, toEmployeeName: string) => Promise<boolean>;
  changeTicketStatus: (ticketId: string, status: string, closeReason?: string) => Promise<boolean>;
  updateTicketInfo: (ticketId: string, data: UpdateTicketInfoInput) => Promise<boolean>;
  // Legacy support for CustomerProfile
  addTicket: (t: Ticket) => void;
  updateTicket: (t: Ticket) => void;
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
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
  const [loading, setLoading] = useState(false);

  const [tasks, setTasks] = useState<CRMTask[]>(() => {
    const saved = localStorage.getItem('crm_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    localStorage.setItem('crm_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const refreshTickets = useCallback(async () => {
    if (!token) return;
    try {
      const res = await authFetch('/api/tickets', token);
      if (res.ok) setTickets(await res.json());
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    try {
      const res = await authFetch('/api/users', token);
      if (res.ok) setUsers(await res.json());
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated && token) {
      setLoading(true);
      Promise.all([refreshTickets(), fetchUsers()]).finally(() => setLoading(false));
    } else {
      setTickets([]);
      setUsers([]);
    }
  }, [isAuthenticated, token, refreshTickets, fetchUsers]);

  const createTicket = async (data: CreateTicketInput): Promise<Ticket | null> => {
    try {
      const res = await authFetch('/api/tickets', token, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!res.ok) return null;
      const ticket: Ticket = await res.json();
      setTickets(prev => [ticket, ...prev]);
      return ticket;
    } catch {
      return null;
    }
  };

  const addTicketNote = async (ticketId: string, note: string): Promise<boolean> => {
    try {
      const res = await authFetch(`/api/tickets/${ticketId}/notes`, token, {
        method: 'POST',
        body: JSON.stringify({ note }),
      });
      if (res.ok) await refreshTickets();
      return res.ok;
    } catch {
      return false;
    }
  };

  const transferTicket = async (ticketId: string, toEmployeeId: string, toEmployeeName: string): Promise<boolean> => {
    try {
      const res = await authFetch(`/api/tickets/${ticketId}/transfer`, token, {
        method: 'POST',
        body: JSON.stringify({ toEmployeeId, toEmployeeName }),
      });
      if (res.ok) await refreshTickets();
      return res.ok;
    } catch {
      return false;
    }
  };

  const changeTicketStatus = async (ticketId: string, status: string, closeReason?: string): Promise<boolean> => {
    try {
      const res = await authFetch(`/api/tickets/${ticketId}/status`, token, {
        method: 'PATCH',
        body: JSON.stringify({ status, closeReason }),
      });
      if (res.ok) await refreshTickets();
      return res.ok;
    } catch {
      return false;
    }
  };

  const updateTicketInfo = async (ticketId: string, data: UpdateTicketInfoInput): Promise<boolean> => {
    try {
      const res = await authFetch(`/api/tickets/${ticketId}/info`, token, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      if (res.ok) await refreshTickets();
      return res.ok;
    } catch {
      return false;
    }
  };

  // Legacy: إبقاء التوافق مع CustomerProfile القديم
  const addTicket = (t: Ticket) => setTickets(prev => [t, ...prev]);
  const updateTicket = (t: Ticket) => setTickets(prev => prev.map(x => x.id === t.id ? t : x));

  return (
    <DataContext.Provider value={{
      tickets, setTickets,
      users,
      tasks, setTasks,
      notifications, setNotifications,
      loading,
      refreshTickets,
      createTicket,
      addTicketNote,
      transferTicket,
      changeTicketStatus,
      updateTicketInfo,
      addTicket,
      updateTicket,
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
