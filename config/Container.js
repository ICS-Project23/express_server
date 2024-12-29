import {ethers} from 'ethers' 
import dotenv from 'dotenv'
import { VotingContractConfig, CandidateManagerConfig } from './Contract.js'

dotenv.config()

export const provider = new ethers.JsonRpcProvider("http://localhost:8545");
export const voting_contract = new ethers.Contract(
    VotingContractConfig.address,
    VotingContractConfig.abi,
    provider
);
export const candidate_manager_contract = new ethers.Contract(
    CandidateManagerConfig.address,
    CandidateManagerConfig.abi,
    provider
);