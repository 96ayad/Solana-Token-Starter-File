import create, { State } from 'zustand';

import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
} from '@solana/web3.js';

interface UserSOLBalanceStore extends State {
  balance: number,
  getUserSOLBalance: (publickey: PublicKey, Connection: Connection) => void;
}

const useUserSOLBalanceStore = create<UserSOLBalanceStore>((set, _get) => ({
  balance: 0,
  getUserSOLBalance: async (publickey, connection) => {
    let balance = 0;

    try {
      balance = await connection.getBalance(publickey, "confirmed");
      balance = balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.log(error);
    }
    set((s) => {
      s.balance = balance;
      console.log("Balance", balance);
    });
  },
}));

export default useUserSOLBalanceStore;