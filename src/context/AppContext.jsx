import { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [days, setDays] = useState([]);
  const [fixedCosts, setFixedCosts] = useState(0);

  useEffect(() => {
    const savedDays = localStorage.getItem('days');
    const savedCosts = localStorage.getItem('fixedCosts');

    if (savedDays) setDays(JSON.parse(savedDays));
    if (savedCosts) setFixedCosts(Number(savedCosts));
  }, []);

  useEffect(() => {
    localStorage.setItem('days', JSON.stringify(days));
    localStorage.setItem('fixedCosts', fixedCosts);
  }, [days, fixedCosts]);

  function addDay(day) {
    setDays((prev) => [...prev, day]);
  }

  function updateFixedCosts(value) {
    setFixedCosts(value);
  }

  return (
    <AppContext.Provider value={{ days, addDay, fixedCosts, updateFixedCosts }}>
      {children}
    </AppContext.Provider>
  );
}
