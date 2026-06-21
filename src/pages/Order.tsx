import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useCity } from '@/context/CityContext';

interface Category { id: number; name: string; slug: string; }
interface Model { id: number; name: string; }
interface RepairType { id: number; name: string; }

export default function Order() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedCity } = useCity();

  const [categories, setCategories] = useState<Category[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [repairTypes, setRepairTypes] = useState<RepairType[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [bonusUsed, setBonusUsed] = useState(0);

  const [form, setForm] = useState({
    client_name: user?.name || '',
    client_phone: user?.phone || '',
    device_category: searchParams.get('device') || '',
    device_model: searchParams.get('model') || '',
    repair_type: searchParams.get('repair') || '',
    description: '',
  });

  useEffect(() => {
    api.categories().then(r => { if (r.categories) setCategories(r.categories); });
  }, []);

  useEffect(() => {
    if (!form.device_category) return;
    api.models(form.device_category).then(r => { if (r.models) setModels(r.models); });
    const cat = categories.find(c => c.slug === form.device_category);
    if (cat) api.repairTypes(cat.id).then(r => { if (r.repair_types) setRepairTypes(r.repair_types); });
  }, [form.device_category, categories]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_phone || !form.device_category) {
      setError('Укажите телефон и тип устройства');
      return;
    }
    setLoading(true);
    setError('');
    const res = await api.createOrder({
      ...form,
      bonus_used: bonusUsed,
      city_id: selectedCity?.id || 1,
    });
    setLoading(false);
    if (res.error) setError(res.error);
    else setSuccess(res.order_number);
  };

  if (success) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 rounded-full ipro-gradient flex items-center justify-center mx-auto mb-6">
            <Icon name="CheckCircle2" size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-heading mb-3">Заявка принята!</h2>
          <p className="text-muted-foreground mb-2">Номер вашей заявки:</p>
          <div className="text-3xl font-display text-primary mb-4">{success}</div>
          <p className="text-sm text-muted-foreground mb-8">
            Мы свяжемся с вами в ближайшее время для уточнения деталей. Сохраните номер заявки для отслеживания статуса.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/')}>На главную</Button>
            <Button className="ipro-gradient text-white border-0" onClick={() => navigate('/prices')}>Другой ремонт</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10">
      <div className="container max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-heading mb-3">Оставить заявку</h1>
          <p className="text-muted-foreground">Заполните форму, и мы свяжемся с вами в течение 15 минут</p>
        </div>

        <form onSubmit={handleSubmit} className="ipro-card p-6 md:p-8 space-y-5">
          {/* Client info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Ваше имя</label>
              <input
                type="text"
                value={form.client_name}
                onChange={e => set('client_name', e.target.value)}
                placeholder="Иван Иванов"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Телефон *</label>
              <input
                type="tel"
                value={form.client_phone}
                onChange={e => set('client_phone', e.target.value)}
                placeholder="+7 (999) 123-45-67"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Device */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Тип устройства *</label>
            <select
              value={form.device_category}
              onChange={e => { set('device_category', e.target.value); set('device_model', ''); set('repair_type', ''); }}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Выберите устройство</option>
              {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </div>

          {/* Model */}
          {models.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Модель</label>
              <select
                value={form.device_model}
                onChange={e => set('device_model', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Выберите модель</option>
                {models.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
              </select>
            </div>
          )}

          {/* Repair type */}
          {repairTypes.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Тип ремонта</label>
              <select
                value={form.repair_type}
                onChange={e => set('repair_type', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Выберите тип ремонта</option>
                {repairTypes.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Описание проблемы</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Опишите, что произошло с устройством..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {/* Bonus */}
          {user && user.bonus_balance > 0 && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Icon name="Gift" size={16} className="text-primary" />
                  Использовать бонусы
                </span>
                <span className="text-sm text-primary font-medium">Доступно: {user.bonus_balance} бонусов</span>
              </div>
              <input
                type="number"
                min={0}
                max={user.bonus_balance}
                value={bonusUsed}
                onChange={e => setBonusUsed(Math.min(parseInt(e.target.value) || 0, user.bonus_balance))}
                className="w-full px-4 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground mt-1">1 бонус = 1 рубль скидки</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 px-4 py-3 rounded-xl">
              <Icon name="AlertCircle" size={16} />
              {error}
            </div>
          )}

          <Button type="submit" size="lg" disabled={loading} className="w-full ipro-gradient text-white border-0 text-base gap-2">
            {loading ? <><Icon name="Loader2" size={18} className="animate-spin" />Отправляем...</> : <><Icon name="Send" size={18} />Отправить заявку</>}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Нажимая кнопку, вы соглашаетесь на обработку персональных данных
          </p>
        </form>
      </div>
    </div>
  );
}
