// src/stores/root-store.ts
import { proxy, subscribe } from 'valtio';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
}

export interface BusinessOwner {
  email: string;
  firstName: string;
  lastName: string;
  businessName: string;
  phone: string;
  emailTemplate?: string;
  registeredAt: string;
  employees: Employee[];
}

interface RootStore {
  owners: BusinessOwner[];
  currentOwner: BusinessOwner | null;
  currentEmployees: Employee[];
  unsavedChanges: boolean;
}
// import.meta.env.DEV ? '' : 
const BASE_URL = '/employee-registration';

const initialState: RootStore = {
  owners: [],
  currentOwner: null,
  currentEmployees: [],
  unsavedChanges: false,
};

// Load initial data from localStorage if available
const stored = localStorage.getItem('employeeRegistration');
if (stored) {
  try {
    const data = JSON.parse(stored);
    initialState.owners = Array.isArray(data.owners) ? data.owners : [];
  } catch (error) {
    console.warn('Failed to parse stored data:', error);
  }
}

export const store = proxy<RootStore>(initialState);

export const actions = {
  setOwners(owners: BusinessOwner[]) {
    store.owners = owners;
    this.syncToStorage();
  },

  setCurrentOwner(email: string) {
    const owner = store.owners.find(o => o.email === email);
    store.currentOwner = owner || null;
    store.currentEmployees = owner?.employees || [];
    store.unsavedChanges = false;
  },

  addOwner(owner: BusinessOwner) {
    store.owners.push(owner);
    this.syncToStorage();
  },

  updateOwner(updatedOwner: BusinessOwner) {
    const index = store.owners.findIndex(o => o.email === updatedOwner.email);
    if (index !== -1) {
      store.owners[index] = updatedOwner;
      if (store.currentOwner?.email === updatedOwner.email) {
        store.currentOwner = updatedOwner;
      }
      this.syncToStorage();
    }
  },

  addEmployee(employee: Employee) {
    store.currentEmployees.push(employee);
    store.unsavedChanges = true;
  },

  updateEmployee(id: string, updatedEmployee: Omit<Employee, 'id'>) {
    const index = store.currentEmployees.findIndex(emp => emp.id === id);
    if (index !== -1) {
      store.currentEmployees[index] = { ...updatedEmployee, id };
      store.unsavedChanges = true;
    }
  },

  deleteEmployee(id: string) {
    store.currentEmployees = store.currentEmployees.filter(emp => emp.id !== id);
    store.unsavedChanges = true;
  },

  saveChanges() {
    if (store.currentOwner) {
      const updatedOwner = {
        ...store.currentOwner,
        employees: store.currentEmployees
      };
      this.updateOwner(updatedOwner);
      store.unsavedChanges = false;
    }
  },

  syncToStorage() {
    localStorage.setItem('employeeRegistration', JSON.stringify({
      owners: store.owners
    }));
    
    // Try to sync with server if available
    this.syncToJson().catch(error => {
      console.warn('Could not sync with server:', error);
    });
  },

  async syncToJson() {
    try {
      const response = await fetch(`${BASE_URL}/data/owners.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(store.owners)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save owners data');
      }
      
      // Successfully saved
      console.log('Successfully saved to JSON file');
    } catch (error) {
      console.warn('Failed to sync with JSON:', error);
    }
  },

  async loadFromJson() {
    try {
      // Try loading from JSON first
      const response = await fetch(`${BASE_URL}/data/owners.json`);
      if (response.ok) {
        const data = await response.json();
        const owners = Array.isArray(data.owners) ? data.owners : [];
        
        // Merge with localStorage data if it exists
        const stored = localStorage.getItem('employeeRegistration');
        if (stored) {
          const localData = JSON.parse(stored);
          const localOwners = Array.isArray(localData.owners) ? localData.owners : [];
          
          // Use localStorage data if it's newer/different
          if (localOwners.length > 0) {
            this.setOwners(localOwners);
            return;
          }
        }
        
        this.setOwners(owners);
      } else {
        // Fallback to localStorage if JSON fetch fails
        const stored = localStorage.getItem('employeeRegistration');
        if (stored) {
          const data = JSON.parse(stored);
          this.setOwners(Array.isArray(data.owners) ? data.owners : []);
        }
      }
    } catch (error) {
      console.warn('Could not load data:', error);
      // Try localStorage as fallback
      const stored = localStorage.getItem('employeeRegistration');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          this.setOwners(Array.isArray(data.owners) ? data.owners : []);
        } catch (e) {
          this.setOwners([]);
        }
      } else {
        this.setOwners([]);
      }
    }
  }
};

// Subscribe to changes and sync with localStorage
subscribe(store, () => {
  // Save to localStorage
  localStorage.setItem('employeeRegistration', JSON.stringify({
    owners: store.owners
  }));
  
  // Try to sync with JSON
  actions.syncToJson().catch(console.warn);
});

// Initial attempt to load data
actions.loadFromJson().catch(console.warn);