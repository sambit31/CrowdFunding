export const CONTRACT_ABI=[
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "_target",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "_deadline",
					"type": "uint256"
				}
			],
			"stateMutability": "nonpayable",
			"type": "constructor"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "address",
					"name": "contributor",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "ContributionReceived",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "requestId",
					"type": "uint256"
				},
				{
					"indexed": false,
					"internalType": "address",
					"name": "recipient",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "value",
					"type": "uint256"
				}
			],
			"name": "PaymentExecuted",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "address",
					"name": "contributor",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "RefundIssued",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "requestId",
					"type": "uint256"
				},
				{
					"indexed": false,
					"internalType": "string",
					"name": "description",
					"type": "string"
				},
				{
					"indexed": false,
					"internalType": "address",
					"name": "recipient",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "value",
					"type": "uint256"
				}
			],
			"name": "RequestCreated",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "requestId",
					"type": "uint256"
				},
				{
					"indexed": false,
					"internalType": "address",
					"name": "voter",
					"type": "address"
				}
			],
			"name": "VoteCast",
			"type": "event"
		},
		{
			"inputs": [],
			"name": "contribution",
			"outputs": [],
			"stateMutability": "payable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"name": "contributors",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "string",
					"name": "_description",
					"type": "string"
				},
				{
					"internalType": "address payable",
					"name": "_recipient",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "_value",
					"type": "uint256"
				}
			],
			"name": "createRequests",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "deadline",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "getContractBalance",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "_requestNo",
					"type": "uint256"
				}
			],
			"name": "makePayment",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "manager",
			"outputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "minimumContribution",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "noOfContributors",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "numRequests",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "raisedAmount",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "refund",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"name": "requests",
			"outputs": [
				{
					"internalType": "string",
					"name": "description",
					"type": "string"
				},
				{
					"internalType": "address payable",
					"name": "recipient",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "value",
					"type": "uint256"
				},
				{
					"internalType": "bool",
					"name": "completed",
					"type": "bool"
				},
				{
					"internalType": "uint256",
					"name": "noofVoters",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "target",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "_requestNo",
					"type": "uint256"
				}
			],
			"name": "voteRequest",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		}
];
