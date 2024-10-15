const {
	JsonRpcProvider,
	Wallet,
	Contract,
	parseEther,
	formatEther,
	MaxUint256,
} = require("ethers");

// CONSTANT AND UTILS IMPORTS --------------------------------------
const { RPC_URL, contracts, pkeys } = require("../constants");
const {
	checkApproval,
	handleSwap,
	checkBalance,
	handleAddLiquidity,
	randomAmount,
	randomPoolAmount,
	randomTime,
	previewSwap,
} = require("./utils");
const {
	bexCA,
	honeyCA,
	beraCA,
	crocSwapCA,
	honeyWberaLpCA,
	honeyBeraVaultCA,
	crocQueryCA,
	wberaCA,
} = contracts;

// ABIs IMPORTS ----
const erc20ABI = require("../ABI/erc20ABI");
const vaultABI = require("../ABI/vaultABI");

const provider = new JsonRpcProvider(RPC_URL);

// ----------------------------------------------------------- MAKE SWAP --------------------------
const makeSwap = (_wallet, swapTime) =>
	new Promise((res, rej) => {
		const controlWallet = new Wallet(_wallet[1], provider);
		const honey = new Contract(honeyCA, erc20ABI, controlWallet);

		console.log(
			`WAITING TO MAKE A SWAP ON WALLET --- ${
				_wallet[0]
			} DELAY IS SET TO ${swapTime /
				(60 * 1000)} min(s) ----- time ${new Date()}`
		);

		const timeOut = setTimeout(async () => {
			try {
				pending = false;
				const beraBalance = await provider.getBalance(controlWallet.address);

				const amount = randomAmount(beraBalance);

				const swapVal = parseEther(amount);

				if (beraBalance < swapVal)
					return console.log(
						"INSUFFICIENT SWAP BERA BALANCE ON WALLET - ",
						_wallet[0]
					);

				const swapTx = await handleSwap(
					controlWallet,
					honey,
					beraCA,
					false,
					swapVal
				);

				console.log(
					`------------------- //////////////////////////////////////////////////////// \n \t COMPLETED SWAP FOR  ${
						_wallet[0]
					} ${
						swapTx.hash
					} ----- time ${new Date()} \n------------------- //////////////////////////////////////////////////////// `
				);
				res(swapTx.hash);
				clearTimeout(timeOut);
			} catch (error) {
				console.error(
					"THERE'S A SWAP ERROR ON WALLET ",
					_wallet[0],
					error?.message
				);
				rej(undefined);
			}
		}, swapTime);
	});

// ----------------------------------------------------------- ADD LIQUIDITY --------------------------

const addLiquidity = (_wallet, poolTime) =>
	new Promise((res, rej) => {
		console.log(
			`WAITING TO MAKE ADD LIQUIDITY ON WALLET --- ${
				_wallet[0]
			} DELAY IS SET TO ${poolTime /
				(60 * 1000)} min(s) ----- time ${new Date()}`
		);

		const controlWallet = new Wallet(_wallet[1], provider);
		const honey = new Contract(honeyCA, erc20ABI, controlWallet);

		const timeOut = setTimeout(async () => {
			try {
				const beraBal = await provider.getBalance(controlWallet.address);
				const honeyBal = await honey.balanceOf(controlWallet.address);

				const honeyAllowance = await honey.allowance(
					controlWallet.address,
					crocSwapCA
				);

				const poolAmount = randomPoolAmount(beraBal);
				const parsedPoolAmount = parseEther(poolAmount);

				const { basePredicted, quotePredicted } = await previewSwap(
					controlWallet,
					honeyCA,
					wberaCA,
					parsedPoolAmount,
					honeyBal
				);

				console.log("pool amount is --- ", poolAmount);

				console.log(
					"honey required -- ",
					formatEther(basePredicted),
					"--- honeyBalance ---- ",
					formatEther(honeyBal)
				);
				console.log(
					"bera required -- ",
					formatEther(quotePredicted),
					"--- beraBalance ---- ",
					formatEther(beraBal)
				);

				if (honeyAllowance == 0n || honeyAllowance < honeyBal) {
					const approvalTx = await honey.approve(crocSwapCA, MaxUint256);
					await approvalTx.wait();
				}

				if (basePredicted > honeyBal) {
					const val = BigInt(
						Number(quotePredicted) - Number(quotePredicted) * 0.1
					); //10% of it, to make sure there's bera for gas

					console.log("------------    USE --", formatEther(val));
					const addTX = await handleAddLiquidity(val, controlWallet, _wallet);
					res(addTX.hash);
					clearTimeout(timeOut);
				} else {
					console.log("-------------- USE --- ", poolAmount);
					const addTX = await handleAddLiquidity(
						parsedPoolAmount,
						controlWallet,
						_wallet
					);
					res(addTX.hash);
					clearTimeout(timeOut);
				}
			} catch (error) {
				rej(undefined);
				console.error(error);
			}
		}, poolTime);
	});

