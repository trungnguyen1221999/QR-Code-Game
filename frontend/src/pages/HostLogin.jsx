import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useState } from 'react';

export default function HostLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/host-setup');
  };

  return (
    <PageLayout back="/">
      <div className="pt-4">
        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

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

            <Button type="submit">Login</Button>

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
