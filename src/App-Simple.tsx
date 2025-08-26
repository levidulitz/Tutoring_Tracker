import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Users, FileText, Home, Car, Phone, Zap } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('dashboard');
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
              <span className="ml-3 text-sm text-gray-500">Tax Management System</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Personal Edition
              </span>
              <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Local Storage
              </div>
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

      {/* Footer Notice */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            <p>
              <strong>Personal Edition:</strong> Data is stored locally in your browser. 
              For multi-user access and cloud storage, consider upgrading to the Professional Edition.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;