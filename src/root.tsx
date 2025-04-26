// DEBUG LOG: root.tsx loaded at runtime
import { component$ } from '@builder.io/qwik';
import App from './components/App';
import './styles/main.css';

/**
 * Componente raíz de la aplicación TUIKIGAI
 * Actúa como el contenedor principal que renderiza la App
 */
export default component$(() => {
  return (
    <div class="flex flex-col min-h-screen">
      <App />
    </div>
  );
});