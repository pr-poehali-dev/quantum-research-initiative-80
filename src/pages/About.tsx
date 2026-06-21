import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const TEAM = [
  { name: 'Илья', role: 'Главный инженер', exp: '7 лет опыта' },
  { name: 'Алексей', role: 'Специалист по Mac', exp: '5 лет опыта' },
  { name: 'Дарья', role: 'Диагностика iPhone', exp: '4 года опыта' },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen py-10">
      <div className="container max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-heading mb-4">О компании iPro</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Профессиональный сервисный центр по ремонту Apple-техники в Барнауле. Работаем с 2018 года.
          </p>
        </div>

        {/* Story */}
        <div className="ipro-card p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-heading mb-4">Наша история</h2>
              <p className="text-muted-foreground mb-4">
                Сервисный центр iPro начал работу в 2018 году с небольшой мастерской в центре Барнаула. Сегодня мы — команда профессионалов, которые каждый день помогают сотням клиентов вернуть к жизни их любимые устройства Apple.
              </p>
              <p className="text-muted-foreground">
                За годы работы мы выполнили более 5000 ремонтов и завоевали доверие клиентов благодаря качественной работе, честным ценам и внимательному сервису.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '5000+', label: 'Ремонтов' },
                { value: '6 лет', label: 'На рынке' },
                { value: '98%', label: 'Довольных клиентов' },
                { value: '90 дн', label: 'Гарантия' },
              ].map(s => (
                <div key={s.label} className="bg-secondary/50 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-display ipro-gradient-text">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {[
            { icon: 'Shield', title: 'Честность', desc: 'Мы никогда не завышаем стоимость. Получите точную оценку до начала работ.' },
            { icon: 'Zap', title: 'Скорость', desc: 'Большинство ремонтов выполняем в день обращения или при клиенте.' },
            { icon: 'Star', title: 'Качество', desc: 'Используем только оригинальные или сертифицированные комплектующие.' },
          ].map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="ipro-card p-6 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Icon name={v.icon as any} size={24} className="text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground">{v.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Team */}
        <div className="mb-8">
          <h2 className="text-2xl font-heading mb-6 text-center">Наша команда</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TEAM.map((m, i) => (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="ipro-card p-6 text-center"
              >
                <div className="w-16 h-16 rounded-full ipro-gradient flex items-center justify-center mx-auto mb-4">
                  <Icon name="User" size={28} className="text-white" />
                </div>
                <h3 className="font-semibold">{m.name}</h3>
                <p className="text-sm text-primary mt-1">{m.role}</p>
                <p className="text-xs text-muted-foreground mt-1">{m.exp}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center ipro-card p-8">
          <h2 className="text-xl font-heading mb-3">Готовы доверить нам свой ремонт?</h2>
          <p className="text-muted-foreground mb-6">Оставьте заявку — мы перезвоним в течение 15 минут</p>
          <div className="flex gap-3 justify-center">
            <Button size="lg" className="ipro-gradient text-white border-0 gap-2" onClick={() => navigate('/order')}>
              <Icon name="ClipboardList" size={18} />Оставить заявку
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/contacts')}>
              Контакты
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
