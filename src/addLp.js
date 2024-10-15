const { Wallet, formatEther, Contract } = require("ethers");
const { JsonRpcProvider } = require("ethers");
const { pkeys, contracts, RPC_URL } = require("../constants");
const crocSwapABI = require("../ABI/crocSwapABI");
const { maestro } = pkeys;
const { crocSwapCA } = contracts;

const provider = new JsonRpcProvider(RPC_URL);
const controlWallet = new Wallet(maestro, provider);
const crocSwap = new Contract(crocSwapCA, crocSwapABI, controlWallet);

const main = async () => {
	const bal = await provider.getBalance(controlWallet.address);
	console.log(formatEther(bal));

	const res = await crocSwap.wbera();
	console.log(res);
};

main();
