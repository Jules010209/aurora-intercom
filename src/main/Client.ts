import * as net from 'net';

export class TCPClient {
    private client = new net.Socket();
    private host = 'localhost';
    private port = 1130;
    private reconnectDelay = 2000;
    private buffer = '';
    private queue: string[] = [];
    private connected = false;
    private onMessage: (msg: string) => void;
    private onError: (err: Error) => void;
    private onClose: () => void;

    constructor(
        onMessage: (msg: string) => void,
        onError: (err: Error) => void,
        onClose: () => void
    ) {
        this.onMessage = onMessage;
        this.onError = onError;
        this.onClose = onClose;
        this.setupListeners();
        this.connect();
    }

    private setupListeners() {
        this.client.on('connect', () => {
            this.connected = true;
            this.flushQueue();
        });

        this.client.on('data', (data) => {
            this.buffer += data.toString('ascii');
            let index: number;

            while ((index = this.buffer.indexOf('\n')) !== -1) {
                const message = this.buffer.slice(0, index);
                this.buffer = this.buffer.slice(index + 1);
                this.onMessage(message);
            }
        });

        this.client.on('error', (err) => {
            this.connected = false;
            this.onError(err);
            setTimeout(() => this.connect(), this.reconnectDelay);
        });

        this.client.on('close', () => {
            this.connected = false;
            this.onClose();
            setTimeout(() => this.connect(), this.reconnectDelay);
        });
    }

    private connect() {
        if (!this.connected) {
            this.client.connect(this.port, this.host);
        }
    }

    send(data: string) {
        if (this.connected) {
            this.client.write(data + '\n');
        } else {
            this.queue.push(data);
        }
    }

    private flushQueue() {
        while (this.queue.length > 0 && this.connected) {
            this.client.write(this.queue.shift() + '\n');
        }
    }
}