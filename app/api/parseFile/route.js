// app/api/parseFile/route.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Get the file buffer
    const buffer = await file.arrayBuffer();
    const fileBase64 = Buffer.from(buffer).toString('base64');
    
    // Get the file's MIME type
    const mimeType = file.type || 'application/octet-stream';
    
    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Create a model instance
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Process the file with Gemini
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: "Take the uploaded resume and extract the text. Use it to create a classic 4chan-style greentext story from a first-person perspective. Keep it dark, ironic, and sadistic, with black humor. Anonymize personal details as [REDACTED]. Format each line with '>' and keep them under 10-12 words. The output should be a JSON array of up to 10 greentext lines, making it viral and relatable to the user" },
            {
              inlineData: {
                mimeType: mimeType,
                data: fileBase64
              }
            }
          ]
        }
      ]
    });

    const response = await result.response;
    const extractedText = response.text();

    return NextResponse.json({ text: extractedText }, { status: 200 });
    
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
  }
}