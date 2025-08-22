import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { Client } from '../App';

interface ClientManagementProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
}

const ClientManagement: React.FC<ClientManagementProps> = ({ clients, setClients }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    hourlyRate: '',
    distanceFromHome: '',
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      hourlyRate: '',
      distanceFromHome: '',
      notes: ''
    });
    setEditingClient(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const clientData: Client = {
      id: editingClient?.id || Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      hourlyRate: parseFloat(formData.hourlyRate),
      distanceFromHome: parseFloat(formData.distanceFromHome),
      notes: formData.notes
    };

    if (editingClient) {
      setClients(clients.map(client => 
        client.id === editingClient.id ? clientData : client
      ));
    } else {
      setClients([...clients, clientData]);
    }

    resetForm();
  };

  const handleEdit = (client: Client) => {
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      hourlyRate: client.hourlyRate.toString(),
      distanceFromHome: client.distanceFromHome.toString(),
      notes: client.notes
    });
    setEditingClient(client);
    setShowForm(true);
  };

  const handleDelete = (clientId: string) => {
    if (confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      setClients(clients.filter(client => client.id !== clientId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="mt-2 text-gray-600">Manage your tutoring clients and their information</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Client Form */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingClient ? 'Edit Client' : 'Add New Client'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Distance from Home (miles)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.distanceFromHome}
                  onChange={(e) => setFormData({ ...formData, distanceFromHome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  {editingClient ? 'Update Client' : 'Add Client'}
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

      {/* Clients List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {clients.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first client</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Client
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {clients.map((client) => (
              <div key={client.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                    <div className="mt-2 space-y-1">
                      {client.email && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span className="text-sm">{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span className="text-sm">{client.phone}</span>
                        </div>
                      )}
                      {client.address && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{client.address}</span>
                        </div>
                      )}
                    </div>
                    {client.notes && (
                      <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{client.notes}</p>
                    )}
                  </div>
                  <div className="ml-6 text-right">
                    <div className="text-2xl font-bold text-gray-900">${client.hourlyRate}/hr</div>
                    {client.distanceFromHome > 0 && (
                      <div className="text-sm text-gray-500 mt-1">{client.distanceFromHome} miles away</div>
                    )}
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => handleEdit(client)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientManagement;