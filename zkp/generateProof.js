import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {groth16} from "snarkjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateProof = async (input) => {
    try {
        console.log("received input", input);
        const bigIntInput = Object.fromEntries(
            Object.entries(input).map(([key, value]) => [key, BigInt(value)])
        );
        console.log("bigint input", bigIntInput);
        const wasmPath =
            "/Users/dave/Code/Project/Backend/Server/zkp/circuits/authentication_js/authentication.wasm";
        const zkeyPath =
            "/Users/dave/Code/Project/Backend/Server/zkp/keys/authentication_final.zkey";
        const witnessCalculatorModule = await import(
            "./circuits/authentication_js/wintness_calculator_wrapper.js"
        );
        const witnessCalculator = witnessCalculatorModule.default;
        const wasmBuffer = fs.readFileSync(wasmPath);
        const zkeyBuffer = fs.readFileSync(zkeyPath);
        const witnessCalculatorInstance = await witnessCalculator(wasmBuffer);
        const witnessBuffer = await witnessCalculatorInstance.calculateWTNSBin(
            bigIntInput
        );
        const { proof, publicSignals } = await groth16.prove(
            zkeyBuffer,
            witnessBuffer
        );

        return { proof, publicSignals };
    } catch (error) {
        console.error("Error generating proof:", error);
        throw error;
    }
};
