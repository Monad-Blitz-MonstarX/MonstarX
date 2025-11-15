/**
 * Hardhat 배포 스크립트
 * 
 * 사용 방법:
 * 1. .env 파일에 PRIVATE_KEY 설정
 * 2. npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
 * 3. npx hardhat run scripts/deploy.js --network monadTestnet
 */

const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment...\n");

  // 배포자 주소 확인
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "MON\n");

  // 1. XIndexOracle 배포
  console.log("📦 Deploying XIndexOracle...");
  const XIndexOracle = await hre.ethers.getContractFactory("XIndexOracle");
  const oracle = await XIndexOracle.deploy();
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  console.log("✅ XIndexOracle deployed to:", oracleAddress);
  console.log("   Owner:", await oracle.owner(), "\n");

  // 2. MonstarPerps 배포 (Oracle 주소 전달)
  console.log("📦 Deploying MonstarPerps...");
  const MonstarPerps = await hre.ethers.getContractFactory("MonstarPerps");
  const perps = await MonstarPerps.deploy(oracleAddress);
  await perps.waitForDeployment();
  const perpsAddress = await perps.getAddress();
  console.log("✅ MonstarPerps deployed to:", perpsAddress);
  console.log("   Oracle:", await perps.indexOracle(), "\n");

  // 3. 초기 가격 설정 (예시 - 실제 인플루언서 ID와 가격으로 변경 필요)
  console.log("📊 Setting initial prices...");
  try {
    // 예시: 인플루언서 ID "1"에 가격 125 설정
    const tx1 = await oracle.updateIndex("1", hre.ethers.parseUnits("125", 0));
    await tx1.wait();
    console.log("✅ Set price for influencer '1': 125");

    // 예시: 인플루언서 ID "2"에 가격 98 설정
    const tx2 = await oracle.updateIndex("2", hre.ethers.parseUnits("98", 0));
    await tx2.wait();
    console.log("✅ Set price for influencer '2': 98");
    
    // 추가 인플루언서들도 여기에 설정...
    console.log("✅ Initial prices set\n");
  } catch (error) {
    console.log("⚠️  Could not set initial prices (you can do this later):", error.message, "\n");
  }

  // 배포 정보 출력
  console.log("=".repeat(60));
  console.log("📋 Deployment Summary");
  console.log("=".repeat(60));
  console.log("XIndexOracle Address:", oracleAddress);
  console.log("MonstarPerps Address:", perpsAddress);
  console.log("\n💡 Next Steps:");
  console.log("1. Update src/config/monad.ts with MonstarPerps address");
  console.log("2. Set influencer addresses: perps.setInfluencerAddress(id, address)");
  console.log("3. Add initial liquidity: perps.addLiquidity({ value: '30 ether' })");
  console.log("4. Update oracle prices regularly via oracle.updateIndex()");
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

