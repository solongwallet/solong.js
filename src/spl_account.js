// @flow

import {connection} from './connection'
import {Account as SolanaAccount, 
    PublicKey, 
    LAMPORTS_PER_SOL} from '@solana/web3.js'

export class SPLAccount {

    constructor(deposit, mint, amount, decimals, uiAmount, account) {
        this._deposit = deposit
        this._amount = amount*1
        this._name = ''
        this._symbol = ''
        this._mint = mint
        this._decimals = decimals
        this._uiAmount = uiAmount
        this._account = account
    }

    get uiAmount() {
        return this._uiAmount
    }

    get decimals() {
        return this._decimals
    }

    get mint() {
        return this._mint
    }

    get name() {
        return this._name
    }

    get symbol() {
        return this._symbol
    }

    get amount( ) {
        return this._amount
    }

    get deposit( ) {
        return this._deposit
    }


    /**
     * get SPL balance for this account
     */
    async getBalance() {
        const uiAmount= await connection.getTokenAccountBalance(new PublicKey(this._deposit))
        this._uiAmount =uiAmount  
        this._amount = uiAmount * (10**this._decimals)
        return uiAmount
    }

    /**
     * transfer SPL Token to others
     * 
     * @param deposit transfer to account
     * @param uiAmount amount for transfer , already mutli decimals
     */
    async transfer(deposit, uiAmount) {
        const isSOLAccount = await connection.isSOLAccount(deposit)
        if (! isSOLAccount) {
            const isSPL= await connection.checkOwnedSPL(this._mint, deposit)
            if (isSPL) {
                return connection.transferSPL(
                    new PublicKey(this._deposit),
                    new PublicKey(deposit), 
                    uiAmount * (10**this._decimals),
                    this._account 
                )
            } else {
                return new Promise((resolve, reject)=>{
                    reject(null)
                })
            }
        } else {
            let splDeposit = await connection.getSPLAccount(this._mint, deposit)
            if (null == splDeposit) {
                // create spl token and transfer
                return connection.transferSPLWithCreate(
                    new PublicKey(this._deposit),
                    new PublicKey(deposit), 
                    new PublicKey(this._mint),
                    uiAmount * (10**this._decimals),
                    this._account)
            } else {
                return connection.transferSPL(
                    new PublicKey(this._deposit),
                    new PublicKey(splDeposit), 
                    uiAmount * (10**this._decimals),
                    this._account)
            }
        }
    }

}