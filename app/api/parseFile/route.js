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
            { text: "Take the uploaded resume, rip the text out, and turn it into a greentext story. Make it first-person, dark, ironic, and sadistic—real black humor vibes. Anonymize personal stuff as [REDACTED]. Keep it punchy, under 10-12 words per line, and formatted properly with '>'. Spit out a JSON array with up to 10 greentext lines—viral, relatable, and depressing. Make it hit like a brick but still be hilarious" },
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