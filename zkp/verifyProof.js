import fs from "fs";
import {groth16} from "snarkjs";

export const verifyProof = async (proof, publicSignals) => {
    try {
        const verificationKeyPath = "./zkp/keys/verification_key.json";
        const verificationKey = JSON.parse(
            fs.readFileSync(verificationKeyPath)
        );

        console.log("Verification key:", verificationKey);
        console.log("Proof:", proof);
        console.log("Public signals:", publicSignals);

        const isValid = await groth16.verify(
            verificationKey,
            publicSignals,
            proof
        );

        console.log("Verification result:", isValid);
        return isValid;
    } catch (error) {
        console.error("Error verifying proof:", error);
        throw error;
    }
};

