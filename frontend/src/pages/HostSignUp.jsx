import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import toast from 'react-hot-toast';
import PageLayout from '../components/ui/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { hostAPI } from '../utils/api';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function HostSignUp({ onLogin }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [form, setForm] = useState({ username: '', name: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.name.trim() || !form.password.trim()) {
      toast.error(t.pleaseFillAllFields);
      return;
    }
    setLoading(true);
    try {
      const data = await hostAPI.register({
        username: form.username.trim(),
        name: form.name.trim(),
        password: form.password,
      });
      localStorage.setItem('host', JSON.stringify(data.host));
      onLogin?.();
      toast.success(t.accountCreated);
      navigate('/host-setup');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout back="/host-login">
      <div className="pt-4">
        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Signup GIF */}
            <div className="flex justify-center">
              <img src="/sign.gif" alt={t.signUpAlt} style={{ height: '180px', objectFit: 'contain' }} />
            </div>

            <div className="flex items-center gap-2">
              <User size={20} style={{ color: 'var(--color-primary)' }} />
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{t.signUpTitle}</h2>
            </div>

            <Input
              placeholder={t.enterUsername}
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
            />

            <Input
              placeholder={t.enterYourName}
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />

            <Input
              type="password"
              placeholder={t.enterYourPassword}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />

            <Button type="submit" disabled={loading}>
              {loading ? t.creatingAccount : t.signUp}
            </Button>

            <p className="text-center text-xs" style={{ color: 'var(--color-subtext)' }}>
              {t.alreadyHaveAccount}{' '}
              <Link to="/host-login" className="font-semibold" style={{ color: 'var(--color-blue)' }}>
                {t.login}
              </Link>
            </p>

          </form>
        </Card>
      </div>
    </PageLayout>
  );
}