import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Ticket, CRMTask, AppNotification, User } from '../data/mockData';

interface DataContextType {
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  tasks: CRMTask[];
  setTasks: React.Dispatch<React.SetStateAction<CRMTask[]>>;
  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  users: User[];
  addTicket: (t: Ticket) => void;
  updateTicket: (t: Ticket) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('crm_tickets');
    return saved ? JSON.parse(saved) : [];
  });

  const [tasks, setTasks] = useState<CRMTask[]>(() => {
    const saved = localStorage.getItem('crm_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('crm_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const users: User[] = [
    { id: '1', name: 'we9li', role: 'admin', branch: 'الرئيسي' },
    { id: '2', name: 'we9l', role: 'employee', branch: 'الرياض' }
  ];

  useEffect(() => {
    localStorage.setItem('crm_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('crm_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('crm_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addTicket = (newTicket: Ticket) => {
    setTickets(prev => [newTicket, ...prev]);
  };

  const updateTicket = (updatedTicket: Ticket) => {
    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
  };

  return (
    <DataContext.Provider 
      value={{ 
        tickets, setTickets, 
        tasks, setTasks, 
        notifications, setNotifications, 
        users, addTicket, updateTicket 
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
