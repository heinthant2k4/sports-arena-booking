'use client';

import { useState } from 'react';
import { collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Facility } from '@/types';
import { 
  Plus, 
  Trash2, 
  Database, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Settings,
  Zap,
  Shield,
  Eye,
  DollarSign
} from 'lucide-react';

const sampleFacilities: Omit<Facility, 'id'>[] = [
  {
    name: 'Futsal Court A',
    type: 'futsal',
    capacity: 14,
    hourlyRate: 50,
    equipment: ['Goals', 'Balls', 'Bibs', 'Cones'],
    isActive: true,
    description: 'Premium indoor futsal court with artificial turf and proper lighting. Perfect for 5v5 matches.',
    imageUrl: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=500'
  },
  {
    name: 'Futsal Court B',
    type: 'futsal',
    capacity: 14,
    hourlyRate: 45,
    equipment: ['Goals', 'Balls', 'Bibs'],
    isActive: true,
    description: 'Standard futsal court suitable for training and casual games.',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500'
  },
  {
    name: 'Badminton Court 1',
    type: 'badminton',
    capacity: 4,
    hourlyRate: 25,
    equipment: ['Nets', 'Shuttlecocks', 'Rackets (rental available)'],
    isActive: true,
    description: 'Professional badminton court with wooden flooring and proper ventilation.',
    imageUrl: 'https://live.staticflickr.com/65535/54128674502_45c95315c9_o.jpg'
  },
  {
    name: 'Badminton Court 2',
    type: 'badminton',
    capacity: 4,
    hourlyRate: 25,
    equipment: ['Nets', 'Shuttlecocks'],
    isActive: true,
    description: 'Standard badminton court perfect for doubles matches and training.',
    imageUrl: 'https://bk.asia-city.com/sites/default/files/styles/og_fb/public/bad1.jpg?itok=tDbUEkgr'
  },
  {
    name: 'Badminton Court 3',
    type: 'badminton',
    capacity: 4,
    hourlyRate: 20,
    equipment: ['Nets', 'Shuttlecocks'],
    isActive: true,
    description: 'Budget-friendly badminton court for casual play and practice sessions.',
    imageUrl: 'https://www.agcled.com/static/blogimg/202210/badminton-indoor-court.jpg'
  }
];

