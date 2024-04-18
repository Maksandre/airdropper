const {ThinClient} = require('@unique-nft/sdk');
const {Sr25519Account} = require('@unique-nft/sr25519');
const fs = require('fs/promises');
const path = require('path');

// const SETTINGS = path.join(__dirname, '/SETTINGS.json');
// const LIST = path.join(__dirname, '/LIST.txt');
// const DONE = path.join(__dirname, '/LIST-DROPPED.txt');

const SETTINGS = getFilePath('SETTINGS.json')
const LIST = getFilePath('LIST.txt');
const DONE = getFilePath('LIST-DROPPED.txt');

const main = async () => {
    const settings = await fs.readFile(SETTINGS).then(JSON.parse);
    const network = settings.network === 'opal' 
    ? "https://rest.unique.network/opal/v1"
    : settings.network === 'unique' 
        ? "https://rest.unique.network/unique/v1"
        : "https://rest.unique.network/quartz/v1";

    const list = (await fs.readFile(LIST).then(b => b.toString())).split('\n');

    const account = Sr25519Account.fromUri(settings.mnemonic);
    const options = {
        baseUrl: network,
        account
    };
    const sdk = new ThinClient(options);

    const balance = await sdk.balance.get({address: account.address});
    const needBalance = list.length * settings.DROP;
    console.log('Signer balance:', balance.availableBalance.formatted);
    console.log('Drop amount:', settings.DROP);
    console.log('Need balance:', needBalance);
    if (balance.availableBalance.formatted < needBalance) {
        console.log('❌ Balance low');
        return;
    }

    console.log('Start dropping...');
    let {nonce} = await sdk.common.getNonce({address: account.address});
    while (list.length > 0) {
        const accountsToDrop = list.splice(0, settings.accountsToDropAtOnce).filter(a => a !== "");
        const accountsDropped = [];
        
        const txs = [];
        for (const acc of accountsToDrop) {
            txs.push(sdk.balance.transfer.submitWaitResult({
                destination: acc,
                amount: settings.DROP
            }, {
                nonce: nonce++
            }))
        }

        let isError = false;
        const result = await Promise.allSettled(txs);
        for (const [i, r] of result.entries()) {
            if(r.status === 'rejected') {
                console.log(`❌ ${accountsToDrop[i]} error: ${r.reason}`);
                list.push(accountsToDrop[i]);
                isError = true;
            } 
            else {
                console.log(`✅ ${accountsToDrop[i]} dropped`)
                accountsDropped.push(accountsToDrop[i]);
            }
        }

        await fs.writeFile(LIST, list.join('\n') + '\n');
        await fs.appendFile(DONE, accountsDropped.join('\n') + '\n');

        if (isError) {
            console.log('Check the errors before continue');
            return;
        };
    }

    console.log('🥳 Drop finished!');
    process.exit(1);
}

function getFilePath(fileName) {
    const directoryOfBinary = path.dirname(process.execPath);
    return path.join(directoryOfBinary, fileName);
}

main().then();