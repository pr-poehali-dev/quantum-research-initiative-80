import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ phone: '', password: '', name: '', email: '' });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    let res;
    if (mode === 'login') {
      res = await login(form.phone, form.password);
    } else {
      res = await register({ phone: form.phone, password: form.password, name: form.name, email: form.email });
    }
    setLoading(false);
    if (res.error) setError(res.error);
    else navigate('/cabinet');
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="https://cdn.poehali.dev/projects/a8bd7bfa-3b7e-44c0-9d5a-054cd12af7a0/bucket/d679b5c0-eee1-45f3-ae4c-ac3289cdf0ec.png"
            alt="iPro"
            className="h-14 mx-auto mb-6"
          />
          <h1 className="text-2xl font-heading mb-2">
            {mode === 'login' ? 'Вход в личный кабинет' : 'Регистрация'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {mode === 'login' ? 'Войдите, чтобы отслеживать заказы и получать бонусы' : 'Создайте аккаунт для программы лояльности'}
          </p>
        </div>

        <div className="ipro-card p-6 md:p-8">
          {/* Mode switcher */}
          <div className="flex rounded-xl overflow-hidden border border-border mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${mode === 'login' ? 'ipro-gradient text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Войти
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${mode === 'register' ? 'ipro-gradient text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Зарегистрироваться
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium mb-1.5">Ваше имя</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="Иван Иванов"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5">Телефон</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="+7 (999) 123-45-67"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Пароль</label>
              <input
                type="password"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="Минимум 6 символов"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium mb-1.5">Email (необязательно)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="ivan@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 px-4 py-3 rounded-xl">
                <Icon name="AlertCircle" size={16} />
                {error}
              </div>
            )}

            <Button type="submit" size="lg" disabled={loading} className="w-full ipro-gradient text-white border-0 text-base gap-2">
              {loading
                ? <><Icon name="Loader2" size={18} className="animate-spin" />Загрузка...</>
                : mode === 'login'
                  ? <><Icon name="LogIn" size={18} />Войти</>
                  : <><Icon name="UserPlus" size={18} />Зарегистрироваться</>
              }
            </Button>
          </form>

          {mode === 'login' && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              Нет аккаунта?{' '}
              <button onClick={() => setMode('register')} className="text-primary hover:underline font-medium">
                Создать
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
