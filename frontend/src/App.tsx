import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import type { User as ApiUser, Application, ServiceType, Notification, Complaint, Appointment, ActivityEntry, Announcement, Report, TimelineEvent } from './services/api';
import './App.css';
import {
  Home,
  LayoutDashboard,
  Search,
  Lock,
  FileText,
  Shield,
  BookOpen,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileUp,
  X,
  Plus,
  Globe,
  Bookmark,
  Receipt,
  Car,
  HeartPulse,
  Briefcase,
  Sparkles,
  Bell,
  MessageSquare,
  Calendar,
  CalendarCheck,
  Star,
  Activity,
  User,
  Save,
  Key,
  TrendingUp,
  BarChart3,
  MessageCircle,
  Send,
  Bot,
  Moon,
  Sun,
  Download,
  Printer,
  Megaphone,
  HelpCircle,
  History,
  Clock,
  MapPin,
  Phone,
  Mail,
  ArrowUp,
} from 'lucide-react';

export default function App() {
  // Navigation & User session states
  const [lang, setLang] = useState<'en' | 'ar'>('en'); // Default language is English
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('misrgate_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Default mock user to bypass login/signup barrier completely
  const [user, setUser] = useState<ApiUser | null>({
    id: 'demo-citizen-12345',
    email: 'zeyad@gmail.com',
    name: 'Zeyad Ahmed Ali',
    nationalId: '30305240102456',
    phone: '01123456789',
    role: 'CITIZEN'
  });

  const [currentView, setCurrentView] = useState<'home' | 'faq' | 'dashboard' | 'apply' | 'track' | 'admin' | 'complaints' | 'admin_complaints' | 'appointments' | 'admin_appointments' | 'ratings' | 'activity_log' | 'profile' | 'analytics' | 'admin_announcements' | 'admin_reports' | 'timeline' | 'service_directory' | 'about' | 'terms' | 'holidays' | 'guides' | 'sitemap' | 'shortcuts'>('home');
  
  // Forms & Service application states
  const [selectedService, setSelectedService] = useState<ServiceType>('NATIONAL_ID');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<{ code: string; type: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form input bindings
  const [nationalIdForm, setNationalIdForm] = useState({
    fullNameAr: '',
    birthDate: '',
    maritalStatus: 'single',
    profession: '',
    address: '',
    motherName: '',
    reason: 'renewal'
  });

  const [militaryForm, setMilitaryForm] = useState({
    fullNameAr: '',
    docType: 'exemption', // exemption | travel_permit | postponement | service_certificate
    reason: 'sole_breadwinner',
    familyStatus: ''
  });

  const [birthCertForm, setBirthCertForm] = useState({
    fullNameAr: '',
    motherNameAr: '',
    fatherNameAr: '',
    gender: 'male' as 'male' | 'female',
    placeOfBirth: '',
    birthDate: ''
  });

  const [passportForm, setPassportForm] = useState({
    fullNameEn: '',
    fullNameAr: '',
    profession: '',
    maritalStatus: 'single',
    qualification: ''
  });

  const [taxForm, setTaxForm] = useState({
    fullNameAr: '',
    taxRegistrationNumber: '',
    paymentType: 'income_tax',
    taxPeriod: '',
    amount: '',
    paymentMethod: 'card',
  });

  const [trafficForm, setTrafficForm] = useState({
    fullNameAr: '',
    licensePlate: '',
    violationReference: '',
    governorate: '',
    fineAmount: '',
  });

  const [healthForm, setHealthForm] = useState({
    fullNameAr: '',
    coverageType: 'individual',
    employerName: '',
    dependentsCount: '0',
  });

  const [socialForm, setSocialForm] = useState({
    fullNameAr: '',
    employerName: '',
    contributionType: 'employee',
    monthlyIncomeBracket: '5k_15k',
  });

  // Search tracking state
  const [searchTrackingCode, setSearchTrackingCode] = useState('');
  const [trackedApplication, setTrackedApplication] = useState<Partial<Application> | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  // Citizen Dashboard applications list
  const [citizenApps, setCitizenApps] = useState<Application[]>([]);
  const [citizenAppsLoading, setCitizenAppsLoading] = useState(false);

  // Admin states
  const [adminApps, setAdminApps] = useState<Application[]>([]);
  const [adminStats, setAdminStats] = useState<{
    totalApplications: number;
    totalUsers: number;
    byStatus: Record<string, number>;
    byService: Record<string, number>;
  } | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [selectedAppForReview, setSelectedAppForReview] = useState<Application | null>(null);
  const [adminDecision, setAdminDecision] = useState({ status: 'UNDER_REVIEW', notes: '' });
  const [adminFilterStatus, setAdminFilterStatus] = useState<string>('ALL');
  const [adminFilterService, setAdminFilterService] = useState<string>('ALL');
  const [adminSearch, setAdminSearch] = useState('');
  const [adminPagination, setAdminPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Notification states
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Complaint states
  const [complaintForm, setComplaintForm] = useState({ category: 'SERVICE_QUALITY', subject: '', message: '' });
  const [citizenComplaints, setCitizenComplaints] = useState<Complaint[]>([]);
  const [complaintSuccess, setComplaintSuccess] = useState(false);
  const [complaintError, setComplaintError] = useState<string | null>(null);
  const [adminComplaints, setAdminComplaints] = useState<Complaint[]>([]);
  const [adminComplaintFilter, setAdminComplaintFilter] = useState({ category: 'ALL', status: 'ALL' });
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [complaintResponse, setComplaintResponse] = useState('');

  // Appointment states
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentForm, setAppointmentForm] = useState({ department: 'GENERAL_INQUIRY', date: '', timeSlot: '' });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [appointmentSuccess, setAppointmentSuccess] = useState(false);
  const [appointmentLoading, setAppointmentLoading] = useState(false);
  const [adminAppointments, setAdminAppointments] = useState<Appointment[]>([]);

  // Rating states
  const [ratingModalApp, setRatingModalApp] = useState<Application | null>(null);
  const [ratingForm, setRatingForm] = useState({ score: 5, review: '' });
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<{
    overview: { totalApplications: number; totalUsers: number; totalComplaints: number; totalAppointments: number; totalRatings: number; averageRating: number };
    appsByService: Record<string, number>;
    appsByStatus: Record<string, number>;
    appsTrend: { date: string; count: number }[];
    complaintsByCategory: Record<string, number>;
    appointmentsByDepartment: Record<string, number>;
  } | null>(null);
  const [analyticsDays, setAnalyticsDays] = useState(30);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Reports state
  const [reportData, setReportData] = useState<Report | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportPeriod, setReportPeriod] = useState('7');

  // Chatbot states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Hello! I am the MisrGate AI Assistant. Ask me about services, applications, appointments, users, or anything about the portal!' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Activity log states
  const [activityEntries, setActivityEntries] = useState<ActivityEntry[]>([]);
  const [activityPage, setActivityPage] = useState(1);
  const [activityTotalPages, setActivityTotalPages] = useState(1);
  const [activityActionFilter, setActivityActionFilter] = useState('');

  // Timeline state
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  // Announcements states
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [adminAnnouncements, setAdminAnnouncements] = useState<Announcement[]>([]);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '' });
  const [announcementFormError, setAnnouncementFormError] = useState('');
  const [announcementFormSuccess, setAnnouncementFormSuccess] = useState('');

  // Favorite services states
  const [favorites, setFavorites] = useState<string[]>([]);

  // Profile states
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [faqFilter, setFaqFilter] = useState('ALL');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);

  // Modal active state
  const [activeApplicationDetails, setActiveApplicationDetails] = useState<Application | null>(null);

  // Font size accessibility
  const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem('misrgate_fontsize') || '100'));
  const adjustFont = (delta: number) => {
    const newSize = Math.max(80, Math.min(140, fontSize + delta));
    setFontSize(newSize);
    localStorage.setItem('misrgate_fontsize', newSize.toString());
    document.documentElement.style.fontSize = `${newSize}%`;
  };
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, []);

  // Translation helper function
  const t = (enText: string, arText: string) => {
    return lang === 'en' ? enText : arText;
  };

  const getErrorMessage = (err: unknown, fallback: string) =>
    err instanceof Error ? err.message : fallback;

  const fetchCitizenData = async () => {
    setCitizenAppsLoading(true);
    try {
      const res = await api.getMyApplications();
      setCitizenApps(res.applications);
    } catch (err) {
      console.error(err);
    } finally {
      setCitizenAppsLoading(false);
    }
  };

  const fetchAdminData = async (pageNum?: number) => {
    setAdminLoading(true);
    try {
      const p = pageNum ?? adminPagination.page;
      const [appsRes, statsRes] = await Promise.all([
        api.adminGetApplications({
          page: p,
          limit: 20,
          search: adminSearch || undefined,
          status: adminFilterStatus !== 'ALL' ? adminFilterStatus : undefined,
          serviceType: adminFilterService !== 'ALL' ? adminFilterService : undefined,
        }),
        api.adminGetStats()
      ]);
      setAdminApps(appsRes.applications);
      setAdminPagination({
        page: appsRes.pagination.page,
        totalPages: appsRes.pagination.totalPages,
        total: appsRes.pagination.total,
      });
      setAdminStats(statsRes.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setAdminLoading(false);
    }
  };

  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      console.error(err);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const fetchTimeline = async () => {
    setTimelineLoading(true);
    try {
      const res = await api.getMyTimeline();
      setTimelineEvents(res.events);
    } catch (err) {
      console.error(err);
    } finally {
      setTimelineLoading(false);
    }
  };

  const fetchReport = async (period?: string) => {
    setReportLoading(true);
    try {
      const p = period || reportPeriod;
      const res = await api.adminGetReport(p);
      setReportData(res.report);
    } catch (err) {
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await api.getActiveAnnouncements();
      setAnnouncements(res.announcements);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdminAnnouncements = async () => {
    try {
      const res = await api.adminGetAnnouncements();
      setAdminAnnouncements(res.announcements);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnnouncementFormError('');
    setAnnouncementFormSuccess('');
    if (!announcementForm.title || !announcementForm.message) {
      setAnnouncementFormError('Title and message are required.');
      return;
    }
    try {
      await api.adminCreateAnnouncement(announcementForm);
      setAnnouncementForm({ title: '', message: '' });
      setAnnouncementFormSuccess('Announcement created successfully.');
      void fetchAdminAnnouncements();
    } catch (err) {
      setAnnouncementFormError(err instanceof Error ? err.message : 'Failed to create announcement.');
    }
  };

  const handleToggleAnnouncement = async (id: string, active: boolean) => {
    try {
      await api.adminUpdateAnnouncement(id, { active: !active });
      void fetchAdminAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await api.adminDeleteAnnouncement(id);
      void fetchAdminAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await api.getFavorites();
      setFavorites(res.favorites);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFavorite = async (serviceType: string) => {
    try {
      const res = await api.toggleFavorite(serviceType);
      if (res.favorited) {
        setFavorites(prev => [...prev, serviceType]);
      } else {
        setFavorites(prev => prev.filter(f => f !== serviceType));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    await api.markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    await api.markAllNotificationsAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const fetchCitizenComplaints = async () => {
    try {
      const res = await api.getMyComplaints();
      setCitizenComplaints(res.complaints);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdminComplaints = async () => {
    try {
      const res = await api.adminGetComplaints(adminComplaintFilter);
      setAdminComplaints(res.complaints);
    } catch (err) {
      console.error(err);
    }
  };

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setComplaintError(null);
    setComplaintSuccess(false);
    try {
      await api.createComplaint(complaintForm);
      setComplaintSuccess(true);
      setComplaintForm({ category: 'SERVICE_QUALITY', subject: '', message: '' });
      fetchCitizenComplaints();
    } catch (err: unknown) {
      setComplaintError(err instanceof Error ? err.message : 'Failed to submit complaint.');
    }
  };

  const handleComplaintResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      await api.adminRespondToComplaint(selectedComplaint.id, { response: complaintResponse });
      setSelectedComplaint(null);
      setComplaintResponse('');
      fetchAdminComplaints();
    } catch (err) {
      console.error(err);
    }
  };

  const goToDashboard = () => {
    setCurrentView('dashboard');
    void fetchCitizenData();
    void fetchNotifications();
  };

  const goToAdmin = () => {
    setCurrentView('admin');
    void fetchAdminData();
  };

  const fetchAvailableSlots = async (date: string, department: string) => {
    if (!date || !department) return;
    try {
      const res = await api.getAvailableSlots(date, department);
      setAvailableSlots(res.available);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyAppointments = async () => {
    try {
      const res = await api.getMyAppointments();
      setAppointments(res.appointments);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdminAppointments = async () => {
    try {
      const res = await api.adminGetAppointments();
      setAdminAppointments(res.appointments);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppointmentLoading(true);
    setAppointmentSuccess(false);
    try {
      await api.bookAppointment(appointmentForm);
      setAppointmentSuccess(true);
      setAppointmentForm({ department: 'GENERAL_INQUIRY', date: '', timeSlot: '' });
      fetchMyAppointments();
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setAppointmentLoading(false);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      await api.cancelAppointment(id);
      fetchMyAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingModalApp) return;
    try {
      await api.submitRating(ratingModalApp.id, ratingForm);
      setRatingSubmitted(true);
      setTimeout(() => { setRatingModalApp(null); setRatingSubmitted(false); }, 2000);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const fetchAnalytics = async (days?: number) => {
    const d = days ?? analyticsDays;
    setAnalyticsLoading(true);
    try {
      const token = localStorage.getItem('misrgate_token');
      const res = await fetch(`http://localhost:5000/api/admin/analytics?days=${d}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      const data = await res.json();
      if (data.overview) setAnalyticsData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchActivities = async (pageNum?: number) => {
    try {
      const p = pageNum ?? activityPage;
      const res = await api.adminGetActivities({ page: p, action: activityActionFilter || undefined });
      setActivityEntries(res.activities);
      setActivityPage(res.pagination.page);
      setActivityTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  // Persist dark mode preference
  useEffect(() => {
    localStorage.setItem('misrgate_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    void fetchFavorites();
    void fetchAnnouncements();
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('misrgate_theme')) {
        setDarkMode(e.matches);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Toggle Language Handler
  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'ar' : 'en'));
  };

  // Role Switcher Handler (For Demo/Evaluation Convenience)
  const toggleRole = () => {
    if (!user) return;
    const newRole = user.role === 'CITIZEN' ? 'ADMIN' : 'CITIZEN';
    setUser({ ...user, role: newRole });
    if (newRole === 'ADMIN') {
      goToAdmin();
    } else {
      goToDashboard();
    }
  };

  // Profile handlers
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setProfileSaving(true);
    try {
      const token = localStorage.getItem('misrgate_token');
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (data.user) {
        setUser(prev => prev ? { ...prev, name: data.user.name, phone: data.user.phone } : prev);
        setProfileSuccess(t('Profile updated successfully!', 'تم تحديث الملف الشخصي بنجاح!'));
      } else {
        setProfileError(data.error || 'Update failed.');
      }
    } catch {
      setProfileError(t('An error occurred.', 'حدث خطأ.'));
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError(t('Passwords do not match.', 'كلمات المرور غير متطابقة.'));
      return;
    }
    try {
      const token = localStorage.getItem('misrgate_token');
      const res = await fetch('http://localhost:5000/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess(t('Password changed successfully!', 'تم تغيير كلمة المرور بنجاح!'));
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordError(data.error || 'Failed to change password.');
      }
    } catch {
      setPasswordError(t('An error occurred.', 'حدث خطأ.'));
    }
  };

  // CSV Download Handler
  const downloadCSV = async (endpoint: string, filename: string) => {
    try {
      const token = localStorage.getItem('misrgate_token');
      const res = await fetch(`http://localhost:5000/api/admin/export/${endpoint}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (!res.ok) { alert('Export failed.'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      a.click(); URL.revokeObjectURL(url);
    } catch { alert('Export failed.'); }
  };

  // Chatbot Handler
  const handleChatSend = async () => {
    const msg = chatInput.trim();
    if (!msg || chatLoading) return;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setChatLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      if (data.reply) {
        setChatMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
      }
    } catch {
      setChatMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I am having trouble connecting. Please try again later.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Quick Tracker Search
  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTrackingCode.trim()) return;

    setTrackingLoading(true);
    setTrackingError(null);
    setTrackedApplication(null);

    try {
      const res = await api.trackApplicationPublic(searchTrackingCode.trim().toUpperCase());
      setTrackedApplication(res);
      setCurrentView('track');
    } catch (err: unknown) {
      setTrackingError(getErrorMessage(err, t('Application not found. Please verify the code.', 'لم يتم العثور على الطلب. يرجى التحقق من الكود.')));
    } finally {
      setTrackingLoading(false);
    }
  };

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      alert(t('Only JPEG, PNG, GIF, and PDF files are allowed.', 'يُسمح فقط بملفات JPEG، PNG، GIF، PDF.'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert(t('File must be under 5MB.', 'الملف يجب أن يكون أقل من 5 ميجابايت.'));
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('misrgate_token');
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setUploadedFile({ url: data.url, name: data.originalName });
      } else {
        alert(data.error || 'Upload failed.');
      }
    } catch {
      alert(t('Upload failed. Please try again.', 'فشل الرفع. حاول مرة أخرى.'));
    } finally {
      setUploading(false);
    }
  };

  // Form Submission Builder
  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);

    let formData = {};
    if (selectedService === 'NATIONAL_ID') formData = nationalIdForm;
    else if (selectedService === 'MILITARY_EXEMPTION') formData = militaryForm;
    else if (selectedService === 'BIRTH_CERTIFICATE') formData = birthCertForm;
    else if (selectedService === 'PASSPORT') formData = passportForm;
    else if (selectedService === 'TAX_PAYMENT') formData = taxForm;
    else if (selectedService === 'TRAFFIC_FINE') formData = trafficForm;
    else if (selectedService === 'HEALTH_INSURANCE') formData = healthForm;
    else if (selectedService === 'SOCIAL_INSURANCE') formData = socialForm;

    try {
      const res = await api.createApplication({
        serviceType: selectedService,
        data: formData,
        ...(uploadedFile?.url && { attachmentUrl: uploadedFile.url }),
      });
      setUploadedFile(null);
      setFormSuccess({ code: res.trackingCode, type: selectedService });
      
      // Reset forms
      setNationalIdForm({ fullNameAr: '', birthDate: '', maritalStatus: 'single', profession: '', address: '', motherName: '', reason: 'renewal' });
      setMilitaryForm({ fullNameAr: '', docType: 'exemption', reason: 'sole_breadwinner', familyStatus: '' });
      setBirthCertForm({ fullNameAr: '', motherNameAr: '', fatherNameAr: '', gender: 'male', placeOfBirth: '', birthDate: '' });
      setPassportForm({ fullNameEn: '', fullNameAr: '', profession: '', maritalStatus: 'single', qualification: '' });
      setTaxForm({ fullNameAr: '', taxRegistrationNumber: '', paymentType: 'income_tax', taxPeriod: '', amount: '', paymentMethod: 'card' });
      setTrafficForm({ fullNameAr: '', licensePlate: '', violationReference: '', governorate: '', fineAmount: '' });
      setHealthForm({ fullNameAr: '', coverageType: 'individual', employerName: '', dependentsCount: '0' });
      setSocialForm({ fullNameAr: '', employerName: '', contributionType: 'employee', monthlyIncomeBracket: '5k_15k' });
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, t('Failed to submit application.', 'فشل تقديم الطلب.')));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Admin Decision Submit
  const handleAdminDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForReview) return;

    try {
      await api.adminUpdateStatus(selectedAppForReview.id, adminDecision);
      setSelectedAppForReview(null);
      setAdminDecision({ status: 'UNDER_REVIEW', notes: '' });
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  // Apply button Click Handler
  const handleApplyClick = (serviceType: ServiceType) => {
    setSelectedService(serviceType);
    setFormSuccess(null);
    setFormError(null);
    setCurrentView('apply');
  };

  // Label Formatter for Service Type
  const getServiceLabel = (type: string) => {
    switch (type) {
      case 'NATIONAL_ID': 
        return t('National ID Card Renewal', 'تجديد بطاقة الرقم القومي');
      case 'MILITARY_EXEMPTION': 
        return t('Military & Recruitment', 'التجنيد والتعبئة');
      case 'BIRTH_CERTIFICATE': 
        return t('Civil Birth Certificate', 'شهادة الميلاد الرقمية');
      case 'PASSPORT': 
        return t('Egyptian Passport Services', 'جواز السفر المصري');
      case 'TAX_PAYMENT':
        return t('Tax Payment (ETA)', 'سداد الضرائب المصرية');
      case 'TRAFFIC_FINE':
        return t('Traffic Violations', 'مخالفات المرور');
      case 'HEALTH_INSURANCE':
        return t('Health Insurance (UHIA)', 'التأمين الصحي الشامل');
      case 'SOCIAL_INSURANCE':
        return t('Social Insurance', 'التأمينات الاجتماعية');
      default: 
        return type;
    }
  };

  // Label Formatter for Military Doc Types
  const getMilitaryDocLabel = (docType: string) => {
    switch (docType) {
      case 'exemption':
        return t('Military Exemption Certificate', 'شهادة الإعفاء من التجنيد');
      case 'travel_permit':
        return t('Armed Forces Travel Permit', 'تصريح سفر عسكري');
      case 'postponement':
        return t('Service Postponement (Student Delay)', 'شهادة تأجيل التجنيد للدراسة');
      case 'service_certificate':
        return t('Military Service Completion Certificate', 'شهادة أداء الخدمة العسكرية');
      default:
        return docType;
    }
  };

  const isRtl = lang === 'ar';

  return (
    <div className={`app-container ${isRtl ? 'arabic-layout' : ''} ${darkMode ? 'dark-mode' : ''}`}>
      
      {/* Developer Role Switcher (Simulated Login Bypass) */}
      <div className="dev-banner">
        <span>
          🛡️ <strong>{t('DEVELOPER BYPASS ACTIVE (Login/Signup Bypassed)', 'وضع التطوير نشط (تم تخطي جدار تسجيل الدخول)')}</strong>
        </span>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span>
            {t('Logged in as:', 'مُسجل الدخول كـ:')} <strong>{user?.name}</strong> ({user?.role === 'ADMIN' ? t('Admin / مسؤول', 'مسؤول') : t('Citizen / مواطن', 'مواطن')})
          </span>
          <button onClick={toggleRole} className="dev-toggle-btn">
            {user?.role === 'CITIZEN' ? t('Switch to Admin Desk', 'التحويل لحساب المسؤول') : t('Switch to Citizen View', 'التحويل لحساب المواطن')}
          </button>
        </div>
      </div>

      {/* 1. Header & Navigation */}
      <header className="navbar">
        <div className="navbar-content" style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}>
          <a href="#" className="logo-section" onClick={() => { setCurrentView('home'); setFormSuccess(null); }}>
            <div className="logo-symbol">🇪🇬</div>
            <div className="logo-text" style={{ alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
              <span>{t('MisrGate', 'بوابة مصر')}</span>
              <span className="logo-sub">{t('Digital Services Platform', 'منصة الخدمات الرقمية')}</span>
            </div>
          </a>
          <nav className="nav-links" style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}>
            <span className={`nav-link ${currentView === 'home' ? 'active' : ''}`} onClick={() => setCurrentView('home')}>
              <Home size={15} />
              {t('Home', 'الرئيسية')}
            </span>
            
            {user?.role === 'CITIZEN' && (
              <span className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`} onClick={goToDashboard}>
                <LayoutDashboard size={15} />
                {t('Dashboard', 'لوحة التحكم')}
              </span>
            )}

            {user?.role === 'CITIZEN' && (
              <span className={`nav-link ${currentView === 'complaints' ? 'active' : ''}`} onClick={() => { setCurrentView('complaints'); setComplaintSuccess(false); fetchCitizenComplaints(); }}>
                <MessageSquare size={15} />
                {t('Feedback', 'الشكاوى')}
              </span>
            )}
            {user?.role === 'CITIZEN' && (<>
              <span className={`nav-link ${currentView === 'timeline' ? 'active' : ''}`} onClick={() => { setCurrentView('timeline'); fetchTimeline(); }}>
                <History size={15} />
                {t('Timeline', 'النشاطات')}
              </span>
              <span className={`nav-link ${currentView === 'appointments' ? 'active' : ''}`} onClick={() => { setCurrentView('appointments'); setAppointmentSuccess(false); fetchMyAppointments(); }}>
                <Calendar size={15} />
                {t('Appointments', 'المواعيد')}
              </span>
            </>)}

            {user?.role === 'ADMIN' && (
              <span className={`nav-link ${currentView === 'admin' ? 'active' : ''}`} onClick={goToAdmin}>
                <Lock size={15} />
                {t('Admin Desk', 'غرفة الإدارة')}
              </span>
            )}
            {user?.role === 'ADMIN' && (
              <span className={`nav-link ${currentView === 'admin_complaints' ? 'active' : ''}`} onClick={() => { setCurrentView('admin_complaints'); fetchAdminComplaints(); }}>
                <MessageSquare size={15} />
                {t('Complaints', 'الشكاوى')}
              </span>
            )}
            {user?.role === 'ADMIN' && (
              <span className={`nav-link ${currentView === 'admin_appointments' ? 'active' : ''}`} onClick={() => { setCurrentView('admin_appointments'); fetchAdminAppointments(); }}>
                <CalendarCheck size={15} />
                {t('Appointments', 'المواعيد')}
              </span>
            )}
            {user?.role === 'ADMIN' && (
              <span className={`nav-link ${currentView === 'admin_reports' ? 'active' : ''}`} onClick={() => { setCurrentView('admin_reports'); fetchReport('7'); }}>
                <FileText size={15} />
                {t('Reports', 'التقارير')}
              </span>
            )}
            {user?.role === 'ADMIN' && (
              <span className={`nav-link ${currentView === 'analytics' ? 'active' : ''}`} onClick={() => { setCurrentView('analytics'); fetchAnalytics(); }}>
                <BarChart3 size={15} />
                {t('Analytics', 'الإحصائيات')}
              </span>
            )}
            {user?.role === 'ADMIN' && (
              <span className={`nav-link ${currentView === 'activity_log' ? 'active' : ''}`} onClick={() => { setCurrentView('activity_log'); fetchActivities(1); }}>
                <Activity size={15} />
                {t('Activity', 'النشاط')}
              </span>
            )}
            <span className={`nav-link ${currentView === 'service_directory' ? 'active' : ''}`} onClick={() => setCurrentView('service_directory')}>
              <MapPin size={15} />
              {t('Directory', 'الدليل')}
            </span>
            <span className={`nav-link ${currentView === 'faq' ? 'active' : ''}`} onClick={() => setCurrentView('faq')}>
              <HelpCircle size={15} />
              {t('FAQ', 'الأسئلة')}
            </span>
            <span className={`nav-link ${currentView === 'guides' ? 'active' : ''}`} onClick={() => setCurrentView('guides')}>
              <BookOpen size={15} />
              {t('Guides', 'الأدلة')}
            </span>
            <span className={`nav-link ${currentView === 'about' ? 'active' : ''}`} onClick={() => setCurrentView('about')}>
              <Globe size={15} />
              {t('About', 'عن البوابة')}
            </span>
            {user?.role === 'ADMIN' && (
              <span className={`nav-link ${currentView === 'admin_announcements' ? 'active' : ''}`} onClick={() => { setCurrentView('admin_announcements'); fetchAdminAnnouncements(); }}>
                <Megaphone size={15} />
                {t('Announcements', 'الإعلانات')}
              </span>
            )}

            {/* Notification Bell */}
            {user && (
              <div className="notification-bell-wrapper">
                <button className="notification-bell" onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); fetchNotifications(); }}>
                  <Bell size={15} />
                  {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                </button>
                {showNotifications && (
                  <div className={`notification-dropdown ${isRtl ? 'rtl' : ''}`} onClick={(e) => e.stopPropagation()}>
                    <div className="notification-dropdown-header">
                      <strong>{t('Notifications', 'الإشعارات')}</strong>
                      {unreadCount > 0 && (
                        <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }} onClick={handleMarkAllAsRead}>
                          {t('Mark all read', 'تحديد الكل كمقروء')}
                        </button>
                      )}
                    </div>
                    <div className="notification-list">
                      {notificationsLoading ? (
                        <div style={{ padding: '1rem', textAlign: 'center' }}><Loader2 className="spinner" size={16} /></div>
                      ) : notifications.length === 0 ? (
                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {t('No notifications', 'لا توجد إشعارات')}
                        </div>
                      ) : (
                        notifications.slice(0, 10).map(n => (
                          <div
                            key={n.id}
                            className={`notification-item ${n.read ? '' : 'unread'}`}
                            onClick={() => { if (!n.read) handleMarkAsRead(n.id); }}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="notification-dot" data-type={n.type}></div>
                            <div>
                              <div style={{ fontWeight: n.read ? 400 : 600, fontSize: '0.85rem' }}>{n.title}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{n.message}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Link */}
            {user && (
              <span className={`nav-link ${currentView === 'profile' ? 'active' : ''}`} onClick={() => { setCurrentView('profile'); setProfileForm({ name: user.name, phone: user.phone }); setProfileSuccess(''); setPasswordSuccess(''); }}>
                <User size={15} />
                {t('Profile', 'الملف الشخصي')}
              </span>
            )}

            {/* Dark Mode Toggle */}
            <button onClick={() => setDarkMode(!darkMode)} className="lang-btn" style={{ fontSize: '0.75rem' }}>
              {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {/* Font Size Controls */}
            <button className="lang-btn" onClick={() => adjustFont(-10)} style={{ fontSize: '0.7rem' }} title={t('Decrease font size', 'تصغير الخط')}>A-</button>
            <button className="lang-btn" onClick={() => adjustFont(10)} style={{ fontSize: '0.85rem' }} title={t('Increase font size', 'تكبير الخط')}>A+</button>

            {/* Language Switcher Pill */}
            <button onClick={toggleLanguage} className="lang-btn">
              <Globe size={14} />
              <span>{lang === 'en' ? 'العربية' : 'English'}</span>
            </button>
          </nav>
        </div>
      </header>

      {/* 2. Main Page Router */}
      <main className="content-wrapper">
        
        {/* VIEW: HOME / LANDING */}
        {currentView === 'home' && (
          <div>
            <section className="hero">
              <span className="hero-badge">{t('Official E-Government Portal', 'بوابة الخدمات الرقمية المعتمدة')}</span>
              <h1 className="hero-title">
                {t('Secure Documents & ', 'استخراج الوثائق والخدمات ')}
                <span>{t('Government Services', 'الحكومية')}</span>
              </h1>
              <p className="hero-subtitle">
                {t('Renew your Egyptian National ID, apply for military exemption or travel certificates, download certified civil status papers, or track document delivery status from home.',
                   'جدد بطاقة الرقم القومي، واطلب شهادات الإعفاء أو تصاريح السفر العسكرية، واستخرج وثائق الميلاد والوفاة إلكترونياً مع ميزة التتبع المباشر.')}
              </p>

              {/* Quick Application Tracker Search */}
              <form onSubmit={handleTrackSearch} className="hero-search" style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                <input
                  type="text"
                  placeholder={t('Enter 11-Digit Application Tracking ID (e.g. MG-1024-5896)', 'أدخل كود تتبع المعاملة المكون من 11 رقماً')}
                  value={searchTrackingCode}
                  onChange={(e) => setSearchTrackingCode(e.target.value)}
                  style={{ textAlign: isRtl ? 'right' : 'left' }}
                />
                <button type="submit" className="btn btn-primary">
                  {trackingLoading ? <Loader2 className="spinner" size={16} /> : <><Search size={15} /> {t('Track', 'تتبع')}</>}
                </button>
              </form>
              
              {trackingError && (
                <div className="error-banner" style={{ maxWidth: '550px', margin: '-0.75rem auto 1.5rem auto' }}>
                  <AlertCircle size={18} /> {trackingError}
                </div>
              )}
            </section>

            {/* Announcements Banner */}
            {announcements.length > 0 && (
              <div className="announcements-banner" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
                {announcements.map(a => (
                  <div key={a.id} className="announcement-item">
                    <Megaphone size={18} />
                    <div>
                      <strong>{a.title}</strong>
                      <p>{a.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Favorites Section */}
            {favorites.length > 0 && (
              <div className="favorites-section" style={{ textAlign: 'center' }}>
                <h3 style={{ justifyContent: 'center' }}>
                  <Star size={16} fill="var(--accent-gold)" color="var(--accent-gold)" />
                  {t('Your Favorite Services', 'خدماتك المفضلة')}
                </h3>
                <div className="favorites-list" style={{ justifyContent: 'center' }}>
                  {favorites.map(fav => (
                    <button key={fav} className="favorites-chip" onClick={() => handleApplyClick(fav as ServiceType)}>
                      <Star size={12} fill="var(--accent-gold)" color="var(--accent-gold)" />
                      {getServiceLabel(fav)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Service Grid Section */}
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              {t('Official Portal Services', 'خدمات البوابة الإلكترونية المتاحة')}
            </h2>
            
            <div className="services-grid" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
              
              {/* Card 1: National ID */}
              <div className="glass-card service-card" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                <div className="service-icon" style={{ alignSelf: isRtl ? 'flex-end' : 'flex-start' }}><FileText size={20} /></div>
                <h3>
                  {t('National ID Cards', 'بطاقات الرقم القومي')}
                  <button
                    className="favorite-star"
                    onClick={(e) => { e.stopPropagation(); handleToggleFavorite('NATIONAL_ID'); }}
                    title={favorites.includes('NATIONAL_ID') ? 'Remove from favorites' : 'Add to favorites'}
                    style={{ color: favorites.includes('NATIONAL_ID') ? 'var(--accent-gold)' : 'var(--text-secondary)', marginLeft: '0.5rem' }}
                  >
                    <Star size={16} fill={favorites.includes('NATIONAL_ID') ? 'var(--accent-gold)' : 'transparent'} />
                  </button>
                </h3>
                <p>
                  {t('Submit card renewal, replace lost or damaged cards, or change details like address, occupation, or marital status.',
                     'تجديد بطاقة الرقم القومي، واستخراج بدل فاقد أو تالف، وتحديث البيانات الوظيفية والزوجية والعنوان.')}
                </p>
                <button className="btn btn-outline" style={{ marginTop: 'auto' }} onClick={() => handleApplyClick('NATIONAL_ID')}>
                  {t('Apply / Renew', 'تقديم طلب تجديد')}
                </button>
              </div>

              {/* Card 2: Military & Recruitment */}
              <div className="glass-card service-card" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                <div className="service-icon" style={{ alignSelf: isRtl ? 'flex-end' : 'flex-start' }}><Shield size={20} /></div>
                <h3>
                  {t('Military & Recruitment', 'التجنيد والتعبئة')}
                  <button className="favorite-star" onClick={(e) => { e.stopPropagation(); handleToggleFavorite('MILITARY_EXEMPTION'); }} title={favorites.includes('MILITARY_EXEMPTION') ? 'Remove from favorites' : 'Add to favorites'} style={{ color: favorites.includes('MILITARY_EXEMPTION') ? 'var(--accent-gold)' : 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                    <Star size={16} fill={favorites.includes('MILITARY_EXEMPTION') ? 'var(--accent-gold)' : 'transparent'} />
                  </button>
                </h3>
                <p>
                  {t('Apply for military exemption certificates, travel permits, student postponement documents, or completion details.',
                     'استخراج شهادة الإعفاء العسكري، تصاريح السفر للتجنيد، شهادات التأجيل الدراسي، وشهادات أداء الخدمة.')}
                </p>
                <button className="btn btn-outline" style={{ marginTop: 'auto' }} onClick={() => handleApplyClick('MILITARY_EXEMPTION')}>
                  {t('Request Documents', 'طلب الأوراق العسكرية')}
                </button>
              </div>

              {/* Card 3: Civil Registry */}
              <div className="glass-card service-card" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                <div className="service-icon" style={{ alignSelf: isRtl ? 'flex-end' : 'flex-start' }}><Bookmark size={20} /></div>
                <h3>
                  {t('Civil Registry Records', 'وثائق الأحوال المدنية')}
                  <button className="favorite-star" onClick={(e) => { e.stopPropagation(); handleToggleFavorite('BIRTH_CERTIFICATE'); }} title={favorites.includes('BIRTH_CERTIFICATE') ? 'Remove from favorites' : 'Add to favorites'} style={{ color: favorites.includes('BIRTH_CERTIFICATE') ? 'var(--accent-gold)' : 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                    <Star size={16} fill={favorites.includes('BIRTH_CERTIFICATE') ? 'var(--accent-gold)' : 'transparent'} />
                  </button>
                </h3>
                <p>
                  {t('Order certified legal copies of birth certificates, marriage certificates, divorce records, or death documents.',
                     'استخراج وثائق الميلاد المعتمدة، قسائم الزواج والطلاق، وشهادات الوفاة بشكل رقمي معتمد.')}
                </p>
                <button className="btn btn-outline" style={{ marginTop: 'auto' }} onClick={() => handleApplyClick('BIRTH_CERTIFICATE')}>
                  {t('Request Copies', 'طلب وثيقة مدنية')}
                </button>
              </div>

              {/* Card 4: Passport Services */}
              <div className="glass-card service-card" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                <div className="service-icon" style={{ alignSelf: isRtl ? 'flex-end' : 'flex-start' }}><BookOpen size={20} /></div>
                <h3>
                  {t('Egyptian Passport', 'جواز السفر المصري')}
                  <button className="favorite-star" onClick={(e) => { e.stopPropagation(); handleToggleFavorite('PASSPORT'); }} title={favorites.includes('PASSPORT') ? 'Remove from favorites' : 'Add to favorites'} style={{ color: favorites.includes('PASSPORT') ? 'var(--accent-gold)' : 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                    <Star size={16} fill={favorites.includes('PASSPORT') ? 'var(--accent-gold)' : 'transparent'} />
                  </button>
                </h3>
                <p>
                  {t('Initiate first-time Egyptian passport requests or renew expired booklets. Arrange branch collection or courier shipping.',
                     'تقديم طلب إصدار جواز سفر لأول مرة أو التجديد. اختيار التوصيل للمنزل أو الاستلام من مقر الجوازات.')}
                </p>
                <button className="btn btn-outline" style={{ marginTop: 'auto' }} onClick={() => handleApplyClick('PASSPORT')}>
                  {t('Request Passport', 'طلب استخراج جواز')}
                </button>
              </div>

              {/* Card 5: Tax Payment */}
              <div className="glass-card service-card" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                <div className="service-icon" style={{ alignSelf: isRtl ? 'flex-end' : 'flex-start' }}><Receipt size={20} /></div>
                <h3>
                  {t('Tax Payment', 'سداد الضرائب')}
                  <button className="favorite-star" onClick={(e) => { e.stopPropagation(); handleToggleFavorite('TAX_PAYMENT'); }} title={favorites.includes('TAX_PAYMENT') ? 'Remove from favorites' : 'Add to favorites'} style={{ color: favorites.includes('TAX_PAYMENT') ? 'var(--accent-gold)' : 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                    <Star size={16} fill={favorites.includes('TAX_PAYMENT') ? 'var(--accent-gold)' : 'transparent'} />
                  </button>
                </h3>
                <p>
                  {t('Pay income tax, VAT, withholding, stamp duties, or penalties through the Egyptian Tax Authority channel.',
                     'سداد ضريبة الدخل، وضريبة القيمة المضافة، والخصم والتحصيل، والدمغة، أو الغرامات عبر قناة مصلحة الضرائب.')}
                </p>
                <button className="btn btn-outline" style={{ marginTop: 'auto' }} onClick={() => handleApplyClick('TAX_PAYMENT')}>
                  {t('Pay Taxes', 'سداد الضريبة')}
                </button>
              </div>

              {/* Card 6: Traffic Fines */}
              <div className="glass-card service-card" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                <div className="service-icon" style={{ alignSelf: isRtl ? 'flex-end' : 'flex-start' }}><Car size={20} /></div>
                <h3>
                  {t('Traffic Violations', 'مخالفات المرور')}
                  <button className="favorite-star" onClick={(e) => { e.stopPropagation(); handleToggleFavorite('TRAFFIC_FINE'); }} title={favorites.includes('TRAFFIC_FINE') ? 'Remove from favorites' : 'Add to favorites'} style={{ color: favorites.includes('TRAFFIC_FINE') ? 'var(--accent-gold)' : 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                    <Star size={16} fill={favorites.includes('TRAFFIC_FINE') ? 'var(--accent-gold)' : 'transparent'} />
                  </button>
                </h3>
                <p>
                  {t('Look up and pay traffic fines by plate number, violation reference, and governorate.',
                     'الاستعلام عن مخالفات المرور وسدادها برقم اللوحة ومرجع المخالفة والمحافظة.')}
                </p>
                <button className="btn btn-outline" style={{ marginTop: 'auto' }} onClick={() => handleApplyClick('TRAFFIC_FINE')}>
                  {t('Pay Fine', 'سداد المخالفة')}
                </button>
              </div>

              {/* Card 7: Health Insurance */}
              <div className="glass-card service-card" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                <div className="service-icon" style={{ alignSelf: isRtl ? 'flex-end' : 'flex-start' }}><HeartPulse size={20} /></div>
                <h3>
                  {t('Health Insurance', 'التأمين الصحي')}
                  <button className="favorite-star" onClick={(e) => { e.stopPropagation(); handleToggleFavorite('HEALTH_INSURANCE'); }} title={favorites.includes('HEALTH_INSURANCE') ? 'Remove from favorites' : 'Add to favorites'} style={{ color: favorites.includes('HEALTH_INSURANCE') ? 'var(--accent-gold)' : 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                    <Star size={16} fill={favorites.includes('HEALTH_INSURANCE') ? 'var(--accent-gold)' : 'transparent'} />
                  </button>
                </h3>
                <p>
                  {t('Register for universal health coverage, add dependents, and verify beneficiary eligibility.',
                     'التسجيل في التأمين الصحي الشامل، وإضافة المعالين، والتحقق من الأهلية.')}
                </p>
                <button className="btn btn-outline" style={{ marginTop: 'auto' }} onClick={() => handleApplyClick('HEALTH_INSURANCE')}>
                  {t('Enroll', 'التسجيل')}
                </button>
              </div>

              {/* Card 8: Social Insurance */}
              <div className="glass-card service-card" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                <div className="service-icon" style={{ alignSelf: isRtl ? 'flex-end' : 'flex-start' }}><Briefcase size={20} /></div>
                <h3>
                  {t('Social Insurance', 'التأمينات الاجتماعية')}
                  <button className="favorite-star" onClick={(e) => { e.stopPropagation(); handleToggleFavorite('SOCIAL_INSURANCE'); }} title={favorites.includes('SOCIAL_INSURANCE') ? 'Remove from favorites' : 'Add to favorites'} style={{ color: favorites.includes('SOCIAL_INSURANCE') ? 'var(--accent-gold)' : 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                    <Star size={16} fill={favorites.includes('SOCIAL_INSURANCE') ? 'var(--accent-gold)' : 'transparent'} />
                  </button>
                </h3>
                <p>
                  {t('Submit employee or voluntary social insurance contributions and pension-related requests.',
                     'تقديم اشتراكات التأمينات الاجتماعية للعاملين أو التطوعية وطلبات المعاش.')}
                </p>
                <button className="btn btn-outline" style={{ marginTop: 'auto' }} onClick={() => handleApplyClick('SOCIAL_INSURANCE')}>
                  {t('Submit Request', 'تقديم الطلب')}
                </button>
              </div>

            </div>

            {/* What's new — bottom info card */}
            <div
              className="glass-card updates-card"
              style={{
                marginTop: '2.5rem',
                textAlign: isRtl ? 'right' : 'left',
                direction: isRtl ? 'rtl' : 'ltr',
              }}
            >
              <div className="updates-card-header" style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                <div className="updates-card-badge">
                  <Sparkles size={18} aria-hidden />
                </div>
                <div>
                  <h3 className="updates-card-title">
                    {t("What's New on MisrGate", 'جديد على بوابة مصر')}
                  </h3>
                  <p className="updates-card-subtitle">
                    {t('Latest services and platform updates — May 2026', 'أحدث الخدمات وتحديثات المنصة — مايو 2026')}
                  </p>
                </div>
              </div>

              <ul className="updates-list">
                <li>
                  <strong>{t('Tax Payment', 'سداد الضرائب')}</strong>
                  {' — '}
                  {t('Pay income tax, VAT, withholding, and penalties online.', 'سداد ضريبة الدخل والقيمة المضافة والخصم والغرامات إلكترونياً.')}
                </li>
                <li>
                  <strong>{t('Traffic Violations', 'مخالفات المرور')}</strong>
                  {' — '}
                  {t('Look up and pay fines by plate number and violation reference.', 'الاستعلام وسداد الغرامات برقم اللوحة ومرجع المخالفة.')}
                </li>
                <li>
                  <strong>{t('Health & Social Insurance', 'التأمين الصحي والاجتماعي')}</strong>
                  {' — '}
                  {t('Enroll in UHIA coverage or submit social insurance contributions.', 'التسجيل في التأمين الصحي الشامل أو تقديم اشتراكات التأمينات.')}
                </li>
                <li>
                  <strong>{t('Live tracking', 'تتبع مباشر')}</strong>
                  {' — '}
                  {t('Every application gets an 11-digit code with a full status timeline.', 'كل معاملة تحصل على كود تتبع مكون من 11 رقماً مع سجل الحالات.')}
                </li>
              </ul>

              <div className="updates-card-footer" style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                <div className="updates-stats">
                  <div className="updates-stat">
                    <span className="updates-stat-value">8</span>
                    <span className="updates-stat-label">{t('Services', 'خدمات')}</span>
                  </div>
                  <div className="updates-stat">
                    <span className="updates-stat-value">24/7</span>
                    <span className="updates-stat-label">{t('Access', 'وصول')}</span>
                  </div>
                  <div className="updates-stat">
                    <span className="updates-stat-value">EN / AR</span>
                    <span className="updates-stat-label">{t('Languages', 'لغات')}</span>
                  </div>
                </div>
                <a
                  href="https://digital.gov.eg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  {t('Visit Digital Egypt', 'زيارة مصر الرقمية')}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: CITIZEN DASHBOARD */}
        {currentView === 'dashboard' && user && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
              <h2>{t('Citizen Workspace Portal', 'بوابة معاملات المواطن')}</h2>
              <button className="btn btn-primary" onClick={() => handleApplyClick('NATIONAL_ID')}>
                <Plus size={16} /> {t('Apply for Document', 'تقديم طلب مستند جديد')}
              </button>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="quick-actions" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
              <button className="quick-action-btn" onClick={() => handleApplyClick('NATIONAL_ID')}>
                <FileText size={20} />
                <span>{t('New Application', 'طلب جديد')}</span>
              </button>
              <button className="quick-action-btn" onClick={() => { setCurrentView('appointments'); setAppointmentSuccess(false); fetchMyAppointments(); }}>
                <Calendar size={20} />
                <span>{t('Book Appointment', 'حجز موعد')}</span>
              </button>
              <button className="quick-action-btn" onClick={() => { setCurrentView('track'); setSearchTrackingCode(''); setTrackedApplication(null); }}>
                <Search size={20} />
                <span>{t('Track Application', 'تتبع معاملة')}</span>
              </button>
              <button className="quick-action-btn" onClick={() => { setCurrentView('complaints'); setComplaintSuccess(false); fetchCitizenComplaints(); }}>
                <MessageSquare size={20} />
                <span>{t('Submit Feedback', 'شكوى أو اقتراح')}</span>
              </button>
              <button className="quick-action-btn" onClick={() => setCurrentView('profile')}>
                <User size={20} />
                <span>{t('My Profile', 'بياناتي')}</span>
              </button>
            </div>

            {/* Quick Stats Summary */}
            <div className="dashboard-stats" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', direction: isRtl ? 'rtl' : 'ltr' }}>
              <div className="glass-card" style={{ flex: 1, minWidth: '140px', padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-red)' }}>{citizenApps.length}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('Applications', 'الطلبات')}</div>
              </div>
              <div className="glass-card" style={{ flex: 1, minWidth: '140px', padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-red)' }}>{citizenApps.filter(a => a.status === 'APPROVED').length}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('Approved', 'معتمد')}</div>
              </div>
              <div className="glass-card" style={{ flex: 1, minWidth: '140px', padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-red)' }}>{citizenApps.filter(a => a.status === 'PENDING').length}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('Pending', 'قيد الانتظار')}</div>
              </div>
              <div className="glass-card" style={{ flex: 1, minWidth: '140px', padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-red)' }}>{citizenComplaints.length}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('Feedback', 'التقييمات')}</div>
              </div>
            </div>

            <div className="dashboard-grid" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
              
              {/* Left Profile Panel */}
              <div className="glass-card profile-card" style={{ textAlign: 'center' }}>
                <div className="avatar-large">{user.name.charAt(0).toUpperCase()}</div>
                <h3 className="profile-name">{user.name}</h3>
                <p className="profile-email">{user.email}</p>

                <div className="profile-details">
                  <div className="profile-detail-item" style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                    <span className="profile-detail-label">{t('National ID', 'الرقم القومي')}</span>
                    <span className="profile-detail-val">{user.nationalId}</span>
                  </div>
                  <div className="profile-detail-item" style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                    <span className="profile-detail-label">{t('Phone', 'رقم الهاتف')}</span>
                    <span className="profile-detail-val">{user.phone}</span>
                  </div>
                  <div className="profile-detail-item" style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                    <span className="profile-detail-label">{t('User Status', 'حالة الحساب')}</span>
                    <span className="profile-detail-val" style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>
                      {t('VERIFIED / نشط', 'نشط معتمد')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Workspace Panel */}
              <div className="glass-card" style={{ minHeight: '400px', textAlign: isRtl ? 'right' : 'left' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>{t('Your Applications History', 'سجل طلباتي ومعاملاتي')}</h3>

                {citizenAppsLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 className="spinner" /></div>
                ) : citizenApps.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '4rem 1rem' }}>
                    <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                      {t('No documents requested yet.', 'لم تقم بتقديم طلبات استخراج وثائق بعد.')}
                    </p>
                    <button className="btn btn-outline" onClick={() => handleApplyClick('NATIONAL_ID')}>
                      {t('Initiate Document Request', 'استخراج أول مستند')}
                    </button>
                  </div>
                ) : (
                  <div className="admin-table-container">
                    <table className="admin-table" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                      <thead>
                        <tr style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                          <th style={{ textAlign: isRtl ? 'right' : 'left' }}>{t('Code', 'الكود')}</th>
                          <th style={{ textAlign: isRtl ? 'right' : 'left' }}>{t('Requested Service', 'الخدمة المطلوبة')}</th>
                          <th style={{ textAlign: isRtl ? 'right' : 'left' }}>{t('Date', 'التاريخ')}</th>
                          <th style={{ textAlign: isRtl ? 'right' : 'left' }}>{t('Status', 'الحالة')}</th>
                          <th style={{ textAlign: isRtl ? 'right' : 'left' }}>{t('Actions', 'الإجراءات')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {citizenApps.map((app) => (
                          <tr key={app.id}>
                            <td style={{ fontWeight: '700', color: 'var(--accent-red)' }}>{app.trackingCode}</td>
                            <td>{getServiceLabel(app.serviceType)}</td>
                            <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                            <td>
                              <span className={`status-badge status-${app.status}`}>{app.status}</span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.35rem', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                                <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => setActiveApplicationDetails(app)}>
                                  {t('Timeline', 'تتبع المعاملة')}
                                </button>
                                {app.status === 'PENDING' && (
                                  <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', color: 'var(--accent-red)' }} onClick={async () => { if (confirm(t('Cancel this application?', 'إلغاء هذا الطلب؟'))) { try { await api.cancelApplication(app.id); fetchCitizenData(); } catch { alert(t('Failed to cancel.', 'فشل الإلغاء.')); } } }}>
                                    <X size={12} /> {t('Cancel', 'إلغاء')}
                                  </button>
                                )}
                                {app.status === 'COMPLETED' && (
                                  <button className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => { setRatingModalApp(app); setRatingForm({ score: 5, review: '' }); setRatingSubmitted(false); }}>
                                    <Star size={12} /> {t('Rate', 'تقييم')}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* VIEW: TRACKING TIMELINE */}
        {currentView === 'track' && trackedApplication && (
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: isRtl ? 'right' : 'left' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
              <button className="btn btn-secondary" onClick={() => { setCurrentView('home'); setTrackedApplication(null); }}>
                {isRtl ? '← العودة للرئيسية' : '← Return Home'}
              </button>
              <button className="btn btn-outline" onClick={() => window.print()}>
                <Printer size={14} /> {t('Print', 'طباعة')}
              </button>
            </div>
            <div className="glass-card">
              <div className="tracking-header" style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', color: 'var(--accent-red)', marginBottom: '0.25rem' }}>{trackedApplication.trackingCode}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {t('Service Type:', 'نوع الخدمة:')} {getServiceLabel(trackedApplication.serviceType || '')}
                  </p>
                </div>
                <span className={`status-badge status-${trackedApplication.status}`} style={{ fontSize: '0.85rem' }}>
                  {trackedApplication.status}
                </span>
              </div>

              <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                {t('Application Audit Log', 'سجل مراجعة الطلب والمراحل التاريخية')}
              </h4>
              
              <div className="timeline" style={{ paddingLeft: isRtl ? '0' : '1.75rem', paddingRight: isRtl ? '1.75rem' : '0' }}>
                {/* Timeline vertical bar flip for RTL */}
                <style>{`
                  .arabic-layout .timeline::before { left: auto; right: 4px; }
                  .arabic-layout .timeline-dot { left: auto; right: -2.05rem; }
                `}</style>
                {trackedApplication.statusHistory?.map((history, idx: number) => {
                  const isActive = idx === (trackedApplication.statusHistory?.length || 0) - 1;
                  return (
                    <div key={history.id} className={`timeline-item ${isActive ? 'active' : ''}`}>
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="timeline-time">{new Date(history.createdAt).toLocaleString()}</div>
                        <div className="timeline-title">{t('Processing State:', 'الحالة:')} {history.status}</div>
                        <div className="timeline-desc" style={{ marginTop: '0.25rem', fontWeight: '500' }}>{history.notes}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          {t('Signed By:', 'تم بواسطة:')} {history.changedBy}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        )}

        {/* VIEW: PROFILE */}
        {currentView === 'profile' && user && (
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: isRtl ? 'right' : 'left' }}>
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                <h3 style={{ color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={20} /> {t('My Profile', 'الملف الشخصي')}
                </h3>
                <button className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => window.print()}>
                  <Printer size={14} /> {t('Print', 'طباعة')}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem', padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--border-radius-md)' }}>
                <div><strong>{t('Email:', 'البريد الإلكتروني:')}</strong> <span style={{ color: 'var(--text-secondary)' }}>{user.email}</span></div>
                <div><strong>{t('National ID:', 'الرقم القومي:')}</strong> <span style={{ color: 'var(--text-secondary)' }}>{user.nationalId}</span></div>
                <div><strong>{t('Role:', 'الدور:')}</strong> <span className={`status-badge status-${user.role === 'ADMIN' ? 'APPROVED' : 'PENDING'}`}>{user.role}</span></div>
              </div>

              {/* Edit Profile Form */}
              <form onSubmit={handleProfileUpdate}>
                <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Save size={16} /> {t('Edit Profile', 'تعديل الملف الشخصي')}</h4>
                <div className="form-group">
                  <label>{t('Full Name', 'الاسم الكامل')}</label>
                  <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>{t('Phone Number', 'رقم الهاتف')}</label>
                  <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} required />
                </div>
                {profileSuccess && <div className="success-banner" style={{ marginBottom: '0.75rem' }}><CheckCircle size={16} /> {profileSuccess}</div>}
                {profileError && <div className="error-banner" style={{ marginBottom: '0.75rem' }}><AlertCircle size={16} /> {profileError}</div>}
                <button type="submit" className="btn btn-primary" disabled={profileSaving}>
                  {profileSaving ? <Loader2 className="spinner" size={16} /> : (t('Save Changes', 'حفظ التغييرات'))}
                </button>
              </form>

              {/* Notification Preferences */}
              <div style={{ margin: '2rem 0', padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--border-radius-md)' }}>
                <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Bell size={16} /> {t('Notification Preferences', 'تفضيلات الإشعارات')}</h4>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                  <input type="checkbox" checked={notificationsEnabled} onChange={(e) => setNotificationsEnabled(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--accent-red)' }} />
                  <span>{t('Enable email & SMS notifications for application updates', 'تفعيل الإشعارات عبر البريد الإلكتروني والرسائل النصية لتحديثات الطلبات')}</span>
                </label>
              </div>

              <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />

              {/* Change Password Form */}
              <form onSubmit={handlePasswordChange}>
                <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Key size={16} /> {t('Change Password', 'تغيير كلمة المرور')}</h4>
                <div className="form-group">
                  <label>{t('Current Password', 'كلمة المرور الحالية')}</label>
                  <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>{t('New Password', 'كلمة المرور الجديدة')}</label>
                  <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required placeholder={t('Min 8 chars, uppercase + number', '8 أحرف على الأقل، حرف كبير + رقم')} />
                </div>
                <div className="form-group">
                  <label>{t('Confirm New Password', 'تأكيد كلمة المرور الجديدة')}</label>
                  <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required />
                </div>
                {passwordSuccess && <div className="success-banner" style={{ marginBottom: '0.75rem' }}><CheckCircle size={16} /> {passwordSuccess}</div>}
                {passwordError && <div className="error-banner" style={{ marginBottom: '0.75rem' }}><AlertCircle size={16} /> {passwordError}</div>}
                <button type="submit" className="btn btn-primary">
                  {t('Change Password', 'تغيير كلمة المرور')}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* VIEW: APPLY FORM WIZARD */}
        {currentView === 'apply' && user && (
          <div style={{ maxWidth: '750px', margin: '0 auto', textAlign: isRtl ? 'right' : 'left' }}>
            
            <div style={{ display: 'flex', justifySelf: 'start', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => { goToDashboard(); setFormSuccess(null); }}>
                {t('← Dashboard Workspace', '← العودة لوحة التحكم')}
              </button>
            </div>

            <div className="glass-card">
              <h2 style={{ marginBottom: '0.5rem', color: 'var(--accent-red)' }}>
                {getServiceLabel(selectedService)}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                {t('Enter official citizen details. Government validation requires accurate data.', 'يرجى إدخال البيانات الرسمية بدقة متناهية لتسهيل المراجعة الأمنية والمدنية.')}
              </p>

              {formSuccess && (
                <div className="success-banner" style={{ flexDirection: 'column', alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', fontWeight: 'bold' }}>
                    <CheckCircle size={18} /> {t('Document Request Submitted Successfully', 'تم إرسال طلب استخراج الوثيقة بنجاح')}
                  </div>
                  <p style={{ fontSize: '0.9rem', margin: '0.5rem 0' }}>
                    {t('Your request is registered. Use this tracking code to look up progress on home page:',
                       'تم تسجيل المعاملة. يرجى كتابة وحفظ كود تتبع الطلب لمتابعة تقدم المراجعة:')}
                  </p>
                  <span style={{ fontSize: '1.5rem', fontWeight: '800', background: 'var(--bg-input)', padding: '0.4rem 1rem', borderRadius: '4px', letterSpacing: '2px', color: 'var(--accent-red)', display: 'block', margin: '0.5rem 0' }}>
                    {formSuccess.code}
                  </span>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1rem', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                    <button className="btn btn-primary" onClick={() => { goToDashboard(); setFormSuccess(null); }}>
                      {t('Go to Workspace', 'الذهاب لوحة المعاملات')}
                    </button>
                    <button className="btn btn-secondary" onClick={() => window.print()}>
                      <Printer size={16} /> {t('Print Receipt', 'طباعة الإيصال')}
                    </button>
                  </div>
                </div>
              )}

              {formError && <div className="error-banner"><AlertCircle size={18} /> {formError}</div>}

              {!formSuccess && (
                <form onSubmit={handleApplicationSubmit}>
                  
                  {/* SERVICE FORM: NATIONAL ID */}
                  {selectedService === 'NATIONAL_ID' && (
                    <div>
                      <div className="form-group">
                        <label className="arabic-text">الاسم الكامل باللغة العربية (كما في شهادة الميلاد)</label>
                        <input
                          className="arabic-text"
                          type="text"
                          required
                          placeholder="زياد أحمد علي محمد"
                          value={nationalIdForm.fullNameAr}
                          onChange={(e) => setNationalIdForm({ ...nationalIdForm, fullNameAr: e.target.value })}
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>{t('Birth Date', 'تاريخ الميلاد')}</label>
                          <input
                            type="date"
                            required
                            value={nationalIdForm.birthDate}
                            onChange={(e) => setNationalIdForm({ ...nationalIdForm, birthDate: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>{t('Marital Status', 'الحالة الاجتماعية')}</label>
                          <select
                            value={nationalIdForm.maritalStatus}
                            onChange={(e) => setNationalIdForm({ ...nationalIdForm, maritalStatus: e.target.value })}
                          >
                            <option value="single">{t('Single', 'أعزب / عزباء')}</option>
                            <option value="married">{t('Married', 'متزوج / متزوجة')}</option>
                            <option value="divorced">{t('Divorced', 'مطلق / مطلقة')}</option>
                            <option value="widowed">{t('Widowed', 'أرمل / أرملة')}</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>{t('Profession / Occupation', 'المهنة / الوظيفة الحالية')}</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Student, Engineer"
                            value={nationalIdForm.profession}
                            onChange={(e) => setNationalIdForm({ ...nationalIdForm, profession: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>{t('Reason for Renewal', 'سبب طلب البطاقة')}</label>
                          <select
                            value={nationalIdForm.reason}
                            onChange={(e) => setNationalIdForm({ ...nationalIdForm, reason: e.target.value })}
                          >
                            <option value="renewal">{t('Scheduled Renewal', 'تجديد دوري')}</option>
                            <option value="first_time">{t('First Time Issue (Age 15)', 'استخراج أول مرة')}</option>
                            <option value="lost_replacement">{t('Lost Card Replacement', 'بدل فاقد')}</option>
                            <option value="damaged_replacement">{t('Damaged Card Replacement', 'بدل تالف')}</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="arabic-text">اسم الأم بالكامل باللغة العربية</label>
                        <input
                          className="arabic-text"
                          type="text"
                          required
                          placeholder="فاطمة مصطفى عبد الرحمن"
                          value={nationalIdForm.motherName}
                          onChange={(e) => setNationalIdForm({ ...nationalIdForm, motherName: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>{t('Detailed Address (matching civil records)', 'العنوان السكني بالتفصيل (مطابق للمستندات)')}</label>
                        <textarea
                          required
                          rows={2}
                          placeholder="Building No, Street, City, Governorate"
                          value={nationalIdForm.address}
                          onChange={(e) => setNationalIdForm({ ...nationalIdForm, address: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* SERVICE FORM: MILITARY PAPERS (EXEMPTION, TRAVEL PERMIT, DELAY ETC.) */}
                  {selectedService === 'MILITARY_EXEMPTION' && (
                    <div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="arabic-text">الاسم الكامل باللغة العربية (رباعي كما هو بشهادة الميلاد)</label>
                          <input
                            className="arabic-text"
                            type="text"
                            required
                            placeholder="زياد أحمد علي محمد"
                            value={militaryForm.fullNameAr}
                            onChange={(e) => setMilitaryForm({ ...militaryForm, fullNameAr: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label>{t('Military Document Requested', 'الوثيقة التجنيدية المطلوبة')}</label>
                          <select
                            value={militaryForm.docType}
                            onChange={(e) => setMilitaryForm({ ...militaryForm, docType: e.target.value })}
                          >
                            <option value="exemption">{t('Military Exemption Certificate', 'شهادة الإعفاء من الخدمة العسكرية')}</option>
                            <option value="travel_permit">{t('Armed Forces Travel Permit', 'تصريح سفر عسكري للخارج')}</option>
                            <option value="postponement">{t('Recruitment Delay / Postponement Certificate', 'شهادة تأجيل الخدمة للدراسة')}</option>
                            <option value="service_certificate">{t('Military Completion/End of Service Certificate', 'شهادة أداء الخدمة العسكرية')}</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>{t('Exemption / Application Reason', 'سبب طلب الشهادة أو الإعفاء')}</label>
                        <select
                          value={militaryForm.reason}
                          onChange={(e) => setMilitaryForm({ ...militaryForm, reason: e.target.value })}
                        >
                          <option value="sole_breadwinner">{t('Sole Breadwinner (Father deceased/over 60)', 'العائل الوحيد للعائلة')}</option>
                          <option value="medical">{t('Medical Unfitness (Medical board review)', 'غير لائق طبياً')}</option>
                          <option value="temporary_student">{t('Active University Postponement', 'تأجيل دراسي مستمر للطلبة')}</option>
                          <option value="final_exemption">{t('Exceeding Legal Age limit (only son)', 'الابن الوحيد المتجاوز للسن القانوني')}</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>{t('Family Status & Justification details', 'شرح الوضع العائلي ومبررات الطلب بالتفصيل')}</label>
                        <textarea
                          required
                          rows={3}
                          placeholder={t('Explain siblings age, father age, dependents details for recruitment committee review...',
                                         'اكتب تفاصيل الإخوة، سن الأب، الوضع الدراسي، لإرسالها لمكتب السجلات العسكرية للتأكد...')}
                          value={militaryForm.familyStatus}
                          onChange={(e) => setMilitaryForm({ ...militaryForm, familyStatus: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* SERVICE FORM: CIVIL REGISTRY */}
                  {selectedService === 'BIRTH_CERTIFICATE' && (
                    <div>
                      <div className="form-group">
                        <label className="arabic-text">الاسم الكامل للمولود باللغة العربية</label>
                        <input
                          className="arabic-text"
                          type="text"
                          required
                          placeholder="نور حسن فهمي عبدالسلام"
                          value={birthCertForm.fullNameAr}
                          onChange={(e) => setBirthCertForm({ ...birthCertForm, fullNameAr: e.target.value })}
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>{t('Birth Date', 'تاريخ الميلاد')}</label>
                          <input
                            type="date"
                            required
                            value={birthCertForm.birthDate}
                            onChange={(e) => setBirthCertForm({ ...birthCertForm, birthDate: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>{t('Gender', 'الجنس')}</label>
                          <select
                            value={birthCertForm.gender}
                            onChange={(e) => setBirthCertForm({ ...birthCertForm, gender: e.target.value as 'male' | 'female' })}
                          >
                            <option value="male">{t('Male', 'ذكر')}</option>
                            <option value="female">{t('Female', 'أنثى')}</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="arabic-text">اسم الأب بالكامل باللغة العربية</label>
                          <input
                            className="arabic-text"
                            type="text"
                            required
                            placeholder="حسن فهمي عبد السلام حسن"
                            value={birthCertForm.fatherNameAr}
                            onChange={(e) => setBirthCertForm({ ...birthCertForm, fatherNameAr: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label className="arabic-text">اسم الأم بالكامل باللغة العربية</label>
                          <input
                            className="arabic-text"
                            type="text"
                            required
                            placeholder="سحر محمود علي الشافعي"
                            value={birthCertForm.motherNameAr}
                            onChange={(e) => setBirthCertForm({ ...birthCertForm, motherNameAr: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>{t('Place of Birth (City & Governorate)', 'مكان الولادة بالتفصيل (المركز والمحافظة)')}</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Cairo, Heliopolis"
                          value={birthCertForm.placeOfBirth}
                          onChange={(e) => setBirthCertForm({ ...birthCertForm, placeOfBirth: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* SERVICE FORM: PASSPORT */}
                  {selectedService === 'PASSPORT' && (
                    <div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>{t('Full Name in English (as in old passport)', 'الاسم الكامل بالإنجليزية')}</label>
                          <input
                            type="text"
                            required
                            placeholder="NOUR HASSAN FAHMY"
                            value={passportForm.fullNameEn}
                            onChange={(e) => setPassportForm({ ...passportForm, fullNameEn: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label className="arabic-text">الاسم الكامل باللغة العربية</label>
                          <input
                            className="arabic-text"
                            type="text"
                            required
                            placeholder="نور حسن فهمي"
                            value={passportForm.fullNameAr}
                            onChange={(e) => setPassportForm({ ...passportForm, fullNameAr: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>{t('Profession / Current Job', 'المهنة / الوظيفة المثبتة')}</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Accountant, Software Engineer"
                            value={passportForm.profession}
                            onChange={(e) => setPassportForm({ ...passportForm, profession: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>{t('Marital Status', 'الحالة الاجتماعية')}</label>
                          <select
                            value={passportForm.maritalStatus}
                            onChange={(e) => setPassportForm({ ...passportForm, maritalStatus: e.target.value })}
                          >
                            <option value="single">{t('Single', 'أعزب / عزباء')}</option>
                            <option value="married">{t('Married', 'متزوج / متزوجة')}</option>
                            <option value="divorced">{t('Divorced', 'مطلق / مطلقة')}</option>
                            <option value="widowed">{t('Widowed', 'أرمل / أرملة')}</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>{t('Educational Qualification / Certificate', 'المؤهل الدراسي الحاصل عليه')}</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Bachelor of Computer Science"
                          value={passportForm.qualification}
                          onChange={(e) => setPassportForm({ ...passportForm, qualification: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* SERVICE FORM: TAX PAYMENT */}
                  {selectedService === 'TAX_PAYMENT' && (
                    <div>
                      <div className="form-group">
                        <label className="arabic-text">الاسم الكامل باللغة العربية</label>
                        <input
                          className="arabic-text"
                          type="text"
                          required
                          value={taxForm.fullNameAr}
                          onChange={(e) => setTaxForm({ ...taxForm, fullNameAr: e.target.value })}
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>{t('Tax Registration Number', 'رقم التسجيل الضريبي')}</label>
                          <input
                            type="text"
                            required
                            value={taxForm.taxRegistrationNumber}
                            onChange={(e) => setTaxForm({ ...taxForm, taxRegistrationNumber: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>{t('Tax Period', 'الفترة الضريبية')}</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 2025-Q1"
                            value={taxForm.taxPeriod}
                            onChange={(e) => setTaxForm({ ...taxForm, taxPeriod: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>{t('Payment Type', 'نوع السداد')}</label>
                          <select
                            value={taxForm.paymentType}
                            onChange={(e) => setTaxForm({ ...taxForm, paymentType: e.target.value })}
                          >
                            <option value="income_tax">{t('Income Tax', 'ضريبة الدخل')}</option>
                            <option value="vat">{t('VAT', 'ضريبة القيمة المضافة')}</option>
                            <option value="withholding">{t('Withholding Tax', 'خصم وتحصيل')}</option>
                            <option value="stamp_duty">{t('Stamp Duty', 'دمغة')}</option>
                            <option value="penalty">{t('Penalty / Fine', 'غرامة')}</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>{t('Amount (EGP)', 'المبلغ (جنيه)')}</label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={taxForm.amount}
                            onChange={(e) => setTaxForm({ ...taxForm, amount: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>{t('Payment Method', 'طريقة الدفع')}</label>
                        <select
                          value={taxForm.paymentMethod}
                          onChange={(e) => setTaxForm({ ...taxForm, paymentMethod: e.target.value })}
                        >
                          <option value="card">{t('Bank Card', 'بطاقة بنكية')}</option>
                          <option value="bank_transfer">{t('Bank Transfer', 'تحويل بنكي')}</option>
                          <option value="fawry">{t('Fawry', 'فوري')}</option>
                          <option value="wallet">{t('Mobile Wallet', 'محفظة إلكترونية')}</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* SERVICE FORM: TRAFFIC FINE */}
                  {selectedService === 'TRAFFIC_FINE' && (
                    <div>
                      <div className="form-group">
                        <label className="arabic-text">الاسم الكامل باللغة العربية</label>
                        <input
                          className="arabic-text"
                          type="text"
                          required
                          value={trafficForm.fullNameAr}
                          onChange={(e) => setTrafficForm({ ...trafficForm, fullNameAr: e.target.value })}
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>{t('License Plate', 'رقم اللوحة')}</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. أ ب ج 1234"
                            value={trafficForm.licensePlate}
                            onChange={(e) => setTrafficForm({ ...trafficForm, licensePlate: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>{t('Violation Reference', 'رقم المخالفة')}</label>
                          <input
                            type="text"
                            required
                            value={trafficForm.violationReference}
                            onChange={(e) => setTrafficForm({ ...trafficForm, violationReference: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>{t('Governorate', 'المحافظة')}</label>
                          <input
                            type="text"
                            required
                            value={trafficForm.governorate}
                            onChange={(e) => setTrafficForm({ ...trafficForm, governorate: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>{t('Fine Amount (EGP)', 'قيمة الغرامة (جنيه)')}</label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={trafficForm.fineAmount}
                            onChange={(e) => setTrafficForm({ ...trafficForm, fineAmount: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SERVICE FORM: HEALTH INSURANCE */}
                  {selectedService === 'HEALTH_INSURANCE' && (
                    <div>
                      <div className="form-group">
                        <label className="arabic-text">الاسم الكامل باللغة العربية</label>
                        <input
                          className="arabic-text"
                          type="text"
                          required
                          value={healthForm.fullNameAr}
                          onChange={(e) => setHealthForm({ ...healthForm, fullNameAr: e.target.value })}
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>{t('Coverage Type', 'نوع التغطية')}</label>
                          <select
                            value={healthForm.coverageType}
                            onChange={(e) => setHealthForm({ ...healthForm, coverageType: e.target.value })}
                          >
                            <option value="individual">{t('Individual', 'فردي')}</option>
                            <option value="family">{t('Family', 'أسري')}</option>
                            <option value="student">{t('Student', 'طالب')}</option>
                            <option value="retiree">{t('Retiree', 'متقاعد')}</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>{t('Dependents Count', 'عدد المعالين')}</label>
                          <input
                            type="number"
                            min="0"
                            required
                            value={healthForm.dependentsCount}
                            onChange={(e) => setHealthForm({ ...healthForm, dependentsCount: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>{t('Employer / Sponsor (optional)', 'جهة العمل / الكفيل (اختياري)')}</label>
                        <input
                          type="text"
                          value={healthForm.employerName}
                          onChange={(e) => setHealthForm({ ...healthForm, employerName: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* SERVICE FORM: SOCIAL INSURANCE */}
                  {selectedService === 'SOCIAL_INSURANCE' && (
                    <div>
                      <div className="form-group">
                        <label className="arabic-text">الاسم الكامل باللغة العربية</label>
                        <input
                          className="arabic-text"
                          type="text"
                          required
                          value={socialForm.fullNameAr}
                          onChange={(e) => setSocialForm({ ...socialForm, fullNameAr: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>{t('Employer Name', 'اسم جهة العمل')}</label>
                        <input
                          type="text"
                          required
                          value={socialForm.employerName}
                          onChange={(e) => setSocialForm({ ...socialForm, employerName: e.target.value })}
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>{t('Contribution Type', 'نوع الاشتراك')}</label>
                          <select
                            value={socialForm.contributionType}
                            onChange={(e) => setSocialForm({ ...socialForm, contributionType: e.target.value })}
                          >
                            <option value="employee">{t('Employee', 'عامل')}</option>
                            <option value="voluntary">{t('Voluntary', 'تطوعي')}</option>
                            <option value="pension">{t('Pension', 'معاش')}</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>{t('Monthly Income Bracket', 'شريحة الدخل الشهري')}</label>
                          <select
                            value={socialForm.monthlyIncomeBracket}
                            onChange={(e) => setSocialForm({ ...socialForm, monthlyIncomeBracket: e.target.value })}
                          >
                            <option value="under_5k">{t('Under 5,000 EGP', 'أقل من 5,000')}</option>
                            <option value="5k_15k">{t('5,000 – 15,000 EGP', '5,000 – 15,000')}</option>
                            <option value="15k_30k">{t('15,000 – 30,000 EGP', '15,000 – 30,000')}</option>
                            <option value="over_30k">{t('Over 30,000 EGP', 'أكثر من 30,000')}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* File Upload */}
                  <div className="form-group" style={{ marginTop: '1.5rem' }}>
                    <label>{t('Supporting Documents (PDF/JPG/PNG)', 'المستندات المؤيدة (PDF/JPG/PNG)')}</label>
                    <div style={{ border: '2px dashed var(--border-color)', padding: '1.5rem', borderRadius: 'var(--border-radius-md)', textAlign: 'center', background: 'var(--bg-input)' }}>
                      {uploadedFile ? (
                        <div>
                          <FileUp size={24} style={{ color: 'var(--accent-green)', marginBottom: '0.5rem' }} />
                          <p style={{ fontSize: '0.85rem', color: 'var(--accent-green)', fontWeight: 600 }}>{uploadedFile.name}</p>
                          <button type="button" className="btn btn-secondary" style={{ marginTop: '0.5rem', fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={() => setUploadedFile(null)}>
                            {t('Remove', 'إزالة')}
                          </button>
                        </div>
                      ) : (
                        <label style={{ cursor: 'pointer', display: 'block' }}>
                          <FileUp size={24} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {t('Click to upload (max 5MB)', 'اضغط لرفع ملف (حد أقصى 5 ميجابايت)')}
                          </p>
                          <input type="file" accept=".jpg,.jpeg,.png,.gif,.pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
                        </label>
                      )}
                      {uploading && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}><Loader2 className="spinner" size={12} /> {t('Uploading...', 'جاري الرفع...')}</p>}
                    </div>
                  </div>

                  {/* Form Wizard Navigation */}
                  <div className="form-actions" style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                    <button type="button" className="btn btn-secondary" onClick={goToDashboard}>
                      {t('Cancel', 'إلغاء')}
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="spinner" size={16} /> : t('Submit Form', 'تقديم الطلب للتدقيق')}
                    </button>
                  </div>

                </form>
              )}

            </div>
          </div>
        )}

        {/* VIEW: CITIZEN COMPLAINTS & FEEDBACK */}
        {currentView === 'complaints' && user && (
          <div style={{ maxWidth: '750px', margin: '0 auto', textAlign: isRtl ? 'right' : 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
              <h2>{t('Feedback & Complaints', 'الشكاوى والاقتراحات')}</h2>
              <button className="btn btn-secondary" onClick={() => { goToDashboard(); }}>
                {t('← Dashboard', '← لوحة التحكم')}
              </button>
            </div>

            <div className="glass-card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--accent-red)' }}>{t('Submit New Feedback', 'تقديم شكوى أو اقتراح')}</h3>
              
              {complaintSuccess && (
                <div className="success-banner">
                  <CheckCircle size={18} /> {t('Your feedback has been submitted successfully. We will review it shortly.', 'تم تقديم ملاحظاتك بنجاح. سنقوم بمراجعتها قريباً.')}
                </div>
              )}
              {complaintError && <div className="error-banner"><AlertCircle size={18} /> {complaintError}</div>}

              <form onSubmit={handleComplaintSubmit}>
                <div className="form-group">
                  <label>{t('Category', 'التصنيف')}</label>
                  <select
                    value={complaintForm.category}
                    onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                  >
                    <option value="SERVICE_QUALITY">{t('Service Quality', 'جودة الخدمة')}</option>
                    <option value="TECHNICAL_ISSUE">{t('Technical Issue', 'مشكلة تقنية')}</option>
                    <option value="SUGGESTION">{t('Suggestion', 'اقتراح')}</option>
                    <option value="STAFF_CONDUCT">{t('Staff Conduct', 'سلوك الموظفين')}</option>
                    <option value="DELAY_COMPLAINT">{t('Delay Complaint', 'شكوى تأخير')}</option>
                    <option value="OTHER">{t('Other', 'أخرى')}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('Subject', 'الموضوع')}</label>
                  <input
                    type="text"
                    required
                    value={complaintForm.subject}
                    onChange={(e) => setComplaintForm({ ...complaintForm, subject: e.target.value })}
                    placeholder={t('Brief subject of your feedback', 'موضوع مختصر لملاحظاتك')}
                  />
                </div>
                <div className="form-group">
                  <label>{t('Message', 'الرسالة')}</label>
                  <textarea
                    rows={4}
                    required
                    value={complaintForm.message}
                    onChange={(e) => setComplaintForm({ ...complaintForm, message: e.target.value })}
                    placeholder={t('Describe your issue or suggestion in detail...', ' صف مشكلتك أو اقتراحك بالتفصيل...')}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  {t('Submit Feedback', 'إرسال الملاحظات')}
                </button>
              </form>
            </div>

            {/* Previous Complaints List */}
            <div className="glass-card">
              <h3 style={{ marginBottom: '1rem', color: 'var(--accent-red)' }}>{t('Your Previous Feedback', 'ملاحظاتك السابقة')}</h3>
              {citizenComplaints.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                  {t('No previous feedback submitted.', 'لا توجد ملاحظات سابقة.')}
                </p>
              ) : (
                <div>
                  {citizenComplaints.map(c => (
                    <div key={c.id} style={{ borderBottom: '1px solid var(--border-color)', padding: '1rem 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                        <strong>{c.subject}</strong>
                        <span className={`status-badge status-${c.status === 'RESOLVED' || c.status === 'CLOSED' ? 'COMPLETED' : c.status === 'UNDER_REVIEW' ? 'UNDER_REVIEW' : 'PENDING'}`}>
                          {c.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{c.message}</p>
                      {c.response && (
                        <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--border-radius-md)', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                          <strong>{t('Response:', 'الرد:')}</strong> {c.response}
                          {c.respondedBy && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{t('Responded by:', 'تم الرد بواسطة:')} {c.respondedBy}</div>}
                        </div>
                      )}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: TIMELINE */}
        {currentView === 'timeline' && user && (
          <div>
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <History size={22} /> {t('My Activity Timeline', 'النشاطات الحديثة')}
              </h2>

              {timelineLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}><Loader2 className="spinner" size={24} /></div>
              ) : timelineEvents.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  {t('No activity yet. Start by applying for a service!', 'لا توجد نشاطات بعد. ابدأ بتقديم طلب خدمة!')}
                </div>
              ) : (
                <div className="timeline-container">
                  {timelineEvents.map((event) => (
                    <div key={event.id} className={`timeline-item timeline-${event.type}`}>
                      <div className="timeline-dot">
                        {event.type === 'application' && <FileText size={14} />}
                        {event.type === 'status_change' && <Clock size={14} />}
                        {event.type === 'appointment' && <Calendar size={14} />}
                        {event.type === 'complaint' && <MessageSquare size={14} />}
                        {event.type === 'rating' && <Star size={14} />}
                      </div>
                      <div className="timeline-content glass-card" style={{ textAlign: isRtl ? 'right' : 'left', direction: isRtl ? 'rtl' : 'ltr' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                          <strong style={{ fontSize: '0.9rem' }}>{event.title}</strong>
                          <span className={`status-badge status-${event.status === 'COMPLETED' || event.status === 'APPROVED' || event.status === 'RESOLVED' || event.status === 'CLOSED' || event.status === 'CONFIRMED' ? 'COMPLETED' : event.status === 'PENDING' || event.status === 'SCHEDULED' ? 'PENDING' : 'UNDER_REVIEW'}`} style={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
                            {event.status}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.25rem 0' }}>{event.description}</p>
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: SERVICE DIRECTORY */}
        {currentView === 'service_directory' && (
          <div>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <MapPin size={22} /> {t('Government Service Directory', 'دليل الخدمات الحكومية')}
              </h2>

              {([
                { name: t('National ID & Civil Registry', 'الأحوال المدنية وبطاقات الرقم القومي'), phone: '15999', hours: t('Sun-Thu 8:00 AM - 3:00 PM', 'الأحد-الخميس 8 ص - 3 م'), address: t('Abdel Aziz Riad St., Mohandessin, Giza', 'شارع عبد العزيز رياض، المهندسين، الجيزة'), desc: t('Issuance and renewal of national ID cards, birth and death certificates.', 'إصدار وتجديد بطاقات الرقم القومي، وثائق الميلاد والوفاة.') },
                { name: t('Passport Office', 'مكتب الجوازات'), phone: '15999', hours: t('Sun-Thu 8:00 AM - 6:00 PM', 'الأحد-الخميس 8 ص - 6 م'), address: t('Nasr Rd., Nasr City, Cairo', 'شارع نصر، مدينة نصر، القاهرة'), desc: t('Passport applications, renewals, and emergency travel documents.', 'إصدار وتجديد جوازات السفر ووثائق السفر الطارئة.') },
                { name: t('Traffic Department', 'إدارة المرور'), phone: '136', hours: t('Sun-Thu 7:30 AM - 2:30 PM', 'الأحد-الخميس 7:30 ص - 2:30 م'), address: t('Tharwat St., Mohandessin, Giza', 'شارع ثروت، المهندسين، الجيزة'), desc: t('Vehicle registration, traffic fine payments, and driving licenses.', 'تسجيل المركبات، سداد مخالفات المرور، ورخص القيادة.') },
                { name: t('Tax Authority', 'مصلحة الضرائب'), phone: '16395', hours: t('Sun-Thu 8:00 AM - 3:00 PM', 'الأحد-الخميس 8 ص - 3 م'), address: t('Al-Maleya St., Nasr City, Cairo', 'شارع المالية، مدينة نصر، القاهرة'), desc: t('Income tax, VAT, stamp duty, and tax certificate services.', 'ضريبة الدخل، القيمة المضافة، الدمغة، وشهادات الضرائب.') },
                { name: t('Health Insurance Authority', 'هيئة التأمين الصحي'), phone: '16775', hours: t('Sun-Thu 8:00 AM - 2:00 PM', 'الأحد-الخميس 8 ص - 2 م'), address: t('Al-Shaheed Abdel Aziz St., Giza', 'شارع الشهيد عبد العزيز، الجيزة'), desc: t('Health insurance registration, eligibility checks, and dependent management.', 'التسجيل في التأمين الصحي، التحقق من الأهلية، وإدارة المعالين.') },
                { name: t('Social Insurance Authority', 'هيئة التأمينات الاجتماعية'), phone: '16777', hours: t('Sun-Thu 8:00 AM - 2:00 PM', 'الأحد-الخميس 8 ص - 2 م'), address: t('Al-Sabtiya St., Cairo', 'شارع السبتية، القاهرة'), desc: t('Social insurance subscriptions, pension requests, and contribution management.', 'اشتراكات التأمينات الاجتماعية، طلبات المعاش، وإدارة المساهمات.') },
                { name: t('Military Recruitment Office', 'مكتب التجنيد والتعبئة'), phone: '146', hours: t('Sun-Thu 8:00 AM - 2:00 PM', 'الأحد-الخميس 8 ص - 2 م'), address: t('Al-Abassiya, Cairo', 'العباسية، القاهرة'), desc: t('Military exemption, postponement, travel permits, and service certificates.', 'الإعفاء العسكري، التأجيل، تصاريح السفر، وشهادات الخدمة.') },
                { name: t('Citizen Service Center', 'مركز خدمة المواطن'), phone: '15377', hours: t('Sun-Thu 8:00 AM - 8:00 PM', 'الأحد-الخميس 8 ص - 8 م'), address: t('Multiple locations across all governorates', 'فروع متعددة بجميع المحافظات'), desc: t('One-stop center for government document services and citizen inquiries.', 'مركز متكامل لخدمات المستندات الحكومية واستفسارات المواطنين.') },
              ] as const).map((dept, i) => (
                <div key={i} className="glass-card" style={{ padding: '1.25rem', marginBottom: '1rem', textAlign: isRtl ? 'right' : 'left', direction: isRtl ? 'rtl' : 'ltr' }}>
                  <h3 style={{ marginBottom: '0.5rem', color: 'var(--accent-red)' }}>{dept.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{dept.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={14} style={{ color: 'var(--accent-red)' }} />
                      <span>{dept.phone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <MapPin size={14} style={{ color: 'var(--accent-red)', marginTop: '0.15rem' }} />
                      <span>{dept.address}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={14} style={{ color: 'var(--accent-red)' }} />
                      <span>{dept.hours}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: SERVICE GUIDES */}
        {currentView === 'guides' && (
          <div>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <BookOpen size={24} /> {t('Service Application Guides', 'أدلة تقديم الخدمات')}
              </h2>

              {([
                { title: t('National ID Card Renewal', 'تجديد بطاقة الرقم القومي'), steps: [t('Fill in your personal details (name, birth date, address)', 'املأ بياناتك الشخصية (الاسم، تاريخ الميلاد، العنوان)'), t('Select reason: first time, renewal, lost or damaged', 'اختر السبب: أول مرة، تجديد، بدل فاقد أو تالف'), t('Upload required documents (photo, police report if lost)', 'ارفع المستندات المطلوبة (صورة شخصية، محضر شرطة إذا كان بدل فاقد)'), t('Submit and receive your tracking code', 'قدّم الطلب واستلم كود التتبع')] },
                { title: t('Passport Application', 'طلب جواز السفر'), steps: [t('Fill in personal details in English and Arabic', 'املأ البيانات الشخصية بالإنجليزية والعربية'), t('Provide qualification and profession information', 'قدم معلومات المؤهل والوظيفة'), t('Upload passport photo and required documents', 'ارفع الصورة الشخصية والمستندات المطلوبة'), t('Choose delivery method: pickup or courier', 'اختر طريقة الاستلام: من المكتب أو التوصيل')] },
                { title: t('Military & Recruitment Documents', 'الأوراق العسكرية'), steps: [t('Select document type: exemption, travel permit, postponement, or service certificate', 'اختر نوع المستند: إعفاء، تصريح سفر، تأجيل، شهادة خدمة'), t('Provide reason and supporting details', 'قدم السبب والتفاصيل الداعمة'), t('Submit your request and track status', 'قدّم طلبك وتابع الحالة')] },
                { title: t('Tax Payment', 'سداد الضرائب'), steps: [t('Enter your tax registration number', 'أدخل رقم التسجيل الضريبي'), t('Select payment type: income tax, VAT, stamp duty', 'اختر نوع الدفع: ضريبة دخل، قيمة مضافة، دمغة'), t('Enter the amount and select payment method', 'أدخل المبلغ واختر طريقة الدفع'), t('Confirm and download receipt', 'أكد التحميل واستلم الإيصال')] },
                { title: t('Traffic Fine Payment', 'مخالفات المرور'), steps: [t('Enter license plate number and violation reference', 'أدخل رقم اللوحة ورقم المخالفة'), t('Select governorate where the violation occurred', 'اختر المحافظة التي حدثت بها المخالفة'), t('Review fine amount and confirm payment', 'راجع قيمة الغرامة وأكد الدفع')] },
              ] as const).map((guide, i) => (
                <div key={i} className="glass-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
                  <h3 style={{ color: 'var(--accent-red)', marginBottom: '1rem' }}>{guide.title}</h3>
                  <ol style={{ lineHeight: '2', color: 'var(--text-secondary)', paddingLeft: isRtl ? '' : '1.5rem', paddingRight: isRtl ? '1.5rem' : '' }}>
                    {guide.steps.map((step, si) => (
                      <li key={si}>{step}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: ABOUT US */}
        {currentView === 'about' && (
          <div>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Globe size={24} /> {t('About MisrGate', 'عن بوابة مصر')}
              </h2>

              <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--accent-red)', marginBottom: '1rem' }}>
                  {t('Our Mission', 'رسالتنا')}
                </h3>
                <p style={{ lineHeight: '1.7', color: 'var(--text-secondary)' }}>
                  {t(
                    'MisrGate is the official Egyptian e-government services portal, designed to provide citizens with secure, fast, and transparent access to government services. Our mission is to digitize and streamline administrative processes, reducing paperwork and saving time for every Egyptian citizen.',
                    'بوابة مصر هي البوابة الرسمية للخدمات الحكومية الإلكترونية، صُممت لتوفير وصول آمن وسريع وشفاف للمواطنين إلى الخدمات الحكومية. رسالتنا هي رقمنة وتبسيط الإجراءات الإدارية، وتقليل الأوراق الروتينية وتوفير الوقت لكل مواطن مصري.'
                  )}
                </p>
              </div>

              <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--accent-red)', marginBottom: '1rem' }}>
                  {t('Key Features', 'المميزات الرئيسية')}
                </h3>
                <ul style={{ lineHeight: '2', color: 'var(--text-secondary)', paddingLeft: isRtl ? '' : '1.5rem', paddingRight: isRtl ? '1.5rem' : '' }}>
                  <li>{t('8 integrated government services on one platform', '8 خدمات حكومية متكاملة على منصة واحدة')}</li>
                  <li>{t('Real-time application tracking with unique tracking codes', 'تتبع فوري للمعاملات بأكواد تتبع فريدة')}</li>
                  <li>{t('Secure document upload and management', 'رفع وإدارة آمنة للوثائق')}</li>
                  <li>{t('Online appointment booking across departments', 'حجز مواعيد إلكتروني عبر الإدارات')}</li>
                  <li>{t('Bilingual interface (English / Arabic) with full RTL support', 'واجهة ثنائية اللغة (إنجليزية / عربية) مع دعم كامل للكتابة من اليمين')}</li>
                  <li>{t('Real-time notifications on application status changes', 'إشعارات فورية عند تغيير حالة المعاملة')}</li>
                  <li>{t('Citizen feedback and complaints system', 'نظام لشكاوى واقتراحات المواطنين')}</li>
                  <li>{t('Comprehensive admin desk for review and management', 'غرفة إدارة متكاملة للمراجعة والإدارة')}</li>
                </ul>
              </div>

              <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--accent-red)', marginBottom: '1rem' }}>
                  {t('Available Services', 'الخدمات المتاحة')}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {[
                    t('National ID Card Renewal', 'تجديد بطاقة الرقم القومي'),
                    t('Military & Recruitment Documents', 'الأوراق العسكرية'),
                    t('Civil Registry Certificates', 'وثائق الأحوال المدنية'),
                    t('Passport Services', 'خدمات جواز السفر'),
                    t('Tax Payment (ETA)', 'سداد الضرائب'),
                    t('Traffic Violations', 'مخالفات المرور'),
                    t('Health Insurance', 'التأمين الصحي'),
                    t('Social Insurance', 'التأمينات الاجتماعية'),
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ color: 'var(--accent-green)' }}>✓</span>
                      <span style={{ fontSize: '0.85rem' }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ color: 'var(--accent-red)', marginBottom: '1rem' }}>
                  {t('Contact & Support', 'الاتصال والدعم')}
                </h3>
                <p style={{ lineHeight: '1.7', color: 'var(--text-secondary)' }}>
                  {t(
                    'For technical support or inquiries, please use the Feedback system or visit your nearest Citizen Service Center. You can also reach us through the official government hotline at 15999.',
                    'للدعم الفني أو الاستفسارات، يرجى استخدام نظام الشكاوى أو زيارة أقرب مركز خدمة مواطن. يمكنكم أيضًا الاتصال بنا عبر الخط الساخن للحكومة على 15999.'
                  )}
                </p>
                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                    <Phone size={16} style={{ color: 'var(--accent-red)' }} />
                    <span>{t('Hotline: 15999', 'الخط الساخن: 15999')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                    <Mail size={16} style={{ color: 'var(--accent-red)' }} />
                    <span>{t('Email: support@misrgate.gov.eg', 'البريد الإلكتروني: support@misrgate.gov.eg')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                    <MapPin size={16} style={{ color: 'var(--accent-red)' }} />
                    <span>{t('MisrGate HQ: Cairo, Egypt', 'المقر الرئيسي: القاهرة، مصر')}</span>
                  </div>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-outline" onClick={() => setCurrentView('terms')}>
                    <FileText size={14} /> {t('Terms', 'الشروط')}
                  </button>
                  <button className="btn btn-outline" onClick={() => setCurrentView('holidays')}>
                    <Calendar size={14} /> {t('Holidays', 'الإجازات')}
                  </button>
                  <button className="btn btn-outline" onClick={() => setCurrentView('sitemap')}>
                    <Home size={14} /> {t('Sitemap', 'خريطة الموقع')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: GOVERNMENT HOLIDAYS */}
        {currentView === 'holidays' && (
          <div>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Calendar size={24} /> {t('Official Government Holidays', 'الإجازات الرسمية')}
              </h2>

              {([
                { date: t('January 7', '7 يناير'), name: t('Coptic Christmas', 'عيد الميلاد المجيد') },
                { date: t('January 25', '25 يناير'), name: t('Revolution Day / Police Day', 'عيد الشرطة / ثورة 25 يناير') },
                { date: t('April 25', '25 أبريل'), name: t('Sinai Liberation Day', 'عيد تحرير سيناء') },
                { date: t('May 1', '1 مايو'), name: t('Labour Day', 'عيد العمال') },
                { date: t('June 30', '30 يونيو'), name: t('June 30 Revolution', 'ثورة 30 يونيو') },
                { date: t('July 23', '23 يوليو'), name: t('July 23 Revolution', 'عيد ثورة 23 يوليو') },
                { date: t('October 6', '6 أكتوبر'), name: t('Armed Forces Day', 'عيد القوات المسلحة') },
                { date: t('Variable (Islamic)', 'مُتغير (هجري)'), name: t('Eid al-Fitr (4 days)', 'عيد الفطر المبارك (4 أيام)') },
                { date: t('Variable (Islamic)', 'مُتغير (هجري)'), name: t('Eid al-Adha (4 days)', 'عيد الأضحى المبارك (4 أيام)') },
                { date: t('Variable (Islamic)', 'مُتغير (هجري)'), name: t('Islamic New Year', 'رأس السنة الهجرية') },
                { date: t('Variable (Islamic)', 'مُتغير (هجري)'), name: t('Prophet Muhammad\'s Birthday', 'المولد النبوي الشريف') },
              ] as const).map((holiday, i) => (
                <div key={i} className="glass-card" style={{ padding: '1rem 1.5rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Calendar size={16} style={{ color: 'var(--accent-red)' }} />
                    <span style={{ fontWeight: 600 }}>{holiday.name}</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{holiday.date}</span>
                </div>
              ))}

              <div className="glass-card" style={{ padding: '1rem', marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {t(
                  'Islamic (Hijri) holidays are approximate and confirmed by official authorities. Government offices are closed on all listed dates.',
                  'الإجازات الهجرية تقريبية وتُؤكدها الجهات الرسمية. المكاتب الحكومية مُغلقة في جميع التواريخ المذكورة.'
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: SITEMAP */}
        {currentView === 'sitemap' && (
          <div>
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Home size={24} /> {t('Site Map', 'خريطة الموقع')}
              </h2>
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                {([
                  { view: 'home', label: t('Home', 'الرئيسية'), icon: '🏠' },
                  { view: 'dashboard', label: t('Dashboard', 'لوحة التحكم'), icon: '📊' },
                  { view: 'apply', label: t('Apply for Service', 'تقديم طلب'), icon: '📝' },
                  { view: 'track', label: t('Track Application', 'تتبع الطلب'), icon: '🔍' },
                  { view: 'appointments', label: t('Appointments', 'المواعيد'), icon: '📅' },
                  { view: 'complaints', label: t('Feedback', 'الشكاوى'), icon: '💬' },
                  { view: 'timeline', label: t('Timeline', 'النشاطات'), icon: '📋' },
                  { view: 'service_directory', label: t('Service Directory', 'دليل الخدمات'), icon: '📍' },
                  { view: 'faq', label: t('FAQ', 'الأسئلة'), icon: '❓' },
                  { view: 'guides', label: t('Guides', 'الأدلة'), icon: '📖' },
                  { view: 'profile', label: t('Profile', 'الملف الشخصي'), icon: '👤' },
                  { view: 'about', label: t('About', 'عن البوابة'), icon: 'ℹ️' },
                  { view: 'terms', label: t('Terms & Conditions', 'الشروط'), icon: '📄' },
                  { view: 'holidays', label: t('Holidays', 'الإجازات'), icon: '🎉' },
                  { view: 'admin', label: t('Admin Desk', 'غرفة الإدارة'), icon: '🔒' },
                  { view: 'analytics', label: t('Analytics', 'الإحصائيات'), icon: '📈' },
                  { view: 'admin_reports', label: t('Reports', 'التقارير'), icon: '📑' },
                  { view: 'activity_log', label: t('Activity Log', 'سجل النشاط'), icon: '📜' },
                ] as const).map(item => (
                  <div key={item.view} className="sitemap-link" onClick={() => setCurrentView(item.view as typeof currentView)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', cursor: 'pointer', borderRadius: 'var(--radius-sm)', transition: 'background 0.2s' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <span>{item.icon}</span>
                    <span style={{ fontWeight: 500 }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: TERMS & CONDITIONS */}
        {currentView === 'terms' && (
          <div>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <FileText size={24} /> {t('Terms & Conditions', 'الشروط والأحكام')}
              </h2>

              <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--accent-red)' }}>{t('1. Acceptance of Terms', '1. الموافقة على الشروط')}</h3>
                <p style={{ lineHeight: '1.7', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                  {t(
                    'By accessing and using MisrGate, you accept and agree to be bound by these Terms & Conditions. If you do not agree with any part, please discontinue use immediately.',
                    'باستخدام بوابة مصر، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء منها، يرجى التوقف عن الاستخدام فوراً.'
                  )}
                </p>
              </div>

              <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--accent-red)' }}>{t('2. User Responsibilities', '2. مسؤوليات المستخدم')}</h3>
                <ul style={{ lineHeight: '2', color: 'var(--text-secondary)', paddingLeft: isRtl ? '' : '1.5rem', paddingRight: isRtl ? '1.5rem' : '' }}>
                  <li>{t('Provide accurate and up-to-date personal information', 'تقديم معلومات شخصية دقيقة ومحدثة')}</li>
                  <li>{t('Maintain the confidentiality of your account credentials', 'الحفاظ على سرية بيانات حسابك')}</li>
                  <li>{t('Use the portal only for lawful purposes', 'استخدام البوابة للأغراض القانونية فقط')}</li>
                  <li>{t('Not misuse or attempt to disrupt the service', 'عدم إساءة استخدام الخدمة أو محاولة تعطيلها')}</li>
                </ul>
              </div>

              <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--accent-red)' }}>{t('3. Data Privacy', '3. خصوصية البيانات')}</h3>
                <p style={{ lineHeight: '1.7', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                  {t(
                    'We collect and process your personal data in accordance with applicable Egyptian laws. Your data is used solely for processing government service requests and is not shared with third parties without your consent.',
                    'نقوم بجمع ومعالجة بياناتك الشخصية وفقاً للقوانين المصرية. تُستخدم بياناتك فقط لمعالجة طلبات الخدمات الحكومية ولا تتم مشاركتها مع أطراف ثالثة دون موافقتك.'
                  )}
                </p>
              </div>

              <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--accent-red)' }}>{t('4. Service Availability', '4. توفر الخدمة')}</h3>
                <p style={{ lineHeight: '1.7', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                  {t(
                    'While we strive for 24/7 availability, MisrGate may occasionally be unavailable for maintenance. We are not liable for any losses arising from service interruptions.',
                    'بينما نسعى لتوفير الخدمة على مدار الساعة، قد تكون بوابة مصر غير متاحة أحياناً للصيانة. نحن غير مسؤولين عن أي خسائر ناتجة عن انقطاع الخدمة.'
                  )}
                </p>
              </div>

              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ color: 'var(--accent-red)' }}>{t('5. Contact', '5. الاتصال')}</h3>
                <p style={{ lineHeight: '1.7', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                  {t(
                    'For questions regarding these terms, please contact us through the Feedback system or call the government hotline at 15999.',
                    'للاستفسار حول هذه الشروط، يرجى التواصل معنا عبر نظام الشكاوى أو الاتصال بالخط الساخن على 15999.'
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: KEYBOARD SHORTCUTS */}
        {currentView === 'shortcuts' && (
          <div>
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Key size={24} /> {t('Keyboard Shortcuts', 'اختصارات لوحة المفاتيح')}
              </h2>
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                {([
                  { keys: 'Ctrl + Z', action: t('Undo last action', 'تراجع عن آخر إجراء') },
                  { keys: 'Ctrl + F', action: t('Search in lists', 'بحث في القوائم') },
                  { keys: 'Escape', action: t('Close modal / go back', 'إغلاق النافذة / الرجوع') },
                  { keys: 'Tab', action: t('Navigate between fields', 'التنقل بين الحقول') },
                  { keys: 'Enter', action: t('Submit form / confirm', 'إرسال النموذج / تأكيد') },
                ]).map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: i < 4 ? '1px solid var(--border-color)' : 'none', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{s.action}</span>
                    <kbd style={{ background: 'var(--bg-hover)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.85rem' }}>{s.keys}</kbd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: FAQ SECTION */}
        {currentView === 'faq' && (
          <div>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <HelpCircle size={24} /> {t('Frequently Asked Questions', 'الأسئلة الشائعة')}
              </h2>

              {/* FAQ Service Filter */}
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <select
                  value={faqFilter}
                  onChange={(e) => setFaqFilter(e.target.value)}
                  style={{ padding: '0.5rem 1rem', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', maxWidth: '300px' }}
                >
                  <option value="ALL">{t('All Services', 'كل الخدمات')}</option>
                  <option value="NATIONAL_ID">{t('National ID Cards', 'بطاقات الرقم القومي')}</option>
                  <option value="PASSPORT">{t('Egyptian Passport', 'جواز السفر المصري')}</option>
                  <option value="BIRTH_CERTIFICATE">{t('Civil Registry Records', 'وثائق الأحوال المدنية')}</option>
                  <option value="MILITARY_EXEMPTION">{t('Military & Recruitment', 'التجنيد والتعبئة')}</option>
                </select>
              </div>

              {/* FAQ for each service */}
              {[
                {
                  service: 'NATIONAL_ID' as ServiceType,
                  title: t('National ID Cards', 'بطاقات الرقم القومي'),
                  faqs: [
                    { q: t('How long does it take to renew a National ID?', 'كم يستغرق تجديد بطاقة الرقم القومي؟'), a: t('Standard processing takes 7-14 business days. Expedited service is available for urgent cases.', 'المدة المعتادة من 7-14 يوم عمل. تتوفر خدمة الاستعجال للحالات الطارئة.') },
                    { q: t('What documents are needed for a lost card replacement?', 'ما هي المستندات المطلوبة لاستخراج بدل فاقد؟'), a: t('You need a police report, original birth certificate, and two recent passport-sized photos.', 'تحتاج إلى محضر شرطة، شهادة ميلاد أصلية، وصورتين شخصيتين حديثتين.') },
                  ],
                },
                {
                  service: 'PASSPORT' as ServiceType,
                  title: t('Egyptian Passport', 'جواز السفر المصري'),
                  faqs: [
                    { q: t('How long is a passport valid for?', 'ما هي مدة صلاحية جواز السفر؟'), a: t('Adult passports are valid for 7 years. Minor passports (under 18) are valid for 5 years.', 'جواز السفر للبالغين صالح لمدة 7 سنوات. للأطفال تحت 18 سنة صالح لمدة 5 سنوات.') },
                    { q: t('Can I renew my passport online?', 'هل يمكنني تجديد جواز السفر عبر الإنترنت؟'), a: t('Yes, you can submit your renewal application through this portal and choose pickup or delivery.', 'نعم، يمكنك تقديم طلب التجديد عبر هذه البوابة واختيار الاستلام أو التوصيل.') },
                  ],
                },
                {
                  service: 'BIRTH_CERTIFICATE' as ServiceType,
                  title: t('Civil Registry Records', 'وثائق الأحوال المدنية'),
                  faqs: [
                    { q: t('How can I get a certified copy of my birth certificate?', 'كيف يمكنني الحصول على شهادة ميلاد معتمدة؟'), a: t('Submit a request through the portal. Certified copies are delivered within 3-5 business days.', 'قدم طلباً عبر البوابة. يتم تسليم الشهادات المعتمدة خلال 3-5 أيام عمل.') },
                  ],
                },
                {
                  service: 'MILITARY_EXEMPTION' as ServiceType,
                  title: t('Military & Recruitment', 'التجنيد والتعبئة'),
                  faqs: [
                    { q: t('Who is eligible for military exemption?', 'من يحق له الإعفاء من الخدمة العسكرية؟'), a: t('Exemption is granted for medical reasons, sole breadwinners, and those with specific family circumstances. Submit your documents for review.', 'يمنح الإعفاء للأسباب الطبية، والمعيل الوحيد، وذوي الظروف العائلية الخاصة. قدم مستنداتك للمراجعة.') },
                  ],
                },
                {
                  service: 'TAX_PAYMENT' as ServiceType,
                  title: t('Tax Payment', 'سداد الضرائب'),
                  faqs: [
                    { q: t('What payment methods are accepted?', 'ما هي طرق الدفع المقبولة؟'), a: t('We accept credit/debit cards, bank transfers, and e-wallet payments through the portal.', 'نقبل بطاقات الائتمان/الخصم والتحويلات البنكية والمحافظ الإلكترونية عبر البوابة.') },
                  ],
                },
                {
                  service: 'TRAFFIC_FINE' as ServiceType,
                  title: t('Traffic Violations', 'مخالفات المرور'),
                  faqs: [
                    { q: t('How can I check my traffic fines?', 'كيف يمكنني الاستعلام عن مخالفات المرور؟'), a: t('Enter your vehicle plate number in the search section on the home page. You can pay fines directly online.', 'أدخل رقم لوحة سيارتك في قسم البحث بالصفحة الرئيسية. يمكنك سداد المخالفات مباشرة عبر الإنترنت.') },
                  ],
                },
                {
                  service: 'HEALTH_INSURANCE' as ServiceType,
                  title: t('Health Insurance', 'التأمين الصحي'),
                  faqs: [
                    { q: t('How do I register for health insurance?', 'كيف أسجل في التأمين الصحي؟'), a: t('Fill out the application form with your personal details and dependents information. You will receive a confirmation within 5 business days.', 'املأ نموذج الطلب ببياناتك الشخصية وبيانات المعالين. ستتلقى تأكيداً خلال 5 أيام عمل.') },
                  ],
                },
                {
                  service: 'SOCIAL_INSURANCE' as ServiceType,
                  title: t('Social Insurance', 'التأمينات الاجتماعية'),
                  faqs: [
                    { q: t('Who can apply for social insurance?', 'من يمكنه التقدم للتأمينات الاجتماعية؟'), a: t('Employees, employers, and voluntary contributors can apply. Pensions and other social benefits are also handled through this service.', 'يمكن للعاملين وأصحاب العمل والمشتركين بالتطوع التقديم. يتم أيضاً التعامل مع المعاشات والمزايا الاجتماعية الأخرى عبر هذه الخدمة.') },
                  ],
                },
              ].filter(section => faqFilter === 'ALL' || section.service === faqFilter).map(section => (
                <div key={section.service} className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.25rem', textAlign: isRtl ? 'right' : 'left', direction: isRtl ? 'rtl' : 'ltr' }}>
                  <h3 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {getServiceLabel(section.service)}
                  </h3>
                  {section.faqs.map((faq, i) => (
                    <details key={i} style={{ marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                      <summary style={{ cursor: 'pointer', fontWeight: 500, padding: '0.5rem 0', fontSize: '0.9rem' }}>
                        {faq.q}
                      </summary>
                      <p style={{ padding: '0.5rem 0 0.25rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {faq.a}
                      </p>
                    </details>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: ADMIN COMPLAINTS MANAGEMENT */}
        {currentView === 'admin_complaints' && user?.role === 'ADMIN' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
              <h2>{t('Complaints Management', 'إدارة الشكاوى')}</h2>
              <button className="btn btn-secondary" onClick={goToAdmin}>
                {t('← Admin Desk', '← غرفة الإدارة')}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
              <select value={adminComplaintFilter.category} onChange={(e) => setAdminComplaintFilter({ ...adminComplaintFilter, category: e.target.value })} style={{ padding: '0.4rem', fontSize: '0.8rem' }}>
                <option value="ALL">{t('All Categories', 'كل التصنيفات')}</option>
                <option value="SERVICE_QUALITY">{t('Service Quality', 'جودة الخدمة')}</option>
                <option value="TECHNICAL_ISSUE">{t('Technical Issue', 'مشكلة تقنية')}</option>
                <option value="SUGGESTION">{t('Suggestion', 'اقتراح')}</option>
                <option value="STAFF_CONDUCT">{t('Staff Conduct', 'سلوك الموظفين')}</option>
                <option value="DELAY_COMPLAINT">{t('Delay Complaint', 'شكوى تأخير')}</option>
                <option value="OTHER">{t('Other', 'أخرى')}</option>
              </select>
              <select value={adminComplaintFilter.status} onChange={(e) => setAdminComplaintFilter({ ...adminComplaintFilter, status: e.target.value })} style={{ padding: '0.4rem', fontSize: '0.8rem' }}>
                <option value="ALL">{t('All Statuses', 'كل الحالات')}</option>
                <option value="OPEN">{t('Open', 'مفتوحة')}</option>
                <option value="UNDER_REVIEW">{t('Under Review', 'قيد المراجعة')}</option>
                <option value="RESOLVED">{t('Resolved', 'تم الحل')}</option>
                <option value="CLOSED">{t('Closed', 'مغلقة')}</option>
              </select>
              <button className="btn btn-secondary" onClick={fetchAdminComplaints} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                {t('Filter', 'تصفية')}
              </button>
            </div>

            <div className="glass-card" style={{ textAlign: isRtl ? 'right' : 'left' }}>
              {adminComplaints.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                  {t('No complaints found.', 'لا توجد شكاوى.')}
                </p>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                    <thead>
                      <tr>
                        <th>{t('Citizen', 'المواطن')}</th>
                        <th>{t('Category', 'التصنيف')}</th>
                        <th>{t('Subject', 'الموضوع')}</th>
                        <th>{t('Status', 'الحالة')}</th>
                        <th>{t('Date', 'التاريخ')}</th>
                        <th>{t('Action', 'إجراء')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminComplaints.map(c => (
                        <tr key={c.id}>
                          <td>
                            <div style={{ fontWeight: '700' }}>{c.user?.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.user?.email}</div>
                          </td>
                          <td>{c.category.replace(/_/g, ' ')}</td>
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.subject}</td>
                          <td><span className={`status-badge status-${c.status === 'RESOLVED' || c.status === 'CLOSED' ? 'COMPLETED' : c.status === 'UNDER_REVIEW' ? 'UNDER_REVIEW' : 'PENDING'}`}>{c.status}</span></td>
                          <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => { setSelectedComplaint(c); setComplaintResponse(c.response || ''); }}>
                              {c.status === 'RESOLVED' || c.status === 'CLOSED' ? t('View', 'عرض') : t('Respond', 'رد')}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Complaint Response Modal */}
            {selectedComplaint && (
              <div className="modal-overlay">
                <div className="glass-card modal-content" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                    <h3 style={{ color: 'var(--accent-red)' }}>{t('Complaint Details', 'تفاصيل الشكوى')}</h3>
                    <button className="btn btn-secondary" onClick={() => setSelectedComplaint(null)} style={{ padding: '0.35rem 0.6rem' }}><X size={16} /></button>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <p><strong>{t('From:', 'من:')}</strong> {selectedComplaint.user?.name} ({selectedComplaint.user?.email})</p>
                    <p><strong>{t('Category:', 'التصنيف:')}</strong> {selectedComplaint.category.replace(/_/g, ' ')}</p>
                    <p><strong>{t('Subject:', 'الموضوع:')}</strong> {selectedComplaint.subject}</p>
                  </div>
                  <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--border-radius-md)', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: '0.9rem' }}>{selectedComplaint.message}</p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      {new Date(selectedComplaint.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {selectedComplaint.response && (
                    <div style={{ background: 'var(--bg-success)', padding: '1rem', borderRadius: 'var(--border-radius-md)', marginBottom: '1.5rem', border: '1px solid var(--border-success)' }}>
                      <strong>{t('Previous Response:', 'الرد السابق:')}</strong>
                      <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>{selectedComplaint.response}</p>
                      {selectedComplaint.respondedBy && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{t('By:', 'بواسطة:')} {selectedComplaint.respondedBy}</div>}
                    </div>
                  )}
                  {(selectedComplaint.status === 'OPEN' || selectedComplaint.status === 'UNDER_REVIEW') && (
                    <form onSubmit={handleComplaintResponse}>
                      <div className="form-group">
                        <label>{t('Your Response', 'ردك')}</label>
                        <textarea
                          rows={3}
                          required
                          value={complaintResponse}
                          onChange={(e) => setComplaintResponse(e.target.value)}
                          placeholder={t('Write your response to the citizen...', 'اكتب ردك على المواطن...')}
                        />
                      </div>
                      <button type="submit" className="btn btn-primary">
                        {t('Submit Response', 'إرسال الرد')}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW: CITIZEN APPOINTMENTS */}
        {currentView === 'appointments' && user && (
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: isRtl ? 'right' : 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
              <h2>{t('My Appointments', 'مواعيدي')}</h2>
              <button className="btn btn-secondary" onClick={goToDashboard}>
                {t('← Dashboard', '← لوحة التحكم')}
              </button>
            </div>

            {/* Booking Form */}
            <div className="glass-card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--accent-red)' }}>{t('Book New Appointment', 'حجز موعد جديد')}</h3>
              {appointmentSuccess && (
                <div className="success-banner"><CheckCircle size={18} /> {t('Appointment booked successfully!', 'تم حجز الموعد بنجاح!')}</div>
              )}
              <form onSubmit={handleBookAppointment}>
                <div className="form-group">
                  <label>{t('Department', 'الإدارة')}</label>
                  <select
                    value={appointmentForm.department}
                    onChange={(e) => { setAppointmentForm({ ...appointmentForm, department: e.target.value }); fetchAvailableSlots(appointmentForm.date, e.target.value); }}
                  >
                    <option value="CIVIL_REGISTRY">{t('Civil Registry', 'الأحوال المدنية')}</option>
                    <option value="PASSPORT_OFFICE">{t('Passport Office', 'مكتب الجوازات')}</option>
                    <option value="TRAFFIC_DEPARTMENT">{t('Traffic Department', 'إدارة المرور')}</option>
                    <option value="SOCIAL_INSURANCE">{t('Social Insurance', 'التأمينات الاجتماعية')}</option>
                    <option value="HEALTH_INSURANCE">{t('Health Insurance', 'التأمين الصحي')}</option>
                    <option value="TAX_AUTHORITY">{t('Tax Authority', 'مصلحة الضرائب')}</option>
                    <option value="MILITARY_RECRUITMENT">{t('Military Recruitment', 'التجنيد والتعبئة')}</option>
                    <option value="GENERAL_INQUIRY">{t('General Inquiry', 'استعلامات عامة')}</option>
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('Date', 'التاريخ')}</label>
                    <input
                      type="date"
                      required
                      value={appointmentForm.date}
                      onChange={(e) => { setAppointmentForm({ ...appointmentForm, date: e.target.value }); fetchAvailableSlots(e.target.value, appointmentForm.department); }}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('Time Slot', 'الفترة الزمنية')}</label>
                    <select
                      required
                      value={appointmentForm.timeSlot}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, timeSlot: e.target.value })}
                    >
                      <option value="">{t('Select a time slot...', 'اختر موعداً...')}</option>
                      {availableSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={appointmentLoading}>
                  {appointmentLoading ? <Loader2 className="spinner" size={16} /> : t('Book Appointment', 'حجز الموعد')}
                </button>
              </form>
            </div>

            {/* My Existing Appointments */}
            <div className="glass-card">
              <h3 style={{ marginBottom: '1rem', color: 'var(--accent-red)' }}>{t('My Appointments', 'مواعيدي')}</h3>
              {appointments.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>{t('No appointments booked.', 'لا توجد مواعيد محجوزة.')}</p>
              ) : (
                <div>
                  {appointments.map(a => (
                    <div key={a.id} style={{ borderBottom: '1px solid var(--border-color)', padding: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                      <div>
                        <strong>{a.department.replace(/_/g, ' ')}</strong>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(a.date).toLocaleDateString()} — {a.timeSlot}</div>
                        <span className={`status-badge status-${a.status === 'SCHEDULED' ? 'PENDING' : a.status === 'CONFIRMED' ? 'UNDER_REVIEW' : a.status === 'COMPLETED' || a.status === 'CANCELLED' ? 'COMPLETED' : 'REJECTED'}`}>{a.status}</span>
                      </div>
                      {a.status === 'SCHEDULED' && (
                        <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => handleCancelAppointment(a.id)}>
                          {t('Cancel', 'إلغاء')}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: ADMIN APPOINTMENTS MANAGEMENT */}
        {currentView === 'admin_appointments' && user?.role === 'ADMIN' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
              <h2>{t('Appointments Management', 'إدارة المواعيد')}</h2>
              <button className="btn btn-secondary" onClick={goToAdmin}>{t('← Admin Desk', '← غرفة الإدارة')}</button>
            </div>
            <div className="glass-card" style={{ textAlign: isRtl ? 'right' : 'left' }}>
              <div className="admin-table-container">
                <table className="admin-table" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                  <thead>
                    <tr>
                      <th>{t('Citizen', 'المواطن')}</th>
                      <th>{t('Department', 'الإدارة')}</th>
                      <th>{t('Date', 'التاريخ')}</th>
                      <th>{t('Time', 'الموعد')}</th>
                      <th>{t('Status', 'الحالة')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminAppointments.map(a => (
                      <tr key={a.id}>
                        <td><div style={{ fontWeight: 700 }}>{a.user?.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.user?.nationalId}</div></td>
                        <td>{a.department.replace(/_/g, ' ')}</td>
                        <td>{new Date(a.date).toLocaleDateString()}</td>
                        <td>{a.timeSlot}</td>
                        <td><span className={`status-badge status-${a.status === 'SCHEDULED' ? 'PENDING' : a.status === 'CONFIRMED' ? 'UNDER_REVIEW' : a.status === 'COMPLETED' ? 'COMPLETED' : 'REJECTED'}`}>{a.status}</span></td>
                      </tr>
                    ))}
                    {adminAppointments.length === 0 && (
                      <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>{t('No appointments found.', 'لا توجد مواعيد.')}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: ACTIVITY LOG (ADMIN) */}
        {currentView === 'activity_log' && user?.role === 'ADMIN' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
              <h2>{t('System Activity Log', 'سجل نشاط النظام')}</h2>
              <button className="btn btn-secondary" onClick={goToAdmin}>{t('← Admin Desk', '← غرفة الإدارة')}</button>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
              <select value={activityActionFilter} onChange={(e) => { setActivityActionFilter(e.target.value); }} style={{ padding: '0.4rem', fontSize: '0.8rem' }}>
                <option value="">{t('All Actions', 'كل الإجراءات')}</option>
                <option value="SUBMIT_APPLICATION">{t('Submit Application', 'تقديم طلب')}</option>
                <option value="UPDATE_APPLICATION_STATUS">{t('Update Status', 'تحديث الحالة')}</option>
                <option value="SYSTEM_STARTUP">{t('System', 'النظام')}</option>
              </select>
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => fetchActivities(1)}>
                {t('Filter', 'تصفية')}
              </button>
            </div>
            <div className="glass-card" style={{ textAlign: isRtl ? 'right' : 'left' }}>
              <div className="admin-table-container">
                <table className="admin-table" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                  <thead>
                    <tr>
                      <th>{t('Time', 'الوقت')}</th>
                      <th>{t('User', 'المستخدم')}</th>
                      <th>{t('Action', 'الإجراء')}</th>
                      <th>{t('Details', 'التفاصيل')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityEntries.map(a => (
                      <tr key={a.id}>
                        <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{new Date(a.createdAt).toLocaleString()}</td>
                        <td><span style={{ fontWeight: 600 }}>{a.userName}</span></td>
                        <td><span className={`status-badge status-${a.action === 'SUBMIT_APPLICATION' ? 'PENDING' : a.action === 'UPDATE_APPLICATION_STATUS' ? 'UNDER_REVIEW' : 'COMPLETED'}`}>{a.action.replace(/_/g, ' ')}</span></td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '300px' }}>{a.details}</td>
                      </tr>
                    ))}
                    {activityEntries.length === 0 && (
                      <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>{t('No activities found.', 'لا توجد أنشطة.')}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {activityTotalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                  <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} disabled={activityPage <= 1} onClick={() => fetchActivities(activityPage - 1)}>
                    {t('‹ Prev', '‹ السابق')}
                  </button>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('Page', 'صفحة')} {activityPage} / {activityTotalPages}</span>
                  <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} disabled={activityPage >= activityTotalPages} onClick={() => fetchActivities(activityPage + 1)}>
                    {t('Next ›', 'التالي ›')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: ANALYTICS DASHBOARD */}
        {currentView === 'analytics' && user?.role === 'ADMIN' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><TrendingUp size={22} /> {t('Service Analytics', 'تحليلات الخدمات')}</h2>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('Period:', 'الفترة:')}</span>
                {[7, 30, 90].map(d => (
                  <button key={d} className={`btn ${analyticsDays === d ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setAnalyticsDays(d); fetchAnalytics(d); }} style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>
                    {d}{t('d', 'ي')}
                  </button>
                ))}
              </div>
            </div>

            {analyticsLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}><Loader2 className="spinner" size={24} /></div>
            ) : analyticsData ? (
              <>
                {/* Overview Cards */}
                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  <div className="stat-card"><div className="stat-value">{analyticsData.overview.totalApplications}</div><div className="stat-label">{t('Applications', 'الطلبات')}</div></div>
                  <div className="stat-card"><div className="stat-value">{analyticsData.overview.totalUsers}</div><div className="stat-label">{t('Users', 'المستخدمون')}</div></div>
                  <div className="stat-card"><div className="stat-value">{analyticsData.overview.totalComplaints}</div><div className="stat-label">{t('Complaints', 'الشكاوى')}</div></div>
                  <div className="stat-card"><div className="stat-value">{analyticsData.overview.totalAppointments}</div><div className="stat-label">{t('Appointments', 'المواعيد')}</div></div>
                  <div className="stat-card"><div className="stat-value">{analyticsData.overview.totalRatings}</div><div className="stat-label">{t('Ratings', 'التقييمات')}</div></div>
                  <div className="stat-card"><div className="stat-value">{analyticsData.overview.averageRating.toFixed(1)} ★</div><div className="stat-label">{t('Avg Rating', 'متوسط التقييم')}</div></div>
                </div>

                {/* Two-column charts */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  {/* Apps by Service */}
                  <div className="glass-card" style={{ padding: '1.25rem' }}>
                    <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>{t('Applications by Service', 'الطلبات حسب الخدمة')}</h4>
                    {Object.entries(analyticsData.appsByService).map(([key, val]) => {
                      const total = analyticsData.overview.totalApplications || 1;
                      const pct = (val / total) * 100;
                      return (
                        <div key={key} style={{ marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                            <span>{key.replace(/_/g, ' ')}</span>
                            <span style={{ fontWeight: 600 }}>{val}</span>
                          </div>
                          <div style={{ height: '6px', background: 'var(--bg-progress-bar)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent-red)', borderRadius: '3px', transition: 'width 0.5s ease' }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Apps by Status */}
                  <div className="glass-card" style={{ padding: '1.25rem' }}>
                    <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>{t('Applications by Status', 'الطلبات حسب الحالة')}</h4>
                    {Object.entries(analyticsData.appsByStatus).map(([key, val]) => {
                      const total = analyticsData.overview.totalApplications || 1;
                      const pct = (val / total) * 100;
                      return (
                        <div key={key} style={{ marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                            <span className={`status-badge status-${key}`} style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}>{key}</span>
                            <span style={{ fontWeight: 600 }}>{val}</span>
                          </div>
                          <div style={{ height: '6px', background: 'var(--bg-progress-bar)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: key === 'COMPLETED' ? 'var(--accent-green)' : key === 'REJECTED' ? 'var(--accent-red)' : key === 'APPROVED' ? 'var(--accent-blue)' : key === 'UNDER_REVIEW' ? 'var(--accent-gold)' : 'var(--text-muted)', borderRadius: '3px', transition: 'width 0.5s ease' }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Trend chart */}
                <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
                  <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>{t(`Application Trend (Last ${analyticsDays} Days)`, `اتجاه الطلبات (آخر ${analyticsDays} يوماً)`)}</h4>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '120px', padding: '0.5rem 0' }}>
                    {analyticsData.appsTrend.map((point, i) => {
                      const maxCount = Math.max(...analyticsData.appsTrend.map(p => p.count), 1);
                      const height = (point.count / maxCount) * 100;
                      return (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                          <div style={{ width: '100%', height: `${height}%`, background: 'var(--accent-red)', borderRadius: '2px 2px 0 0', minHeight: '4px', transition: 'height 0.3s ease', opacity: 0.8 }} title={`${point.date}: ${point.count}`}></div>
                          {analyticsData.appsTrend.length <= 14 && (
                            <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>
                              {point.date.slice(5)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Second row: Complaints + Appointments */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="glass-card" style={{ padding: '1.25rem' }}>
                    <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>{t('Complaints by Category', 'الشكاوى حسب التصنيف')}</h4>
                    {Object.entries(analyticsData.complaintsByCategory).map(([key, val]) => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                        <span>{key.replace(/_/g, ' ')}</span>
                        <span style={{ fontWeight: 600 }}>{val}</span>
                      </div>
                    ))}
                  </div>
                  <div className="glass-card" style={{ padding: '1.25rem' }}>
                    <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>{t('Appointments by Department', 'المواعيد حسب القسم')}</h4>
                    {Object.entries(analyticsData.appointmentsByDepartment).map(([key, val]) => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                        <span>{key.replace(/_/g, ' ')}</span>
                        <span style={{ fontWeight: 600 }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                {t('No analytics data available yet.', 'لا توجد بيانات تحليلات متاحة بعد.')}
              </div>
            )}
          </div>
        )}

        {/* VIEW: ADMIN REPORTS */}
        {currentView === 'admin_reports' && user?.role === 'ADMIN' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText size={22} /> {t('System Reports', 'تقارير النظام')}</h2>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select value={reportPeriod} onChange={(e) => { setReportPeriod(e.target.value); fetchReport(e.target.value); }} style={{ padding: '0.4rem', fontSize: '0.8rem' }}>
                  <option value="7">{t('Last 7 Days', 'آخر 7 أيام')}</option>
                  <option value="30">{t('Last 30 Days', 'آخر 30 يوم')}</option>
                  <option value="90">{t('Last 90 Days', 'آخر 90 يوم')}</option>
                </select>
                <button className="btn btn-secondary" onClick={() => window.print()} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                  <Printer size={12} /> {t('Print / PDF', 'طباعة / PDF')}
                </button>
                <button className="btn btn-secondary" onClick={goToAdmin}>{t('← Admin Desk', '← غرفة الإدارة')}</button>
              </div>
            </div>

            {reportLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}><Loader2 className="spinner" size={24} /></div>
            ) : reportData ? (
              <div className="report-container">
                {/* Summary section */}
                <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                    <span>{t('Period:', 'الفترة:')} {reportData.period}</span>
                    <span>{t('Generated:', 'تم التوليد:')} {new Date(reportData.generatedAt).toLocaleString()}</span>
                  </div>
                  <div className="stats-section" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
                    <div className="stat-card"><div className="stat-number">{reportData.totalUsers}</div><div className="stat-label">{t('Users', 'المستخدمون')}</div></div>
                    <div className="stat-card"><div className="stat-number">{reportData.totalApplications}</div><div className="stat-label">{t('Applications', 'الطلبات')}</div></div>
                    <div className="stat-card"><div className="stat-number">{reportData.totalComplaints}</div><div className="stat-label">{t('Complaints', 'الشكاوى')}</div></div>
                    <div className="stat-card"><div className="stat-number">{reportData.totalAppointments}</div><div className="stat-label">{t('Appointments', 'المواعيد')}</div></div>
                    <div className="stat-card"><div className="stat-number">{reportData.totalNotifications}</div><div className="stat-label">{t('Notifications', 'الإشعارات')}</div></div>
                    <div className="stat-card"><div className="stat-number">{reportData.totalRatings}</div><div className="stat-label">{t('Ratings', 'التقييمات')}</div></div>
                    <div className="stat-card"><div className="stat-number">{reportData.averageRating.toFixed(1)} ★</div><div className="stat-label">{t('Avg Rating', 'متوسط التقييم')}</div></div>
                  </div>
                </div>

                {/* By Service */}
                <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
                  <h3 style={{ marginBottom: '0.75rem' }}>{t('Applications by Service', 'الطلبات حسب الخدمة')}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                    {Object.entries(reportData.byService).map(([key, val]) => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.5rem', background: 'var(--bg-subtle)', borderRadius: 'var(--border-radius-sm)', fontSize: '0.85rem' }}>
                        <span>{getServiceLabel(key)}</span>
                        <span style={{ fontWeight: 600 }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By Status */}
                <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
                  <h3 style={{ marginBottom: '0.75rem' }}>{t('Applications by Status', 'الطلبات حسب الحالة')}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem' }}>
                    {Object.entries(reportData.byStatus).map(([key, val]) => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.5rem', background: 'var(--bg-subtle)', borderRadius: 'var(--border-radius-sm)', fontSize: '0.85rem' }}>
                        <span>{key}</span>
                        <span style={{ fontWeight: 600 }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                {reportData.activities.length > 0 && (
                  <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
                    <h3 style={{ marginBottom: '0.75rem' }}>{t('Recent Activity', 'النشاط الأخير')}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {reportData.activities.slice(0, 10).map(a => (
                        <div key={a.id} style={{ fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid var(--border-color)', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                          <span><strong>{a.userName}</strong> — {a.action}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{new Date(a.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                {t('Select a period and generate a report.', 'اختر فترة وقم بتوليد تقرير.')}
              </div>
            )}
          </div>
        )}

        {/* VIEW: ADMIN ANNOUNCEMENTS MANAGEMENT */}
        {currentView === 'admin_announcements' && user?.role === 'ADMIN' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Megaphone size={22} /> {t('Announcements', 'الإعلانات')}</h2>
              <button className="btn btn-secondary" onClick={goToAdmin}>{t('← Admin Desk', '← غرفة الإدارة')}</button>
            </div>

            {/* Create Announcement Form */}
            <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>{t('New Announcement', 'إعلان جديد')}</h3>
              {announcementFormSuccess && <div className="success-banner" style={{ marginBottom: '1rem' }}>{announcementFormSuccess}</div>}
              {announcementFormError && <div className="error-banner" style={{ marginBottom: '1rem' }}>{announcementFormError}</div>}
              <form onSubmit={handleCreateAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder={t('Announcement title...', 'عنوان الإعلان...')}
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                  style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                />
                <textarea
                  placeholder={t('Announcement message...', 'نص الإعلان...')}
                  value={announcementForm.message}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                  style={{ padding: '0.5rem', fontSize: '0.9rem', resize: 'vertical' }}
                />
                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                  {t('Publish Announcement', 'نشر الإعلان')}
                </button>
              </form>
            </div>

            {/* Announcements List */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>{t('Manage Announcements', 'إدارة الإعلانات')}</h3>
              {adminAnnouncements.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>{t('No announcements yet.', 'لا توجد إعلانات بعد.')}</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {adminAnnouncements.map(a => (
                    <div key={a.id} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isRtl ? 'row-reverse' : 'row', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong>{a.title}</strong>
                          <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: a.active ? 'var(--accent-green)' : 'var(--text-muted)', color: 'var(--accent-white)' }}>
                            {a.active ? t('Active', 'نشط') : t('Inactive', 'غير نشط')}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{a.message}</p>
                        <small style={{ color: 'var(--text-muted)' }}>{new Date(a.createdAt).toLocaleDateString()}</small>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                        <button className={`btn ${a.active ? 'btn-secondary' : 'btn-primary'}`} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleToggleAnnouncement(a.id, a.active)}>
                          {a.active ? t('Deactivate', 'إيقاف') : t('Activate', 'تفعيل')}
                        </button>
                        <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleDeleteAnnouncement(a.id)}>
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: ADMIN MODERATION PANEL */}
        {currentView === 'admin' && user?.role === 'ADMIN' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
              <h2>{t('Officer Audit Room', 'غرفة مراجعة وتوقيع المعاملات')}</h2>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div className="export-btns" style={{ display: 'flex', gap: '0.35rem' }}>
                  <button className="btn btn-secondary" onClick={() => downloadCSV('applications', 'applications.csv')} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                    <Download size={12} /> {t('CSV', 'CSV')}
                  </button>
                  <button className="btn btn-secondary" onClick={() => downloadCSV('complaints', 'complaints.csv')} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                    <Download size={12} /> {t('CMP', 'الشكاوى')}
                  </button>
                  <button className="btn btn-secondary" onClick={() => downloadCSV('appointments', 'appointments.csv')} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                    <Download size={12} /> {t('APT', 'المواعيد')}
                  </button>
                </div>
                <button className="btn btn-secondary" onClick={() => fetchAdminData()}>
                  {t('Refresh', 'تحديث')}
                </button>
              </div>
            </div>

            {/* Dashboard metrics cards */}
            {adminStats && (
              <div className="stats-section" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
                <div className="stat-card">
                  <div className="stat-number">{adminStats.totalApplications}</div>
                  <div className="stat-label">{t('Total Requests', 'إجمالي الطلبات')}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{adminStats.byStatus.PENDING}</div>
                  <div className="stat-label">{t('Pending Review', 'قيد الانتظار')}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{adminStats.byStatus.APPROVED + adminStats.byStatus.COMPLETED}</div>
                  <div className="stat-label">{t('Approved & Printed', 'المعتمدة والمكتملة')}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{adminStats.totalUsers}</div>
                  <div className="stat-label">{t('Registered Citizens', 'المواطنون بالبوابة')}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number" style={{ color: 'var(--accent-red)' }}>{adminComplaints.filter(c => c.status === 'OPEN').length}</div>
                  <div className="stat-label">{t('Pending Complaints', 'شكاوى معلقة')}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number" style={{ color: 'var(--accent-red)' }}>{adminAppointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length}</div>
                  <div className="stat-label">{t('Appts Today', 'مواعيد اليوم')}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{adminAnnouncements.length}</div>
                  <div className="stat-label">{t('Announcements', 'الإعلانات')}</div>
                </div>
              </div>
            )}

            {/* Status Color Legend */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem', direction: isRtl ? 'rtl' : 'ltr', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: 500 }}>{t('Status:', 'الحالة:')}</span>
              <span className="status-badge status-PENDING">{t('Pending', 'قيد الانتظار')}</span>
              <span className="status-badge status-UNDER_REVIEW">{t('Under Review', 'قيد المراجعة')}</span>
              <span className="status-badge status-APPROVED">{t('Approved', 'معتمد')}</span>
              <span className="status-badge status-COMPLETED">{t('Completed', 'مكتمل')}</span>
              <span className="status-badge status-REJECTED">{t('Rejected', 'مرفوض')}</span>
              <span className="status-badge status-CANCELLED">{t('Cancelled', 'ملغي')}</span>
            </div>

            {/* Main Application Moderation Table */}
            <div className="glass-card" style={{ textAlign: isRtl ? 'right' : 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                <h3>{t('Submissions Queue', 'قائمة معاملات المواطنين المجدولة للتدقيق')}</h3>
                
                {/* Filter & Search section */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                  <div className="hero-search" style={{ margin: 0, flex: '1 1 200px', maxWidth: '300px' }}>
                    <input
                      type="text"
                      placeholder={t('Search by name, code, or national ID...', 'بحث بالاسم أو الكود أو الرقم القومي...')}
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') fetchAdminData(1); }}
                      style={{ border: 'none', background: 'transparent', flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}
                    />
                    <button className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => fetchAdminData(1)}>
                      <Search size={13} />
                    </button>
                  </div>
                  <select value={adminFilterService} onChange={(e) => { setAdminFilterService(e.target.value); }} style={{ padding: '0.4rem', fontSize: '0.8rem' }}>
                    <option value="ALL">{t('All Services', 'كل الخدمات')}</option>
                    <option value="NATIONAL_ID">{t('National ID Cards', 'بطاقات الرقم القومي')}</option>
                    <option value="MILITARY_EXEMPTION">{t('Military / Recruitment', 'المعاملات العسكرية')}</option>
                    <option value="BIRTH_CERTIFICATE">{t('Birth Certificates', 'شهادات الميلاد')}</option>
                    <option value="PASSPORT">{t('Passports', 'جوازات السفر')}</option>
                    <option value="TAX_PAYMENT">{t('Tax Payment', 'سداد الضرائب')}</option>
                    <option value="TRAFFIC_FINE">{t('Traffic Violations', 'مخالفات المرور')}</option>
                    <option value="HEALTH_INSURANCE">{t('Health Insurance', 'التأمين الصحي')}</option>
                    <option value="SOCIAL_INSURANCE">{t('Social Insurance', 'التأمينات الاجتماعية')}</option>
                  </select>
                  <select value={adminFilterStatus} onChange={(e) => { setAdminFilterStatus(e.target.value); }} style={{ padding: '0.4rem', fontSize: '0.8rem' }}>
                    <option value="ALL">{t('All Statuses', 'كل الحالات')}</option>
                    <option value="PENDING">{t('Pending', 'قيد الانتظار')}</option>
                    <option value="UNDER_REVIEW">{t('Under Review', 'تحت التدقيق')}</option>
                    <option value="APPROVED">{t('Approved', 'معتمدة')}</option>
                    <option value="REJECTED">{t('Rejected', 'مرفوضة')}</option>
                    <option value="COMPLETED">{t('Completed', 'مكتملة ومطبعة')}</option>
                  </select>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => fetchAdminData(1)}>
                    {t('Filter', 'تصفية')}
                  </button>
                </div>
              </div>

              {adminLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 className="spinner" /></div>
              ) : adminApps.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                  {t('No applications match filters.', 'لا توجد معاملات تطابق الفلاتر المحددة.')}
                </p>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: isRtl ? 'right' : 'left' }}>{t('Code', 'الكود')}</th>
                        <th style={{ textAlign: isRtl ? 'right' : 'left' }}>{t('Citizen', 'المواطن')}</th>
                        <th style={{ textAlign: isRtl ? 'right' : 'left' }}>{t('Service', 'الخدمة المطلوبة')}</th>
                        <th style={{ textAlign: isRtl ? 'right' : 'left' }}>{t('Date', 'التاريخ')}</th>
                        <th style={{ textAlign: isRtl ? 'right' : 'left' }}>{t('Status', 'الحالة')}</th>
                        <th style={{ textAlign: isRtl ? 'right' : 'left' }}>{t('Audit', 'تدقيق')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminApps.map((app) => (
                          <tr key={app.id}>
                            <td style={{ fontWeight: '700', color: 'var(--accent-red)' }}>{app.trackingCode}</td>
                            <td>
                              <div style={{ fontWeight: '700' }}>{app.user?.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('National ID:', 'الرقم القومي:')} {app.user?.nationalId}</div>
                            </td>
                            <td>{getServiceLabel(app.serviceType)}</td>
                            <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                            <td>
                              <span className={`status-badge status-${app.status}`}>{app.status}</span>
                            </td>
                            <td>
                              <button className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => { setSelectedAppForReview(app); setAdminDecision({ status: app.status, notes: app.notes || '' }); }}>
                                {t('Audit & Sign', 'تدقيق وتوقيع')}
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Controls */}
              {adminPagination.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                    disabled={adminPagination.page <= 1}
                    onClick={() => fetchAdminData(adminPagination.page - 1)}
                  >
                    {t('‹ Prev', '‹ السابق')}
                  </button>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {t('Page', 'صفحة')} {adminPagination.page} / {adminPagination.totalPages}
                    <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>
                      ({adminPagination.total} {t('total', 'إجمالي')})
                    </span>
                  </span>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                    disabled={adminPagination.page >= adminPagination.totalPages}
                    onClick={() => fetchAdminData(adminPagination.page + 1)}
                  >
                    {t('Next ›', 'التالي ›')}
                  </button>
                </div>
              )}
            </div>

            {/* Admin Audit Modal */}
            {selectedAppForReview && (
              <div className="modal-overlay">
                <div className="glass-card modal-content" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                    <h3 style={{ color: 'var(--accent-red)' }}>{t('Audit Panel:', 'مكتب التدقيق الإداري:')} {selectedAppForReview.trackingCode}</h3>
                    <button className="btn btn-secondary" onClick={() => setSelectedAppForReview(null)} style={{ padding: '0.35rem 0.6rem' }}><X size={16} /></button>
                  </div>

                  {/* Citizen Metadata */}
                  <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--border-radius-md)', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('Citizen Demographics', 'بيانات مقدم المعاملة')}</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <div>{t('Name:', 'الاسم:')} <span style={{ fontWeight: 'bold' }}>{selectedAppForReview.user?.name}</span></div>
                      <div>{t('National ID:', 'الرقم القومي:')} <span style={{ fontWeight: 'bold' }}>{selectedAppForReview.user?.nationalId}</span></div>
                      <div>{t('Email:', 'البريد الإلكتروني:')} <span style={{ color: 'var(--text-secondary)' }}>{selectedAppForReview.user?.email}</span></div>
                      <div>{t('Phone:', 'الهاتف المحمول:')} <span style={{ color: 'var(--text-secondary)' }}>{selectedAppForReview.user?.phone}</span></div>
                    </div>
                  </div>

                  {/* Attached Document */}
                  {selectedAppForReview.attachmentUrl && (
                    <div style={{ background: 'var(--bg-success)', padding: '0.75rem 1rem', borderRadius: 'var(--border-radius-md)', marginBottom: '1rem', border: '1px solid var(--border-success)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                      <FileUp size={16} style={{ color: 'var(--accent-green)' }} />
                      <span style={{ fontSize: '0.85rem' }}>{t('Attached Document:', 'المستند المرفق:')}</span>
                      <a href={selectedAppForReview.attachmentUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', textDecoration: 'underline' }}>
                        {t('View / Download', 'عرض / تحميل')}
                      </a>
                    </div>
                  )}

                  {/* Application Data Form Content */}
                  <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('Form Declarations', 'البيانات والمستندات المصرح بها')}</h4>
                  <div className="arabic-text" style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--border-radius-md)', marginBottom: '2rem', border: '1px solid var(--border-color)', textAlign: 'right' }}>
                    {Object.entries(selectedAppForReview.data as Record<string, string>).map(([key, val]) => (
                      <div key={key} style={{ margin: '0.4rem 0', fontSize: '0.85rem' }}>
                        <strong>
                          {key === 'docType' ? 'Document Type / نوع الوثيقة' : key}: 
                        </strong>{' '}
                        {key === 'docType' ? getMilitaryDocLabel(val) : val}
                      </div>
                    ))}
                  </div>

                  {/* Decision Form */}
                  <form onSubmit={handleAdminDecision}>
                    <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('Officer Decision', 'حفظ القرار الإداري')}</h4>
                    
                    <div className="form-group">
                      <label>{t('Update Status', 'تحديث حالة المعاملة في البوابة')}</label>
                      <select
                        value={adminDecision.status}
                        onChange={(e) => setAdminDecision({ ...adminDecision, status: e.target.value })}
                      >
                        <option value="PENDING">{t('PENDING - Awaiting Review', 'PENDING - قيد الانتظار والمراجعة الأولية')}</option>
                        <option value="UNDER_REVIEW">{t('UNDER REVIEW - Document Audit', 'UNDER_REVIEW - قيد التدقيق وفحص المستندات')}</option>
                        <option value="APPROVED">{t('APPROVED - Certified for Printing', 'APPROVED - معتمد وموقع للاستخراج')}</option>
                        <option value="REJECTED">{t('REJECTED - Discard / Re-apply', 'REJECTED - مرفوض (إعادة تقديم)')}</option>
                        <option value="COMPLETED">{t('COMPLETED - Printed & Dispatched', 'COMPLETED - مكتمل ومسلم للبريد للتوصيل')}</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>{t('Auditor Comments / Reasoning', 'ملاحظات الضابط المراجع والمبررات إلكترونياً')}</label>
                      <textarea
                        rows={3}
                        placeholder={t('Add review details or rejection reasons...', 'اكتب هنا ملاحظات الاعتماد أو أسباب الرفض لموافات المواطن بها...')}
                        value={adminDecision.notes}
                        onChange={(e) => setAdminDecision({ ...adminDecision, notes: e.target.value })}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setSelectedAppForReview(null)}>
                        {t('Cancel', 'إلغاء')}
                      </button>
                      <button type="submit" className="btn btn-primary">
                        {t('Sign & Confirm Status', 'توقيع واعتماد القرار')}
                      </button>
                    </div>
                  </form>

                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="lang-btn"
          style={{
            position: 'fixed', bottom: '1.5rem', left: isRtl ? 'auto' : '1.5rem', right: isRtl ? '1.5rem' : 'auto',
            width: '40px', height: '40px', borderRadius: '50%', zIndex: 999,
          }}
          title={t('Scroll to top', 'العودة للأعلى')}
        >
          <ArrowUp size={18} />
        </button>
      )}

      {/* Floating Quick Support Button */}
      {currentView !== 'complaints' && (
        <button
          className="floating-support-btn"
          onClick={() => { if (user) { setCurrentView('complaints'); setComplaintSuccess(false); fetchCitizenComplaints(); } }}
          style={{
            position: 'fixed', bottom: '1.5rem', right: isRtl ? 'auto' : '1.5rem', left: isRtl ? '1.5rem' : 'auto',
            width: '50px', height: '50px', borderRadius: '50%', border: 'none',
            background: 'var(--accent-red)', color: '#fff', cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)', zIndex: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
          }}
          title={t('Contact Support', 'الاتصال بالدعم')}
        >
          <MessageCircle size={24} />
        </button>
      )}

      </div>
    );
  }
