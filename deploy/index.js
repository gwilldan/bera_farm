const { JsonRpcProvider, ContractFactory, Wallet } = require("ethers");
const { RPC_URL, pkeys } = require("../constants");
const { maestro } = pkeys;
const {
	abi,
	bytecode,
} = require("../artifacts/contracts/FurVault.sol/FurVault.json");

const provider = new JsonRpcProvider(RPC_URL);
const controlWallet = new Wallet(maestro, provider);

const deploy = async () => {
	const factory = new ContractFactory(abi, bytecode, controlWallet);
	const contract = await factory.deploy(
		"0x9317D62cc3B23c06098B6a929Db044dee769c49D"
	);

	await contract.waitForDeployment();

	console.log(`Contract deployed to ${await contract.getAddress()}`);
};

deploy();
