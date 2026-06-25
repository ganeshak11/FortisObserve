import { SignJWT, jwtVerify } from 'jose';

const getSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");
    return new TextEncoder().encode(secret);
};

export async function signToken(payload: any) {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 60 * 60 * 24; // 24 hours

    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setExpirationTime(exp)
        .setIssuedAt(iat)
        .setNotBefore(iat)
        .sign(getSecret());
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, getSecret());
        return payload;
    } catch (error) {
        return null;
    }
}
