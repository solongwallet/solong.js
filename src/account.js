// @flow

import nacl from 'tweetnacl'
import {Account as SolanaAccount, 
        PublicKey, 
        LAMPORTS_PER_SOL} from '@solana/web3.js'
import {connection} from './connection'
import {SPLAccount} from './spl_account'
import {deserializeAccount, cache} from './cache'
import {TOKEN_PROGRAM, WRAPPED_SOL_MINT} from './token'
import {Token, AccountLayout, u64} from '@solana/spl-token'
import {Mint} from './mint'

export class Account extends SolanaAccount{
    constructor(key) {
        super(key)
        this._key=key 
        this._spls = new Map()
        this._mints= new Map()
    }


    /**
     * return secret key for the account
     * 
     * @return secret key
     */
    get key() {
        return this._key
    }

    /**
     * return SPL accounts
     * 
     * @return SPL accounts
     */ 
    get SPLAccounts() {
        return this._spls
    }

    /**
     * get desposit address
     * 
     * @return  public key of base58 string
     */
    deposit() {
        return this.publicKey.toBase58()
    }

    /**
     * get balance for this account
     */
    async getBalance() {
        const lamports = await connection.getBalance(super.publicKey)
        return lamports / LAMPORTS_PER_SOL 
    }

    /**
     * transfer SOL to others
     * 
     * @param deposit transfer to account
     * @param amount amount for transfer , already mutli LAMPORTS_PER_SOL
     */
    async transfer(deposit, amount) {
        return connection.transfer(super.publicKey,
                                    new PublicKey(deposit),
                                    amount * LAMPORTS_PER_SOL,
                                    this)
    }


    /**
     * send transaction
     * 
     * @param transaction  transaction of solana-web3.js
     * @param signers  a array of account to sign
     * @param options options of solana-web3.js
     */
    async sendTransaction( transaction, options) {
        return connection.sendTransaction(transaction, [this], options)
    }


    /**
     * get all SPL tokens of this account
     */
    async getSPLAccounts() {
        const spls = await connection.getProgramAccounts(super.publicKey.toBase58())
        for (const coin of spls) {
            //deposit, mint, amount, decimals, uiAmount, account
            let spl = new SPLAccount(coin.deposit, coin.mint, coin.amount, coin.decimals, coin.uiAmount, this) 
            this._spls[coin.mint] = spl
        }
    }


    async querySPLMints(){
        const mints= await connection.getSPLMints(super.publicKey.toBase58())
        for (const mint of mints) {
            console.log("mint:", mint)
            //mint, mintAuthority, freezeAuthority, decimals
            let m= new Mint(mint.mint, mint.mintAuthority, mint.freezeAuthority, mint.decimals) 
            this._mints[mint.mint] =m 
        }
        return this._mints
    }


    /**
     * get balance for this account
     * 
     * @param deposit for SPL deposit
     */
    async getSPLBalance(mint, deposit) {
        const spl = this._spls[mint]
        if (! spl) {
            return null
        }
       return spl.getBalance(deposit)
    }

    /**
     * transfer SPL token to others
     * 
     * @param deposit transfer to account
     * @param amount amount for transfer , the uiAmount number
     */
    async transferSPLToken(mint, deposit, amount) {
        const spl = this._spls[mint]
        console.log("spl:",spl)
        if (! spl) {
            return null
        }
        return spl.transfer(deposit, amount)
    }

    async mintSPLToken(mint, deposit, uiAmount) {
        const mintInfo = await connection.getMintInfo(mint)
        const amount = uiAmount*(10**mintInfo.decimals)
        const isSOLAccount = await connection.isSOLAccount(deposit)
        if (! isSOLAccount) {
            const isSPL= await connection.checkOwnedSPL(mint, deposit)
            if (isSPL) {
                // mint to
                return connection.mintSPLToken(
                    new PublicKey(mint), 
                    new PublicKey(deposit), 
                    amount, 
                    this)
            } else {
                return new Promise((resolve, reject)=>{
                    reject(null)
                })
            }
        } else {
            let splDeposit = await connection.getSPLAccount(mint, deposit)
            if (null == splDeposit) {
                // create spl token and mint to
                return connection.mintSPLTokenWithCreate(
                    new PublicKey(mint), 
                    new PublicKey(deposit), 
                    amount, 
                    this)
            } else {
                return connection.mintSPLToken(
                    new PublicKey(mint), 
                    new PublicKey(splDeposit), 
                    amount, 
                    this)
            }
        }
    }

    /**
     * Create account for a SPL
     * 
     */

     async createSPLAccount(mint) {

        // step: 1 create a new Account
        const splAccount = new Account();
        return connection.createAndInitAccountInstruction(mint, splAccount, this)
    }




    async queryTokenAccounts() {
        const accounts = await connection.connection.getTokenAccountsByOwner(super.publicKey, {
            programId: new PublicKey(TOKEN_PROGRAM),
          });
        console.log("accounts:", accounts)
        let tokenAccount = new Map()
        accounts.value
            .map((info) => {
              const data = deserializeAccount(info.account.data);
              // need to query for mint to get decimals
              //console.log("data", data)
              // TODO: move to web3.js for decoding on the client side... maybe with callback
              const details = {
                pubkey: info.pubkey,
                account: {
                  ...info.account,
                },
                info: data,
              } ;
              console.log("tokenAccount:", details.info.mint.toBase58(), ":", details.pubkey.toBase58())
              cache.getAccount(connection.connection, details.pubkey)
              //cache.getAccount(connection.connection, details.info.mint)
              //tokenAccount.set(details.info.mint.toBase58(), details)
              tokenAccount.set(details.pubkey.toBase58(), details)
        })
        const nativeAccount = await cache.wrapNativeAccount(super.publicKey)
        tokenAccount.set(super.publicKey.toBase58(), nativeAccount)
        return new Promise((resolve, reject)=>{
            resolve(tokenAccount)
        })
    }

}