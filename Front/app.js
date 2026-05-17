const ADDRESSES = {
    PRICE_ORACLE: "0x90141fB45eA49C4047a0CEdBfB20B2F2A83FF7fB",
    GOV_TOKEN: "0x83B38D9dBbe9b85c2E8626c71be61E39AFfe2b6C",
    GOVERNOR: "0xBDC60f383f982DdfC448A452D325E68C6d06C59E",
    AMM_PAIR: "0x969bE1Ff7b496fe8ED20eDe0A1F0C9ca9171C936",
    LENDING_POOL: "0xE017849D6997fE7649C9c81bF5D0AFAeAA47517A",
    SIMPLE_VAULT: "0x0Ffe38890C563D476774640Be568f6a9Fd622D22"
};

const ABIS = {
    GOV_TOKEN: [
        "function getVotes(address account) view returns (uint256)"
    ],
    GOVERNOR: [
        "function state(uint256 proposalId) view returns (uint8)",
        "function castVote(uint256 proposalId, uint8 support) returns (uint256)"
    ],
    AMM_PAIR: [
        "function reserve0() view returns (uint256)",
        "function reserve1() view returns (uint256)",
        "function swap0To1(uint256 amountIn)",
        "function swap1To0(uint256 amountIn)"
    ],
    LENDING_POOL: [
        "function deposit(uint256 amount)",
        "function borrow(uint256 amount)",
        "function collateral(address user) view returns (uint256)",
        "function debt(address user) view returns (uint256)"
    ],
    SIMPLE_VAULT: [
        "function deposit(uint256 assets, address receiver) returns (uint256 shares)",
        "function balanceOf(address account) view returns (uint256)"
    ],
    PRICE_ORACLE: [
        "function getPrice() view returns (uint256)"
    ]
};

let provider, signer, userAddress;
let govToken, governor, ammPair, lendingPool, simpleVault, priceOracle;

document.getElementById('connectBtn').addEventListener('click', async () => {
    if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        userAddress = await signer.getAddress();
        
        document.getElementById('walletAddress').innerText = "Connected: " + userAddress;

        govToken = new ethers.Contract(ADDRESSES.GOV_TOKEN, ABIS.GOV_TOKEN, signer);
        governor = new ethers.Contract(ADDRESSES.GOVERNOR, ABIS.GOVERNOR, signer);
        ammPair = new ethers.Contract(ADDRESSES.AMM_PAIR, ABIS.AMM_PAIR, signer);
        lendingPool = new ethers.Contract(ADDRESSES.LENDING_POOL, ABIS.LENDING_POOL, signer);
        simpleVault = new ethers.Contract(ADDRESSES.SIMPLE_VAULT, ABIS.SIMPLE_VAULT, signer);
        priceOracle = new ethers.Contract(ADDRESSES.PRICE_ORACLE, ABIS.PRICE_ORACLE, provider);

        updateData();
    } else {
        alert("Install MetaMask");
    }
});

async function updateData() {
    if (!userAddress) return;

    try {
        const rawPrice = await priceOracle.getPrice();
        document.getElementById('oraclePrice').innerText = ethers.formatUnits(rawPrice, 8);

        const res0 = await ammPair.reserve0();
        const res1 = await ammPair.reserve1();
        document.getElementById('poolReserves').innerText = ethers.formatEther(res0) + " / " + ethers.formatEther(res1);

        const col = await lendingPool.collateral(userAddress);
        const deb = await lendingPool.debt(userAddress);
        document.getElementById('userCollateral').innerText = ethers.formatEther(col);
        document.getElementById('userDebt').innerText = ethers.formatEther(deb);

        const shares = await simpleVault.balanceOf(userAddress);
        document.getElementById('userShares').innerText = ethers.formatEther(shares);

        const votes = await govToken.getVotes(userAddress);
        document.getElementById('votingPower').innerText = ethers.formatEther(votes);
    } catch (e) {
        console.error("Data fetch error", e);
    }
}

document.getElementById('swapBtn').addEventListener('click', async () => {
    const amount = document.getElementById('swapAmount').value;
    const direction = document.getElementById('swapDirection').value;
    const parsed = ethers.parseEther(amount);
    
    if (direction === "0to1") {
        await ammPair.swap0To1(parsed);
    } else {
        await ammPair.swap1To0(parsed);
    }
    updateData();
});

document.getElementById('depositLendingBtn').addEventListener('click', async () => {
    const amount = document.getElementById('lendingAmount').value;
    await lendingPool.deposit(ethers.parseEther(amount));
    updateData();
});

document.getElementById('borrowLendingBtn').addEventListener('click', async () => {
    const amount = document.getElementById('lendingAmount').value;
    await lendingPool.borrow(ethers.parseEther(amount));
    updateData();
});

document.getElementById('vaultDepositBtn').addEventListener('click', async () => {
    const amount = document.getElementById('vaultAmount').value;
    await simpleVault.deposit(ethers.parseEther(amount), userAddress);
    updateData();
});

document.getElementById('checkPropBtn').addEventListener('click', async () => {
    const id = document.getElementById('proposalId').value;
    const state = await governor.state(id);
    const states = ["Pending", "Active", "Canceled", "Defeated", "Succeeded", "Queued", "Expired", "Executed"];
    document.getElementById('propStatus').innerText = "Status: " + states[state];
});

document.getElementById('voteForBtn').addEventListener('click', async () => {
    const id = document.getElementById('proposalId').value;
    await governor.castVote(id, 1);
});

document.getElementById('voteAgainstBtn').addEventListener('click', async () => {
    const id = document.getElementById('proposalId').value;
    await governor.castVote(id, 0);
});