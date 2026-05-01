require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { OpenAI } = require('openai');

const app = express();
const port = process.env.PORT || 5001;

// Initialize OpenAI client
// Ensure you have OPENAI_API_KEY in your .env file
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Set up multer for file uploads
const storage = multer.memoryStorage(); // Store in memory for simple AI mocking
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());

// Serve static frontend files if needed
// app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.json({ message: 'Farm.ai Backend is running! 🚜' });
});

// 1. Scanner API: Predicts disease from an image
app.post('/api/scan', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
    
    // Convert image buffer to base64 for OpenAI Vision
    const base64Image = req.file.buffer.toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${base64Image}`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert crop pathologist for Indian agriculture. Analyze the provided crop image and respond strictly in JSON format with keys: `disease`, `confidence` (percentage string), `severity` (low, medium, or high), `treatment` (specific action), and `estimatedCost` (cost in ₹ per acre)."
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this crop image and output JSON." },
            { type: "image_url", image_url: { url: dataUri } }
          ],
        },
      ],
      response_format: { type: "json_object" }
    });
    
    const aiResult = JSON.parse(response.choices[0].message.content);
    res.json(aiResult);
  } catch (error) {
    console.error('Error in /api/scan:', error);
    res.status(500).json({ error: 'Failed to process image with AI' });
  }
});

// 2. AI Chat / Advice API
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, context } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: 'You are "KRISHI-VEER AI", an intelligent agricultural decision system built for Indian farmers. Do not give generic advice. Always output financial figures in ₹. Keep your answers short, clear, and perfectly tailored to their farm context.'
        },
        { 
          role: 'user', 
          content: `Context: Location=${context?.location || 'Unknown'}, Season=${context?.season || 'Unknown'}\n\nFarmer Query: ${prompt}` 
        }
      ]
    });
    
    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'AI processing failed' });
  }
});

// 3. Profit Calculator API
app.post('/api/profit', async (req, res) => {
  try {
    const { crop, land, costs, revenue } = req.body;
    
    const numericCosts = Number(costs) || 0;
    const numericRevenue = Number(revenue) || 0;
    
    const profit = numericRevenue - numericCosts;
    const roi = numericCosts > 0 ? ((profit / numericCosts) * 100).toFixed(1) : 0;
    
    // Mock risk adjustments
    const bestCase = profit * 1.2;
    const worstCase = profit * 0.7;
    
    res.json({
      revenue: numericRevenue,
      costs: numericCosts,
      profit: profit,
      roi: `${roi}%`,
      breakEvenPrice: numericCosts / (Number(land) * 10 || 1), // Fake yield assumption
      scenarios: {
        best: bestCase,
        likely: profit,
        worst: worstCase
      },
      aiAnalysis: `Based on your inputs for ${crop} over ${land} acres, your net profit is expected to be ₹${profit}. A ${roi}% ROI is achievable given current market stability.`
    });
  } catch (error) {
    console.error('Error in /api/profit:', error);
    res.status(500).json({ error: 'Calculation failed' });
  }
});

// 4. Market Prices API
app.get('/api/market', async (req, res) => {
  try {
    const queryCrop = req.query.crop || 'Tomato';
    
    res.json({
      crop: queryCrop,
      location: 'Nashik APMC',
      currentPrice: '₹' + Math.floor(Math.random() * 50 + 10) + '/kg',
      trend: Math.random() > 0.5 ? 'UP' : 'DOWN',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /api/market:', error);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

// 4. Livestock Planner API
app.post('/api/livestock', async (req, res) => {
  try {
    const { animals, land, fodder, budget, crops } = req.body;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert Indian agriculturist and animal husbandry advisor. Analyze the farmer's resources and selected animals, and recommend a synergistic livestock plan. Output in strict JSON with: `recommendedPlan` (e.g. '4-6 Murrah Buffaloes'), `monthlyIncome` (number, ₹), `breakEven` (string like '8 Months'), `circularTip` (a tip about using manure/waste), and `savings` (number, ₹)."
        },
        {
          role: "user",
          content: `Selected Animals: ${animals.join(', ')}. Land: ${land} acres. Fodder Area: ${fodder} acres. Budget: ₹${budget}. Main Crops: ${crops}.`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    res.json(JSON.parse(response.choices[0].message.content));
  } catch (error) {
    console.error('Error in /api/livestock:', error);
    res.status(500).json({ error: 'Failed to generate livestock plan.' });
  }
});

// 5. Contract Farming Analyzer API
app.post('/api/contract', async (req, res) => {
  try {
    const { crop, contractType, splitText } = req.body;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a legal agricultural advisor for Indian farmers. Analyze the proposed contract terms for fairness. Output strict JSON with: `score` (0-100), `label` ('FAIR DEAL', 'RISKY', or 'UNFAIR'), `reason` (short sentence why), `negotiationTip` (1 sentence advice)."
        },
        {
          role: "user",
          content: `Crop: ${crop}. Contract Type: ${contractType}. Terms: ${splitText}`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    res.json(JSON.parse(response.choices[0].message.content));
  } catch(error) {
    console.error('Error in /api/contract:', error);
    res.status(500).json({ error: 'Failed to analyze contract.' });
  }
});

app.listen(port, () => {
  console.log(`✅ Farm.ai Backend API running at http://localhost:${port}`);
});
