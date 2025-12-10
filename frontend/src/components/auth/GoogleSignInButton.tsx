"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
// import { Loader2 } from "lucide-react"; // Tạm comment vì bạn đang comment phần fallback
// import { Button } from "@/components/ui/button"; 

declare global {
  interface Window {
    google?: any;
  }
}

export const GoogleSignInButton = () => {
  const { googleLogin, isLoading } = useAuth();
  const buttonRef = useRef<HTMLDivElement | null>(null);
  
  // Dùng biến này để đảm bảo chỉ render button 1 lần
  const [isButtonRendered, setIsButtonRendered] = useState(false);

  // Bạn nên đổi lại process.env khi đã test xong
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  // const clientId = "YOUR_HARDCODED_ID_HERE"; 

  // 1. Load Script Google (Chỉ chạy 1 lần khi mount)
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Nếu script chưa có trong DOM thì mới thêm vào
    if (!document.getElementById("google-identity-script")) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.id = "google-identity-script";
        document.body.appendChild(script);
    }
  }, []);

  // 2. Kiểm tra và Render Button (Cơ chế Polling)
  useEffect(() => {
    if (!clientId || isButtonRendered) return;

    // Hàm kiểm tra xem Google SDK đã sẵn sàng chưa
    const checkGoogleLoaded = () => {
        if (window.google?.accounts?.id && buttonRef.current) {
            try {
                // 1. Initialize
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleGoogleResponse,
                    auto_select: false,
                    cancel_on_tap_outside: true,
                });

                // 2. Render Button
                window.google.accounts.id.renderButton(buttonRef.current, {
                    theme: "outline",
                    size: "large",
                    width: 320,
                    text: "continue_with",
                    shape: "pill",
                });

                // Đánh dấu đã render xong để không chạy lại/flicker
                setIsButtonRendered(true);
                
                // Dừng vòng lặp kiểm tra
                return true; 
            } catch (error) {
                console.error("Google Init Error:", error);
            }
        }
        return false;
    };

    // Kiểm tra ngay lập tức
    if (checkGoogleLoaded()) return;

    // Nếu chưa có, thiết lập vòng lặp kiểm tra mỗi 200ms
    const intervalId = setInterval(() => {
        const isLoaded = checkGoogleLoaded();
        if (isLoaded) {
            clearInterval(intervalId);
        }
    }, 200);

    // Cleanup khi component unmount
    return () => clearInterval(intervalId);
  }, [clientId, isButtonRendered]);

  const handleGoogleResponse = async (response: any) => {
    if (!response?.credential) return;
    try {
        console.log("Got Google Token");
        await googleLogin(response.credential);
    } catch (error) {
        console.error("Login Failed:", error);
    }
  };

  return (
    <div className="space-y-2 w-full flex flex-col items-center">
      {/* Container nút Native */}
      <div 
        ref={buttonRef} 
        className="min-h-[44px] w-full flex justify-center" // Tăng min-height lên 44px chuẩn Google
      />
    </div>
  );
};