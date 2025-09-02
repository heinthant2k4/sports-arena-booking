export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  studentId?: string;
  role: 'student' | 'staff' | 'admin';
  department?: string;
  createdAt: Date;
}

export interface Facility {
  id: string;
  name: string;
  type: 'futsal' | 'badminton';
  capacity: number;
  hourlyRate: number;
  equipment: string[];
  isActive: boolean;
  description?: string;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Booking {
  id: string;
  userId: string;
  facilityId: string;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  purpose: string;
  createdAt: Date;
  updatedAt: Date;
  // Additional fields for display
  userName?: string;
  facilityName?: string;
  totalCost?: number;
}

export interface TimeSlot {
  id: string; // format: YYYY-MM-DD-facilityId-hour
  facilityId: string;
  date: string; // YYYY-MM-DD format
  hour: number; // 0-23
  isAvailable: boolean;
  bookingId?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  studentId: string;
  department: string;
  role: 'student' | 'staff';
}

export interface BookingForm {
  facilityId: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
}