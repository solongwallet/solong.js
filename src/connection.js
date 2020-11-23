import { Connection,
        Transaction,
        PublicKey,
        SystemProgram,
        Account} from "@solana/web3.js";

import {TOKEN_PROGRAM, TOKEN_NATIVE_MINT} from './token'
import {Token} from '@solana/spl-token'


//const MAIN_NET = 'https://api.mainnet-beta.solana.com'
const MAIN_NET = 'https://solana-api.projectserum.com'

class RPCConnection {
    constructor() {
        this._provider = MAIN_NET
        this._connection = new Connection(MAIN_NET)
    }

    get connection() {
        return this._connection
    }

    get provider() {
        return this._provider
    }

    set provider(URL) {
        console.log("set endpoint to:", URL)
        this._provider = URL
        this._connection = new Connection(URL) 
    }

    async getBalance(publicKey) {
        const lamports = await this._connection.getBalance(publicKey, 'recent')
        return lamports 
    }

    async transfer(source, destination, lamports, account) {
        const params = {
            fromPubkey: source,
            toPubkey: destination,
            lamports: lamports,
        };
        const trx= new Transaction().add(SystemProgram.transfer(params));
        return this._connection.sendTransaction(
            trx, 
            [account],
        )
    }


    async sendTransaction( transaction, signers, options) {
        return this._connection.sendTransaction(transaction, signers, options)
    }

    async checkOwnedSPL(mint, publicKey) {
        let mintPubkey = mint;
        let resp = await this._connection._rpcRequest('getAccountInfo', [
            publicKey,
            {
              encoding:'jsonParsed',
            }
        ])
        if (resp.error) {
            return false
        }
        if (null == resp.result.value) {
            return false;
        }
        let info= resp.result.value.data.parsed.info
        let parsedMint = info.mint
        if (info.mint == mint) {
            return true
        } else {
            return false
        }
    }

    async isSOLAccount(publicKey) {
        let resp = await this._connection._rpcRequest('getAccountInfo', [
            publicKey,
            {
              encoding:'jsonParsed',
            }
        ])
        if (resp.error) {
            return false
        }
        if (null == resp.result.value) {
            return true; // here will return for account not on chain
        }
        if (TOKEN_NATIVE_MINT == resp.result.value.owner ) {
            return true
        } else {
            return false
        }
    }

    async getSPLAccount(mint, owner) {
        let bytes = mint+owner
        let resp = await this._connection._rpcRequest('getProgramAccounts', [
            TOKEN_PROGRAM,
            {
              encoding:'jsonParsed',
              commitment: 'recent',
              filters:[{"dataSize": 165},{"memcmp": {"offset": 32, "bytes": owner}},{"memcmp": {"offset": 0, "bytes": mint}}]
            }
        ])
        if (resp.error) {
            return null
        }
        console.log("resp:", resp)
        let account = null
        if (resp.result != null && resp.result.length > 0) {
            account = resp.result[0].pubkey
        } else {
            account = null
        }
        console.log("account:", account)
        return account
    }

    async getSPLMints(publicKey) {
        let resp = await this._connection._rpcRequest('getProgramAccounts', [
            TOKEN_PROGRAM,
            {
              encoding:'jsonParsed',
              commitment: 'recent',
              filters:[{"dataSize": 82},{"memcmp": {"offset": 4, "bytes": publicKey}}]
            }
        ])
        if (resp.error) {
            return null
        }
        let mints= []
        for (const account of resp.result) {
            const info = account.account.data.parsed.info
            const mint= {
                                decimals:info.decimals,
                                freezeAuthority:info.freezeAuthority,
                                mintAuthority:info.mintAuthority,
                                mint:account.pubkey
                            }
            mints.push(mint)
        }
        return mints
    }

    async getProgramAccounts(publicKey) {
        let resp = await this._connection._rpcRequest('getProgramAccounts', [
            TOKEN_PROGRAM,
            {
              encoding:'jsonParsed',
              commitment: 'recent',
              filters:[{"dataSize": 165},{"memcmp": {"offset": 32, "bytes": publicKey}}]
            }
        ])
        if (resp.error) {
            return null
        }
        let coins = []
        for (const account of resp.result) {
            const info = account.account.data.parsed.info
            const splCoin = {
                                decimals:info.tokenAmount.decimals,
                                deposit:account.pubkey,
                                mint:info.mint,
                                amount:info.tokenAmount.amount,
                                uiAmount:info.tokenAmount.uiAmount,
                            }
            coins.push(splCoin)
        }
        return coins
    }

    async getTokenAccountBalance(publicKey) {
        const rspCtx = await this._connection.getTokenAccountBalance(publicKey, 'recent')
        return rspCtx.value.uiAmount
    }

    async transferSPL(source, destination, amount, account) {
        const trxi = Token.createTransferInstruction(
            new PublicKey(TOKEN_PROGRAM),
            source,
            destination,
            account.publicKey,
            [], 
            amount
        )
        const trx= new Transaction().add(trxi);
        return this._connection.sendTransaction(
            trx, 
            [account],
        )
    }

