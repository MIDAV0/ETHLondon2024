export type createUser = {
  name: string;
  description: string;
  tokenName: string;
  tokenSymbol: string;
  numberOfShares: number;
  stakingAmount: number;
};

export type buttonConfig = {
  taskId: number;
  contractAddress: string;
};
