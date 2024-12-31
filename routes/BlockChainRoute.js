import { ethers } from "ethers";
import dotenv from "dotenv";
import express from "express";
import {
    candidate_manager_contract,
    voting_contract,
    getUserSigner,
} from "../config/Container.js";
import redis_client from "../config/Redis.js";
import io from "../config/SocketIO.js";

dotenv.config();

const router = express.Router();

router.get("/welcome", (req, res) => {
    return res.send("Welcome to the blockchain route");
});
router.get("/signer", (req, res) => {
    const signer = getUserSigner(req.body.pk);
    return res.send(signer);
});

router.get("/clear-cache", (req, res) => {
    redis_client
        .flushAll()
        .then((result) => {
            console.log("Cache cleared successfully");
            return res.send("Cache cleared successfully");
        })
        .catch((error) => {
            console.error("An error occurred when trying to clear cache");
            console.error(error);
            return res
                .status(500)
                .send("An error occurred when trying to clear cache");
        });
});

/*
 * Voting Contract Routes
 */
router.post("/", async (req, res) => {
    const { candidateId, positionId, pk } = req.body;
    console.log("Data from request");
    console.log(req.body);
    let signer = getUserSigner(pk);
    console.log("Voting ....");
    redis_client
        .get("electionDetails")
        .then((electionDetails) => {
            if (electionDetails) {
                console.log("Cache hit");
                const election = JSON.parse(electionDetails);
                voting_contract
                    .connect(signer)
                    .vote(candidateId, positionId, election.id)
                    .then((tx) => {
                        console.log("Voted successfully");
                        return res.status(200).send(tx);
                    })
                    .catch((error) => {
                        console.error("An error occurred when trying to vote");
                        console.error(error);
                        return res.status(500).send(error.shortMessage);
                    });
            } else {
                console.log("Cache miss");
                return res
                    .status(404)
                    .send("Election details not found in cache");
            }
        })
        .catch((error) => {
            console.error(
                "An error occurred when trying to get election details from redis"
            );
            console.error(error);
            return res
                .status(500)
                .send(
                    "An error occurred when trying to get election details from redis"
                );
        });
});
router.get("/results", (req, res) => {
    const { position_id, pk } = req.body;
    console.log("Data from request");
    console.log(req.body);
    let signer = getUserSigner(pk);
    console.log("Getting results ....");
    voting_contract
        .connect(signer)
        .getResultsByPosition(position_id)
        .then((results) => {
            console.log("Results:");
            console.log(results);
            const resultsJSON = results.map((result) => ({
                id: result[0].toString(),
                name: result[1],
                party: result[2],
                voteCount: result[3].toString(),
            }));
            return res.status(200).send(resultsJSON);
        })
        .catch((error) => {
            console.error("An error occurred when trying to get results");
            console.error(error.shortMessage);
            return res.status(500).send(error.shortMessage);
        });
});

/*
 * Event Listeners
 */
voting_contract.on("Voted", (voter, candidateId) => {
    console.log("Voter:", voter);
    console.log("CandidateId:", candidateId);
    io.emit("vote_update", { voter, candidateId });
});
export { router as blockchainRouter };
