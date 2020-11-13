import { Connection,
    Transaction,
    PublicKey,
    TransactionInstruction,
    Account,
    SystemProgram} from "@solana/web3.js"
import {Token, AccountLayout, u64} from '@solana/spl-token'
import {connection} from './connection'
import {swapInstruction, 
    SWAP_PROGRAM,
    TokenSwapLayout,
    SWAP_HOST_FEE_ADDRESS,
    WRAPPED_SOL_MINT,
    TOKEN_PROGRAM,
    TokenSwapLayoutLegacyV0} from "./token"

import {cache} from "./cache"


// export class PoolInfo {
//     pubkeys: {
//       program: PublicKey;
//       account: PublicKey;
//       holdingAccounts: PublicKey[];
//       holdingMints: PublicKey[];
//       mint: PublicKey;
//       feeAccount?: PublicKey;
//     };
//     legacy: boolean;
//     raw: any;
//   }
// }

function toPoolInfo(item , program  ) {
    const mint = new PublicKey(item.data.tokenPool);
    return {
      pubkeys: {
        account: item.pubkey,
        program: program,
        mint,
        holdingMints: []  ,
        holdingAccounts: [item.data.tokenAccountA, item.data.tokenAccountB].map(
          (a) => new PublicKey(a)
        ),
      },
      legacy: false,
      raw: item,
    } ;
}

function getHoldings(connection, accounts) {
    return accounts.map((acc) =>
      cache.getAccount(connection, new PublicKey(acc))
    );
}

// export class SwapAccountInfo {
//     amount
//     mint

// }

export class SwapService {
    constructor() {
        this._pools = []
    }

    async calculateDependentAmount(independent, amount, pool) {
      console.log("calculateDependentAmount pool:", pool, "pool.mint:", pool.pubkeys.mint.toBase58())
      const poolMint = await cache.getMint(connection.connection, pool.pubkeys.mint);
      const accountA = await cache.getAccount(
        connection.connection,
        pool.pubkeys.holdingAccounts[0]
      );
      const accountB = await cache.getAccount(
        connection.connection,
        pool.pubkeys.holdingAccounts[1]
      );
      if (!poolMint.mintAuthority) {
        throw new Error("Mint doesnt have authority");
      }
    
      if (poolMint.supply.eqn(0)) {
        return;
      }
    
      const mintA = await cache.getMint(connection.connection, accountA.info.mint);
      const mintB = await cache.getMint(connection.connection, accountB.info.mint);
    
      if (!mintA || !mintB) {
        return;
      }
    
      const isFirstIndependent = accountA.info.mint.toBase58() === independent;
      const depPrecision = Math.pow(
        10,
        isFirstIndependent ? mintB.decimals : mintA.decimals
      );
      const indPrecision = Math.pow(
        10,
        isFirstIndependent ? mintA.decimals : mintB.decimals
      );
      const adjAmount = amount * indPrecision;
    
      const dependentTokenAmount = isFirstIndependent
        ? (accountB.info.amount.toNumber() / accountA.info.amount.toNumber()) *
          adjAmount
        : (accountA.info.amount.toNumber() / accountB.info.amount.toNumber()) *
          adjAmount;
    
      return dependentTokenAmount / depPrecision;
    }

