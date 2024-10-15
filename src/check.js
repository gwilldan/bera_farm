const { JsonRpcProvider, Wallet, formatEther } = require("ethers");
require("dotenv").config();

// CONSTANT AND UTILS IMPORTS ----
const { RPC_URL, contracts, pkeys } = require("../constants");
const { honeyCA, honeyWberaLpCA } = contracts;
const { checkBalance } = require("./utils");

const provider = new JsonRpcProvider(RPC_URL);

const checkBal = (_wallet) =>
	new Promise(async () => {
		const wallet = new Wallet(_wallet[1], provider);
		const beraBal = await provider.getBalance(wallet.address);
		const honeyBal = await checkBalance(honeyCA, wallet);
		const honeyWberaLpBal = await checkBalance(honeyWberaLpCA, wallet);

		console.log(
			` WALLET -- ${_wallet[0]} ---- honey ${Number(
				formatEther(beraBal)
			).toFixed(3)} BERA -- ${Number(formatEther(honeyBal)).toFixed(
				3
			)} HONEY -- ${Number(formatEther(honeyWberaLpBal)).toFixed(
				3
			)} HONEYWBERA_LP `
		);
	});

const checkAllBal = async () => {
	const wallets = Object.entries(pkeys);

	await Promise.allSettled(wallets.map((_wallet) => checkBal(_wallet)));
};

checkAllBal();
