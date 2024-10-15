require("dotenv").config();

const RPC_URL = "https://bartio.rpc.berachain.com";

const pkeys = {
	maestro: process.env.MAESTRO_PKEY,
	et2: process.env.ET2_PKEY,
	et3: process.env.ET3_PKEY,
	et4: process.env.ET4_PKEY,
	et5: process.env.ET5_PKEY,
	et10: process.env.ET10_PKEY,
	nat: process.env.NAT_PKEY,
};

// contract addresses
const contracts = {
	furVaultCA: "0xFD94e1427Bd0D141a219E1C4B4F45aA20a9F80fe",
	bexCA: "0x21e2C0AFd058A89FCf7caf3aEA3cB84Ae977B73D",
	crocSwapCA: "0xAB827b1Cc3535A9e549EE387A6E9C3F02F481B49",
	honeyCA: "0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03",
	beraCA: "0x0000000000000000000000000000000000000000",
	wberaCA: "0x7507c1dc16935B82698e4C63f2746A2fCf994dF8",
	honeyBeraVaultCA: "0xAD57d7d39a487C04a44D3522b910421888Fb9C6d",
	honeyWberaLpCA: "0xd28d852cbcc68DCEC922f6d5C7a8185dBaa104B7",
	crocQueryCA: "0x8685CE9Db06D40CBa73e3d09e6868FE476B5dC89",
};

module.exports = {
	RPC_URL,
	contracts,
	pkeys,
};
