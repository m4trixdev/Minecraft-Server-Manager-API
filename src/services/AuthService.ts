import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';

export class AuthService {
    private userRepo: UserRepository;

    constructor() {
        this.userRepo = new UserRepository();
    }

    async register(username: string, password: string, role = 'user') {
        if (await this.userRepo.usernameExists(username)) {
            throw new Error('Username already taken');
        }
        const hashed = await bcrypt.hash(password, 12);
        const user = await this.userRepo.create(username, hashed, role);
        return { id: user.id, username: user.username, role: user.role };
    }

    async login(username: string, password: string) {
        const user = await this.userRepo.findByUsername(username);
        if (!user) throw new Error('Invalid credentials');

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new Error('Invalid credentials');

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
        );

        return { token, user: { id: user.id, username: user.username, role: user.role } };
    }
}
