import { ethers } from "ethers";
import dotenv from "dotenv";
import express from "express";
import {
    provider,
    candidate_manager_contract,
    voting_contract,
} from "../config/Container.js";

dotenv.config();

const getUserSigner = (privatKey) => {
    const wallet = new ethers.Wallet(privatKey, provider);
    return wallet;
};

const createBlockchainRouter = (io) => {
    const router = express.Router();

    router.get("/welcome", (req, res) => {
        res.send("Welcome to the blockchain route");
    });
    router.get("/signer", (req, res) => {
        const signer = getUserSigner(req.body.pk);
        res.send(signer);
    });
    router.post("/add-candidate", (req, res) => {
        const { name, pk } = req.body;
        console.log("Data from request");
        console.log(req.body);
        let signer = getUserSigner(pk);
        console.log("Adding candidate ....");
        candidate_manager_contract
            .connect(signer)
            .addCandidate(name)
            .then((tx) => {
                console.log("Candidate added successfully");
                res.send(tx);
            })
            .catch((error) => {
                console.error(
                    "An error occurred when trying to add a candidate"
                );
                console.error(error);
                res.status(500).send(
                    "An error occurred when trying to add a candidate"
                );
            });
    });
    router.get("/get-candidates", (req, res) => {
        console.log("Signer:", signer);
        console.log("Getting candidates ....");
        const { pk } = req.body;
        const signer = getUserSigner(pk);
        candidate_manager_contract
            .connect(signer)
            .getAllCandidates()
            .then((candidates) => {
                console.log("Candidates:", candidates);
                const candidatesJSON = candidates.map((candidate) => ({
                    id: candidate.id.toString(),
                    name: candidate.name,
                }));

                res.status(200).json(candidatesJSON);
            })
            .catch((error) => {
                console.error(
                    "An error occurred when trying to get candidates"
                );
                console.error(error);
                res.status(500).send(
                    "An error occurred when trying to get candidates"
                );
            });
    });

    router.post("/vote", (req, res) => {
        const { candidateId, pk } = req.body;
        console.log("Data from request");
        console.log(req.body);
        let signer = getUserSigner(pk);
        console.log("Voting ....");
        voting_contract
            .connect(signer)
            .vote(candidateId)
            .then((tx) => {
                console.log("Voted successfully");
                res.send(tx.wait());
            })
            .catch((error) => {
                console.error("An error occurred when trying to vote");
                console.error(error);
                res.status(500).send("An error occurred when trying to vote");
            });
    });

    voting_contract.on("Voted", (voter, candidateId) => {
        console.log("Voter:", voter);
        console.log("CandidateId:", candidateId);
        io.emit("vote_update", { voter, candidateId });
    })

    return router
};

export default createBlockchainRouter;
