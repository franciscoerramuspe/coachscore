import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import Review from '@/models/Review';

export async function DELETE(
  req: Request,
  { params }: { params: { reviewId: string } }
) {
  try {
    await connect();
    const { reviewId } = params;

    const deletedReview = await Review.findOneAndDelete({ reviewId });

    if (!deletedReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { reviewId: string } }
) {
  try {
    await connect();
    const { reviewId } = params;
    const { comment, rating } = await req.json();

    const updatedReview = await Review.findOneAndUpdate(
      { reviewId },
      { comment, rating, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
