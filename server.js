require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/MofaKitchenBuddy', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

// Define Ingredient schema and model
const ingredientSchema = new mongoose.Schema({
    name: { type: String, required: true },
});

const Ingredient = mongoose.model('Ingredient', ingredientSchema);

// Initialize the GoogleGenerativeAI library
const genAI = new GoogleGenerativeAI(process.env.api_key);

// Set up the Express app
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Async function to get AI response
async function run(prompt) {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
    return text;
}

// Route to handle POST requests for AI prompt
app.post('/generate', async (req, res) => {
    let { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const ingredients = await Ingredient.find();
        const ingredientNames = ingredients.map(ingredient => ingredient.name.toLowerCase()).join(',');
        prompt = prompt + ' i have these ingredients ' + ingredientNames;
        console.log('Prompt:', prompt);
        const aiResponse = await run(prompt);
        res.json({ response: aiResponse });
    } catch (error) {
        console.error('Error generating AI response:', error);
        res.status(500).json({ error: 'Failed to generate AI response' });
    }
});

// Route to handle adding an ingredient
app.post('/add-ingredient', async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Ingredient name is required' });
    }

    try {
        const newIngredient = new Ingredient({ name });
        await newIngredient.save();
        res.status(201).json({ message: 'Ingredient added successfully', ingredient: newIngredient });
    } catch (error) {
        console.error('Error adding ingredient:', error);
        res.status(500).json({ error: 'Failed to add ingredient' });
    }
});

// Route to fetch all ingredients
app.get('/ingredients', async (req, res) => {
    try {
        const ingredients = await Ingredient.find();
        res.status(200).json({ ingredients });
    } catch (error) {
        console.error('Error fetching ingredients:', error);
        res.status(500).json({ error: 'Failed to fetch ingredients' });
    }
});

// Route to handle deleting an ingredient by name
app.delete('/delete-ingredient', async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Ingredient name is required' });
    }

    try {
        const deletedIngredient = await Ingredient.findOneAndDelete({ name });

        if (!deletedIngredient) {
            return res.status(404).json({ error: 'Ingredient not found' });
        }

        res.status(200).json({ message: 'Ingredient deleted successfully', ingredient: deletedIngredient });
    } catch (error) {
        console.error('Error deleting ingredient:', error);
        res.status(500).json({ error: 'Failed to delete ingredient' });
    }
});

// Route to add a recipe to a file
app.post('/add-recipe', (req, res) => {
    const { title, ingredients, instructions } = req.body;

    if (!title || !ingredients || !instructions) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    const recipeContent = `
    Recipe Title: ${title}
    Ingredients: ${ingredients}
    Instructions: ${instructions}
    -------------------------------
    `;
    
    const filePath = path.join(__dirname, 'my_fav_recipe.txt');
    
    fs.appendFile(filePath, recipeContent, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to save the recipe' });
        }

        res.status(200).json({ message: 'Recipe added successfully!' });
    });
});

// Helper function to convert file to generative part
function fileToGenerativePart(filePath, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(filePath)).toString('base64'),
            mimeType,
        },
    };
}

const upload = multer({ dest: 'uploads/' });

// Route to handle image upload and generate response from Gemini model
app.post('/upload-image', upload.array('images', 1), async (req, res) => {
    if (!req.files || req.files.length < 1) {
        return res.status(400).json({ error: 'Please upload an image' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = 'What is the food in the image? How can I cook it? Please return the recipe in the format `Recipe Title: ..., Ingredients: ..., Instructions: ...`.';

        const imageParts = req.files.map((file) =>
            fileToGenerativePart(file.path, file.mimetype)
        );

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();
        
        const recipeContent = text;
        const filePath = path.join(__dirname, 'my_fav_recipe.txt');

        fs.appendFile(filePath, recipeContent, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to save the recipe' });
            }

            res.status(200).json({ message: 'Recipe added successfully!' });
        });

        console.log('Recipe:', text);
    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ error: 'Failed to process image' });
    }
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
