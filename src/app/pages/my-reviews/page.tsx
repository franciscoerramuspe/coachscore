'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import StarRating from '@/components/StarRating/page'
import { Loader2, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from "../../../components/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"

interface Review {
  reviewId: string
  coachId: string
  coachName: string
  rating: number
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
  const [editedRating, setEditedRating] = useState(0)

  useEffect(() => {
    const fetchReviews = async () => {
      if (!userId) return
      try {
        const response = await fetch(`/api/reviews/user/${userId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch reviews')
        }
        const data = await response.json()
        console.log(data)
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
        body: JSON.stringify({ comment: editedComment, rating: editedRating })
      })
      if (!response.ok) throw new Error('Failed to update review')
      const updatedReview = { ...selectedReview, comment: editedComment, rating: editedRating }
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

  if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>
  if (error) return <div className="text-red-500 text-center">{error}</div>

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-yellow-400">My Reviews</h1>
      {reviews.length === 0 ? (
        <p className="text-white">You haven&apos;t submitted any reviews yet.</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.reviewId} className="bg-indigo-900 bg-opacity-50 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-white mb-2">{review.coachName}</h2>
              <div className="flex items-center mb-2">
                <StarRating rating={review.rating} readOnly={true} />
                <span className="text-white ml-2">({review.rating})</span>
              </div>
              <p className="text-white mb-2">{review.comment}</p>
              <p className="text-gray-400 text-sm">{new Date(review.createdAt).toLocaleDateString()}</p>
              <div className="flex justify-end mt-4 space-x-2">
                <Button variant="ghost" size="icon" onClick={() => {
                  setSelectedReview(review)
                  setEditedComment(review.comment)
                  setEditedRating(review.rating)
                  setIsEditModalOpen(true)
                }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => {
                  setSelectedReview(review)
                  setIsDeleteModalOpen(true)
                }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
          </DialogHeader>
          <StarRating rating={editedRating} onRatingChange={setEditedRating} />
          <Textarea
            value={editedComment}
            onChange={(e) => setEditedComment(e.target.value)}
            placeholder="Your review..."
            className="min-h-[150px]"
            rows={10}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}