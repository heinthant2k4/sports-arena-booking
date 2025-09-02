'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Facility, BookingForm, Booking } from '@/types';
import {
  X, Calendar, Clock, Users, DollarSign,
  CheckCircle, AlertCircle, Sparkles
} from 'lucide-react';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface BookingModalProps {
  facility: Facility | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00'
];

function BookingModal({ facility, isOpen, onClose, onBookingSuccess }: BookingModalProps) {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [step, setStep] = useState<'details' | 'summary'>('details');

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<BookingForm>();

  const watchedStartTime = watch('startTime');
  const watchedEndTime = watch('endTime');
  const watchedPurpose = watch('purpose');

  useEffect(() => {
    if (facility && selectedDate) fetchBookingsForDate();
  }, [facility, selectedDate]);

  useEffect(() => {
    if (facility) {
      setValue('facilityId', facility.id);
      setValue('date', selectedDate);
    }
  }, [facility, selectedDate, setValue]);

  const fetchBookingsForDate = async () => {
    if (!facility) return;
    try {
      const startOfDay = new Date(selectedDate);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('facilityId', '==', facility.id),
        where('status', 'in', ['confirmed', 'pending']),
        where('startTime', '>=', startOfDay),
        where('startTime', '<=', endOfDay)
      );

      const snapshot = await getDocs(bookingsQuery);
      const bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime.toDate(),
        endTime: doc.data().endTime.toDate(),
      })) as Booking[];

      setExistingBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const isTimeSlotAvailable = (timeSlot: string) => {
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const slotTime = setMinutes(setHours(new Date(selectedDate), hours), minutes);

    return !existingBookings.some(booking => {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      return slotTime >= bookingStart && slotTime < bookingEnd;
    });
  };

  const calculateDuration = () => {
    if (!watchedStartTime || !watchedEndTime) return 0;
    const [sh, sm] = watchedStartTime.split(':').map(Number);
    const [eh, em] = watchedEndTime.split(':').map(Number);
    return Math.max(0, ((eh * 60 + em) - (sh * 60 + sm)) / 60);
  };

  const calculateTotalCost = () => {
    const duration = calculateDuration();
    return facility ? duration * facility.hourlyRate : 0;
  };

  const onSubmit = async (data: BookingForm) => {
    if (!facility || !user || !userProfile) return;

    setLoading(true);
    try {
      const [sh, sm] = data.startTime.split(':').map(Number);
      const [eh, em] = data.endTime.split(':').map(Number);

      const startDateTime = setMinutes(setHours(new Date(data.date), sh), sm);
      const endDateTime = setMinutes(setHours(new Date(data.date), eh), em);

      // Double check availability
      const conflicts = existingBookings.filter(b => {
        const start = new Date(b.startTime);
        const end = new Date(b.endTime);
        return (
          (startDateTime >= start && startDateTime < end) ||
          (endDateTime > start && endDateTime <= end) ||
          (startDateTime <= start && endDateTime >= end)
        );
      });

      if (conflicts.length > 0) {
        alert('Time slot is no longer available. Please select a different time.');
        await fetchBookingsForDate();
        return;
      }

      const bookingData = {
        userId: user.uid,
        facilityId: facility.id,
        startTime: startDateTime,
        endTime: endDateTime,
        status: 'confirmed' as const,
        purpose: data.purpose || 'General use',
        createdAt: new Date(),
        updatedAt: new Date(),
        userName: userProfile.name,
        facilityName: facility.name,
        totalCost: calculateTotalCost()
      };

      const docRef = await addDoc(collection(db, 'bookings'), bookingData);

      const newBooking: Booking = { id: docRef.id, ...bookingData };

      onBookingSuccess(newBooking);
      reset();
      setStep('details');
      onClose();
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getNextAvailableDates = () => {
    return Array.from({ length: 14 }, (_, i) => {
      const date = addDays(new Date(), i);
      return {
        date: format(date, 'yyyy-MM-dd'),
        display: format(date, 'MMM dd'),
        dayName: format(date, 'EEE'),
        isToday: i === 0
      };
    });
  };

  const getFacilityGradient = (type: string) => {
    switch (type) {
      case 'futsal': return 'from-emerald-500 to-teal-600';
      case 'badminton': return 'from-purple-500 to-indigo-600';
      default: return 'from-blue-500 to-indigo-600';
    }
  };

  const canProceedToSummary = () => watchedStartTime && watchedEndTime && calculateDuration() > 0;

  if (!isOpen || !facility) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className={`relative bg-gradient-to-r ${getFacilityGradient(facility.type)} p-8 text-white`}>
              <div className="absolute inset-0 bg-black/30"></div>
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <span className="text-2xl">{facility.type === 'futsal' ? '⚽' : '🏸'}</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-1">{facility.name}</h2>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-white/95">
                      <span>{facility.type.toUpperCase()}</span>
                      <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{facility.hourlyRate}/hr</span>
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" />{facility.capacity} people</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Steps */}
            <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-center gap-8">
                <div className={`flex items-center gap-2 ${step === 'details' ? 'text-orange-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'details' ? 'bg-orange-600 text-white' : 'bg-gray-300'}`}>1</div>
                  <span className="font-semibold">Details</span>
                </div>
                <div className="w-16 h-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500"></div>
                <div className={`flex items-center gap-2 ${step === 'summary' ? 'text-orange-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'summary' ? 'bg-orange-600 text-white' : 'bg-gray-300'}`}>2</div>
                  <span className="font-semibold">Confirmation</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 max-h-[calc(90vh-260px)] overflow-y-auto">
              {step === 'details' ? (
                <form onSubmit={handleSubmit(() => setStep('summary'))} className="space-y-8">
                  {/* Date selection */}
                  <div>
                    <label className="block text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                      <Calendar className="w-5 h-5" /> Select Date
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                      {getNextAvailableDates().map(d => (
                        <button
                          key={d.date}
                          type="button"
                          onClick={() => { setSelectedDate(d.date); setValue('date', d.date); }}
                          className={`p-4 rounded-2xl border-2 transition-all ${
                            selectedDate === d.date
                              ? 'border-orange-500 bg-orange-50 shadow-md'
                              : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                          }`}
                        >
                          {d.isToday && <div className="w-2 h-2 bg-emerald-500 rounded-full mb-1 animate-pulse mx-auto"></div>}
                          <div className={`text-sm font-medium ${selectedDate === d.date ? 'text-orange-600' : 'text-gray-700'}`}>{d.dayName}</div>
                          <div className={`text-lg font-bold ${selectedDate === d.date ? 'text-orange-600' : 'text-gray-900'}`}>{d.display.split(' ')[1]}</div>
                          <div className="text-xs text-gray-600">{d.display.split(' ')[0]}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time slots */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {['Start Time', 'End Time'].map((label, idx) => (
                      <div key={label}>
                        <label className="block text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                          <Clock className="w-5 h-5" /> {label}
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {timeSlots.slice(idx, idx + 9).map(t => (
                            <button
                              key={t}
                              type="button"
                              disabled={idx === 0 ? !isTimeSlotAvailable(t) : false}
                              onClick={() => setValue(idx === 0 ? 'startTime' : 'endTime', t)}
                              className={`p-3 rounded-xl text-sm font-medium transition-all ${
                                (idx === 0 ? watchedStartTime : watchedEndTime) === t
                                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md'
                                  : 'bg-gray-50 text-gray-800 hover:bg-orange-50 border border-gray-200'
                              } ${idx === 0 && !isTimeSlotAvailable(t) ? 'opacity-40 cursor-not-allowed' : ''}`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Purpose */}
                  <div>
                    <label className="block text-lg font-bold mb-4 text-gray-900">Purpose (Optional)</label>
                    <textarea
                      {...register('purpose')}
                      rows={3}
                      className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-orange-500 text-gray-900"
                      placeholder="e.g., Training, Friendly Match..."
                    />
                  </div>

                  {/* Cost Preview */}
                  {canProceedToSummary() && (
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6 flex justify-between items-center shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Duration: {calculateDuration()} hrs</h4>
                          <p className="text-sm text-gray-700">{watchedStartTime} - {watchedEndTime}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">${calculateTotalCost()}</div>
                        <div className="text-xs text-gray-700">Rate: {facility.hourlyRate}/hr</div>
                      </div>
                    </div>
                  )}

                  {/* Existing bookings */}
                  {existingBookings.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                      <h4 className="font-semibold text-amber-900 mb-2">Existing bookings for {format(new Date(selectedDate), 'MMM dd')}</h4>
                      <ul className="space-y-1 text-sm text-amber-700">
                        {existingBookings.map(b => (
                          <li key={b.id} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                            {format(new Date(b.startTime), 'HH:mm')} - {format(new Date(b.endTime), 'HH:mm')} {b.userName && `(${b.userName})`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={onClose} className="flex-1 px-6 py-4 border rounded-2xl text-gray-900 font-medium hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={!canProceedToSummary()} className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 px-6 rounded-2xl font-bold hover:opacity-90 disabled:opacity-50">Continue →</button>
                  </div>
                </form>
              ) : (
                // Summary
                <div className="space-y-8">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Booking Summary</h3>
                    <p className="text-gray-800">Review your details before confirming</p>
                  </div>
                  <div className="bg-white/70 backdrop-blur rounded-2xl p-6 space-y-6 border shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm text-gray-700 font-medium">Facility</h4>
                        <p className="text-lg font-semibold text-gray-900">{facility.name}</p>
                      </div>
                      <div>
                        <h4 className="text-sm text-gray-700 font-medium">Date</h4>
                        <p className="text-lg font-semibold text-gray-900">{format(new Date(selectedDate), 'EEE, MMM dd yyyy')}</p>
                      </div>
                      <div>
                        <h4 className="text-sm text-gray-700 font-medium">Time</h4>
                        <p className="text-lg font-semibold text-gray-900">{watchedStartTime} - {watchedEndTime}</p>
                      </div>
                      <div>
                        <h4 className="text-sm text-gray-700 font-medium">Duration</h4>
                        <p className="text-lg font-semibold text-gray-900">{calculateDuration()} hrs</p>
                      </div>
                      <div>
                        <h4 className="text-sm text-gray-700 font-medium">Purpose</h4>
                        <p className="text-lg font-semibold text-gray-900">{watchedPurpose || 'General use'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm text-gray-700 font-medium">Total</h4>
                        <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">🐅 ${calculateTotalCost()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setStep('details')} className="flex-1 px-6 py-4 border rounded-2xl text-gray-900 font-medium hover:bg-gray-50">← Back</button>
                    <button
                      onClick={handleSubmit(onSubmit)}
                      disabled={loading}
                      className="flex-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 px-8 rounded-2xl font-bold hover:opacity-90 disabled:opacity-50"
                    >
                      {loading ? 'Confirming...' : `Confirm Booking - $${calculateTotalCost()}`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default BookingModal;
