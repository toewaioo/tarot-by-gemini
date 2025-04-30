import React, { useState, useRef, useEffect, useCallback } from "react";

// For responsiveness hook - assuming it's installed via '@reactuses/core'
import { useWindowSize } from "@reactuses/core";

// Assuming these components exist and handle their props internally
// We will provide basic implementations for these below
import TarotCard from "./TarotCard";
import SelectedCardSlot from "./SelectedCardSlot";
import ThreeCardReading from "./ThreeCardReading";
// --- Constants ---
// Add these constants at the top

const CARD_SHUFFLE_HEIGHT = 50;
const CARD_SHUFFLE_SPREAD = 150;

// Add spring animation config
const springConfig = {
  tension: 200,
  friction: 30,
  mass: 0.5,
};
//
const CARD_INIT_ANGLE_BASE = -60;
const CARD_SPACE_ANGLE_BASE = 8;
const LEFT_MAX_ANGLE = -100; // Adjusted example boundary for fan rotation
const RIGHT_MAX_ANGLE = 100; // Adjusted example boundary for fan rotation
const FLING_THRESHOLD_VELOCITY = 300; // degrees per second required to trigger fling
const FLING_DAMPING = 0.93; // Damping factor for fling animation
const FLING_MIN_VELOCITY = 50; // Minimum velocity (deg/s) to continue fling animation
// --- Specific Tarot Card Data ---
// Provided lists of names and image filenames
const cardNames = [
  "0. The Fool",
  "1. The Magician",
  "2. The High Priestess",
  "3. The Empress",
  "4. The Emperor",
  "5. The Hierophant",
  "6. The Lovers",
  "7. The Chariot",
  "8. Strength",
  "9. The Hermit",
  "10. The Wheel of Fortune",
  "11. Justice",
  "12. The Hanged Man",
  "13. Death",
  "14. Temperance",
  "15. The Devil",
  "16. The Tower",
  "17. The Star",
  "18. The Moon",
  "19. The Sun",
  "20. Judgement",
  "22. The World",
  "Two of Cups",
  "Three of Cups",
  "Four of Cups",
  "Five of Cups",
  "Six of Cups",
  "Seven of Cups",
  "Eight of Cups",
  "Nine of Cups",
  "Ten of Cups",
  "Ace of Cups",
  "King of Cups",
  "Knight of Cups",
  "Page of Cups",
  "Queen of Cups",
  "Two of Pentacles",
  "Three of Pentacles",
  "Four of Pentacles",
  "Five of Pentacles",
  "Six of Pentacles",
  "Seven of Pentacles",
  "Eight of Pentacles",
  "Nine of Pentacles",
  "Ten of Pentacles",
  "Ace of Pentacles",
  "King of Pentacles",
  "Knight of Pentacles",
  "Page of Pentacles",
  "Queen of Pentacles",
  "Two of Swords",
  "Three of Swords",
  "Four of Swords",
  "Five of Swords",
  "Six of Swords",
  "Seven of Swords",
  "Eight of Swords",
  "Nine of Swords",
  "Ten of Swords",
  "Ace of Swords",
  "King of Swords",
  "Knight of Swords",
  "Page of Swords",
  "Queen of Swords",
  "Two of Wands",
  "Three of Wands",
  "Four of Wands",
  "Five of Wands",
  "Six of Wands",
  "Seven of Wands",
  "Eight of Wands",
  "Nine of Wands",
  "Ten of Wands",
  "Ace of Wands",
  "King of Wands",
  "Knight of Wands",
  "Page of Wands",
  "Queen of Wands",
];

