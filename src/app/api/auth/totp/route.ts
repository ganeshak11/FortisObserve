import { NextResponse } from "next/server";
import { verifySync } from 'otplib';
import { signToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const { token } = await req.json();
        const secret = process.env.ADMIN_TOTP_SECRET;

        if (!secret) return NextResponse.json({ error: "Server misconfiguration: No TOTP secret." }, { status: 500 });

        const { valid } = verifySync({ token, secret });

        if (valid) {
            const jwt = await signToken({ authenticated_via: 'totp' });
            
            const cookieStore = await cookies();
            cookieStore.set('fortis_token', jwt, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 // 24 hours
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "ACCESS DENIED. INVALID TOKEN." }, { status: 401 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
