import { z } from 'zod';
import { Geometry } from 'geojson';

export interface User {
  id: string;
  name: string | null;
  phoneNumber: string;
  email: string;
  role: 'TOURIST' | 'ADMIN' | 'BUSINESS';
  trips: Trip[];
}

export interface Trip {
  id: string;
  status: 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'CANCELLED' | 'CHECK_IN' | 'SNOOZED';
  pausedUntil: string | null;
  checkInStartedAt: string | null;
  snoozedUntil: string | null;
}

export interface ItineraryPlace {
  id: string;
  name: string;
  date: string;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface Itinerary {
  id: string;
  name: string;
  tripId: string;
  places: ItineraryPlace[];
}

export interface GroupMember {
  user: { id: string; name: string | null; };
  role: 'ADMIN' | 'MEMBER';
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  members: GroupMember[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface SafetyZone {
  id: string;
  name: string;
  safetyScore: number;
  type: string;
  geometry : Geometry;
  description:string;
}

export interface Business {
  phone: string;
  id: string;
  name: string;
  category: string;
  status: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface GroupMemberLocation {
  latitude: number;
  longitude: number;
  user: {
    id: string;
    name: string | null;
    phoneNumber: string;
  }
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AdminAlert {
  id: string;
  status: 'ACTIVE' | 'RESOLVED';
  createdAt: string;
  triggeredInTrip: { user: { id: string; } }
}

export interface GroupInvite {
  groupId: string;
  group: {
    name: string;
    description: string | null;
  }
}

export interface DashboardAlert {
  id: string;
  createdAt: string;
  triggeredInTrip: { user: { name: string | null; } }
}

export interface DashboardStats {
  totalUsers: number;
  activeAlerts: number;
  pendingBusinesses: number;
  totalGroups: number;
}

export interface AdminUserDetails {
  id: string;
  name: string | null;
  phoneNumber: string;
  trips: {
    id: string;
    startDate: string;
    endDate: string;
    status: string;
    itinerary: Itinerary | null;
  }[];
}

export interface LocationLog {
  id: string;
  createdAt: string;
  latitude: number;
  longitude: number;
  blockchainHash: string | null;
}

export interface BlockchainLogEntry {
    hash: string;
    timestamp: string;
}

export interface NearbyTourist {
  uniqueDigitalId: string;
  latitude: number;
  longitude: number;
  user: {
    phoneNumber: string;
  }
}

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  chatRoomId: string;
  sender: {
    id: string;
    name: string | null;
  };
}

export interface ChatRoom {
  id: string;
  name: string | null;
  type: 'SUPPORT' | 'GROUP' | 'DIRECT';
  participants: {
    id: string;
    name: string | null;
  }[];
  messages: {
    content: string;
  }[];
}


export const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  phoneNumber: z.string().min(10, { message: "Please enter a valid phone number" }),
  governmentIdType: z.enum(['PASSPORT', 'AADHAAR']),
  password : z.string().min(8,{ message : "Password must be atleast 8 characters"}),
  idValue: z.string().min(5, { message: "Please enter a valid ID number" }),
  startDate: z.string().refine((val) => val, { message: "Start date is required" }),
  endDate: z.string().refine((val) => val, { message: "End date is required" }),
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
  message: "End date must be after the start date",
  path: ["endDate"], 
});

export const businessRegisterSchema = z.object({
  name: z.string().min(2, "Your name is required."),
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  phoneNumber: z.string().min(10, "A valid phone number is required."),
});

export const businessApplySchema = z.object({
  name: z.string().min(3, "Business name is required."),
  category: z.string().min(3, "Category is required."),
  address: z.string().min(10, "A full address is required."),
  phone: z.string().min(10, "A valid phone number is required."),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const loginSchema = z.object({
  uniqueDigitalId: z.string().min(10, { message: "Please enter a valid Digital ID" }),
  password: z.string().min(1, { message : "Password is required"})
});

export const adminLoginSchema = z.object({
  email: z.string().min(1, { message: "Official ID is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const placeSchema = z.object({
  name: z.string().min(2, { message: "Place name is required." }),
  date: z.date(),
  notes: z.string().optional(),
  latitude: z.number().optional(), 
  longitude: z.number().optional(), 
});

export const createGroupSchema = z.object({
  name: z.string().min(3, { message: "Group name must be at least 3 characters." }),
  description: z.string().optional(),
});

export const addMemberSchema = z.object({
  phoneNumber: z.string().min(10, { message: "Please enter a valid phone number." }),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required."),
  phone: z.string().min(10, "A valid phone number is required."),
  relationship: z.string().min(2, "Relationship is required."),
});

export const reportSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  description: z.string().optional(),
  reportType: z.enum(['SAFE', 'UNSAFE']),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type BusinessRegisterFormData = z.infer<typeof businessRegisterSchema>;
export type BusinessApplyFormData = z.infer<typeof businessApplySchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type PlaceFormData = z.infer<typeof placeSchema>;
export type AddMemberFormData = z.infer<typeof addMemberSchema>;
export type CreateGroupFormData = z.infer<typeof createGroupSchema>;
export type AdminLoginFormData = z.infer<typeof adminLoginSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type ReportFormData = z.infer<typeof reportSchema>;