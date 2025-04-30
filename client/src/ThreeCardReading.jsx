import { useState, useEffect, useCallback } from "react";
import LoadingState from "./LoadingState"; // Assuming this component exists and is styled
import { marked } from "marked";

// Component to display the Tarot card reading interpretation
export default function ThreeCardReading({
  question,
  past, // Card data for the past position
  present, // Card data for the present position
  future, // Card data for the future position
  past_reverse, // Is past card reversed?
  present_reverse, // Is present card reversed?
  future_reverse, // Is future card reversed?
}) {
  const [content, setContent] = useState(""); // State to hold the fetched Markdown content
  const [isLoading, setIsLoading] = useState(true); // State to track loading status
  const [error, setError] = useState(null); // State to hold any error message

  // useCallback memoizes the fetch function to prevent unnecessary re-creations
  const fetchReading = useCallback(
    async (abortController) => {
      setIsLoading(true); // Ensure loading state is true when fetching starts
      setError(null); // Clear any previous errors
      setContent(""); // Clear previous content

      try {
        // --- API Call to fetch the reading ---
        const response = await fetch(
          "https://tarot-gemini.vercel.app/api/threecard", // Your API endpoint
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: abortController.signal, // Link to the AbortController signal
            body: JSON.stringify({
              // Note: Storing API key client-side is generally not recommended for production apps.
              // Consider a backend proxy or secure method.
              apiKey: "", // <-- Replace with your actual API Key
              past,
              past_reverse,
              present,
              present_reverse,
              future,
              future_reverse,
              question,
            }),
          }
        );

        // Check if the response was successful
        if (!response.ok) {
          // Attempt to read error body if available
          const errorBody = await response.text().catch(() => "Unknown error");
          throw new Error(
            `API request failed: ${response.status} ${response.statusText} - ${errorBody}`
          );
        }

        // Read the response stream for potentially large outputs
        const reader = response.body?.getReader();
        if (!reader) throw new Error("Failed to read response stream");

        let result = "";
        // Loop to read the stream chunks
        while (true) {
          const { done, value } = await reader.read();
          if (done) break; // Stream finished
          result += new TextDecoder().decode(value); // Decode chunk and append
          // Optionally update content incrementally as chunks arrive
          setContent(marked.parse(result)); // Update state with parsed Markdown
          setIsLoading(false);
        }

         // Set loading to false when done
      } catch (err) {
        // Handle errors, checking if it was an abort signal
        if (!abortController.signal.aborted) {
          console.error("Fetching reading failed:", err); // Log the actual error
          setError(
            err instanceof Error ? err.message : "An unexpected error occurred"
          );
          setIsLoading(false); // Set loading to false on error
        } else {
          console.log("Fetch aborted:", err.message); // Log if the fetch was aborted
        }
      }
    },
    [
      past,
      present,
      future,
      past_reverse,
      present_reverse,
      future_reverse,
      question,
    ]
  ); // Dependencies for useCallback

  // useEffect to initiate the fetch when dependencies change (cards/question selected)
  useEffect(() => {
    const abortController = new AbortController(); // Create a new AbortController
    fetchReading(abortController); // Call the fetch function

    // Cleanup function: Abort the fetch request if the component unmounts or effect re-runs
    return () => {
      console.log("Effect cleanup: Aborting fetch.");
      abortController.abort();
    };
  }, [fetchReading]); // Dependency on fetchReading (memoized by useCallback)

  // --- Render Logic ---

  // Render error state if there's an error
  if (error) {
    return (
      <div className="p-6 bg-red-900 bg-opacity-50 rounded-xl border border-red-700 text-red-300 text-center animate-fade-in shadow-lg">
        <p className="font-semibold mb-2">⚠️ Error Getting Reading ⚠️</p>
        <p className="text-sm italic">{error}</p>
      </div>
    );
  }

  // Render loading state if loading
  if (isLoading) {
    // The LoadingState component should handle its own appearance,
    // but we can wrap it or ensure its container has space/centering
    return <LoadingState />;
  }

  // Render the reading content when not loading and no error
  return (
    // Main container for the reading content
    <div className="space-y-6 p-6 sm:p-8 bg-purple-900 bg-opacity-60 rounded-xl shadow-2xl border border-purple-700 animate-fade-in">
      {/* Rendered Markdown Content */}
      {/* Use prose classes for basic typography styling */}
      <div
        className={`prose prose-invert prose-lg max-w-none text-purple-100 transition-opacity duration-500 ease-in-out ${
          // Fade in the content once loading is complete
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* The markdown-content div holds the HTML rendered by marked */}
        {/* Use dangerouslySetInnerHTML to insert the HTML */}
        <div
          className="markdown-content space-y-4 leading-relaxed" // Added leading-relaxed for better readability
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}
