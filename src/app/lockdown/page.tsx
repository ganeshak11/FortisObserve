"use client";

import { useState } from "react";
import { Shield, KeyRound, Fingerprint } from "lucide-react";
import { startAuthentication } from '@simplewebauthn/browser';

export default function LockdownPage() {
    const [token, setToken] = useState("");
    const [error, setError] = useState("");
    const [status, setStatus] = useState("AWAITING_INPUT");

    const handleVerifyTotp = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("VERIFYING");
        setError("");

        try {
            const res = await fetch("/api/auth/totp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token })
            });
            const data = await res.json();
            
            if (data.success) {
                setStatus("GRANTED");
                window.location.href = "/";
            } else {
                setStatus("AWAITING_INPUT");
                setError(data.error || "ACCESS DENIED");
            }
        } catch (err) {
            setStatus("AWAITING_INPUT");
            setError("NETWORK ERROR");
        }
    };

    const handleWebAuthnLogin = async () => {
        try {
            setStatus("VERIFYING");
            setError("");
            
            const resp = await fetch('/api/auth/webauthn/generate-authentication-options');
            if (!resp.ok) throw new Error("Failed to get challenge");
            const options = await resp.json();
            
            const authResp = await startAuthentication({ optionsJSON: options });
            
            const verificationResp = await fetch('/api/auth/webauthn/verify-authentication', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(authResp)
            });
            
            const verificationJSON = await verificationResp.json();
            if (verificationJSON && verificationJSON.verified) {
                setStatus("GRANTED");
                window.location.href = "/";
            } else {
                setStatus("AWAITING_INPUT");
                setError("Hardware verification failed.");
            }
        } catch (err: any) {
            setStatus("AWAITING_INPUT");
            setError(err.message || "Hardware authentication failed.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-mono">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center space-y-4">
                    <Shield className={`w-16 h-16 mx-auto transition-colors duration-500 ${status === 'GRANTED' ? 'text-emerald-500' : 'text-cyan-500'}`} />
                    <h1 className="text-2xl font-bold tracking-widest text-slate-200">
                        SYSTEM LOCKDOWN
                    </h1>
                    <p className="text-sm text-slate-500 tracking-wider">
                        UNAUTHORIZED ACCESS PROHIBITED
                    </p>
                </div>

                <div className="p-8 space-y-6 bg-slate-900/50 border border-slate-800 rounded-lg shadow-2xl backdrop-blur-sm">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-widest">
                            <KeyRound className="w-4 h-4" />
                            <span>Authentication Terminal</span>
                        </div>
                        {error && <div className="text-red-500 text-xs animate-pulse bg-red-500/10 p-2 rounded">{error}</div>}
                    </div>

                    <form onSubmit={handleVerifyTotp} className="space-y-4">
                        <input
                            type="text"
                            maxLength={6}
                            value={token}
                            onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                            placeholder="000000"
                            className="w-full bg-slate-950 border border-slate-700 text-center text-3xl tracking-[1em] py-4 text-cyan-400 placeholder-slate-800 focus:outline-none focus:border-cyan-500 transition-colors rounded font-bold"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={token.length !== 6 || status === 'VERIFYING'}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded uppercase tracking-widest font-bold transition-all"
                        >
                            {status === 'VERIFYING' ? 'Decrypting...' : 'Verify Protocol'}
                        </button>
                    </form>

                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest">
                            <span className="bg-slate-900 px-4 text-slate-500">OR</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleWebAuthnLogin}
                        disabled={status === 'VERIFYING'}
                        className="w-full border border-slate-700 hover:border-slate-500 disabled:opacity-50 text-slate-300 py-3 rounded uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all group"
                    >
                        <Fingerprint className="w-5 h-5 group-hover:text-cyan-400 transition-colors" />
                        Use Hardware Enclave
                    </button>
                </div>
            </div>
        </div>
    );
}
