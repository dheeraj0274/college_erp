import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authAPI } from '../../api/services';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
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

        {sent ? (
          <div className="text-center">
            <div className="h-12 w-12 rounded-full bg-success-50 dark:bg-success-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-success-500" />
            </div>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100">Check your email</h2>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-2">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 mt-6 hover:text-primary-700">
              <ArrowLeft className="h-4 w-4" /> Back to login
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">Forgot password?</h2>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Enter your email and we'll send you a reset link.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {error && (
                <div className="px-3 py-2 rounded-lg bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/20">
                  <p className="text-xs text-danger-600 dark:text-danger-400">{error}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@techverse.edu"
                    required
                    className="block w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-surface-300 dark:border-dark-700 bg-white dark:bg-dark-900 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full h-10 flex items-center justify-center rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-surface-500 dark:text-surface-400 mt-6 hover:text-surface-700 dark:hover:text-surface-200">
              <ArrowLeft className="h-4 w-4" /> Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