    async transferSPLWithCreate(source, owner, mint,amount, account) {
        // step: 1 new account
        const splAccount = new Account()
        // step: 2 caculate ret
        const balanceNeeded = await Token.getMinBalanceRentForExemptAccount(
            this._connection,
        );

        // step3: create createAccount transaction instrument
        const createAccountTrxi =  SystemProgram.createAccount({
            fromPubkey: account.publicKey,
            newAccountPubkey: splAccount.publicKey,
            lamports: balanceNeeded,
            space: 165,
            programId: new PublicKey(TOKEN_PROGRAM),
        })

        // step4: ceate init account transaction instrucment
        const initAccountTrx =   Token.createInitAccountInstruction(
            new PublicKey(TOKEN_PROGRAM), 
            mint,
            splAccount.publicKey,
            owner,
        )

        const trxi = Token.createTransferInstruction(
            new PublicKey(TOKEN_PROGRAM),
            source,
            splAccount.publicKey,
            account.publicKey,
            [], 
            amount
        )
        const trx= new Transaction()
        trx.add(createAccountTrxi)
        trx.add(initAccountTrx)
        trx.add(trxi)
        return this._connection.sendTransaction(
            trx, 
            [account, splAccount],
        )
    }

    async getMintInfo(mint) {
        let resp = await this._connection._rpcRequest('getAccountInfo', [
            mint,
            {
              encoding:'jsonParsed',
            }
        ])
        if (resp.error) {
            return null
        } 
        if (null == resp.result.value) {
            return null
        }
        const info = resp.result.value.data.parsed.info
        const mintInfo= {
            decimals:info.decimals,
            freezeAuthority:info.freezeAuthority,
            mintAuthority:info.mintAuthority,
            mint:mint
        } 
        return mintInfo
    }

    async mintSPLToken(mint, destination, amount, account) {
        const trxi = Token.createMintToInstruction(
            new PublicKey(TOKEN_PROGRAM), 
            mint,
            destination,
            account.publicKey,
            [],
            amount,
        );
        let options = {
            skipPreflight: true,
            commitment: "singleGossip",
        };
        const trx= new Transaction().add(trxi);
        return this._connection.sendTransaction(
            trx, 
            [account],
            options
        )
    }

    async mintSPLTokenWithCreate(mint, owner, amount, account) {

        // step: 1 new account
        const splAccount = new Account()
        // step: 2 caculate ret
        const balanceNeeded = await Token.getMinBalanceRentForExemptAccount(
            this._connection,
        );

        // step3: create createAccount transaction instrument
        const createAccountTrxi =  SystemProgram.createAccount({
            fromPubkey: account.publicKey,
            newAccountPubkey: splAccount.publicKey,
            lamports: balanceNeeded,
            space: 165,
            programId: new PublicKey(TOKEN_PROGRAM),
        })

        // step4: ceate init account transaction instrucment
        const initAccountTrxi =   Token.createInitAccountInstruction(
            new PublicKey(TOKEN_PROGRAM), 
            mint,
            splAccount.publicKey,
            owner,
        )

        const trxi = Token.createMintToInstruction(
            new PublicKey(TOKEN_PROGRAM), 
            mint,
            splAccount.publicKey,
            account.publicKey,
            [],
            amount,
        );
        let options = {
            skipPreflight: true,
            commitment: "singleGossip",
        };
        const trx= new Transaction()
        trx.add(createAccountTrxi)
        trx.add(initAccountTrxi)
        trx.add(trxi)
        return this._connection.sendTransaction(
            trx, 
            [account, splAccount],
            options
        )
    }


    async createAndInitAccountInstruction(mint, splAccount,  account) {

        // step: 2 caculate ret
        const balanceNeeded = await Token.getMinBalanceRentForExemptAccount(
            this._connection,
        );

        // step3: create createAccount transaction instrument
        const createAccountTrxi =  SystemProgram.createAccount({
            fromPubkey: account.publicKey,
            newAccountPubkey: splAccount.publicKey,
            lamports: balanceNeeded,
            space: 165,
            programId: new PublicKey(TOKEN_PROGRAM),
        })

        // step4: ceate init account transaction instrucment
        const initAccountTrx =   Token.createInitAccountInstruction(
            new PublicKey(TOKEN_PROGRAM), 
            new PublicKey(mint),
            splAccount.publicKey,
            account.publicKey,
        )
        // step5: create transaction
        const transaction = new Transaction()
        transaction.add(createAccountTrxi)
        transaction.add(initAccountTrx)

        // step6: send transaction
        return this._connection.sendTransaction(
            transaction, 
            [account, splAccount],
        )
    }

    async queryTransactions(publicKey, recently) {
        let opts = {}
        if (recently) {
            opts = {limit:10, before:recently}
        } else {
            opts = {limit:10}
        }
        return this._connection.getConfirmedSignaturesForAddress2(publicKey, opts)
    }

    async querySignature(signature) {
        return this._connection.getConfirmedTransaction(signature)
    }

}

export const connection = new RPCConnection()