import React, { useState, useRef, useEffect, useCallback } from "react";

// For responsiveness hook - assuming it's installed via '@reactuses/core'
import { useWindowSize } from "@reactuses/core";

import TarotCard from "./TarotCard";
import SelectedCardSlot from "./SelectedCardSlot";
import ThinkingComponent from "./ThinkingComponent"; // Import the ThinkingComponent

// --- Constants ---
const CARD_INIT_ANGLE_BASE = -60;
const CARD_SPACE_ANGLE_BASE = 8;
const LEFT_MAX_ANGLE = -100; // Adjusted example boundary for fan rotation
const RIGHT_MAX_ANGLE = 100; // Adjusted example boundary for fan rotation
const FLING_THRESHOLD_VELOCITY = 300; // degrees per second required to trigger fling
const FLING_DAMPING = 0.93; // Damping factor for fling animation
const FLING_MIN_VELOCITY = 5; // Minimum velocity (deg/s) to continue fling animation

// --- Animation Constants ---
const SHUFFLE_DURATION = 1500; // Milliseconds for the shuffle animation
const SELECT_ANIMATION_DURATION = 600; // Milliseconds for the card selection animation
const REVEAL_ANIMATION_DURATION = 600; // Match CSS transition in SelectedCardSlot

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
const NUM_CARDS = cardNames.length; // Should be 78 based on the lists

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
      frontImage: `/images/tarot/${cardImages[i]}`, // Construct image path
      backImage: "/images/tarot/_cover.png", // Use a single back image
      meaning: null, // Placeholder for meaning data
    });
  }
  return data;
};

