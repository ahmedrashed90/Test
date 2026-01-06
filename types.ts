
export enum UserRole {
  ADMIN = 'الادارة',
  IDARI = 'اداري',
  BRANCH = 'مدراء فروع'
}

export interface Car {
  id: number;
  car: string;
  variant: string;
  dealer: string;
  extColor: string;
  intColor: string;
  modelYear: string;
  plate: string;
  location: string;
  batchName: string;
  vin: string;
  notes: string;
  adminNotes?: string;
  financeNotes?: string;
  createdAt?: string;
}

export interface Move {
  id: string;
  vin: string;
  car: string;
  from: string;
  to: string;
  date: string;
  ts: any;
  adminApproved?: boolean;
  financeApproved?: boolean;
}

export interface ERPOrder {
  id: string;
  orderNo: string;
  customerName: string;
  phone: string;
  branch: string;
  vin: string;
  sellerName: string;
  doneCount: number; // 0 to 10
  updatedAt: any;
}

export interface PhotoshootRequest {
  id?: string;
  kind: 'shoot' | 'move' | 'mixed';
  status: string;
  total: number;
  vins: string[];
  createdByName: string;
  createdByEmail: string;
  createdAt: any;
  updatedAt: any;
  finishedAt?: any;
  rows: any[];
}
