
  # Farm.ai Backend Integration Guide

We've built the backend you asked for! It runs on **Node.js** with **Express**.

## 1. Start the Backend Server

Navigate to the backend directory and start it up:

\`\`\`bash
cd /Users/kevinanthonypamisetti/.gemini/antigravity/scratch/farm-ai/backend
node index.js
\`\`\`
*(Make sure \`npm install\` completes first if it hasn't already).*

The server will run at \`http://localhost:5000\`.

web application/stitch/projects/14344145786113587410/screens/6e59242af395416ab82e90a2c76bfcec## 2. Connect Your Frontend

You provided a very advanced front-end HTML file. Towards the bottom of your \`farm-ai.html\` file, you have your Javascript block (e.g., \`<script>\`). Replace your simulated JS functions (like \`askAI\`, \`calculateProfit\`, and \`handleFileUpload\`) with these actual API calls:

\`\`\`javascript
// 1. CHAT / AI RECOMMENDATIONS API
async function askAI(prompt) {
  try {
    const res = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, context: { location: "Nashik, Maharashtra" } })
    });
    const data = await res.json();
    
    // Process response based on your UI
    // Ex: document.getElementById('ai-action-text').innerText = data.reply;
    alert("Farm.ai: " + data.reply);
  } catch (err) {
    console.error("Chat API failed:", err);
  }
}

// 2. PROFIT CALCULATOR API
async function calculateProfit() {
  const crop = document.getElementById('pc-crop').value;
  const land = document.getElementById('pc-land').value;
  // Fallbacks if elements are omitted
  const costs = document.getElementById('pc-seeds')?.value || 5000;
  const revenue = document.getElementById('pc-price')?.value || 25000;

  document.getElementById('profit-results').style.display = 'block';

  try {
    const res = await fetch('http://localhost:5000/api/profit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ crop, land, costs, revenue })
    });
    const data = await res.json();

    document.getElementById('pr-revenue').innerText = '₹' + data.revenue;
    document.getElementById('pr-cost').innerText = '₹' + data.costs;
    document.getElementById('pr-profit').innerText = '₹' + data.profit;
    document.getElementById('pr-roi').innerText = 'ROI: ' + data.roi;
  } catch (err) {
    console.error("Profit API failed:", err);
  }
}

// 3. IMAGE SCANNER API 
async function handleFileUpload(e) {
  const file = e.target.files?.[0];
  if(!file) return;
  
  const formData = new FormData();
  formData.append('image', file);
  
  // Show UI panel and loading spinner
  document.getElementById('result-panel').classList.add('show');
  
  try {
    const res = await fetch('http://localhost:5000/api/scan', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    
    document.getElementById('result-inner').innerHTML = \`
      <h3 class="result-header">Disease: \${data.disease}</h3>
      <p class="result-subhead">Confidence: \${data.confidence} | Severity: \${data.severity}</p>
      <div class="result-content">
        <strong>Treatment:</strong> \${data.treatment}<br><br>
        <strong>Estimated Cost:</strong> \${data.estimatedCost}
      </div>
    \`;
  } catch (err) {
    console.error("Scan API failed:", err);
    document.getElementById('result-inner').innerHTML = '<p>Scan failed.</p>';
  }
}
\`\`\`

## 3. Test!
Now when you click elements in your UI, they will talk directly to the Node.js backend. You can open up \`backend/index.js\` if you want to extend it, add OpenAI keys, database connections, Authentication, etc.
