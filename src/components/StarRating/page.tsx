'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface StarRatingProps {
  totalStars?: number
  rating: number
  onRatingChange?: (rating: number) => void
  readOnly?: boolean
}

const Star: React.FC<{
  filled: boolean
  hovered: boolean
  onClick?: () => void
  onHover?: () => void
  readOnly: boolean
}> = ({ filled, hovered, onClick, onHover, readOnly }) => (
  <motion.svg
    className={`w-8 h-8 ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
    fill={filled || hovered ? '#FBBF24' : 'none'}
    stroke={filled || hovered ? '#FBBF24' : '#D1D5DB'}
    viewBox="0 0 24 24"
    onClick={onClick}
    onMouseEnter={onHover}
    whileHover={readOnly ? {} : { scale: 1.1 }}
    whileTap={readOnly ? {} : { scale: 0.9 }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </motion.svg>
)

export default function StarRating({
  totalStars = 5,
  rating,
  onRatingChange,
  readOnly = false,
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState(0)

  const handleRatingChange = (newRating: number) => {
    if (!readOnly) {
      // Ensure the minimum rating is 1
      const validRating = Math.max(1, newRating)
      onRatingChange?.(validRating)
    }
  }

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoveredRating(0)
    }
  }

  return (
    <div 
      className="flex items-center space-x-1" 
      onMouseLeave={handleMouseLeave}
    >
      {[...Array(totalStars)].map((_, index) => (
        <Star
          key={index}
          filled={index < rating}
          hovered={!readOnly && index < hoveredRating}
          onClick={() => handleRatingChange(index + 1)}
          onHover={() => !readOnly && setHoveredRating(index + 1)}
          readOnly={readOnly}
        />
      ))}
      {!readOnly && (
        <span className="ml-2 text-gray-300 text-lg">
          {hoveredRating > 0 ? hoveredRating.toFixed(1) : rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}