'use client'
import React, { useState } from 'react';
import { Rating, RatingProps } from '@mui/material';
import { Theme } from '@mui/material/styles';
import styled from '@emotion/styled';

interface StarRatingProps {
  totalStars?: number;
  rating: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
}

const StyledRating = styled(Rating)({
  '& .MuiRating-iconFilled': {
    color: '#FBBF24',
  },
  '& .MuiRating-iconHover': {
    color: '#F59E0B',
  },
});

const StarRating: React.FC<StarRatingProps> = ({ 
  totalStars = 5, 
  rating, 
  onRatingChange, 
  readOnly = false 
}) => {
  const handleRatingChange = (event: React.SyntheticEvent, newValue: number | null) => {
    if (newValue !== null && !readOnly) {
      // Ensure the minimum rating is 1
      const validRating = Math.max(1, newValue);
      onRatingChange?.(validRating);
    }
  };

  return (
    <div className="flex items-center">
      <StyledRating
        name="star-rating"
        value={rating}
        precision={1}
        max={totalStars}
        onChange={handleRatingChange}
        readOnly={readOnly}
      />
      {!readOnly && (
        <span className="ml-2 text-gray-300">
          {rating.toFixed(0)}
        </span>
      )}
    </div>
  );
};

export default StarRating;