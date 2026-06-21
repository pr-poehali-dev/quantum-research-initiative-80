import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

const STATUS_LABELS: Record<string, string> = {
  new: 'Новая', in_progress: 'В работе', ready: 'Готово', done: 'Выдано', cancelled: 'Отменено',
};
const STATUS_OPTIONS = ['new', 'in_progress', 'ready', 'done', 'cancelled'];

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'stats' | 'orders' | 'users' | 'bonuses' | 'settings' | 'reviews'>('stats');
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [settings, setSettings] = useState<any>({});
  const [reviews, setReviews] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [editOrder, setEditOrder] = useState<any>(null);
  const [bonusUser, setBonusUser] = useState<any>(null);
  const [bonusAmount, setBonusAmount] = useState(0);
  const [bonusDesc, setBonusDesc] = useState('');
  const [settingsEdits, setSettingsEdits] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) { navigate('/login'); return; }
    if (!loading && !isAdmin) { navigate('/'); return; }
  }, [user, isAdmin, loading]);

  useEffect(() => {
    if (!isAdmin) return;
    if (tab === 'stats') api.adminStats().then(r => { if (r.stats) setStats(r.stats); });
    if (tab === 'orders') api.adminOrders(statusFilter).then(r => { if (r.orders) setOrders(r.orders); });
    if (tab === 'users') api.adminUsers(userSearch).then(r => { if (r.users) setUsers(r.users); });
    if (tab === 'settings') api.adminSettings().then(r => { if (r.settings) setSettings(r.settings); });
    if (tab === 'reviews') api.adminReviews().then(r => { if (r.reviews) setReviews(r.reviews); });
  }, [tab, statusFilter, isAdmin]);

  const reloadOrders = () => api.adminOrders(statusFilter).then(r => { if (r.orders) setOrders(r.orders); });
  const searchUsers = () => api.adminUsers(userSearch).then(r => { if (r.users) setUsers(r.users); });

  const saveOrder = async () => {
    if (!editOrder) return;
    await api.adminUpdateOrder({
      order_id: editOrder.id,
      status: editOrder.status,
      price: editOrder.price ? parseInt(editOrder.price) : undefined,
      admin_comment: editOrder.admin_comment,
    });
    setEditOrder(null);
    reloadOrders();
  };

  const adjustBonus = async () => {
    if (!bonusUser) return;
    await api.adminBonusAdjust({ user_id: bonusUser.id, amount: bonusAmount, description: bonusDesc });
    setBonusUser(null);
    setBonusAmount(0);
    setBonusDesc('');
    api.adminUsers(userSearch).then(r => { if (r.users) setUsers(r.users); });
  };

  const saveSettings = async () => {
    await api.adminUpdateSettings(settingsEdits);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSettingsEdits({});
    api.adminSettings().then(r => { if (r.settings) setSettings(r.settings); });
  };

  const toggleReview = async (id: number) => {
    await api.adminToggleReview(id);
    api.adminReviews().then(r => { if (r.reviews) setReviews(r.reviews); });
  };

  if (loading || !isAdmin) return (
    <div className="min-h-screen flex items-center justify-center">
      <Icon name="Loader2" size={32} className="animate-spin text-primary" />
    </div>
  );

  const navTabs = [
    { id: 'stats', label: 'Статистика', icon: 'BarChart3' },
    { id: 'orders', label: 'Заказы', icon: 'ClipboardList' },
    { id: 'users', label: 'Клиенты', icon: 'Users' },
    { id: 'bonuses', label: 'Бонусы', icon: 'Gift' },
    { id: 'settings', label: 'Настройки', icon: 'Settings' },
    { id: 'reviews', label: 'Отзывы', icon: 'MessageSquare' },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-heading">Админ-панель</h1>
            <p className="text-muted-foreground text-sm mt-1">iPro Сервис — управление</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/')} className="gap-2">
            <Icon name="ArrowLeft" size={16} />На сайт
          </Button>
        </div>

        {/* Nav */}
        <div className="flex gap-1 border-b border-border mb-8 overflow-x-auto">
          {navTabs.map(t => (
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

        {/* STATS */}
        {tab === 'stats' && stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'Новых заявок', value: stats.new_orders, icon: 'Bell', color: 'text-blue-500' },
              { label: 'В работе', value: stats.in_progress, icon: 'Wrench', color: 'text-amber-500' },
              { label: 'Сделано за месяц', value: stats.done_month, icon: 'CheckCircle2', color: 'text-emerald-500' },
              { label: 'Выручка за месяц', value: `${(stats.revenue_month || 0).toLocaleString('ru')} ₽`, icon: 'TrendingUp', color: 'text-primary' },
              { label: 'Всего клиентов', value: stats.total_clients, icon: 'Users', color: 'text-violet-500' },
            ].map(s => (
              <div key={s.label} className="ipro-card p-5">
                <Icon name={s.icon as any} size={20} className={`${s.color} mb-2`} />
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => { setStatusFilter(''); reloadOrders(); }}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${!statusFilter ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}
              >
                Все
              </button>
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); api.adminOrders(s).then(r => { if (r.orders) setOrders(r.orders); }); }}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${statusFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
            <div className="ipro-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50 text-xs text-muted-foreground">
                      <th className="text-left px-4 py-3">№</th>
                      <th className="text-left px-4 py-3">Клиент</th>
                      <th className="text-left px-4 py-3 hidden md:table-cell">Устройство</th>
                      <th className="text-left px-4 py-3 hidden lg:table-cell">Ремонт</th>
                      <th className="text-left px-4 py-3">Статус</th>
                      <th className="text-right px-4 py-3 hidden md:table-cell">Цена</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium">{o.order_number}</td>
                        <td className="px-4 py-3 text-sm">
                          <div>{o.client_name || o.user_name || '—'}</div>
                          <div className="text-xs text-muted-foreground">{o.client_phone}</div>
                        </td>
                        <td className="px-4 py-3 text-sm hidden md:table-cell">{o.device_model || o.device_category}</td>
                        <td className="px-4 py-3 text-sm hidden lg:table-cell text-muted-foreground">{o.repair_type}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium status-${o.status}`}>
                            {STATUS_LABELS[o.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right hidden md:table-cell font-medium">
                          {o.price ? `${o.price.toLocaleString('ru')} ₽` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button size="sm" variant="ghost" onClick={() => setEditOrder({ ...o })} className="text-xs">
                            <Icon name="Edit2" size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchUsers()}
                placeholder="Поиск по телефону или имени..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <Button onClick={searchUsers} variant="outline" className="gap-2">
                <Icon name="Search" size={16} />Найти
              </Button>
            </div>
            <div className="ipro-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50 text-xs text-muted-foreground">
                      <th className="text-left px-4 py-3">Клиент</th>
                      <th className="text-left px-4 py-3 hidden md:table-cell">Телефон</th>
                      <th className="text-right px-4 py-3">Бонусы</th>
                      <th className="text-right px-4 py-3 hidden sm:table-cell">Потрачено</th>
                      <th className="text-left px-4 py-3 hidden lg:table-cell">Роль</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3 text-sm">
                          <div className="font-medium">{u.name || '—'}</div>
                          <div className="text-xs text-muted-foreground md:hidden">{u.phone}</div>
                        </td>
                        <td className="px-4 py-3 text-sm hidden md:table-cell text-muted-foreground">{u.phone}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-primary">{u.bonus_balance}</td>
                        <td className="px-4 py-3 text-sm text-right hidden sm:table-cell">{u.total_spent.toLocaleString('ru')} ₽</td>
                        <td className="px-4 py-3 text-xs hidden lg:table-cell">
                          <span className={`px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-primary/10 text-primary' : u.role === 'manager' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-secondary text-muted-foreground'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button size="sm" variant="ghost" onClick={() => setBonusUser(u)} className="text-xs gap-1">
                            <Icon name="Gift" size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* BONUSES TAB (redirect to users) */}
        {tab === 'bonuses' && (
          <div className="text-center py-16 ipro-card">
            <Icon name="Gift" size={40} className="mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-2">Управление бонусами</h3>
            <p className="text-muted-foreground mb-4">Перейдите во вкладку Клиенты и нажмите на иконку подарка рядом с нужным клиентом</p>
            <Button onClick={() => setTab('users')} className="ipro-gradient text-white border-0 gap-2">
              <Icon name="Users" size={16} />Перейти к клиентам
            </Button>
          </div>
        )}

        {/* SETTINGS */}
        {tab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Object.entries(settings).map(([key, s]: [string, any]) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">{s.label || key}</label>
                {s.type === 'textarea' ? (
                  <textarea
                    defaultValue={s.value}
                    onChange={e => setSettingsEdits(prev => ({ ...prev, [key]: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                ) : s.type === 'color' ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      defaultValue={s.value}
                      onChange={e => setSettingsEdits(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                    />
                    <input
                      type="text"
                      defaultValue={s.value}
                      onChange={e => setSettingsEdits(prev => ({ ...prev, [key]: e.target.value }))}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                ) : (
                  <input
                    type={s.type === 'number' ? 'number' : 'text'}
                    defaultValue={s.value}
                    onChange={e => setSettingsEdits(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                )}
              </div>
            ))}
            <div className="md:col-span-2">
              <Button onClick={saveSettings} size="lg" className="ipro-gradient text-white border-0 gap-2">
                {saved ? <><Icon name="CheckCircle2" size={16} />Сохранено!</> : <><Icon name="Save" size={16} />Сохранить настройки</>}
              </Button>
            </div>
          </div>
        )}

        {/* REVIEWS */}
        {tab === 'reviews' && (
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r.id} className={`ipro-card p-4 flex items-start gap-4 ${!r.is_published ? 'opacity-60' : ''}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{r.name}</span>
                    {r.device && <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{r.device}</span>}
                    <div className="flex gap-0.5 ml-auto">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Icon key={i} name="Star" size={12} className="text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{r.text}</p>
                  <span className="text-xs text-muted-foreground mt-1 block">{new Date(r.created_at).toLocaleDateString('ru')}</span>
                </div>
                <Button
                  size="sm"
                  variant={r.is_published ? 'outline' : 'default'}
                  onClick={() => toggleReview(r.id)}
                  className={`flex-shrink-0 text-xs gap-1 ${r.is_published ? '' : 'ipro-gradient text-white border-0'}`}
                >
                  <Icon name={r.is_published ? 'EyeOff' : 'Eye'} size={14} />
                  {r.is_published ? 'Скрыть' : 'Опубликовать'}
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* EDIT ORDER MODAL */}
        {editOrder && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setEditOrder(null)}>
            <div className="ipro-card p-6 w-full max-w-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Заказ {editOrder.order_number}</h3>
                <Button size="icon" variant="ghost" onClick={() => setEditOrder(null)}><Icon name="X" size={18} /></Button>
              </div>
              <div className="text-sm text-muted-foreground">{editOrder.device_model} — {editOrder.repair_type}</div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Статус</label>
                <select
                  value={editOrder.status}
                  onChange={e => setEditOrder((o: any) => ({ ...o, status: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Стоимость ремонта (₽)</label>
                <input
                  type="number"
                  value={editOrder.price || ''}
                  onChange={e => setEditOrder((o: any) => ({ ...o, price: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Комментарий для клиента</label>
                <textarea
                  value={editOrder.admin_comment || ''}
                  onChange={e => setEditOrder((o: any) => ({ ...o, admin_comment: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  placeholder="Например: Запчасть в пути, ждём 2 дня"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setEditOrder(null)}>Отмена</Button>
                <Button className="flex-1 ipro-gradient text-white border-0 gap-2" onClick={saveOrder}>
                  <Icon name="Save" size={16} />Сохранить
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* BONUS ADJUST MODAL */}
        {bonusUser && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setBonusUser(null)}>
            <div className="ipro-card p-6 w-full max-w-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Бонусы: {bonusUser.name || bonusUser.phone}</h3>
                <Button size="icon" variant="ghost" onClick={() => setBonusUser(null)}><Icon name="X" size={18} /></Button>
              </div>
              <div className="text-sm text-muted-foreground">Текущий баланс: <span className="text-primary font-medium">{bonusUser.bonus_balance} бонусов</span></div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Изменить баланс (+ начислить / - списать)</label>
                <input
                  type="number"
                  value={bonusAmount}
                  onChange={e => setBonusAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Например: 100 или -50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Описание</label>
                <input
                  type="text"
                  value={bonusDesc}
                  onChange={e => setBonusDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Например: Приветственный бонус"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setBonusUser(null)}>Отмена</Button>
                <Button className="flex-1 ipro-gradient text-white border-0 gap-2" onClick={adjustBonus}>
                  <Icon name="Gift" size={16} />Применить
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
