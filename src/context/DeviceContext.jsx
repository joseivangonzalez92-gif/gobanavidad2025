import React, { createContext, useContext, useState, useEffect } from 'react';

const DeviceContext = createContext();

export function DeviceProvider({ children }) {
  // 'auto' | 'desktop' | 'mobile'
  const [deviceMode, setDeviceMode] = useState(() => {
    return localStorage.getItem('goba_device_preference') || 'auto';
  });

  const [windowWidth, setWindowWidth] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const changeDeviceMode = (mode) => {
    setDeviceMode(mode);
    localStorage.setItem('goba_device_preference', mode);
  };

  const isDesktop = deviceMode === 'desktop' 
    ? true 
    : deviceMode === 'mobile' 
      ? false 
      : windowWidth >= 768;

  return (
    <DeviceContext.Provider value={{ deviceMode, changeDeviceMode, isDesktop, windowWidth }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
}
