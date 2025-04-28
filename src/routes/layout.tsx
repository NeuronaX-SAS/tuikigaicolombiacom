import { component$, Slot } from '@builder.io/qwik';
import { type RequestHandler } from '@builder.io/qwik-city';
import Footer from '../components/sections/Footer'; // Use relative path

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.dev/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max age of 5 minutes, revalidate in the background to ensure freshness
    maxAge: 5 * 60,
  });
};

export default component$(() => {
  return (
    <div class="flex flex-col min-h-screen"> {/* Optional: Add base layout styling if needed */}
      <main class="flex-grow">
        {/* Slot renders the content of the specific page route */}
        <Slot />
      </main>
      <Footer /> {/* Render the Footer component after the main page content */}
    </div>
  );
});