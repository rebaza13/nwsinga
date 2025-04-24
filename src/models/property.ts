export interface Building {
  id?: string;
  name: string;
  address: string;
  totalUnits: number;
  imageUrl?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Property {
  id?: string;
  name: string;
  address: string;
  type: 'House' | 'Apartment' | 'Shop'; // Only these three static options
  price: number;
  status: 'available' | 'sold' | 'rented';
  squareMeters?: number;
  contactPhone?: string;
  description?: string;
  imageUrl?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Tenant {
  id?: string;
  name: string;
  email: string;
  phone: string;
  propertyType: 'House' | 'Apartment' | 'Shop'; // Property type field
  leaseStart: Date | string;
  leaseEnd: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Payment {
  id?: string;
  propertyId: string;
  tenantId: string;
  amount: number;
  date: Date | string;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod: string;
  notes?: string;
  createdAt: Date | string;
}

export interface RentPayment {
  id?: string;
  tenantId: string;
  propertyId?: string; // Made optional
  contractId?: string; // Made optional
  amount: number;
  paymentDate: Date | string;
  paymentMonth: string; // Format: 'YYYY-MM' (e.g., '2023-01' for January 2023)
  paymentMethod: 'cash' | 'bank transfer' | 'check' | 'credit card' | 'other';
  receiptNumber?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date | string;
  // For display purposes
  tenantName?: string;
  propertyName?: string;
}

export interface Task {
  id?: string;
  title: string;
  due: Date | string;
  done: boolean;
  propertyId?: string;
  tenantId?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date | string;
}

export interface Activity {
  id?: string;
  title: string;
  date: Date | string;
  description: string;
  icon: string;
  color: string;
  propertyId?: string;
  tenantId?: string;
  createdAt: Date | string;
}

export interface Contract {
  id?: string;
  title: string;
  startDate: Date | string;
  endDate: Date | string;
  amount: number;
  depositAmount: number;
  isActive: boolean;
  createdBy: string;
  createdAt: Date | string;
  notes?: string;
  contractType: 'sale' | 'lease' | 'other';
}

export interface DashboardStats {
  totalRentalIncome: number;
  totalProperties: number;
  activeContracts: number;
  lastMonthIncome: number;
  newProperties: number;
  pendingRenewals: number;
}
