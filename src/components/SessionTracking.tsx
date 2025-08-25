import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Video, Car, Check, X, Calendar, Download, Upload, CalendarDays } from 'lucide-react';
import { Client, Session } from '../App';

interface SessionTrackingProps {
  clients: Client[];
  sessions: Session[];
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
}

const SessionTracking: React.FC<SessionTrackingProps> = ({ clients, sessions, setSessions }) => {
  const [showForm, setShowForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCalendarImportModal, setShowCalendarImportModal] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [calendarPreview, setCalendarPreview] = useState<any[]>([]);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [formData, setFormData] = useState({
    clientId: '',
    date: '',
    duration: '',
    rate: '',
    type: 'virtual' as 'virtual' | 'in-person',
    notes: ''
  });

  const downloadTemplate = () => {
    const template = [
      ['Date', 'Client Name', 'Duration (hours)', 'Rate ($/hour)', 'Type', 'Paid', 'Notes'],
      ['2024-01-15', 'John Smith', '1.5', '50', 'virtual', 'yes', 'Math tutoring session'],
      ['2024-01-16', 'Jane Doe', '2', '45', 'in-person', 'no', 'Science homework help'],
      ['2024-01-17', 'Bob Johnson', '1', '60', 'virtual', 'yes', 'English essay review']
    ];
    
    const csv = template.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'session-import-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToCalendar = () => {
    const icsEvents = sessions.map(session => {
      const client = clients.find(c => c.id === session.clientId);
      const clientName = client?.name || 'Unknown Client';
      
      // Create start and end times (assuming 1-hour default if no duration)
      const sessionDate = new Date(session.date);
      const startTime = new Date(sessionDate);
      startTime.setHours(9, 0, 0, 0); // Default to 9 AM
      
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + session.duration);
      
      // Format dates for ICS (YYYYMMDDTHHMMSSZ)
      const formatICSDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      };
      
      const summary = `Tutoring Session - ${clientName}`;
      const description = [
        `Client: ${clientName}`,
        `Duration: ${session.duration} hours`,
        `Rate: $${session.rate}/hour`,
        `Total: $${session.totalEarned.toFixed(2)}`,
        `Type: ${session.type}`,
        `Payment Status: ${session.paid ? 'Paid' : 'Unpaid'}`,
        session.mileage ? `Mileage: ${session.mileage} miles` : '',
        session.notes ? `Notes: ${session.notes}` : ''
      ].filter(Boolean).join('\\n');
      
      const location = session.type === 'in-person' ? (client?.address || 'Client Location') : 'Virtual Session';
      
      return [
        'BEGIN:VEVENT',
        `DTSTART:${formatICSDate(startTime)}`,
        `DTEND:${formatICSDate(endTime)}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${location}`,
        `UID:tutor-session-${session.id}@tutortracker.app`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      ].join('\r\n');
    });
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TutorTracker//Tutoring Sessions//EN',
      'CALSCALE:GREGORIAN',
      ...icsEvents,
      'END:VCALENDAR'
    ].join('\r\n');
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tutoring-sessions-${new Date().getFullYear()}.ics`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const data = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = { _rowIndex: index + 2 }; // +2 because we skip header and 0-index
        
        headers.forEach((header, i) => {
          const value = values[i] || '';
          
          // Map common header variations
          if (header.toLowerCase().includes('date')) {
            row.date = value;
          } else if (header.toLowerCase().includes('client') || header.toLowerCase().includes('name')) {
            row.clientName = value;
          } else if (header.toLowerCase().includes('duration') || header.toLowerCase().includes('hours')) {
            row.duration = value;
          } else if (header.toLowerCase().includes('rate')) {
            row.rate = value;
          } else if (header.toLowerCase().includes('type')) {
            row.type = value.toLowerCase() === 'in-person' ? 'in-person' : 'virtual';
          } else if (header.toLowerCase().includes('paid')) {
            row.paid = value.toLowerCase() === 'yes' || value.toLowerCase() === 'true';
          } else if (header.toLowerCase().includes('notes')) {
            row.notes = value;
          }
        });
        
        // Find matching client
        const matchingClient = clients.find(c => 
          c.name.toLowerCase() === row.clientName?.toLowerCase()
        );
        row.client = matchingClient;
        row.clientId = matchingClient?.id;
        
        // Validate required fields
        row.errors = [];
        if (!row.date) row.errors.push('Date is required');
        if (!row.clientName) row.errors.push('Client name is required');
        if (!row.client) row.errors.push('Client not found - please add client first');
        if (!row.duration || isNaN(parseFloat(row.duration))) row.errors.push('Valid duration required');
        if (!row.rate || isNaN(parseFloat(row.rate))) row.errors.push('Valid rate required');
        
        return row;
      });
      
      setCsvData(data);
      setCsvPreview(data.slice(0, 10)); // Show first 10 rows
      setShowImportModal(true);
    };
    
    reader.readAsText(file);
  };

  const handleCalendarFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      let parsedEvents: any[] = [];

      if (file.name.toLowerCase().endsWith('.ics')) {
        // Parse ICS file
        parsedEvents = parseICSFile(text);
      } else if (file.name.toLowerCase().endsWith('.csv') || file.name.toLowerCase().endsWith('.xlsx')) {
        // Parse CSV export from calendar apps
        parsedEvents = parseCalendarCSV(text);
      }

      // Filter and process events that look like tutoring sessions
      const processedEvents = parsedEvents.map((event, index) => {
        const processed = {
          ...event,
          _rowIndex: index + 1,
          errors: [] as string[]
        };

        // Try to extract client name from title
        const titleMatch = event.title?.match(/(?:tutoring|session|lesson).*?(?:with|-)?\s*([a-zA-Z\s]+)/i);
        if (titleMatch) {
          processed.extractedClientName = titleMatch[1].trim();
        } else {
          processed.extractedClientName = event.title || '';
        }

        // Find matching client
        const matchingClient = clients.find(c => 
          c.name.toLowerCase().includes(processed.extractedClientName.toLowerCase()) ||
          processed.extractedClientName.toLowerCase().includes(c.name.toLowerCase())
        );
        processed.client = matchingClient;
        processed.clientId = matchingClient?.id;

        // Validate
        if (!event.date) processed.errors.push('Date is required');
        if (!processed.extractedClientName) processed.errors.push('Could not extract client name from title');
        if (!processed.client) processed.errors.push('Client not found - please add client first or adjust title');
        if (!event.duration || event.duration <= 0) processed.errors.push('Valid duration required');

        // Set defaults
        processed.rate = matchingClient?.hourlyRate || 50;
        processed.type = event.location?.toLowerCase().includes('virtual') || 
                        event.location?.toLowerCase().includes('zoom') || 
                        event.location?.toLowerCase().includes('online') ? 'virtual' : 'in-person';
        processed.paid = false;
        processed.notes = event.description || '';

        return processed;
      });

      setCalendarData(processedEvents);
      setCalendarPreview(processedEvents.slice(0, 10));
      setShowCalendarImportModal(true);
    };

    reader.readAsText(file);
  };

  const parseICSFile = (icsContent: string) => {
    const events: any[] = [];
    const lines = icsContent.split('\n').map(line => line.trim());
    
    let currentEvent: any = null;
    let inEvent = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line === 'BEGIN:VEVENT') {
        inEvent = true;
        currentEvent = {};
      } else if (line === 'END:VEVENT' && inEvent) {
        if (currentEvent) {
          // Calculate duration if we have start and end times
          if (currentEvent.dtstart && currentEvent.dtend) {
            const start = parseICSDate(currentEvent.dtstart);
            const end = parseICSDate(currentEvent.dtend);
            if (start && end) {
              currentEvent.duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
              currentEvent.date = start.toISOString().split('T')[0];
            }
          }
          events.push(currentEvent);
        }
        inEvent = false;
        currentEvent = null;
      } else if (inEvent && currentEvent) {
        if (line.startsWith('SUMMARY:')) {
          currentEvent.title = line.substring(8).replace(/\\n/g, ' ').replace(/\\,/g, ',');
        } else if (line.startsWith('DTSTART')) {
          currentEvent.dtstart = line.split(':')[1];
        } else if (line.startsWith('DTEND')) {
          currentEvent.dtend = line.split(':')[1];
        } else if (line.startsWith('LOCATION:')) {
          currentEvent.location = line.substring(9).replace(/\\n/g, ' ').replace(/\\,/g, ',');
        } else if (line.startsWith('DESCRIPTION:')) {
          currentEvent.description = line.substring(12).replace(/\\n/g, '\n').replace(/\\,/g, ',');
        }
      }
    }

    return events;
  };

  const parseICSDate = (icsDate: string) => {
    if (!icsDate) return null;
    
    // Handle different ICS date formats
    if (icsDate.includes('T')) {
      // Format: 20240115T090000Z or 20240115T090000
      const dateStr = icsDate.replace(/[TZ]/g, '');
      const year = parseInt(dateStr.substring(0, 4));
      const month = parseInt(dateStr.substring(4, 6)) - 1;
      const day = parseInt(dateStr.substring(6, 8));
      const hour = parseInt(dateStr.substring(8, 10)) || 0;
      const minute = parseInt(dateStr.substring(10, 12)) || 0;
      
      return new Date(year, month, day, hour, minute);
    } else {
      // Format: 20240115
      const year = parseInt(icsDate.substring(0, 4));
      const month = parseInt(icsDate.substring(4, 6)) - 1;
      const day = parseInt(icsDate.substring(6, 8));
      
      return new Date(year, month, day);
    }
  };

  const parseCalendarCSV = (csvContent: string) => {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const event: any = {};
      
      headers.forEach((header, i) => {
        const value = values[i] || '';
        
        if (header.includes('subject') || header.includes('title') || header.includes('summary')) {
          event.title = value;
        } else if (header.includes('start') && header.includes('date')) {
          event.date = value;
        } else if (header.includes('start') && header.includes('time')) {
          event.startTime = value;
        } else if (header.includes('end') && header.includes('time')) {
          event.endTime = value;
        } else if (header.includes('duration')) {
          event.duration = parseFloat(value) || 1;
        } else if (header.includes('location')) {
          event.location = value;
        } else if (header.includes('description') || header.includes('notes')) {
          event.description = value;
        }
      });

      // Calculate duration if we have start and end times but no duration
      if (!event.duration && event.startTime && event.endTime) {
        const start = new Date(`${event.date} ${event.startTime}`);
        const end = new Date(`${event.date} ${event.endTime}`);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          event.duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        }
      }

      // Default duration if still not set
      if (!event.duration) {
        event.duration = 1;
      }

      return event;
    });
  };

  const importCalendarSessions = () => {
    const validRows = calendarData.filter(row => row.errors.length === 0);
    
    const newSessions: Session[] = validRows.map(row => {
      const client = row.client;
      const duration = row.duration;
      const rate = row.rate;
      const mileage = row.type === 'in-person' ? (client?.distanceFromHome || 0) * 2 : 0;
      
      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        clientId: row.clientId,
        date: row.date,
        duration,
        rate,
        type: row.type,
        mileage,
        totalEarned: duration * rate,
        paid: row.paid || false,
        paidDate: row.paid ? new Date().toISOString().split('T')[0] : undefined,
        notes: row.notes || ''
      };
    });
    
    setSessions([...sessions, ...newSessions]);
    setShowCalendarImportModal(false);
    setCalendarData([]);
    setCalendarPreview([]);
    
    alert(`Successfully imported ${newSessions.length} sessions from calendar!`);
  };

  const importSessions = () => {
    const validRows = csvData.filter(row => row.errors.length === 0);
    
    const newSessions: Session[] = validRows.map(row => {
      const client = row.client;
      const duration = parseFloat(row.duration);
      const rate = parseFloat(row.rate);
      const mileage = row.type === 'in-person' ? (client?.distanceFromHome || 0) * 2 : 0;
      
      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        clientId: row.clientId,
        date: row.date,
        duration,
        rate,
        type: row.type,
        mileage,
        totalEarned: duration * rate,
        paid: row.paid || false,
        paidDate: row.paid ? new Date().toISOString().split('T')[0] : undefined,
        notes: row.notes || ''
      };
    });
    
    setSessions([...sessions, ...newSessions]);
    setShowImportModal(false);
    setCsvData([]);
    setCsvPreview([]);
    
    alert(`Successfully imported ${newSessions.length} sessions!`);
  };

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
        <div className="flex space-x-3">
          <button
            onClick={downloadTemplate}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-5 w-5" />
            <span>Download Template</span>
          </button>
          <label className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors cursor-pointer">
            <Calendar className="h-5 w-5" />
            <span>Import Calendar</span>
            <input
              type="file"
              accept=".ics,.csv,.xlsx"
              onChange={handleCalendarFileUpload}
              className="hidden"
            />
          </label>
          <button
            onClick={exportToCalendar}
            disabled={sessions.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <CalendarDays className="h-5 w-5" />
            <span>Export Calendar</span>
          </button>
          <label className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
            <Upload className="h-5 w-5" />
            <span>Import CSV</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={clients.length === 0}
          >
            <Plus className="h-5 w-5" />
            <span>Log Session</span>
          </button>
        </div>
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

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Import Sessions from CSV</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Preview of your data ({csvData.length} rows total, showing first 10):
              </p>
              
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Row</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {csvPreview.map((row, index) => (
                      <tr key={index} className={row.errors.length > 0 ? 'bg-red-50' : ''}>
                        <td className="px-3 py-2 text-sm text-gray-900">{row._rowIndex}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{row.date}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {row.clientName}
                          {!row.client && row.clientName && (
                            <span className="ml-1 text-red-500">❌</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900">{row.duration}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{row.rate}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{row.type}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{row.paid ? 'Yes' : 'No'}</td>
                        <td className="px-3 py-2 text-sm">
                          {row.errors.length === 0 ? (
                            <span className="text-green-600">✓ Valid</span>
                          ) : (
                            <div className="text-red-600">
                              <div>❌ Errors:</div>
                              <ul className="text-xs mt-1">
                                {row.errors.map((error: string, i: number) => (
                                  <li key={i}>• {error}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Import Summary</h3>
              <div className="text-sm text-blue-700">
                <div>Total rows: {csvData.length}</div>
                <div>Valid rows: {csvData.filter(row => row.errors.length === 0).length}</div>
                <div>Rows with errors: {csvData.filter(row => row.errors.length > 0).length}</div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={importSessions}
                disabled={csvData.filter(row => row.errors.length === 0).length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Import {csvData.filter(row => row.errors.length === 0).length} Valid Sessions
              </button>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setCsvData([]);
                  setCsvPreview([]);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Import Modal */}
      {showCalendarImportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Import Sessions from Calendar</h2>
            
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Supported Formats</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>ICS files:</strong> From Google Calendar, Outlook, Apple Calendar (File → Export)</li>
                <li>• <strong>CSV files:</strong> Calendar exports with columns like Subject, Start Date, Start Time, End Time</li>
                <li>• <strong>Excel files:</strong> Saved as CSV from calendar applications</li>
              </ul>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Preview of detected sessions ({calendarData.length} events total, showing first 10):
              </p>
              
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Extracted Client</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Matched Client</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {calendarPreview.map((event, index) => (
                      <tr key={index} className={event.errors.length > 0 ? 'bg-red-50' : ''}>
                        <td className="px-3 py-2 text-sm text-gray-900 max-w-xs truncate" title={event.title}>
                          {event.title}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900">{event.date}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{event.extractedClientName}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {event.client ? (
                            <span className="text-green-600">{event.client.name} ✓</span>
                          ) : (
                            <span className="text-red-600">Not found ❌</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900">{event.duration}h</td>
                        <td className="px-3 py-2 text-sm text-gray-900">${event.rate}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{event.type}</td>
                        <td className="px-3 py-2 text-sm">
                          {event.errors.length === 0 ? (
                            <span className="text-green-600">✓ Valid</span>
                          ) : (
                            <div className="text-red-600">
                              <div>❌ Errors:</div>
                              <ul className="text-xs mt-1">
                                {event.errors.map((error: string, i: number) => (
                                  <li key={i}>• {error}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="mb-4 p-4 bg-amber-50 rounded-lg">
              <h3 className="font-medium text-amber-900 mb-2">Import Tips</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Event titles should contain "tutoring", "session", or "lesson" for best detection</li>
                <li>• Client names should match existing clients in your system</li>
                <li>• Virtual sessions are detected by location keywords like "Zoom", "Virtual", "Online"</li>
                <li>• Rates default to client's hourly rate or $50 if not found</li>
                <li>• All imported sessions are marked as unpaid initially</li>
              </ul>
            </div>
            
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Import Summary</h3>
              <div className="text-sm text-blue-700">
                <div>Total events: {calendarData.length}</div>
                <div>Valid sessions: {calendarData.filter(event => event.errors.length === 0).length}</div>
                <div>Events with errors: {calendarData.filter(event => event.errors.length > 0).length}</div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={importCalendarSessions}
                disabled={calendarData.filter(event => event.errors.length === 0).length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Import {calendarData.filter(event => event.errors.length === 0).length} Valid Sessions
              </button>
              <button
                onClick={() => {
                  setShowCalendarImportModal(false);
                  setCalendarData([]);
                  setCalendarPreview([]);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
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