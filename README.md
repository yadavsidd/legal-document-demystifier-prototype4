# Legal Document Demystifier

An AI-powered web application designed to help users understand, analyze, edit, and translate complex legal documents and forms. Built with React, TypeScript, and the Google Gemini API, this tool transforms dense legal text into simple, actionable insights.

## ✨ Key Features

This application is composed of several powerful, AI-driven modules:

*   **📄 Document Analyzer:**
    *   Upload a document (PDF, TXT, image) or paste text to receive a comprehensive analysis.
    *   Get a concise summary, a list of potential issues and red flags, key clause explanations, and a timeline of important dates.
    *   **Interactive Editing:** Act on AI suggestions! Get AI-powered fixes for problematic clauses, review them with explanations, and accept changes to edit the document live.
    *   **Visual Diffing:** Track your changes with a side-by-side view of the original and edited document, with additions and deletions highlighted.
    *   Download your edited document as a `.txt` file.

*   **🤖 Document Guide:**
    *   A chat-based assistant ("Good Man") that provides step-by-step guidance on creating legal documents or navigating legal processes (e.g., "How to create a will").

*   **✒️ Form Simplifier:**
    *   Demystifies complex forms by breaking them down field by field.
    *   For each field, it provides the original text, a simple explanation, what information to enter, and *why* that information is needed.

*   **🌐 Document Translator:**
    *   Translates document text or uploaded files into a wide range of languages using AI.

## 🛠️ Technology Stack

*   **Frontend:** React, TypeScript, Framer Motion
*   **Styling:** Tailwind CSS
*   **AI:** Google Gemini API (`@google/genai`)

## 🚀 Getting Started: Running Locally

Follow these steps to set up and run the project on your local machine.

### 1. Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (which includes `npm`) installed on your system.

### 2. Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/legal-document-demystifier.git
    cd legal-document-demystifier
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your API Key (Crucial!)**

    This project requires a Google Gemini API key to function. To keep your key secure and private, you must use environment variables.

    *   Obtain your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   In the root directory of the project, create a new file named `.env`:
        ```bash
        touch .env
        ```
    *   Open the `.env` file and add your API key. **Note the `VITE_` prefix, which is required by Vite.**
        ```
        VITE_API_KEY="YOUR_GEMINI_API_KEY_HERE"
        ```
        Replace `YOUR_GEMINI_API_KEY_HERE` with the actual key you obtained.

    *   **IMPORTANT:** To prevent your API key from being exposed publicly, ensure your `.env` file is listed in your `.gitignore` file. If `.gitignore` doesn't exist, create one and add `.env` to it. This will prevent Git from ever tracking the file.
        ```
        # .gitignore
        .env
        node_modules
        dist
        ```

4.  **Run the development server:**
    The command to run the app depends on your project setup (e.g., Vite, Create React App). A common command is:
    ```bash
    npm run dev
    ```
    Or:
    ```bash
    npm start
    ```
    Once the server is running, open your browser and navigate to the local address provided (usually `http://localhost:5173` or `http://localhost:3000`).

## 🚀 Deployment

Deploying this application is straightforward using modern hosting platforms for static sites like Vercel, Netlify, or GitHub Pages. Here’s a recommended guide using Vercel.

### 1. Push to a Git Provider

Before deploying, make sure your project code is pushed to a repository on a platform like [GitHub](https://github.com/), [GitLab](https://gitlab.com/), or [Bitbucket](https://bitbucket.org/).

### 2. Deploy with Vercel (Recommended)

Vercel is a platform from the creators of Next.js that provides a seamless deployment experience for frontend applications.

1.  **Sign Up:** Go to [Vercel](https://vercel.com/) and sign up for a free account using your GitHub, GitLab, or Bitbucket account.

2.  **Import Project:**
    *   From your Vercel dashboard, click "Add New... -> Project".
    *   Select the Git repository you just pushed your code to.

3.  **Configure Project:**
    *   Vercel will likely auto-detect that this is a Vite-based project and pre-fill the build settings.
    *   **Build Command:** Ensure this is set to `npm run build` or `vite build`. If your `package.json` doesn't have a `build` script, you should add one (e.g., `"build": "tsc && vite build"`).
    *   **Output Directory:** This should be `dist`.
    *   **Install Command:** Should be `npm install`.

4.  **Add Environment Variable (Crucial!):**
    *   Expand the "Environment Variables" section.
    *   Add a new variable with the **Name** `VITE_API_KEY`.
    *   For the **Value**, paste your Google Gemini API key (the same one from your local `.env` file).
    *   Click "Add". This keeps your key secure and makes it available to the application during the build process.

5.  **Deploy:**
    *   Click the "Deploy" button.
    *   Vercel will now build your application and deploy it. Once finished, you'll be given a public URL to your live application!

## ⚖️ Disclaimer

This tool provides AI-generated information and is **not a substitute for professional legal advice**. The information provided may not be accurate, complete, or up-to-date. Always consult with a qualified legal professional for advice on your specific situation.