import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

interface City {
  id: number;
  name: string;
  phone: string;
  address: string;
  telegram: string;
}

interface CityContextType {
  cities: City[];
  selectedCity: City | null;
  setSelectedCity: (city: City) => void;
}

const CityContext = createContext<CityContextType | null>(null);

export function CityProvider({ children }: { children: ReactNode }) {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCityState] = useState<City | null>(null);

  useEffect(() => {
    api.cities().then(res => {
      if (res.cities) {
        setCities(res.cities);
        const savedId = localStorage.getItem('ipro_city');
        const found = savedId ? res.cities.find((c: City) => c.id === parseInt(savedId)) : null;
        setSelectedCityState(found || res.cities[0]);
      }
    });
  }, []);

  const setSelectedCity = (city: City) => {
    setSelectedCityState(city);
    localStorage.setItem('ipro_city', String(city.id));
  };

  return (
    <CityContext.Provider value={{ cities, selectedCity, setSelectedCity }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error('useCity must be used within CityProvider');
  return ctx;
}
