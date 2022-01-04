const { WETH_ADDRESS } = require("@champagneswap/core-sdk")

module.exports = async function ({ ethers: { getNamedSigner }, getNamedAccounts, deployments }) {
  const { deploy } = deployments

  const { deployer, dev } = await getNamedAccounts()

  const chainId = await getChainId()

  const factory = await ethers.getContract("UniswapV2Factory")
  const bar = await ethers.getContract("ChampagneCellar")
  const cham = await ethers.getContract("ChampagneToken")
  
  let wethAddress;
  
  if (chainId === '31337') {
    wethAddress = (await deployments.get("WETH9Mock")).address
  } else if (chainId in WETH_ADDRESS) {
    wethAddress = WETH_ADDRESS[chainId]
  } else {
    throw Error("No WETH!")
  }

  await deploy("ChampagneMaker", {
    from: deployer,
    args: [factory.address, bar.address, cham.address, wethAddress],
    log: true,
    deterministicDeployment: false
  })

  const maker = await ethers.getContract("ChampagneMaker")
  if (await maker.owner() !== dev) {
    console.log("Setting maker owner")
    await (await maker.transferOwnership(dev, true, false)).wait()
  }
}

module.exports.tags = ["ChampagneMaker"]
module.exports.dependencies = ["UniswapV2Factory", "UniswapV2Router02", "ChampagneCellar", "ChampagneToken"]