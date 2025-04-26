// Este archivo es un punto de entrada para las solicitudes API
// Asegúrate de que las solicitudes a las rutas /api/* se dirijan a este archivo

import { handleRequest } from '../../api';

// Punto de entrada para todas las rutas /api/*
export const onGet = async ({ request, json }: any) => {
  // Test de API
  json(200, { success: true, message: 'API route is working properly!' });
};

export const onPost = async ({ request, json }: any) => {
  try {
    const response = await handleRequest(request);
    const data = await response.json();
    json(response.status, data);
  } catch (error) {
    console.error('Error en middleware API:', error);
    json(500, { error: 'Error interno del servidor', message: error instanceof Error ? error.message : String(error) });
  }
};

// Componente vacío para satisfacer requisitos de Qwik/Qwik City
export default () => null;