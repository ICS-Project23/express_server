import express from "express";
import bcrypt from "bcrypt";
import Registered_Voter from "../model/User.js";
import Web3 from "web3";
import jwt from "jsonwebtoken";
import {JsonRpcProvider} from "ethers";

const web3 = new Web3();
// const provider = new JsonRpcProvider("http://localhost:8545");
// web3.setProvider(provider);

const router = express.Router();

router.post("/register", async (req, res) => {
    const {
        first_name,
        surname,
        other_names,
        national_identification_number,
        password,
    } = req.body;
    console.log("Data from POST request");
    console.log(req.body);
    console.log("Checking if voter is already registered....");
    let existing_voter = await Registered_Voter.findOne({
        national_identification_number,
    });
    if (existing_voter) {
        console.error("Voter already exists");
        return res.status(400).json({ message: "Voter already exists" });
    }
    const hashed_password = await bcrypt.hash(password, 10);
    const {address, private_key} = await createWallet();
    const new_voter = new Registered_Voter({
        first_name,
        surname,
        other_names,
        national_identification_number,
        password: hashed_password,
        wallet_address: address,
        wallet_private_key: private_key
    });
    new_voter.save().then(() => {
        console.log("Voter registration successfull");
        return res
            .status(201)
            .json({ message: "Registration for voting successfull" });
    });
});

router.post("/login", async (req, res) => {
    const { national_identification_number, password } = req.body;
    console.log("Data from POST request");
    console.log(req.body);
    console.log("Checking if voter is already registered....");
    let existing_voter = await Registered_Voter.findOne({
        national_identification_number: national_identification_number
    });
    if (!existing_voter) {
        console.error("Voter does not exist");
        return res.status(400).json({ message: "Voter does not exist" });
    }
    const isPasswordCorrect = await bcrypt.compare(password,existing_voter.password);
    if (!isPasswordCorrect) {
        console.error("Incorrect password");
        return res.status(400).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
        {
            national_identification_number:
                existing_voter.national_identification_number,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
    res.cookie("token", token, { maxAge: 3600000, httpOnly: true });
    res.cookie("wallet_address", existing_voter.wallet_address)
    return res.status(200).json({ message: "Login successfull" });
});

router.get("/verify", async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        console.error("Unauthorized access");
        return res.status(401).json({ message: "Unauthorized access" });
    }
    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
        if (error) {
            console.error("Unauthorized access");
            return res.status(401).json({ message: "Unauthorized access" });
        }
        console.log("User authenticated");
        return res.status(200).json({ message: "User authenticated" });
    });
})


/*
    * Function to create a metamask wallet for a user
 */
const createWallet = async () => {
    let wallet = web3.eth.accounts.create();
    return {address: wallet.address, private_key: wallet.privateKey };
};

export { router as AuthRouter };
