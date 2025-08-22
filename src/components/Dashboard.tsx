import React from 'react';
import { DollarSign, Users, Calendar, TrendingUp, Car, Home } from 'lucide-react';
import { Client, Session, Expense } from '../App';

interface DashboardProps {
  clients: Client[];
  sessions: Session[];
  expenses: Expense[];
}

const Dashboard: React.FC<DashboardProps> = ({ clients, sessions, expenses }) => {
  // Calculate key metrics
  const totalIncome = sessions.reduce((sum, session) => sum + session.totalEarned, 0);
  const paidIncome = sessions.filter(s => s.paid).reduce((sum, session) => sum + session.totalEarned, 0);
  const unpaidIncome = totalIncome - paidIncome;
  const totalExpenses = expenses.filter(e => e.deductible).reduce((sum, expense) => sum + expense.amount, 0);
  const totalMileage = sessions.filter(s => s.type === 'in-person').reduce((sum, session) => sum + (session.mileage || 0), 0);

  // Current year data
  const currentYear = new Date().getFullYear();
  const currentYearSessions = sessions.filter(s => new Date(s.date).getFullYear() === currentYear);
  const currentYearExpenses = expenses.filter(e => new Date(e.date).getFullYear() === currentYear);
  const currentYearIncome = currentYearSessions.reduce((sum, session) => sum + session.totalEarned, 0);
  const currentYearExpenseTotal = currentYearExpenses.filter(e => e.deductible).reduce((sum, expense) => sum + expense.amount, 0);

  // Recent activity
  const recentSessions = sessions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const unpaidSessions = sessions.filter(s => !s.paid);

  const StatCard = ({ title, value, icon: Icon, color = "blue" }: {
    title: string;
    value: string;
    icon: any;
    color?: string;
  }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center">
        <div className={`p-2 bg-${color}-100 rounded-lg`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Overview of your tutoring business finances</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={`${currentYear} Income`}
          value={`$${currentYearIncome.toFixed(2)}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title={`${currentYear} Expenses`}
          value={`$${currentYearExpenseTotal.toFixed(2)}`}
          icon={TrendingUp}
          color="red"
        />
        <StatCard
          title="Active Clients"
          value={clients.length.toString()}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Sessions"
          value={currentYearSessions.length.toString()}
          icon={Calendar}
          color="purple"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Outstanding Balance"
          value={`$${unpaidIncome.toFixed(2)}`}
          icon={DollarSign}
          color="amber"
        />
        <StatCard
          title={`${currentYear} Mileage`}
          value={`${totalMileage.toLocaleString()} mi`}
          icon={Car}
          color="indigo"
        />
        <StatCard
          title="Net Income (Est.)"
          value={`$${(currentYearIncome - currentYearExpenseTotal).toFixed(2)}`}
          icon={TrendingUp}
          color="green"
        />
      </div>

      {/* Recent Activity and Unpaid Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h2>
          {recentSessions.length === 0 ? (
            <p className="text-gray-500 italic">No sessions recorded yet</p>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session) => {
                const client = clients.find(c => c.id === session.clientId);
                return (
                  <div key={session.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{client?.name || 'Unknown Client'}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(session.date).toLocaleDateString()} • {session.duration}hr • {session.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${session.totalEarned.toFixed(2)}</p>
                      <p className={`text-sm ${session.paid ? 'text-green-600' : 'text-amber-600'}`}>
                        {session.paid ? 'Paid' : 'Unpaid'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Unpaid Sessions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Unpaid Sessions</h2>
          {unpaidSessions.length === 0 ? (
            <p className="text-gray-500 italic">All sessions are paid up!</p>
          ) : (
            <div className="space-y-3">
              {unpaidSessions.slice(0, 5).map((session) => {
                const client = clients.find(c => c.id === session.clientId);
                const daysSince = Math.floor((new Date().getTime() - new Date(session.date).getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={session.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{client?.name || 'Unknown Client'}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(session.date).toLocaleDateString()} • {daysSince} days ago
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">${session.totalEarned.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{session.duration}hr</p>
                    </div>
                  </div>
                );
              })}
              {unpaidSessions.length > 5 && (
                <p className="text-sm text-gray-500 text-center pt-2">
                  and {unpaidSessions.length - 5} more unpaid sessions
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tax Preparation Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Home Office Deduction</h3>
            <p className="text-sm text-blue-700">
              Track the percentage of your home used exclusively for business. 
              Current expenses in utilities category will be multiplied by this percentage.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">Mileage Deduction</h3>
            <p className="text-sm text-green-700">
              For {currentYear}, the IRS standard mileage rate is $0.655 per mile. 
              Your current deductible mileage: {totalMileage.toLocaleString()} miles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;