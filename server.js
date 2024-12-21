const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require("multer");


// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/MofaKitchenBuddy', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

// Define the Ingredient schema and model
const ingredientSchema = new mongoose.Schema({
    name: { type: String, required: true },
});

const Ingredient = mongoose.model('Ingredient', ingredientSchema);

// Initialize the GoogleGenerativeAI library
const genAI = new GoogleGenerativeAI('AIzaSyA4tOFsFYtZjrvZLe2-uIaLDIi7K4dypfo');

// Set up the Express app
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
    let { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const ingredients = await Ingredient.find();
        const ingredientNames = ingredients.map(ingredient => ingredient.name.toLowerCase()).join(',');
        //console.log(ingredientNames);
        prompt = prompt + 'i have these ingredients ' + ingredientNames;
        console.log('Prompt:',prompt);
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

app.get('/ingredients', async (req, res) => {
    try {
        const ingredients = await Ingredient.find();
        const ingredientNames = ingredients.map(ingredient => ingredient.name.toLowerCase()).join(',');
        console.log(ingredientNames);
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
        // Find and delete the ingredient by name
        const deletedIngredient = await Ingredient.findOneAndDelete({ name: name });

        if (!deletedIngredient) {
            return res.status(404).json({ error: 'Ingredient not found' });
        }

        res.status(200).json({ message: 'Ingredient deleted successfully', ingredient: deletedIngredient });
    } catch (error) {
        console.error('Error deleting ingredient:', error);
        res.status(500).json({ error: 'Failed to delete ingredient' });
    }
});


app.post('/add-recipe', (req, res) => {
    const { title, ingredients, instructions } = req.body;

    // Ensure all fields are provided
    if (!title || !ingredients || !instructions) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    // Format the recipe data
    const recipeContent = `
    Recipe Title: ${title}
    Ingredients: ${ingredients}
    Instructions: ${instructions}
    -------------------------------
    `;

    // Define the file path where the recipe will be saved
    const filePath = path.join(__dirname, 'my_fav_recipe.txt');

    // Append the new recipe to the text file
    fs.appendFile(filePath, recipeContent, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to save the recipe' });
        }

        // Successfully saved the recipe
        res.status(200).json({ message: 'Recipe added successfully!' });
    });
});

function fileToGenerativePart(path, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(path)).toString("base64"),
            mimeType,
        },
    };
}

const upload = multer({ dest: "uploads/" });
// Route to handle image upload and generate response from Gemini model
app.post("/upload-image", upload.array("images", 1), async (req, res) => {
    if (!req.files || req.files.length < 1) {
        return res.status(400).json({ error: "Please upload" });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = "what is the food in the image? How can i cook it?but give me only the info of  `Recipe Title: ...., Ingredients: .........,Instructions: .........,` in this format";

        // Convert both uploaded images to the required format for the Gemini model
        const imageParts = req.files.map((file) =>
            fileToGenerativePart(file.path, file.mimetype)
        );

        // Generate response from Gemini model
        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();

        // Return the response from Gemini model
        console.log('Recipe',text);
        res.status(200).json({ response: text });
    } catch (error) {
        console.error("Error processing images:", error);
        res.status(500).json({ error: "Failed to process images" });
    }
});


// Start the Express server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
