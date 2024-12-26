import { Employee } from '../types';

export interface StoredBusinessOwner {
    email: string;
    firstName: string; 
    lastName: string;   
    registeredAt: string;
    businessName: string;
    phone: string;
    employees: Employee[];
    emailTemplate?: string;
  }
  
  export const StorageService = {
    OWNERS_KEY: 'business_owners',
    
    getAllOwners(): StoredBusinessOwner[] {
      const data = localStorage.getItem(this.OWNERS_KEY);
      return data ? JSON.parse(data) : [];
    },
  
    getOwnerByEmail(email: string): StoredBusinessOwner | null {
      const owners = this.getAllOwners();
      return owners.find(owner => owner.email === email) || null;
    },
  
    saveOwner(ownerData: StoredBusinessOwner) {
      const owners = this.getAllOwners();
      const existingIndex = owners.findIndex(owner => owner.email === ownerData.email);
      
      if (existingIndex >= 0) {
        owners[existingIndex] = ownerData;
      } else {
        owners.push(ownerData);
      }
      
      localStorage.setItem(this.OWNERS_KEY, JSON.stringify(owners));
    }
  };