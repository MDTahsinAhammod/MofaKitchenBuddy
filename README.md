**MofaKitchenBuddy API**

## **Overview**

This API facilitates recipe generation using AI and ingredient management for the "MofaKitchenBuddy" application.

## **Technologies Used**

* Express.js  
* Mongoose  
* @google/generative-ai  
* cors  
* body-parser  
* multer  
* fs  
* path

## **Environment Variables**

* api\_key: Google Generative AI API key (required)  
* PORT: Server port (defaults to 3000\)

## **API Endpoints**

### **1\. Generate Recipe**

**POST** /generate

**Description:** Generates a recipe suggestion based on a user-provided prompt and available ingredients.

**Request Body:**

```JSON
{  
  "prompt": "I want to cook something with chicken and vegetables."  
}
```
**Example Request:**

```bash
curl -X POST http://localhost:3000/generate \
    -H "Content-Type: application/json" \
    -d '{"prompt": "I want to cook something sweet."}'
```
**Response Body:**

```JSON
{  
  "response": "Recipe Title: Rice Pudding Ingredients: * 1 cup cooked rice * 2 eggs * 2 cups milk * 1/4 cup sugar * 1/4 tsp vanilla extract * Ground cinnamon or nutmeg for topping (optional) Instructions: 1. In a medium bowl, whisk together the eggs, milk, sugar, and vanilla extract. 2. Add the cooked rice to the wet ingredients and stir until combined. 3. Pour the mixture into a greased 8-inch baking dish. 4. Bake at 350°F (175°C) for 45-55 minutes, or until the pudding is set and slightly golden on top. 5. Sprinkle with ground cinnamon or nutmeg, if desired, before serving."  
}
```
**Error Codes:**

* 400: Bad Request (missing prompt)  
* 500: Internal Server Error

### **2\. Add Ingredient**

**POST** /add-ingredient

**Description:** Adds a new ingredient.

**Request Body:**

```JSON
{  
  "name": "Sugar"  
}
```
**Example Request:**

```bash
curl -X POST http://localhost:3000/add-ingredient \
    -H "Content-Type: application/json" \
    -d '{"name": "Sugar"}'
```
**Response Body:**

```JSON
{  
  "message": "Ingredient added successfully",  
  "ingredient": {  
    "_id": "64f...",  
    "name": "Sugar"  
  }  
}
```
**Error Codes:**

* 400: Bad Request (missing ingredient name)  
* 500: Internal Server Error

### **3\. Get Ingredients**

**GET** /ingredients

**Description:** Retrieves all ingredients.

**Example Request:**

```bash
curl http://localhost:3000/ingredients
```
**Response Body:**

```JSON
{  
  "ingredients": [  
    {"_id": "64f...", "name": "Sugar"},  
    {"_id": "64f...", "name": "Salt"}  
  ]  
}
```
**Error Codes:**

* 500: Internal Server Error

### **4\. Delete Ingredient**

**DELETE** /delete-ingredient

**Description:** Deletes an ingredient by name.

**Request Body:**

```JSON
{  
  "name": "Sugar"  
}
```
**Example Request:**

```bash
curl -X DELETE http://localhost:3000/delete-ingredient \
    -H "Content-Type: application/json" \
    -d '{"name": "Sugar"}'
```
**Response Body:**

```JSON
{  
  "message": "Ingredient deleted successfully",  
  "ingredient": {  
    "_id": "64f...",  
    "name": "Sugar"  
  }  
}
```
**Error Codes:**

* 400: Bad Request (missing ingredient name)  
* 404: Not Found (ingredient not found)  
* 500: Internal Server Error

### **5\. Add Recipe (to File)**

**POST** /add-recipe

**Description:** Adds a recipe to my\_fav\_recipe.txt.

**Request Body:**

```JSON
{  
  "title": "Chocolate Cake",  
  "ingredients": "Flour, Sugar, Cocoa",  
  "instructions": "Mix ingredients and bake."  
}
```
**Example Request:**

```bash
curl -X POST http://localhost:3000/add-recipe \
    -H "Content-Type: application/json" \
    -d '{  
        "title": "Chocolate Cake",  
        "ingredients": "Flour, Sugar, Cocoa",  
        "instructions": "Mix ingredients and bake."  
    }'
```
**Response Body:**

```JSON
{  
  "message": "Recipe added successfully!"  
}
```
**Error Codes:**

* 400: Bad Request (missing fields)  
* 500: Internal Server Error

### **6\. Upload Image and Generate Recipe**

**POST** /upload-image

**Description:** Uploads an image, uses Gemini to analyze it, and generates a recipe.

**Request Body:**

Multipart form data with an images field containing the image file.

**Example Request:**

```bash
curl -X POST http://localhost:3000/upload-image \
    -F "images=@/path/to/image.jpg"
```
(Replace /path/to/image.jpg with the actual path to your image file.)

**Response Body:**

```JSON
{  
  "message": "Recipe added successfully!"  
}
```
**Error Codes:**

* 400: Bad Request (missing image)  
* 500: Internal Server Error

This revised documentation is much clearer and more practical for developers using your API. It provides concrete examples of how to make requests, which greatly improves usability.