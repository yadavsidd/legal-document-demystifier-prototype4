# Legal Document Demystifier

*🏆 A Submission for the GOOGLE GEN AI HACKATHON 🏆*

*Team:* 404 Raita Not Found <br/>
*Members:* Hitesh, Linsha, Siddhant, Rudraksh

---

## 🎯 The Problem: Legal Jargon is a Barrier for Everyone

Legal documents, from rental agreements to complex contracts, are filled with dense, intimidating language. This complexity creates a significant barrier for the average person, leading to:
*   *Lack of Understanding:* People often sign documents without fully grasping the terms, commitments, and potential risks involved.
*   *Hidden Risks:* Unfavorable clauses, red flags, and critical deadlines can be easily missed, leading to future complications.
*   *High Costs:* Hiring a lawyer to review every document is expensive and time-consuming, making professional advice inaccessible for many everyday situations.
*   *Uncertainty & Fear:* The daunting nature of legal paperwork prevents people from feeling confident and in control of their own affairs.

## ✨ Our Solution: An AI-Powered Legal Assistant

*Legal Document Demystifier* is a user-friendly web application that leverages the power of the Google Gemini API to make legal documents simple, transparent, and actionable. It acts as an on-demand assistant, empowering anyone to understand and manage legal text with confidence.

We bridge the gap between complex legal language and the need for clear understanding, democratizing access to crucial information that was once locked behind a paywall of professional fees.

## 🚀 Key Features

Our application provides a suite of tools designed to tackle specific user challenges:

*   *📄 Document Analyzer:*
    *   *What it does:* Upload a document (PDF, TXT, image) or paste text to receive a comprehensive, easy-to-read analysis.
    *   *How it helps:* Instantly get a concise *summary, a list of **potential issues & red flags, **key clause explanations* in plain English, and a *timeline of important dates*. No more guessing what a document means.

*   *✍ Interactive Editor with AI Fixes:*
    *   *What it does:* For any identified issue, the AI can *suggest a revised, safer clause*. Users can review the suggestion, understand the reasoning behind it, and accept the fix to edit the document live.
    *   *How it helps:* Empowers users to not just find problems, but to actively fix them, transforming a passive reading experience into an active, decision-making one. A visual "diff" viewer clearly shows all changes made.

*   *🤖 Document Guide:*
    *   *What it does:* A chat-based assistant that provides step-by-step guidance on creating legal documents or navigating legal processes (e.g., "How do I write a basic will?").
    *   *How it helps:* Overcomes the "blank page" problem by providing a clear starting point and structured guidance for common legal tasks.

*   *✒ Form Simplifier:*
    *   *What it does:* Breaks down confusing forms field by field.
    *   *How it helps:* For each field, it provides the original text, a simple explanation, what information to enter, and why that information is needed, eliminating the guesswork from filling out applications and agreements.

*   *🌐 Document Translator:*
    *   *What it does:* Translates document text or uploaded files into numerous languages.
    *   *How it helps:* Makes legal documents accessible across linguistic barriers.

## 🛠 Technology Stack

*   *Frontend:* React, TypeScript, Framer Motion
*   *Styling:* Tailwind CSS
*   *Core AI Engine:* **Google Gemini API (gemini-2.5-flash)** is the heart of our application, powering everything from text extraction and summarization to legal analysis, clause rewriting, and conversational guidance.

## 🏃‍♂ Getting Started: Running Locally

Follow these steps to set up and run the project on your local machine.

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed.

### 2. Installation & Setup
1.  *Clone & Install:*
    bash
    git clone https://github.com/your-repo/legal-document-demystifier.git
    cd legal-document-demystifier
    npm install
    

2.  *Set up your Gemini API Key (Crucial!)*
    *   Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   Create a .env file in the project's root directory:
        bash
        touch .env
        
    *   Add your API key to the .env file. **The VITE_ prefix is required by Vite.**
        
        VITE_API_KEY="YOUR_GEMINI_API_KEY_HERE"
        
    *   *Security:* Ensure your .env file is listed in .gitignore to keep your key private.

3.  *Run the App:*
    bash
    npm run dev
    
    Open your browser to http://localhost:5173 (or the address provided).

## 🧑‍💻 Meet the Team: 404 Raita Not Found

*   *Siddhant*
*   *Hitesh*
*   *Linsha*
*   *Rudraksh*

## ⚖ Disclaimer

This tool provides AI-generated information and is *not a substitute for professional legal advice*. The information provided may not be accurate, complete, or up-to-date. Always consult with a qualified legal professional for advice on your specific situation.
