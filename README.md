# MofaKitchenBuddy
Tensor Titans for KUET Bitfest Hackathon

# MofaKitchenBuddy - Recipe Generation and Ingredient Management API

MofaKitchenBuddy is a recipe generation and ingredient management API that leverages the power of the Gemini AI model by Google. It allows you to manage ingredients, generate recipes based on available ingredients, and handle image uploads to receive recipe suggestions from food images.

## Features
- Add, delete, and list ingredients
- Generate recipes using AI based on user input and available ingredients
- Save recipes to a text file
- Upload images and generate recipe suggestions using AI

## Technologies Used
- **Node.js**: Backend server
- **Express.js**: Web framework for building the API
- **MongoDB & Mongoose**: For storing and managing ingredients
- **Google Generative AI (Gemini)**: For recipe generation from text and images
- **Multer**: For handling file uploads
- **CORS**: For cross-origin requests
- **dotenv**: For environment variable management

## Prerequisites
- Node.js 
- MongoDB running locally or a remote MongoDB instance
- A Google API key for the **Google Generative AI** model (Gemini)
- **Multer** for file uploads

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/MDTahsinAhammod/MofaKitchenBuddy
cd mofakitchenbuddy 
```

Install Dependency
```bash
npm i
```
Run the project
```bash
node server.js
```