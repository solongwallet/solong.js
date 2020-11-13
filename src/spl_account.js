// @flow

import {connection} from './connection'
import {Account as SolanaAccount, 
    PublicKey, 
    LAMPORTS_PER_SOL} from '@solana/web3.js'

export class SPLAccount {

    constructor(deposit, mint, amount, account, decimals, uiAmount) {
        this._deposit = deposit
        this._amount = amount
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
     * @param amount amount for transfer , already mutli LAMPORTS_PER_SOL
     */
    async transfer(deposit, amount) {
        return connection.transferSPL(
            new PublicKey(this._deposit),
            new PublicKey(deposit), 
            amount*1000000,
            this._account 
        )
    }

}