// Append /graphql to the end of your query string
const SUBGRAPH_URL = "https://api.studio.thegraph.com/query/1753436/final-blockchain/version/latest";
const SUBGRAPH_API_KEY = "0269d6cdaad6072c104f198dbe831c20";

const ADDRESSES = {
    PRICE_ORACLE: "0xaB67c7965230E1b18907275565A160F32a32d474",
    GOV_TOKEN: "0x4A3D90a0CC9eC9FAde8c61604fE38dd79C832d3a",
    GOVERNOR: "0x5904e6016f06dEE649883C8F89C77367dEfb3225",
    AMM_PAIR: "0xf7739216E54Ce3a8d9bc1BA2C4F2CBf06Cf091d2", // Using factory/pair layout directly
    LENDING_POOL: "0x6c42543705B3D3A71E9FB3ed49dD90651DCDcb06",
    SIMPLE_VAULT: "0xE820Eba717F5f814B5e7De9BCd9Db8C49824d00e",
    TOKEN_0: "0x47A8E2E46871e69c492Fc38a556ABeBD254248F6", // Collateral Token
    TOKEN_1: "0xB77881a01f7B504d553fa1d8Bd206D8b839bF8c0"  // Borrow Token
};

// Generic standard ERC20 interface metadata
const ERC20_ABI = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
];

const ABIS = {
    GOV_TOKEN: ["function getVotes(address account) view returns (uint256)"],
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
    PRICE_ORACLE: ["function getPrice() view returns (uint256)"]
};

let provider, signer, userAddress;
let govToken, governor, ammPair, lendingPool, simpleVault, priceOracle;

