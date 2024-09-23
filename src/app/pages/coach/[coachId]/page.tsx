'use client'

import { useEffect, useState, useCallback } from 'react'
import StarRating from '@/components/StarRating/page'
import { useAuth } from '@clerk/nextjs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircledIcon } from '@radix-ui/react-icons'
import { Loader2, ThumbsUp, ThumbsDown, Trophy, Book, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

interface Review {
  reviewId: string;
  sportKnowledgeRating: number;
  managementSkillsRating: number;
  likabilityRating: number;
  overallRating: number;
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
  const [sportKnowledgeRating, setSportKnowledgeRating] = useState(1);
  const [managementSkillsRating, setManagementSkillsRating] = useState(1);
  const [likabilityRating, setLikabilityRating] = useState(1);
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
    if (
      sportKnowledgeRating < 1 ||
      managementSkillsRating < 1 ||
      likabilityRating < 1
    ) {
      setSubmitError('Please provide a rating of at least 1 star for all categories');
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
          sportKnowledgeRating,
          managementSkillsRating,
          likabilityRating,
          comment,
          reviewerId: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error submitting review');
      }

      // Reset form fields
      setSportKnowledgeRating(1);
      setManagementSkillsRating(1);
      setLikabilityRating(1);
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
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-900 to-indigo-950">
        <Loader2 className="h-16 w-16 animate-spin text-yellow-400" />
      </div>
    )
  if (error) return <div className="text-center text-red-500 text-xl">{error}</div>
  if (!coach) return <div className="text-center text-white text-xl">Coach not found</div>

  const averageRating =
    coach.ratings.length > 0
      ? coach.ratings.reduce((sum, review) => sum + review.overallRating, 0) /
        coach.ratings.length
      : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-indigo-950 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-5xl font-extrabold text-center mb-8 text-yellow-400 tracking-tight">
          {`${coach.coachFirstName} ${coach.coachLastName}`}
        </h1>
        <div className="bg-indigo-800 bg-opacity-50 rounded-xl p-8 shadow-2xl mb-12 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-white text-lg mb-2">
                <span className="font-semibold text-yellow-400">School:</span> {coach.schoolName}
              </p>
              <p className="text-white text-lg mb-4">
                <span className="font-semibold text-yellow-400">Sport:</span> {coach.sportName}
              </p>
            </div>
            <div className="flex items-center justify-center md:justify-end">
              <div className="bg-indigo-700 bg-opacity-50 rounded-lg p-4 text-center">
                <span className="text-xl font-semibold text-yellow-400 block mb-2">Average Rating</span>
                <div className="flex items-center justify-center">
                  <StarRating rating={averageRating} readOnly={true} />
                  <span className="text-white ml-2 text-2xl font-bold">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-6 text-yellow-400">Reviews</h2>
        {coach.ratings.length === 0 ? (
          <p className="text-gray-300 text-center text-lg">No reviews yet.</p>
        ) : (
          <div className="space-y-6 mb-12">
            <AnimatePresence>
              {coach.ratings.map((review, index) => (
                <motion.div
                  key={review.reviewId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-indigo-800 bg-opacity-50 p-6 rounded-xl shadow-lg"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center">
                      <Trophy className="text-yellow-400 w-6 h-6 mr-2" />
                      <div>
                        <p className="text-white font-semibold">Sport Knowledge</p>
                        <StarRating rating={review.sportKnowledgeRating} readOnly={true} />
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Book className="text-yellow-400 w-6 h-6 mr-2" />
                      <div>
                        <p className="text-white font-semibold">Management Skills</p>
                        <StarRating rating={review.managementSkillsRating} readOnly={true} />
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Users className="text-yellow-400 w-6 h-6 mr-2" />
                      <div>
                        <p className="text-white font-semibold">Likability</p>
                        <StarRating rating={review.likabilityRating} readOnly={true} />
                      </div>
                    </div>
                  </div>
                  <p className="text-white mb-4">{review.comment}</p>
                  <div className="flex items-center justify-between">
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
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-indigo-800 bg-opacity-50 rounded-xl p-8 shadow-2xl mb-8"
        >
          <h2 className="text-3xl font-bold mb-6 text-yellow-400">Add a Review</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-yellow-400 mb-2 font-semibold">Sport Knowledge</label>
                <StarRating
                  rating={sportKnowledgeRating}
                  onRatingChange={setSportKnowledgeRating}
                />
              </div>
              <div>
                <label className="block text-yellow-400 mb-2 font-semibold">Management Skills</label>
                <StarRating
                  rating={managementSkillsRating}
                  onRatingChange={setManagementSkillsRating}
                />
              </div>
              <div>
                <label className="block text-yellow-400 mb-2 font-semibold">Likability/Personality</label>
                <StarRating
                  rating={likabilityRating}
                  onRatingChange={setLikabilityRating}
                />
              </div>
            </div>
            <div>
              <label htmlFor="comment" className="block text-yellow-400 mb-2 font-semibold">Comment</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 bg-indigo-700 bg-opacity-50 text-white border border-indigo-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-200"
                rows={4}
                maxLength={MAX_COMMENT_LENGTH}
              ></textarea>
              <p className="text-sm text-gray-400 mt-1">
                {comment.length}/{MAX_COMMENT_LENGTH} characters
              </p>
            </div>
            {submitError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{submitError}</span>
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-indigo-900 font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="inline-block mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </form>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-indigo-900 rounded-xl p-8 max-w-sm mx-auto">
              <Alert>
                <CheckCircledIcon className="h-6 w-6 text-green-400" />
                <AlertTitle className="text-lg font-semibold mb-2">Success</AlertTitle>
                <AlertDescription className="text-gray-300">
                  Your review has been submitted successfully.
                </AlertDescription>
              </Alert>
              <Button
                onClick={() => setShowAlert(false)}
                className="mt-6 w-full bg-yellow-400 hover:bg-yellow-500 text-indigo-900 font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
              >
                Close
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}