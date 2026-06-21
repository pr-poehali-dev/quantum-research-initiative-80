import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface LoyaltyLevel { id: number; name: string; min_spent: number; max_spent: number | null; discount_percent: number; icon: string; color: string; }

const ICONS: Record<string, string> = { star: 'Star', award: 'Award', crown: 'Crown', diamond: 'Diamond' };
const COLORS: Record<string, string> = {
  gray: 'from-gray-400 to-gray-600',
  silver: 'from-slate-300 to-slate-500',
  gold: 'from-amber-400 to-yellow-600',
  blue: 'from-indigo-500 to-violet-600',
};

export default function Loyalty() {
  const [levels, setLevels] = useState<LoyaltyLevel[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.loyalty().then(r => { if (r.levels) setLevels(r.levels); });
  }, []);

  return (
    <div className="min-h-screen py-10">
      <div className="container">
        {/* Hero */}
        <div className="text-center mb-14">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-5"
          >
            <Icon name="Gift" size={14} />
            Для постоянных клиентов
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-display mb-5 leading-tight"
          >
            Становитесь ценнее{' '}
            <span className="ipro-gradient-text">с каждым визитом</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-xl mx-auto mb-8 text-lg"
          >
            Накапливайте сумму заказов и автоматически переходите на новый уровень привилегий. Никаких карточек — всё в личном кабинете.
          </motion.p>
          <div className="flex flex-wrap gap-3 justify-center">
            {['Без регистрации карточки', 'Автоматический переход по уровням', 'Скидки суммируются с акциями'].map(b => (
              <span key={b} className="flex items-center gap-1.5 text-sm bg-secondary px-4 py-2 rounded-full text-muted-foreground">
                <Icon name="Check" size={14} className="text-primary" />
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Levels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {levels.map((lvl, i) => {
            const isUser = user?.loyalty?.name === lvl.name;
            return (
              <motion.div
                key={lvl.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative ipro-card p-6 ${isUser ? 'border-primary ring-2 ring-primary/30' : ''}`}
              >
                {isUser && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    Ваш уровень
                  </div>
                )}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${COLORS[lvl.color] || COLORS.gray} flex items-center justify-center mb-4`}>
                  <Icon name={(ICONS[lvl.icon] || 'Star') as any} size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-bold mb-1">{lvl.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {lvl.max_spent
                    ? `${lvl.min_spent.toLocaleString('ru')} – ${lvl.max_spent.toLocaleString('ru')} ₽`
                    : `от ${lvl.min_spent.toLocaleString('ru')} ₽`
                  }
                </p>
                <div className="text-4xl font-display text-primary mb-4">{lvl.discount_percent}%</div>
                <ul className="space-y-2">
                  {[
                    `Скидка ${lvl.discount_percent}% на все ремонты`,
                    '5% бонусов от суммы',
                    'Приоритетный приём',
                    lvl.discount_percent >= 10 ? 'Бесплатная диагностика' : null,
                  ].filter(Boolean).map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="CheckCircle2" size={14} className="text-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center ipro-card p-8 md:p-12">
          <Icon name="Crown" size={40} className="text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-heading mb-3">
            {user ? `Ваш уровень: ${user.loyalty?.name}` : 'Начните копить бонусы сегодня'}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {user
              ? `Потрачено: ${user.total_spent.toLocaleString('ru')} ₽. Бонусный баланс: ${user.bonus_balance} бонусов.`
              : 'Зарегистрируйтесь и начните получать бонусы с первого ремонта. Это бесплатно!'
            }
          </p>
          {user ? (
            <Button size="lg" className="ipro-gradient text-white border-0 gap-2" onClick={() => navigate('/cabinet')}>
              <Icon name="LayoutDashboard" size={18} />Личный кабинет
            </Button>
          ) : (
            <div className="flex gap-3 justify-center">
              <Button size="lg" className="ipro-gradient text-white border-0 gap-2" onClick={() => navigate('/login')}>
                <Icon name="UserPlus" size={18} />Зарегистрироваться
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/order')}>
                Оставить заявку
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
