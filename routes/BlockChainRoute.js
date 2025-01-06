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

/*
 * Voting Contract Routes
 */
router.post("/", async (req, res) => {
    const { candidateId, positionId, electionId} = req.body;
    const pk = req.cookies.pk;
    console.log("Data from request");
    console.log(req.body);
    let signer = getUserSigner(pk);
    console.log("Voting ....");
    voting_contract
        .connect(signer)
        .vote(candidateId, positionId, electionId)
        .then((tx) => {
            console.log("Voted successfully");
            return res.status(200).send(tx);
        })
        .catch((error) => {
            console.error("An error occurred when trying to vote");
            console.error(error);
            return res.status(500).send(error.shortMessage);
        });
    // redis_client
    //     .get("electionDetails")
    //     .then((electionDetails) => {
    //         if (electionDetails) {
    //             console.log("Cache hit");
    //             const election = JSON.parse(electionDetails);
                
    //         } else {
    //             console.log("Cache miss");
    //             return res
    //                 .status(404)
    //                 .send("Election details not found in cache");
    //         }
    //     })
    //     .catch((error) => {
    //         console.error(
    //             "An error occurred when trying to get election details from redis"
    //         );
    //         console.error(error);
    //         return res
    //             .status(500)
    //             .send(
    //                 "An error occurred when trying to get election details from redis"
    //             );
    //     });
});
router.get("/results", (req, res) => {
    const { position_id } = req.query;
    const pk = req.cookies.pk;
    console.log("Data from request");
    console.log(req.body);
    let signer = getUserSigner(pk);
    console.log("Getting results ....");
    voting_contract
        .connect(signer)
        .getResultsByPosition(position_id)
        .catch((error) => {
            console.error("An error occurred when trying to get results");
            console.error(error.shortMessage || error);
            return res.status(500).send(error.shortMessage);
        });
});

// TODO: Sort out Results function

/*
 * Event Listeners
 */
voting_contract.on("Voted", (voter, candidateId) => {
    console.log("Voter:", voter);
    console.log("CandidateId:", candidateId);
    io.emit("vote_update", { voter, candidateId });
});
voting_contract.on("CandidateResultsEvent", (id, full_name,party, voteCount) => {
    console.log("CandidateResultsEvent");
    console.log("ID:", id);
    console.log("Full Name:", full_name);
    console.log("Party:", party);
    console.log("Vote Count:", voteCount);
    io.emit("results_event", { id, full_name, party, voteCount });
})
export { router as blockchainRouter };
