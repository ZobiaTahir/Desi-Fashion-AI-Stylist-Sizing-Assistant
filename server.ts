import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { generateAtelierFallback } from './src/server/atelierFallback.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini client to avoid crashes if key is initially absent
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Ordered candidate models
const CANDIDATE_MODELS = [
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-3.1-pro-preview',
];

// In-memory model cooldown tracking to avoid repeatedly hammering exhausted quotas
const modelCooldowns = new Map<string, number>();

function isModelAvailable(model: string): boolean {
  const cooldownUntil = modelCooldowns.get(model);
  if (!cooldownUntil) return true;
  if (Date.now() >= cooldownUntil) {
    modelCooldowns.delete(model);
    return true;
  }
  return false;
}

function parseRetryDelayMs(err: any): number {
  try {
    const errStr = String(err?.message || err || '');
    const match = errStr.match(/"retryDelay":\s*"(\d+)s"/i) || errStr.match(/retry in\s*([\d.]+)s/i);
    if (match && match[1]) {
      const sec = parseFloat(match[1]);
      if (!isNaN(sec) && sec > 0) {
        return Math.ceil(sec * 1000);
      }
    }
  } catch (e) {
    // ignore
  }
  return 45000; // default 45s cooldown
}

function markModelCooldown(model: string, durationMs: number = 45000) {
  modelCooldowns.set(model, Date.now() + durationMs);
  console.log(`[Atelier Routing] Model ${model} is cooling down for ${Math.round(durationMs / 1000)}s`);
}

const SYSTEM_INSTRUCTION = `You are "Noor", the AI Stylist and Fit Consultant for South Asian clothing boutique "Zari & Silk".

CRITICAL RULES — ABSOLUTE CLARITY & BREVITY:
1. NO FILLER OR GREETINGS: NEVER start with greetings ("Hello", "Welcome to Zari & Silk", "I'd love to help") or sign-offs ("Let me know if you need anything else", "Hope this helps"). Start immediately with the direct answer.
2. NO IRRELEVANT TOPICS: Answer ONLY what is explicitly asked.
   - If asked about sizing: give only the size, ease margin, and measurements. Do not mention jewelry, makeup, or events.
   - If asked about an outfit or color for an event: give only 2 concise outfit options with silhouette, fabric, and color. Do not give unsolicited sizing lectures.
   - If asked about blouse necklines: answer only the necklines and cuts.
3. NO REDUNDANCY: State each point once. Never repeat the user's prompt or rephrase points under multiple headings.
4. STRICT LENGTH LIMIT: Max 120-180 words. Use concise, scannable bullet points with bold keywords.
5. SIZING FORMAT (when sizing is asked):
   - **Recommended Size:** [Size & Letter, e.g. Size 38 (M)]
   - **Finished Garment Bust:** [Measurement, e.g. 40.5" (+2.5" ease)]
   - **Ease Rule:** Desi fabrics have zero stretch; kurtas need +2" to +2.5" ease for sitting/moving; blouses need +0.5" to +1" ease.
   - **Seam Margin:** Outfits have 2" inside margins for local adjustments.
6. STYLING FORMAT (when styling is asked):
   - **Option 1:** Silhouette • Fabric • Color • 1 accessory note.
   - **Option 2:** Silhouette • Fabric • Color • 1 accessory note.
   - **Key Tip:** 1 single sentence on practical execution.`;

// API: Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Zari & Silk Desi Fashion AI Stylist',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// API: Trends list for quick discovery
app.get('/api/trends', (req, res) => {
  res.json({
    trends: [
      {
        id: 'pastel-heritage',
        title: 'Pastel Regality & Ivory Champagne',
        category: 'Bridal & Reception',
        description: 'Soft blush, sage green, and champagne ivory lehengas with delicate tone-on-tone resham and pearl work, replacing traditional heavy crimson.',
        fabrics: ['Organza', 'Tissue Silk', 'Raw Silk'],
        colors: ['Champagne Ivory', 'Dusty Rose', 'Sage Green', 'Powder Blue'],
        recommendedFor: 'Reception, Walima, Day Weddings',
      },
      {
        id: 'scalloped-organza',
        title: 'Scalloped Gota Organza Dupattas',
        category: 'Dupatta & Draping',
        description: 'Airy sheer organza dupattas edged with delicate scalloped cutwork and handcrafted gold gota patti that frame the neckline gracefully.',
        fabrics: ['Pure Organza', 'Gota Patti'],
        colors: ['Lemon Sorbet', 'Peach', 'Pistachio', 'Lavender'],
        recommendedFor: 'Mehndi, Sangeet, Festive Pooja',
      },
      {
        id: 'chikankari-pearl',
        title: 'Lucknowi Chikankari with Mukaish',
        category: 'Everyday & Festive Luxury',
        description: 'Fine shadow-work embroidery on mulmul and chanderi, accented with shimmering mukaish specks and pearl latkans.',
        fabrics: ['Georgette', 'Mulmul Cotton', 'Chanderi'],
        colors: ['Ivory', 'Mint Green', 'Lilac', 'Butter Yellow'],
        recommendedFor: 'Haldi, Daytime Eid, Summer Soirées',
      },
      {
        id: 'concept-sarees',
        title: 'Pre-Draped Concept Sarees',
        category: 'Cocktail & Contemporary',
        description: 'Zero-fuss pleated silhouettes with metallic waist belts, cape blouses, or structured blazer overlays for modern desi cocktail nights.',
        fabrics: ['Liquid Satin', 'Crepe', 'Metallic Lurex'],
        colors: ['Emerald Green', 'Wine Red', 'Midnight Navy', 'Bronze'],
        recommendedFor: 'Sangeet After-Party, Cocktail Night',
      },
      {
        id: 'mens-textured-bundi',
        title: "Men's Asymmetrical Kurta & Bundi",
        category: "Men's Festive",
        description: 'Textured raw silk bundi (Nehru jacket) worn over cowl or asymmetrical hem kurtas paired with tapered churidar pants.',
        fabrics: ['Raw Silk', 'Tussar Silk', 'Jacquard'],
        colors: ['Rust Ochre', 'Sage', 'Teal Navy', 'Pecan Brown'],
        recommendedFor: 'Groom Squad, Sangeet, Engagement',
      },
    ],
  });
});

