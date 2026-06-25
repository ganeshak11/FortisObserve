import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";
import { signToken } from "@/lib/jwt";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        const cookieStore = await cookies();
        const expectedChallenge = cookieStore.get('webauthn_auth_challenge')?.value;

        if (!expectedChallenge) {
            return NextResponse.json({ error: "Challenge expired" }, { status: 400 });
        }

        const url = new URL(req.url);
        const rpID = url.hostname;
        const expectedOrigin = url.origin;

        // Fetch the device by credential ID
        const { data: devices, error: dbError } = await supabaseAdmin
            .from('admin_devices')
            .select('*')
            .eq('credential_id', body.id)
            .limit(1);

        if (dbError || !devices || devices.length === 0) {
            return NextResponse.json({ error: "Device not registered" }, { status: 401 });
        }

        const device = devices[0];

        const verification = await verifyAuthenticationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin,
            expectedRPID: rpID,
            credential: {
                id: device.credential_id,
                publicKey: new Uint8Array(Buffer.from(device.public_key, 'base64url')),
                counter: device.counter,
                transports: device.transports as any
            }
        });

        if (verification.verified) {
            // Update counter to prevent replay attacks
            await supabaseAdmin.from('admin_devices')
                .update({ counter: verification.authenticationInfo.newCounter })
                .eq('id', device.id);

            cookieStore.delete('webauthn_auth_challenge');

            const jwt = await signToken({ authenticated_via: 'webauthn' });
            cookieStore.set('fortis_token', jwt, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24
            });

            return NextResponse.json({ verified: true });
        }

        return NextResponse.json({ verified: false }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
