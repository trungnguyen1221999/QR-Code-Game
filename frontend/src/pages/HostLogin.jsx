import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { User } from 'lucide-react';
import toast from 'react-hot-toast';
import PageLayout from '../components/ui/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { hostAPI } from '../utils/api';

export default function HostLogin({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  if (localStorage.getItem('host')) return <Navigate to="/host-setup" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const data = await hostAPI.login({
        username: form.username.trim(),
        password: form.password,
      });
      localStorage.setItem('host', JSON.stringify(data.host));
      onLogin?.();
      toast.success('Login successful!');
      navigate('/host-setup');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout back="/">
      <div className="pt-4">
        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Login GIF */}
            <div className="flex justify-center">
              <img src="/login.gif" alt="Login" style={{ height: '120px', objectFit: 'contain' }} />
            </div>

            <div className="flex items-center gap-2">
              <User size={20} style={{ color: 'var(--color-primary)' }} />
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Login</h2>
            </div>

            <Input
              placeholder="Enter username or gmail"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
            />

            <Input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />

            <Button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>

            <p className="text-center text-xs" style={{ color: 'var(--color-subtext)' }}>
              Create new account?{' '}
              <Link to="/host-signup" className="font-semibold" style={{ color: 'var(--color-blue)' }}>
                SignUp
              </Link>
            </p>

          </form>
        </Card>
      </div>
    </PageLayout>
  );
}
