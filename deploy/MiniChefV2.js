const { CHAM_ADDRESS } = require("@champagneswap/core-sdk");

module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
  const { deploy } = deployments;

  const { deployer, dev } = await getNamedAccounts();

  const chainId = await getChainId();

  let chamAddress;

  if (chainId === "31337") {
    chamAddress = (await deployments.get("ChampagneToken")).address;
  } else if (chainId in CHAM_ADDRESS) {
    chamAddress = CHAM_ADDRESS[chainId];
  } else {
    throw Error("No CHAM!");
  }

  await deploy("MiniChefV2", {
    from: deployer,
    args: [chamAddress],
    log: true,
    deterministicDeployment: false,
  });

  const miniChefV2 = await ethers.getContract("MiniChefV2");
  if ((await miniChefV2.owner()) !== dev) {
    console.log("Transfer ownership of MiniChef to dev");
    await (await miniChefV2.transferOwnership(dev, true, false)).wait();
  }
};

module.exports.tags = ["MiniChefV2"];
// module.exports.dependencies = ["UniswapV2Factory", "UniswapV2Router02"]
