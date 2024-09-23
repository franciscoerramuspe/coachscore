'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import StarRating from '@/components/StarRating/page'
import { Loader2, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from "@/components/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { motion, AnimatePresence } from 'framer-motion'

interface Review {
  reviewId: string
  coachId: string
  coachName: string
  sportKnowledgeRating: number
  managementSkillsRating: number
  likabilityRating: number
  overallRating: number
  comment: string
  createdAt: string
}

export default function MyReviewsPage() {
  const { toast } = useToast()
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const { userId } = useAuth()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [editedComment, setEditedComment] = useState('')
  const [editedSportKnowledgeRating, setEditedSportKnowledgeRating] = useState(1)
  const [editedManagementSkillsRating, setEditedManagementSkillsRating] = useState(1)
  const [editedLikabilityRating, setEditedLikabilityRating] = useState(1)

  useEffect(() => {
    const fetchReviews = async () => {
      if (!userId) return
      try {
        const response = await fetch(`/api/reviews/user/${userId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch reviews')
        }
        const data = await response.json()
        setReviews(data)
      } catch (err) {
        setError('Failed to load reviews')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [userId])

  const handleDelete = async () => {
    if (!selectedReview) return
    try {
      const response = await fetch(`/api/reviews/${selectedReview.reviewId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete review')
      setReviews(reviews.filter(r => r.reviewId !== selectedReview.reviewId))
      toast({
        title: "Review deleted",
        description: "Your review has been successfully deleted.",
        variant: "default",
        action: (
          <ToastAction altText="Undo" onClick={() => handleUndoDelete(selectedReview)}>
            Undo
          </ToastAction>
        ),
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleteModalOpen(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedReview) return
    try {
      const response = await fetch(`/api/reviews/${selectedReview.reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: editedComment,
          sportKnowledgeRating: editedSportKnowledgeRating,
          managementSkillsRating: editedManagementSkillsRating,
          likabilityRating: editedLikabilityRating,
        })
      })
      if (!response.ok) throw new Error('Failed to update review')
      const updatedReview = {
        ...selectedReview,
        comment: editedComment,
        sportKnowledgeRating: editedSportKnowledgeRating,
        managementSkillsRating: editedManagementSkillsRating,
        likabilityRating: editedLikabilityRating,
        overallRating: (editedSportKnowledgeRating + editedManagementSkillsRating + editedLikabilityRating) / 3,
      }
      setReviews(reviews.map(r => r.reviewId === selectedReview.reviewId ? updatedReview : r))
      toast({
        title: "Review updated",
        description: "Your review has been successfully updated.",
        variant: "default",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to update review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsEditModalOpen(false)
    }
  }

  const handleUndoDelete = async (review: Review) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review)
      });
      if (!response.ok) throw new Error('Failed to restore review');
      setReviews([...reviews, review]);
      toast({
        title: "Review restored",
        description: "Your review has been successfully restored.",
        variant: "default",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to restore review. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-900 to-indigo-950">
      <Loader2 className="h-12 w-12 animate-spin text-yellow-400" />
    </div>
  )
  if (error) return <div className="text-red-500 text-center text-xl">{error}</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-indigo-950 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-extrabold text-center mb-12 text-yellow-400 tracking-tight">My Reviews</h1>
        {reviews.length === 0 ? (
          <p className="text-white text-center text-lg">You haven&apos;t submitted any reviews yet.</p>
        ) : (
          <div className="space-y-8">
            <AnimatePresence>
              {reviews.map((review, index) => (
                <motion.div
                  key={review.reviewId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-indigo-800 bg-opacity-50 rounded-xl p-6 shadow-lg backdrop-blur-sm"
                >
                  <h2 className="text-2xl font-semibold text-yellow-400 mb-4">{review.coachName}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-white font-medium mb-1">Sport Knowledge</p>
                      <StarRating rating={review.sportKnowledgeRating} readOnly={true} />
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">Management Skills</p>
                      <StarRating rating={review.managementSkillsRating} readOnly={true} />
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">Likability</p>
                      <StarRating rating={review.likabilityRating} readOnly={true} />
                    </div>
                  </div>
                  <p className="text-white mb-4">{review.comment}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-400 text-sm">{new Date(review.createdAt).toLocaleDateString()}</p>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedReview(review)
                          setEditedComment(review.comment)
                          setEditedSportKnowledgeRating(review.sportKnowledgeRating)
                          setEditedManagementSkillsRating(review.managementSkillsRating)
                          setEditedLikabilityRating(review.likabilityRating)
                          setIsEditModalOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedReview(review)
                          setIsDeleteModalOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="bg-indigo-900 text-white">
            <DialogHeader>
              <DialogTitle className="text-yellow-400">Delete Review</DialogTitle>
              <DialogDescription className="text-gray-300">
                Are you sure you want to delete your review for {selectedReview?.coachName}?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="bg-indigo-900 text-white">
            <DialogHeader>
              <DialogTitle className="text-yellow-400">Edit Review</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Sport Knowledge
                </label>
                <StarRating
                  rating={editedSportKnowledgeRating}
                  onRatingChange={setEditedSportKnowledgeRating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Management Skills
                </label>
                <StarRating
                  rating={editedManagementSkillsRating}
                  onRatingChange={setEditedManagementSkillsRating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Likability/Personality
                </label>
                <StarRating
                  rating={editedLikabilityRating}
                  onRatingChange={setEditedLikabilityRating}
                />
              </div>
              <Textarea
                value={editedComment}
                onChange={(e) => setEditedComment(e.target.value)}
                placeholder="Your review..."
                className="min-h-[150px] bg-indigo-800 text-white border-indigo-700"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button onClick={handleEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}