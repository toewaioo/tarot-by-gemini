import React, { forwardRef, useState, useEffect } from "react";

const SelectedCardSlot = forwardRef(
  (
    {
      label,
      cardData,
      isSelected,
      isRevealing,
      onRevealComplete,
      cardWidth,
      cardHeight,
      reversed = false, // Add reversed prop with default false
    },
    ref
  ) => {
    const [isCardRevealed, setIsCardRevealed] = useState(false);
    const flipAnimationDuration = 600;
    // --- Reveal Animation Logic ---
    // Effect to trigger the card reveal (flip) animation when the overall revealing phase starts
    useEffect(() => {
        console.log(`Slot ${label} useEffect triggered. isRevealing: ${isRevealing}, cardData: ${!!cardData}, isCardRevealed: ${isCardRevealed}`);

        // Trigger reveal if:
        // 1. The overall phase is 'revealing' AND
        // 2. A card's data is present in this slot AND
        // 3. The card in this slot is NOT already revealed
        if (isRevealing && cardData && !isCardRevealed) {
            console.log(`Slot ${label} starting reveal timeout (duration: ${flipAnimationDuration}ms).`);
            // Start the reveal animation (the CSS transition will handle the visual flip)
            // Set a timeout to simulate the animation duration and mark it as complete
            const revealTimeoutId = setTimeout(() => {
                console.log(`Slot ${label} reveal timeout finished. Setting isCardRevealed(true).`);
                setIsCardRevealed(true); // Mark card as revealed visually (triggers CSS flip)
                // Notify the parent component that this slot's reveal animation is visually complete
                if (onRevealComplete) {
                    console.log(`Slot ${label} calling onRevealComplete.`);
                    onRevealComplete(label); // Pass the slot label back to the parent
                }
            }, flipAnimationDuration); // Wait for the CSS flip animation duration

            // Cleanup function: Clear the timeout if the component unmounts or dependencies change before it finishes
            return () => {
                 console.log(`Slot ${label} useEffect cleanup: Clearing timeout.`);
                 clearTimeout(revealTimeoutId);
            };

        } else if (!isRevealing && isCardRevealed) {
             // Reset the revealed state if the overall phase is no longer revealing
             // This happens on a full reset ("Read Again")
             console.log(`Slot ${label} resetting isCardRevealed because isRevealing is false.`);
             setIsCardRevealed(false);
        }
        // Dependencies: isRevealing (to start animation), cardData (ensure data exists),
        // isCardRevealed (prevent re-triggering), onRevealComplete, label (used in callback)
    }, [isRevealing, cardData, isCardRevealed, onRevealComplete, label]);


    // Reset internal reveal state when the card data for the slot changes (e.g., on reset)
    // This ensures a new card in the slot is initially face down
    useEffect(() => {
        console.log(`Slot ${label} cardData changed. Resetting isCardRevealed.`);
        setIsCardRevealed(false);
    }, [cardData]); // Re-run when the specific card assigned to this slot changes (via cardData prop)


    // ... (keep existing useEffect hooks the same)
    // Define common styles for the card container within the slot
    const cardContainerStyle = {
      width: cardWidth,
      height: cardHeight,
      borderRadius: "10px",
      boxShadow: "0 4px 8px rgba(0,0,0,0.5)",
      cursor: isSelected ? "pointer" : "default", // Cursor hint if a card is present
      transformStyle: "preserve-3d", // Needed for 3D transforms on children (the faces)
      transition: `transform ${flipAnimationDuration}ms ease-in-out`, // CSS Transition for the flip animation
      position: "relative", // Needed for absolute positioning of card faces
      overflow: "hidden", // Hide overflow during flip
    };

    // Update cardFaceStyle to include reversed transformation
    const cardFaceStyle = {
      position: "absolute",
      width: "100%",
      height: "100%",
      backgroundSize: "cover",
      backgroundPosition: "center",
      borderRadius: "10px",
      backfaceVisibility: "hidden",
      transition: `transform ${flipAnimationDuration}ms ease-in-out`,
    };

    return (
      <div ref={ref} className="flex flex-col items-center m-2">
        <h3 className="text-md sm:text-lg font-semibold text-purple-300 mb-2 min-h-6 text-center">
          {label}
        </h3>

        <div
          className={`relative flex items-center justify-center border-2 border-purple-600 rounded-lg overflow-hidden
                           transition-opacity duration-500 ease-in-out ${
                             isSelected
                               ? "opacity-100"
                               : "opacity-50 pointer-events-none"
                           }`}
          style={{ width: cardWidth, height: cardHeight }}
        >
          {isSelected && cardData ? (
            <div
              style={{
                ...cardContainerStyle,
                transform: isCardRevealed ? "rotateY(0deg)" : "rotateY(180deg)",
              }}
            >
              {/* Back Face - remains unchanged */}
              <div
                style={{
                  ...cardFaceStyle,
                  backgroundImage: `url(${cardData.backImage})`,
                  transform: "rotateY(-180deg)",
                }}
              />

              {/* Front Face with reversed rotation */}
              <div
                style={{
                  ...cardFaceStyle,
                  backgroundImage: `url(${cardData.frontImage})`,
                  transform: `rotateY(0deg) ${
                    reversed ? "rotate(180deg)" : ""
                  }`,
                }}
              />
            </div>
          ) : (
            <span className="text-purple-400 text-sm">Select Card</span>
          )}
        </div>
        <h3 className="text-sm font-normal  mt-3 text-purple-300 mb-2 min-h-1 text-center">
          {cardData?.name}{reversed? "(Reversed)": ""}
        </h3>
      </div>
    );
  }
);

export default SelectedCardSlot;
