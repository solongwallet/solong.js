const solmate= require('..');

const mnemonic = solmate.AccountManager.generateMnemonic();
console.log("mnemonic:", mnemonic);

const hookMnemonic = 'height imitate comic project hire suffer cheap stable column because inmate sick';
solmate.AccountManager.importAccount(hookMnemonic).then((account) => {
    console.log("import account:", account.publicKey.toBase58());
    //solmate.AccountManager.lock(account, '123456');
});

// solmate.AccountManager.storageAccounts().then((accounts) => {
//     console.log("storage accounts:", accounts);
//     for (const pubKey of accounts) {
//         solmate.AccountManager.unlock(pubKey, '123456').then((account) => {
//             console.log("unlock account:", account.publicKey.toBase58());
//         });
//     }
// });
