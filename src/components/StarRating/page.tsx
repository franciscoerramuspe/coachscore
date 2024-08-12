'use client'
import React, { useState } from 'react';
import { Rating, RatingProps } from '@mui/material';
import { Theme } from '@mui/material/styles';
import styled from '@emotion/styled';

interface StarRatingProps {
  totalStars?: number;
  initialRating?: number;
  onRatingChange: (rating: number) => void;
}

const StyledRating = styled(Rating)`
  & .MuiRating-icon {
    color: white;
  }
  & .MuiRating-iconFilled {
    color: #facc15;
  }
  & .MuiRating-iconHover {
    color: #facc15;
  }
` as typeof Rating;

const StarRating: React.FC<StarRatingProps> = ({ totalStars = 5, initialRating = 0, onRatingChange }) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(-1);

  const handleRatingChange = (event: React.SyntheticEvent, newValue: number | null) => {
    if (newValue !== null) {
      setRating(newValue);
      onRatingChange(newValue);
    }
  };

  return (
    <div className="flex items-center">
      <StyledRating
        name="star-rating"
        value={rating}
        precision={0.5}
        max={totalStars}
        onChange={handleRatingChange}
        onChangeActive={(event, newHover) => {
          setHover(newHover);
        }}
      />
      <span className="ml-2 text-gray-300">
        {(hover !== -1 ? hover : rating).toFixed(1)}
      </span>
    </div>
  );
};

export default StarRating;