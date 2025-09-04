'use client';

import { useState, useEffect, Fragment } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Booking } from '@/types';
import { format, isAfter, isBefore, addHours } from 'date-fns';
import {
  Calendar,
  Clock,
  MapPin,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlayCircle,
  DollarSign,
  Filter,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* -------------------------------------------------------
 * Tiny utilities
 * ----------------------------------------------------- */
const cn = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(' ');

/* -------------------------------------------------------
 * CountUpNumber — animated numbers for stats/costs
 * ----------------------------------------------------- */
const CountUpNumber = ({ value, duration = 600 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const animate = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setCount(Math.round(value * p));
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span>{count}</span>;
};

/* -------------------------------------------------------
 * ConfirmCancelModal — custom premium modal
 * ----------------------------------------------------- */
function ConfirmCancelModal({
  open,
  onClose,
  onConfirm,
  facilityName,
  dateLabel,
  timeLabel,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  facilityName?: string;
  dateLabel?: string;
  timeLabel?: string;
  loading?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white/90 backdrop-blur-xl border border-white/60 shadow-[0_20px_60px_-10px_rgba(255,115,0,0.35)]"
            initial={{ y: 50, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 50, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="relative p-6 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 text-white">
              <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
              <div className="relative flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight">Cancel Booking?</h3>
                  <p className="text-white/90 text-sm font-medium">
                    This action cannot be undone and frees the time slot for others.
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Facility</p>
                    <p className="text-sm font-bold text-slate-900">{facilityName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</p>
                    <p className="text-sm font-bold text-slate-900">{dateLabel || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Time</p>
                    <p className="text-sm font-bold text-slate-900">{timeLabel || '—'}</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                You can cancel up to <span className="font-semibold text-slate-800">2 hours</span> before the session
                start. If you’re sure, confirm below.
              </p>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-5 py-3 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={cn(
                  'flex-1 px-5 py-3 rounded-2xl font-extrabold text-white transition-all shadow-lg',
                  'bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 hover:brightness-110',
                  loading && 'opacity-60 cursor-not-allowed'
                )}
              >
                {loading ? 'Cancelling…' : 'Confirm Cancel'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------
 * Main Component — BookingsList
 * ----------------------------------------------------- */
export default function BookingsList() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('upcoming');

  // cancel modal state
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (user) fetchUserBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchUserBookings = async () => {
    if (!user) return;
    try {
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('userId', '==', user.uid),
        orderBy('startTime', 'desc')
      );
      const snapshot = await getDocs(bookingsQuery);
      const bookingsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime.toDate(),
        endTime: doc.data().endTime.toDate(),
        createdAt: doc.data().createdAt?.toDate?.() ?? new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() ?? new Date(),
      })) as Booking[];
      setBookings(bookingsData);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const requestCancel = (bookingId: string) => setPendingCancelId(bookingId);
  const closeCancelModal = () => setPendingCancelId(null);

  const confirmCancel = async () => {
    if (!pendingCancelId) return;
    const booking = bookings.find((b) => b.id === pendingCancelId);
    if (!booking) return;

    // Check 2-hour rule
    const now = new Date();
    if (isAfter(addHours(now, 2), new Date(booking.startTime))) {
      closeCancelModal();
      alert('Cannot cancel less than 2 hours before start time.');
      return;
    }

    setCancelLoading(true);
    try {
      await updateDoc(doc(db, 'bookings', pendingCancelId), {
        status: 'cancelled',
        updatedAt: new Date(),
      });
      setBookings((prev) =>
        prev.map((b) => (b.id === pendingCancelId ? { ...b, status: 'cancelled', updatedAt: new Date() } : b))
      );
      closeCancelModal();
    } catch (err) {
      console.error('Cancel failed:', err);
      alert('Failed to cancel booking.');
    } finally {
      setCancelLoading(false);
    }
  };

  const getFilteredBookings = () => {
    const now = new Date();
    switch (filter) {
      case 'upcoming':
        return bookings.filter((b) => b.status !== 'cancelled' && isAfter(new Date(b.startTime), now));
      case 'past':
        return bookings.filter((b) => isBefore(new Date(b.endTime), now) && b.status !== 'cancelled');
      case 'cancelled':
        return bookings.filter((b) => b.status === 'cancelled');
      default:
        return bookings;
    }
  };

  const getStatusConfig = (status: string, start: Date, end: Date) => {
    const now = new Date();
    if (status === 'cancelled')
      return { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, text: 'Cancelled' };
    if (isBefore(end, now))
      return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: CheckCircle, text: 'Completed' };
    if (isAfter(start, now) && isBefore(now, end))
      return { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: PlayCircle, text: 'In Progress' };
    if (isAfter(start, now))
      return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: AlertCircle, text: 'Upcoming' };
    return { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: CheckCircle, text: status };
  };

  const canCancelBooking = (booking: Booking) => {
    if (booking.status === 'cancelled') return false;
    const now = new Date();
    return isBefore(addHours(now, 2), new Date(booking.startTime));
    // (Only allows cancel if we're still > 2 hours away)
  };

  const getFacilityGradient = (name: string) => {
    if (name?.toLowerCase().includes('futsal')) return 'from-emerald-500 to-teal-600';
    if (name?.toLowerCase().includes('badminton')) return 'from-purple-500 to-indigo-600';
    return 'from-orange-500 to-red-600';
  };
  const getFacilityIcon = (name: string) => {
    if (name?.toLowerCase().includes('futsal')) return '⚽';
    if (name?.toLowerCase().includes('badminton')) return '🏸';
    return '🏟️';
  };

  const filtered = getFilteredBookings();

  const filterStats = [
    {
      key: 'upcoming',
      label: 'Upcoming',
      count: bookings.filter((b) => b.status !== 'cancelled' && isAfter(new Date(b.startTime), new Date())).length,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      key: 'past',
      label: 'Past',
      count: bookings.filter((b) => isBefore(new Date(b.endTime), new Date()) && b.status !== 'cancelled').length,
      color: 'from-gray-500 to-gray-600',
    },
    {
      key: 'cancelled',
      label: 'Cancelled',
      count: bookings.filter((b) => b.status === 'cancelled').length,
      color: 'from-red-500 to-red-600',
    },
    { key: 'all', label: 'All', count: bookings.length, color: 'from-purple-500 to-indigo-600' },
  ] as const;

  /* -------------------------------------------------------
   * Loading State
   * ----------------------------------------------------- */
  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600 mx-auto" />
            <div className="absolute inset-0 h-12 w-12 border-t-2 border-b-2 border-orange-300 mx-auto animate-ping rounded-full" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 mb-1">Fetching your Tiger sessions…</h3>
          <p className="text-slate-600">Polishing your elite experience 🐅</p>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------
   * Main UI
   * ----------------------------------------------------- */
  return (
    <Fragment>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Filter className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">My Tiger Sessions</h3>
              <p className="text-sm text-slate-600">Filter and manage your elite facility bookings</p>
            </div>
          </div>
          <button
            onClick={fetchUserBookings}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-700">Refresh</span>
          </button>
        </div>

        {/* Filter Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {filterStats.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as any)}
                className={cn(
                  'relative p-6 rounded-2xl text-left border-2 transition-all duration-300 group',
                  active
                    ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-red-50 shadow-[0_10px_30px_-10px_rgba(255,115,0,0.25)]'
                    : 'border-slate-200 bg-white hover:border-orange-200 hover:shadow-lg'
                )}
              >
                {/* shimmer */}
                {active && (
                  <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 -skew-x-12 transition-opacity" />
                )}
                <div className="flex items-center justify-between mb-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r', f.color)}>
                    <span className="text-white font-extrabold text-lg">
                      <CountUpNumber value={f.count} />
                    </span>
                  </div>
                  {active && <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />}
                </div>
                <h4 className="font-extrabold text-slate-900">{f.label}</h4>
                <p className={cn('text-sm', active ? 'text-orange-700' : 'text-slate-500')}>
                  {f.count} booking{f.count !== 1 ? 's' : ''}
                </p>
              </button>
            );
          })}
        </div>

        {/* Empty State */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <span className="text-5xl text-white">🐅</span>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
              {filter === 'upcoming' && 'No upcoming bookings'}
              {filter === 'past' && 'No past bookings'}
              {filter === 'cancelled' && 'No cancelled bookings'}
              {filter === 'all' && 'No bookings yet'}
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              {filter === 'all' || filter === 'upcoming'
                ? 'Explore Tiger Arenas and reserve your elite session today.'
                : `No ${filter} bookings found.`}
            </p>
            <button className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-2xl font-extrabold hover:brightness-110 transition-all shadow-lg">
              <Sparkles className="w-5 h-5" />
              Browse Facilities
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => {
              const status = getStatusConfig(booking.status, new Date(booking.startTime), new Date(booking.endTime));
              const Icon = status.icon;

              const dateLabel = `${format(new Date(booking.startTime), 'MMM dd, yyyy')} • ${format(
                new Date(booking.startTime),
                'EEEE'
              )}`;
              const timeLabel = `${format(new Date(booking.startTime), 'HH:mm')} - ${format(
                new Date(booking.endTime),
                'HH:mm'
              )}`;

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group bg-white/80 backdrop-blur rounded-3xl border border-white/60 shadow-[0_10px_30px_-15px_rgba(2,6,23,0.2)] hover:shadow-[0_20px_50px_-20px_rgba(255,115,0,0.35)] hover:-translate-y-0.5 transition-all"
                >
                  <div className="p-6 space-y-6">
                    {/* Header row */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            'w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-lg bg-gradient-to-br',
                            getFacilityGradient(booking.facilityName || '')
                          )}
                        >
                          {getFacilityIcon(booking.facilityName || '')}
                        </div>
                        <div>
                          <h3 className="text-xl font-extrabold text-slate-900 mb-1 group-hover:text-orange-600 transition-colors">
                            {booking.facilityName || 'Unknown Facility'}
                          </h3>
                          <span
                            className={cn(
                              'inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border',
                              status.color
                            )}
                          >
                            <Icon className="w-3 h-3 mr-1.5" />
                            {status.text}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      {canCancelBooking(booking) && (
                        <button
                          onClick={() => requestCancel(booking.id)}
                          className="p-3 rounded-2xl bg-red-50 text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all font-bold"
                          title="Cancel booking"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-blue-700" />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Date</p>
                          <p className="font-extrabold text-slate-900">{format(new Date(booking.startTime), 'MMM dd, yyyy')}</p>
                          <p className="text-xs text-slate-500">{format(new Date(booking.startTime), 'EEEE')}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                          <Clock className="w-5 h-5 text-emerald-700" />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Time</p>
                          <p className="font-extrabold text-slate-900">{timeLabel}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-purple-700" />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Purpose</p>
                          <p className="font-extrabold text-slate-900">{booking.purpose || 'General use'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-amber-700" />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Total</p>
                          <p className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
                            MMK {booking.totalCost ?? 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Cancelled banner */}
                    {booking.status === 'cancelled' && (
                      <div className="mt-1 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <p className="text-sm text-red-800">
                          Cancelled on {format(new Date(booking.updatedAt), "MMM dd, yyyy 'at' HH:mm")}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Custom Cancel Confirmation Modal */}
      <ConfirmCancelModal
        open={!!pendingCancelId}
        onClose={closeCancelModal}
        onConfirm={confirmCancel}
        loading={cancelLoading}
        facilityName={
          bookings.find((b) => b.id === pendingCancelId)?.facilityName || undefined
        }
        dateLabel={
          pendingCancelId
            ? format(new Date(bookings.find((b) => b.id === pendingCancelId)!.startTime), 'MMM dd, yyyy')
            : undefined
        }
        timeLabel={
          pendingCancelId
            ? `${format(new Date(bookings.find((b) => b.id === pendingCancelId)!.startTime), 'HH:mm')} - ${format(
                new Date(bookings.find((b) => b.id === pendingCancelId)!.endTime),
                'HH:mm'
              )}`
            : undefined
        }
      />
    </Fragment>
  );
}
