// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {XIndexOracle} from "../src/contracts/XIndexOracle.sol";
import {MonstarPerps} from "../src/contracts/MonstarPerps.sol";

contract DeployScript is Script {
    function run() external {
        // 프라이빗 키를 bytes32로 읽고 uint256으로 변환
        bytes32 privateKeyBytes = vm.envBytes32("PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyBytes);
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts with account:", deployer);
        console.log("Account balance:", deployer.balance / 1e18, "MON");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy XIndexOracle
        console.log("\n=== Deploying XIndexOracle ===");
        XIndexOracle oracle = new XIndexOracle();
        console.log("XIndexOracle deployed to:", address(oracle));
        console.log("Owner:", oracle.owner());
        
        // 2. Deploy MonstarPerps with Oracle address and Owner
        console.log("\n=== Deploying MonstarPerps ===");
        address vaultOwner = 0x91DcF137f42130E5095558Ee1D143F0282B114B0; // Owner 주소 (올바른 checksum)
        MonstarPerps perps = new MonstarPerps(address(oracle), vaultOwner);
        console.log("MonstarPerps deployed to:", address(perps));
        console.log("Oracle:", address(perps.indexOracle()));
        console.log("Owner:", perps.owner());
        
        // 3. Set initial prices (optional)
        console.log("\n=== Setting initial prices ===");
        try oracle.updateIndex("1", 125) {
            console.log("Set price for influencer '1': 125");
        } catch {
            console.log("Could not set price for '1'");
        }
        
        try oracle.updateIndex("2", 98) {
            console.log("Set price for influencer '2': 98");
        } catch {
            console.log("Could not set price for '2'");
        }
        
        vm.stopBroadcast();
        
        console.log("\n=== Deployment Summary ===");
        console.log("XIndexOracle Address:", address(oracle));
        console.log("MonstarPerps Address:", address(perps));
        console.log("\nNext Steps:");
        console.log("1. Update src/config/monad.ts with MonstarPerps address");
        console.log("2. Set influencer addresses: perps.setInfluencerAddress(id, address)");
        console.log("3. Add initial liquidity: perps.addLiquidity{value: 30 ether}()");
    }
}

