import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const rpID = url.hostname;

        const options = await generateAuthenticationOptions({
            rpID,
            userVerification: "preferred",
        });

        const cookieStore = await cookies();
        cookieStore.set('webauthn_auth_challenge', options.challenge, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 5 // 5 minutes
        });

        return NextResponse.json(options);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