// ----------------------------------------------------------- STAKEEEEE--------------------------

const stake = (_wallet, stakeTime) =>
	new Promise((res, rej) => {
		const controlWallet = new Wallet(_wallet[1], provider);

		console.log(
			`WAITING TO MAKE STAKE ON WALLET --- ${
				_wallet[0]
			} DELAY IS SET TO ${stakeTime /
				(60 * 1000)} min(s) ----- time ${new Date()} `
		);

		const honeyBeraLP = new Contract(honeyWberaLpCA, erc20ABI, controlWallet);
		const honeyBeraVault = new Contract(
			honeyBeraVaultCA,
			vaultABI,
			controlWallet
		);

		const timeOut = setTimeout(async () => {
			try {
				const balance = await honeyBeraLP.balanceOf(controlWallet.address);
				const allowance = await honeyBeraLP.allowance(
					controlWallet.address,
					honeyBeraVaultCA
				);

				if (balance == 0n)
					return console.log(
						"INSUFFICIENT LP BALANCE! PROVIDE HONEY-WBERA LIQUIDITY TO GET LP"
					);

				if (allowance == 0n || allowance < balance) {
					const approvalTx = await honeyBeraLP.approve(
						honeyBeraVaultCA,
						MaxUint256
					);
					await approvalTx.wait();
				}
				const stakeTx = await honeyBeraVault.stake(balance);
				await stakeTx.wait();

				console.log(
					`------------------- //////////////////////////////////////////////////////// \n \t STAKE SUCCESSFUL FOR ${
						_wallet[0]
					} ${
						stakeTx.hash
					} ----- time ${new Date()} \n------------------- //////////////////////////////////////////////////////// `
				);
				res(stakeTx.hash);
				clearTimeout(timeOut);
			} catch (error) {
				console.error(
					"THERE'S A STAKING ERROR ON WALLET ",
					_wallet[0],
					error?.message
				);
				rej(undefined);
			}
		}, stakeTime);
	});

const walletArray = Object.entries(pkeys);

const handleOneFarm = async (_wallet) =>
	new Promise(async (res, rej) => {
		const wallet = new Wallet(_wallet[1], provider);

		const repeat = setInterval(async () => {
			try {
				const balance = await provider.getBalance(wallet.address);

				if (balance < parseEther("0.9"))
					return console.log("insufficient balance ---- ", _wallet[0]);

				clearInterval(repeat);
				const { swapTime, addTime, stakeTime } = randomTime();

				// all the farming transactions
				await makeSwap(_wallet, swapTime);
				await addLiquidity(_wallet, addTime);
				await stake(_wallet, stakeTime);

				res("ALL ");

				console.log(
					`------------------- //////////////////////////////////////////////////////// \n ------------------- //////////////////////////////////////////////////////// \n ------------------- //////////////////////////////////////////////////////// \n ------------------- //////////////////////////////////////////////////////// \n \t SUCCESSFULLY COMPLETED ALL TRANSACTIONS FOR ${_wallet[0]} \n------------------- //////////////////////////////////////////////////////// \n------------------- //////////////////////////////////////////////////////// \n------------------- //////////////////////////////////////////////////////// \n\n------------------- //////////////////////////////////////////////////////// `
				);

			} catch (error) {
				console.error(error);
				rej("err");
			}
		}, 1 * 60 * 1000); //every 1 minute
	});

const farmAll = async () => {
	console.log("starting script!");

	await Promise.allSettled(
		walletArray.map((_wallet) => handleOneFarm(_wallet))
	);
};

farmAll();
