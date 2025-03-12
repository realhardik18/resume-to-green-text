'use client'
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const App = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/parseFile', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process the text - assuming it comes back as a string with JSON format inside code blocks
      let processedText = data.text;
      
      // Remove ```json and ``` if they exist
      if (processedText.startsWith('```json')) {
        processedText = processedText.substring(7); // Remove the ```json
      }
      if (processedText.endsWith('```')) {
        processedText = processedText.substring(0, processedText.length - 3); // Remove the trailing ```
      }
      
      // Parse the JSON string into an actual array
      try {
        const parsedData = JSON.parse(processedText.trim());
        setResult(parsedData); // Store the parsed array
      } catch (jsonError) {
        console.error("Error parsing JSON:", jsonError);
        // Fallback to using the text as is if JSON parsing fails
        setResult(processedText);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 text-sm">
      {/* Navbar */}
      <motion.nav 
        className="bg-green-800 text-white shadow-md"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <motion.h1 
            className="text-xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Resume to Greentext Generator
          </motion.h1>
          <motion.div
            className="text-xs font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Link href='https://x.com/realhardik18'>
            Made by Realhardik18
            </Link>
          </motion.div>
        </div>
      </motion.nav>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left side - Upload Section */}
          <motion.div 
            className="md:w-1/2 bg-gray-800 rounded-lg shadow-md p-6"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-6 text-lg font-bold text-gray-200 border-b border-gray-700 pb-2">Upload Your Resume</h2>
            
            <div className="mb-6">
              <label className="block mb-2 text-xs font-medium text-gray-300">
                Select File
              </label>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-green-900 file:text-green-300 hover:file:bg-green-800 cursor-pointer"
                />
              </motion.div>
            </div>
            
            <motion.button
              onClick={handleUpload}
              disabled={isUploading || !file}
              className="w-full px-4 py-2 text-xs font-medium text-white bg-green-700 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-900 disabled:text-gray-500 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isUploading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : 'Generate Greentext'}
            </motion.button>
            
            {error && (
              <motion.div 
                className="p-3 mt-4 text-xs text-red-300 bg-red-900 rounded-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}

            {file && (
              <motion.div
                className="mt-4 p-3 bg-gray-700 rounded-md border border-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-xs text-gray-300">Selected file: <span className="font-medium">{file.name}</span></p>
              </motion.div>
            )}
          </motion.div>
          
          {/* Right side - Output */}
          <motion.div 
            className="md:w-1/2 bg-gray-800 rounded-lg shadow-md p-6"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="mb-6 text-lg font-bold text-gray-200 border-b border-gray-700 pb-2">Generated Greentext</h2>
            
            {result ? (
              <motion.div
                className="p-4 bg-gray-700 rounded-md border border-green-800 h-64 overflow-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-green-400 font-mono whitespace-pre-wrap text-xs">
                  {Array.isArray(result) ? (
                    // Handle array of objects
                    result.map((item, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {typeof item === 'object' ? JSON.stringify(item) : item}
                      </motion.div>
                    ))
                  ) : typeof result === 'string' ? (
                    // Handle string content (fallback)
                    result.split('\n').map((line, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {line}
                      </motion.div>
                    ))
                  ) : (
                    // Fallback for any other data type
                    <div>&gt; {JSON.stringify(result)}</div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                className="flex flex-col items-center justify-center h-64 bg-gray-700 rounded-md border border-dashed border-gray-600"
                animate={{ 
                  backgroundColor: ["#374151", "#064e3b", "#374151"],
                  transition: { duration: 3, repeat: Infinity }
                }}
              >
                <svg className="w-10 h-10 text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p className="text-gray-400 text-center text-xs">Upload a resume to generate greentext</p>
              </motion.div>
            )}

            {result && (
              <motion.div 
                className="mt-4 flex justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <button 
                  onClick={() => {
                    let textToCopy;
                    if (Array.isArray(result)) {
                      textToCopy = result.map(item => `> ${typeof item === 'object' ? JSON.stringify(item) : item}`).join('\n');
                    } else if (typeof result === 'string') {
                      textToCopy = result.split('\n').map(line => `> ${line}`).join('\n');
                    } else {
                      textToCopy = `> ${JSON.stringify(result)}`;
                    }
                    navigator.clipboard.writeText(textToCopy);
                  }}
                  className="px-3 py-1 text-xs font-medium text-green-300 bg-green-900 rounded-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-700 transition-colors duration-200"
                >
                  Copy to clipboard
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default App;