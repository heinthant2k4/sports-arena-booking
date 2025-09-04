'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Facility } from '@/types';
import {
  Plus,
  Trash2,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Settings,
  Shield,
  Eye,
  DollarSign,
  X,
  Sparkles,
  Loader2,
} from 'lucide-react';

// --- Sample Data (kept close to your original, lightly curated) ---
const sampleFacilities: Omit<Facility, 'id'>[] = [
  {
    name: 'Futsal Court A',
    type: 'futsal',
    capacity: 14,
    hourlyRate: 50000,
    equipment: ['Goals', 'Balls', 'Bibs', 'Cones'],
    isActive: true,
    description:
      'Premium indoor futsal court with artificial turf and pro lighting. Perfect for 5v5 matches.',
    imageUrl: 'https://source.unsplash.com/800x600/?futsal,court,indoor',
  },
  {
    name: 'Futsal Court B',
    type: 'futsal',
    capacity: 14,
    hourlyRate: 45000,
    equipment: ['Goals', 'Balls', 'Bibs'],
    isActive: true,
    description: 'Standard futsal court suitable for training and casual games.',
    imageUrl: 'https://source.unsplash.com/800x600/?futsal,stadium',
  },
  {
    name: 'Badminton Court 1',
    type: 'badminton',
    capacity: 4,
    hourlyRate: 25000,
    equipment: ['Nets', 'Shuttlecocks', 'Rackets (rental available)'],
    isActive: true,
    description: 'Professional badminton court with wooden flooring and ventilation.',
    imageUrl: 'https://source.unsplash.com/800x600/?badminton,court,indoor',
  },
  {
    name: 'Badminton Court 2',
    type: 'badminton',
    capacity: 4,
    hourlyRate: 25000,
    equipment: ['Nets', 'Shuttlecocks'],
    isActive: true,
    description: 'Standard badminton court perfect for doubles and training.',
    imageUrl: 'https://source.unsplash.com/800x600/?badminton,shuttlecock',
  },
  {
    name: 'Badminton Court 3',
    type: 'badminton',
    capacity: 4,
    hourlyRate: 20000,
    equipment: ['Nets', 'Shuttlecocks'],
    isActive: true,
    description: 'Budget-friendly badminton court for casual play and practice.',
    imageUrl: 'https://source.unsplash.com/800x600/?badminton,sports-hall',
  },
];

// --- Helpers for theme ---
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

// --- Toast component ---
function Toast({
  variant,
  message,
  onClose,
}: {
  variant: 'success' | 'warning' | 'error';
  message: string;
  onClose: () => void;
}) {
  const styles = useMemo(() => {
    switch (variant) {
      case 'success':
        return {
          wrap: 'bg-emerald-50/95 border-emerald-200 text-emerald-900',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
        };
      case 'warning':
        return {
          wrap: 'bg-amber-50/95 border-amber-200 text-amber-900',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
        };
      case 'error':
      default:
        return {
          wrap: 'bg-red-50/95 border-red-200 text-red-900',
          icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
        };
    }
  }, [variant]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]">
      <div
        className={`max-w-xl w-[92vw] sm:w-[520px] border rounded-2xl shadow-xl backdrop-blur-md px-4 py-3 flex items-start gap-3 ${styles.wrap}`}
      >
        <div className="mt-0.5">{styles.icon}</div>
        <p className="text-sm leading-6">{message}</p>
        <button
          onClick={onClose}
          className="ml-auto p-1 rounded-lg hover:bg-black/5"
          aria-label="Close"
        >
          <X className="w-4 h-4 opacity-60" />
        </button>
      </div>
    </div>
  );
}

