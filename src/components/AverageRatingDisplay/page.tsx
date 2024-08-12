import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

interface AverageRatingDisplayProps {
  rating: number;
}

const AverageRatingDisplay: React.FC<AverageRatingDisplayProps> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex flex-col items-end">
      <span className="text-sm text-gray-400 mb-1">Average Rating</span>
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => {
          if (index < fullStars) {
            return <FaStar key={index} className="text-yellow-400" />;
          } else if (index === fullStars && hasHalfStar) {
            return <FaStarHalfAlt key={index} className="text-yellow-400" />;
          } else {
            return <FaRegStar key={index} className="text-yellow-400" />;
          }
        })}
        <span className="ml-2 text-yellow-400 font-bold">{rating.toFixed(1)}</span>
      </div>
    </div>
  );
};

export default AverageRatingDisplay;