    async doSwap(accountA, accountB, slippage, account) {
        console.log("account A:", accountA)
        console.log("account B:", accountB)
        const amountIn = accountA.amount
        const minAmountOut = accountB.amount * (1 - slippage);
        const holdingA = new PublicKey(accountA.holding)
        const holdingB = new PublicKey(accountB.holding)

        const pool= await this.poolForBasket([accountA.mint, accountB.mint])
        const poolMint = await cache.getMint(connection.connection, pool.pubkeys.mint);
        if (!poolMint.mintAuthority || !pool.pubkeys.feeAccount) {
            throw new Error("Mint doesnt have authority");
          }
        const authority = poolMint.mintAuthority;

        const instructions= []
        const cleanupInstructions = []
        const signers =  []


        const accountRentExempt = await connection.connection.getMinimumBalanceForRentExemption(
            AccountLayout.span
        );
      
        console.log("befrome from:",instructions)
        const fromAccount =this.getWrappedAccount(
            instructions,
            cleanupInstructions,
            accountA.tokenAccount,
            account.publicKey,
            amountIn + accountRentExempt,
            signers
          );
        
        console.log("befrome to:",instructions)
        let toAccount = this.findOrCreateAccountByMint(
          account.publicKey,
          account.publicKey,
          instructions,
          cleanupInstructions,
          accountRentExempt,
          new PublicKey(accountB.mint),
          signers
        );
        console.log('findOrCreateAccountByMint toAccount:', toAccount.toBase58(), ":", toAccount)


        console.log("befrome createApproveInstruction:",instructions)
        // create approval for transfer transactions
        instructions.push(
            Token.createApproveInstruction(
                new PublicKey(TOKEN_PROGRAM),
            fromAccount,
            authority,
            account.publicKey,
            [],
            amountIn
            )
        )


        // let hostFeeAccount =  this.findOrCreateAccountByMint(
        //     account.publicKey,
        //     new PublicKey(SWAP_HOST_FEE_ADDRESS),
        //     instructions,
        //     cleanupInstructions,
        //     accountRentExempt,
        //     pool.pubkeys.mint,
        //     signers
        // );
        let hostFeeAccount = undefined
        
        console.log("instruyctions :", instructions)
        console.log("programIds().token:", TOKEN_PROGRAM)
        console.log("fromAccount:", fromAccount.toBase58())
        console.log("toAccount:",toAccount.toBase58())
        console.log("authority:", authority.toBase58())
        console.log("wallet.publickey:", account.publicKey.toBase58())
        console.log("amountIn:", amountIn)

        // swap
        instructions.push(
            swapInstruction(
                pool.pubkeys.account,
                authority,
                fromAccount,
                holdingA,
                holdingB,
                toAccount,
                pool.pubkeys.mint,
                pool.pubkeys.feeAccount,
                pool.pubkeys.program,
                new PublicKey(TOKEN_PROGRAM),
                amountIn,
                minAmountOut,
                hostFeeAccount
            )
        );
        
        console.log("cleanupInstructions:", cleanupInstructions)
        let trx= new Transaction()
        for (const trxi of instructions.concat(cleanupInstructions)) {
            trx.add(trxi)
        }
        console.log("instructions:", instructions)
        //signers.push(account)
        let ss= [account, ...signers]
        console.log("singers:", ss)
        let options = {
          skipPreflight: true,
          commitment: "singleGossip",
        }
        return connection.connection.sendTransaction(trx, ss, options)
    }



    getWrappedAccount(
        instructions,
        cleanupInstructions,
        toCheck, 
        payer,
        amount,
        signers
    ) {
      console.log("payer:", payer.toBase58())
        if (!toCheck.info.isNative) {
          console.log("not Natvie:", toCheck)
          return toCheck.pubkey;
        }
        console.log("create a new account:", toCheck)
        const account = new Account();
        instructions.push(
          SystemProgram.createAccount({
            fromPubkey: payer,
            newAccountPubkey: account.publicKey,
            lamports: amount,
            space: AccountLayout.span,
            programId: new PublicKey(TOKEN_PROGRAM),
          })
        );
      
        instructions.push(
          Token.createInitAccountInstruction(
            new PublicKey(TOKEN_PROGRAM),
            new PublicKey(WRAPPED_SOL_MINT),
            account.publicKey,
            payer
          )
        );
      
        cleanupInstructions.push(
          Token.createCloseAccountInstruction(
            new PublicKey(TOKEN_PROGRAM),
            account.publicKey,
            payer,
            payer,
            []
          )
        );
      
        signers.push(account);
      
        return account.publicKey;
    }

