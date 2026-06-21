import React from 'react';
import { Link } from 'react-router-dom';
import { useCity } from '@/context/CityContext';
import Icon from '@/components/ui/icon';

export default function Footer() {
  const { selectedCity } = useCity();

  return (
    <footer className="bg-secondary/50 border-t border-border mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <img
              src="https://cdn.poehali.dev/projects/a8bd7bfa-3b7e-44c0-9d5a-054cd12af7a0/bucket/d679b5c0-eee1-45f3-ae4c-ac3289cdf0ec.png"
              alt="iPro Сервис"
              className="h-10 w-auto mb-4"
            />
            <p className="text-sm text-muted-foreground mb-4">
              Профессиональный ремонт Apple-техники с гарантией. Работаем с 2018 года.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={`https://t.me/${selectedCity?.telegram?.replace('@', '') || 'ipro_barnaul'}`}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary transition-colors"
              >
                <Icon name="Send" size={16} />
              </a>
              <a
                href="tel:+79993231817"
                className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary transition-colors"
              >
                <Icon name="Phone" size={16} />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">Услуги</h4>
            <ul className="space-y-2 text-sm">
              {['Ремонт iPhone', 'Ремонт iPad', 'Ремонт MacBook', 'Ремонт Apple Watch', 'Ремонт iMac', 'Ремонт Samsung'].map(s => (
                <li key={s}>
                  <Link to="/prices" className="text-muted-foreground hover:text-foreground transition-colors">{s}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">Компания</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'О нас', href: '/about' },
                { label: 'Программа лояльности', href: '/loyalty' },
                { label: 'Контакты', href: '/contacts' },
                { label: 'Проверить статус заказа', href: '/status' },
              ].map(l => (
                <li key={l.href}>
                  <Link to={l.href} className="text-muted-foreground hover:text-foreground transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">Контакты</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Icon name="MapPin" size={15} className="mt-0.5 flex-shrink-0 text-primary" />
                <span>{selectedCity?.address || 'г. Барнаул, ул. Молодежная 34/1, 1 этаж'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Icon name="Phone" size={15} className="flex-shrink-0 text-primary" />
                <a href="tel:+79993231817" className="hover:text-foreground transition-colors">
                  {selectedCity?.phone || '+7(999)323-18-17'}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Icon name="Phone" size={15} className="flex-shrink-0 text-primary" />
                <a href="tel:+73852571817" className="hover:text-foreground transition-colors">57-18-17</a>
              </li>
              <li className="flex items-center gap-2">
                <Icon name="Send" size={15} className="flex-shrink-0 text-primary" />
                <a href="https://t.me/ipro_barnaul" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                  {selectedCity?.telegram || '@ipro_barnaul'}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Icon name="Clock" size={15} className="flex-shrink-0 text-primary" />
                <span>Пн–Пт 9:00–20:00<br />Сб–Вс 10:00–18:00</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} iPro Сервис. Все права защищены.</span>
          <span>Профессиональный ремонт Apple-техники</span>
        </div>
      </div>
    </footer>
  );
}
