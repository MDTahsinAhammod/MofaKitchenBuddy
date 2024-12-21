const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors');



const genAI = new GoogleGenerativeAI('AIzaSyA4tOFsFYtZjrvZLe2-uIaLDIi7K4dypfo');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
// Middleware to parse JSON request body
app.use(bodyParser.json());

// Async function to get AI response
async function run(prompt) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
    return text;
}

// Route to handle POST requests for AI prompt
app.post('/generate', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    const aiResponse = await run(prompt);
    res.json({ response: aiResponse });
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});