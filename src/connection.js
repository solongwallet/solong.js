import { Connection,
        Transaction,
        PublicKey,
        SystemProgram} from "@solana/web3.js";

import {TOKEN_PROGRAM} from './token'
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
            console.log("info:", info)
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