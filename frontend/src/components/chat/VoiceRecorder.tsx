import React, { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, X } from 'lucide-react';
import { apiClient } from '../../services/api';
import { showToast } from '../../utils/toast';

interface VoiceRecorderProps {
    conversationId: number;
    onSend: (content: string, contentType: string, payload: string) => Promise<void>;
    disabled?: boolean;
}

type RecordState = 'idle' | 'recording' | 'uploading';

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ conversationId, onSend, disabled }) => {
    const [state, setState] = useState<RecordState>('idle');
    const [seconds, setSeconds] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startTimeRef = useRef<number>(0);

    const clearTimer = () => {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };

    const startRecording = useCallback(async () => {
        if (disabled) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm';
            const recorder = new MediaRecorder(stream, { mimeType });
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.start(100); // collect chunks every 100ms
            mediaRecorderRef.current = recorder;
            startTimeRef.current = Date.now();
            setState('recording');
            setSeconds(0);

            timerRef.current = setInterval(() => {
                setSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
            }, 500);
        } catch (err) {
            console.error('Microphone access denied', err);
            showToast.error('Microphone access denied');
        }
    }, [disabled]);

    const cancelRecording = useCallback(() => {
        clearTimer();
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
            mediaRecorderRef.current = null;
        }
        chunksRef.current = [];
        setSeconds(0);
        setState('idle');
    }, []);

    const stopAndSend = useCallback(async () => {
        const recorder = mediaRecorderRef.current;
        if (!recorder || state !== 'recording') return;

        clearTimer();
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);

        await new Promise<void>((resolve) => {
            recorder.onstop = () => resolve();
            recorder.stop();
            recorder.stream.getTracks().forEach(t => t.stop());
        });

        if (chunksRef.current.length === 0) {
            setState('idle');
            return;
        }

        setState('uploading');
        try {
            const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
            const file = new File([blob], `voice-note-${Date.now()}.webm`, { type: blob.type });
            const formData = new FormData();
            formData.append('file', file);
            formData.append('conversationId', conversationId.toString());

            const response = await apiClient.post('/chat/attachments', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const attachment = response.data?.data || response.data;

            const payload = JSON.stringify({
                attachmentId: attachment.attachmentId,
                url: attachment.url,
                fileName: attachment.fileName,
                fileSize: attachment.fileSize,
                duration,
            });

            await onSend('Voice message', 'VOICE_NOTE', payload);
        } catch (err) {
            console.error('Voice upload failed', err);
            showToast.error('Failed to send voice message');
        } finally {
            mediaRecorderRef.current = null;
            chunksRef.current = [];
            setSeconds(0);
            setState('idle');
        }
    }, [conversationId, onSend, state]);

    const formatDuration = (s: number) => {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    };

    if (state === 'idle') {
        return (
            <button
                type="button"
                className="chat-input__voice-btn"
                title="Record voice message"
                disabled={disabled}
                onClick={startRecording}
            >
                <Mic size={20} />
            </button>
        );
    }

    return (
        <div className="voice-recorder">
            <button
                type="button"
                className="voice-recorder__cancel"
                title="Cancel recording"
                onClick={cancelRecording}
            >
                <X size={18} />
            </button>

            <div className="voice-recorder__body">
                <span className={`voice-recorder__pulse ${state === 'recording' ? 'voice-recorder__pulse--active' : ''}`}>
                    <MicOff size={18} />
                </span>
                <span className="voice-recorder__timer">{formatDuration(seconds)}</span>
            </div>

            <button
                type="button"
                className={`voice-recorder__send ${state === 'uploading' ? 'voice-recorder__send--loading' : ''}`}
                title="Send voice message"
                disabled={state === 'uploading'}
                onClick={stopAndSend}
            >
                {state === 'uploading' ? '…' : 'Send'}
            </button>
        </div>
    );
};

export default VoiceRecorder;
