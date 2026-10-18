import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, createUser, getUserById } from '@/lib/db/repository';
import { INITIAL_USERS } from '@/lib/db/seed';

export async function GET() {
  try {
    const users = getAllUsers();
    return NextResponse.json({ success: true, data: users });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, name, role, roleTitle, department, password, email } = body;

    if (!username || !name || !role) {
      return NextResponse.json(
        { success: false, error: 'Username, Name, and Role are required.' },
        { status: 400 }
      );
    }

    const actorId = req.headers.get('x-user-id') || 'usr-maruf';
    const actor = getUserById(actorId) || INITIAL_USERS[0];

    const newUser = createUser(
      {
        username,
        name,
        role,
        roleTitle,
        department,
        password,
        email,
      },
      actor
    );

    return NextResponse.json({ success: true, data: newUser });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create user' },
      { status: 400 }
    );
  }
}
