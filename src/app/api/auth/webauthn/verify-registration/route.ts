import { NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        const cookieStore = await cookies();
        const expectedChallenge = cookieStore.get('webauthn_challenge')?.value;

        if (!expectedChallenge) {
            return NextResponse.json({ error: "Challenge expired" }, { status: 400 });
        }

        const url = new URL(req.url);
        const rpID = url.hostname;
        const expectedOrigin = url.origin;

        const verification = await verifyRegistrationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin,
            expectedRPID: rpID,
        });

        if (verification.verified && verification.registrationInfo) {
            const { credentialID, credentialPublicKey, counter } = verification.registrationInfo;

            // Convert to base64url for easy database storage
            const credentialIDBase64 = Buffer.from(credentialID).toString('base64url');
            const publicKeyBase64 = Buffer.from(credentialPublicKey).toString('base64url');

            const { error } = await supabaseAdmin.from('admin_devices').insert({
                credential_id: credentialIDBase64,
                public_key: publicKeyBase64,
                counter: counter,
                transports: body.response.transports || []
            });

            if (error) throw error;

            cookieStore.delete('webauthn_challenge');

            return NextResponse.json({ verified: true });
        }

        return NextResponse.json({ verified: false }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
