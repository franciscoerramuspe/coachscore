import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import Coach from '@/models/Coach';
import Review from '@/models/Review';

export async function GET(
  req: Request,
  { params }: { params: { coachId: string } }
) {
  try {
    await connect();
    const { coachId } = params;

    const coach = await Coach.findOne({ coachId }).lean();

    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    const reviews = await Review.find({ coachId }).lean();

    const coachWithReviews = {
      ...coach,
      ratings: reviews.map((review) => ({
        reviewId: review.reviewId,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
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