// --- Confirm Modal ---
function ConfirmModal({
  open,
  title = 'Are you absolutely sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  const confirmClasses =
    variant === 'danger'
      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      {/* Modal */}
      <div className="relative w-full max-w-lg">
        <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
          {/* Accent top */}
          <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-red-500 to-amber-500" />
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white shadow-lg">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-extrabold text-slate-900">{title}</h3>
                {description ? (
                  <p className="mt-1.5 text-slate-600 text-sm leading-6">{description}</p>
                ) : null}
              </div>
              <button
                onClick={onCancel}
                className="p-2 rounded-xl hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-3 rounded-2xl font-semibold border-2 border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`px-5 py-3 rounded-2xl font-semibold text-white transition-all ${confirmClasses} disabled:opacity-60`}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing…
                  </span>
                ) : (
                  confirmLabel
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---
function FacilitySeeder() {
  const [loading, setLoading] = useState(false);
  const [seedProgress, setSeedProgress] = useState(0);
  const [toast, setToast] = useState<{
    text: string;
    type: 'success' | 'warning' | 'error';
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Derived stats
  const futsalCount = sampleFacilities.filter((f) => f.type === 'futsal').length;
  const badmintonCount = sampleFacilities.filter((f) => f.type === 'badminton').length;

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const showMessage = (text: string, type: 'success' | 'warning' | 'error') => {
    setToast({ text, type });
  };

  const seedFacilities = async () => {
    setLoading(true);
    setSeedProgress(0);
    try {
      // Check existence first
      const snapshot = await getDocs(collection(db, 'facilities'));
      if (!snapshot.empty) {
        showMessage(
          '⚠️ Facilities already exist. Clear existing facilities first if you want to re-seed.',
          'warning'
        );
        setLoading(false);
        return;
      }

      let added = 0;
      for (const f of sampleFacilities) {
        await addDoc(collection(db, 'facilities'), {
          ...f,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        added++;
        setSeedProgress(Math.round((added / sampleFacilities.length) * 100));
      }

      showMessage(
        `✅ Successfully added ${added} premium facilities! System is ready for bookings.`,
        'success'
      );
    } catch (err: any) {
      showMessage(`❌ Error seeding facilities: ${err?.message || 'Unknown error'}`, 'error');
      // eslint-disable-next-line no-console
      console.error('Seeding error:', err);
    } finally {
      setLoading(false);
      setTimeout(() => setSeedProgress(0), 800);
    }
  };

  const clearFacilities = async () => {
    setConfirmOpen(false);
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'facilities'));
      const total = snapshot.docs.length;
      await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
      showMessage(`🗑️ Deleted ${total} facilities.`, 'warning');
    } catch (err: any) {
      showMessage(`❌ Error clearing facilities: ${err?.message || 'Unknown error'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Premium Tiger Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/30 bg-white/95 backdrop-blur-2xl shadow-2xl">
        {/* glow layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/15 via-red-500/20 to-amber-500/15 blur-xl" />
        <div
          className="absolute inset-0 bg-gradient-conic from-orange-400/10 via-red-400/15 to-amber-400/10 blur-2xl"
          style={{ animation: 'spin 20s linear infinite' } as any}
        />
        <div className="relative p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-xl">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-red-600 to-amber-600">
                    Admin Control Panel
                  </span>
                </h2>
                <p className="text-slate-600 font-medium">
                  Facility Management • Elite Tiger System
                </p>
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Settings className="w-7 h-7 text-slate-900 animate-spin" style={{ animationDuration: '10s' }} />
            </div>
          </div>

          <p className="mt-6 text-slate-700 leading-relaxed">
            Add premium sample facilities, reset your database safely, and preview what will be seeded.
          </p>

          {/* Tiny stats */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100">
              <Database className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-semibold text-slate-800">
                {sampleFacilities.length} total facilities
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
              <span className="text-lg">⚽</span>
              <span className="text-sm font-semibold text-slate-800">{futsalCount} Futsal</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100">
              <span className="text-lg">🏸</span>
              <span className="text-sm font-semibold text-slate-800">{badmintonCount} Badminton</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Seed Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <Plus className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Add Sample Facilities</h3>
                <p className="text-slate-500">Initialize with premium arenas instantly.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-slate-500" />
                  <span className="font-medium text-slate-900">Facilities to add</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold">
                  {sampleFacilities.length}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-slate-500" />
                  <span className="font-medium text-slate-900">Types included</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-semibold">
                    {futsalCount} Futsal
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700 text-xs font-semibold">
                    {badmintonCount} Badminton
                  </span>
                </div>
              </div>

              {/* Progress (visible while seeding) */}
              {loading && seedProgress > 0 && (
                <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50">
                  <div className="flex items-center justify-between text-sm font-medium text-emerald-800 mb-2">
                    <span>Seeding in progress…</span>
                    <span>{seedProgress}%</span>
                  </div>
                  <div className="h-2 rounded-xl bg-emerald-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all"
                      style={{ width: `${seedProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={seedFacilities}
              disabled={loading}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-2xl font-extrabold text-white py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Adding Facilities…
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add Sample Facilities
                </>
              )}
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="relative overflow-hidden rounded-3xl border border-red-100 bg-white shadow-lg">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                <Trash2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Danger Zone</h3>
                <p className="text-slate-500">Permanently delete all facilities.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-900 mb-1">Critical Warning</h4>
                  <ul className="text-sm text-red-800 space-y-1">
                    <li>• This action cannot be undone</li>
                    <li>• All facility data will be permanently lost</li>
                    <li>• Existing bookings may be affected</li>
                    <li>• Use only for testing or complete reset</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={() => setConfirmOpen(true)}
              disabled={loading}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-2xl font-extrabold text-white py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Clearing Database…
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Clear All Facilities
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Toggle */}
      <div className="flex items-center justify-center">
        <button
          onClick={() => setShowPreview((s) => !s)}
          className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <Eye className="w-5 h-5 text-slate-600" />
          <span className="font-semibold text-slate-800">
            {showPreview ? 'Hide' : 'Preview'} Facilities Data
          </span>
          <RefreshCw
            className={`w-4 h-4 text-slate-400 transition-transform ${showPreview ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Facilities Preview Grid */}
      {showPreview && (
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Facility Data Preview</h3>
                <p className="text-slate-600 text-sm">
                  Sample facilities that will be added to the system.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleFacilities.map((facility, i) => (
                <div
                  key={`${facility.name}-${i}`}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white hover:shadow-xl transition-shadow"
                >
                  {/* Image */}
                  <div className="relative h-44 w-full overflow-hidden">
                    {facility.imageUrl ? (
                      // Using <img> for simplicity with remote images
                      <img
                        src={facility.imageUrl}
                        alt={facility.name}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div
                        className={`h-full w-full flex items-center justify-center text-5xl text-white bg-gradient-to-br ${getFacilityGradient(
                          facility.type
                        )}`}
                      >
                        {getFacilityIcon(facility.type)}
                      </div>
                    )}
                    {/* type badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full text-slate-800">
                        {facility.type}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getFacilityGradient(
                          facility.type
                        )} flex items-center justify-center text-lg text-white`}
                      >
                        {getFacilityIcon(facility.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900">{facility.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1">{facility.description}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Capacity</span>
                        <span className="font-semibold text-slate-900">{facility.capacity} people</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Rate</span>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-slate-400" />
                          <span className="font-semibold text-slate-900">{facility.hourlyRate}/hr</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Equipment</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {facility.equipment.slice(0, 3).map((item, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium"
                            >
                              {item}
                            </span>
                          ))}
                          {facility.equipment.length > 3 && (
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium">
                              +{facility.equipment.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r ${getFacilityGradient(
                          facility.type
                        )}`}
                      >
                        {facility.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Note */}
            <p className="mt-6 text-xs text-slate-500">
              Images are mock photos from Unsplash Source and may change on refresh.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast variant={toast.type} message={toast.text} onClose={() => setToast(null)} />
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmOpen}
        title="Delete ALL facilities?"
        description="This will permanently remove all facilities from Firestore. Bookings referencing these facilities may break. Proceed only if you understand the consequences."
        confirmLabel="Yes, delete everything"
        cancelLabel="No, keep data"
        variant="danger"
        loading={loading}
        onConfirm={clearFacilities}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

export default FacilitySeeder;
