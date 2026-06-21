import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';

interface Category { id: number; name: string; slug: string; icon: string; }
interface Model { id: number; name: string; }
interface RepairType { id: number; name: string; }
interface Price { id: number; model: string; repair_type: string; price_from: number; price_to?: number; duration_hours: number; }

const ICON_MAP: Record<string, string> = {
  iphone: 'Smartphone', ipad: 'Tablet', macbook: 'Laptop', imac: 'Monitor',
  'apple-watch': 'Watch', airpods: 'Headphones', samsung: 'Smartphone', other: 'Wrench',
};

export default function Prices() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [repairTypes, setRepairTypes] = useState<RepairType[]>([]);
  const [prices, setPrices] = useState<Price[]>([]);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedRepair, setSelectedRepair] = useState<RepairType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.categories().then(r => {
      if (r.categories) {
        setCategories(r.categories);
        const slug = searchParams.get('device');
        const found = slug ? r.categories.find((c: Category) => c.slug === slug) : r.categories[0];
        if (found) setSelectedCat(found);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedCat) return;
    setSelectedModel(null);
    setSelectedRepair(null);
    setPrices([]);
    api.models(selectedCat.slug).then(r => { if (r.models) setModels(r.models); });
    api.repairTypes(selectedCat.id).then(r => { if (r.repair_types) setRepairTypes(r.repair_types); });
  }, [selectedCat]);

  useEffect(() => {
    if (!selectedModel) return;
    setLoading(true);
    api.priceList(selectedModel.id).then(r => {
      if (r.prices) setPrices(r.prices);
      setLoading(false);
    });
  }, [selectedModel]);

  const filteredPrices = selectedRepair
    ? prices.filter(p => p.repair_type === selectedRepair.name)
    : prices;

  const handleCatClick = (cat: Category) => {
    setSelectedCat(cat);
    setSearchParams({ device: cat.slug });
  };

  return (
    <div className="min-h-screen py-10">
      <div className="container">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-heading mb-3">Прайс-лист на ремонт</h1>
          <p className="text-muted-foreground">Выберите устройство, модель и тип ремонта</p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCatClick(cat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                selectedCat?.id === cat.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                  : 'border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={(ICON_MAP[cat.slug] || 'Smartphone') as any} size={16} />
              {cat.name}
            </button>
          ))}
        </div>

        {/* Model selector */}
        {models.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Выберите модель</h3>
            <div className="flex flex-wrap gap-2">
              {models.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                    selectedModel?.id === m.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Repair type filter */}
        {selectedModel && repairTypes.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Тип ремонта</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedRepair(null)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                  !selectedRepair
                    ? 'bg-accent text-accent-foreground border-primary/50'
                    : 'border-border bg-card hover:border-primary/50 text-muted-foreground'
                }`}
              >
                Все виды
              </button>
              {repairTypes.map(rt => (
                <button
                  key={rt.id}
                  onClick={() => setSelectedRepair(rt)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                    selectedRepair?.id === rt.id
                      ? 'bg-accent text-accent-foreground border-primary/50'
                      : 'border-border bg-card hover:border-primary/50 text-muted-foreground'
                  }`}
                >
                  {rt.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price table */}
        {loading && (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="Loader2" size={28} className="animate-spin mx-auto mb-2" />
            Загружаем цены...
          </div>
        )}

        {!loading && selectedModel && filteredPrices.length === 0 && (
          <div className="text-center py-12 ipro-card">
            <Icon name="Info" size={32} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">Цены на выбранный ремонт пока не указаны</p>
            <p className="text-sm text-muted-foreground">Оставьте заявку, и мы рассчитаем стоимость индивидуально</p>
          </div>
        )}

        {!loading && filteredPrices.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ipro-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left text-sm font-medium text-muted-foreground px-5 py-3">Вид ремонта</th>
                    <th className="text-right text-sm font-medium text-muted-foreground px-5 py-3">Стоимость</th>
                    <th className="text-right text-sm font-medium text-muted-foreground px-5 py-3 hidden sm:table-cell">Срок</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filteredPrices.map((p, i) => (
                    <tr key={p.id} className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${i % 2 === 0 ? '' : 'bg-secondary/10'}`}>
                      <td className="px-5 py-3.5 text-sm font-medium">{p.repair_type}</td>
                      <td className="px-5 py-3.5 text-right text-sm font-semibold text-primary">
                        от {p.price_from.toLocaleString('ru')} ₽
                        {p.price_to && <span className="text-muted-foreground font-normal"> – {p.price_to.toLocaleString('ru')} ₽</span>}
                      </td>
                      <td className="px-5 py-3.5 text-right text-sm text-muted-foreground hidden sm:table-cell">
                        {p.duration_hours < 24 ? `${p.duration_hours} ч` : `${Math.round(p.duration_hours / 24)} дн`}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-primary hover:text-primary hover:bg-primary/10 text-xs"
                          onClick={() => navigate(`/order?device=${selectedCat?.slug}&model=${selectedModel?.name}&repair=${p.repair_type}`)}
                        >
                          Записаться
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 bg-secondary/30 text-xs text-muted-foreground">
              * Если не нашли нужный вид ремонта — оставьте заявку, мы рассчитаем стоимость индивидуально
            </div>
          </motion.div>
        )}

        {/* Prompt to select model */}
        {!selectedModel && !loading && selectedCat && (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="ArrowUp" size={28} className="mx-auto mb-3 opacity-50" />
            <p>Выберите модель устройства выше, чтобы увидеть цены</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 text-center">
          <p className="text-muted-foreground mb-4">Не нашли своё устройство или нужен расчёт?</p>
          <Button size="lg" className="ipro-gradient text-white border-0 gap-2" onClick={() => navigate('/order')}>
            <Icon name="ClipboardList" size={18} />
            Оставить заявку на ремонт
          </Button>
        </div>
      </div>
    </div>
  );
}
