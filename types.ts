
export enum UserRole {
  ADMIN = 'الادارة',
  STAFF = 'اداري',
  BRANCH_MANAGER = 'مدراء فروع'
}

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  name?: string;
}

export interface Car {
  id: number;
  vin: string;
  car: string;
  variant: string;
  dealer: string;
  extColor: string;
  intColor: string;
  modelYear: string;
  plate: string;
  location: string;
  batchName: string;
  notes: string;
  adminApproved?: boolean;
  financeApproved?: boolean;
  adminNotes?: string;
  financeNotes?: string;
}

export interface Move {
  id: number;
  date: string;
  when: any;
  vin: string;
  car: string;
  from: string;
  to: string;
  status?: string;
  adminApproved?: boolean;
  financeApproved?: boolean;
  adminNotes?: string;
  financeNotes?: string;
  issuesNotes?: string;
  _idx?: number;
}

export interface RequestRow {
  vin: string;
  car: string;
  variant: string;
  extColor: string;
  intColor: string;
  modelYear: string;
  location: string;
  shootPlace?: string;
  toLocation?: string;
  kind: 'shoot' | 'move';
  note?: string;
  steps?: {
    received?: any;
    sent?: any;
    carReceived?: any;
  };
}

export interface AdminRequest {
  id: string;
  _docId?: string;
  kind: 'shoot' | 'move' | 'mixed';
  status: string;
  total: number;
  createdBy: string;
  createdByEmail: string;
  createdAt: any;
  updatedAt: any;
  finishedAt?: any;
  shootDoneDocIds?: string[];
}

export interface MediaSpec {
  shoot: 'نعم' | 'لا';
  edit: 'نعم' | 'لا';
  specsReel: 'نعم' | 'لا';
  shootDate: string;
  inAgenda: 'نعم' | 'لا';
  agendaMonth: string;
  agendaYear: string;
  updatedAt?: any;
}
