"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { fetchApi } from "@/lib/utils";

function UnsubscribeContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";
    const token = searchParams.get("token") || "";

    // "idle" -> "submitting" -> "done" | "error"
    const [status, setStatus] = useState("idle");
    const [message, setMessage] = useState("");

    const linkIsIncomplete = !email || !token;

    // Unsubscribing happens on a button press, not on page load: mail
    // scanners and link previewers open links automatically, and that must
    // not unsubscribe anyone.
    const handleUnsubscribe = async () => {
        setStatus("submitting");
        try {
            const response = await fetchApi("/newsletter/unsubscribe", {
                method: "POST",
                body: JSON.stringify({ email, token }),
            });
            setMessage(response.message || "You have been unsubscribed.");
            setStatus("done");
        } catch (err) {
            setMessage(err.message || "Something went wrong. Please try again.");
            setStatus("error");
        }
    };

    return (
        <div className="min-h-[70vh] bg-white flex items-center justify-center px-4 py-16">
            <div className="max-w-md w-full text-center">
                {status === "done" ? (
                    <>
                        <CheckCircle className="h-10 w-10 mx-auto mb-5 text-green-600" strokeWidth={1.25} />
                        <h1 className="text-2xl font-light text-black tracking-tight mb-3">You&apos;re unsubscribed</h1>
                        <p className="text-[13px] text-black/50 leading-relaxed mb-8">
                            {email} will no longer receive marketing emails from us. You&apos;ll still get
                            emails about your orders.
                        </p>
                        <Link
                            href="/"
                            className="inline-block border border-black/10 text-black text-[10px] uppercase tracking-[0.2em] font-medium px-6 py-3 hover:border-black/30 transition-all"
                        >
                            Back to store
                        </Link>
                    </>
                ) : linkIsIncomplete ? (
                    <>
                        <AlertCircle className="h-10 w-10 mx-auto mb-5 text-black/30" strokeWidth={1.25} />
                        <h1 className="text-2xl font-light text-black tracking-tight mb-3">Link not valid</h1>
                        <p className="text-[13px] text-black/50 leading-relaxed">
                            This unsubscribe link is incomplete. Please use the link in the email exactly as it
                            was sent, or contact us and we&apos;ll remove you.
                        </p>
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-light text-black tracking-tight mb-3">Unsubscribe</h1>
                        <p className="text-[13px] text-black/50 leading-relaxed mb-1">
                            Stop marketing emails to
                        </p>
                        <p className="text-sm text-black font-medium mb-8 break-all">{email}</p>

                        {status === "error" && (
                            <p className="text-[12px] text-red-600 mb-5">{message}</p>
                        )}

                        <button
                            type="button"
                            onClick={handleUnsubscribe}
                            disabled={status === "submitting"}
                            className="w-full bg-black text-white text-[10px] uppercase tracking-[0.2em] font-medium py-3.5 hover:bg-black/80 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                        >
                            {status === "submitting" ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Unsubscribing…
                                </>
                            ) : (
                                "Confirm unsubscribe"
                            )}
                        </button>
                        <p className="text-[11px] text-black/30 mt-4">
                            You&apos;ll still receive emails about your orders.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

export default function UnsubscribePage() {
    // useSearchParams needs a Suspense boundary for static rendering.
    return (
        <Suspense fallback={null}>
            <UnsubscribeContent />
        </Suspense>
    );
}
