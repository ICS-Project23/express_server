/*
    * Election Contract routes
*/

import express from 'express'
import { election_contract, getUserSigner } from '../config/Container.js';
import redis_client from '../config/Redis.js';
import moment from "moment/moment.js";


const router = express.Router()

router.post("/", (req, res) => {
    const { name, start, end, pk } = req.body;
    console.log("Data from request");
    console.log(req.body);
    const start_timestamp = moment(start, "DD MMMM, YYYY").unix();
    console.log("Start time: ", start_timestamp);
    const end_timestamp = moment(end, "DD MMMM, YYYY").unix();
    console.log("End time: ", end_timestamp);
    const signer = getUserSigner(pk);
    console.log("Creating election ....");
    election_contract
        .connect(signer)
        .createElection(name, start_timestamp, end_timestamp)
        .then((tx) => {
            console.log("Election created successfully");
            return res.send(tx);
        })
        .catch((error) => {
            console.error(
                "An error occurred when trying to create an election"
            );
            console.error(error);
            return res
                .status(500)
                .send("An error occurred when trying to create an election");
        });
});
router.get("/", (req, res) => {
    const { pk } = req.body;
    console.log("Getting election ....");
    const signer = getUserSigner(pk);
    election_contract
        .connect(signer)
        .getAllElections()
        .then((election) => {
            console.log("Election:", election);
            const electionJSON = {
                id: election[0][0].toString(),
                name: election[1][0],
                start: moment
                    .unix(Number(election[2][0]))
                    .format("DD MMMM, YYYY"),
                end: moment
                    .unix(Number(election[3][0]))
                    .format("DD MMMM, YYYY"),
            };
            console.log("electionJSON");
            redis_client.set("electionDetails", JSON.stringify(electionJSON));
            return res.status(200).send(electionJSON);
        })
        .catch((error) => {
            console.error("An error occurred when trying to get the election");
            console.error(error);
            return res
                .status(500)
                .send("An error occurred when trying to get the election");
        });
});
router.post("/position/", (req, res) => {
    const { name, description, pk } = req.body;
    redis_client
        .get("electionDetails")
        .then((electionDetails) => {
            if (electionDetails) {
                const election = JSON.parse(electionDetails);
                console.log("Election details from cache");
                console.log(election);
                const signer = getUserSigner(pk);
                console.log("Adding position ....");
                election_contract
                    .connect(signer)
                    .addPosition(name, description, election.id)
                    .then((tx) => {
                        console.log("Position added successfully");
                        return res.send(tx);
                    })
                    .catch((error) => {
                        console.error(
                            "An error occurred when trying to add a position"
                        );
                        console.error(error);
                        return res
                            .status(500)
                            .send(
                                "An error occurred when trying to add a position",
                                error.shortMessage
                            );
                    });
            } else {
                console.log("Election details not found in cache");
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
router.get("/positions", (req, res) => {
    console.log("Getting electiion positions...");
    const { pk } = req.body;
    const signer = getUserSigner(pk);
    redis_client.get("electionDetails").then((electionDetails) => {
        if (electionDetails) {
            console.log("Cache hit");
            const election = JSON.parse(electionDetails);
            election_contract
                .connect(signer)
                .getAllPositions(election.id)
                .then((positions) => {
                    console.log("Positions:");
                    console.log(positions);
                    const positionsJSON = positions[0].map((id, index) => ({
                        id: id.toString(),
                        name: positions[1][index],
                        description: positions[2][index],
                    }));
                    console.log("Positions JSON");
                    console.log(positionsJSON);
                    return res.status(200).send(positionsJSON);
                })
                .catch((error) => {
                    console.error(
                        "An error occurred when trying to get positions"
                    );
                    console.error(error);
                    return res
                        .status(500)
                        .send(
                            "An error occurred when trying to get positions",
                            error.shortMessage
                        );
                });
        } else {
            console.log("Cache miss");
            return res.status(404).send("Election details not found in cache");
        }
    });
});
router.get("/positions/:id", (req, res) => {
    redis_client.get("electionDetails").then((electionDetails) => {
        if (electionDetails) {
            console.log("Cache hit");
            const election = JSON.parse(electionDetails);
            const { id } = req.params;
            const { pk } = req.body;
            const signer = getUserSigner(pk);
            console.log("Getting position ....");
            election_contract
                .connect(signer)
                .getPosition(id, election.id)
                .then((position) => {
                    console.log("Position:");
                    console.log(position);
                    const positionJSON = {
                        id: position[0].toString(),
                        name: position[1],
                        description: position[2],
                    };
                    return res.status(200).send(positionJSON);
                })
                .catch((error) => {
                    console.error(
                        "An error occurred when trying to get the position"
                    );
                    console.error(error);
                    return res
                        .status(500)
                        .send(
                            "An error occurred when trying to get the position",
                            error.shortMessage
                        );
                });
        }
    });
});
router.post("/start", (req, res) => {
    // getElectionStatus()
    //     .then((status) => {
    //         if (status) {
    //             return res.status(400).send("Election has already started");
    //         }
    //     })
    const { pk } = req.body;
    const signer = getUserSigner(pk);
    console.log("Starting election ....");
    election_contract
        .connect(signer)
        .startElection()
        .then((tx) => {
            console.log("Election started successfully");
            return res.send(tx);
        })
        .catch((error) => {
            console.error("An error occurred when trying to start an election");
            console.error(error);
            return res.status(500).send({
                message: "An error occurred when trying to stop an election",
                error: error.shortMessage,
            });
        });
});
router.post("/stop", (req, res) => {
    // getElectionStatus().then((status) => {
    //     if (!status) {
    //         return res.status(400).send("Election has already stoped");
    //     }
    // });
    const { pk } = req.body;
    const signer = getUserSigner(pk);
    console.log("Stopping election ....");
    election_contract
        .connect(signer)
        .endElection()
        .then(async (tx) => {
            console.log("Election stopped successfully");
            return res.send(tx);
        })
        .catch((error) => {
            console.error("An error occurred when trying to stop an election");
            console.error(error);
            return res
                .status(500)
                .send({
                    message:
                        "An error occurred when trying to stop an election",
                    error: error.shortMessage,
                });
        });
});
router.get("/status", (req, res) => {
    console.log("Getting election status ....");
    election_contract
        .isElectionActive()
        .then(async (status) => {
            console.log("Election status:", status);
            redis_client
                .set("electionStatus", status.toString())
                .then((result) => {
                    console.log("election status cached");
                })
                .catch((error) => {
                    console.error(
                        "An error occurred when trying to cache election status"
                    );
                    console.error(error);
                });
            return res.status(200).send(status);
        })
        .catch((error) => {
            console.error(
                "An error occurred when trying to get the election status"
            );
            console.error(error);
            return res.status(500).send({
                message: "An error occurred when trying to stop an election",
                error: error.shortMessage,
            });
        });
});

/*
    * Event Listeners
*/
election_contract.on("ElectionCreated", () => {
    console.log("Election Created");
    redis_client
        .flushAll()
        .then((result) => {
            console.log("cache cleared");
        })
        .catch((error) => {
            console.error("An error occurred when trying to clear cache");
            console.error(error);
        });
    redis_client.set("electionStatus", false);
});
election_contract.on("ElectionStarted", () => {
    console.log("Election Started Event");
    redis_client.set("electionStatus", true);
});
election_contract.on("ElectionEnded", () => {
    console.log("Election Ended");
    redis_client.set("electionStatus", false);
});


export {router as ElectionRouter}