import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import Coach from '@/models/Coach';
import Review from '@/models/Review';
import Vote from '@/models/Vote';

export async function GET(
  req: Request,
  { params }: { params: { coachId: string } }
) {
  try {
    await connect();
    const { coachId } = params;

    // Get userId from query parameter
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    const coach = await Coach.findOne({ coachId }).lean();

    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    const reviews = await Review.find({ coachId }).lean();

    let userVotes: { [reviewId: string]: 'like' | 'dislike' } = {};
    if (userId) {
      const votes = await Vote.find({
        userId,
        reviewId: { $in: reviews.map((r) => r.reviewId) },
      }).lean();
      userVotes = votes.reduce((acc, vote) => {
        acc[vote.reviewId] = vote.vote;
        return acc;
      }, {} as { [reviewId: string]: 'like' | 'dislike' });
    }

    const coachWithReviews = {
      ...coach,
      ratings: reviews.map((review) => ({
        reviewId: review.reviewId,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        likes: review.likes || 0,
        dislikes: review.dislikes || 0,
        userVote: userVotes[review.reviewId] || null,
      })),
    };

    return NextResponse.json(coachWithReviews);
  } catch (error) {
    console.error('Error fetching coach details:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}