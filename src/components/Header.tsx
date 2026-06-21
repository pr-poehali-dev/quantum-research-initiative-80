import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCity } from '@/context/CityContext';
import { useTheme } from '@/context/ThemeContext';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { cities, selectedCity, setSelectedCity } = useCity();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = [
    { label: 'Услуги', href: '/services' },
    { label: 'Цены', href: '/prices' },
    { label: 'Программа лояльности', href: '/loyalty' },
    { label: 'О нас', href: '/about' },
    { label: 'Контакты', href: '/contacts' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      {/* Top bar */}
      <div className="border-b border-border/50 py-1.5 hidden md:block">
        <div className="container flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            {selectedCity && (
              <>
                <span className="flex items-center gap-1">
                  <Icon name="MapPin" size={14} />
                  {selectedCity.address}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Clock" size={14} />
                  Пн–Пт 9:00–20:00, Сб–Вс 10:00–18:00
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            {selectedCity && (
              <>
                <a href={`tel:${selectedCity.phone}`} className="flex items-center gap-1 hover:text-primary transition-colors font-medium">
                  <Icon name="Phone" size={14} />
                  {selectedCity.phone}
                </a>
                <a href={`https://t.me/${selectedCity.telegram?.replace('@', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Icon name="Send" size={14} />
                  {selectedCity.telegram}
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img
              src="https://cdn.poehali.dev/projects/a8bd7bfa-3b7e-44c0-9d5a-054cd12af7a0/bucket/d679b5c0-eee1-45f3-ae4c-ac3289cdf0ec.png"
              alt="iPro Сервис"
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {nav.map(item => (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* City selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden sm:flex gap-1.5 text-sm">
                  <Icon name="MapPin" size={14} className="text-primary" />
                  {selectedCity?.name || 'Город'}
                  <Icon name="ChevronDown" size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {cities.map(city => (
                  <DropdownMenuItem
                    key={city.id}
                    onClick={() => setSelectedCity(city)}
                    className={selectedCity?.id === city.id ? 'text-primary font-medium' : ''}
                  >
                    {city.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground">
              <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={18} />
            </Button>

            {/* Auth */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Icon name="User" size={16} />
                    <span className="hidden sm:inline">{user.name || user.phone}</span>
                    <span className="inline-flex items-center gap-0.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                      <Icon name="Star" size={10} />
                      {user.bonus_balance}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => navigate('/cabinet')}>
                    <Icon name="LayoutDashboard" size={16} className="mr-2" />
                    Личный кабинет
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/cabinet/orders')}>
                    <Icon name="ClipboardList" size={16} className="mr-2" />
                    Мои заказы
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/cabinet/bonuses')}>
                    <Icon name="Gift" size={16} className="mr-2" />
                    Бонусы
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Icon name="Settings" size={16} className="mr-2" />
                        Админ-панель
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <Icon name="LogOut" size={16} className="mr-2" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" onClick={() => navigate('/login')} className="ipro-gradient text-white border-0 gap-2">
                <Icon name="User" size={16} />
                <span className="hidden sm:inline">Войти</span>
              </Button>
            )}

            {/* Mobile menu */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Icon name={mobileOpen ? 'X' : 'Menu'} size={20} />
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="lg:hidden mt-3 pb-2 border-t border-border pt-3 flex flex-col gap-2">
            {nav.map(item => (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm font-medium py-1.5 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {selectedCity && (
              <div className="mt-2 pt-2 border-t border-border text-sm text-muted-foreground space-y-1">
                <div className="flex items-center gap-1.5">
                  <Icon name="Phone" size={14} />
                  <a href={`tel:${selectedCity.phone}`}>{selectedCity.phone}</a>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon name="MapPin" size={14} />
                  {selectedCity.address}
                </div>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
