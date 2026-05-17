import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { authAPI } from '../../api/services';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authAPI.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-dark-950 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="h-10 w-10 rounded-xl bg-primary-600 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-semibold text-surface-900 dark:text-surface-100">TechVerse</span>
            <span className="text-xs text-surface-500 block">University ERP</span>
          </div>
        </div>

        {success ? (
          <div className="text-center">
            <div className="h-12 w-12 rounded-full bg-success-50 dark:bg-success-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-success-500" />
            </div>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100">Password reset!</h2>
            <p className="text-sm text-surface-500 mt-2">Redirecting to login...</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">Reset password</h2>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Enter your new password below.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {error && (
                <div className="px-3 py-2 rounded-lg bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/20">
                  <p className="text-xs text-danger-600 dark:text-danger-400">{error}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">New password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="block w-full pl-9 pr-10 py-2 text-sm rounded-lg border border-surface-300 dark:border-dark-700 bg-white dark:bg-dark-900 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required className="block w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-surface-300 dark:border-dark-700 bg-white dark:bg-dark-900 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full h-10 flex items-center justify-center rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
