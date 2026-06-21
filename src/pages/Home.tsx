import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';

const DEVICES = [
  { name: 'iPhone', slug: 'iphone', icon: 'Smartphone', color: 'from-blue-500 to-indigo-600' },
  { name: 'iPad', slug: 'ipad', icon: 'Tablet', color: 'from-purple-500 to-violet-600' },
  { name: 'MacBook', slug: 'macbook', icon: 'Laptop', color: 'from-indigo-500 to-blue-600' },
  { name: 'iMac', slug: 'imac', icon: 'Monitor', color: 'from-cyan-500 to-blue-500' },
  { name: 'Apple Watch', slug: 'apple-watch', icon: 'Watch', color: 'from-rose-500 to-pink-600' },
  { name: 'AirPods', slug: 'airpods', icon: 'Headphones', color: 'from-emerald-500 to-teal-600' },
  { name: 'Samsung', slug: 'samsung', icon: 'Smartphone', color: 'from-amber-500 to-orange-600' },
  { name: 'Другие', slug: 'other', icon: 'Wrench', color: 'from-gray-500 to-slate-600' },
];

const ADVANTAGES = [
  { icon: 'Shield', title: 'Гарантия 90 дней', desc: 'На все виды ремонта и замененные запчасти' },
  { icon: 'Zap', title: 'Ремонт за 1 час', desc: 'Большинство неисправностей устраняем в день обращения' },
  { icon: 'Package', title: 'Оригинальные запчасти', desc: 'Используем только сертифицированные комплектующие' },
  { icon: 'HeadphonesIcon', title: 'Бесплатная диагностика', desc: 'Точная оценка стоимости ремонта до начала работ' },
  { icon: 'Star', title: 'Опытные мастера', desc: 'Команда с опытом более 5 лет в сервисе Apple' },
  { icon: 'Gift', title: 'Программа лояльности', desc: 'Накапливайте бонусы и получайте скидки до 15%' },
];

const STATUS_LABELS: Record<string, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  ready: 'Готово',
  done: 'Выдано',
  cancelled: 'Отменено',
};

