import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Users, FileText, Home, Car, Phone, Zap, Settings, LogOut } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';
import Dashboard from './components/Dashboard';
import ClientManagement from './components/ClientManagement';
import SessionTracking from './components/SessionTracking';
import ExpenseTracking from './components/ExpenseTracking';
import Reports from './components/Reports';
import { supabase } from './lib/supabase';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  hourlyRate: number;
  distanceFromHome: number;
  notes: string;
}

export interface Session {
  id: string;
  clientId: string;
  date: string;
  duration: number;
  rate: number;
  type: 'virtual' | 'in-person';
  mileage?: number;
  totalEarned: number;
  paid: boolean;
  paidDate?: string;
  notes: string;
}

export interface Expense {
  id: string;
  date: string;
  category: 'home-office' | 'utilities' | 'phone' | 'internet' | 'supplies' | 'vehicle' | 'professional-development' | 'marketing' | 'other';
  description: string;
  amount: number;
  deductible: boolean;
  receiptsAttached: boolean;
  notes: string;
}

function App() {
  const { user, profile, loading, error, signOut, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clients, setClients] = useState<Client[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Load data from Supabase when user is authenticated
  useEffect(() => {
    if (user && profile) {
      loadUserData();
    }
  }, [user, profile]);

  const loadUserData = async () => {
    try {
      // Load clients
      const { data: clientsData } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user!.id);
      
      if (clientsData) {
        setClients(clientsData.map(c => ({
          id: c.id,
          name: c.name,
          email: c.email || '',
          phone: c.phone || '',
          address: c.address || '',
          hourlyRate: c.hourly_rate,
          distanceFromHome: c.distance_from_home,
          notes: c.notes || ''
        })));
      }

      // Load sessions
      const { data: sessionsData } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user!.id);
      
      if (sessionsData) {
        setSessions(sessionsData.map(s => ({
          id: s.id,
          clientId: s.client_id,
          date: s.date,
          duration: s.duration,
          rate: s.rate,
          type: s.type as 'virtual' | 'in-person',
          mileage: s.mileage || 0,
          totalEarned: s.total_earned,
          paid: s.paid,
          paidDate: s.paid_date || undefined,
          notes: s.notes || ''
        })));
      }

      // Load expenses
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user!.id);
      
      if (expensesData) {
        setExpenses(expensesData.map(e => ({
          id: e.id,
          date: e.date,
          category: e.category as Expense['category'],
          description: e.description,
          amount: e.amount,
          deductible: e.deductible,
          receiptsAttached: e.receipts_attached,
          notes: e.notes || ''
        })));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'clients', name: 'Clients', icon: Users },
    { id: 'sessions', name: 'Sessions', icon: Calendar },
    { id: 'expenses', name: 'Expenses', icon: DollarSign },
    { id: 'reports', name: 'Tax Reports', icon: FileText },
    ...(isAdmin ? [{ id: 'admin', name: 'Admin', icon: Settings }] : []),
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard clients={clients} sessions={sessions} expenses={expenses} />;
      case 'clients':
        return <ClientManagement clients={clients} setClients={setClients} />;
      case 'sessions':
        return <SessionTracking 
          clients={clients} 
          sessions={sessions} 
          setSessions={setSessions} 
        />;
      case 'expenses':
        return <ExpenseTracking expenses={expenses} setExpenses={setExpenses} />;
      case 'reports':
        return <Reports clients={clients} sessions={sessions} expenses={expenses} />;
      case 'admin':
        return isAdmin ? <AdminPanel currentUser={profile} /> : <Dashboard clients={clients} sessions={sessions} expenses={expenses} />;
      default:
        return <Dashboard clients={clients} sessions={sessions} expenses={expenses} />;
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to database...</p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md">
              <p className="text-red-800 text-sm">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              >
                Retry Connection
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show error if connection failed
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Connection Error</h2>
            <p className="text-red-800 text-sm mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show auth form if not authenticated
  if (!user || !profile) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">TutorTracker</h1>
              </div>
              <span className="ml-3 text-sm text-gray-500">Professional Edition</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Synced</span>
              </div>
              <span className="text-sm text-gray-600">
                Welcome, {profile.full_name || profile.email}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                profile.role === 'owner' ? 'bg-yellow-100 text-yellow-800' :
                profile.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </span>
              <button
                onClick={signOut}
                className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveTab()}
      </main>
    </div>
  );
}

export default App;