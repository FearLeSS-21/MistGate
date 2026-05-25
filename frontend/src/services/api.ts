const API_BASE_URL = 'http://localhost:5000/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'CITIZEN' | 'ADMIN';
  nationalId: string;
  phone: string;
}

export type ServiceType = Application['serviceType'];

export interface Application {
  id: string;
  trackingCode: string;
  serviceType:
    | 'NATIONAL_ID'
    | 'MILITARY_EXEMPTION'
    | 'BIRTH_CERTIFICATE'
    | 'PASSPORT'
    | 'TAX_PAYMENT'
    | 'TRAFFIC_FINE'
    | 'HEALTH_INSURANCE'
    | 'SOCIAL_INSURANCE';
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  data: Record<string, unknown>;
  attachmentUrl?: string | null;
  notes?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    email: string;
    nationalId: string;
    phone: string;
  };
  statusHistory: {
    id: string;
    status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
    notes?: string | null;
    changedBy: string;
    createdAt: string;
  }[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  link?: string | null;
  createdAt: string;
}

export interface Complaint {
  id: string;
  userId: string;
  category: 'SERVICE_QUALITY' | 'TECHNICAL_ISSUE' | 'SUGGESTION' | 'STAFF_CONDUCT' | 'DELAY_COMPLAINT' | 'OTHER';
  subject: string;
  message: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
  response?: string | null;
  respondedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    email: string;
    nationalId: string;
  };
}

class ApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('misrgate_token');
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  }

  setToken(token: string) {
    localStorage.setItem('misrgate_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('misrgate_token');
  }

  clearToken() {
    localStorage.removeItem('misrgate_token');
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = { ...this.getHeaders(), ...options.headers };
    
    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      return data as T;
    } catch (error: unknown) {
      console.error(`API Request Error (${endpoint}):`, error);
      throw error;
    }
  }

  // --- Auth Endpoints ---
  async register(body: {
    email: string;
    password: string;
    name: string;
    nationalId: string;
    phone: string;
  }): Promise<{ token: string; user: User }> {
    return this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async login(body: { email: string; password: string }): Promise<{ token: string; user: User }> {
    return this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getProfile(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/profile');
  }

  // --- Citizen Endpoints ---
  async createApplication(body: {
    serviceType: string;
    data: Record<string, unknown>;
    attachmentUrl?: string;
  }): Promise<{ message: string; trackingCode: string; application: Application }> {
    return this.request<{ message: string; trackingCode: string; application: Application }>('/applications', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getMyApplications(): Promise<{ applications: Application[] }> {
    return this.request<{ applications: Application[] }>('/applications/my-applications');
  }

  async trackApplicationPublic(trackingCode: string): Promise<Partial<Application>> {
    return this.request<Partial<Application>>(`/applications/track/${trackingCode}`);
  }

  // --- Notification Endpoints ---
  async getNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
    return this.request<{ notifications: Notification[]; unreadCount: number }>('/notifications');
  }

  async markNotificationAsRead(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/notifications/${id}/read`, { method: 'PUT' });
  }

  async markAllNotificationsAsRead(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/notifications/read-all', { method: 'PUT' });
  }

  // --- Complaint Endpoints (Citizen) ---
  async createComplaint(body: { category: string; subject: string; message: string }): Promise<{ message: string; complaint: Complaint }> {
    return this.request<{ message: string; complaint: Complaint }>('/complaints', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getMyComplaints(): Promise<{ complaints: Complaint[] }> {
    return this.request<{ complaints: Complaint[] }>('/complaints');
  }

  // --- Complaint Endpoints (Admin) ---
  async adminGetComplaints(params?: { category?: string; status?: string }): Promise<{ complaints: Complaint[] }> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    return this.request<{ complaints: Complaint[] }>(`/admin/complaints${qs ? `?${qs}` : ''}`);
  }

  async adminRespondToComplaint(id: string, body: { response: string }): Promise<{ message: string; complaint: Complaint }> {
    return this.request<{ message: string; complaint: Complaint }>(`/admin/complaints/${id}/respond`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async adminGetComplaintStats(): Promise<{
    stats: {
      total: number;
      byStatus: Record<string, number>;
      byCategory: Record<string, number>;
    };
  }> {
    return this.request<{
      stats: {
        total: number;
        byStatus: Record<string, number>;
        byCategory: Record<string, number>;
      };
    }>('/admin/complaints/stats');
  }

  // --- Admin Endpoints ---
  async adminGetApplications(): Promise<{ applications: Application[] }> {
    return this.request<{ applications: Application[] }>('/admin/applications');
  }

  async adminUpdateStatus(id: string, body: { status: string; notes?: string }): Promise<{ message: string; application: Application }> {
    return this.request<{ message: string; application: Application }>(`/admin/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async adminGetStats(): Promise<{
    stats: {
      totalApplications: number;
      totalUsers: number;
      byStatus: { [key: string]: number };
      byService: { [key: string]: number };
    };
  }> {
    return this.request<{
      stats: {
        totalApplications: number;
        totalUsers: number;
        byStatus: { [key: string]: number };
        byService: { [key: string]: number };
      };
    }>('/admin/stats');
  }
}

export const api = new ApiService();
