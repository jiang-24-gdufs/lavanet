const fetch = require('node-fetch');
const ethers = require('ethers');
const rpcUrls = require('./rpcUrls.js');

let counter = 0;
async function main() {
    setInterval(readFromAddress, 5000)
}

async function readFromAddress() {
    const addresses = Array(36).fill('_').map(e => ethers.Wallet.createRandom().address)

    for (let i = 0; i < addresses.length; i++) {
        const address = addresses[i].split(',')[0].trim();
        if (!address) continue;

        const rpcUrl = rpcUrls[Math.floor(Math.random() * rpcUrls.length)];
        try {
            const result = await checkBalanceAndAppend(address, rpcUrl/* , config.proxy */);
            console.log(counter++, result);
        } catch (error) {
            console.error(`Error fetching balance for address ${address}: ${error.message}`);
        }
    }
}

async function fetchWithProxy(url, body, proxyUrl) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5000);

    // const agent = new HttpsProxyAgent(proxyUrl);
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        // agent,
        signal: controller.signal
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

async function checkBalanceAndAppend(address, rpcUrl, proxyUrl) {
    console.log(`Using RPC: ${rpcUrl}`);
    const jsonRpcPayload = {
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [address, "latest"],
        id: 1,
    };

    const response = await fetchWithProxy(rpcUrl, jsonRpcPayload, proxyUrl);
    if (response.error) {
        throw new Error(response.error.message);
    }

    const balance = ethers.formatUnits(response.result, 'ether');
    return `Address: ${address} - Balance: ${balance} ETH`;
}

function shuffleArray(array) {
    return array.map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
}

main().catch(console.error);