    findOrCreateAccountByMint(
        payer,
        owner,
        instructions,
        cleanupInstructions,
        accountRentExempt,
        mint, // use to identify same type
        signers,
        excluded
      ){
          console.log("signers:", excluded)
        const accountToFind = mint.toBase58();
        console.log('accountToFind:',accountToFind," :", mint)
        console.log('owner:', owner)
        const account = cache.getCachedAccount(
          (acc) =>
            acc.info.mint.toBase58() === accountToFind &&
            acc.info.owner.toBase58() === owner.toBase58() &&
            (excluded === undefined || !excluded.has(acc.pubkey.toBase58()))
        );
        console.log("cache.getCachedAccount:", account)
        const isWrappedSol = accountToFind === WRAPPED_SOL_MINT;
      
        let toAccount= null;
        if (account && !isWrappedSol) {
          toAccount = account.pubkey;
          console.log("toAccount:", account.pubkey.toBase58()," is existed")
        } else {
          // creating depositor pool account
          console.log("create a new toAccount")
          const newToAccount = this.createSplAccount(
            instructions,
            payer,
            accountRentExempt,
            mint,
            owner,
            AccountLayout.span
          );
      
          toAccount = newToAccount.publicKey;
          signers.push(newToAccount);
      
          if (isWrappedSol) {
            console.log("add close account")
            cleanupInstructions.push(
              Token.createCloseAccountInstruction(
                new PublicKey(TOKEN_PROGRAM),
                toAccount,
                payer,
                payer,
                []
              )
            );
          }
        }
      
        return toAccount;
    }

    createSplAccount(
        instructions,
        payer,
        accountRentExempt,
        mint,
        owner,
        space
      ) {
        const account = new Account();
        instructions.push(
          SystemProgram.createAccount({
            fromPubkey: payer,
            newAccountPubkey: account.publicKey,
            lamports: accountRentExempt,
            space,
            programId: new PublicKey(TOKEN_PROGRAM),
          })
        );
      
        instructions.push(
          Token.createInitAccountInstruction(
            new PublicKey(TOKEN_PROGRAM),
            mint,
            account.publicKey,
            owner
          )
        );
      
        return account;
    }

    // Get all swap pools 
    async updatePools() {
        let poolsArray = [];
        const isLegacy = false;
        const accounts = await connection.connection.getProgramAccounts(new PublicKey(SWAP_PROGRAM))
        accounts.filter(
            (item) =>
              item.account.data.length === TokenSwapLayout.span ||
              item.account.data.length === TokenSwapLayoutLegacyV0.span
        ).map((item) => {
            let result = {
                data: null,
                account: item.account,
                pubkey: item.pubkey,
                init: async () => {},
            };

            result.data = TokenSwapLayout.decode(item.account.data);
            let pool = toPoolInfo(result, new PublicKey(SWAP_PROGRAM));
            pool.legacy = isLegacy;
            pool.pubkeys.feeAccount = new PublicKey(result.data.feeAccount);
            pool.pubkeys.holdingMints = [
                new PublicKey(result.data.mintA),
                new PublicKey(result.data.mintB),
            ] ;
            //console.log("pool is ", pool.pubkeys.holdingMints[0].toBase58(),pool.pubkeys.holdingMints[1].toBase58())
            poolsArray.push(pool);

        });
        this._pools = poolsArray;
        return poolsArray;
    }

    async poolForBasket (mints) {
        const sortedMints = [...mints].sort();

        let matchingPool = this._pools
            .filter((p) => !p.legacy)
            .filter((p) =>
            p.pubkeys.holdingMints
                .map((a) => a.toBase58())
                .sort()
                .every((address, i) => address === sortedMints[i])
            );
    
        for (let i = 0; i < matchingPool.length; i++) {
            const p = matchingPool[i];
    
            const account = await cache.getAccount(
              connection.connection,
              p.pubkeys.holdingAccounts[0]
            );
    
            if (!account.info.amount.eqn(0)) {
                return p;
            }
        }

        return null;
    }

}

export const swap= new SwapService()

