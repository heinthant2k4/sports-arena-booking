'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Facility, Booking } from '@/types';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import FacilitiesList from '@/components/facilities/FacilitiesList';
import FacilitySeeder from '@/components/admin/FacilitySeeder';
import BookingModal from '@/components/booking/BookingModal';
import BookingsList from '@/components/booking/BookingsList';
import { Bell, User, LogOut, Calendar, MapPin, TrendingUp, Zap, Award, Crown, Trophy, Target, Star, Sparkles } from 'lucide-react';

export default function Home() {
  const { user, userProfile, logout, loading } = useAuth();
  const [showSignup, setShowSignup] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'facilities' | 'bookings' | 'admin'>('dashboard');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);

    // Scroll direction state for nav UX
    const [showNav, setShowNav] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
      const handleScroll = () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY < 80) {
          setShowNav(true);
        } else if (currentScrollY > lastScrollY.current) {
          setShowNav(false); // scrolling down
        } else {
          setShowNav(true); // scrolling up
        }
        lastScrollY.current = currentScrollY;
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

  const handleBookFacility = (facility: Facility) => {
    setSelectedFacility(facility);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = (newBooking: Booking) => {
    setUserBookings(prev => [newBooking, ...prev]);
    setActiveTab('bookings');
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedFacility(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <div className="w-full h-full bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <div className="text-4xl font-black text-white">虎</div>
            </div>
            <div className="absolute inset-0 border-4 border-orange-400/40 rounded-2xl animate-ping"></div>
          </div>
          <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-red-300 mb-2">
            Loading Sports Arena Booking System
          </h3>
          <p className="text-orange-200 text-lg">Preparing your elite experience...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-red-900 flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-12">
            <div className="w-32 h-32 mx-auto mb-8 relative">
              <div className="w-full h-full bg-gradient-to-br from-orange-500 via-red-600 to-amber-500 rounded-3xl flex items-center justify-center shadow-2xl">
                <div className="text-center space-y-1">
                  <div className="text-5xl font-black text-white">虎</div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-conic from-orange-400 via-red-400 to-amber-400 rounded-3xl opacity-40 blur-xl animate-spin" style={{animationDuration: '12s'}}></div>
            </div>
            
            <h1 className="text-6xl font-black tracking-tight leading-none mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-200 to-red-200">Sports Arena Booking</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">System</span>
            </h1>
            
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-orange-400 rounded-full"></div>
              <Star className="w-6 h-6 text-amber-400" />
              <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-orange-400 rounded-full"></div>
            </div>
            
            <p className="text-xl font-light text-orange-100 tracking-wide mb-2">Elite Sports Facility Management</p>
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-500/10 rounded-full border border-orange-400/20">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-amber-200 font-bold text-sm">PREMIUM ATHLETICS</span>
            </div>
          </div>
          
          {showSignup ? (
            <SignupForm onSwitchToLogin={() => setShowSignup(false)} />
          ) : (
            <LoginForm onSwitchToSignup={() => setShowSignup(true)} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-2xl shadow-xl border-b border-orange-100/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
                <div className="text-center">
                  <img src="/tiger.svg" alt="Asian Tiger Arena Logo" className="w-14 h-14" />
                </div>
              <div>
                <h1 className="text-2xl font-black">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Sports Arena Booking</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-amber-600 ml-1">System</span>
                </h1>
                <p className="text-xs font-bold text-slate-700 tracking-widest -mt-1">ELITE SPORTS HUB</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <button className="relative p-3 text-slate-500 hover:text-orange-600 transition-colors hover:bg-orange-50 rounded-2xl">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-black">3</span>
              </button>
              
              <div className="flex items-center space-x-3 bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-2xl">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-slate-900">{userProfile?.name}</p>
                  <p className="text-xs font-bold text-orange-600 uppercase">{userProfile?.role}</p>
                </div>
              </div>
              
              <button onClick={logout} className="flex items-center space-x-2 px-4 py-3 text-sm font-medium text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-colors">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav
        className={`bg-white/60 backdrop-blur-xl border-b border-orange-100/50 sticky top-20 z-40 transition-all duration-500 ${
          showNav ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ boxShadow: showNav ? '0 2px 16px rgba(255, 140, 0, 0.08)' : 'none' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Command Center', icon: TrendingUp },
              { id: 'facilities', label: 'Elite Arenas', icon: MapPin },
              { id: 'bookings', label: 'My Sessions', icon: Calendar },
              ...(userProfile?.role === 'admin' ? [{ id: 'admin', label: 'Tiger Control', icon: Crown }] : [])
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative flex items-center space-x-3 py-4 px-6 font-bold text-sm transition-all duration-300 rounded-2xl ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-orange-500 to-red-500 shadow-xl'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {isActive && <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-red-600 to-amber-600 rounded-3xl p-10 text-white shadow-2xl">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="max-w-3xl">
                  <div className="flex items-center space-x-4 mb-6">
                    <img src="/tiger.svg" alt="Asian Tiger Arena Logo" className="w-24 h-24" />
                    <div>
                      <h2 className="text-5xl font-black leading-tight">
                        Welcome back,
                        <span className="block text-amber-200">{userProfile?.name}!</span>
                      </h2>
                      <div className="flex items-center space-x-2 mt-2">
                        <Trophy className="w-5 h-5 text-amber-300" />
                        <span className="text-amber-200 font-bold">Elite Tiger Member</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-orange-100 text-xl mb-8 leading-relaxed">
                    Command your athletic excellence at Asian Tiger. Access world-class facilities and join the elite community.
                  </p>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={() => setActiveTab('facilities')}
                      className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/30 transition-all flex items-center space-x-3"
                    >
                      <Zap className="w-5 h-5" />
                      <span>Explore Elite Arenas</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('bookings')}
                      className="bg-emerald-500/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-500/30 transition-all flex items-center space-x-3"
                    >
                      <Target className="w-5 h-5" />
                      <span>My Sessions</span>
                    </button>
                  </div>
                </div>
                
                <div className="hidden xl:block w-40 h-40 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center">
                    <div className="text-6xl font-black text-white capitalize p-12">虎</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl flex items-center justify-center shadow-xl">
                    <Calendar className="w-10 h-10 text-white" />
                  </div>
                  <span className="text-4xl font-black text-blue-600">{userBookings.filter(b => b.status !== 'cancelled').length}</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Active Sessions</h3>
                <p className="text-slate-600 mb-4">Your current reservations</p>
                <button onClick={() => setActiveTab('bookings')} className="text-blue-600 font-bold hover:text-blue-700">
                  View all sessions →
                </button>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-xl">
                    <MapPin className="w-10 h-10 text-white" />
                  </div>
                  <span className="text-4xl font-black text-emerald-600">5</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Elite Arenas</h3>
                <p className="text-slate-600 mb-4">Premium facilities available</p>
                <button onClick={() => setActiveTab('facilities')} className="text-emerald-600 font-bold hover:text-emerald-700">
                  Book now →
                </button>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center shadow-xl">
                    <Award className="w-10 h-10 text-white" />
                  </div>
                  <span className="text-4xl font-black text-orange-600">{userBookings.length}</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Total Achievements</h3>
                <p className="text-slate-600 mb-4">All-time activity</p>
                <div className="text-orange-600 font-bold">
                  {userBookings.length > 5 ? '🏆 Elite Member!' : userBookings.length > 0 ? '⭐ Active Tiger!' : '🚀 Ready to start!'}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-slate-50 to-orange-50 border-b">
                <h3 className="text-2xl font-bold text-slate-900">Recent Tiger Sessions</h3>
              </div>
              <div className="p-8">
                {userBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <div className="text-2xl font-black text-orange-600">胜</div>
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-4">Ready for Your First Victory?</h4>
                    <p className="text-slate-700 mb-6">Join the elite athletes at Asian Tiger</p>
                    <button
                      onClick={() => setActiveTab('facilities')}
                      className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-lg transition-all"
                    >
                      🐅 Explore Tiger Arenas
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userBookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-orange-50/30 rounded-2xl hover:shadow-lg transition-all">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-black text-lg">{booking.facilityName?.charAt(0)}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-lg">{booking.facilityName}</h4>
                            <p className="text-slate-700">
                              {new Date(booking.startTime).toLocaleDateString()} at{' '}
                              {new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                        </div>
                        <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                          booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {booking.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                    {userBookings.length > 3 && (
                      <button onClick={() => setActiveTab('bookings')} className="w-full text-center text-orange-600 hover:text-orange-700 font-bold py-4 text-lg">
                        View All {userBookings.length} Tiger Sessions →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'facilities' && (
          <div>
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                <div className="text-2xl font-black text-white">虎</div>
              </div>
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 mb-2">
                Elite Tiger Arenas
              </h2>
              <p className="text-xl text-slate-600">World-class sports venues designed for champions</p>
            </div>
            <FacilitiesList onBookFacility={handleBookFacility} />
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 mb-2">
                My Tiger Sessions
              </h2>
              <p className="text-xl text-slate-600">Manage your elite facility reservations</p>
            </div>
            <BookingsList />
          </div>
        )}

        {activeTab === 'admin' && userProfile?.role === 'admin' && (
          <div>
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 mb-2">
                Asian Tiger Control Center
              </h2>
              <p className="text-xl text-slate-600">Elite system administration controls</p>
            </div>
            <FacilitySeeder />
          </div>
        )}
      </main>

      <BookingModal
        facility={selectedFacility}
        isOpen={showBookingModal}
        onClose={closeBookingModal}
        onBookingSuccess={handleBookingSuccess}
      />
    </div>
  );
}