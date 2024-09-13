// src/app/api/reviews/[reviewId]/vote/route.ts

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connect } from '@/lib/db';
import Review from '@/models/Review';
import Vote from '@/models/Vote';

export async function POST(
  req: Request,
  { params }: { params: { reviewId: string } }
) {
  const { reviewId } = params;
  const { action, userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  if (!['like', 'dislike'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  try {
    await connect();

    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const existingVote = await Vote.findOne({ userId, reviewId });

      if (existingVote) {
        if (existingVote.vote === action) {
          // User is toggling off their vote
          await existingVote.deleteOne();
          await Review.updateOne(
            { reviewId },
            { $inc: { [action === 'like' ? 'likes' : 'dislikes']: -1 } }
          );
        } else {
          // User is changing their vote
          await Vote.updateOne({ userId, reviewId }, { vote: action });
          await Review.updateOne(
            { reviewId },
            {
              $inc: {
                likes: action === 'like' ? 1 : -1,
                dislikes: action === 'dislike' ? 1 : -1,
              },
            }
          );
        }
      } else {
        // New vote
        await Vote.create({ userId, reviewId, vote: action });
        await Review.updateOne(
          { reviewId },
          { $inc: { [action === 'like' ? 'likes' : 'dislikes']: 1 } }
        );
      }
    });
    session.endSession();

    // Fetch updated counts
    const review = await Review.findOne({ reviewId }).lean() as { likes: number; dislikes: number } | null;
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }
    return NextResponse.json({ likes: review.likes, dislikes: review.dislikes });
  } catch (error) {
    console.error('Error updating vote:', error);
    return NextResponse.json({ error: 'Error updating vote' }, { status: 500 });
  }
}