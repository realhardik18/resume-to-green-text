"use client"
import React, { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"

import { Button } from "@progress/kendo-react-buttons"
import { Card, CardHeader, CardTitle, CardBody, CardActions } from "@progress/kendo-react-layout"
import { AppBar, AppBarSection } from "@progress/kendo-react-layout"
import { Notification, NotificationGroup } from "@progress/kendo-react-notification"
import { Fade } from "@progress/kendo-react-animation"

// KendoReact icons
import { shareIcon, copyIcon, refreshIcon } from "@progress/kendo-svg-icons"

const App = () => {
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [showCopyNotification, setShowCopyNotification] = useState(false)

  const handleFileSelect = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0])
      setResult(null)
      setError(null)
    }
  }

  const handleFileUpload = async () => {
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
    setShowCopyNotification(true)
    setTimeout(() => {
      setCopied(false)
      setShowCopyNotification(false)
    }, 2000)
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

  // Custom styling for KendoReact components
  const kendoTheme = {
    button: {
      primary: {
        bg: "#0d3b1e",
        text: "white",
        border: "none",
        hoverBg: "#0f4824",
        hoverText: "white",
        hoverBorder: "none",
        activeBg: "#0a2a15",
        activeText: "white",
        activeBorder: "none",
        disabledBg: "#1a2a20",
        disabledText: "#666",
        disabledBorder: "none",
      },
      secondary: {
        bg: "#1a1a1a",
        text: "#10b981",
        border: "1px solid #333",
        hoverBg: "#222",
        hoverText: "#10b981",
        hoverBorder: "1px solid #444",
      },
      twitter: {
        bg: "#1d9bf0",
        text: "white",
        border: "none",
        hoverBg: "#1a8cd8",
        hoverText: "white",
        hoverBorder: "none",
      },
    },
    card: {
      bg: "#1a1a1a",
      border: "1px solid #333",
      text: "#e5e5e5",
      header: {
        bg: "#1a1a1a",
        border: "1px solid #333",
      },
    },
    appBar: {
      bg: "#0a2a15",
      text: "white",
    },
    upload: {
      bg: "#1a1a1a",
      border: "1px solid #333",
      text: "#e5e5e5",
      button: {
        bg: "#0a2a15",
        text: "#10b981",
        border: "none",
        hoverBg: "#0d3b1e",
        hoverText: "#10b981",
        hoverBorder: "none",
      },
    },
    notification: {
      success: {
        bg: "#0d3b1e",
        text: "white",
      },
      error: {
        bg: "#7f1d1d",
        text: "#fecaca",
      },
    },
  }

  return (
    <div className="min-h-screen bg-[#121212] text-gray-300 font-mono">
      {/* AppBar */}
      <AppBar
        className="k-appbar"
        style={{
          backgroundColor: kendoTheme.appBar.bg,
          color: kendoTheme.appBar.text,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        }}
        themeColor="dark"
      >
        <AppBarSection>
          <motion.h1
            className="text-xl font-bold text-green-400 px-4 py-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Resume to Greentext Generator
          </motion.h1>
        </AppBarSection>
        <AppBarSection>
          <motion.div
            className="text-xs font-light px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="https://x.com/realhardik18" className="text-green-300 hover:text-green-200 transition-colors">
              Made by Realhardik18
            </Link>
          </motion.div>
        </AppBarSection>
      </AppBar>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left side - Upload Section */}
          <motion.div
            className="md:w-1/2"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card
              style={{
                backgroundColor: kendoTheme.card.bg,
                border: kendoTheme.card.border,
                color: kendoTheme.card.text,
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              }}
              className="k-card"
            >
              <CardHeader
                style={{
                  backgroundColor: kendoTheme.card.header.bg,
                  borderBottom: kendoTheme.card.header.border,
                }}
                className="k-card-header"
              >
                <CardTitle className="text-lg font-bold text-green-400">Upload Your Resume</CardTitle>
              </CardHeader>
              <CardBody className="p-6">
                <div className="mb-6">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.txt,.rtf"
                    className="block w-full text-sm text-gray-300
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-[#0d3b1e] file:text-white
                      hover:file:bg-[#0f4824]
                      file:cursor-pointer cursor-pointer
                      border border-[#333] rounded-md
                      bg-[#1a1a1a] p-2"
                  />
                </div>

                <Button
                  onClick={handleFileUpload}
                  disabled={isUploading || !file}
                  themeColor="primary"
                  icon={refreshIcon}
                  style={{
                    backgroundColor: kendoTheme.button.primary.bg,
                    color: kendoTheme.button.primary.text,
                    border: kendoTheme.button.primary.border,
                    width: "100%",
                  }}
                  className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary"
                >
                  {isUploading ? "Processing..." : "Generate Greentext"}
                </Button>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4"
                  >
                    <Notification
                      type={{ style: "error", icon: true }}
                      style={{
                        backgroundColor: kendoTheme.notification.error.bg,
                        color: kendoTheme.notification.error.text,
                      }}
                      className="k-notification-error"
                    >
                      <div className="flex items-center">{error}</div>
                    </Notification>
                  </motion.div>
                )}
              </CardBody>
            </Card>
          </motion.div>

          {/* Right side - Output */}
          <motion.div
            className="md:w-1/2"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card
              style={{
                backgroundColor: kendoTheme.card.bg,
                border: kendoTheme.card.border,
                color: kendoTheme.card.text,
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              }}
              className="k-card"
            >
              <CardHeader
                style={{
                  backgroundColor: kendoTheme.card.header.bg,
                  borderBottom: kendoTheme.card.header.border,
                }}
                className="k-card-header"
              >
                <CardTitle className="text-lg font-bold text-green-400">Generated Greentext</CardTitle>
              </CardHeader>
              <CardBody className="p-6">
                {result ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div
                      className="p-4 bg-[#0f0f0f] rounded-md border border-green-900/50 h-64 overflow-auto"
                      style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "#064e3b #1f2937",
                      }}
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
                              {">"} {typeof item === "object" ? JSON.stringify(item) : item}
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
              </CardBody>
              {result && (
                <CardActions className="p-4 flex justify-end space-x-2">
                  <Button
                    onClick={copyToClipboard}
                    icon={copyIcon}
                    themeColor="secondary"
                    style={{
                      backgroundColor: copied ? kendoTheme.button.primary.bg : kendoTheme.button.secondary.bg,
                      color: copied ? kendoTheme.button.primary.text : kendoTheme.button.secondary.text,
                      border: copied ? kendoTheme.button.primary.border : kendoTheme.button.secondary.border,
                    }}
                    className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-secondary"
                  >
                    {copied ? "Copied!" : "Copy to clipboard"}
                  </Button>

                  <Button
                    onClick={shareToTwitter}
                    icon={shareIcon}
                    style={{
                      backgroundColor: kendoTheme.button.twitter.bg,
                      color: kendoTheme.button.twitter.text,
                      border: kendoTheme.button.twitter.border,
                    }}
                    className="k-button k-button-md k-rounded-md k-button-solid"
                  >
                    Tweet on X
                  </Button>
                </CardActions>
              )}
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Notifications */}
      <NotificationGroup
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
        }}
      >
        <Fade>
          {showCopyNotification && (
            <Notification
              type={{ style: "success", icon: true }}
              style={{
                backgroundColor: kendoTheme.notification.success.bg,
                color: kendoTheme.notification.success.text,
              }}
              className="k-notification-success"
            >
              <div className="flex items-center">Text copied to clipboard!</div>
            </Notification>
          )}
        </Fade>
      </NotificationGroup>
    </div>
  )
}

export default App

