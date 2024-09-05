import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import Coach from '@/models/Coach';
import School from '@/models/School';
import Sport from '@/models/Sport';

export async function GET(req: Request) {
  try {
    await connect();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    console.log('Query:', query);
    const coaches = await Coach.find({
      $or: [
        { coachFirstName: { $regex: query, $options: 'i' } },
        { coachLastName: { $regex: query, $options: 'i' } },
      ],
    })
      .skip(offset)
      .limit(limit)
      .select('coachId coachFirstName coachLastName schoolId sportId')
      .lean();
    console.log('Coaches found:', coaches.length);

    // Fetch school and sport names separately
    const schoolIds = Array.from(
      new Set(coaches.map((coach) => coach.schoolId))
    );
    const sportIds = Array.from(new Set(coaches.map((coach) => coach.sportId)));

    const [schools, sports] = await Promise.all([
      School.find({ schoolId: { $in: schoolIds } })
        .select('schoolId name')
        .lean(),
      Sport.find({ sportId: { $in: sportIds } })
        .select('sportId name')
        .lean(),
    ]);

    const schoolMap = new Map(
      schools.map((school) => [school.schoolId, school.name])
    );
    const sportMap = new Map(
      sports.map((sport) => [sport.sportId, sport.name])
    );

    const coachesWithNames = coaches.map((coach) => ({
      ...coach,
      schoolName: schoolMap.get(coach.schoolId) || 'Unknown',
      sportName: sportMap.get(coach.sportId) || 'Unknown',
    }));

    const total = await Coach.countDocuments({
      $or: [
        { coachFirstName: { $regex: query, $options: 'i' } },
        { coachLastName: { $regex: query, $options: 'i' } },
      ],
    });

    return NextResponse.json({ coachesWithNames, total });
  } catch (error) {
    console.error('Error searching coaches:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