function FacilitySeeder() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'warning' | 'error'>('success');
  const [showPreview, setShowPreview] = useState(false);

  const showMessage = (text: string, type: 'success' | 'warning' | 'error') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const seedFacilities = async () => {
    setLoading(true);
    try {
      // Check if facilities already exist
      const facilitiesSnapshot = await getDocs(collection(db, 'facilities'));
      if (!facilitiesSnapshot.empty) {
        showMessage('⚠️ Facilities already exist. Clear existing facilities first if you want to re-seed.', 'warning');
        setLoading(false);
        return;
      }

      // Add each facility with progress tracking
      let addedCount = 0;
      for (const facility of sampleFacilities) {
        await addDoc(collection(db, 'facilities'), {
          ...facility,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        addedCount++;
      }

      showMessage(`✅ Successfully added ${addedCount} premium facilities! System is ready for bookings.`, 'success');
    } catch (error: any) {
      showMessage(`❌ Error seeding facilities: ${error.message}`, 'error');
      console.error('Seeding error:', error);
    }
    setLoading(false);
  };

  const clearFacilities = async () => {
    const confirmed = confirm(
      '🚨 DANGER ZONE: This will permanently delete ALL facilities and may affect existing bookings. Are you absolutely sure?'
    );
    
    if (!confirmed) return;

    setLoading(true);
    try {
      const facilitiesSnapshot = await getDocs(collection(db, 'facilities'));
      const deletePromises = facilitiesSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);
      showMessage(`🗑️ All ${facilitiesSnapshot.docs.length} facilities have been permanently deleted.`, 'warning');
    } catch (error: any) {
      showMessage(`❌ Error clearing facilities: ${error.message}`, 'error');
    }
    setLoading(false);
  };

  const getFacilityGradient = (type: string) => {
    switch (type) {
      case 'futsal':
        return 'from-emerald-500 to-teal-600';
      case 'badminton':
        return 'from-purple-500 to-indigo-600';
      default:
        return 'from-blue-500 to-indigo-600';
    }
  };

  const getFacilityIcon = (type: string) => {
    switch (type) {
      case 'futsal':
        return '⚽';
      case 'badminton':
        return '🏸';
      default:
        return '🏟️';
    }
  };

  const getMessageConfig = () => {
    switch (messageType) {
      case 'success':
        return {
          bg: 'bg-emerald-50 border-emerald-200',
          text: 'text-emerald-800',
          icon: CheckCircle
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 border-amber-200',
          text: 'text-amber-800',
          icon: AlertTriangle
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          icon: AlertTriangle
        };
    }
  };

  const messageConfig = getMessageConfig();
  const MessageIcon = messageConfig.icon;

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Admin Control Panel</h2>
                  <p className="text-purple-100">Facility Management System</p>
                </div>
              </div>
              <p className="text-purple-100 text-lg max-w-2xl leading-relaxed">
                Manage your sports facility database with powerful admin tools. Add sample data, reset the system, 
                or monitor facility configurations.
              </p>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-10 rounded-2xl flex items-center justify-center">
              <Settings className="w-8 h-8 text-white animate-spin" style={{animationDuration: '8s'}} />
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute right-0 bottom-0 w-96 h-96 opacity-10">
          <div className="w-full h-full bg-gradient-to-tl from-white rounded-full transform translate-x-48 translate-y-48"></div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Seed Facilities Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                <Plus className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Add Sample Facilities</h3>
                <p className="text-gray-500">Initialize the system with premium facilities</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <Database className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-900">Facilities to add</span>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold">
                  {sampleFacilities.length} courts
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-900">Types included</span>
                </div>
                <div className="flex space-x-2">
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
                    2 Futsal
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                    3 Badminton
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={seedFacilities}
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 px-6 rounded-2xl font-semibold hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Adding Facilities...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Add Sample Facilities</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Danger Zone Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-red-100 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Danger Zone</h3>
                <p className="text-gray-500">Permanently delete all facilities</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900 mb-2">⚠️ Critical Warning</h4>
                  <ul className="text-sm text-red-800 space-y-1">
                    <li>• This action cannot be undone</li>
                    <li>• All facility data will be permanently lost</li>
                    <li>• Existing bookings may be affected</li>
                    <li>• Use only for testing or complete system reset</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={clearFacilities}
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-2xl font-semibold hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Clearing Database...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  <span>Clear All Facilities</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`${messageConfig.bg} border ${messageConfig.text} rounded-2xl p-6 flex items-start space-x-4`}>
          <MessageIcon className="w-6 h-6 mt-0.5" />
          <div>
            <p className="font-medium">{message}</p>
          </div>
        </div>
      )}

      {/* Preview Toggle */}
      <div className="flex items-center justify-center">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center space-x-3 px-6 py-3 bg-white border border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors"
        >
          <Eye className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-700">
            {showPreview ? 'Hide' : 'Preview'} Facilities Data
          </span>
          <div className={`transform transition-transform ${showPreview ? 'rotate-180' : ''}`}>
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </div>
        </button>
      </div>

      {/* Facilities Preview */}
      {showPreview && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Facility Data Preview</h3>
                <p className="text-gray-500">Sample facilities that will be added to the system</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sampleFacilities.map((facility, index) => (
                <div key={index} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getFacilityGradient(facility.type)} rounded-xl flex items-center justify-center text-lg`}>
                      {getFacilityIcon(facility.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{facility.name}</h4>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full uppercase font-medium">
                        {facility.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Capacity:</span>
                      <span className="font-medium">{facility.capacity} people</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Rate:</span>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-3 h-3 text-gray-400" />
                        <span className="font-medium">{facility.hourlyRate}/hour</span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-gray-500 text-xs">Equipment:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {facility.equipment.slice(0, 3).map((item, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            {item}
                          </span>
                        ))}
                        {facility.equipment.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            +{facility.equipment.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FacilitySeeder;