import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import Review from '@/models/Review';
import Coach from '@/models/Coach';

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    await connect();
    const { userId } = params;

    const reviews = await Review.find({ reviewerId: userId }).lean();

    const reviewsWithCoachNames = await Promise.all(
      reviews.map(async (review) => {
        const coach = await Coach.findOne({ coachId: review.coachId }).exec();
        return {
          ...review,
          coachName: coach
            ? `${coach.coachFirstName} ${coach.coachLastName}`
            : 'Unknown Coach',
        };
      })
    );

    return NextResponse.json(reviewsWithCoachNames);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
