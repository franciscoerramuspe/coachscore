import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import Review from '@/models/Review';
import Coach from '@/models/Coach';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    await connect();
    const { coachId, rating, comment, reviewerId } = await req.json();

    const coach = await Coach.findOne({ coachId });
    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    const newReview = new Review({
      reviewId: uuidv4(),
      schoolId: coach.schoolId,
      coachId: coach.coachId,
      rating,
      comment,
      reviewerId,
    });

    await newReview.save();

    // Actualizar el array de ratings del entrenador
    await Coach.findOneAndUpdate(
      { coachId: coach.coachId },
      { $push: { ratings: newReview._id } }
    );

    return NextResponse.json({ reviewId: newReview.reviewId }, { status: 201 });
  } catch (error) {
    console.error('Error adding review:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
