declare module 'sockjs-client' {
    export default class SockJS {
        constructor(url: string, _reserved?: any, options?: any);
        close(code?: number, reason?: string): void;
        onopen: () => void;
        onclose: () => void;
        onmessage: (e: any) => void;
        send(data: any): void;
        readyState: number;
    }
}
