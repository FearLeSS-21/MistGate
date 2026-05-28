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

export interface Appointment {
  id: string;
  userId: string;
  department: string;
  date: string;
  timeSlot: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    email: string;
    nationalId: string;
    phone: string;
  };
}

export interface ServiceRating {
  id: string;
  applicationId: string;
  userId: string;
  score: number;
  review?: string | null;
  createdAt: string;
  application?: { serviceType: string; trackingCode: string };
  user?: { name: string };
}

export interface Report {
  generatedAt: string;
  period: string;
  totalUsers: number;
  totalApplications: number;
  totalComplaints: number;
  totalAppointments: number;
  totalNotifications: number;
  totalRatings: number;
  averageRating: number;
  byService: Record<string, number>;
  byStatus: Record<string, number>;
  applications: Application[];
  complaints: Complaint[];
  appointments: Appointment[];
  activities: ActivityEntry[];
  ratings: ServiceRating[];
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  id: string;
  type: 'application' | 'appointment' | 'complaint' | 'rating' | 'status_change';
  title: string;
  description: string;
  status: string;
  date: string;
}

export interface ActivityEntry {
  id: string;
  userId?: string | null;
  userName: string;
  action: string;
  details?: string | null;
  createdAt: string;
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

  async logout(): Promise<void> {
    await this.request<{ message: string }>('/auth/logout', { method: 'POST' });
    this.clearToken();
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

  async cancelApplication(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/applications/${id}/cancel`, { method: 'PUT' });
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

  // --- Appointment Endpoints (Citizen) ---
  async getAvailableSlots(date: string, department: string): Promise<{ available: string[]; allSlots: string[]; bookedSlots: string[] }> {
    return this.request<{ available: string[]; allSlots: string[]; bookedSlots: string[] }>(`/appointments/slots?date=${encodeURIComponent(date)}&department=${encodeURIComponent(department)}`);
  }

  async bookAppointment(body: { department: string; date: string; timeSlot: string; notes?: string }): Promise<{ message: string; appointment: Appointment }> {
    return this.request<{ message: string; appointment: Appointment }>('/appointments', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getMyAppointments(): Promise<{ appointments: Appointment[] }> {
    return this.request<{ appointments: Appointment[] }>('/appointments');
  }

  async cancelAppointment(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/appointments/${id}/cancel`, { method: 'PUT' });
  }

  // --- Appointment Endpoints (Admin) ---
  async adminGetAppointments(params?: { department?: string; status?: string; date?: string }): Promise<{ appointments: Appointment[] }> {
    const query = new URLSearchParams();
    if (params?.department) query.set('department', params.department);
    if (params?.status) query.set('status', params.status);
    if (params?.date) query.set('date', params.date);
    const qs = query.toString();
    return this.request<{ appointments: Appointment[] }>(`/admin/appointments${qs ? `?${qs}` : ''}`);
  }

  async adminUpdateAppointment(id: string, body: { status?: string; notes?: string }): Promise<{ message: string; appointment: Appointment }> {
    return this.request<{ message: string; appointment: Appointment }>(`/admin/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async adminGetAppointmentStats(): Promise<{ stats: { total: number; byStatus: Record<string, number>; byDepartment: { department: string; _count: { _all: number } }[] } }> {
    return this.request<{ stats: { total: number; byStatus: Record<string, number>; byDepartment: { department: string; _count: { _all: number } }[] } }>('/admin/appointments/stats');
  }

  // --- Rating Endpoints ---
  async submitRating(applicationId: string, body: { score: number; review?: string }): Promise<{ message: string; rating: ServiceRating }> {
    return this.request<{ message: string; rating: ServiceRating }>(`/ratings/${applicationId}`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getApplicationRating(applicationId: string): Promise<{ rating: ServiceRating | null }> {
    return this.request<{ rating: ServiceRating | null }>(`/ratings/${applicationId}`);
  }

  async adminGetRatingStats(): Promise<{ ratings: ServiceRating[]; stats: { total: number; averageScore: number } }> {
    return this.request<{ ratings: ServiceRating[]; stats: { total: number; averageScore: number } }>('/admin/ratings');
  }

  // --- Activity Endpoints (Admin) ---
  async adminGetActivities(params?: { page?: number; action?: string }): Promise<{ activities: ActivityEntry[]; pagination: { page: number; totalPages: number; total: number } }> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.action) query.set('action', params.action);
    const qs = query.toString();
    return this.request<{ activities: ActivityEntry[]; pagination: { page: number; totalPages: number; total: number } }>(`/admin/activities${qs ? `?${qs}` : ''}`);
  }

  async adminGetRecentActivities(): Promise<{ activities: ActivityEntry[] }> {
    return this.request<{ activities: ActivityEntry[] }>('/admin/activities/recent');
  }

  // --- Admin Endpoints ---
  async adminGetApplications(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    serviceType?: string;
  }): Promise<{
    applications: Application[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.serviceType) query.set('serviceType', params.serviceType);
    const qs = query.toString();
    return this.request<{
      applications: Application[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/admin/applications${qs ? `?${qs}` : ''}`);
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

  // --- Timeline ---
  async getMyTimeline(): Promise<{ events: TimelineEvent[]; total: number }> {
    return this.request<{ events: TimelineEvent[]; total: number }>('/timeline');
  }

  // --- Reports ---
  async adminGetReport(period?: string): Promise<{ report: Report }> {
    const qs = period ? `?period=${period}` : '';
    return this.request<{ report: Report }>(`/admin/report${qs}`);
  }

  // --- Announcements ---
  async getActiveAnnouncements(): Promise<{ announcements: Announcement[] }> {
    return this.request<{ announcements: Announcement[] }>('/announcements');
  }

  async adminGetAnnouncements(): Promise<{ announcements: Announcement[] }> {
    return this.request<{ announcements: Announcement[] }>('/admin/announcements');
  }

  async adminCreateAnnouncement(body: { title: string; message: string }): Promise<{ message: string; announcement: Announcement }> {
    return this.request<{ message: string; announcement: Announcement }>('/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async adminUpdateAnnouncement(id: string, body: { title?: string; message?: string; active?: boolean }): Promise<{ message: string; announcement: Announcement }> {
    return this.request<{ message: string; announcement: Announcement }>(`/admin/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async adminDeleteAnnouncement(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/announcements/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Favorite Services ---
  async getFavorites(): Promise<{ favorites: string[] }> {
    return this.request<{ favorites: string[] }>('/favorites');
  }

  async toggleFavorite(serviceType: string): Promise<{ message: string; favorited: boolean }> {
    return this.request<{ message: string; favorited: boolean }>('/favorites/toggle', {
      method: 'POST',
      body: JSON.stringify({ serviceType }),
    });
  }
}

export const api = new ApiService();
