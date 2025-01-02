import {ethers} from 'ethers' 
import dotenv from 'dotenv'
import { VotingContractConfig, CandidateManagerConfig, ElectionConfig } from './Contract.js'

dotenv.config()

const provider = new ethers.JsonRpcProvider("http://localhost:8545");
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
export const election_contract = new ethers.Contract(
    ElectionConfig.address,
    ElectionConfig.abi,
    provider
)
export const getUserSigner = (privatKey) => {
    const wallet = new ethers.Wallet(privatKey, provider);
    return wallet;
};