import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDevice } from "../context/DeviceContext";
import GlassyDesktopDashboard from "../components/GlassyDesktopDashboard";
import MobileDashboard from "../components/MobileDashboard";

export default function Home() {
  const navigate = useNavigate();
  const { isDesktop } = useDevice();
  const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual") || "{}");

  const infoFechas = useMemo(() => {
    const ahora = new Date();
    
    // Configurar hora de Honduras (UTC-6)
    const opcionesHonduras = {
      timeZone: 'America/Tegucigalpa',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    };
    
    const fechaHonduras = ahora.toLocaleDateString('es-ES', opcionesHonduras);
    const horaHonduras = ahora.toLocaleTimeString('es-ES', {
      timeZone: 'America/Tegucigalpa',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Calcular días hasta Navidad
    let navidad = new Date(ahora.getFullYear(), 11, 25);
    if (ahora > navidad) {
      navidad = new Date(ahora.getFullYear() + 1, 11, 25);
    }
    const diasHastaNavidad = Math.max(0, Math.ceil((navidad - ahora) / (1000 * 60 * 60 * 24)));
    
    // Calcular días hasta Año Nuevo
    let añoNuevo = new Date(ahora.getFullYear() + 1, 0, 1);
    if (ahora > añoNuevo) {
      añoNuevo = new Date(ahora.getFullYear() + 2, 0, 1);
    }
    const diasHastaAñoNuevo = Math.max(0, Math.ceil((añoNuevo - ahora) / (1000 * 60 * 60 * 24)));

    return {
      fechaFormateada: fechaHonduras,
      hora: horaHonduras,
      diasNavidad: diasHastaNavidad,
      diasAñoNuevo: diasHastaAñoNuevo
    };
  }, []);

  const handleCerrarSesion = () => {
    localStorage.removeItem('usuarioActual');
    navigate("/login");
  };

  if (isDesktop) {
    return (
      <GlassyDesktopDashboard 
        usuario={usuarioActual}
        infoFechas={infoFechas}
        onLogout={handleCerrarSesion}
      />
    );
  }

  return (
    <MobileDashboard 
      usuario={usuarioActual}
      infoFechas={infoFechas}
      onLogout={handleCerrarSesion}
    />
  );
}