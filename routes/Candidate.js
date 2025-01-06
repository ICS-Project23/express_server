/*
 * Candidate Manager Contract Routes
 */

import express from "express"
import { candidate_manager_contract, getUserSigner } from "../config/Container.js";
import redis_client from "../config/Redis.js";

const router = express.Router();


router.post("/", (req, res) => {
    const { full_name, dob, cid, party, position_id } = req.body;
    const pk = req.cookies.pk;
    console.log("Data from request", req.body);
    if (!full_name || !dob || !cid || !party || !position_id) {
        console.error("Missing required parameters in request body");
        return res
            .status(400)
            .send({message: "Missing required parameters in request body"});
    }

    let signer;
    try {
        signer = getUserSigner(pk);
    } catch (error) {
        console.error("Error getting signer:", error);
        return res.status(500).send("Error getting signer");
    }

    try {
        console.log("Adding candidate ....");
        candidate_manager_contract
            .connect(signer)
            .addCandidate(full_name, dob, cid, party, position_id)
            .then((tx) => {
                console.log("Candidate added successfully");
                return res
                    .status(200)
                    .send({ message: "Candidate added successfully" });
            })
            .catch((error) => {
                console.error(
                    "An error occurred when trying to add a candidate"
                );
                console.error(error);
                return res.status(500).send({
                    message: "An error occurred when trying to add a candidate",
                    details: error.shortMessage,
                });
            });
    } catch (error) {
        console.error("Unexpected error:", error);
        return res.status(500).send({
            message: "Unexpected error occurred",
            details: error.message,
        });
    }
});

router.get("/", (req, res) => {
    // console.log("Signer:", signer);
    console.log("Getting candidates ....");
    const pk = req.cookies.pk;
    const signer = getUserSigner(pk);
    candidate_manager_contract
        .connect(signer)
        .getAllCandidates()
        .then((candidates) => {
            console.log("Candidates:");
            console.log(candidates);
            const candidatesJSON = candidates.map((candidate) => ({
                id: candidate[0].toString(),
                name: candidate[1],
                dob: candidate[2],
                cid: candidate[3],
                party: candidate[4],
                position_id: candidate[5].toString(),
            }));
            redis_client
                .set("candidates", JSON.stringify(candidatesJSON))
                .then((result) => {
                    console.log("Candidates cached successfully");
                });

            return res.status(200).send(candidatesJSON);
        })
        .catch((error) => {
            console.error("An error occurred when trying to get candidates");
            console.error(error);
            res.status(500).send(
                "An error occurred when trying to get candidates",
                error.shortMessage
            );
        });
});
router.get("/:id", (req, res) => {
    redis_client.get("electionDetails").then((electionDetails) => {
        if (electionDetails) {
            console.log("Cache hit");
            const election = JSON.parse(electionDetails);
            const { id } = req.params;
            const pk = req.cookies.pk;
            const signer = getUserSigner(pk);
            console.log("Getting candidate ....");
            candidate_manager_contract
                .connect(signer)
                .getCandidate(id, election.id)
                .then((candidate) => {
                    console.log("Candidate:");
                    console.log(candidate);
                    const candidateJSON = {
                        id: candidate[0].toString(),
                        name: candidate[1],
                        dob: candidate[4],
                        cid: candidate[3],
                        party: candidate[2],
                        position: candidate[5],
                        position_description: candidate[6],
                    };
                    return res.status(200).send(candidateJSON);
                })
                .catch((error) => {
                    console.error(
                        "An error occurred when trying to get the candidate"
                    );
                    console.error(error);
                    return res
                        .status(500)
                        .send(
                            "An error occurred when trying to get the candidate",
                            error.shortMessage
                        );
                });
        }
    });
});
router.get("/position/:id", (req, res) => {
    const { id } = req.params;
    const pk = req.cookies.pk;
    const signer = getUserSigner(pk);
    console.log("Getting candidates by position ....");
    redis_client.get("candidates").then((candidates) => {
        console.log("Cached candidates");
        console.log(candidates);
        if (candidates != null) {
            console.log("Cache hit");
            let result = JSON.parse(candidates).filter(
                (candidate) => candidate.position_id === id
            );
            return res.status(200).send(result);
        } else {
            console.log("Cache miss");
            candidate_manager_contract
                .connect(signer)
                .getCandidatesForPosition(id)
                .then((candidates) => {
                    console.log("Candidates:");
                    console.log(candidates);
                    const candidatesJSON = candidates.map((candidate) => ({
                        id: candidate[0].toString(),
                        name: candidate[1],
                        dob: candidate[2],
                        cid: candidate[3],
                        party: candidate[4],
                        electionId: candidate[5].toString(),
                    }));
                    return res.status(200).send(candidatesJSON);
                })
                .catch((error) => {
                    console.error(
                        "An error occurred when trying to get candidates by position"
                    );
                    console.error(error);
                    return res
                        .status(500)
                        .send(
                            "An error occurred when trying to get candidates by position",
                            error.shortMessage
                        );
                });
        }
    });
});

export {router as CandidateRouter}