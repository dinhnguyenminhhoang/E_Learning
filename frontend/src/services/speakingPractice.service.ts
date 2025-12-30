const getBaseUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
};

const getToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("accessToken") || "";
    }
    return "";
};

export interface SpeakingError {
    original: string;
    corrected: string;
    position: number;
}

export interface SpeakingPracticeResult {
    transcribedText: string;
    correctedText: string;
    errors: SpeakingError[];
    hasErrors: boolean;
}

const analyzeSpeaking = async (audioBlob: Blob): Promise<SpeakingPracticeResult> => {
    const token = getToken();
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    let response;
    try {
        response = await fetch(`${getBaseUrl()}/v1/api/speaking-practice/analyze`, {
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

        if (response.status === 503) {
            throw new Error("Server AI chưa được khởi động. Vui lòng liên hệ quản trị viên.");
        }

        throw new Error(result.message || `Speaking practice request failed with status ${response.status}`);
    }

    const result = await response.json();

    if (result.code !== 200) {
        throw new Error(result.message || "Speaking practice analysis failed");
    }

    return result.data;
};

const requestMicrophonePermission = async (): Promise<MediaStream> => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        return stream;
    } catch (error) {
        console.error("[Speaking Practice] Microphone permission denied:", error);
        throw new Error("Microphone permission denied");
    }
};

const createRecorder = (stream: MediaStream): MediaRecorder => {
    const options = { mimeType: "audio/webm" };

    if (!MediaRecorder.isTypeSupported("audio/webm")) {
        if (MediaRecorder.isTypeSupported("audio/mp4")) {
            options.mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
            options.mimeType = "audio/ogg";
        } else {
            return new MediaRecorder(stream);
        }
    }

    return new MediaRecorder(stream, options);
};

export const speakingPracticeService = {
    analyzeSpeaking,
    requestMicrophonePermission,
    createRecorder,
};

export default speakingPracticeService;
