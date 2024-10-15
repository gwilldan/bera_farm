require("colors");
const { program } = require("commander");
const { JsonRpcProvider, Wallet, Contract, parseEther } = require("ethers");
const { RPC_URL, contracts, pkeys } = require("../../constants");
const { furVaultCA } = contracts;
const { abi } = require("../../artifacts/contracts/FurVault.sol/FurVault.json");

program
	.option("--address <address>", "Recipient address")
	.option("--amount <amount>", "Amount to be withdrawn");

program.parse(process.argv);
const options = program.opts();

const provider = new JsonRpcProvider(RPC_URL);

const getKey = (_address) => {
	const pkeyArray = Object.values(pkeys);
	const wallet = pkeyArray.find(
		(pkey) => _address === new Wallet(pkey).address
	);
	if (!wallet) return undefined;
	return wallet;
};

const withdraw = async (_address, _amount) => {
	if (!_address || !_amount)
		return console.log(`Invalid address or amount!`.red);

	console.log("initiating withdrawal ... ");

	const pkey = getKey(_address);

	if (!pkey) return console.error(`Private key for wallet not found!`.red);

	const wallet = new Wallet(pkey, provider);
	const furVault = new Contract(furVaultCA, abi, wallet);

	try {
		const isWhitelisted = await furVault.whitelist(_address);
		if (!isWhitelisted)
			return console.log(`${_address} IS NOT ON THE WHITELIST!`.red);

		const withdrawal = await furVault.withdrawETH(parseEther(_amount));
		await withdrawal.wait();

		console.log(
			` Withdrawal of ${_amount} BERA completed to wallet ---- ${_address} -- TX HASH -- ${withdrawal.hash}`
				.green
		);
	} catch (error) {
		console.error(`THERE'S AN ERROR HERE ... ${error}`.red);
	}
};

withdraw(options.address, options.amount);
