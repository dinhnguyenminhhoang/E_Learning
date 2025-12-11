/**
 * TTS (Text-to-Speech) Service
 * 
 * Provides text-to-speech functionality using the backend TTS API.
 * This service handles authentication and audio playback.
 */

const getBaseUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
};

const getToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("accessToken") || "";
    }
    return "";
};

interface SpeakOptions {
    lang?: string;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: Error) => void;
}

/**
 * Speak text using the backend TTS service
 * @param text - The text to speak
 * @param options - Optional configuration including language and callbacks
 * @returns Promise that resolves when audio starts playing
 */
const speak = async (text: string, options: SpeakOptions = {}): Promise<HTMLAudioElement | null> => {
    const { lang = "en", onStart, onEnd, onError } = options;

    if (!text) {
        console.warn("[TTS] No text provided");
        return null;
    }

    try {
        const token = getToken();
        const url = `${getBaseUrl()}/v1/api/tts/speak?text=${encodeURIComponent(text)}&lang=${lang}`;

        console.log("[TTS] Requesting:", text);

        const response = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`TTS request failed with status ${response.status}`);
        }

        const blob = await response.blob();
        const audio = new Audio();
        audio.src = URL.createObjectURL(blob);
        audio.volume = 1;

        audio.onended = () => {
            console.log("[TTS] Finished speaking:", text);
            URL.revokeObjectURL(audio.src);
            onEnd?.();
        };

        audio.onerror = (e) => {
            console.error("[TTS] Audio error:", e);
            onError?.(new Error("Audio playback failed"));
        };

        onStart?.();
        console.log("[TTS] Playing:", text);
        await audio.play();

        return audio;
    } catch (error) {
        console.error("[TTS] Error:", error);
        onError?.(error instanceof Error ? error : new Error("TTS failed"));
        return null;
    }
};

/**
 * Helper function to speak text with loading state management
 * @param text - The text to speak
 * @param setLoading - State setter function for loading state
 * @param lang - Language code (default: "en")
 */
const speakWithLoading = async (
    text: string,
    setLoading: (loading: boolean) => void,
    lang: string = "en"
): Promise<void> => {
    if (!text) return;

    setLoading(true);

    await speak(text, {
        lang,
        onEnd: () => setLoading(false),
        onError: () => setLoading(false),
    });
};

export const ttsService = {
    speak,
    speakWithLoading,
};

export default ttsService;
