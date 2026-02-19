
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// In a real app, this should be a long random string in .env
// For this pilot/demo, we'll use a hardcoded fallback if env is missing, but warn about it.
const SECRET_KEY = process.env.ENCRYPTION_KEY || 'maker-connect-pilot-secret-key-32chars!!'; 

// Ensure key is 32 bytes
const getKey = () => {
    return crypto.scryptSync(SECRET_KEY, 'salt', 32);
};

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(text: string): string {
    const parts = text.split(':');
    if (parts.length !== 3) {
        throw new Error('Invalid encrypted text format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
}