const cardImages = [
  "ar00.jpg",
  "ar01.jpg",
  "ar02.jpg",
  "ar03.jpg",
  "ar04.jpg",
  "ar05.jpg",
  "ar06.jpg",
  "ar07.jpg",
  "ar08.jpg",
  "ar09.jpg",
  "ar10.jpg",
  "ar11.jpg",
  "ar12.jpg",
  "ar13.jpg",
  "ar14.jpg",
  "ar15.jpg",
  "ar16.jpg",
  "ar17.jpg",
  "ar18.jpg",
  "ar19.jpg",
  "ar20.jpg",
  "ar21.jpg",
  "cu02.jpg",
  "cu03.jpg",
  "cu04.jpg",
  "cu05.jpg",
  "cu06.jpg",
  "cu07.jpg",
  "cu08.jpg",
  "cu09.jpg",
  "cu10.jpg",
  "cuac.jpg",
  "cuki.jpg",
  "cukn.jpg",
  "cupa.jpg",
  "cuqu.jpg",
  "pe02.jpg",
  "pe03.jpg",
  "pe04.jpg",
  "pe05.jpg",
  "pe06.jpg",
  "pe07.jpg",
  "pe08.jpg",
  "pe09.jpg",
  "pe10.jpg",
  "peac.jpg",
  "peki.jpg",
  "pekn.jpg",
  "pepa.jpg",
  "pequ.jpg",
  "sw02.jpg",
  "sw03.jpg",
  "sw04.jpg",
  "sw05.jpg",
  "sw06.jpg",
  "sw07.jpg",
  "sw08.jpg",
  "sw09.jpg",
  "sw10.jpg",
  "swac.jpg",
  "swki.jpg",
  "swkn.jpg",
  "swpa.jpg",
  "swqu.jpg",
  "wa02.jpg",
  "wa03.jpg",
  "wa04.jpg",
  "wa05.jpg",
  "wa06.jpg",
  "wa07.jpg",
  "wa08.jpg",
  "wa09.jpg",
  "wa10.jpg",
  "waac.jpg",
  "waki.jpg",
  "wakn.jpg",
  "wapa.jpg",
  "waqu.jpg",
];

// Set NUM_CARDS based on the provided data length
const NUM_CARDS = cardNames.length; // Total number of cards in the deck fan

// --- Animation Constants ---
const SHUFFLE_DURATION = 2500; // Milliseconds for the shuffle animation
const SELECT_ANIMATION_DURATION = 1000; // Milliseconds for the card selection animation
// Reveal animation duration is handled within SelectedCardSlot, but we define the value here for consistency if needed
// const REVEAL_ANIMATION_DURATION = 600; // Matches CSS transition in SelectedCardSlot

// --- Mock Card Data ---
// --- Create Card Data from Lists ---
const createCardDataFromLists = () => {
  if (cardNames.length !== cardImages.length) {
    console.error("Card names and images lists must have the same length.");
    // Return empty data or handle error appropriately
    return [];
  }

  const data = [];
  for (let i = 0; i < NUM_CARDS; i++) {
    data.push({
      id: i, // Use index as a stable ID
      name: cardNames[i], // Use name from the list
      frontImage: `/tarot/${cardImages[i]}`, // Construct image path
      backImage: "/tarot/_cover.png", // Use a single back image
      meaning: null, // Placeholder for meaning data
    });
  }
  return data;
};
const mockCardData = createCardDataFromLists();
// --- End Mock Data ---

// --- Utility Function ---
// Fisher-Yates (Knuth) Shuffle Algorithm
const shuffleArray = (array) => {
  const newArray = [...array]; // Create a mutable copy
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // Swap elements
  }
  return newArray;
};