// API: Sizing consultation calculator logic
app.post('/api/sizing-consult', (req, res) => {
  const { gender = 'female', bust, waist, hips, height, fitPreference = 'regular' } = req.body;
  const bustNum = parseFloat(bust);
  const waistNum = parseFloat(waist);
  const hipsNum = parseFloat(hips);

  if (isNaN(bustNum)) {
    return res.status(400).json({ error: 'Please provide a valid bust/chest measurement in inches.' });
  }

  // South Asian standard kurta sizing (based on bust measurement in inches)
  let standardSize = 'M';
  let sizeLabel = 'Size 38';
  let easeAddition = fitPreference === 'fitted' ? 1.5 : fitPreference === 'modest' ? 3.5 : 2.5;

  if (bustNum < 33) {
    standardSize = 'XS';
    sizeLabel = 'Size 32 - 34';
  } else if (bustNum <= 35) {
    standardSize = 'S';
    sizeLabel = 'Size 36';
  } else if (bustNum <= 37) {
    standardSize = 'M';
    sizeLabel = 'Size 38';
  } else if (bustNum <= 39) {
    standardSize = 'L';
    sizeLabel = 'Size 40';
  } else if (bustNum <= 41) {
    standardSize = 'XL';
    sizeLabel = 'Size 42';
  } else if (bustNum <= 44) {
    standardSize = 'XXL (2XL)';
    sizeLabel = 'Size 44';
  } else if (bustNum <= 47) {
    standardSize = '3XL';
    sizeLabel = 'Size 46';
  } else {
    standardSize = 'Custom Bespoke Stitch';
    sizeLabel = 'Custom Made-to-Measure';
  }

  const finishedGarmentBust = bustNum + easeAddition;

  // Lehenga skirt recommendation
  let lehengaLengthEst = '';
  if (height) {
    const heightNum = parseFloat(height);
    if (!isNaN(heightNum)) {
      // rough heuristic: navel to floor is approx height * 0.60
      const skirtInches = Math.round(heightNum * 0.60);
      lehengaLengthEst = `${skirtInches}" to ${skirtInches + 2}" (add +2" if wearing 3-inch heels)`;
    }
  }

  res.json({
    recommendedSize: standardSize,
    sizeNumber: sizeLabel,
    userMeasurements: { bust: bustNum, waist: waistNum || null, hips: hipsNum || null },
    finishedGarmentBust: `${finishedGarmentBust.toFixed(1)} inches`,
    fitEase: `+${easeAddition}" allowance for comfort & armhole mobility`,
    seamAllowance: 'All boutique garments come with a 2-inch internal seam margin on both sides for effortless local adjustments.',
    lehengaLengthEstimate: lehengaLengthEst || 'Measure from navel to floor including your intended footwear.',
    choliBlouseTip: 'For unpadded blouse/choli, stick strictly to your exact bust size. If padded cups are preferred, choose 1 size up for a flattering drape.',
  });
});

