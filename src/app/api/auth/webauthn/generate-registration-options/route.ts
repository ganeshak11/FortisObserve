import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const rpID = url.hostname;
        
        // We fetch existing devices so the browser knows not to register an already registered device
        const { data: devices } = await supabaseAdmin.from("admin_devices").select("credential_id");
        
        const excludeCredentials = (devices || []).map(dev => ({
            id: dev.credential_id,
            type: 'public-key' as const,
            transports: ['internal', 'usb', 'ble', 'nfc'] as any,
        }));

        const options = await generateRegistrationOptions({
            rpName: "FortisObserve",
            rpID,
            userID: new Uint8Array(Buffer.from("admin-user-id")),
            userName: "admin",
            attestationType: "none",
            excludeCredentials,
            authenticatorSelection: {
                residentKey: "preferred",
                userVerification: "preferred",
            },
        });

        // Store the challenge in an HTTP-only cookie for verification later
        const cookieStore = await cookies();
        cookieStore.set('webauthn_challenge', options.challenge, {
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
