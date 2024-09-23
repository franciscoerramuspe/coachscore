import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import Coach from '@/models/Coach';
import School from '@/models/School';
import Sport from '@/models/Sport';
import Review from '@/models/Review';

export async function GET(req: Request) {
  try {
    await connect();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const coaches = await Coach.find()
      .limit(limit)
      .select('coachId coachFirstName coachLastName schoolId sportId')
      .lean();

    // Fetch school and sport names
    const schoolIds = Array.from(new Set(coaches.map((coach) => coach.schoolId)));
    const sportIds = Array.from(new Set(coaches.map((coach) => coach.sportId)));

    const [schools, sports, reviews] = await Promise.all([
      School.find({ schoolId: { $in: schoolIds } }).select('schoolId name').lean(),
      Sport.find({ sportId: { $in: sportIds } }).select('sportId name').lean(),
      Review.aggregate([
        { $match: { coachId: { $in: coaches.map(coach => coach.coachId) } } },
        { $group: {
          _id: '$coachId',
          averageRating: { $avg: '$overallRating' }
        }}
      ])
    ]);

    const schoolMap = new Map(schools.map(school => [school.schoolId, school.name]));
    const sportMap = new Map(sports.map(sport => [sport.sportId, sport.name]));
    const ratingMap = new Map(reviews.map(review => [review._id, review.averageRating]));

    const coachesWithNames = coaches.map(coach => ({
      ...coach,
      schoolName: schoolMap.get(coach.schoolId) || 'Unknown School',
      sportName: sportMap.get(coach.sportId) || 'Unknown Sport',
      averageRating: ratingMap.get(coach.coachId) || 0
    }));

    return NextResponse.json({ coaches: coachesWithNames });
  } catch (error) {
    console.error('Error fetching all coaches:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
