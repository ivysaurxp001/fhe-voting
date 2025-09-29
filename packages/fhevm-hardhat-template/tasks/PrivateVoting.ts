import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("deploy:private-voting", "Deploy PrivateVoting contract")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    console.log("Deploying PrivateVoting contract...");

    const PrivateVoting = await hre.ethers.getContractFactory("PrivateVoting");
    const privateVoting = await PrivateVoting.deploy();

    await privateVoting.waitForDeployment();

    const address = await privateVoting.getAddress();
    console.log("PrivateVoting deployed to:", address);

    // Verify contract if on testnet
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
      console.log("Waiting for block confirmations...");
      await privateVoting.deploymentTransaction()?.wait(6);
      
      try {
        await hre.run("verify:verify", {
          address: address,
          constructorArguments: [],
        });
        console.log("Contract verified on Etherscan");
      } catch (error) {
        console.log("Verification failed:", error);
      }
    }

    return address;
  });

task("create-poll", "Create a new poll")
  .addParam("contract", "PrivateVoting contract address")
  .addParam("title", "Poll title")
  .addParam("options", "Comma-separated options")
  .addParam("start", "Start timestamp (seconds)")
  .addParam("end", "End timestamp (seconds)")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const [deployer] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt("PrivateVoting", taskArgs.contract);
    
    const options = taskArgs.options.split(",").map((opt: string) => opt.trim());
    
    const tx = await contract.createPoll(
      taskArgs.title,
      options,
      taskArgs.start,
      taskArgs.end
    );
    
    const receipt = await tx.wait();
    console.log("Poll created! Transaction hash:", receipt?.hash);
  });

task("vote", "Vote on a poll")
  .addParam("contract", "PrivateVoting contract address")
  .addParam("pollId", "Poll ID")
  .addParam("choice", "Choice index (0-based)")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const [deployer] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt("PrivateVoting", taskArgs.contract);
    
    // For testing purposes, we'll use a simple encryption
    // In production, this should use proper FHE encryption
    const choiceBytes = hre.ethers.AbiCoder.defaultAbiCoder().encode(["uint8"], [taskArgs.choice]);
    
    const tx = await contract.vote(taskArgs.pollId, choiceBytes);
    const receipt = await tx.wait();
    console.log("Vote cast! Transaction hash:", receipt?.hash);
  });
