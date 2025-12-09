"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    google?: any;
  }
}

export const GoogleSignInButton = () => {
  const { googleLogin, isLoading } = useAuth();
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    // Avoid adding the script multiple times
    if (document.getElementById("google-identity-script")) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.id = "google-identity-script";
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => setScriptLoaded(false);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !clientId || !window.google || !buttonRef.current) {
      return;
    }

    // Initialize Google Identity Services
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: any) => {
        if (!response?.credential) return;
        try {
          setLocalLoading(true);
          await googleLogin(response.credential);
        } catch (error) {
          console.error("Google sign-in failed:", error);
        } finally {
          setLocalLoading(false);
        }
      },
    });

    // Render the default Google button into our ref container
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      width: 320,
      text: "continue_with",
      shape: "pill",
    });
  }, [clientId, googleLogin, scriptLoaded]);

  const disabled = isLoading || localLoading || !clientId || !scriptLoaded;

  // Fallback to custom button if GIS script has issues; click triggers the Google prompt
  const handleFallbackClick = () => {
    if (!window.google?.accounts?.id) return;
    window.google.accounts.id.prompt();
  };

  return (
    <div className="space-y-2">
      {/* Native Google button container */}
      <div
        ref={buttonRef}
        className={disabled ? "opacity-70 pointer-events-none" : ""}
      />

      {/* Fallback button retaining the existing UI style */}
      <Button
        type="button"
        variant="outline"
        className="w-full border-slate-700/50 bg-slate-800/50 hover:bg-slate-800 text-white"
        disabled={disabled}
        onClick={handleFallbackClick}
      >
        {isLoading || localLoading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Đang đăng nhập với Google...
          </>
        ) : (
          <>
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Đăng nhập với Google
          </>
        )}
      </Button>

      {!clientId && (
        <p className="text-xs text-red-300">
          Thiếu cấu hình NEXT_PUBLIC_GOOGLE_CLIENT_ID
        </p>
      )}
    </div>
  );
};

