// witnessCalculatorWrapper.js
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const witnessCalculator = require("./witness_calculator.cjs");

export default witnessCalculator;
