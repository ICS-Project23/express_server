import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();


export const CandidateManagerConfig = {
    address: process.env.CANDIDATE_MANAGER_CONTRACT_ADDRESS,
    abi: [
        {
            inputs: [
                {
                    internalType: "address",
                    name: "_electionAddress",
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
                    name: "_full_name",
                    type: "string",
                },
                {
                    internalType: "string",
                    name: "_date_of_birth",
                    type: "string",
                },
                {
                    internalType: "string",
                    name: "_cid",
                    type: "string",
                },
                {
                    internalType: "string",
                    name: "_party",
                    type: "string",
                },
                {
                    internalType: "uint256",
                    name: "_position_id",
                    type: "uint256",
                },
            ],
            name: "addCandidate",
            outputs: [],
            stateMutability: "nonpayable",
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
                            name: "full_names",
                            type: "string",
                        },
                        {
                            internalType: "string",
                            name: "date_of_birth",
                            type: "string",
                        },
                        {
                            internalType: "string",
                            name: "cid",
                            type: "string",
                        },
                        {
                            internalType: "string",
                            name: "party",
                            type: "string",
                        },
                        {
                            internalType: "uint256",
                            name: "position_id",
                            type: "uint256",
                        },
                    ],
                    internalType: "struct Candidate[]",
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
                    name: "_candidate_id",
                    type: "uint256",
                },
                {
                    internalType: "uint256",
                    name: "_election_id",
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
                    internalType: "string",
                    name: "",
                    type: "string",
                },
                {
                    internalType: "string",
                    name: "",
                    type: "string",
                },
                {
                    internalType: "string",
                    name: "",
                    type: "string",
                },
                {
                    internalType: "string",
                    name: "",
                    type: "string",
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
        {
            inputs: [],
            name: "getCandidateCount",
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
            inputs: [
                {
                    internalType: "uint256",
                    name: "_candidate_id",
                    type: "uint256",
                },
            ],
            name: "getCandidatePosition",
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
            inputs: [
                {
                    internalType: "uint256",
                    name: "_position_id",
                    type: "uint256",
                },
            ],
            name: "getCandidatesCountByPosition",
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
            inputs: [
                {
                    internalType: "uint256",
                    name: "_position__id",
                    type: "uint256",
                },
            ],
            name: "getCandidatesForPosition",
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
                            name: "full_names",
                            type: "string",
                        },
                        {
                            internalType: "string",
                            name: "date_of_birth",
                            type: "string",
                        },
                        {
                            internalType: "string",
                            name: "cid",
                            type: "string",
                        },
                        {
                            internalType: "string",
                            name: "party",
                            type: "string",
                        },
                        {
                            internalType: "uint256",
                            name: "position_id",
                            type: "uint256",
                        },
                    ],
                    internalType: "struct Candidate[]",
                    name: "",
                    type: "tuple[]",
                },
            ],
            stateMutability: "view",
            type: "function",
        },
    ],
};

export const ElectionConfig = {
    address: process.env.ELECTION_CONTRACT_ADDRESS,
    abi: [
        {
            inputs: [],
            stateMutability: "nonpayable",
            type: "constructor",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: "string",
                    name: "name",
                    type: "string",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "startTime",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "endTime",
                    type: "uint256",
                },
            ],
            name: "ElectionCreated",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [],
            name: "ElectionEnded",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [],
            name: "ElectionStarted",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "positionId",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "string",
                    name: "name",
                    type: "string",
                },
                {
                    indexed: false,
                    internalType: "string",
                    name: "description",
                    type: "string",
                },
            ],
            name: "PositionAdded",
            type: "event",
        },
        {
            inputs: [
                {
                    internalType: "string",
                    name: "_name",
                    type: "string",
                },
                {
                    internalType: "string",
                    name: "_description",
                    type: "string",
                },
                {
                    internalType: "uint256",
                    name: "_electionId",
                    type: "uint256",
                },
            ],
            name: "addPosition",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [],
            name: "admin",
            outputs: [
                {
                    internalType: "address",
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
                    internalType: "string",
                    name: "_name",
                    type: "string",
                },
                {
                    internalType: "uint256",
                    name: "_startTime",
                    type: "uint256",
                },
                {
                    internalType: "uint256",
                    name: "_endTime",
                    type: "uint256",
                },
            ],
            name: "createElection",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [],
            name: "electionStatus",
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
            inputs: [],
            name: "endElection",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [],
            name: "getAllElections",
            outputs: [
                {
                    internalType: "uint256[]",
                    name: "",
                    type: "uint256[]",
                },
                {
                    internalType: "string[]",
                    name: "",
                    type: "string[]",
                },
                {
                    internalType: "uint256[]",
                    name: "",
                    type: "uint256[]",
                },
                {
                    internalType: "uint256[]",
                    name: "",
                    type: "uint256[]",
                },
            ],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [
                {
                    internalType: "uint256",
                    name: "_electionId",
                    type: "uint256",
                },
            ],
            name: "getAllPositions",
            outputs: [
                {
                    internalType: "uint256[]",
                    name: "",
                    type: "uint256[]",
                },
                {
                    internalType: "string[]",
                    name: "",
                    type: "string[]",
                },
                {
                    internalType: "string[]",
                    name: "",
                    type: "string[]",
                },
            ],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [
                {
                    internalType: "uint256",
                    name: "_electionId",
                    type: "uint256",
                },
            ],
            name: "getElectionDetails",
            outputs: [
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
                {
                    internalType: "uint256",
                    name: "",
                    type: "uint256",
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
                    name: "_positionId",
                    type: "uint256",
                },
                {
                    internalType: "uint256",
                    name: "_electionId",
                    type: "uint256",
                },
            ],
            name: "getPosition",
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
                    internalType: "string",
                    name: "",
                    type: "string",
                },
            ],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "isElectionActive",
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
            inputs: [],
            name: "startElection",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
    ],
};

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
                {
                    internalType: "address",
                    name: "_electionAddress",
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
                    indexed: false,
                    internalType: "uint256",
                    name: "id",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "string",
                    name: "full_name",
                    type: "string",
                },
                {
                    indexed: false,
                    internalType: "string",
                    name: "party",
                    type: "string",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "vote_count",
                    type: "uint256",
                },
            ],
            name: "CandidateResultsEvent",
            type: "event",
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
            inputs: [],
            name: "election",
            outputs: [
                {
                    internalType: "contract Election",
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
                    name: "_position_id",
                    type: "uint256",
                },
            ],
            name: "getCandidatesForPosition",
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
                            name: "full_names",
                            type: "string",
                        },
                        {
                            internalType: "string",
                            name: "date_of_birth",
                            type: "string",
                        },
                        {
                            internalType: "string",
                            name: "cid",
                            type: "string",
                        },
                        {
                            internalType: "string",
                            name: "party",
                            type: "string",
                        },
                        {
                            internalType: "uint256",
                            name: "position_id",
                            type: "uint256",
                        },
                    ],
                    internalType: "struct Candidate[]",
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
                    name: "_position_id",
                    type: "uint256",
                },
            ],
            name: "getResultsByPosition",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [
                {
                    internalType: "uint256",
                    name: "_candidate_id",
                    type: "uint256",
                },
                {
                    internalType: "uint256",
                    name: "_position_id",
                    type: "uint256",
                },
                {
                    internalType: "uint256",
                    name: "_election_id",
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
    ]
};
