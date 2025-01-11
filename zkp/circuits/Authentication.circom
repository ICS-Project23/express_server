pragma circom 2.0.0;

template Authentication() {
    signal input secretKey;
    signal input challenge;
    signal output response;
    response <== secretKey * challenge;
}

component main = Authentication();
