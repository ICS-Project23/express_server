import mongoose from "mongoose";

const registeredVoterSchema = new mongoose.Schema({
    first_name: {type: String, required: true},
    surname: {type: String, required: true},
    other_names: {type: String, required: false},
    national_identification_number: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    wallet_address: {type: String, required: true},
    wallet_private_key: {type: String, required: true},
    role: {type: String, required: true}
})

const adminSchema = new mongoose.Schema({
    user_name: {type: String, required: true},
    password: {type: String, required: true},
    wallet_address: {type: String, required: false},
    role: {type: String, required: true}
})

export const Registered_Voter = mongoose.model(
    "Registered_Voter",
    registeredVoterSchema
);
export const Admin = mongoose.model(
    "Admin",
    adminSchema
)