// API: Chat endpoint with streaming support (Server-Sent Events)
app.post('/api/chat/stream', async (req, res) => {
  const { messages, customerContext } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  let ai;
  try {
    ai = getGeminiClient();
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Gemini API not configured' });
  }

  // Format context cleanly only if values actually exist
  let contextSnippet = '';
  if (customerContext) {
    const parts = [];
    if (customerContext.name?.trim()) parts.push(`Customer: ${customerContext.name.trim()}`);
    if (customerContext.measurements?.bust?.trim()) parts.push(`Bust: ${customerContext.measurements.bust.trim()}"`);
    if (customerContext.measurements?.waist?.trim()) parts.push(`Waist: ${customerContext.measurements.waist.trim()}"`);
    if (customerContext.measurements?.hips?.trim()) parts.push(`Hips: ${customerContext.measurements.hips.trim()}"`);
    if (customerContext.measurements?.height?.trim()) parts.push(`Height: ${customerContext.measurements.height.trim()}`);
    if (customerContext.occasion?.trim()) parts.push(`Event: ${customerContext.occasion.trim()}`);
    if (customerContext.stylePreference?.trim()) parts.push(`Fit: ${customerContext.stylePreference.trim()}`);
    if (parts.length > 0) {
      contextSnippet = `\n[Profile: ${parts.join(', ')}]`;
    }
  }

  // Build contents array for Gemini
  // Gemini 3.8 Flash takes contents: string | Part | (string | Part)[] | Content[]
  const contents = messages.map((m: any) => ({
    role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
    parts: [{ text: m.content || m.text || '' }],
  }));

  // Append context to the last user message if available
  if (contextSnippet && contents.length > 0) {
    const lastIdx = contents.length - 1;
    if (contents[lastIdx].role === 'user') {
      contents[lastIdx].parts[0].text += contextSnippet;
    }
  }

  // Set headers for Server-Sent Events (SSE)
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  let streamSucceeded = false;

  for (const modelName of CANDIDATE_MODELS) {
    if (!isModelAvailable(modelName)) {
      continue;
    }

    try {
      const stream = await ai.models.generateContentStream({
        model: modelName,
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.2,
          maxOutputTokens: 450,
        },
      });

      let hadText = false;
      for await (const chunk of stream) {
        const text = chunk.text || '';
        if (text) {
          hadText = true;
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      if (hadText) {
        streamSucceeded = true;
        res.write(`data: [DONE]\n\n`);
        res.end();
        break;
      }
    } catch (err: any) {
      const retryMs = parseRetryDelayMs(err);
      markModelCooldown(modelName, retryMs);
      console.log(`[Atelier Routing] Switching from ${modelName} to next styling channel...`);
      continue;
    }
  }

  // If all Gemini models hit quota exhaustion (429) or high demand (503), fall back smoothly to the Atelier Engine
  if (!streamSucceeded) {
    console.log('[Atelier Routing] Serving consultation via Zari & Silk Atelier Engine.');
    try {
      const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content || '';
      const fallbackText = generateAtelierFallback(lastUserMessage, customerContext);

      // Stream fallback in readable paragraph chunks
      const paragraphs = fallbackText.split('\n\n');
      for (const para of paragraphs) {
        res.write(`data: ${JSON.stringify({ text: para + '\n\n' })}\n\n`);
      }
      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (fallbackErr: any) {
      console.log('[Atelier Routing] Fallback notice, sending friendly notice');
      res.write(`data: ${JSON.stringify({ error: 'Our boutique stylists are experiencing high consultation traffic. Please refresh or try again momentarily.' })}\n\n`);
      res.end();
    }
  }
});

// Non-streaming fallback endpoint
app.post('/api/chat', async (req, res) => {
  const { messages, customerContext } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  let ai;
  try {
    ai = getGeminiClient();
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Gemini API not configured' });
  }

  let contextSnippet = '';
  if (customerContext) {
    contextSnippet = `\n\n[CUSTOMER PROFILE IN CONTEXT:
${customerContext.name ? `- Name: ${customerContext.name}` : ''}
${customerContext.occasion ? `- Upcoming Event: ${customerContext.occasion}` : ''}
${customerContext.measurements ? `- Provided Measurements: Bust: ${customerContext.measurements.bust || 'N/A'}", Waist: ${customerContext.measurements.waist || 'N/A'}", Hips: ${customerContext.measurements.hips || 'N/A'}"` : ''}
${customerContext.stylePreference ? `- Style Preference: ${customerContext.stylePreference}` : ''}
]`;
  }

  const contents = messages.map((m: any) => ({
    role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
    parts: [{ text: m.content || m.text || '' }],
  }));

  if (contextSnippet && contents.length > 0) {
    const lastIdx = contents.length - 1;
    if (contents[lastIdx].role === 'user') {
      contents[lastIdx].parts[0].text += contextSnippet;
    }
  }

  let responseText = '';
  let succeeded = false;

  for (const modelName of CANDIDATE_MODELS) {
    if (!isModelAvailable(modelName)) {
      continue;
    }

    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.2,
          maxOutputTokens: 450,
        },
      });
      responseText = response.text || '';
      if (responseText) {
        succeeded = true;
        break;
      }
    } catch (err: any) {
      const retryMs = parseRetryDelayMs(err);
      markModelCooldown(modelName, retryMs);
      console.log(`[Atelier Routing] Switching from ${modelName} in non-stream route...`);
      continue;
    }
  }

  if (!succeeded) {
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content || '';
    responseText = generateAtelierFallback(lastUserMessage, customerContext);
  }

  res.json({ text: responseText });
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
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
    console.log(`Zari & Silk Stylist Server listening on port ${PORT}`);
  });
}

startServer();