export default function Home() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<any[]>([]);
  const [trackNumber, setTrackNumber] = useState('');
  const [trackResult, setTrackResult] = useState<any>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState('');

  useEffect(() => {
    api.reviews().then(r => { if (r.reviews) setReviews(r.reviews); });
  }, []);

  const handleTrack = async () => {
    if (!trackNumber.trim()) return;
    setTrackLoading(true);
    setTrackError('');
    setTrackResult(null);
    const res = await api.orderStatus(trackNumber.trim());
    setTrackLoading(false);
    if (res.error) setTrackError(res.error);
    else setTrackResult(res.order);
  };

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-accent/10 to-background py-20 md:py-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6"
            >
              <Icon name="MapPin" size={14} />
              г. Барнаул, ул. Молодежная 34/1
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-display mb-6 leading-tight"
            >
              Ремонт Apple-техники{' '}
              <span className="ipro-gradient-text">профессионально</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto"
            >
              Сервисный центр iPro — быстрый ремонт iPhone, iPad, MacBook, Apple Watch и других устройств. Гарантия 90 дней, оригинальные запчасти.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Button
                size="lg"
                className="ipro-gradient text-white border-0 gap-2 text-base px-8"
                onClick={() => navigate('/order')}
              >
                <Icon name="ClipboardList" size={18} />
                Оставить заявку
              </Button>
              <Button size="lg" variant="outline" className="gap-2 text-base px-8" onClick={() => navigate('/prices')}>
                <Icon name="List" size={18} />
                Прайс-лист
              </Button>
            </motion.div>
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border/50"
            >
              {[
                { value: '5000+', label: 'Ремонтов выполнено' },
                { value: '90 дн', label: 'Гарантия' },
                { value: '5 лет', label: 'Опыт работы' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-display ipro-gradient-text">{s.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* DEVICES */}
      <section className="py-16 container">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-heading mb-3">Выберите устройство для ремонта</h2>
          <p className="text-muted-foreground">Нажмите на устройство, чтобы узнать цены и записаться на ремонт</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {DEVICES.map((d, i) => (
            <motion.div
              key={d.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/prices?device=${d.slug}`}
                className="ipro-card p-6 flex flex-col items-center gap-3 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all group cursor-pointer block"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${d.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                  <Icon name={d.icon as any} size={26} />
                </div>
                <span className="font-medium text-sm text-center">{d.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ADVANTAGES */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-heading mb-3">Почему выбирают iPro</h2>
            <p className="text-muted-foreground">Более 5000 довольных клиентов в Барнауле</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ADVANTAGES.map((a, i) => (
              <motion.div
                key={a.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="ipro-card p-6 flex gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon name={a.icon as any} size={22} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{a.title}</h3>
                  <p className="text-sm text-muted-foreground">{a.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ORDER TRACKING */}
      <section className="py-16 container">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-heading mb-3">Отследить заказ</h2>
          <p className="text-muted-foreground mb-8">Введите номер заявки, чтобы узнать статус ремонта</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={trackNumber}
              onChange={e => setTrackNumber(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleTrack()}
              placeholder="IP-1000"
              className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            <Button onClick={handleTrack} disabled={trackLoading} className="ipro-gradient text-white border-0">
              {trackLoading ? <Icon name="Loader2" size={18} className="animate-spin" /> : <Icon name="Search" size={18} />}
            </Button>
          </div>
          {trackError && <p className="mt-3 text-sm text-destructive">{trackError}</p>}
          {trackResult && (
            <div className="mt-4 ipro-card p-5 text-left">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">#{trackResult.order_number}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium status-${trackResult.status}`}>
                  {STATUS_LABELS[trackResult.status] || trackResult.status}
                </span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>{trackResult.device_model} — {trackResult.repair_type}</div>
                {trackResult.price && <div className="text-foreground font-medium">Стоимость: {trackResult.price.toLocaleString('ru')} ₽</div>}
                {trackResult.admin_comment && <div className="mt-2 text-foreground">{trackResult.admin_comment}</div>}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* REVIEWS */}
      {reviews.length > 0 && (
        <section className="py-16 bg-secondary/30">
          <div className="container">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-heading mb-3">Отзывы клиентов</h2>
              <p className="text-muted-foreground">Реальные отзывы от наших клиентов</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {reviews.slice(0, 6).map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="ipro-card p-5"
                >
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <Icon key={j} name="Star" size={14} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{r.text}"</p>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{r.name}</span>
                    {r.device && (
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{r.device}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LOYALTY CTA */}
      <section className="py-16 container">
        <div className="ipro-gradient rounded-3xl p-8 md:p-12 text-white text-center">
          <Icon name="Gift" size={40} className="mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl md:text-3xl font-heading mb-3">Программа лояльности iPro</h2>
          <p className="text-white/80 mb-6 max-w-md mx-auto">
            Накапливайте бонусы с каждого ремонта и получайте скидки до 15%. Четыре уровня привилегий.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" variant="secondary" className="gap-2" onClick={() => navigate('/loyalty')}>
              <Icon name="Crown" size={18} />
              Узнать подробнее
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2" onClick={() => navigate('/login')}>
              <Icon name="User" size={18} />
              Зарегистрироваться
            </Button>
          </div>
        </div>
      </section>

      {/* CONTACTS CTA */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: 'Phone', title: '+7(999)323-18-17', sub: 'Позвонить нам', href: 'tel:+79993231817' },
              { icon: 'Send', title: '@ipro_barnaul', sub: 'Написать в Telegram', href: 'https://t.me/ipro_barnaul' },
              { icon: 'MapPin', title: 'ул. Молодежная 34/1', sub: 'г. Барнаул, 1 этаж', href: '/contacts' },
            ].map(c => (
              <a
                key={c.title}
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="ipro-card p-6 text-center hover:border-primary/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                  <Icon name={c.icon as any} size={22} className="text-primary" />
                </div>
                <div className="font-semibold text-sm">{c.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{c.sub}</div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
