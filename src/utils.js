const { Contract, formatEther, parseEther, AbiCoder } = require("ethers");
const erc20ABI = require("../ABI/erc20ABI");
const abi = require("../ABI/bexABI");
const { contracts } = require("../constants");
const {
	bexCA,
	beraCA,
	honeyCA,
	crocQueryCA,
	crocSwapCA,
	wberaCA,
	honeyWberaLpCA,
} = contracts;
const crocSwapABI = require("../ABI/crocSwapABI");
const crocsQueryABI = require("../ABI/crocQueryABI");

const checkApproval = async (tokenCA, owner, spenderAddress) => {
	const token = new Contract(tokenCA, erc20ABI, owner);
	const allowance = await token.allowance(owner.address, spenderAddress);
	return allowance;
};

const checkBalance = async (tokenCA, owner) => {
	const token = new Contract(tokenCA, erc20ABI, owner);
	const balance = await token.balanceOf(owner.address);
	return balance;
};

const handleSwap = async (owner, base, quote, isBuy, amount) => {
	const BeraCrocMultiSwap = new Contract(bexCA, abi, owner);

	try {
		if (isBuy) {
			const swapTx = await BeraCrocMultiSwap.multiSwap(
				[
					{
						poolIdx: 36000,
						base: base,
						quote: quote,
						isBuy: true,
					},
				],
				amount,
				0n
			);
			await swapTx.wait();
			return swapTx;
		} else {
			const swapTx = await BeraCrocMultiSwap.multiSwap(
				[
					{
						poolIdx: 36000,
						base: base,
						quote: quote,
						isBuy: false,
					},
				],
				amount,
				0n,
				{
					value: amount,
				}
			);
			await swapTx.wait();

			return swapTx;
		}
	} catch (error) {
		console.error(error);
	}
};

const previewSwap = async (owner, base, quote, berabal, honeyBal) => {
	const BeraCrocMultiSwap = new Contract(bexCA, abi, owner);

	try {
		const [, basePredicted] = await BeraCrocMultiSwap.previewMultiSwap(
			[
				{
					poolIdx: 36000,
					base: base,
					quote: quote,
					isBuy: false,
				},
			],
			berabal
		);

		const [, quotePredicted] = await BeraCrocMultiSwap.previewMultiSwap(
			[
				{
					poolIdx: 36000,
					base: base,
					quote: quote,
					isBuy: true,
				},
			],
			honeyBal
		);

		return { basePredicted, quotePredicted };
	} catch (error) {
		console.error(error);
	}
};

const randomAmount = (_balance) => {
	const balance = Number(formatEther(_balance)).toFixed(
		Math.floor(Math.random()) * (4 - 1) + 1
	);
	const randomDP = Math.floor(Math.random() * 5 + 1);

	const higherLimit = (balance / 2) * 0.2 + balance / 2;
	const lowerLimit = balance / 2 - (balance / 2) * 0.2;
	const amount = (
		Math.random() * (higherLimit - lowerLimit) +
		lowerLimit
	).toFixed(randomDP);

	return amount.toString();
};

const randomPoolAmount = (_balance) => {
	const balance = Number(formatEther(_balance)).toFixed(
		Math.floor(Math.random()) * (4 - 1) + 1
	);
	const randomDP = Math.floor(Math.random() * 5 + 1);

	const higherLimit = 0.935 * balance; //93.5% of the balance
	const lowerLimit = 0.82 * balance; //82% of the balance
	const amount = (
		Math.random() * (higherLimit - lowerLimit) +
		lowerLimit
	).toFixed(randomDP);

	return amount.toString();
};

const randomTime = () => {
	const higherLimit = 15 * 1000 * 60; //1 hour
	const lowerLimit = 1 * 1000 * 60; //1 m
	const swapTime = Math.floor(
		Math.random().toFixed(3) * (higherLimit - lowerLimit) + lowerLimit
	); //within 1m to 1hr
	const addTime = Math.floor(
		Math.random().toFixed(3) * (higherLimit - lowerLimit) + lowerLimit
	); //within 1m to 1hr
	const stakeTime = Math.floor(
		Math.random().toFixed(3) * (higherLimit - lowerLimit) + lowerLimit
	); //within 1m to 1hr

	return {
		swapTime,
		addTime,
		stakeTime,
	};
};

const handleAddLiquidity = async (poolAmount, controlWallet, _wallet) => {
	try {
		const crocSwap = new Contract(crocSwapCA, crocSwapABI, controlWallet);
		const crocQuery = new Contract(crocQueryCA, crocsQueryABI, controlWallet);

		const price = await crocQuery.queryPrice(honeyCA, wberaCA, 36000);

		const lower = Number(price) - Number(price) * 0.1; //10% limit lower
		const higher = Number(price) + Number(price) * 0.1; //10% limit higher

		const code = 32n;
		const base = honeyCA;
		const quote = beraCA;
		const poolIdx = 36000n;
		const bidTick = 0n;
		const askTick = 0n;
		const liq = poolAmount;
		const limitLower = BigInt(lower);
		const limitHigher = BigInt(higher);
		const reserveFlags = 0n;
		const lpConduit = honeyWberaLpCA;

		const dataTypes = [
			"uint8",
			"address",
			"address",
			"uint256",
			"int24",
			"int24",
			"uint128",
			"uint128",
			"uint128",
			"uint8",
			"address",
		];
		const encodedData = AbiCoder.defaultAbiCoder().encode(dataTypes, [
			code,
			base,
			quote,
			poolIdx,
			bidTick,
			askTick,
			liq,
			limitLower,
			limitHigher,
			reserveFlags,
			lpConduit,
		]);

		const addTX = await crocSwap.userCmd(128, encodedData, {
			value: liq,
		});
		await addTX.wait();
		console.log(
			`------------------- //////////////////////////////////////////////////////// \n \t LIQUIDITY ADDED FOR ${
				_wallet[0]
			} ${
				addTX.hash
			} ----- time ${new Date()} \n------------------- //////////////////////////////////////////////////////// `
		);
		return addTX;
	} catch (error) {
		console.error(
			"THERE'S AN ADD LIQUIDITY ERROR ON WALLET ",
			_wallet[0],
			error?.message
		);
	}
};

module.exports = {
	checkApproval,
	handleSwap,
	checkBalance,
	randomAmount,
	randomTime,
	randomPoolAmount,
	previewSwap,
	handleAddLiquidity,
};
