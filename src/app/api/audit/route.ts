import { NextResponse } from 'next/server';
import { getAuditLogs } from '@/lib/db/repository';

export async function GET() {
  try {
    const logs = getAuditLogs();
    return NextResponse.json({ success: true, data: logs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
