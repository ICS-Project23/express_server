import crypto from "crypto";

export const generateSecret = () => {
    return crypto.randomBytes(32).toString("hex");
};

export const generateCommitment = (secretKey) => {
    if (!secretKey) {
        throw new Error("Secret key is required");
    }
    return crypto.createHash("sha256").update(secretKey).digest("hex");
};

export const generateChallenge = () => {
    // Generate a random numeric challenge
    const randomBytes = crypto.randomBytes(16); // 16 bytes = 128 bits
    const numericChallenge = BigInt(
        `0x${randomBytes.toString("hex")}`
    ).toString();
    return numericChallenge;
};

export const computeResponse = (secretKey, challenge) => {
    if (!secretKey || !challenge) {
        throw new Error("Both secret key and challenge are required");
    }
    return crypto
        .createHash("sha256")
        .update(secretKey + challenge)
        .digest("hex");
};
