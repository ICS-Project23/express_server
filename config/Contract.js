import dotenv from "dotenv";
import { ethers } from "ethers";


dotenv.config();

export const VotingContractConfig = {
    address: process.env.VOTING_CONTRACT_ADDRESS,
    abi: [
        {
            inputs: [
                {
                    internalType: "address",
                    name: "_candidateManagerAddress",
                    type: "address",
                },
            ],
            stateMutability: "nonpayable",
            type: "constructor",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "voter",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "candidateId",
                    type: "uint256",
                },
            ],
            name: "Voted",
            type: "event",
        },
        {
            inputs: [],
            name: "candidateManager",
            outputs: [
                {
                    internalType: "contract CandidateManager",
                    name: "",
                    type: "address",
                },
            ],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [
                {
                    internalType: "uint256",
                    name: "_candidateId",
                    type: "uint256",
                },
            ],
            name: "getCandidate",
            outputs: [
                {
                    internalType: "uint256",
                    name: "",
                    type: "uint256",
                },
                {
                    internalType: "string",
                    name: "",
                    type: "string",
                },
                {
                    internalType: "uint256",
                    name: "",
                    type: "uint256",
                },
            ],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [
                {
                    internalType: "uint256",
                    name: "_candidateId",
                    type: "uint256",
                },
            ],
            name: "vote",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [
                {
                    internalType: "address",
                    name: "",
                    type: "address",
                },
            ],
            name: "voters",
            outputs: [
                {
                    internalType: "bool",
                    name: "",
                    type: "bool",
                },
            ],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [
                {
                    internalType: "uint256",
                    name: "",
                    type: "uint256",
                },
            ],
            name: "votes",
            outputs: [
                {
                    internalType: "uint256",
                    name: "",
                    type: "uint256",
                },
            ],
            stateMutability: "view",
            type: "function",
        },
    ],
};

export const CandidateManagerConfig = {
    address: process.env.CANDIDATE_MANAGER_CONTRACT_ADDRESS,
    abi: [
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "candidateId",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "string",
                    name: "name",
                    type: "string",
                },
            ],
            name: "CandidateAdded",
            type: "event",
        },
        {
            inputs: [
                {
                    internalType: "string",
                    name: "_name",
                    type: "string",
                },
            ],
            name: "addCandidate",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [
                {
                    internalType: "uint256",
                    name: "",
                    type: "uint256",
                },
            ],
            name: "candidates",
            outputs: [
                {
                    internalType: "uint256",
                    name: "id",
                    type: "uint256",
                },
                {
                    internalType: "string",
                    name: "name",
                    type: "string",
                },
            ],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "candidatesCount",
            outputs: [
                {
                    internalType: "uint256",
                    name: "",
                    type: "uint256",
                },
            ],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "getAllCandidates",
            outputs: [
                {
                    components: [
                        {
                            internalType: "uint256",
                            name: "id",
                            type: "uint256",
                        },
                        {
                            internalType: "string",
                            name: "name",
                            type: "string",
                        },
                    ],
                    internalType: "struct CandidateManager.Candidate[]",
                    name: "",
                    type: "tuple[]",
                },
            ],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [
                {
                    internalType: "uint256",
                    name: "_candidateId",
                    type: "uint256",
                },
            ],
            name: "getCandidate",
            outputs: [
                {
                    internalType: "uint256",
                    name: "",
                    type: "uint256",
                },
                {
                    internalType: "string",
                    name: "",
                    type: "string",
                },
            ],
            stateMutability: "view",
            type: "function",
        },
    ],
};

