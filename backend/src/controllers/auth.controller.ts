import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { query } from '../config/database';
import { User, JWTPayload } from '../types';
import { logAudit } from '../services/audit.service';

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        // Find user by email
        const users = await query<User[]>(
            'SELECT * FROM USERS WHERE email = ? AND status = ?',
            [email, 'ACTIVE']
        );

        if (users.length === 0) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const user = users[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        // Generate JWT token
        const payload: JWTPayload = {
            userId: user.user_id,
            email: user.email,
            role: user.role
        };

        const secret = process.env.JWT_SECRET || 'default_secret';
        const token = jwt.sign(payload, secret, { expiresIn: '7d' });

        // Log audit
        await logAudit({
            action: 'USER_LOGIN',
            entityType: 'USER',
            entityId: user.user_id,
            performedBy: user.user_id,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            details: { role: user.role }
        });

        // Return user data (excluding password)
        const { password_hash: _password_hash, ...userData } = user;

        res.status(200).json({
            message: 'Login successful',
            token,
            user: userData
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { full_name, email, phone, password, batch } = req.body;

        // Validation
        if (!full_name || !email || !password) {
            res.status(400).json({ error: 'Name, email, and password are required' });
            return;
        }

        // Check if user already exists
        const existingUsers = await query<User[]>(
            'SELECT * FROM USERS WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            res.status(409).json({ error: 'User already exists' });
            return;
        }

        // Hash password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const result = await query<any>(
            'INSERT INTO USERS (full_name, email, phone, password_hash, batch, role) VALUES (?, ?, ?, ?, ?, ?)',
            [full_name, email, phone || null, password_hash, batch || null, 'MEMBER']
        );

        const userId = result.insertId;

        // Log audit
        await logAudit({
            action: 'USER_REGISTERED',
            entityType: 'USER',
            entityId: userId,
            performedBy: userId,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            details: { email, role: 'MEMBER' }
        });

        res.status(201).json({
            message: 'Registration successful',
            userId
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const users = await query<User[]>(
            'SELECT * FROM USERS WHERE user_id = ?',
            [req.user.userId]
        );

        if (users.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const { password_hash: _password_hash, ...userData } = users[0];

        res.status(200).json({ user: userData });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};
