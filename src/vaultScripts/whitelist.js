require("colors");
const { program } = require("commander");
const { JsonRpcProvider, Wallet, Contract } = require("ethers");
const { RPC_URL, contracts, pkeys } = require("../../constants");
const { furVaultCA } = contracts;
const { abi } = require("../../artifacts/contracts/FurVault.sol/FurVault.json");

const provider = new JsonRpcProvider(RPC_URL);
const wallet = new Wallet(process.env.MAESTRO_PKEY, provider);
const furVault = new Contract(furVaultCA, abi, wallet);

program
	.description("WHITELIST SCRIPT!")
	.version("1.0.0")
	.option("-A,--add <address>", "wallet address to add")
	.option("-C,--check <address>", "wallet address to check");

program.parse(process.argv);
const options = program.opts();

const addWhitelist = async (walletToBeWhitelisted) => {
	if (!walletToBeWhitelisted)
		return console.log("WALLET TO BE WHITELIST INVALID".red);

	console.log(`Adding wallet to whitelist ... `);

	const isOwner = await furVault.owner();
	if (wallet.address !== isOwner)
		return console.log(
			` THE CONNECTED PRIVATE KEY MUST BE THAT OF THE CONTRACT OWNER!`.red
		);
	const isWhitelisted = await furVault.whitelist(walletToBeWhitelisted);
	if (isWhitelisted)
		return console.log(
			`${walletToBeWhitelisted} is already on the whitelist!`.red
		);
	try {
		const whitelisted = await furVault.addToWhitelist(walletToBeWhitelisted);
		await whitelisted.wait();

		console.log(`Added ${walletToBeWhitelisted} Successfully!`.green);
	} catch (error) {
		console.error(`${error}`.red);
	}
};

const checkWhitelist = async (walletToBeWhitelisted) => {
	if (!walletToBeWhitelisted)
		return console.log("WALLET TO BE WHITELIST INVALID".red);

	console.log(`checking for whitelist ... `);

	try {
		const whitelisted = await furVault.whitelist(walletToBeWhitelisted);

		if (!whitelisted)
			return console.log(`${walletToBeWhitelisted} is not on whitelist`.red);
		console.log(`${walletToBeWhitelisted} is whitelisted !!!`.green);
	} catch (error) {
		console.error(`${error}`.red);
	}
};

if (options.add) {
	addWhitelist(options.add);
} else if (options.check) {
	checkWhitelist(options.check);
}
