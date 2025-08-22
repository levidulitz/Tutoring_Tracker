import React, { useState } from 'react';
import { Download, Calendar, DollarSign, TrendingUp, Car, Home, FileText } from 'lucide-react';
import { Client, Session, Expense } from '../App';

interface ReportsProps {
  clients: Client[];
  sessions: Session[];
  expenses: Expense[];
}

const Reports: React.FC<ReportsProps> = ({ clients, sessions, expenses }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Get available years
  const availableYears = Array.from(
    new Set([
      ...sessions.map(s => new Date(s.date).getFullYear()),
      ...expenses.map(e => new Date(e.date).getFullYear())
    ])
  ).sort((a, b) => b - a);

  if (availableYears.length === 0) {
    availableYears.push(new Date().getFullYear());
  }

  // Filter data by selected year
  const yearSessions = sessions.filter(s => new Date(s.date).getFullYear() === selectedYear);
  const yearExpenses = expenses.filter(e => new Date(e.date).getFullYear() === selectedYear);

  // Calculate totals
  const totalIncome = yearSessions.reduce((sum, session) => sum + session.totalEarned, 0);
  const totalDeductibleExpenses = yearExpenses.filter(e => e.deductible).reduce((sum, expense) => sum + expense.amount, 0);
  const totalMileage = yearSessions.filter(s => s.type === 'in-person').reduce((sum, session) => sum + (session.mileage || 0), 0);
  const mileageDeduction = totalMileage * 0.655; // 2024 IRS standard mileage rate
  const netIncome = totalIncome - totalDeductibleExpenses - mileageDeduction;

  // Expense breakdown by category
  const expenseByCategory = yearExpenses.reduce((acc, expense) => {
    if (expense.deductible) {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  // Client income breakdown
  const clientIncomeBreakdown = yearSessions.reduce((acc, session) => {
    const client = clients.find(c => c.id === session.clientId);
    const clientName = client?.name || 'Unknown Client';
    if (!acc[clientName]) {
      acc[clientName] = { income: 0, sessions: 0, hours: 0 };
    }
    acc[clientName].income += session.totalEarned;
    acc[clientName].sessions += 1;
    acc[clientName].hours += session.duration;
    return acc;
  }, {} as Record<string, { income: number; sessions: number; hours: number }>);

  // Monthly breakdown
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthSessions = yearSessions.filter(s => new Date(s.date).getMonth() === i);
    const monthExpenses = yearExpenses.filter(e => new Date(e.date).getMonth() === i && e.deductible);
    
    return {
      month: new Date(selectedYear, i, 1).toLocaleDateString('en-US', { month: 'short' }),
      income: monthSessions.reduce((sum, s) => sum + s.totalEarned, 0),
      expenses: monthExpenses.reduce((sum, e) => sum + e.amount, 0),
      sessions: monthSessions.length
    };
  });

  const generateCSVReport = () => {
    const csvData = [
      ['TutorTracker Tax Report - ' + selectedYear],
      [''],
      ['INCOME SUMMARY'],
      ['Total Gross Income', '$' + totalIncome.toFixed(2)],
      [''],
      ['EXPENSE SUMMARY'],
      ['Total Deductible Expenses', '$' + totalDeductibleExpenses.toFixed(2)],
      ['Business Mileage', totalMileage + ' miles'],
      ['Mileage Deduction (@ $0.655/mile)', '$' + mileageDeduction.toFixed(2)],
      [''],
      ['NET INCOME'],
      ['Estimated Net Income', '$' + netIncome.toFixed(2)],
      [''],
      ['DETAILED SESSIONS'],
      ['Date', 'Client', 'Hours', 'Rate', 'Amount', 'Type', 'Mileage', 'Paid'],
      ...yearSessions.map(session => {
        const client = clients.find(c => c.id === session.clientId);
        return [
          session.date,
          client?.name || 'Unknown',
          session.duration,
          '$' + session.rate,
          '$' + session.totalEarned.toFixed(2),
          session.type,
          session.mileage || 0,
          session.paid ? 'Yes' : 'No'
        ];
      }),
      [''],
      ['DETAILED EXPENSES'],
      ['Date', 'Category', 'Description', 'Amount', 'Deductible'],
      ...yearExpenses.map(expense => [
        expense.date,
        expense.category,
        expense.description,
        '$' + expense.amount.toFixed(2),
        expense.deductible ? 'Yes' : 'No'
      ])
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tutor-tax-report-${selectedYear}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tax Reports</h1>
          <p className="mt-2 text-gray-600">Generate tax-ready reports for your tutoring business</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button
            onClick={generateCSVReport}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-5 w-5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Key Tax Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Gross Income</p>
              <p className="text-2xl font-semibold text-gray-900">${totalIncome.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Deductible Expenses</p>
              <p className="text-2xl font-semibold text-gray-900">${totalDeductibleExpenses.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Car className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Mileage Deduction</p>
              <p className="text-2xl font-semibold text-gray-900">${mileageDeduction.toFixed(2)}</p>
              <p className="text-xs text-gray-500">{totalMileage.toLocaleString()} miles</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Est. Net Income</p>
              <p className="text-2xl font-semibold text-gray-900">${netIncome.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Income vs Expenses</h2>
        <div className="overflow-x-auto">
          <div className="flex items-end space-x-2 h-64 min-w-[600px]">
            {monthlyData.map((month, index) => {
              const maxAmount = Math.max(
                ...monthlyData.map(m => Math.max(m.income, m.expenses))
              );
              const incomeHeight = (month.income / maxAmount) * 200;
              const expenseHeight = (month.expenses / maxAmount) * 200;

              return (
                <div key={index} className="flex-1 flex flex-col items-center space-y-1">
                  <div className="w-full flex justify-center space-x-1" style={{ height: '200px' }}>
                    <div
                      className="bg-green-500 rounded-t w-4 flex items-end justify-center relative"
                      style={{ height: `${incomeHeight}px` }}
                      title={`Income: $${month.income.toFixed(2)}`}
                    >
                      {month.income > 0 && (
                        <span className="text-xs text-white mb-1 transform -rotate-90 whitespace-nowrap">
                          ${month.income.toFixed(0)}
                        </span>
                      )}
                    </div>
                    <div
                      className="bg-red-500 rounded-t w-4 flex items-end justify-center relative"
                      style={{ height: `${expenseHeight}px` }}
                      title={`Expenses: $${month.expenses.toFixed(2)}`}
                    >
                      {month.expenses > 0 && (
                        <span className="text-xs text-white mb-1 transform -rotate-90 whitespace-nowrap">
                          ${month.expenses.toFixed(0)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 text-center">
                    <div>{month.month}</div>
                    <div className="text-gray-400">{month.sessions} sessions</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Income</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600">Expenses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Client Income Breakdown */}
      {Object.keys(clientIncomeBreakdown).length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Income by Client</h2>
          <div className="space-y-3">
            {Object.entries(clientIncomeBreakdown)
              .sort(([,a], [,b]) => b.income - a.income)
              .map(([clientName, data]) => {
                const percentage = (data.income / totalIncome) * 100;
                return (
                  <div key={clientName} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-900">{clientName}</span>
                        <span className="text-sm text-gray-600">${data.income.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {data.sessions} sessions • {data.hours} hours • {percentage.toFixed(1)}% of income
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Tax Deduction Summary */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tax Deduction Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Business Expenses by Category</h3>
            <div className="space-y-2">
              {Object.entries(expenseByCategory)
                .sort(([,a], [,b]) => b - a)
                .map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 capitalize">{category.replace('-', ' ')}</span>
                    <span className="text-sm font-medium text-gray-900">${amount.toFixed(2)}</span>
                  </div>
                ))}
              {totalMileage > 0 && (
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="text-sm text-gray-600">Business Mileage</span>
                  <span className="text-sm font-medium text-gray-900">${mileageDeduction.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Tax Tips</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Keep all receipts and documentation</li>
              <li>• Home office deduction may apply if you use a dedicated space</li>
              <li>• Mileage is calculated at $0.655/mile for {selectedYear}</li>
              <li>• Professional development expenses are deductible</li>
              <li>• Consider quarterly estimated tax payments</li>
              <li>• Consult a tax professional for complex situations</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FileText className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="text-amber-900 font-medium mb-1">Important Tax Information</h3>
            <p className="text-amber-700 text-sm">
              This report provides an estimate based on your recorded data. Always consult with a qualified tax professional 
              for complete tax preparation and to ensure compliance with all applicable tax laws. Keep detailed records and 
              receipts for all business expenses and income.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;