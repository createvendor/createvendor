'use server';

import { GoogleGenAI } from "@google/genai";

// Initialize AI on demand to avoid errors if API key is missing at startup
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateLegalContent = async (type: string, storeName: string, details?: any) => {
  try {
    const client = getAI();

    const prompt = `Generate a very long, professional, and powerful ${type} document for a storefront named "${storeName}". 
    The document should be highly detailed, legally sound in tone, and include necessary sections like Introduction, User Rights, Data usage, Cookies, Third-party links, etc.
    Return the content in clean Markdown format with proper headings, bullet points, and at least one table if it's relevant to the policy. 
    Make it look like a global standard document that builds trust. Include details provided: ${JSON.stringify(details || {})}`;

    const result = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt
    });

    return result.text;
  } catch (error: any) {
    console.error("DEBUG AI Error (Legal):", error);
    return `Failed to generate ${type}. Please manually enter your policy details or ensure the AI Key is valid. Error: ${error.message}`;
  }
};

export const generateBlogContent = async (title: string, keywords: string[], storeName: string) => {
  try {
    const client = getAI();

    const prompt = `Write a comprehensive, authoritative, and high-impact blog post titled "${title}" for the brand "${storeName}". 
    Target Keywords: ${keywords.join(", ")}. 
    The content requirements are strictly:
    1. EXTREME LENGTH: At least 1000-1200 words of deeply researched content.
    2. STRUCTURE: Use H1, H2, and H3 headers to organize complex ideas.
    3. DATA VISUALIZATION: Include at least one complex Markdown table (e.g., comparison, pricing, or technical data).
    4. MULTIMEDIA STRATEGY: Provide 3 detailed descriptions for hero and supporting images to be placed in the post.
    5. ENGAGEMENT: Bulleted lists, bolded key terms, and a powerful CTA at the end.
    6. PRO SEO: Title tag, meta description, and strategic keyword placement.
    Return only clean Markdown.`;

    const result = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt
    });

    return result.text;
  } catch (error: any) {
    console.error("DEBUG AI Error (Blog):", error);
    return "Failed to generate blog post. Please check the AI configuration.";
  }
};

export const generateProductContent = async (productName: string, category: string, additionalDetails?: string) => {
  try {
    const client = getAI();

    const prompt = `Perform a high-tier product analysis and content generation for "${productName}" in the category "${category}". 
    Context: ${additionalDetails || 'None'}.
    Output Requirements (STRICT):
    1. LUXURY DESCRIPTION: 500+ words of magnetic, professional sales copy in Markdown.
    2. TECHNICAL SPECS: A 15-row Markdown table covering Material, Dimensions, Origin, Warranty, Technology, etc.
    3. SEO MASTER: Suggest a 60-character title and a high-CTR meta description.
    4. IMAGE DIRECTION: Describe 4 premium product shots (angles, lighting, lifestyle context) for better conversion.
    
    Structure your response EXACTLY as:
    ---SEO TITLE---
    [Title]
    ---DESCRIPTION---
    [Copy + Image Directions]
    ---SPECS---
    [Markdown Table]`;

    const result = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt
    });

    return result.text;
  } catch (error: any) {
    console.error("DEBUG AI Error (Product):", error);
    return "Error generating content.";
  }
};

export const generateSEO = async (type: string, data: any) => {
  try {
    const client = getAI();

    const prompt = `Generate SEO metadata for a ${type} with the following details: ${JSON.stringify(data)}. 
    Return a JSON object with title, description, and keywords. 
    Ensure the response is a valid JSON without any markdown formatting.`;

    const result = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt
    });

    const text = result.text || "";

    // Attempt to clean the response if Gemini adds markdown backticks
    const cleanJson = text.replace(/```json|```/g, "").trim();

    return JSON.parse(cleanJson);
  } catch (error: any) {
    console.error("Error generating SEO:", error);
    return {
      title: "",
      description: "",
      keywords: ""
    };
  }
};

export const generateFAQContent = async (storeName: string, category?: string) => {
  try {
    const client = getAI();

    const prompt = `Generate 6 high-impact, professional, and strategic Frequently Asked Questions (FAQ) with detailed answers for a storefront named "${storeName}" in the category "${category || 'General'}". 
    The FAQs should cover:
    1. Shipping & Processing times (be professional).
    2. Quality assurance and authenticity.
    3. Return and refund policies (building trust).
    4. Payment security.
    5. Order tracking.
    6. Why choose this store?
    Return the response as a clean JSON array of objects with "question" and "answer" fields. No markdown formatting.`;

    const result = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt
    });

    const text = result.text || "";
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error: any) {
    console.error("DEBUG AI Error (FAQ):", error);
    return [
      { id: '1', question: "How long does shipping take?", answer: "We process orders within 1-3 business days. Shipping times vary by location." },
      { id: '2', question: "What is your return policy?", answer: "We offer a 30-day satisfaction guarantee on all our premium products." }
    ];
  }
};

export const generateFooterContent = async (storeName: string, category?: string) => {
  try {
    const client = getAI();

    const prompt = `Generate a powerful and professional "Footer Brand Identity" for a store named "${storeName}" in the category "${category || 'General'}".
    Include:
    1. A short, impactful "About Us" (2-3 sentences) that builds extreme trust.
    2. A mission statement.
    3. A short brand story.
    Return the response as a clean Markdown text.`;

    const result = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt
    });

    return result.text || "";
  } catch (error: any) {
    console.error("DEBUG AI Error (Footer):", error);
    return `Welcome to ${storeName}, your destination for premium ${category || 'products'}. We are dedicated to providing the best experience to our customers.`;
  }
};

export const generateBranchDetails = async (storeName: string, city: string) => {
  try {
    const client = getAI();

    const prompt = `Generate realistic and professional branch details for a store named "${storeName}" located in the city of "${city}".
    Include:
    1. A professional branch name (e.g. ${storeName} Elite - ${city}).
    2. A realistic street address in ${city}.
    3. A professional business phone number for that region.
    4. Business hours (standard or premium).
    Return the response as a clean JSON object with "name", "address", "phone", and "hours" fields. No markdown.`;

    const result = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt
    });

    const text = result.text || "";
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error: any) {
    console.error("DEBUG AI Error (Branch):", error);
    return {
      name: `${storeName} - ${city}`,
      address: `Main Street, ${city}`,
      phone: "+977 1-XXXXXXX",
      hours: "Sun-Fri 10AM-7PM"
    };
  }
};
