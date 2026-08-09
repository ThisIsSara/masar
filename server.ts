import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { loadRiyadhPlaces } from './src/riyadhPlaces';
import { generateGeminiItinerary } from './src/geminiPlanner';
import type { GeminiTripPreferences } from './src/itineraryContract';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for itinerary generation
  app.post('/api/plan', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({
          success: false,
          error:
            'GEMINI_API_KEY environment variable is not configured on the server.',
        });
        return;
      }

      const prefs = req.body as GeminiTripPreferences;
      if (!prefs || !prefs.startTime || !prefs.endTime) {
        res.status(400).json({
          success: false,
          error: 'Invalid trip preferences provided.',
        });
        return;
      }

      const placeCandidates = await loadRiyadhPlaces();
      const request = {
        ...prefs,
        city: 'Riyadh' as const,
        placeCandidates,
      };

      const result = await generateGeminiItinerary(request, apiKey);
      res.json({ success: true, itinerary: result });
    } catch (err: any) {
      console.error('Error generating Gemini itinerary:', err);
      res.status(500).json({
        success: false,
        error: err?.message || 'Failed to generate itinerary with Gemini.',
      });
    }
  });

  // Health check route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
