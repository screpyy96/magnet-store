'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Providers from '@/components/Providers'

export default function ClientLayout({ children }) {
  // State pentru a verifica dacă suntem în browser
  const [isClient, setIsClient] = useState(false);

  // Setăm isClient la true doar după primul render
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Provider store={store}>
      {isClient ? (
        // Afișăm PersistGate doar pe client
        <PersistGate loading={null} persistor={persistor}>
          <Providers>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow pt-16 pb-20 sm:pb-8 bg-cream">{children}</main> 
              <Footer />
            </div>
          </Providers>
        </PersistGate>
      ) : (
        // Pe server, nu folosim PersistGate
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow pt-16 pb-20 sm:pb-8 bg-cream">{children}</main> 
          <Footer />
        </div>
      )}
    </Provider>
  );
} 