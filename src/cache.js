import { Connection,
    Transaction,
    PublicKey,
    TransactionInstruction,
    SystemProgram} from "@solana/web3.js"
import { AccountLayout, u64, MintInfo, MintLayout } from "@solana/spl-token";
import {connection} from "./connection"
import {swapInstruction, 
    WRAPPED_SOL_MINT,
    TokenSwapLayout,
    TokenSwapLayoutLegacyV0 } from "./token"


// TODO: expose in spl package
export function deserializeMint (data)  {
  if (data.length !== MintLayout.span) {
    throw new Error("Not a valid Mint");
  }

  const mintInfo = MintLayout.decode(data);

  if (mintInfo.mintAuthorityOption === 0) {
    mintInfo.mintAuthority = null;
  } else {
    mintInfo.mintAuthority = new PublicKey(mintInfo.mintAuthority);
  }

  mintInfo.supply = u64.fromBuffer(mintInfo.supply);
  mintInfo.isInitialized = mintInfo.isInitialized !== 0;

  if (mintInfo.freezeAuthorityOption === 0) {
    mintInfo.freezeAuthority = null;
  } else {
    mintInfo.freezeAuthority = new PublicKey(mintInfo.freezeAuthority);
  }

  return mintInfo ;
};

export function deserializeAccount (data)  {
    const accountInfo = AccountLayout.decode(data);
    accountInfo.mint = new PublicKey(accountInfo.mint);
    accountInfo.owner = new PublicKey(accountInfo.owner);
    accountInfo.amount = u64.fromBuffer(accountInfo.amount);
    
    if (accountInfo.delegateOption === 0) {
        accountInfo.delegate = null;
        accountInfo.delegatedAmount = new u64(0);
    } else {
        accountInfo.delegate = new PublicKey(accountInfo.delegate);
        accountInfo.delegatedAmount = u64.fromBuffer(accountInfo.delegatedAmount);
    }
    
    accountInfo.isInitialized = accountInfo.state !== 0;
    accountInfo.isFrozen = accountInfo.state === 2;
    
    if (accountInfo.isNativeOption === 1) {
        accountInfo.rentExemptReserve = u64.fromBuffer(accountInfo.isNative);
        accountInfo.isNative = true;
    } else {
        accountInfo.rentExemptReserve = null;
        accountInfo.isNative = false;
    }
    
    if (accountInfo.closeAuthorityOption === 0) {
        accountInfo.closeAuthority = null;
    } else {
        accountInfo.closeAuthority = new PublicKey(accountInfo.closeAuthority);
    }
    
    return accountInfo;
}

class Cache {

    constructor() {
        this._mintCache = new Map()
        this._pendingAccountCalls = new Map()
        this._accountsCache = new Map()
    }

    async wrapNativeAccount(pubkey) {
      const acc = await connection.connection.getAccountInfo(pubkey)
      console.log("acc:", acc)
      if (!acc) {
        return undefined;
      }
    
      const tacc =  {
        pubkey: pubkey,
        acc,
        info: {
          mint: new PublicKey(WRAPPED_SOL_MINT),
          owner: pubkey,
          amount: new u64(acc.lamports),
          delegate: null,
          delegatedAmount: new u64(0),
          isInitialized: true,
          isFrozen: false,
          isNative: true,
          rentExemptReserve: null,
          closeAuthority: null,
        },
      };
      console.log("tacc:", tacc)
      this._accountsCache.set(pubkey.toBase58(), tacc);
      return tacc;
    }

    async queryAccountInfo(connection, pubKey) {
        const info = await connection.getAccountInfo(pubKey);
        if (info === null) {
          throw new Error("Failed to find mint account");
        }
      
        const buffer = Buffer.from(info.data);
      
        const data = deserializeAccount(buffer);
      
        const details = {
          pubkey: pubKey,
          account: {
            ...info,
          },
          info: data,
        };
      
        return details
    }

    async queryMintInfo(connection, pubKey) {
        const info = await connection.getAccountInfo(pubKey);
        if (info === null) {
          throw new Error("Failed to find mint account");
        }
      
        const data = Buffer.from(info.data);
      
        return deserializeMint(data); 
    }

    async getAccount(connection, pubKey) {
        let id = null
        if (typeof pubKey === "string") {
          id = new PublicKey(pubKey);
        } else {
          id = pubKey;
        }
    
        const address = id.toBase58();
    
        let account = this._accountsCache.get(address);
        if (account) {
          return account;
        }
    
        let query = this._pendingAccountCalls.get(address);
        if (query) {
          return query;
        }
    
        query = this.queryAccountInfo(connection, id).then((data) => {
          this._pendingAccountCalls.delete(address);
          this._accountsCache.set(address, data);
          return data;
        }) ;
        this._pendingAccountCalls.set(address, query );
    
        return query;
    }

    async getMint (connection, pubKey){
        let id = null;
        if (typeof pubKey === "string") {
          id = new PublicKey(pubKey);
        } else {
          id = pubKey;
        }
    
        let mint = this._mintCache.get(id.toBase58());
        if (mint) {
          return mint;
        }
    
        let query = this.queryMintInfo(connection, id);
    
        this._mintCache.set(id.toBase58(), query);
    
        return query;
    }

    getCachedAccount ( predicate ) {
      console.log("_accountsCache",this._accountsCache)
      for (const account of this._accountsCache.values()) {
        if (predicate(account)) {
          return account ;
        }
      }
    };
}

export const cache= new Cache()