"use client";

import { useState } from "react";
import { startRegistration } from '@simplewebauthn/browser';
import { Fingerprint, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");

    const registerDevice = async () => {
        try {
            setStatus("Requesting challenge...");
            setError("");
            
            // 1. Get registration options from server
            const resp = await fetch('/api/auth/webauthn/generate-registration-options');
            if (!resp.ok) throw new Error("Failed to get registration options");
            const options = await resp.json();

            setStatus("Waiting for hardware key interaction...");

            // 2. Pass options to browser to trigger TouchID / YubiKey prompt
            const attResp = await startRegistration({ optionsJSON: options });

            setStatus("Verifying hardware signature...");

            // 3. Send signature back to server for verification
            const verificationResp = await fetch('/api/auth/webauthn/verify-registration', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(attResp),
            });

            const verificationJSON = await verificationResp.json();

            if (verificationJSON && verificationJSON.verified) {
                setStatus("Device registered successfully!");
            } else {
                throw new Error("Hardware verification failed on server");
            }

        } catch (err: any) {
            console.error(err);
            setStatus("");
            setError(err.message || "Failed to register device.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-mono p-8">
            <h1 className="text-3xl font-bold text-cyan-400 mb-8 border-b border-slate-800 pb-4">System Settings</h1>
            
            <div className="max-w-xl glass-panel p-6 bg-slate-900/50 border border-slate-800 rounded-lg space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <Fingerprint className="w-5 h-5 text-cyan-500" />
                        Hardware Enclaves
                    </h2>
                    <p className="text-sm text-slate-400 mt-2">
                        Bind a physical security key (YubiKey, TouchID, Windows Hello) to this dashboard. 
                        Once registered, you can bypass the TOTP prompt using your hardware enclave.
                    </p>
                </div>

                {error && <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded">{error}</div>}
                {status && <div className="text-cyan-400 text-sm bg-cyan-900/20 p-3 rounded flex items-center gap-2"><ShieldCheck className="w-4 h-4" />{status}</div>}

                <button 
                    onClick={registerDevice}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    Register New Device
                </button>
            </div>
        </div>
    );
}
