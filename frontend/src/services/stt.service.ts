/**
 * STT (Speech-to-Text) Service
 * 
 * Provides speech-to-text functionality using the backend STT API (Whisper).
 * This service handles audio recording and pronunciation comparison.
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

export interface TranscriptionResult {
    transcription: string;
}

export interface PronunciationResult {
    transcription: string;
    targetWord: string;
    accuracy: number;
    isCorrect: boolean;
}

/**
 * Transcribe audio to text
 * @param audioBlob - The audio blob to transcribe
 * @returns Promise with transcription result
 */
const transcribe = async (audioBlob: Blob): Promise<TranscriptionResult> => {
    const token = getToken();
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    const response = await fetch(`${getBaseUrl()}/v1/api/stt/transcribe`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error(`STT request failed with status ${response.status}`);
    }

    const result = await response.json();

    if (result.code !== 200) {
        throw new Error(result.message || "Transcription failed");
    }

    return result.data;
};

/**
 * Check pronunciation by comparing audio with target word
 * @param audioBlob - The audio blob to transcribe
 * @param targetWord - The target word to compare against
 * @returns Promise with pronunciation comparison result
 */
const checkPronunciation = async (
    audioBlob: Blob,
    targetWord: string
): Promise<PronunciationResult> => {
    const token = getToken();
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
    formData.append("targetWord", targetWord);

    let response;
    try {
        response = await fetch(`${getBaseUrl()}/v1/api/stt/compare`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });
    } catch (fetchError) {
        throw new Error("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
    }

    if (!response.ok) {
        const result = await response.json().catch(() => ({}));

        // Handle 503 - Service Unavailable (FastAPI not running)
        if (response.status === 503) {
            throw new Error("Server AI chưa được khởi động. Vui lòng liên hệ quản trị viên để khởi động server.");
        }

        throw new Error(result.message || `STT request failed with status ${response.status}`);
    }

    const result = await response.json();

    if (result.code !== 200) {
        throw new Error(result.message || "Pronunciation check failed");
    }

    return result.data;
};

/**
 * Request microphone permission
 * @returns Promise that resolves if permission is granted
 */
const requestMicrophonePermission = async (): Promise<MediaStream> => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        return stream;
    } catch (error) {
        console.error("[STT] Microphone permission denied:", error);
        throw new Error("Microphone permission denied");
    }
};

/**
 * Create a MediaRecorder for audio recording
 * @param stream - MediaStream from getUserMedia
 * @returns MediaRecorder instance
 */
const createRecorder = (stream: MediaStream): MediaRecorder => {
    const options = { mimeType: "audio/webm" };

    // Check if webm is supported, fallback to other formats
    if (!MediaRecorder.isTypeSupported("audio/webm")) {
        if (MediaRecorder.isTypeSupported("audio/mp4")) {
            options.mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
            options.mimeType = "audio/ogg";
        } else {
            // Use default
            return new MediaRecorder(stream);
        }
    }

    return new MediaRecorder(stream, options);
};

export const sttService = {
    transcribe,
    checkPronunciation,
    requestMicrophonePermission,
    createRecorder,
};

export default sttService;
