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
            { text: "The uploaded file is a resume. Extract the text content and use it as inspiration to generate a classic 4chan-style greentext story from a first-person perspective. The story should have a dark, ironic, and sadistic tone, incorporating black humor. Avoid directly referencing personal details to maintain anonymity.replace them with [REDACTED]. Format the response in the traditional greentext style, with each line prefixed by '>'. Additionally, include relevant image references in the format >feeling.png to enhance the narrative. For example, >depression.png, >cope.png, >based.png etc can be inserted at appropriate moments to fit the story's tone but in a new line. The final response should be structured as a JSON array of greentext lines, with image references integrated naturally where appropriate. should not be more than 15 items" },
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