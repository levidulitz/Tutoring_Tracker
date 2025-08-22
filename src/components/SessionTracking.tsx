import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Video, Car, Check, X, Calendar } from 'lucide-react';
import { Client, Session } from '../App';

interface SessionTrackingProps {
  clients: Client[];
  sessions: Session[];
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
}

const SessionTracking: React.FC<SessionTrackingProps> = ({ clients, sessions, setSessions }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [formData, setFormData] = useState({
    clientId: '',
    date: '',
    duration: '',
    rate: '',
    type: 'virtual' as 'virtual' | 'in-person',
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      clientId: '',
      date: '',
      duration: '',
      rate: '',
      type: 'virtual',
      notes: ''
    });
    setEditingSession(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const client = clients.find(c => c.id === formData.clientId);
    if (!client) return;

    const duration = parseFloat(formData.duration);
    const rate = parseFloat(formData.rate);
    const mileage = formData.type === 'in-person' ? client.distanceFromHome * 2 : 0; // Round trip

    const sessionData: Session = {
      id: editingSession?.id || Date.now().toString(),
      clientId: formData.clientId,
      date: formData.date,
      duration,
      rate,
      type: formData.type,
      mileage,
      totalEarned: duration * rate,
      paid: false,
      notes: formData.notes
    };

    if (editingSession) {
      setSessions(sessions.map(session => 
        session.id === editingSession.id ? sessionData : session
      ));
    } else {
      setSessions([...sessions, sessionData]);
    }

    resetForm();
  };

  const handleEdit = (session: Session) => {
    setFormData({
      clientId: session.clientId,
      date: session.date,
      duration: session.duration.toString(),
      rate: session.rate.toString(),
      type: session.type,
      notes: session.notes
    });
    setEditingSession(session);
    setShowForm(true);
  };

  const handleDelete = (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      setSessions(sessions.filter(session => session.id !== sessionId));
    }
  };

  const togglePaymentStatus = (sessionId: string) => {
    setSessions(sessions.map(session => 
      session.id === sessionId 
        ? { 
            ...session, 
            paid: !session.paid,
            paidDate: !session.paid ? new Date().toISOString().split('T')[0] : undefined
          } 
        : session
    ));
  };

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setFormData({
      ...formData,
      clientId,
      rate: client?.hourlyRate.toString() || ''
    });
  };

  // Sort sessions by date (most recent first)
  const sortedSessions = sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Session Tracking</h1>
          <p className="mt-2 text-gray-600">Track your tutoring sessions and payment status</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={clients.length === 0}
        >
          <Plus className="h-5 w-5" />
          <span>Log Session</span>
        </button>
      </div>

      {clients.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">You need to add at least one client before you can log sessions.</p>
        </div>
      )}

      {/* Session Form */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingSession ? 'Edit Session' : 'Log New Session'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                <select
                  required
                  value={formData.clientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours) *</label>
                <input
                  type="number"
                  step="0.25"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rate ($/hour) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Type *</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="virtual"
                      checked={formData.type === 'virtual'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'virtual' | 'in-person' })}
                      className="mr-2"
                    />
                    Virtual
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="in-person"
                      checked={formData.type === 'in-person'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'virtual' | 'in-person' })}
                      className="mr-2"
                    />
                    In-Person
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingSession ? 'Update Session' : 'Log Session'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {sortedSessions.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions logged yet</h3>
            <p className="text-gray-500 mb-4">Start tracking your tutoring sessions</p>
            {clients.length > 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Log Your First Session
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedSessions.map((session) => {
              const client = clients.find(c => c.id === session.clientId);
              return (
                <div key={session.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {client?.name || 'Unknown Client'}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {session.type === 'virtual' ? (
                            <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              <Video className="h-3 w-3" />
                              <span>Virtual</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              <Car className="h-3 w-3" />
                              <span>In-Person</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <div>Date: {new Date(session.date).toLocaleDateString()}</div>
                        <div>Duration: {session.duration} hours</div>
                        <div>Rate: ${session.rate}/hour</div>
                        {session.mileage && session.mileage > 0 && (
                          <div>Mileage: {session.mileage} miles</div>
                        )}
                      </div>
                      {session.notes && (
                        <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{session.notes}</p>
                      )}
                    </div>
                    <div className="ml-6 text-right">
                      <div className="text-2xl font-bold text-gray-900">${session.totalEarned.toFixed(2)}</div>
                      <div className="flex items-center justify-end space-x-2 mt-2">
                        <button
                          onClick={() => togglePaymentStatus(session.id)}
                          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            session.paid
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {session.paid ? (
                            <>
                              <Check className="h-4 w-4" />
                              <span>Paid</span>
                            </>
                          ) : (
                            <>
                              <X className="h-4 w-4" />
                              <span>Unpaid</span>
                            </>
                          )}
                        </button>
                      </div>
                      {session.paid && session.paidDate && (
                        <div className="text-xs text-gray-500 mt-1">
                          Paid: {new Date(session.paidDate).toLocaleDateString()}
                        </div>
                      )}
                      <div className="flex space-x-2 mt-4">
                        <button
                          onClick={() => handleEdit(session)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(session.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionTracking;