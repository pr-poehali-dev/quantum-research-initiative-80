import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

const STATUS_LABELS: Record<string, string> = {
  new: 'Новая', in_progress: 'В работе', ready: 'Готово', done: 'Выдано', cancelled: 'Отменено',
};

const LOYALTY_ICONS: Record<string, string> = {
  star: 'Star', award: 'Award', crown: 'Crown', diamond: 'Diamond',
};

export default function Cabinet() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [bonusTx, setBonusTx] = useState<any[]>([]);
  const [tab, setTab] = useState<'overview' | 'orders' | 'bonuses' | 'profile'>('overview');
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name || '', email: user.email || '' });
      api.myOrders().then(r => { if (r.orders) setOrders(r.orders); });
    }
  }, [user]);

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <Icon name="Loader2" size={32} className="animate-spin text-primary" />
    </div>
  );

  const loyalty = user.loyalty;
  const loyaltyLevels = [
    { name: 'Старт', min: 0, max: 4999, discount: 3 },
    { name: 'Серебро', min: 5000, max: 19999, discount: 5 },
    { name: 'Золото', min: 20000, max: 49999, discount: 10 },
    { name: 'Платина', min: 50000, max: null, discount: 15 },
  ];
  const currentLevelIdx = loyaltyLevels.findIndex(l => l.name === loyalty?.name);
  const nextLevel = loyaltyLevels[currentLevelIdx + 1];
  const progressPct = nextLevel
    ? Math.min(100, ((user.total_spent - (loyaltyLevels[currentLevelIdx]?.min || 0)) / ((nextLevel.min) - (loyaltyLevels[currentLevelIdx]?.min || 0))) * 100)
    : 100;

  const saveProfile = async () => {
    await api.updateMe(profile);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const tabs = [
    { id: 'overview', label: 'Обзор', icon: 'LayoutDashboard' },
    { id: 'orders', label: 'Заказы', icon: 'ClipboardList' },
    { id: 'bonuses', label: 'Бонусы', icon: 'Gift' },
    { id: 'profile', label: 'Профиль', icon: 'User' },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-heading">Личный кабинет</h1>
            <p className="text-muted-foreground text-sm mt-1">Привет, {user.name || user.phone}!</p>
          </div>
          <Button variant="outline" size="sm" onClick={logout} className="gap-2">
            <Icon name="LogOut" size={16} />
            Выйти
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-8 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={t.icon as any} size={16} />
              {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: 'Gift', label: 'Бонусы', value: user.bonus_balance, color: 'text-primary' },
                { icon: 'Receipt', label: 'Потрачено', value: `${user.total_spent.toLocaleString('ru')} ₽`, color: 'text-emerald-500' },
                { icon: 'ClipboardList', label: 'Заказов', value: orders.length, color: 'text-blue-500' },
                { icon: 'Crown', label: 'Уровень', value: loyalty?.name || 'Старт', color: 'text-amber-500' },
              ].map(s => (
                <div key={s.label} className="ipro-card p-4">
                  <Icon name={s.icon as any} size={20} className={`${s.color} mb-2`} />
                  <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Loyalty card */}
            <div className="ipro-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Уровень лояльности</div>
                  <div className="text-xl font-bold flex items-center gap-2">
                    <Icon name={(LOYALTY_ICONS[loyalty?.icon || 'star']) as any} size={20} className="text-primary" />
                    {loyalty?.name}
                    <span className="text-sm font-normal text-primary">–{loyalty?.discount}% скидка</span>
                  </div>
                </div>
                <Link to="/loyalty" className="text-sm text-primary hover:underline">Подробнее →</Link>
              </div>
              <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full ipro-gradient rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                <span>{user.total_spent.toLocaleString('ru')} ₽ потрачено</span>
                {nextLevel && <span>До {nextLevel.name}: {Math.max(0, nextLevel.min - user.total_spent).toLocaleString('ru')} ₽</span>}
              </div>
            </div>

            {/* Recent orders */}
            {orders.length > 0 && (
              <div className="ipro-card overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold">Последние заказы</h3>
                  <button onClick={() => setTab('orders')} className="text-sm text-primary hover:underline">Все →</button>
                </div>
                {orders.slice(0, 3).map(o => (
                  <div key={o.id} className="px-5 py-3.5 border-b border-border/50 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-medium text-sm">{o.order_number}</div>
                      <div className="text-xs text-muted-foreground">{o.device_model} — {o.repair_type}</div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium status-${o.status}`}>
                      {STATUS_LABELS[o.status] || o.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="text-center py-16 ipro-card">
                <Icon name="ClipboardList" size={40} className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">У вас пока нет заказов</p>
                <Button className="ipro-gradient text-white border-0 gap-2" onClick={() => navigate('/order')}>
                  <Icon name="Plus" size={16} />Оставить заявку
                </Button>
              </div>
            ) : orders.map(o => (
              <div key={o.id} className="ipro-card p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="font-semibold">{o.order_number}</span>
                    <span className="text-muted-foreground text-sm ml-3">{new Date(o.created_at).toLocaleDateString('ru')}</span>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium status-${o.status}`}>
                    {STATUS_LABELS[o.status] || o.status}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">{o.device_model || o.device_category}</span>
                  {o.repair_type && <span className="text-muted-foreground"> — {o.repair_type}</span>}
                </div>
                {o.price && <div className="mt-2 font-medium text-sm">{o.price.toLocaleString('ru')} ₽</div>}
                {o.bonus_earned > 0 && (
                  <div className="mt-1 text-xs text-primary flex items-center gap-1">
                    <Icon name="Gift" size={12} />+{o.bonus_earned} бонусов начислено
                  </div>
                )}
                {o.admin_comment && (
                  <div className="mt-2 text-sm bg-secondary/50 rounded-lg px-3 py-2">{o.admin_comment}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* BONUSES */}
        {tab === 'bonuses' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="ipro-card p-6 text-center">
                <Icon name="Gift" size={28} className="text-primary mx-auto mb-2" />
                <div className="text-3xl font-display text-primary">{user.bonus_balance}</div>
                <div className="text-sm text-muted-foreground mt-1">Доступных бонусов</div>
              </div>
              <div className="ipro-card p-6 text-center">
                <Icon name="Receipt" size={28} className="text-emerald-500 mx-auto mb-2" />
                <div className="text-3xl font-display text-emerald-500">{user.total_spent.toLocaleString('ru')} ₽</div>
                <div className="text-sm text-muted-foreground mt-1">Всего потрачено</div>
              </div>
            </div>
            <div className="ipro-card p-6">
              <h3 className="font-semibold mb-4">Как работают бонусы</h3>
              <ul className="space-y-3">
                {[
                  { icon: 'CheckCircle2', text: 'За каждый завершённый ремонт начисляется 5% от стоимости бонусами' },
                  { icon: 'CheckCircle2', text: '1 бонус = 1 рубль скидки при следующем обращении' },
                  { icon: 'CheckCircle2', text: 'Чем больше потрачено — тем выше уровень и скидка (до 15%)' },
                  { icon: 'CheckCircle2', text: 'Бонусы не сгорают и хранятся в личном кабинете' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Icon name="CheckCircle2" size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* PROFILE */}
        {tab === 'profile' && (
          <div className="max-w-md space-y-5">
            <div className="ipro-card p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Имя</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Телефон</label>
                <input type="tel" value={user.phone} disabled className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary text-sm text-muted-foreground cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <Button onClick={saveProfile} className="w-full ipro-gradient text-white border-0 gap-2">
                {profileSaved ? <><Icon name="CheckCircle2" size={16} />Сохранено!</> : <><Icon name="Save" size={16} />Сохранить</>}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
