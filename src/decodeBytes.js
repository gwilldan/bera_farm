const { Interface } = require("ethers");

const decodeLiquidityByte = () => {
	const abi = [
		{
			type: "function",
			name: "queryPrice",
			inputs: [
				{
					name: "base",
					type: "address",
					internalType: "address",
				},
				{
					name: "quote",
					type: "address",
					internalType: "address",
				},
				{
					name: "poolIdx",
					type: "uint256",
					internalType: "uint256",
				},
			],
			outputs: [
				{
					name: "",
					type: "uint128",
					internalType: "uint128",
				},
			],
			stateMutability: "view",
		},
	];

	const mainIface = new Interface(abi);
	const hex =
		"0xf8c7efa70000000000000000000000000e4aaf1351de4c0264c5c7056ef3777b41bd8e030000000000000000000000007507c1dc16935b82698e4c63f2746a2fcf994df80000000000000000000000000000000000000000000000000000000000008ca0";

	const mainData = mainIface.decodeFunctionData("queryPrice", hex);
	console.log(mainData);
};

decodeLiquidityByte();
