import {NextResponse} from 'next/server';import {alertsFor} from '@/lib/operations';export const dynamic='force-dynamic';export async function GET(){return NextResponse.json(alertsFor())}
