import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useCity } from '@/context/CityContext';

export default function Contacts() {
  const { selectedCity } = useCity();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen py-10">
      <div className="container max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-heading mb-3">Контакты</h1>
          <p className="text-muted-foreground">Мы всегда на связи — позвоните или напишите нам</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Contact info */}
          <div className="ipro-card p-6 space-y-5">
            <h2 className="font-semibold text-lg mb-4">Как нас найти</h2>
            {[
              { icon: 'MapPin', label: 'Адрес', value: selectedCity?.address || 'г. Барнаул, ул. Молодежная 34/1, 1 этаж', href: undefined },
              { icon: 'Phone', label: 'Телефон', value: selectedCity?.phone || '+7(999)323-18-17', href: `tel:${selectedCity?.phone || '+79993231817'}` },
              { icon: 'Phone', label: 'Городской', value: '57-18-17', href: 'tel:+73852571817' },
              { icon: 'Send', label: 'Telegram', value: selectedCity?.telegram || '@ipro_barnaul', href: `https://t.me/${(selectedCity?.telegram || '@ipro_barnaul').replace('@', '')}` },
              { icon: 'Clock', label: 'График работы', value: 'Пн–Пт: 9:00–20:00\nСб–Вс: 10:00–18:00', href: undefined },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon name={item.icon as any} size={18} className="text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">{item.label}</div>
                  {item.href ? (
                    <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                      className="font-medium text-sm hover:text-primary transition-colors whitespace-pre-line">
                      {item.value}
                    </a>
                  ) : (
                    <div className="font-medium text-sm whitespace-pre-line">{item.value}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="space-y-4">
            <div className="ipro-card p-6">
              <h2 className="font-semibold mb-4">Быстрые действия</h2>
              <div className="space-y-3">
                <Button className="w-full ipro-gradient text-white border-0 gap-2 justify-start" size="lg" onClick={() => navigate('/order')}>
                  <Icon name="ClipboardList" size={18} />Оставить заявку на ремонт
                </Button>
                <a href={`https://t.me/${(selectedCity?.telegram || '@ipro_barnaul').replace('@', '')}`} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="w-full gap-2 justify-start" size="lg">
                    <Icon name="Send" size={18} />Написать в Telegram
                  </Button>
                </a>
                <a href={`tel:${selectedCity?.phone || '+79993231817'}`}>
                  <Button variant="outline" className="w-full gap-2 justify-start" size="lg">
                    <Icon name="Phone" size={18} />Позвонить нам
                  </Button>
                </a>
              </div>
            </div>
            <div className="ipro-card p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Icon name="Shield" size={18} className="text-primary" />
                Наши гарантии
              </h3>
              <ul className="space-y-2">
                {[
                  'Гарантия 90 дней на все виды ремонта',
                  'Оригинальные сертифицированные запчасти',
                  'Бесплатная диагностика до начала работ',
                  'Ремонт в присутствии клиента',
                  'Предварительная оценка стоимости',
                ].map((g, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="CheckCircle2" size={14} className="text-primary flex-shrink-0" />
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Map placeholder */}
        <div className="ipro-card overflow-hidden">
          <div className="h-64 bg-secondary/50 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Icon name="MapPin" size={40} className="mx-auto mb-3 text-primary" />
              <p className="font-medium">г. Барнаул, ул. Молодежная 34/1</p>
              <p className="text-sm mt-1">1 этаж</p>
              <a
                href="https://yandex.ru/maps/?text=Барнаул+Молодежная+34/1"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-3"
              >
                Открыть в Яндекс.Картах →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
