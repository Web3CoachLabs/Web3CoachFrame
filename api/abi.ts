export const abi = [
  {
    inputs: [
      {
        internalType: "contract IERC20",
        name: "_donateToken",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_donateAmount",
        type: "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_fid",
        "type": "uint256"
      },
      {
        internalType: "string",
        name: "_memo",
        type: "string"
      }
    ],
    name: "donate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }, {
    inputs: [
      {
        "internalType": "uint256",
        "name": "_fid",
        "type": "uint256"
      },
    ],
    name: "supervise",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_memo",
        type: "string"
      },
      {
        internalType: "string",
        name: "_detailURL",
        type: "string"
      }
    ],
    name: "checkIn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256"
      }
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_ownerFid",
        type: "uint256"
      },
      {
        internalType: "string",
        name: "_trainingName",
        type: "string"
      },
      {
        internalType: "string",
        name: "_trainingDesc",
        type: "string"
      }
    ],
    name: "createNewCoach",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "fid",
        type: "uint256"
      },
      {
        internalType: "address[]",
        name: "targetVaults",
        type: "address[]"
      }
    ],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
] as const