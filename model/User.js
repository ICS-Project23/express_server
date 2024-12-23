import mongoose from "mongoose";

const registeredVoterSchema = new mongoose.Schema({
    first_name: {type: String, required: true},
    surname: {type: String, required: true},
    other_names: {type: String, required: false},
    national_identification_number: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    wallet_address: {type: String, required: true}
})

const Registered_Voter = mongoose.model(
    "Registered_Voter",
    registeredVoterSchema
);
export default Registered_Voter;