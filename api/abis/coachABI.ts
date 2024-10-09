export const coachABI = [
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
        internalType: "string",
        name: "_memo",
        type: "string"
      }
    ],
    name: "donate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },{
    inputs: [],
    name: "supervise",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
] as const

