const chainSmart = (chain: number) => {
  if (chain === 84532) {
    // base
    return "0xfbeD2EF163dAC5EEbee187051E352Bbee135c8C2";
  } else if (chain === 44787) {
    // celo
    return "0x896a9E2A9769e43E085bFa88DDC477B359E89a0a";
    0x896a9e2a9769e43e085bfa88ddc477b359e89a0a;
  } else if (chain === 421614) {
    // arbitrum
    return "0x3ea06d7b5fe23615d39f8d8d63edb6d717eb9a8a";
  }
  return "Unknown";
};

export default chainSmart;
