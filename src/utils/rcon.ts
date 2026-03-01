import net from 'net';

const PACKET_TYPE_AUTH = 3;
const PACKET_TYPE_COMMAND = 2;
const PACKET_TYPE_RESPONSE = 0;

interface RconPacket {
    id: number;
    type: number;
    payload: string;
}

function buildPacket(id: number, type: number, payload: string): Buffer {
    const payloadBuf = Buffer.from(payload, 'utf8');
    const size = 4 + 4 + payloadBuf.length + 2;
    const buf = Buffer.alloc(size + 4);
    buf.writeInt32LE(size, 0);
    buf.writeInt32LE(id, 4);
    buf.writeInt32LE(type, 8);
    payloadBuf.copy(buf, 12);
    buf.writeInt16LE(0, 12 + payloadBuf.length);
    return buf;
}

function parsePacket(data: Buffer): RconPacket {
    return {
        id: data.readInt32LE(4),
        type: data.readInt32LE(8),
        payload: data.slice(12, data.length - 2).toString('utf8'),
    };
}

export class RconClient {
    private host: string;
    private port: number;
    private password: string;
    private socket: net.Socket | null = null;
    private authenticated = false;

    constructor(host: string, port: number, password: string) {
        this.host = host;
        this.port = port;
        this.password = password;
    }

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.socket = net.createConnection({ host: this.host, port: this.port });

            this.socket.once('connect', async () => {
                try {
                    await this.send(PACKET_TYPE_AUTH, this.password, 1);
                    this.authenticated = true;
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });

            this.socket.once('error', reject);
            setTimeout(() => reject(new Error('RCON connection timeout')), 5000);
        });
    }

    send(type: number, payload: string, id = 2): Promise<RconPacket> {
        return new Promise((resolve, reject) => {
            if (!this.socket) return reject(new Error('Not connected'));

            const packet = buildPacket(id, type, payload);
            const chunks: Buffer[] = [];

            const onData = (data: Buffer) => {
                chunks.push(data);
                const full = Buffer.concat(chunks);
                if (full.length >= 14) {
                    this.socket!.removeListener('data', onData);
                    resolve(parsePacket(full));
                }
            };

            this.socket.on('data', onData);
            this.socket.write(packet, (err) => {
                if (err) reject(err);
            });

            setTimeout(() => {
                this.socket?.removeListener('data', onData);
                reject(new Error('RCON response timeout'));
            }, 5000);
        });
    }

    async execute(command: string): Promise<string> {
        if (!this.authenticated) throw new Error('Not authenticated');
        const response = await this.send(PACKET_TYPE_COMMAND, command);
        return response.payload;
    }

    disconnect(): void {
        this.socket?.destroy();
        this.socket = null;
        this.authenticated = false;
    }
}

export async function executeRcon(command: string): Promise<string> {
    const client = new RconClient(
        process.env.RCON_HOST || 'localhost',
        parseInt(process.env.RCON_PORT || '25575', 10),
        process.env.RCON_PASSWORD || ''
    );

    await client.connect();
    try {
        return await client.execute(command);
    } finally {
        client.disconnect();
    }
}
