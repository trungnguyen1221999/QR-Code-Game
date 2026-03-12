import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function HostSignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', name: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/host-setup');
  };

  return (
    <PageLayout back="/host-login">
      <div className="pt-4">
        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div className="flex items-center gap-2">
              <User size={20} style={{ color: 'var(--color-primary)' }} />
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Sign Up</h2>
            </div>

            <Input
              placeholder="Enter username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
            />

            <Input
              placeholder="Enter your name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />

            <Input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />

            <Button type="submit">Sign Up</Button>

            <p className="text-center text-xs" style={{ color: 'var(--color-subtext)' }}>
              Already have an account?{' '}
              <Link to="/host-login" className="font-semibold" style={{ color: 'var(--color-blue)' }}>
                Login
              </Link>
            </p>

          </form>
        </Card>
      </div>
    </PageLayout>
  );
}
