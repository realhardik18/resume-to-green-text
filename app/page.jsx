"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Share2, Clipboard, FileUp, AlertCircle } from "lucide-react"

const App = () => {
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    setFile(selectedFile)
    setResult(null)
    setError(null)
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first")
      return
    }

    try {
      setIsUploading(true)
      setError(null)

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/parseFile", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      const data = await response.json()

      // Process the text - assuming it comes back as a string with JSON format inside code blocks
      let processedText = data.text

      // Remove ```json and ``` if they exist
      if (processedText.startsWith("```json")) {
        processedText = processedText.substring(7) // Remove the ```json
      }
      if (processedText.endsWith("```")) {
        processedText = processedText.substring(0, processedText.length - 3) // Remove the trailing ```
      }

      // Parse the JSON string into an actual array
      try {
        const parsedData = JSON.parse(processedText.trim())
        setResult(parsedData) // Store the parsed array
      } catch (jsonError) {
        console.error("Error parsing JSON:", jsonError)
        // Fallback to using the text as is if JSON parsing fails
        setResult(processedText)
      }
    } catch (err) {
      setError(`Error: ${err.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const copyToClipboard = () => {
    let textToCopy
    if (Array.isArray(result)) {
      textToCopy = result.map((item) => `> ${typeof item === "object" ? JSON.stringify(item) : item}`).join("\n")
    } else if (typeof result === "string") {
      textToCopy = result
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n")
    } else {
      textToCopy = `> ${JSON.stringify(result)}`
    }
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareToTwitter = () => {
    let textToTweet
    if (Array.isArray(result)) {
      textToTweet = result.map((item) => `> ${typeof item === "object" ? JSON.stringify(item) : item}`).join("\n")
    } else if (typeof result === "string") {
      textToTweet = result
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n")
    } else {
      textToTweet = `> ${JSON.stringify(result)}`
    }

    // Truncate if too long for Twitter
    if (textToTweet.length > 280) {
      textToTweet = textToTweet.substring(0, 277) + "..."
    }

    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(textToTweet)}`
    window.open(tweetUrl, "_blank")
  }

  return (
    <div className="min-h-screen bg-[#121212] text-gray-300 font-mono">
      {/* Navbar */}
      <motion.nav
        className="bg-[#0a2a15] text-white shadow-lg shadow-green-900/30"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.h1
            className="text-xl font-bold text-green-400"
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
            <Link href="https://x.com/realhardik18" className="text-green-300 hover:text-green-200 transition-colors underline">
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
            className="md:w-1/2 bg-[#1a1a1a] rounded-lg shadow-xl shadow-green-900/10 p-6 border border-[#333333]"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-6 text-lg font-bold text-green-400 border-b border-[#333333] pb-2">Upload Your Resume</h2>

            <div className="mb-6">
              <label className="block mb-2 text-xs font-medium text-gray-300">Select File</label>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#0a2a15] file:text-green-300 hover:file:bg-[#0d3b1e] cursor-pointer"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500">
                  <FileUp size={16} />
                </div>
              </motion.div>
            </div>

            <motion.button
              onClick={handleUpload}
              disabled={isUploading || !file}
              className="w-full px-4 py-3 text-xs font-medium text-white bg-[#0d3b1e] rounded-md hover:bg-[#0f4824] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-[#1a2a20] disabled:text-gray-500 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isUploading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                "Generate Greentext"
              )}
            </motion.button>

            {error && (
              <motion.div
                className="p-3 mt-4 text-xs text-red-300 bg-red-900/30 rounded-md border border-red-800/50 flex items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AlertCircle size={14} className="mr-2 text-red-400" />
                {error}
              </motion.div>
            )}

            {file && (
              <motion.div
                className="mt-4 p-3 bg-[#222222] rounded-md border border-[#333333]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-xs text-gray-300">
                  Selected file: <span className="font-medium text-green-400">{file.name}</span>
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Right side - Output */}
          <motion.div
            className="md:w-1/2 bg-[#1a1a1a] rounded-lg shadow-xl shadow-green-900/10 p-6 border border-[#333333]"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="mb-6 text-lg font-bold text-green-400 border-b border-[#333333] pb-2">
              Generated Greentext
            </h2>

            {result ? (
              <motion.div
                className="p-4 bg-[#0f0f0f] rounded-md border border-green-900/50 h-64 overflow-auto scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-gray-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-green-500 font-mono whitespace-pre-wrap text-xs leading-relaxed">
                  {Array.isArray(result) ? (
                    // Handle array of objects
                    result.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="mb-1"
                      >
                         {typeof item === "object" ? JSON.stringify(item) : item}
                      </motion.div>
                    ))
                  ) : typeof result === "string" ? (
                    // Handle string content (fallback)
                    result
                      .split("\n")
                      .map((line, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="mb-1"
                        >
                          {">"} {line}
                        </motion.div>
                      ))
                  ) : (
                    // Fallback for any other data type
                    <div>
                      {">"} {JSON.stringify(result)}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                className="flex flex-col items-center justify-center h-64 bg-[#0f0f0f] rounded-md border border-dashed border-[#333333]"
                animate={{
                  boxShadow: [
                    "0 0 0 rgba(16, 185, 129, 0)",
                    "0 0 15px rgba(16, 185, 129, 0.3)",
                    "0 0 0 rgba(16, 185, 129, 0)",
                  ],
                  transition: { duration: 3, repeat: Number.POSITIVE_INFINITY },
                }}
              >
                <svg
                  className="w-10 h-10 text-[#1f3a2a] mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
                <p className="text-gray-500 text-center text-xs">Upload a resume to generate greentext</p>
              </motion.div>
            )}

            {result && (
              <motion.div
                className="mt-4 flex justify-end space-x-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  onClick={copyToClipboard}
                  className={`px-3 py-2 text-xs font-medium ${copied ? "text-white bg-green-700" : "text-green-300 bg-[#0a2a15]"} rounded-md hover:bg-[#0f4824] focus:outline-none focus:ring-2 focus:ring-green-700 transition-colors duration-200 flex items-center`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Clipboard size={14} className="mr-1" />
                  {copied ? "Copied!" : "Copy to clipboard"}
                </motion.button>

                <motion.button
                  onClick={shareToTwitter}
                  className="px-3 py-2 text-xs font-medium text-white bg-[#1d9bf0] rounded-md hover:bg-[#1a8cd8] focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] transition-colors duration-200 flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Share2 size={14} className="mr-1" />
                  Tweet on X
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default App

