// @flow
import {Account} from './account'
import {storeSecretKey, 
        loadSecretKey,
        deleteAccount,
        addAccount,
        listAccounts} from './storage'
import {connection} from './connection'
import nacl from 'tweetnacl'
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'
import { PublicKey,LAMPORTS_PER_SOL } from '@solana/web3.js'

export class AccountMgr{
    constructor() {
        this._accounts = new Map()
        this._current = null
    }

    /**
     * get all unlocked accounts
     * 
     * @return  a unlocked accounts array
     */
    get accounts() {
        return this._accounts
    }

    /**
     * get current unlocked account
     * 
     * @return the current unlocked account 
     */
    get current() {
        return this._current
    }

    /**
     * set current unlocked account
     * 
     */
    set current(account) {
        this._current = account
    }

    /**
     * get current API provider
     */
    get provider() {
        return connection.provider
    }

    /**
     * set current API provider
     */
    set provider(URL) {
        connection.provider = URL
    }

    /**
     * return current provider connection
     */
    get connection() {
        return connection.connection
    }

    /**
     * Generate a BIP39 mnemonic
     * 
     * @return menemonic
     */
    async generateMnemonic() {
        //const bip39 = await import("bip39")
        const mnemonic = bip39.generateMnemonic(128)
        return mnemonic
    }

    /**
    * Import a account from BIP39 mnemonic
    *
    * @param menmonic a valied BIP39 mnemonic
    */
    async importAccount(menmonic) {
        const secretKey = await this._mnemonicToSecretKey(menmonic)

        const account = new Account(secretKey)
        this._accounts.set(account.publicKey.toBase58(), account)
        addAccount(account.publicKey.toBase58())
        this._current = account
        return account
    }

    /**
     * Delete imported account 
     * 
     * @param public for account 
     */
    async deleteAccount(publicKey) {
        this._accounts.delete(publicKey)
        deleteAccount(publicKey)
        if (publicKey == this._current.publicKey.toBase58()) {
            this._current = null
        }
    }

    /**
     * Query recently comfirmed transaction
     * @param publicKey key of account 
     */
    async queryTransactions(publicKey, recently) {
        let sigers = []
        const trans = await connection.queryTransactions(new PublicKey(publicKey), recently)
        console.log("trans:", trans)
        for (const siger of trans) {
           sigers.push(siger.signature) 
        }
        return new Promise((resolve, reject)=>{
            resolve(sigers)
        })
    }

    /**
     * Query transaction of a signature
     * @param signature : signature to query
     */
    async querySignature(signature) {
        const trx = await connection.querySignature(signature)
        console.log("trx:", trx)
        return new Promise((resolve, reject)=>{
            resolve(trx.transaction)
        })
    }


    /**
    * Lock the account
    *
    * @param account account to be lock
    */
    async lock(account, password) {
        console.log("lock account:", account.publicKey.toBase58())
        storeSecretKey(account.publicKey.toBase58(), account.secretKey, password)
        this._accounts.delete(account.publicKey.toBase58())
        this._current = null
    }

    /**
    * Unlock the account
    *
    * @param account account to be lock
    */
    async unlock(publicKey, password){
        const secretKey = await loadSecretKey(publicKey, password)
        console.log("secretKey:", secretKey)
        const account = new Account(secretKey)
        this._accounts.set(account.publicKey.toBase58(), account)
        this._current = account
        return account 
    }

    /**
    * Get all imported accounts
    *
    * @param accounts  all imprted accounts
    */
    async storageAccounts(){
        const pubKeys = listAccounts()
        return pubKeys
    }

    /**
     * get account's SOL balance 
     * @param {*} publicKey 
     */
    async getSOLBalance(publicKey) {
        const lamports = await connection.getBalance(new PublicKey(publicKey))
        return lamports / LAMPORTS_PER_SOL
    }

    async getSPLBalance(publicKey) {
        const uiAmount= await connection.getTokenAccountBalance(new PublicKey(publicKey))
        return uiAmount
    }

    /**
     * isSOLAccount check is SOL Account
     * @param {} publicKey 
     */

    async isSOLAccount(publicKey) {
        let ret = connection.isSOLAccount(publicKey)
        return ret
    }

    /**
    * @private
    */
    async _mnemonicToSecretKey(mnemonic) {
        //const bip39 = await import("bip39")
        const rootSeed = Buffer.from(await bip39.mnemonicToSeed(mnemonic), 'hex')
        console.log("rootSeed:", rootSeed)
        const derivedSeed = bip32.fromSeed(rootSeed).derivePath("m/501'/0'/0/0").privateKey
        return nacl.sign.keyPair.fromSeed(derivedSeed).secretKey
    }


}

export const AccountManager = new AccountMgr()
