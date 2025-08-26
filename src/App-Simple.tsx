import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Users, FileText, Home, Car, Phone, Zap } from 'lucide-react';
import { useMobile } from './hooks/useMobile';
import MobileHeader from './components/MobileHeader';
import MobileNavigation from './components/MobileNavigation';
import Dashboard from './components/Dashboard';
import ClientManagement from './components/ClientManagement';
import SessionTracking from './components/SessionTracking';
import ExpenseTracking from './components/ExpenseTracking';
import Reports from './components/Reports';

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
  const { isNative, platform } = useMobile();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedClients = localStorage.getItem('tutorTracker_clients');
    const savedSessions = localStorage.getItem('tutorTracker_sessions');
    const savedExpenses = localStorage.getItem('tutorTracker_expenses');

    if (savedClients) {
      try {
        setClients(JSON.parse(savedClients));
      } catch (error) {
        console.error('Error loading clients from localStorage:', error);
      }
    }

    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions));
      } catch (error) {
        console.error('Error loading sessions from localStorage:', error);
      }
    }

    if (savedExpenses) {
      try {
        setExpenses(JSON.parse(savedExpenses));
      } catch (error) {
        console.error('Error loading expenses from localStorage:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('tutorTracker_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('tutorTracker_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('tutorTracker_expenses', JSON.stringify(expenses));
  }, [expenses]);

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'clients', name: 'Clients', icon: Users },
    { id: 'sessions', name: 'Sessions', icon: Calendar },
    { id: 'expenses', name: 'Expenses', icon: DollarSign },
    { id: 'reports', name: 'Tax Reports', icon: FileText },
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
      default:
        return <Dashboard clients={clients} sessions={sessions} expenses={expenses} />;
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isNative ? 'pb-safe' : 'pb-16 md:pb-0'}`}>
      {/* Header */}
      <MobileHeader 
        title="TutorTracker"
        subtitle="Tax Management System"
        showMenu={true}
        onMenuToggle={() => setMenuOpen(!menuOpen)}
        menuOpen={menuOpen}
      />

      {/* Navigation */}
      <MobileNavigation 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isMenuOpen={menuOpen}
        onMenuClose={() => setMenuOpen(false)}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {renderActiveTab()}
      </main>
    </div>
  );
}

export default App;