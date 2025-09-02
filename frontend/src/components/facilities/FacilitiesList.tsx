'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Facility } from '@/types';
import { Calendar, Users, Package, Star, MapPin, Clock, Zap } from 'lucide-react';

interface FacilitiesListProps {
  onBookFacility?: (facility: Facility) => void;
}

// Simple animated count-up component
const CountUpNumber = ({ value, duration = 800 }: { value: number; duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplayValue(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, duration]);

  return <span>{displayValue}</span>;
};


export default function FacilitiesList({ onBookFacility }: FacilitiesListProps) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'futsal' | 'badminton'>('all');

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      const facilitiesQuery = query(
        collection(db, 'facilities'),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(facilitiesQuery);
      const facilitiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Facility[];
      setFacilities(facilitiesData);
    } catch (error) {
      console.error('Error fetching facilities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFacilities =
    filter === 'all' ? facilities : facilities.filter(f => f.type === filter);

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

  const getGradient = (type: string) => {
    switch (type) {
      case 'futsal':
        return 'from-emerald-500 to-teal-600';
      case 'badminton':
        return 'from-purple-500 to-indigo-600';
      default:
        return 'from-orange-500 to-red-600';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-orange-400/40 animate-ping"></div>
          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-orange-500 to-red-600 rounded-full text-2xl font-black text-white shadow-lg">
            虎
          </div>
        </div>
        <p className="text-lg font-medium text-orange-600 animate-pulse">
          Loading facilities...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        {[
          { id: 'all', label: 'All Facilities', count: facilities.length },
          {
            id: 'futsal',
            label: 'Futsal',
            icon: '⚽',
            count: facilities.filter(f => f.type === 'futsal').length,
          },
          {
            id: 'badminton',
            label: 'Badminton',
            icon: '🏸',
            count: facilities.filter(f => f.type === 'badminton').length,
          },
        ].map(opt => (
          <button
            key={opt.id}
            onClick={() => setFilter(opt.id as any)}
            className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center space-x-2 ${
              filter === opt.id
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30'
                : 'bg-white/80 backdrop-blur-md border border-gray-200 text-gray-800 hover:border-orange-300 hover:text-orange-600'
            }`}
          >
            {opt.icon && <span>{opt.icon}</span>}
            <span>{opt.label}</span>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-black/10 text-xs font-semibold">
              <CountUpNumber value={opt.count} />
            </span>
          </button>
        ))}
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredFacilities.map(facility => (
          <div
            key={facility.id}
            className="group bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl hover:border-orange-400/50 transition-all duration-300 overflow-hidden"
          >
            {/* Image */}
            <div className="relative h-56 overflow-hidden">
              {facility.imageUrl ? (
                <img
                  src={facility.imageUrl}
                  alt={facility.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center text-6xl text-white bg-gradient-to-br ${getGradient(
                    facility.type
                  )} group-hover:scale-105 transition-transform duration-300`}
                >
                  {getFacilityIcon(facility.type)}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>

              {/* Type */}
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-gray-800 shadow">
                {facility.type.toUpperCase()}
              </div>

              {/* Price */}
              <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full text-xs font-bold shadow">
                <CountUpNumber value={facility.hourlyRate} />
                <span className="ml-1 text-[10px] font-medium">/hr</span>
              </div>

              {/* Rating */}
              <div className="absolute bottom-4 left-4 flex items-center space-x-1 bg-white/90 px-2 py-1 rounded-lg shadow">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span className="text-xs font-medium text-gray-800">4.8</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                {facility.name}
              </h3>
              <p className="text-gray-700 text-sm line-clamp-2 mb-4">
                {facility.description}
              </p>

              <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 mb-6">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-600" />
                  <span>{facility.capacity} people</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span>8AM - 10PM</span>
                </div>
                <div className="flex items-center space-x-2 col-span-2">
                  <Package className="w-4 h-4 text-gray-600" />
                  <span className="truncate">
                    {facility.equipment.slice(0, 2).join(', ')}
                    {facility.equipment.length > 2 &&
                      ` +${facility.equipment.length - 2}`}
                  </span>
                </div>
              </div>

              {/* Equipment tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {facility.equipment.slice(0, 3).map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg font-medium"
                  >
                    {item}
                  </span>
                ))}
                {facility.equipment.length > 3 && (
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">
                    +{facility.equipment.length - 3} more
                  </span>
                )}
              </div>

              {/* Action */}
              <button
                onClick={() => onBookFacility?.(facility)}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3 rounded-2xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Book Now</span>
                <Zap className="w-4 h-4 animate-pulse" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredFacilities.length === 0 && (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <MapPin className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            No facilities found
          </h3>
          <p className="text-gray-700 max-w-md mx-auto leading-relaxed">
            {filter === 'all'
              ? 'No facilities are currently available. Please check back later.'
              : `No ${filter} courts are currently available. Try browsing all facilities.`}
          </p>
          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="mt-6 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300"
            >
              View All Facilities
            </button>
          )}
        </div>
      )}
    </div>
  );
}