const TarotCardLayout = () => {
  // Add state for the question input
  const [question, setQuestion] = useState("");
  // Keep a ref to the original data (immutable) and a state for the shuffled data
  const originalCardsData = useRef(mockCardData);
  // Use state for the data displayed in the fan so we can shuffle it
  const [fannedCardsData, setFannedCardsData] = useState(mockCardData);

  // --- State ---
  const [fanRotationAngle, setFanRotationAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Stores selected cards { slotName: { cardId: number, data: object } or null }
  const [selectedCards, setSelectedCards] = useState({
    past: null,
    present: null,
    future: null,
  });

  // State controlling the user interaction flow and UI visibility
  const [selectionPhase, setSelectionPhase] = useState("initial"); // initial, selectingPast, selectingPresent, selectingFuture, revealing, revealed

  // State to track if selected slots have completed their reveal animation
  const [revealedSlots, setRevealedSlots] = useState({
    past: false,
    present: false,
    future: false,
  });

  // --- Animation States ---
  const [isShuffling, setIsShuffling] = useState(false);
  // State for the card currently animating from the fan to a slot
  const [animatingCard, setAnimatingCard] = useState(null); // { cardId: number, startRect: DOMRect, endRect: DOMRect }

  // --- Refs ---
  const containerRef = useRef(null); // Fan container DOM element
  const layoutRef = useRef(null); // Root layout container DOM element (for calculating animation positions)
  const dragStartRef = useRef({ x: 0, angle: 0 }); // Drag start info
  const lastMoveTimeRef = useRef(0); // For calculating fling velocity
  const lastMoveAngleRef = useRef(0); // For calculating fling velocity
  const velocityRef = useRef(0); // Fling velocity in degrees per millisecond
  const flingFrameRef = useRef(null); // requestAnimationFrame ID for fling animation

  const containerRadiusRef = useRef(300); // Radius of the fan arc

  // Refs for the selected card slots to get their positions for animation
  const slotRefs = {
    past: useRef(null),
    present: useRef(null),
    future: useRef(null),
  };

  // --- Responsive Adjustments ---
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 640;

  const cardWidth = isMobile ? 120 : 120;
  const cardHeight = isMobile ? 150 : 150;
  const cardSpaceAngle = isMobile ? 10 : 5;
  const cardInitAngle = isMobile ? -70 : CARD_INIT_ANGLE_BASE;

  // --- Effect to calculate container radius on mount and resize ---
  useEffect(() => {
    const updateContainerRadius = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        containerRadiusRef.current = isMobile
          ? height * 0.7
          : Math.max(width, height) * 0.7;
        if (containerRadiusRef.current < 150) containerRadiusRef.current = 150; // Ensure a minimum radius
      }
    };

    // Update radius initially and whenever window size/mobile status changes
    updateContainerRadius();
  }, [windowWidth, isMobile]);

  // --- Shuffle Logic ---
  // Starts the shuffle animation and transitions to the first selection phase after the animation
  const startShuffleAnimation = useCallback(() => {
    setIsShuffling(true);
    // Shuffle the data array that feeds the fanned cards
    setFannedCardsData(shuffleArray(originalCardsData.current));
    setFanRotationAngle(0); // Reset fan rotation for the shuffle animation

    // After the shuffle animation duration, end the shuffle and start selection
    const shuffleTimeoutId = setTimeout(() => {
      setIsShuffling(false);
      setSelectionPhase("selectingPast"); // Transition to the first selection phase
    }, SHUFFLE_DURATION);

    // Return a cleanup function to clear this specific timeout
    return () => clearTimeout(shuffleTimeoutId);
  }, [
    originalCardsData,
    setFannedCardsData,
    setIsShuffling,
    setSelectionPhase,
    SHUFFLE_DURATION,
  ]);

  // --- Fling Animation Logic ---
  // Stops the current fling animation if one is running
  const stopFling = useCallback(() => {
    if (flingFrameRef.current) {
      cancelAnimationFrame(flingFrameRef.current);
    }
    flingFrameRef.current = null;
    velocityRef.current = 0; // Reset velocity
  }, []); // No external dependencies needed for this basic stop logic

  // Step function for the fling animation loop, updates fan angle based on velocity
  const flingStep = useCallback(() => {
    // Apply damping to the velocity
    velocityRef.current *= FLING_DAMPING;

    // Calculate the next rotation angle
    let newAngle = fanRotationAngle + velocityRef.current;

    // Apply Clamping During Fling to prevent exceeding boundaries
    if (newAngle < LEFT_MAX_ANGLE || newAngle > RIGHT_MAX_ANGLE) {
      velocityRef.current = 0; // Stop on collision with boundary
      // Clamp the angle to the boundary
      newAngle = Math.max(LEFT_MAX_ANGLE, Math.min(RIGHT_MAX_ANGLE, newAngle));
      setFanRotationAngle(newAngle); // Update state to the clamped angle
      stopFling(); // Stop the animation
      return; // Exit the step if boundary hit
    }

    // Continue the animation if velocity is still significant
    if (Math.abs(velocityRef.current * 1000) > FLING_MIN_VELOCITY) {
      // Check velocity in degrees per second
      setFanRotationAngle(newAngle); // Update state to render the new angle
      // Request the next animation frame
      flingFrameRef.current = requestAnimationFrame(flingStep);
    } else {
      stopFling(); // Stop if velocity is too low
    }
  }, [
    fanRotationAngle,
    setFanRotationAngle,
    stopFling,
    flingFrameRef, // State and refs needed in the loop
    FLING_DAMPING,
    FLING_MIN_VELOCITY,
    LEFT_MAX_ANGLE,
    RIGHT_MAX_ANGLE, // Constants
  ]);

  // Starts the fling animation with an initial velocity
  const startFling = useCallback(
    (initialVelocity) => {
      velocityRef.current = initialVelocity; // Store the initial velocity (degrees/ms)
      // Start the animation loop by requesting the first frame
      flingFrameRef.current = requestAnimationFrame(flingStep);
    },
    [flingStep, flingFrameRef] // Dependencies on the step function and the frame ref
  );
  // --- Initial Shuffle on Mount ---
  // Triggers the shuffle animation when the component first mounts
  useEffect(() => {
    // Start the shuffle animation when the component mounts
    const cleanupShuffleTimeout = startShuffleAnimation();

    // Cleanup function combines clearing the shuffle timeout and other animation/fling cleanup
    return () => {
      cleanupShuffleTimeout(); // Clear the timeout set by startShuffleAnimation
      stopFling(); // Also stop any potential fling animation
      cancelAnimationFrame(flingFrameRef.current); // Ensure fling animation frame is cancelled
      // Note: Selection animation timeout is handled inside handleCardClick's return
    };
  }, [startShuffleAnimation, stopFling]); // Dependencies: Rerun if startShuffleAnimation or stopFling change (they are stable via useCallback)

  // --- Touch/Mouse Event Handlers ---

  // Helper: Checks if the fan is currently interactive
  // Interaction is NOT allowed during shuffle, selection animation, revealing, or revealed phases
  const canInteractWithFan =
    !!question && // Added question check
    !isShuffling &&
    !animatingCard &&
    !["revealing", "revealed"].includes(selectionPhase);

  // Helper to get the correct pointer X coordinate for mouse or touch events
  const getPointerX = (e) => (e.touches ? e.touches[0].clientX : e.clientX);

  // Handles interaction start (mousedown or touchstart)
  const handleInteractionStart = useCallback(
    (e) => {
      if (!canInteractWithFan) return; // Ignore if not interactive
      e.preventDefault(); // Prevent default browser actions like scrolling/text selection
      stopFling(); // Stop any ongoing fling animation

      // Get the starting pointer position
      const clientX = getPointerX(e);

      // Store start position and current angle in refs
      dragStartRef.current.x = clientX;
      dragStartRef.current.angle = fanRotationAngle; // Capture the fan's current angle at the start of drag

      // Reset velocity calculation refs
      lastMoveTimeRef.current = Date.now();
      lastMoveAngleRef.current = fanRotationAngle;
      velocityRef.current = 0; // Reset velocity at the start of drag

      // Set dragging state to true
      setIsDragging(true);
    },
    [canInteractWithFan, fanRotationAngle, stopFling] // Dependencies: state/refs/callbacks used inside
  );

  // Handles interaction move (mousemove or touchmove)
  const handleInteractionMove = useCallback(
    (e) => {
      // Only process move if currently dragging and interaction is allowed, and container ref is ready
      if (!isDragging || !canInteractWithFan || !containerRef.current) return;
      e.preventDefault(); // Prevent default browser actions

      // Get current pointer position
      const clientX = getPointerX(e);

      // Calculate the horizontal distance moved since the drag started
      const deltaX = clientX - dragStartRef.current.x;

      // Calculate the angle change based on horizontal drag and container radius (sensitivity adjustment)
      const angleDelta = (deltaX / containerRadiusRef.current) * 60; // Multiplier (60) adjusts sensitivity

      // Calculate the potential new rotation angle based on the starting angle from dragStartRef
      let newAngle = dragStartRef.current.angle + angleDelta;

      // Apply Clamping During Drag to prevent exceeding boundaries
      newAngle = Math.max(LEFT_MAX_ANGLE, Math.min(RIGHT_MAX_ANGLE, newAngle));

      // Update the fan rotation angle state
      setFanRotationAngle(newAngle);

      // Calculate Velocity for Fling (used when drag ends)
      const now = Date.now();
      const timeDelta = now - lastMoveTimeRef.current;
      if (timeDelta > 10) {
        // Only calculate if enough time has passed
        const angleChanged = newAngle - lastMoveAngleRef.current;
        velocityRef.current = angleChanged / timeDelta; // Velocity in degrees per millisecond

        // Store current time and angle for the next velocity calculation
        lastMoveTimeRef.current = now;
        lastMoveAngleRef.current = newAngle;
      }
    },
    [
      isDragging,
      canInteractWithFan,
      containerRef,
      dragStartRef,
      setFanRotationAngle,
      lastMoveTimeRef,
      lastMoveAngleRef,
      velocityRef,
      containerRadiusRef,
      LEFT_MAX_ANGLE,
      RIGHT_MAX_ANGLE, // Dependencies
    ]
  );

  // Handles interaction end (mouseup, touchend, mouseleave)
  const handleInteractionEnd = useCallback(() => {
    // Only process end if was dragging and interaction is allowed
    if (!isDragging || !canInteractWithFan) return;

    // Set dragging state to false
    setIsDragging(false);

    // Check if velocity is above the threshold (convert velocity from deg/ms to deg/s)
    const velocityPerSecond = velocityRef.current * 1000; // degrees per second

    if (Math.abs(velocityPerSecond) > FLING_THRESHOLD_VELOCITY) {
      // If velocity is high enough, start the fling animation
      startFling(velocityRef.current); // Pass velocity in deg/ms
    } else {
      // If velocity is too low, stop any residual movement immediately
      velocityRef.current = 0;
      stopFling();
      // Optional: Add logic here to snap to the nearest card center angle
    }
  }, [
    isDragging,
    canInteractWithFan,
    velocityRef,
    startFling,
    stopFling,
    FLING_THRESHOLD_VELOCITY,
  ]);

  // --- Card Click Logic (Includes Selection Animation Trigger) ---
  // Receives the card's stable ID and its DOM element when clicked
  const handleCardClick = useCallback(
    (cardId, cardElement) => {
      if (!question) return; // Prevent selection if no question
      // Find the original card data using its stable ID
      const cardData = originalCardsData.current.find((c) => c.id === cardId);
      if (!cardData) {
        console.error(`Card data not found for ID: ${cardId}`);
        return; // Should not happen if data is consistent
      }

      // Check if the card ID is already selected in *any* slot
      const alreadySelected = Object.values(selectedCards).some(
        (selected) => selected?.cardId === cardId
      );
      // Prevent selection if already selected or interaction is not allowed
      if (alreadySelected || !canInteractWithFan) {
        // console.log(`Card ${cardId} click denied. Already selected: ${alreadySelected}, Can interact: ${canInteractWithFan}`);
        return;
      }

      // Determine which slot to fill based on the current phase
      let targetSlotLabel = null;
      if (selectionPhase === "selectingPast") targetSlotLabel = "past";
      else if (selectionPhase === "selectingPresent")
        targetSlotLabel = "present";
      else if (selectionPhase === "selectingFuture") targetSlotLabel = "future";

      // Proceed only if a target slot is determined and DOM elements are available
      if (targetSlotLabel && cardElement && slotRefs[targetSlotLabel].current) {
        stopFling(); // Stop fan movement immediately when a card is selected

        // 1. Trigger Selection Animation
        const startRect = cardElement.getBoundingClientRect(); // Clicked card's position
        const endSlotElement = slotRefs[targetSlotLabel].current; // Target slot DOM element
        const endRect = endSlotElement.getBoundingClientRect(); // Target slot position

        // Set state to render the separate animating card element
        setAnimatingCard({ cardId, startRect, endRect });

        // Hide the card in the fan instantly by updating the state that controls its visibility (isHiddenDuringAnimation)
        // The `animatingCard` state update will trigger a re-render, causing the specific TarotCard instance to hide itself.
        // Delay the phase change and selected cards state update until the animation finishes

        // Generate random reversed state
        const reversed = Math.random() < 0.5;
        // 2. Update Selected Cards State and advance phase AFTER animation duration
        const animationTimeoutId = setTimeout(() => {
          setSelectedCards((prev) => ({
            ...prev,
            [targetSlotLabel]: { cardId: cardId, data: cardData, reversed }, // Store stable cardId and data
          }));

          // Clear the animating card state, removing the separate animating element
          setAnimatingCard(null);

          // 3. Advance Phase after animation finishes and state is updated
          if (targetSlotLabel === "past") setSelectionPhase("selectingPresent");
          else if (targetSlotLabel === "present")
            setSelectionPhase("selectingFuture");
          else if (targetSlotLabel === "future") {
            setSelectionPhase("revealing"); // All cards selected, trigger reveal phase
            setRevealedSlots({ past: false, present: false, future: false }); // Reset reveal tracker
          }
        }, SELECT_ANIMATION_DURATION); // Wait for animation to finish

        // Return a cleanup function for the timeout
        return () => clearTimeout(animationTimeoutId);
      }
      // If no slot is targeted or DOM elements are missing, click is ignored
    },
    [
      selectionPhase,
      selectedCards,
      canInteractWithFan,
      stopFling,
      slotRefs,
      originalCardsData,
      SELECT_ANIMATION_DURATION,
      question, // Dependencies
    ]
  );

  // --- Reveal Completion Tracking ---
  // Callback function for SelectedCardSlot to signal when its reveal animation is complete
  const handleSlotRevealComplete = useCallback(
    (slotLabel) => {
      // Update the state for the completed slot
      setRevealedSlots((prev) => {
        const newState = { ...prev, [slotLabel.toLowerCase()]: true };
        // Check if all slots are now revealed
        if (Object.values(newState).every(Boolean)) {
          // If all slots are revealed, move to the final 'revealed' state
          setSelectionPhase("revealed");
        }
        return newState;
      });
    },
    [setSelectionPhase]
  ); // Dependency: setSelectionPhase is used inside

  // --- Effect for Attaching/Detaching Event Listeners ---
  // Manages mouse and touch events on the fan container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return; // Exit if container ref is not yet attached

    // Add listeners conditionally based on whether the fan is interactive
    if (canInteractWithFan) {
      container.addEventListener("mousedown", handleInteractionStart);
      container.addEventListener("touchstart", handleInteractionStart, {
        passive: true,
      }); // Use passive: true for touchstart
      container.addEventListener("mousemove", handleInteractionMove);
      container.addEventListener("touchmove", handleInteractionMove, {
        passive: true,
      }); // Use passive: true for touchmove
      container.addEventListener("mouseup", handleInteractionEnd);
      container.addEventListener("touchend", handleInteractionEnd);
      container.addEventListener("mouseleave", handleInteractionEnd); // End drag if pointer leaves the container
    }

    // Cleanup function: Remove all listeners and stop animations when dependencies change or component unmounts
    return () => {
      // Remove listeners unconditionally
      container.removeEventListener("mousedown", handleInteractionStart);
      container.removeEventListener("touchstart", handleInteractionStart);
      container.removeEventListener("mousemove", handleInteractionMove);
      container.removeEventListener("touchmove", handleInteractionMove);
      container.removeEventListener("mouseup", handleInteractionEnd);
      container.removeEventListener("touchend", handleInteractionEnd);
      container.removeEventListener("mouseleave", handleInteractionEnd);

      // Stop any animations/timeouts managed by the component
      stopFling(); // Stop fling animation
      cancelAnimationFrame(flingFrameRef.current); // Ensure fling frame is cancelled
      // Note: Shuffle timeout is cleared in its own effect's cleanup
      // Note: Selection animation timeout is cleared in handleCardClick's return
    };
  }, [
    // Dependencies: Include the handler functions and the flag controlling interactivity
    handleInteractionStart,
    handleInteractionMove,
    handleInteractionEnd,
    stopFling,
    canInteractWithFan,
    flingFrameRef, // Added flingFrameRef to ensure cleanup always cancels
  ]);

  // --- Determine current prompt text ---
  let promptText = "";
  if (isShuffling) promptText = "Shuffling the deck...";
  else if (animatingCard)
    promptText = "Selecting card..."; // Prompt during selection animation
  else if (selectionPhase === "selectingPast")
    promptText = "Please enter your question before selecting a card.";
  else if (selectionPhase === "selectingPresent")
    promptText = "Select a card for the Present";
  else if (selectionPhase === "selectingFuture")
    promptText = "Select a card forecasting the Future";
  else if (selectionPhase === "revealing")
    promptText = "Revealing your destiny...";
  else if (selectionPhase === "revealed")
    promptText = "Your Past, Present, and Future.";

  // --- Conditional Rendering Flags ---
  // Show fan during shuffle and selection phases (when not revealing/revealed)
  const showFan = !["revealing", "revealed"].includes(selectionPhase);
  // Show slots if not showing fan, OR any card is selected, OR a card is animating
  const showSlots =
    !showFan || Object.values(selectedCards).some(Boolean) || animatingCard;

  // Get IDs of chosen cards for easy lookup
  const chosenCardIds = Object.values(selectedCards)
    .filter(Boolean) // Remove null values
    .map((selected) => selected.cardId); // Extract the cardId

  // Get the data for the card that is currently animating, if any
  const animatingCardData = animatingCard
    ? originalCardsData.current.find((card) => card.id === animatingCard.cardId)
    : null;

  // --- Render ---
  return (
    // Main container with background and centering styles
    // Use layoutRef to get its position for calculating animation coordinates
    <div
      ref={layoutRef} // Attach layout ref here
      className="flex flex-col items-center w-full min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-purple-100 overflow-hidden relative" // Add relative positioning for absolute children
    >
      {/* Prompt Text Display */}
      <div className="mt-5 text-center font-light text-3xl">
        <h1>🔮 Tarot Reading</h1>
      </div>
      {/* Add Question Input */}
      <div className="mt-8 w-full max-w-2xl px-4">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={promptText}
          className="w-full p-4 rounded-lg bg-purple-800/50 border border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-purple-300"
        />
      </div>
      {/* Selected Card Slots Area */}
      {/* Uses flexbox to arrange slots (column on mobile, row on desktop) */}
      <div
        className={`flex flex-row  w-full max-w-4xl flex-nowrap overflow-x-auto md:justify-center
     justify-start items-stretch mt-8 transition-opacity duration-500 ease-in-out ${
          showSlots ? "opacity-100" : "opacity-0 pointer-events-none" // Hide and disable interaction when not shown
        }`}
      >
        {/* SelectedCardSlot for the Past position */}
        <SelectedCardSlot
          ref={slotRefs.past} // Attach ref to get DOM position
          label="Past" // Label for the slot
          cardData={selectedCards.past?.data} // Data of the selected card (or null)
          isSelected={!!selectedCards.past} // Is a card assigned to this slot?
          isRevealing={selectionPhase === "revealing"} // Is the overall reveal phase active?
          onRevealComplete={handleSlotRevealComplete} // Callback when reveal animation finishes
          cardWidth={cardWidth} // Pass responsive dimensions
          cardHeight={cardHeight} // Pass responsive dimensions
          reversed={selectedCards.past?.reversed}
        />
        {/* SelectedCardSlot for the Present position */}
        <SelectedCardSlot
          ref={slotRefs.present} // Attach ref
          label="Present"
          cardData={selectedCards.present?.data}
          isSelected={!!selectedCards.present}
          isRevealing={selectionPhase === "revealing"}
          onRevealComplete={handleSlotRevealComplete}
          cardWidth={cardWidth}
          cardHeight={cardHeight}
          reversed={selectedCards.present?.reversed}
        />
        {/* SelectedCardSlot for the Future position */}
        <SelectedCardSlot
          ref={slotRefs.future} // Attach ref
          label="Future"
          cardData={selectedCards.future?.data}
          isSelected={!!selectedCards.future}
          isRevealing={selectionPhase === "revealing"}
          onRevealComplete={handleSlotRevealComplete}
          cardWidth={cardWidth}
          cardHeight={cardHeight}
          reversed={selectedCards.future?.reversed}
        />
      </div>

      {/* Tarot Fan Container */}
      {/* Absolute positioning is needed for cards to fan out from a central point */}
      {/* Adjusted height dynamically/responsively and added transitions */}
      <div
        ref={containerRef} // Attach container ref here
        className={`relative w-full transition-opacity duration-500 ease-in-out ${
          showFan // Fan is shown during shuffle and selection phases
            ? "opacity-100 h-[400px] sm:h-[450px] md:h-[400px] overflow-hidden" // Example responsive heights, overflow hidden
            : "opacity-0 h-full pointer-events-none overflow-hidden" // Hide and disable interaction, keep overflow hidden
        }`}
        style={{ touchAction: "none" }} // Prevent default touch behaviors
      >
        {/* Render Tarot Cards in the fan */}
        {showFan && // Only render fan cards if showFan is true
          fannedCardsData.map((card, index) => {
            // Map over the shuffled data
            // Calculate the base angle for each card in the fan
            // This formula centers the fan's angular spread around the initial angle
            const baseAngle =
              (index - (fannedCardsData.length - 1) / 2) * cardSpaceAngle;

            // Check if card ID is among chosen IDs (using stable ID)
            const isChosen = chosenCardIds.includes(card.id);
            // Is this the card currently animating away? (using stable ID)
            const isAnimatingThisCard = animatingCard?.cardId === card.id;

            return (
              // TarotCard component represents a single card in the fan
              <TarotCard
                key={card.id} // Unique key using stable card ID
                cardData={card} // Pass the card's data (from shuffled array)
                index={index} // Pass its current index in the fanned array (used for baseAngle)
                totalCards={fannedCardsData.length} // Pass total cards in the fanned array
                baseAngle={baseAngle} // The angle this card would have if fanRotationAngle was 0
                currentRotation={fanRotationAngle} // The current overall fan rotation
                isChosen={isChosen} // Is this card already selected?
                // Card is selectable only if interaction is allowed, it's not chosen, and it's not currently animating
                isSelectable={
                  canInteractWithFan && !isChosen && !isAnimatingThisCard
                }
                // Pass a ref callback to get the DOM element when clicked
                onClick={(e) => {
                  // Pass card ID and the DOM element of the clicked card
                  handleCardClick(card.id, e.currentTarget);
                }}
                containerRadius={containerRadiusRef.current} // Radius for positioning
                cardWidth={cardWidth} // Pass responsive dimensions
                cardHeight={cardHeight} // Pass responsive dimensions
                // Animation Props for Shuffle and Selection
                isShuffling={isShuffling}
                shuffleDuration={SHUFFLE_DURATION}
                // Tell the card to be hidden while its copy is animating separately
                isHiddenDuringAnimation={isAnimatingThisCard}
              />
            );
          })}
      </div>

      {/* Render the animating card separately on top */}
      {/* This div animates from the clicked card's position to the target slot's position */}
      {/* Only render if animatingCard state is set and card data is found and layoutRef is ready */}
      {animatingCard && animatingCardData && layoutRef.current && (
        <div
          style={{
            position: "absolute", // Position relative to the root layout div (layoutRef)
            // Initial position relative to the layoutRef's top/left
            top:
              animatingCard.startRect.top -
              layoutRef.current.getBoundingClientRect().top,
            left:
              animatingCard.startRect.left -
              layoutRef.current.getBoundingClientRect().left,
            width: animatingCard.startRect.width,
            height: animatingCard.startRect.height,
            transformOrigin: "center", // Pivot for rotation/scale
            transform: `
                             /* Initial transform will be applied immediately via ref callback */
                             translateZ(100px) /* Ensure it's above other elements */
                        `,
            transition: `all ${SELECT_ANIMATION_DURATION}ms ease-in-out`, // Apply transition
            zIndex: 100, // Ensure it's the topmost interactive element
            backgroundImage: `url(${animatingCardData.backImage})`, // Use back image initially
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "10px", // Match card border radius
            cursor: "default", // Not clickable during animation
            willChange: "transform, top, left, width, height", // Hint to browser for performance
          }}
          // Use a ref callback to get the DOM element and trigger the animation transition
          ref={(el) => {
            if (el && animatingCard && layoutRef.current) {
              // Use requestAnimationFrame to ensure initial styles are applied before transition
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  // Double rAF ensures styles are painted before transition starts
                  if (el && animatingCard && layoutRef.current) {
                    // Calculate the target position (center of the end slot) relative to the layoutRef
                    const layoutRect =
                      layoutRef.current.getBoundingClientRect();
                    const endCenterX =
                      animatingCard.endRect.left +
                      animatingCard.endRect.width / 2;
                    const endCenterY =
                      animatingCard.endRect.top +
                      animatingCard.endRect.height / 2;

                    // Calculate the new top/left for the element's top-left corner
                    // This positions the element such that its center aligns with the slot's center
                    const targetTop =
                      endCenterY - animatingCard.endRect.height / 2;
                    const targetLeft =
                      endCenterX - animatingCard.endRect.width / 2;

                    // Calculate the translation needed from the element's *current* top/left
                    // to the target top/left, *plus* adjust for centering the transform
                    // (The element's initial top/left was set using startRect)
                    const currentLeft =
                      animatingCard.startRect.left - layoutRect.left;
                    const currentTop =
                      animatingCard.startRect.top - layoutRect.top;

                    const translateX = targetLeft - currentLeft;
                    const translateY = targetTop - currentTop;

                    // Apply the final animated styles using transform, width, height
                    el.style.transform = `
                                            translate(${translateX}px, ${translateY}px)
                                            rotate(0deg) /* Animate to upright rotation */
                                            scale(${
                                              animatingCard.endRect.width /
                                              animatingCard.startRect.width
                                            }) /* Scale to slot size */
                                            translateZ(100px)
                                        `;
                    el.style.width = `${animatingCard.endRect.width}px`; // Animate width/height as well
                    el.style.height = `${animatingCard.endRect.height}px`;

                    // Note: We could also just animate top/left directly along with transform scale/rotate
                    // el.style.top = `${targetTop}px`;
                    // el.style.left = `${targetLeft}px`;
                    // el.style.transform = `rotate(0deg) scale(${...}) translateZ(...)`
                    // The current approach animates top/left + transform translate for movement
                  }
                });
              });
            }
          }}
        />
      )}

      {/* Optional: Reset Button */}
      {/* Shown only when the reading is complete */}
      {selectionPhase === "revealed" && (
        <>
          <ThreeCardReading
            question={question}
            past={selectedCards.past?.data.name}
            present={selectedCards.present?.data.name}
            future={selectedCards.future?.data.name}
            past_reverse={selectedCards.past?.reversed}
            present_reverse={selectedCards.present?.reversed}
            future_reverse={selectedCards.future?.reversed}
          />
          {/* <button
            onClick={() => {
              // Reset all relevant state variables to start a new reading
              setSelectedCards({ past: null, present: null, future: null });
              setSelectionPhase("initial"); // Go back to initial phase to trigger shuffle
              setFanRotationAngle(0); // Reset fan rotation
              setRevealedSlots({ past: false, present: false, future: false }); // Reset reveal tracker
              stopFling(); // Ensure any residual animation is stopped
              setAnimatingCard(null); // Ensure animation state is clear
              // The useEffect for initial mount will handle starting the shuffle animation again
            }}
            className="mt-8 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white transition-colors"
          >
            Read Again
          </button> */}
        </>
      )}
    </div>
  );
};

export default TarotCardLayout;
