import React, { useRef, useEffect, useState, forwardRef } from "react";

// TarotCard component - Renders a single card in the fan with shuffle and selection animation states
// Using forwardRef to allow parent to get DOM node reference (needed for click animation start position)
const TarotCard = forwardRef(
  (
    {
      cardData, // { id, name, frontImage, backImage, isReversed }
      index, // Current index in the fanned array (used for baseAngle calculation)
      totalCards, // Total cards in fanned array
      baseAngle, // Angle if fanRotationAngle was 0
      currentRotation, // Current overall fan rotation angle
      isChosen, // Is this card already selected for a slot?
      isSelectable, // Can this card be clicked based on layout state?
      onClick, // Click handler provided by parent
      containerRadius, // Radius of the fan arc (used for positioning)
      cardWidth, // Responsive width
      cardHeight, // Responsive height
      isShuffling, // Is the shuffle animation currently active?
      shuffleDuration, // Duration of shuffle animation
      isHiddenDuringAnimation, // Should this card be hidden while its copy is animating to a slot?
      // isReversed prop is added based on the previous update requirement
      isReversed,
    },
    ref
  ) => {
    // Ref to the card's main DOM element
    const cardRef = useRef(null);

    // State to store random initial position/rotation/z-index for the shuffle animation start
    const [shuffleStartTransform, setShuffleStartTransform] = useState({
      x: 0,
      y: 0,
      rotate: 0,
      z: 0, // Add z-translation for depth
      zIndex: 0, // Add zIndex for layering
    });
    // State to control opacity during shuffle
    const [shuffleOpacity, setShuffleOpacity] = useState(1);

    // Effect to generate random shuffle start transform and manage opacity during shuffle
    useEffect(() => {
      let timeoutId;

      if (isShuffling) {
        // Generate more varied random position and rotation for the shuffle start point
        // These values are relative to the card's eventual fanned position (center of the fan)
        const randomX = (Math.random() - 0.5) * 400; // Wider random X offset
        const randomY = (Math.random() - 0.5) * 400; // Wider random Y offset
        const randomRotate = Math.random() * 1080 - 540; // Wider random rotation (-540 to 540)
        const randomZ = Math.random() * 200; // Random Z offset for depth (0 to 200)
        const randomZIndex = Math.floor(Math.random() * totalCards); // Random zIndex for layering

        setShuffleStartTransform({
          x: randomX,
          y: randomY,
          rotate: randomRotate,
          z: randomZ,
          zIndex: randomZIndex, // Set random zIndex
        });
         setShuffleOpacity(1); // Start fully visible during shuffle

      } else {
        // Reset shuffle transform state and opacity when shuffle ends
        // Use a tiny delay to ensure CSS transition applies from the final shuffle state
        timeoutId = setTimeout(() => {
          setShuffleStartTransform({ x: 0, y: 0, rotate: 0, z: 0, zIndex: index }); // Reset zIndex back to index for fanned order
          setShuffleOpacity(1); // Ensure full opacity after shuffle
        }, 50); // Small delay

      }
      // This effect should re-run when isShuffling changes state or totalCards changes (e.g., deck size changed)
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      }
    }, [isShuffling, totalCards, index]); // Added index as dependency for final zIndex

    // Calculate the card's final position and rotation in the fan arc
    // This position is relative to the center point around which the fan rotates
    const finalAngle = baseAngle + currentRotation;

    // Convert polar coordinates (radius, angle) to Cartesian coordinates (x, y)
    // The center of the fan is at (0, 0) in this local coordinate space relative to the container's center
    const radians = (finalAngle * Math.PI) / 180;
    const x = containerRadius * Math.sin(radians);
    const y = containerRadius * (1 - Math.cos(radians)); // Adjust Y so cards fan upwards from a base

    // The transform style for the card when it's in its final fanned position
    const fannedTransformStyle = `
        translateX(${x}px)
        translateY(${y}px)
        rotate(${
          finalAngle + 90
        }deg) /* Rotate to follow the arc (add 90 to stand upright) */
        translateZ(0) /* Ensure 3D transform context */
    `;

    // The transform style for the card when the shuffle animation is active (start point)
    const shuffleTransformStyle = `
        translateX(${shuffleStartTransform.x}px)
        translateY(${shuffleStartTransform.y}px)
        rotate(${shuffleStartTransform.rotate}deg)
        translateZ(${shuffleStartTransform.z}px) /* Use random Z during shuffle */
    `;

    // Determine the current transform style based on shuffle state
    const currentTransformStyle = isShuffling
      ? shuffleTransformStyle
      : fannedTransformStyle;

    // Determine the current opacity based on shuffle, hidden, and chosen state
    // Keep cards visible during shuffle
    const currentOpacity = isHiddenDuringAnimation
      ? 0
      : isChosen
      ? 0.5
      : 1; // Hide if animating, dim if chosen, full opacity otherwise

     // Determine the current zIndex based on shuffle state
    const currentZIndex = isShuffling ? shuffleStartTransform.zIndex : index;


    return (
      <div
        // Attach the ref to the main card div (allows parent to get DOM element)
        ref={cardRef}
        // Apply styling for absolute positioning, size, and appearance
        // Position it from the center of the container (-translate-x-1/2 -translate-y-1/2)
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        rounded-lg shadow-lg transform-gpu backface-hidden
                        ${
                          isSelectable
                            ? "cursor-pointer hover:shadow-xl transition-transform duration-200"
                            : ""
                        } /* Interactive styles */
                        ${
                          isChosen ? "pointer-events-none" : ""
                        } /* Disable clicks if already chosen */
                        ${
                          isHiddenDuringAnimation ? "pointer-events-none" : ""
                        } /* Disable clicks if animating separately */
                       `}
        style={{
          width: cardWidth,
          height: cardHeight,
          // Apply transitions for smooth animation between states
          // Transition transform and opacity, and z-index
          transition: `transform ${
            isShuffling ? shuffleDuration : 300
          }ms ease-out, opacity ${
            isShuffling ? shuffleDuration : 300 // Use shuffle duration for fade as well
          }ms ease-out, z-index ${isShuffling ? shuffleDuration : 0}ms step-end`, // Transition z-index
          // Apply the calculated transform (either shuffle start or fanned end)
          transform: currentTransformStyle,
          // Set opacity based on animation/state
          opacity: currentOpacity,
          // Set z-index for layering
          zIndex: currentZIndex,
          // Ensure pointer events are off if not selectable via prop (redundant with class, but belt & suspenders)
          pointerEvents: isSelectable ? "auto" : "none",
        }}
        onClick={(e) => {
          // Call the onClick handler passed from the parent, provide the DOM element
          // The parent will check isSelectable again, but checking here too is fine.
          if (isSelectable) {
            onClick(e); // Pass the event object
          }
        }}
      >
        {/* Card Back - visible by default in the fan */}
        {/* We add a transform to rotate the card to show the back face */}
        <div
          className="absolute inset-0 bg-cover bg-center rounded-lg backface-hidden"
          style={{
            backgroundImage: `url(${cardData.backImage})`,
            // Rotate the back face 180 degrees around the Y-axis to correctly show the back
            // When the card div itself is rotated (e.g., by 180deg around Y for reversed), this compensates.
            transform: `rotateY(${isReversed ? 180 : 0}deg)`, // Apply rotation if reversed
            transition: "transform 600ms ease-in-out", // Smooth flip animation
            backfaceVisibility: "hidden", // Hide the front face when rotated away
          }}
        />
        {/* Card Front - also included, will be on the opposite side */}
         <div
          className="absolute inset-0 bg-cover bg-center rounded-lg backface-hidden"
          style={{
            backgroundImage: `url(${cardData.frontImage})`,
             // Rotate the front face to be on the opposite side of the back
            transform: `rotateY(${isReversed ? 0 : 180}deg)`, // Apply rotation if reversed
            transition: "transform 600ms ease-in-out", // Smooth flip animation
            backfaceVisibility: "hidden", // Hide the front face when rotated away
          }}
        />
      </div>
    );
  }
);

export default TarotCard;