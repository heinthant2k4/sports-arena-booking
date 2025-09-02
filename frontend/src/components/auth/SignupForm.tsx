'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { SignupForm as SignupFormType } from '@/types';
import { Mail, Lock, Eye, EyeOff, User, Hash, Building2, UserCheck, Shield, Zap, Star, Sparkles, Crown } from 'lucide-react';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { signUp, loading } = useAuth();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupFormType>();
  
  const password = watch('password');

  const onSubmit = async (data: SignupFormType) => {
    try {
      setError('');
      await signUp(data.email, data.password, {
        name: data.name,
        studentId: data.studentId,
        department: data.department,
        role: data.role
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Premium Glass Card with Asian Tiger Design */}
      <div className="relative overflow-hidden">
        {/* Advanced Background Glow System */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-red-500/25 to-amber-500/20 rounded-3xl blur-xl animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-conic from-orange-400/10 via-red-400/15 to-amber-400/10 rounded-3xl blur-2xl animate-spin" style={{animationDuration: '20s'}}></div>
        
        {/* Main Glass Card */}
        <div className="relative bg-white/95 backdrop-blur-2xl shadow-2xl rounded-3xl p-8 border border-white/30 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-orange-500/10 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-radial from-red-500/8 to-transparent rounded-full blur-xl"></div>
          
          {/* Header with Asian Tiger Branding */}
          <div className="text-center mb-8 relative z-10">
            <div className="relative mb-6">
              {/* Asian Tiger Brand Symbol */}
              <div className="w-24 h-24 mx-auto mb-6 relative group">
                <div className="w-full h-full bg-gradient-to-br from-orange-500 via-red-600 to-amber-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/50 group-hover:shadow-3xl group-hover:shadow-orange-500/60 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3">
                  <div className="text-center space-y-1">
                    <div className="text-4xl font-black text-white drop-shadow-xl">虎</div>
                    <div className="text-xs font-bold text-orange-100 tracking-widest">TIGER</div>
                  </div>
                </div>
                
                {/* Multi-layer Glow Effects */}
                <div className="absolute inset-0 bg-gradient-conic from-orange-400 via-red-400 via-amber-400 to-orange-400 rounded-3xl opacity-30 blur-lg animate-spin group-hover:opacity-50 transition-opacity" style={{animationDuration: '8s'}}></div>
                <div className="absolute inset-2 bg-gradient-radial from-orange-300/20 via-red-300/15 to-transparent rounded-2xl blur-md animate-pulse"></div>
                <div className="absolute inset-4 bg-gradient-to-br from-amber-300/15 to-orange-300/15 rounded-xl blur-sm animate-ping" style={{animationDuration: '3s'}}></div>
                
                {/* Orbit Rings */}
                <div className="absolute -inset-6 border border-orange-400/20 rounded-full animate-spin opacity-0 group-hover:opacity-100 transition-opacity" style={{animationDuration: '12s'}}></div>
                <div className="absolute -inset-4 border border-red-400/15 rounded-full animate-spin animate-reverse opacity-0 group-hover:opacity-100 transition-opacity" style={{animationDuration: '10s'}}></div>
              </div>
            </div>
            
            {/* Premium Typography */}
            <div className="space-y-4 mb-6">
              <h2 className="text-3xl font-black">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 drop-shadow-lg">
                  Join the Elite
                </span>
              </h2>
              <p className="text-slate-600 font-medium text-lg">Become an Asian Tiger elite member</p>
              
              {/* Elite Status Badge */}
              <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-orange-50 via-red-50 to-amber-50 rounded-2xl border border-orange-200/50 shadow-lg shadow-orange-500/10">
                <Shield className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-black text-slate-700 tracking-wide">ELITE MEMBERSHIP REGISTRATION</span>
                <Crown className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>
          
          {/* Enhanced Error Display */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 via-orange-50 to-red-50 border-2 border-red-200/60 text-red-800 px-6 py-4 rounded-2xl mb-6 relative overflow-hidden shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-red-100/40 to-orange-100/40 animate-pulse"></div>
              <div className="relative flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30">
                  <span className="text-white font-black text-lg">!</span>
                </div>
                <div>
                  <p className="font-bold text-red-900 mb-1">Registration Error</p>
                  <p className="font-medium text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Enhanced Full Name Field */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide">
              Full Name
            </label>
            <div className={`relative transition-all duration-300 ${
              focusedField === 'name' ? 'transform scale-102' : ''
            }`}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <User className={`h-6 w-6 transition-all duration-200 ${
                  focusedField === 'name' ? 'text-orange-500 scale-110' : 'text-slate-400'
                }`} />
              </div>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                className={`block w-full pl-14 pr-4 py-4 border-2 rounded-2xl text-slate-900 placeholder-slate-500 font-medium transition-all duration-200 ${
                  focusedField === 'name'
                    ? 'border-orange-400 bg-gradient-to-r from-orange-50/50 to-red-50/50 shadow-lg shadow-orange-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                } focus:outline-none focus:ring-0`}
                placeholder="Enter your elite name"
              />
              {focusedField === 'name' && (
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-red-400/10 rounded-2xl blur animate-pulse pointer-events-none"></div>
              )}
            </div>
            {errors.name && (
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <p className="text-red-600 text-sm font-medium">{errors.name.message}</p>
              </div>
            )}
          </div>

          {/* Enhanced Email Field */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide">
              Email Address
            </label>
            <div className={`relative transition-all duration-300 ${
              focusedField === 'email' ? 'transform scale-102' : ''
            }`}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <Mail className={`h-6 w-6 transition-all duration-200 ${
                  focusedField === 'email' ? 'text-orange-500 scale-110' : 'text-slate-400'
                }`} />
              </div>
              <input
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address'
                  }
                })}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className={`block w-full pl-14 pr-4 py-4 border-2 rounded-2xl text-slate-900 placeholder-slate-500 font-medium transition-all duration-200 ${
                  focusedField === 'email'
                    ? 'border-orange-400 bg-gradient-to-r from-orange-50/50 to-red-50/50 shadow-lg shadow-orange-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                } focus:outline-none focus:ring-0`}
                placeholder="example@uit.edu.mm"
              />
              {focusedField === 'email' && (
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-red-400/10 rounded-2xl blur animate-pulse pointer-events-none"></div>
              )}
            </div>
            {errors.email && (
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <p className="text-red-600 text-sm font-medium">{errors.email.message}</p>
              </div>
            )}
          </div>

          {/* Student ID and Role - Side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide">
                Student ID
              </label>
              <div className={`relative transition-all duration-300 ${
                focusedField === 'studentId' ? 'transform scale-102' : ''
              }`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Hash className={`h-6 w-6 transition-all duration-200 ${
                    focusedField === 'studentId' ? 'text-orange-500 scale-110' : 'text-slate-400'
                  }`} />
                </div>
                <input
                  type="text"
                  {...register('studentId', { required: 'ID is required' })}
                  onFocus={() => setFocusedField('studentId')}
                  onBlur={() => setFocusedField(null)}
                  className={`block w-full pl-14 pr-4 py-4 border-2 rounded-2xl text-slate-900 placeholder-slate-500 font-medium transition-all duration-200 ${
                    focusedField === 'studentId'
                      ? 'border-orange-400 bg-gradient-to-r from-orange-50/50 to-red-50/50 shadow-lg shadow-orange-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  } focus:outline-none focus:ring-0`}
                  placeholder="UIT1234"
                />
                {focusedField === 'studentId' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-red-400/10 rounded-2xl blur animate-pulse pointer-events-none"></div>
                )}
              </div>
              {errors.studentId && (
                <div className="flex items-center space-x-2 mt-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <p className="text-red-600 text-sm font-medium">{errors.studentId.message}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide">
                Role
              </label>
              <div className={`relative transition-all duration-300 ${
                focusedField === 'role' ? 'transform scale-102' : ''
              }`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <UserCheck className={`h-6 w-6 transition-all duration-200 ${
                    focusedField === 'role' ? 'text-orange-500 scale-110' : 'text-slate-400'
                  }`} />
                </div>
                <select
                  {...register('role', { required: 'Role is required' })}
                  onFocus={() => setFocusedField('role')}
                  onBlur={() => setFocusedField(null)}
                  className={`block w-full pl-14 pr-4 py-4 border-2 rounded-2xl text-slate-900 font-medium transition-all duration-200 appearance-none ${
                    focusedField === 'role'
                      ? 'border-orange-400 bg-gradient-to-r from-orange-50/50 to-red-50/50 shadow-lg shadow-orange-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  } focus:outline-none focus:ring-0`}
                >
                  <option value="">Select status</option>
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                </select>
                {focusedField === 'role' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-red-400/10 rounded-2xl blur animate-pulse pointer-events-none"></div>
                )}
              </div>
              {errors.role && (
                <div className="flex items-center space-x-2 mt-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <p className="text-red-600 text-sm font-medium">{errors.role.message}</p>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Department Field */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide">
              Department
            </label>
            <div className={`relative transition-all duration-300 ${
              focusedField === 'department' ? 'transform scale-102' : ''
            }`}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <Building2 className={`h-6 w-6 transition-all duration-200 ${
                  focusedField === 'department' ? 'text-orange-500 scale-110' : 'text-slate-400'
                }`} />
              </div>
              <input
                type="text"
                {...register('department', { required: 'Department is required' })}
                onFocus={() => setFocusedField('department')}
                onBlur={() => setFocusedField(null)}
                className={`block w-full pl-14 pr-4 py-4 border-2 rounded-2xl text-slate-900 placeholder-slate-500 font-medium transition-all duration-200 ${
                  focusedField === 'department'
                    ? 'border-orange-400 bg-gradient-to-r from-orange-50/50 to-red-50/50 shadow-lg shadow-orange-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                } focus:outline-none focus:ring-0`}
                placeholder="e.g., Computer Science"
              />
              {focusedField === 'department' && (
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-red-400/10 rounded-2xl blur animate-pulse pointer-events-none"></div>
              )}
            </div>
            {errors.department && (
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <p className="text-red-600 text-sm font-medium">{errors.department.message}</p>
              </div>
            )}
          </div>

          {/* Enhanced Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide">
              Password
            </label>
            <div className={`relative transition-all duration-300 ${
              focusedField === 'password' ? 'transform scale-102' : ''
            }`}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <Lock className={`h-6 w-6 transition-all duration-200 ${
                  focusedField === 'password' ? 'text-orange-500 scale-110' : 'text-slate-400'
                }`} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className={`block w-full pl-14 pr-14 py-4 border-2 rounded-2xl text-slate-900 placeholder-slate-500 font-medium transition-all duration-200 ${
                  focusedField === 'password'
                    ? 'border-orange-400 bg-gradient-to-r from-orange-50/50 to-red-50/50 shadow-lg shadow-orange-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                } focus:outline-none focus:ring-0`}
                placeholder="Create elite password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center z-10"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-6 w-6 text-slate-400 hover:text-orange-500 transition-colors" />
                ) : (
                  <Eye className="h-6 w-6 text-slate-400 hover:text-orange-500 transition-colors" />
                )}
              </button>
              {focusedField === 'password' && (
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-red-400/10 rounded-2xl blur animate-pulse pointer-events-none"></div>
              )}
            </div>
            {errors.password && (
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <p className="text-red-600 text-sm font-medium">{errors.password.message}</p>
              </div>
            )}
          </div>

          {/* Enhanced Confirm Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide">
              Confirm Password
            </label>
            <div className={`relative transition-all duration-300 ${
              focusedField === 'confirmPassword' ? 'transform scale-102' : ''
            }`}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <Lock className={`h-6 w-6 transition-all duration-200 ${
                  focusedField === 'confirmPassword' ? 'text-orange-500 scale-110' : 'text-slate-400'
                }`} />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match'
                })}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                className={`block w-full pl-14 pr-14 py-4 border-2 rounded-2xl text-slate-900 placeholder-slate-500 font-medium transition-all duration-200 ${
                  focusedField === 'confirmPassword'
                    ? 'border-orange-400 bg-gradient-to-r from-orange-50/50 to-red-50/50 shadow-lg shadow-orange-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                } focus:outline-none focus:ring-0`}
                placeholder="Confirm elite password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center z-10"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-6 w-6 text-slate-400 hover:text-orange-500 transition-colors" />
                ) : (
                  <Eye className="h-6 w-6 text-slate-400 hover:text-orange-500 transition-colors" />
                )}
              </button>
              {focusedField === 'confirmPassword' && (
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-red-400/10 rounded-2xl blur animate-pulse pointer-events-none"></div>
              )}
            </div>
            {errors.confirmPassword && (
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <p className="text-red-600 text-sm font-medium">{errors.confirmPassword.message}</p>
              </div>
            )}
          </div>

          {/* Premium Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full relative overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 text-white py-4 px-6 rounded-2xl font-black text-lg shadow-xl shadow-orange-500/30 transition-all duration-300 ${
                loading 
                  ? 'opacity-70 cursor-not-allowed' 
                  : 'hover:shadow-2xl hover:shadow-orange-500/40 hover:scale-105 transform active:scale-95'
              }`}
            >
              {/* Button Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-500 blur"></div>
              
              <div className="relative flex items-center justify-center space-x-3">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span className="tracking-wide">Creating Elite Account...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-6 h-6 drop-shadow-lg" />
                    <span className="tracking-wide drop-shadow-lg">JOIN TIGER ELITE</span>
                    <Sparkles className="w-6 h-6 drop-shadow-lg" />
                  </>
                )}
              </div>
              
              {/* Shimmer Effect */}
              <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 animate-shimmer"></div>
            </button>
          </div>
        </form>

        {/* Advanced Footer */}
        <div className="mt-8 text-center relative">
          {/* Divider */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-slate-300 to-slate-300 rounded-full"></div>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
            <div className="w-20 h-0.5 bg-gradient-to-l from-transparent via-slate-300 to-slate-300 rounded-full"></div>
          </div>
          
          <div className="space-y-3">
            <p className="text-slate-600 font-medium">
              Already an elite member?
            </p>
            <button
              onClick={onSwitchToLogin}
              className="inline-flex items-center space-x-2 text-orange-600 hover:text-red-600 font-bold transition-all duration-200 hover:scale-105 transform group"
            >
              <Star className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="text-lg tracking-wide">Access Tiger Arena</span>
              <Star className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
            </button>
            
            {/* Elite Member Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-slate-100 to-orange-50 rounded-full border border-slate-200 mt-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-slate-600 tracking-widest uppercase">Secure Registration Portal</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}

export default SignupForm;