const vaultABI = [
	{
		type: "function",
		name: "stake",
		inputs: [
			{
				name: "amount",
				type: "uint256",
				internalType: "uint256",
			},
		],
		outputs: [],
		stateMutability: "nonpayable",
	},
];

module.exports = vaultABI;