const mockCardData = createCardDataFromLists(); // Use the new function to create data

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
  const [selectionPhase, setSelectionPhase] = useState("initial"); // initial, selectingPast, selectingPresent, selectingFuture, revealing, consultingAPI, revealed

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

  const cardWidth = isMobile ? 60 : 80;
  const cardHeight = isMobile ? 90 : 120;
  const cardSpaceAngle = isMobile ? 10 : CARD_SPACE_ANGLE_BASE;
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
    updateContainerRadius();
  }, [windowWidth, isMobile]);

  // --- Shuffle Logic ---
  const startShuffleAnimation = useCallback(() => {
    setIsShuffling(true);
    // Shuffle the data array that feeds the fanned cards
    setFannedCardsData(shuffleArray(originalCardsData.current));
    setFanRotationAngle(0); // Reset fan rotation for the shuffle animation

    const shuffleTimeoutId = setTimeout(() => {
      setIsShuffling(false);
      setSelectionPhase("selectingPast");
    }, SHUFFLE_DURATION);

    return () => clearTimeout(shuffleTimeoutId);
  }, [
    originalCardsData,
    setFannedCardsData,
    setIsShuffling,
    setSelectionPhase,
    SHUFFLE_DURATION,
  ]);

  // --- Fling Animation Logic ---
  const stopFling = useCallback(() => {
    if (flingFrameRef.current) {
      cancelAnimationFrame(flingFrameRef.current);
    }
    flingFrameRef.current = null;
    velocityRef.current = 0;
  }, []);

  const flingStep = useCallback(() => {
    velocityRef.current *= FLING_DAMPING;
    let newAngle = fanRotationAngle + velocityRef.current;

    if (newAngle < LEFT_MAX_ANGLE || newAngle > RIGHT_MAX_ANGLE) {
      velocityRef.current = 0;
      newAngle = Math.max(LEFT_MAX_ANGLE, Math.min(RIGHT_MAX_ANGLE, newAngle));
      setFanRotationAngle(newAngle);
      stopFling();
      return;
    }

    if (Math.abs(velocityRef.current * 1000) > FLING_MIN_VELOCITY) {
      setFanRotationAngle(newAngle);
      flingFrameRef.current = requestAnimationFrame(flingStep);
    } else {
      stopFling();
    }
  }, [
    fanRotationAngle,
    setFanRotationAngle,
    stopFling,
    flingFrameRef,
    FLING_DAMPING,
    FLING_MIN_VELOCITY,
    LEFT_MAX_ANGLE,
    RIGHT_MAX_ANGLE,
  ]);

  const startFling = useCallback(
    (initialVelocity) => {
      velocityRef.current = initialVelocity;
      flingFrameRef.current = requestAnimationFrame(flingStep);
    },
    [flingStep, flingFrameRef]
  );
  // --- Initial Shuffle on Mount ---
  useEffect(() => {
    const cleanupShuffleTimeout = startShuffleAnimation();
    return () => {
      cleanupShuffleTimeout();
      stopFling();
      cancelAnimationFrame(flingFrameRef.current);
    };
  }, [startShuffleAnimation, stopFling]);

  // --- Touch/Mouse Event Handlers ---
  const canInteractWithFan =
    !isShuffling &&
    !animatingCard &&
    !["revealing", "revealed", "consultingAPI"].includes(selectionPhase);
  const getPointerX = (e) => (e.touches ? e.touches[0].clientX : e.clientX);

  const handleInteractionStart = useCallback(
    (e) => {
      if (!canInteractWithFan) return;
      e.preventDefault();
      stopFling();
      const clientX = getPointerX(e);
      dragStartRef.current.x = clientX;
      dragStartRef.current.angle = fanRotationAngle;
      lastMoveTimeRef.current = Date.now();
      lastMoveAngleRef.current = fanRotationAngle;
      velocityRef.current = 0;
      setIsDragging(true);
    },
    [canInteractWithFan, fanRotationAngle, stopFling]
  );

  const handleInteractionMove = useCallback(
    (e) => {
      if (!isDragging || !canInteractWithFan || !containerRef.current) return;
      e.preventDefault();
      const clientX = getPointerX(e);
      const deltaX = clientX - dragStartRef.current.x;
      const angleDelta = (deltaX / containerRadiusRef.current) * 60;
      let newAngle = dragStartRef.current.angle + angleDelta;

      newAngle = Math.max(LEFT_MAX_ANGLE, Math.min(RIGHT_MAX_ANGLE, newAngle));
      setFanRotationAngle(newAngle);

      const now = Date.now();
      const timeDelta = now - lastMoveTimeRef.current;
      if (timeDelta > 10) {
        const angleChanged = newAngle - lastMoveAngleRef.current;
        velocityRef.current = angleChanged / timeDelta;
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
      RIGHT_MAX_ANGLE,
    ]
  );

  const handleInteractionEnd = useCallback(() => {
    if (!isDragging || !canInteractWithFan) return;
    setIsDragging(false);
    const velocityPerSecond = velocityRef.current * 1000;

    if (Math.abs(velocityPerSecond) > FLING_THRESHOLD_VELOCITY) {
      startFling(velocityRef.current);
    } else {
      velocityRef.current = 0;
      stopFling();
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
  const handleCardClick = useCallback(
    (cardId, cardElement) => {
      const cardData = originalCardsData.current.find((c) => c.id === cardId);
      if (!cardData) {
        console.error(
          `Click Logic Error: Card data not found for ID: ${cardId}`
        );
        return;
      }

      const alreadySelected = Object.values(selectedCards).some(
        (selected) => selected?.cardId === cardId
      );
      if (alreadySelected || !canInteractWithFan) {
        console.log(
          `Click Logic: Card ${cardId} click denied. Already selected: ${alreadySelected}, Can interact: ${canInteractWithFan}`
        );
        return;
      }

      let targetSlotLabel = null;
      if (selectionPhase === "selectingPast") targetSlotLabel = "past";
      else if (selectionPhase === "selectingPresent")
        targetSlotLabel = "present";
      else if (selectionPhase === "selectingFuture") targetSlotLabel = "future";

      if (targetSlotLabel && cardElement && slotRefs[targetSlotLabel].current) {
        console.log(
          `Click Logic: Card ${cardId} selected for slot ${targetSlotLabel}. Starting animation.`
        );
        stopFling();

        const startRect = cardElement.getBoundingClientRect();
        const endSlotElement = slotRefs[targetSlotLabel].current;
        const endRect = endSlotElement.getBoundingClientRect();

        setAnimatingCard({ cardId, startRect, endRect });

        const animationTimeoutId = setTimeout(() => {
          console.log(
            `Click Logic: Selection animation timeout finished for card ${cardId}. Updating state.`
          );
          setSelectedCards((prev) => ({
            ...prev,
            [targetSlotLabel]: { cardId: cardId, data: cardData },
          }));

          setAnimatingCard(null); // Clear animating state

          // Advance Phase
          if (targetSlotLabel === "past") {
            setSelectionPhase("selectingPresent");
            console.log(
              'Click Logic: Phase transitioning to "selectingPresent".'
            );
          } else if (targetSlotLabel === "present") {
            setSelectionPhase("selectingFuture");
            console.log(
              'Click Logic: Phase transitioning to "selectingFuture".'
            );
          } else if (targetSlotLabel === "future") {
            setSelectionPhase("revealing"); // <--- This is where the reveal phase starts!
            console.log('Click Logic: Phase transitioning to "revealing".');
            setRevealedSlots({ past: false, present: false, future: false }); // Reset tracker
          }
        }, SELECT_ANIMATION_DURATION);

        return () => {
          console.log(
            `Click Logic: Cleaning up selection animation timeout for card ${cardId}.`
          );
          clearTimeout(animationTimeoutId);
        };
      } else {
        console.warn(
          `Click Logic: Selection logic failed for card ${cardId}. targetSlotLabel: ${targetSlotLabel}, cardElement: ${!!cardElement}, slotRef ready: ${!!slotRefs[
            targetSlotLabel
          ]?.current}`
        );
      }
    },
    [
      selectionPhase,
      selectedCards,
      canInteractWithFan,
      stopFling,
      slotRefs,
      originalCardsData,
      SELECT_ANIMATION_DURATION,
    ]
  );

  // --- Reveal Completion Tracking ---
  const handleSlotRevealComplete = useCallback(
    (slotLabel) => {
      console.log(
        `Reveal Completion: Slot ${slotLabel} reported reveal complete.`
      );
      setRevealedSlots((prev) => {
        const newState = { ...prev, [slotLabel.toLowerCase()]: true };
        console.log(
          "Reveal Completion: Updated revealedSlots state:",
          newState
        );
        // Check if ALL three slots have reported completion
        if (Object.values(newState).every(Boolean)) {
          // All slots are visually revealed, now transition to the API calling phase
          setSelectionPhase("consultingAPI"); // <--- Transition to the new thinking phase
          console.log(
            'Reveal Completion: All slots revealed. Phase transitioning to "consultingAPI".'
          );

          // --- Start API Call Here ---
          // This is where you would trigger your API call to get card meanings
          // Pass the selected cards data (including names and whether they are reversed)
          const pastCard = selectedCards.past?.data;
          const presentCard = selectedCards.present?.data;
          const futureCard = selectedCards.future?.data;

          // You'll need to determine if the card is reversed.
          // This logic isn't currently in the selection process.
          // For now, we'll assume they are not reversed for the API call data.
          // You would need to add state/logic to track reversal during selection.
          const apiPayload = {
            past: pastCard?.name,
            past_reverse: false, // <-- Need logic to determine this
            present: presentCard?.name,
            present_reverse: false, // <-- Need logic to determine this
            future: futureCard?.name,
            future_reverse: false, // <-- Need logic to determine this
            question: "What does my past, present, and future hold?", // <-- Replace with actual user question input
          };
          console.log("API Call Simulation: Payload:", apiPayload);

          // Simulate an API call duration
          const apiCallTimeout = setTimeout(() => {
            console.log(
              'API Simulation: API call finished. Transitioning to "revealed".'
            );
            // In a real app, you'd update state with API data here
            // For example, update selectedCards.past.data.meaning, etc.
            const updatedSelectedCards = { ...selectedCards };
            // Simulate adding meaning (replace with real API data)
            if (updatedSelectedCards.past)
              updatedSelectedCards.past.data = {
                ...updatedSelectedCards.past.data,
                meaning: "Past Meaning Placeholder",
              };
            if (updatedSelectedCards.present)
              updatedSelectedCards.present.data = {
                ...updatedSelectedCards.present.data,
                meaning: "Present Meaning Placeholder",
              };
            if (updatedSelectedCards.future)
              updatedSelectedCards.future.data = {
                ...updatedSelectedCards.future.data,
                meaning: "Future Meaning Placeholder",
              };
            setSelectedCards(updatedSelectedCards); // Update state with meanings

            setSelectionPhase("revealed"); // Transition to the final revealed phase
          }, 2000); // Simulate a 2-second API call

          return () => {
            console.log("API Simulation: Cleaning up API timeout.");
            clearTimeout(apiCallTimeout); // Cleanup API timeout
          };
        }
        return newState;
      });
    },
    [setSelectionPhase, selectedCards]
  ); // Dependency on selectedCards is needed to access their data for the API call

  // --- Effect for Attaching/Detaching Event Listeners ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (canInteractWithFan) {
      container.addEventListener("mousedown", handleInteractionStart);
      container.addEventListener("touchstart", handleInteractionStart, {
        passive: true,
      });
      container.addEventListener("mousemove", handleInteractionMove);
      container.addEventListener("touchmove", handleInteractionMove, {
        passive: true,
      });
      container.addEventListener("mouseup", handleInteractionEnd);
      container.addEventListener("touchend", handleInteractionEnd);
      container.addEventListener("mouseleave", handleInteractionEnd);
    }

    return () => {
      container.removeEventListener("mousedown", handleInteractionStart);
      container.removeEventListener("touchstart", handleInteractionStart);
      container.removeEventListener("mousemove", handleInteractionMove);
      container.removeEventListener("touchmove", handleInteractionMove);
      container.removeEventListener("mouseup", handleInteractionEnd);
      container.removeEventListener("touchend", handleInteractionEnd);
      container.removeEventListener("mouseleave", handleInteractionEnd);
      stopFling();
      cancelAnimationFrame(flingFrameRef.current);
    };
  }, [
    handleInteractionStart,
    handleInteractionMove,
    handleInteractionEnd,
    stopFling,
    canInteractWithFan,
    flingFrameRef,
  ]);

  // --- Debug Log: Layout Render State ---
  console.log("Layout Render State:", {
    selectionPhase,
    isShuffling,
    animatingCard: !!animatingCard,
    canInteractWithFan,
    selectedCardCount: Object.keys(selectedCards).filter(
      (k) => selectedCards[k] !== null
    ).length,
    revealedSlots,
  });

  // --- Determine current prompt text ---
  let promptText = "";
  if (isShuffling) promptText = "Shuffling the deck...";
  else if (animatingCard) promptText = "Selecting card...";
  else if (selectionPhase === "selectingPast")
    promptText = "Select a card representing the Past";
  else if (selectionPhase === "selectingPresent")
    promptText = "Select a card for the Present";
  else if (selectionPhase === "selectingFuture")
    promptText = "Select a card forecasting the Future";
  else if (selectionPhase === "revealing")
    promptText = "Revealing your destiny...";
  else if (selectionPhase === "consultingAPI")
    promptText = "Consulting the cosmos..."; // New prompt for thinking phase
  else if (selectionPhase === "revealed")
    promptText = "Your Past, Present, and Future.";

  // --- Conditional Rendering Flags ---
  // Show fan during shuffle and selection phases (when not revealing/revealed/consultingAPI)
  const showFan = !["revealing", "revealed", "consultingAPI"].includes(
    selectionPhase
  );
  // Show slots if not showing fan, OR any card is selected, OR a card is animating, OR consulting API, OR revealed
  const showSlots =
    !showFan ||
    Object.values(selectedCards).some(Boolean) ||
    animatingCard ||
    selectionPhase === "consultingAPI" ||
    selectionPhase === "revealed";

  // Show thinking component only when consultingAPI phase is active
  const showThinking = selectionPhase === "consultingAPI";

  const chosenCardIds = Object.values(selectedCards)
    .filter(Boolean)
    .map((selected) => selected.cardId);

  const animatingCardData = animatingCard
    ? originalCardsData.current.find((card) => card.id === animatingCard.cardId)
    : null;

  // --- Render ---
  return (
    <div
      ref={layoutRef}
      className="flex flex-col items-center w-full min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-purple-100 p-4 overflow-hidden relative"
    >
      <h2 className="text-lg sm:text-xl font-semibold text-purple-200 mb-4 min-h-8 text-center">
        {promptText}
      </h2>

      {/* Tarot Fan Container */}
      {/* Hide fan completely when thinking or revealed */}
      <div
        ref={containerRef}
        className={`relative w-full transition-opacity duration-500 ease-in-out ${
          showFan
            ? "opacity-100 h-[300px] sm:h-[450px] md:h-[500px] overflow-hidden"
            : "opacity-0 h-0 pointer-events-none overflow-hidden"
        }`}
        style={{ touchAction: "none" }}
      >
        {showFan &&
          fannedCardsData.map((card, index) => {
            const baseAngle =
              cardInitAngle +
              (index - (fannedCardsData.length - 1) / 2) * cardSpaceAngle;
            const isChosen = chosenCardIds.includes(card.id);
            const isAnimatingThisCard = animatingCard?.cardId === card.id;

            return (
              <TarotCard
                key={card.id}
                cardData={card}
                index={index}
                totalCards={fannedCardsData.length}
                baseAngle={baseAngle}
                currentRotation={fanRotationAngle}
                isChosen={isChosen}
                isSelectable={
                  canInteractWithFan && !isChosen && !isAnimatingThisCard
                }
                onClick={(e) => {
                  handleCardClick(card.id, e.currentTarget);
                }}
                containerRadius={containerRadiusRef.current}
                cardWidth={cardWidth}
                cardHeight={cardHeight}
                isShuffling={isShuffling}
                shuffleDuration={SHUFFLE_DURATION}
                isHiddenDuringAnimation={isAnimatingThisCard}
              />
            );
          })}
      </div>

      {/* Animating Card Element */}
      {animatingCard && animatingCardData && layoutRef.current && (
        <div
          style={{
            position: "absolute",
            top:
              animatingCard.startRect.top -
              layoutRef.current.getBoundingClientRect().top,
            left:
              animatingCard.startRect.left -
              layoutRef.current.getBoundingClientRect().left,
            width: animatingCard.startRect.width,
            height: animatingCard.startRect.height,
            transformOrigin: "center",
            transform: `translateZ(100px)`, // Initial transform (only Z for layering)
            transition: `all ${SELECT_ANIMATION_DURATION}ms ease-in-out`,
            zIndex: 100,
            backgroundImage: `url(${animatingCardData.backImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "10px",
            cursor: "default",
            willChange: "transform, top, left, width, height",
          }}
          ref={(el) => {
            if (el && animatingCard && layoutRef.current) {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  if (el && animatingCard && layoutRef.current) {
                    const layoutRect =
                      layoutRef.current.getBoundingClientRect();
                    const endCenterX =
                      animatingCard.endRect.left +
                      animatingCard.endRect.width / 2;
                    const endCenterY =
                      animatingCard.endRect.top +
                      animatingCard.endRect.height / 2;

                    const targetTop =
                      endCenterY - animatingCard.endRect.height / 2;
                    const targetLeft =
                      endCenterX - animatingCard.endRect.width / 2;

                    const currentLeft =
                      animatingCard.startRect.left - layoutRect.left;
                    const currentTop =
                      animatingCard.startRect.top - layoutRect.top;

                    const translateX = targetLeft - currentLeft;
                    const translateY = targetTop - currentTop;

                    el.style.transform = `
                                            translate(${translateX}px, ${translateY}px)
                                            rotate(0deg)
                                            scale(${
                                              animatingCard.endRect.width /
                                              animatingCard.startRect.width
                                            })
                                            translateZ(100px)
                                        `;
                    el.style.width = `${animatingCard.endRect.width}px`;
                    el.style.height = `${animatingCard.endRect.height}px`;
                  }
                });
              });
            }
          }}
        />
      )}

      {/* Selected Card Slots Area */}
      {/* Show slots when revealing, consulting API, or revealed */}
      {(selectionPhase === "revealing" ||
        selectionPhase === "consultingAPI" ||
        selectionPhase === "revealed") && (
        <div
          className={`flex flex-col sm:flex-row justify-around items-start w-full max-w-4xl mt-8 transition-opacity duration-500 ease-in-out ${
            // Opacity handled by the container, but pointer-events off if thinking
            selectionPhase === "consultingAPI"
              ? "opacity-50 pointer-events-none"
              : "opacity-100"
          }`}
        >
          <SelectedCardSlot
            ref={slotRefs.past}
            label="Past"
            cardData={selectedCards.past?.data}
            isSelected={!!selectedCards.past}
            isRevealing={selectionPhase === "revealing"} // Pass the revealing phase state
            onRevealComplete={handleSlotRevealComplete}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
          />
          <SelectedCardSlot
            ref={slotRefs.present}
            label="Present"
            cardData={selectedCards.present?.data}
            isSelected={!!selectedCards.present}
            isRevealing={selectionPhase === "revealing"}
            onRevealComplete={handleSlotRevealComplete}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
          />
          <SelectedCardSlot
            ref={slotRefs.future}
            label="Future"
            cardData={selectedCards.future?.data}
            isSelected={!!selectedCards.future}
            isRevealing={selectionPhase === "revealing"}
            onRevealComplete={handleSlotRevealComplete}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
          />
        </div>
      )}

      {/* Thinking Component */}
      {/* Render the thinking component when showThinking is true */}
      {showThinking && (
        <div className="mt-8">
          {" "}
          {/* Add margin top for spacing */}
          <ThinkingComponent />
        </div>
      )}

      {/* Optional: Reset Button */}
      {selectionPhase === "revealed" && (
        <button
          onClick={() => {
            console.log("Reset Button Clicked.");
            setSelectedCards({ past: null, present: null, future: null });
            setSelectionPhase("initial");
            setFanRotationAngle(0);
            setRevealedSlots({ past: false, present: false, future: false });
            stopFling();
            setAnimatingCard(null);
          }}
          className="mt-8 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white transition-colors"
        >
          Read Again
        </button>
      )}
    </div>
  );
};

export default TarotCardLayout;
