import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import Review from '@/models/Review';
import Coach from '@/models/Coach';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const coachId = searchParams.get('coachId');
  const userId = searchParams.get('userId');

  if (!coachId || !userId) {
    return NextResponse.json(
      { error: 'Missing coachId or userId' },
      { status: 400 }
    );
  }

  try {
    await connect();

    const existingReview = await Review.findOne({
      coachId,
      reviewerId: userId,
    });

    return NextResponse.json({ hasReviewed: !!existingReview });
  } catch (error) {
    console.error('Error checking review:', error);
    return NextResponse.json(
      { error: 'Error checking review' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connect();
    const {
      coachId,
      sportKnowledgeRating,
      managementSkillsRating,
      likabilityRating,
      comment,
      reviewerId,
    } = await req.json();

    const coach = await Coach.findOne({ coachId });
    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    // Check if the user has already reviewed this coach
    const existingReview = await Review.findOne({ coachId, reviewerId });
    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this coach' },
        { status: 400 }
      );
    }

    // Calculate overall rating
    const overallRating =
      (sportKnowledgeRating + managementSkillsRating + likabilityRating) / 3;

    const newReview = new Review({
      reviewId: uuidv4(),
      schoolId: coach.schoolId,
      coachId: coach.coachId,
      sportKnowledgeRating,
      managementSkillsRating,
      likabilityRating,
      overallRating,
      comment,
      reviewerId,
    });

    await newReview.save();

    // Update the coach's ratings array
    await Coach.findOneAndUpdate(
      { coachId: coach.coachId },
      { $push: { ratings: newReview._id } }
    );

    return NextResponse.json({ reviewId: newReview.reviewId }, { status: 201 });
  } catch (error) {
    console.error('Error adding review:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
