import {connection} from './connection'
import {Account as SolanaAccount, 
    PublicKey, 
    LAMPORTS_PER_SOL} from '@solana/web3.js'

export class Mint{
    constructor(mint, mintAuthority, freezeAuthority, decimals){
        this._mint = mint
        this._mintAuthority = mintAuthority
        this._freezeAuthority = freezeAuthority 
        this._decimals = decimals
    }

    get  mint() {
        return this._mint
    }

    get mintAuthority () {
        return this._mintAuthority
    }

    get freezeAuthority() {
        return  this._freezeAuthority
    }

    get decimals() {
        return this._decimals
    }
}