// ---- HIGH PERFORMANCE SUBGRAPH FETCH ----
async function fetchSubgraphData() {
    const query = `
    {
      proposals(first: 3) { id, proposer, description }
      ammpools(first: 1) { reserve0, reserve1 }
      lendingUsers(first: 3, orderBy: collateral, orderDirection: desc) { id, collateral, debt }
    }`;

    try {
        const res = await fetch(SUBGRAPH_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SUBGRAPH_API_KEY}`
            },
            body: JSON.stringify({ query })
        });
        
        
        // Catch instances where the endpoint is live but returns internal indexing compile errors
        const result = await res.json();
        if (result.errors) {
            console.error("Full GraphQL errors:", JSON.stringify(result.errors, null, 2));
            displaySubgraphError(result.errors[0].message);
            return;
        }

        const data = result.data;
        if (!data) {
            displaySubgraphError("No data payload returned.");
            return;
        }

        // 1. Process Global AMM Pool Reserves via indexer
        if (data.ammPools && data.ammPools.length > 0) {
            const pool = data.ammPools[0];
            document.getElementById('subgraphAmmData').innerHTML = `
                Global Index Res 0: ${ethers.formatEther(pool.reserve0)} <br>
                Global Index Res 1: ${ethers.formatEther(pool.reserve1)}
            `;
        } else {
            document.getElementById('subgraphAmmData').innerText = "No active AMM pools indexed.";
        }

        // 2. Fetch Leaderboard Credit Metrics
        if (data.lendingUsers && data.lendingUsers.length > 0) {
            let html = "";
            data.lendingUsers.forEach((u, i) => {
                html += `<div style="margin-top:5px; border-bottom:1px solid #444; padding-bottom:5px;">
                    #${i+1} Borrower: ${u.id.substring(0,8)}...<br>
                    Collat Base: ${ethers.formatEther(u.collateral)} | Debt Principal: ${ethers.formatEther(u.debt)}
                </div>`;
            });
            document.getElementById('subgraphLendingData').innerHTML = html;
        } else {
            document.getElementById('subgraphLendingData').innerText = "No lending metrics found.";
        }

        // 3. Populate Recent Proposals
        if (data.proposals && data.proposals.length > 0) {
            let html = "";
            data.proposals.forEach(p => {
                html += `<div style="margin-top:5px; border-bottom:1px solid #444; padding-bottom:5px;">
                    <strong>Proposal ID:</strong> ${p.id.substring(0,10)}... <br>
                    <strong>Details:</strong> ${p.description || "No description provided"}
                </div>`;
            });
            document.getElementById('subgraphDaoData').innerHTML = html;
        } else {
            document.getElementById('subgraphDaoData').innerText = "No historical governance records.";
        }

    } catch (err) {
        console.error("The Graph Execution Error:", err);
        // Instantly break the endless loading cycle on screen for the user
        displaySubgraphError("Network Disconnected / Blocked");
    }
}

// Helper function to update UI text fields on connection failure
function displaySubgraphError(errorMessage) {
    document.getElementById('subgraphAmmData').innerHTML = `<span style="color: #FF5555;">${errorMessage}</span>`;
    document.getElementById('subgraphLendingData').innerHTML = `<span style="color: #FF5555;">${errorMessage}</span>`;
    document.getElementById('subgraphDaoData').innerHTML = `<span style="color: #FF5555;">${errorMessage}</span>`;
}

// Automatically fetch indexed stats on launch
window.addEventListener('load', () => {
    fetchSubgraphData();
});

// ---- WEB3 EXTENSION LOGIC ----
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
        alert("Please install MetaMask extension to proceed.");
    }
});
async function updateData() {
    if (!userAddress) return;
    
    // 1. Fetch Oracle Price safely
    try {
        const rawPrice = await priceOracle.getPrice();
        document.getElementById('oraclePrice').innerText = ethers.formatUnits(rawPrice, 8);
    } catch (e) {
        console.error("Error reading Price Oracle:", e.message);
        document.getElementById('oraclePrice').innerText = "Unavailable";
    }

    // 2. Fetch AMM Reserves safely (Failing here won't crash the next steps anymore!)
    try {
        const res0 = await ammPair.reserve0();
        const res1 = await ammPair.reserve1();
        document.getElementById('poolReserves').innerText = ethers.formatEther(res0) + " / " + ethers.formatEther(res1);
    } catch (e) {
        console.error("Error reading AMM Pool Reserves (Check your AMM_PAIR address):", e.message);
        document.getElementById('poolReserves').innerText = "Pool Not Found";
    }

    // 3. Fetch Lending Pool metrics safely
    try {
        const col = await lendingPool.collateral(userAddress);
        const deb = await lendingPool.debt(userAddress);
        document.getElementById('userCollateral').innerText = ethers.formatEther(col);
        document.getElementById('userDebt').innerText = ethers.formatEther(deb);
    } catch (e) {
        console.error("Error reading Lending Pool:", e.message);
    }

    // 4. Fetch Vault Balance safely
    try {
        const shares = await simpleVault.balanceOf(userAddress);
        document.getElementById('userShares').innerText = ethers.formatEther(shares);
    } catch (e) {
        console.error("Error reading Vault Status:", e.message);
    }

    // 5. Fetch Governance Votes safely
    try {
        const votes = await govToken.getVotes(userAddress);
        document.getElementById('votingPower').innerText = ethers.formatEther(votes);
    } catch (e) {
        console.error("Error reading Governance Votes:", e.message);
    }
}

// INLINE APPROVAL ENFORCEMENT TO PREVENT REVERTS
async function ensureApproval(tokenAddress, spenderAddress, amount) {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    const allowance = await tokenContract.allowance(userAddress, spenderAddress);
    if (allowance < amount) {
        console.log("Processing ERC20 Spend Approval...");
        const tx = await tokenContract.approve(spenderAddress, ethers.MaxUint256);
        await tx.wait();
        console.log("Approval Verified.");
    }
}

document.getElementById('swapBtn').addEventListener('click', async () => {
    const amount = document.getElementById('swapAmount').value;
    const direction = document.getElementById('swapDirection').value;
    const parsed = ethers.parseEther(amount);
    
    try {
        const tokenToApprove = direction === "0to1" ? ADDRESSES.TOKEN_0 : ADDRESSES.TOKEN_1;
        await ensureApproval(tokenToApprove, ADDRESSES.AMM_PAIR, parsed);

        let tx;
        if (direction === "0to1") {
            tx = await ammPair.swap0To1(parsed);
        } else {
            tx = await ammPair.swap1To0(parsed);
        }
        await tx.wait();
        updateData();
        setTimeout(fetchSubgraphData, 4000); 
    } catch (e) {
        console.error(e);
        alert("Transaction Reverted. Verify token balances.");
    }
});

document.getElementById('depositLendingBtn').addEventListener('click', async () => {
    const amount = document.getElementById('lendingAmount').value;
    const parsed = ethers.parseEther(amount);
    try {
        await ensureApproval(ADDRESSES.TOKEN_0, ADDRESSES.LENDING_POOL, parsed);
        const tx = await lendingPool.deposit(parsed);
        await tx.wait();
        updateData();
        setTimeout(fetchSubgraphData, 4000);
    } catch(e) { console.error(e); }
});

document.getElementById('borrowLendingBtn').addEventListener('click', async () => {
    const amount = document.getElementById('lendingAmount').value;
    try {
        const tx = await lendingPool.borrow(ethers.parseEther(amount));
        await tx.wait();
        updateData();
        setTimeout(fetchSubgraphData, 4000);
    } catch(e) { console.error(e); }
});

document.getElementById('vaultDepositBtn').addEventListener('click', async () => {
    const amount = document.getElementById('vaultAmount').value;
    const parsed = ethers.parseEther(amount);
    try {
        await ensureApproval(ADDRESSES.TOKEN_0, ADDRESSES.SIMPLE_VAULT, parsed);
        const tx = await simpleVault.deposit(parsed, userAddress);
        await tx.wait();
        updateData();
    } catch(e) { console.error(e); }
});

document.getElementById('checkPropBtn').addEventListener('click', async () => {
    const id = document.getElementById('proposalId').value;
    try {
        const state = await governor.state(id);
        const states = ["Pending", "Active", "Canceled", "Defeated", "Succeeded", "Queued", "Expired", "Executed"];
        document.getElementById('propStatus').innerText = "Status: " + states[state];
    } catch(e) {
        document.getElementById('propStatus').innerText = "Proposal ID not found";
        console.error(e);
    }
});

document.getElementById('voteForBtn').addEventListener('click', async () => {
    const id = document.getElementById('proposalId').value;
    try {
        const tx = await governor.castVote(id, 1);
        await tx.wait();
        updateData();
    } catch (e) { console.error(e); }
});

document.getElementById('voteAgainstBtn').addEventListener('click', async () => {
    const id = document.getElementById('proposalId').value;
    try {
        const tx = await governor.castVote(id, 0);
        await tx.wait();
        updateData();
    } catch (e) { console.error(e); }
});