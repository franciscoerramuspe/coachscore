'use client';

import { useEffect, useState, useCallback } from 'react';
import StarRating from '@/components/StarRating/page';
import { useAuth } from '@clerk/nextjs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircledIcon } from '@radix-ui/react-icons';
import { Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Review {
  reviewId: string;
  rating: number;
  comment: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  userVote?: 'like' | 'dislike' | null;
}

interface Coach {
  coachId: string;
  coachFirstName: string;
  coachLastName: string;
  schoolId: string;
  schoolName: string;
  sportId: string;
  sportName: string;
  ratings: Review[];
}

interface UserVotes {
  [reviewId: string]: 'like' | 'dislike' | null;
}

export default function CoachPage({ params }: { params: { coachId: string } }) {
  const [coach, setCoach] = useState<Coach | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(1);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const { userId } = useAuth();
  const [showAlert, setShowAlert] = useState(false);
  const [userVotes, setUserVotes] = useState<UserVotes>({});

  const fetchCoachDetails = useCallback(async () => {
    try {
      let url = `/api/coaches/${params.coachId}`;
      if (userId) {
        url += `?userId=${userId}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Fetch school and sport names
      const [schoolResponse, sportResponse] = await Promise.all([
        fetch(`/api/schools/${data.schoolId}`),
        fetch(`/api/sports/${data.sportId}`),
      ]);

      if (!schoolResponse.ok || !sportResponse.ok) {
        throw new Error('Failed to fetch school or sport details');
      }

      const [schoolData, sportData] = await Promise.all([
        schoolResponse.json(),
        sportResponse.json(),
      ]);

      // Combine all data
      const coachData: Coach = {
        ...data,
        schoolName: schoolData.name,
        sportName: sportData.name,
        ratings: data.ratings
          .map((review: Review) => ({
            ...review,
          }))
          .sort(
            (a: Review, b: Review) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ),
      };
      setCoach(coachData);

      // Update userVotes
      const votes: UserVotes = {};
      coachData.ratings.forEach((review) => {
        if (review.userVote) {
          votes[review.reviewId] = review.userVote;
        }
      });
      setUserVotes(votes);
    } catch (err) {
      console.error('Error fetching coach details:', err);
      setError('An error occurred while fetching coach details');
    } finally {
      setIsLoading(false);
    }
  }, [params.coachId, userId]);

  useEffect(() => {
    fetchCoachDetails();
  }, [fetchCoachDetails]);

  const MAX_COMMENT_LENGTH = 1200;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!userId) {
      setSubmitError('You have to be logged in to submit a review');
      return;
    }
    if (rating < 1) {
      setSubmitError('Please provide a rating of at least 1 star');
      return;
    }
    if (!comment.trim()) {
      setSubmitError('Please provide a comment for your review');
      return;
    }
    if (comment.length > MAX_COMMENT_LENGTH) {
      setSubmitError(
        `Your review is too long. Please limit it to ${MAX_COMMENT_LENGTH} characters.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if the user has already reviewed this coach
      const checkResponse = await fetch(
        `/api/reviews?coachId=${params.coachId}&userId=${userId}`
      );
      const checkData = await checkResponse.json();

      if (checkData.hasReviewed) {
        setSubmitError('You have already submitted a review for this coach');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coachId: params.coachId,
          rating,
          comment,
          reviewerId: userId,
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error submitting review');
        } else {
          const errorText = await response.text();
          throw new Error(
            `Server error: ${response.status} ${response.statusText}. ${errorText}`
          );
        }
      }

      setRating(1);
      setComment('');
      setShowAlert(true);
      await fetchCoachDetails();
    } catch (err) {
      console.error('Error submitting review:', err);
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'An error occurred while submitting the review'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  const handleVote = async (reviewId: string, action: 'like' | 'dislike') => {
    try {
      if (!userId) {
        setSubmitError('You need to be logged in to vote.');
        return;
      }

      const response = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update vote');
      }

      const data = await response.json();

      // Update the local state
      setCoach((prevCoach) => {
        if (!prevCoach) return null;
        return {
          ...prevCoach,
          ratings: prevCoach.ratings.map((review) =>
            review.reviewId === reviewId
              ? { ...review, likes: data.likes, dislikes: data.dislikes }
              : review
          ),
        };
      });

      // Update user votes
      setUserVotes((prevVotes) => {
        const currentVote = prevVotes[reviewId];
        if (currentVote === action) {
          // If clicking the same button, remove the vote
          const { [reviewId]: _, ...rest } = prevVotes;
          return rest;
        } else {
          // Otherwise, set or change the vote
          return { ...prevVotes, [reviewId]: action };
        }
      });
    } catch (error) {
      console.error('Error updating vote:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to update vote');
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen bg-indigo-950">
        <Loader2 className="h-12 w-12 animate-spin text-yellow-400" />
      </div>
    );
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!coach) return <div className="text-center text-white">Coach not found</div>;

  const averageRating =
    coach.ratings.length > 0
      ? coach.ratings.reduce((sum, review) => sum + review.rating, 0) /
        coach.ratings.length
      : 0;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 bg-indigo-950 !important">
    <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">
      {`${coach.coachFirstName} ${coach.coachLastName}`}
    </h1>
    <div className="bg-indigo-900 bg-opacity-50 rounded-lg p-6 shadow-lg mb-8">
      <p className="text-white mb-2">
        <span className="font-bold">School:</span> {coach.schoolName}
      </p>
      <p className="text-white mb-4">
        <span className="font-bold">Sport:</span> {coach.sportName}
      </p>
      <div className="flex items-center justify-between bg-indigo-800 bg-opacity-50 rounded-lg p-4">
        <span className="text-lg font-semibold text-yellow-400">Average Rating:</span>
        <div className="flex items-center">
          <StarRating rating={averageRating} readOnly={true} />
          <span className="text-white ml-2 text-lg font-bold">
            {averageRating.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
      {coach.ratings.length === 0 ? (
        <p className="text-gray-300">No reviews yet.</p>
      ) : (
        <div
          className={`space-y-4 ${
            coach.ratings.length > 5
              ? 'max-h-[600px] overflow-y-auto pr-4 scrollbar-thin'
              : ''
          }`}
        >
          {coach.ratings.map((review) => (
            <div
              key={review.reviewId}
              className="bg-indigo-800 bg-opacity-50 p-4 rounded-lg shadow"
            >
              <div className="flex items-center mb-2">
                <StarRating rating={review.rating} readOnly={true} />
                <span className="text-white ml-2">({review.rating})</span>
              </div>
              <p className="text-white">{review.comment}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-gray-400 text-sm">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVote(review.reviewId, 'like')}
                    className={`${
                      userVotes[review.reviewId] === 'like'
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : 'text-emerald-400 hover:text-emerald-500 hover:bg-emerald-100'
                    } border-emerald-400`}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    <span>{review.likes}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVote(review.reviewId, 'dislike')}
                    className={`${
                      userVotes[review.reviewId] === 'dislike'
                        ? 'bg-rose-500 text-white hover:bg-rose-600'
                        : 'text-rose-400 hover:text-rose-500 hover:bg-rose-100'
                    } border-rose-400`}
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    <span>{review.dislikes}</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-indigo-900 bg-opacity-50 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-yellow-400">Add a Review</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="rating" className="block text-yellow-400 mb-2 font-semibold">Rating</label>
            <StarRating 
              rating={rating} 
              onRatingChange={setRating} 
            />
          </div>
          <div>
            <label htmlFor="comment" className="block text-yellow-400 mb-2 font-semibold">Comment</label>
            <div>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 bg-indigo-800 text-white border border-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                rows={4}
                maxLength={MAX_COMMENT_LENGTH}
              ></textarea>
              <p className="text-sm text-gray-400 mt-1">
                {comment.length}/{MAX_COMMENT_LENGTH} characters
              </p>
            </div>
          </div>
          {submitError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{submitError}</span>
            </div>
          )}
          <button
            type="submit"
            className="bg-yellow-400 hover:bg-yellow-500 text-indigo-900 font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </button>
        </form>
      </div>
      {showAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-indigo-900 rounded-lg p-6 max-w-sm mx-auto">
            <Alert>
              <CheckCircledIcon className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Your review has been submitted successfully.</AlertDescription>
            </Alert>
            <button
              onClick={() => setShowAlert(false)}
              className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-indigo-900 font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}