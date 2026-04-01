export type Role = 'admin' | 'employee';
export type ClientType = 'فرد' | 'شركة' | 'مزرعة';
export type TicketStatus = 'جديد' | 'جاري المتابعة' | 'محول' | 'مغلق';
export type ActionType = 'CREATE' | 'EDIT' | 'UPDATE' | 'TRANSFER' | 'CLOSE';

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
  originalValue: number;
  finalValue: number;
  employeeEvaluation: number;
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

export const mockUsers: User[] = [
  { id: 'U-1', name: 'أحمد محمد', role: 'admin', branch: 'المركز الرئيسي' },
  { id: 'U-2', name: 'سارة محمد', role: 'employee', branch: 'المركز الرئيسي' },
  { id: 'U-3', name: 'خالد العمري', role: 'employee', branch: 'فرع الرياض' },
  { id: 'U-4', name: 'فهد السالم', role: 'employee', branch: 'فرع جدة' },
];

export const mockTickets: Ticket[] = [
  {
    id: 'TKT-1001',
    clientName: 'عبدالله سعد',
    mobileNumber: '0512345678',
    location: 'الرياض - حي النخيل',
    clientType: 'فرد',
    clientNeed: 'منظومة طاقة شمسية للمنزل بقدرة 5 كيلو واط',
    employeeOpinion: 'العميل جاد جداً ولديه ميزانية جيدة، يحتاج إلى زيارة ميدانية قريباً.',
    status: 'مغلق',
    closeReason: 'تم البيع بنجاح — عقد رقم 2456',
    createdBy: 'U-2',
    createdByName: 'سارة محمد',
    currentOwnerId: 'U-3',
    currentOwnerName: 'خالد العمري',
    createdAt: '2026-03-15T10:30:15Z',
    updatedAt: '2026-04-05T16:30:00Z',
    closedAt: '2026-04-05T16:30:00Z',
    updates: [
      {
        id: 'UPD-1',
        note: 'تم التواصل مع العميل وأبدى اهتماماً بالعرض',
        updatedBy: 'U-2',
        updatedByName: 'سارة محمد',
        createdAt: '2026-03-20T09:15:33Z',
      }
    ],
    transfers: [
      {
        id: 'TRF-1',
        fromEmployeeId: 'U-2',
        fromEmployeeName: 'سارة محمد',
        toEmployeeId: 'U-3',
        toEmployeeName: 'خالد العمري',
        createdAt: '2026-03-25T11:45:20Z',
      }
    ],
    activityLog: [
      {
        id: 'ACT-1',
        action: 'CREATE',
        actionLabel: 'إنشاء تذكرة',
        details: 'تم فتح تذكرة جديدة للعميل: عبدالله سعد — الجوال: 0512345678',
        performedBy: 'U-2',
        performedByName: 'سارة محمد',
        createdAt: '2026-03-15T10:30:15Z',
      },
      {
        id: 'ACT-2',
        action: 'UPDATE',
        actionLabel: 'إضافة تحديث',
        details: 'تحديث: تم التواصل مع العميل وأبدى اهتماماً بالعرض',
        performedBy: 'U-2',
        performedByName: 'سارة محمد',
        createdAt: '2026-03-20T09:15:33Z',
      },
      {
        id: 'ACT-3',
        action: 'TRANSFER',
        actionLabel: 'تحويل تذكرة',
        details: 'تم تحويل التذكرة من سارة محمد إلى خالد العمري',
        performedBy: 'U-2',
        performedByName: 'سارة محمد',
        createdAt: '2026-03-25T11:45:20Z',
      },
      {
        id: 'ACT-4',
        action: 'CLOSE',
        actionLabel: 'إغلاق تذكرة',
        details: 'سبب الإغلاق: تم البيع بنجاح — عقد رقم 2456',
        performedBy: 'U-3',
        performedByName: 'خالد العمري',
        createdAt: '2026-04-05T16:30:00Z',
      }
    ],
    closingReport: {
      originalValue: 15000,
      finalValue: 22000, // Upsell
      employeeEvaluation: 5,
      branchEvaluation: 5,
      notes: 'تم إقناع العميل بزيادة القدرة إلى 8 كيلو واط.'
    }
  },
  {
    id: 'TKT-1002',
    clientName: 'شركة الأفق للتجارة',
    mobileNumber: '0559876543',
    location: 'جدة - المنطقة الصناعية',
    clientType: 'شركة',
    clientNeed: 'تجهيز مستودع بأنظمة التبريد والطاقة',
    employeeOpinion: 'مشروع ضخم يحتاج إلى تسعير خاص وموافقة الإدارة.',
    status: 'جديد',
    createdBy: 'U-4',
    createdByName: 'فهد السالم',
    currentOwnerId: 'U-4',
    currentOwnerName: 'فهد السالم',
    createdAt: '2026-03-28T08:15:00Z',
    updatedAt: '2026-03-28T08:15:00Z',
    updates: [],
    transfers: [],
    activityLog: [
      {
        id: 'ACT-5',
        action: 'CREATE',
        actionLabel: 'إنشاء تذكرة',
        details: 'تم فتح تذكرة جديدة للعميل: شركة الأفق للتجارة — الجوال: 0559876543',
        performedBy: 'U-4',
        performedByName: 'فهد السالم',
        createdAt: '2026-03-28T08:15:00Z',
      }
    ]
  },
  {
    id: 'TKT-1003',
    clientName: 'مزرعة الروابي',
    mobileNumber: '0501122334',
    location: 'القصيم - بريدة',
    clientType: 'مزرعة',
    clientNeed: 'مضخات مياه تعمل بالطاقة الشمسية',
    employeeOpinion: 'العميل متردد بخصوص التكلفة، يحتاج إلى عرض توضيحي للعائد على الاستثمار.',
    status: 'جاري المتابعة',
    createdBy: 'U-2',
    createdByName: 'سارة محمد',
    currentOwnerId: 'U-2',
    currentOwnerName: 'سارة محمد',
    createdAt: '2026-02-10T09:30:00Z', // Old ticket, ownership might drop
    updatedAt: '2026-02-10T09:30:00Z',
    updates: [],
    transfers: [],
    activityLog: [
      {
        id: 'ACT-6',
        action: 'CREATE',
        actionLabel: 'إنشاء تذكرة',
        details: 'تم فتح تذكرة جديدة للعميل: مزرعة الروابي — الجوال: 0501122334',
        performedBy: 'U-2',
        performedByName: 'سارة محمد',
        createdAt: '2026-02-10T09:30:00Z',
      }
    ]
  }
];

