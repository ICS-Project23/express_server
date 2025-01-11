import express from "express";
import bcrypt from "bcrypt";
import {Registered_Voter, Admin} from "../model/User.js";
import Web3 from "web3";
import jwt from "jsonwebtoken";
import {JsonRpcProvider} from "ethers";
import { generateProof } from "../zkp/generateProof.js";
import { verifyProof } from "../zkp/verifyProof.js";
import { generateCommitment, generateChallenge } from "../zkp/zkpUtils.js";
import { wss } from "../config/WebSocket.js";
const web3 = new Web3();
// const provider = new JsonRpcProvider("http://localhost:8545");
// web3.setProvider(provider);

const router = express.Router();

// ZKP

router.post("/zkp/register", (req, res) => {
    const {secretKey } = req.body;
    const commitment = generateCommitment(secretKey);
    console.log("Commitment");
    console.log(commitment);
    return res.status(200).json({"message":"Commitment generated successfully"});
})
router.post("/zkp/login", (req, res) => {
    const {commitment} = req.body
    const challenge = generateChallenge()
    res.status(200).json({challenge})
})
router.post("/zkp/verify", async (req, res) => {
    const {secretKey, challenge} = req.body
    const input = {secretKey, challenge }
    const {proof, publicSignals} = await generateProof(input)
    const isValid = verifyProof(proof, publicSignals)
    if(isValid){
        console.log("Proof is valid")
        res.status(200).json({message: "Proof is valid"})
    } else {
        console.error("Proof is invalid")
        res.status(400).json({message: "Proof is invalid"})
    }
})

// Authentication

router.post("/register", async (req, res) => {
    const {
        first_name,
        surname,
        other_names,
        national_identification_number,
        password,
        role,
    } = req.body;
    console.log("Data from POST request");
    console.log(req.body);
    let user_role;
    user_role = "voter";
    onsole.log("Checking if voter is already registered....");
    let existing_voter = await Registered_Voter.findOne({
        national_identification_number,
    });
    if (existing_voter) {
        console.error("Voter already exists");
        return res.status(400).json({ message: "Voter already exists" });
    }
    const hashed_password = await bcrypt.hash(password, 10);
    const { address, private_key } = await createWallet();
    const new_voter = new Registered_Voter({
        first_name,
        surname,
        other_names,
        national_identification_number,
        password: hashed_password,
        wallet_address: address,
        wallet_private_key: private_key,
        role: user_role,
    });
    console.log("New user");
    console.log(new_voter);
    new_voter.save().then(() => {
        console.log("Voter registration successfull");
        return res
            .status(201)
            .json({ message: "Registration for voting successfull" });
    });
});
router.post("/register/admin", async (req, res) => {
    const {
        user_name,
        password,
    } = req.body;
    console.log("Data from POST request");
    console.log(req.body);
    let user_role;
    user_role = "admin";
    console.log("Checking if admin is already registered....");
    let existing_admin = await Admin.findOne({
        user_name,
    });
    if (existing_admin) {
        console.error("Admin already exists");
        return res.status(400).json({ message: "Admin already exists" });
    }
    const hashed_password = await bcrypt.hash(password, 10);
    const { address, private_key } = await createWallet();
    const new_admin = new Admin({
        user_name,
        password: hashed_password,
        wallet_address: address,
        role: user_role,
    });
    console.log("New admin");
    console.log(new_admin);
    new_admin.save().then(() => {
        console.log("Admin registration successfull");
        return res
            .status(201)
            .json({ message: "Registration for admin successfull" });
    });
})

router.post("/login", async (req, res) => {
    const { national_identification_number, password } = req.body;
    console.log("Data from POST request");
    console.log(req.body);
    console.log("Checking if voter is already registered....");
    let existing_voter = await Registered_Voter.findOne({
        national_identification_number: national_identification_number
    });
    if (!existing_voter) {
        console.error("User does not exist");
        return res.status(400).json({ message: "Voter does not exist" });
    }
    const isPasswordCorrect = await bcrypt.compare(
        password,
        existing_voter.password
    );
    if (!isPasswordCorrect) {
        console.error("Incorrect password");
        return res.status(400).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
        {
            national_identification_number: existing_voter.national_identification_number,
            role: "voter"
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
    res.cookie("token", token, { maxAge: 3600000, httpOnly: true });
    res.cookie("pk", existing_voter.wallet_address);
    console.log("Sendiing login event....");
    wss.clients.forEach((client) => {
        if(client.readyState === WebSocket.OPEN){
            client.send(JSON.stringify({event: "login", data: {national_identification_number}}))
        }
    })
    return res
        .status(200)
        .json({ message: "Login successfull", role: "voter" });
    
});

router.post("/login/admin", async (req, res) => {
    const { user_name, password } = req.body;
    console.log("Data from POST request");
    console.log(req.body);
    console.log("Checking if admin is already registered....");
    let existing_admin = await Admin.findOne({
        user_name,
    });
    if (!existing_admin) {
        console.error("Admin does not exist");
        return res.status(400).json({ message: "Admin does not exist" });
    }
    const isPasswordCorrect = await bcrypt.compare(
        password,
        existing_admin.password
    );
    if (!isPasswordCorrect) {
        console.error("Incorrect password");
        return res.status(400).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
        {
            user_name: existing_admin.user_name,
            role: "admin"
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
    res.cookie("token", token, { maxAge: 3600000, httpOnly: true });
    res.cookie("pk", existing_admin.wallet_address);
    return res.status(200).json({ message: "Login successfull" });
})

router.post("/logout", async (req, res) => {
    res.clearCookie("token");
    res.clearCookie("pk");
    return res.status(200).json({ message: "Logout successfull" });
})

router.get("/user", async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        console.error("Unauthorized access");
        return res.status(401).json({ message: "Unauthorized access" });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (error, user) => {
        if (error) {
            console.error("Unauthorized access");
            return res.status(401).json({ message: "Unauthorized access" });
        }

        let auth_user = null;
        try {
            if (user.role === "voter") {
                auth_user = await Registered_Voter.findOne({
                    national_identification_number:
                        user.national_identification_number,
                });
            } else if (user.role === "admin") {
                auth_user = await Admin.findOne({ user_name: user.user_name });
            }

            if (!auth_user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Remove sensitive information before sending the response
            auth_user.password = undefined;

            console.log("User authenticated");
            return res
                .status(200)
                .json({ message: "User authenticated", user: auth_user });
        } catch (err) {
            console.error(
                "An error occurred when fetching user information",
                err
            );
            return res.status(500).json({ message: "Internal server error" });
        }
    });
});

// JWT verification

router.get("/verify", async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        console.error("Unauthorized access");
        return res.status(401).json({ message: "Unauthorized access" });
    }
    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
        if (error || user.role !== "voter") {
            console.error("Unauthorized access");
            return res.status(401).json({ message: "Unauthorized access" });
        }
        console.log("User authenticated");
        return res.status(200).json({ message: "User authenticated" });
    });
})
router.get("/verify/admin", async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        console.error("Admin Unauthorized access");
        return res.status(401).json({ message: "Unauthorized access" });
    }
    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
        if (error || user.role !== "admin") {
            console.error("Unauthorized access");
            return res.status(401).json({ message: "Unauthorized access" });
        }
        console.log("Admin authenticated");
        return res.status(200).json({ message: "User authenticated" });
    });
});


/*
    * Function to create a metamask wallet for a user
 */
const createWallet = async () => {
    let wallet = web3.eth.accounts.create();
    return {address: wallet.address, private_key: wallet.privateKey };
};

export { router as AuthRouter };
