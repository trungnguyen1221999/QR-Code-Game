import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { User } from 'lucide-react';
import toast from 'react-hot-toast';
import PageLayout from '../components/ui/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { hostAPI } from '../utils/api';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function HostLogin({ onLogin }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  if (localStorage.getItem('host')) return <Navigate to="/host-setup" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      toast.error(t.pleaseFillAllFields);
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
      toast.success(t.loginSuccessful);
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
              <img
                src="/hi.gif.gif"
                alt={t.loginAlt}
                style={{ height: '180px', objectFit: 'contain' }}
              />
            </div>

            <div className="flex items-center gap-2">
              <User size={20} style={{ color: 'var(--color-primary)' }} />
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                {t.loginTitle}
              </h2>
            </div>

            <Input
              placeholder={t.enterUsername}
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
            />

            <Input
              type="password"
              placeholder={t.enterYourPassword}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />

            <Button type="submit" disabled={loading}>
              {loading ? t.loggingIn : t.login}
            </Button>

            <p className="text-center text-xs" style={{ color: 'var(--color-subtext)' }}>
              {t.createNewAccount}{' '}
              <Link to="/host-signup" className="font-semibold" style={{ color: 'var(--color-blue)' }}>
                {t.signUp}
              </Link>
            </p>

          </form>
        </Card>
      </div>
    </PageLayout>
  );
}