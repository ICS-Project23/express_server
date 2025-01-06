/*
    * Election Contract routes
*/

import express from 'express'
import { election_contract, getUserSigner, voting_contract } from '../config/Container.js';
import redis_client from '../config/Redis.js';
import moment from "moment/moment.js";
import io from '../config/SocketIO.js';

const router = express.Router()

router.post("/", (req, res) => {
    const { name, start, end } = req.body;
    const pk = req.cookies.pk;
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
            return res.status(200).send({message: "Election created successfully", tx: tx});
        })
        .catch((error) => {
            console.error(
                "An error occurred when trying to create an election"
            );
            console.error(error);
            return res
                .status(500)
                .send({message: "An error occurred when trying to create an election", error: error.shortMessage});
        });
});
router.get("/", (req, res) => {
    const pk = req.cookies.pk;
    console.log("Getting election ....");
    let elections_list = redis_client.get("elections_list");
    if (elections_list.length > 0) {
        console.log("Cache hit");
        return res.status(200).send(elections_list);
    }
    console.log("Cache miss");
    io.emit("Election List cache expired")
    const signer = getUserSigner(pk);
    election_contract
        .connect(signer)
        .getAllElections()
        .then((elections) => {
            console.log("Election:", elections);
            const electionsJSON = elections[0].map((id, index) => ({
                id: id.toString(),
                name: elections[1][index],
                start: moment
                    .unix(Number(elections[2][index]))
                    .format("DD MMMM, YYYY"),
                end: moment
                    .unix(Number(elections[3][index]))
                    .format("DD MMMM, YYYY"),
            }));
            console.log("electionJSON");
            redis_client.setEx("elections_list", 3600, JSON.stringify(electionsJSON));
            return res.status(200).send(electionsJSON);
        })
        .catch((error) => {
            console.error("An error occurred when trying to get the election");
            console.error(error);
            return res
                .status(500)
                .send({message:"An error occurred when trying to get the election", error: error.shortMessage});
        });
});
let queue = [];
let processing = false;
const processQueue = async () => {
    if (processing) return;
    processing = true;

    while (queue.length > 0) {
        const { name, description, election_id, pk, res } = queue.shift();
        try {
            const signer = getUserSigner(pk);
            const tx = await election_contract
                .connect(signer)
                .addPosition(name, description, election_id);
            console.log(`Position added successfully: ${name}`);

            // Wait for the PositionAdded event before proceeding to the next item
            await new Promise((resolve) => {
                io.once("positionAdded", (event) => {
                    console.log("Position Added Event Received:", event);
                    res.send({
                        message: "Position added successfully",
                    });
                    resolve();
                });
            });
        } catch (error) {
            console.error("An error occurred when trying to add a position");
            console.error(error);
            res.status(500).send({
                message: "An error occurred when trying to add a position",
                error: error.message || error.shortMessage,
            });
        }
    }

    processing = false;
    if (queue.length > 0) {
        // processQueue();
    }
};

router.post("/position/", async (req, res) => {
    const { election_id, positions } = req.body;
    if (!election_id || !positions || !Array.isArray(positions)) {
        return res.status(400).send("Invalid request body");
    }
    let signer;
    try {
        signer = getUserSigner(req.cookies.pk);
    } catch (error) {
        console.error("Error getting signer:", error);
        return res.status(500).send("Error getting signer");
    }
    console.log("Data from request:", req.body);
    console.log("Adding positions ....");
    try {
        for (const position of positions) {
            const { name, description } = position;
            if (!name || !description) {
                return res.status(400).send("Invalid position data");
            }

            console.log("Adding position:", name, description);
            let tx = await election_contract.connect(signer).addPosition(name, description, election_id);
            tx = await tx.wait();
            console.log("Position added successfully:", name);
        }

        console.log("All positions added successfully");
        return res.status(200).send("All positions added successfully");
    } catch (error) {
        console.error("An error occurred when trying to add positions");
        console.error(error);
        return res.status(500).send(error.shortMessage || error.message);
    }
});

router.get("/:election_id/positions/", (req, res) => {
    console.log("Getting electiion positions...");
    const { election_id } = req.params;
    const pk = req.cookies.pk;
    const signer = getUserSigner(pk);
    election_contract
        .connect(signer)
        .getAllPositions(election_id)
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
            console.error("An error occurred when trying to get positions");
            console.error(error);
            return res
                .status(500)
                .send(
                    "An error occurred when trying to get positions",
                    error.shortMessage
                );
        });
    // redis_client.get("electionDetails").then((electionDetails) => {
    //     if (electionDetails) {
    //         console.log("Cache hit");
    //         const election = JSON.parse(electionDetails);
            
    //     } else {
    //         console.log("Cache miss");
    //         return res.status(404).send("Election details not found in cache");
    //     }
    // });
});
router.get("/positions/:id", (req, res) => {
    redis_client.get("electionDetails").then((electionDetails) => {
        if (electionDetails) {
            console.log("Cache hit");
            const election = JSON.parse(electionDetails);
            const { id } = req.params;
            const pk = req.cookies.pk;
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
    const pk = req.cookies.pk;
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
    const pk = req.cookies.pk;
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
    const pk = req.cookies.pk
    const signer = getUserSigner(pk);
    election_contract
        .connect(signer)
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
    console.log("Election Created Event");
    redis_client
        .flushAll()
        .then((result) => {
            console.log("cache cleared");
        })
        .catch((error) => {
            console.error("An error occurred when trying to clear cache");
            console.error(error);
        });
    redis_client.set("electionStatus", "false");
    io.emit("Election Created Event");
});
election_contract.on("ElectionStarted", () => {
    console.log("Election Started Event");
    redis_client.set("electionStatus", "true");
});
election_contract.on("ElectionEnded", () => {
    console.log("Election Ended Event");
    redis_client.set("electionStatus", "false");
});
election_contract.on("PositionAdded", () => {
    clonsole.log("Position Added Event");
    io.emit("positionAdded");
});

export {router as ElectionRouter}