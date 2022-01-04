module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
  const { deploy } = deployments

  const { deployer, dev } = await getNamedAccounts()

  const cham = await ethers.getContract("ChampagneToken")
  
  const { address } = await deploy("WineMaker", {
    from: deployer,
    args: [cham.address, dev, "1000000000000000000000", "0", "1000000000000000000000"],
    log: true,
    deterministicDeployment: false
  })

  if (await cham.owner() !== address) {
    // Transfer Chamapgne Ownership to Chef
    console.log("Transfer Champagne Ownership to Winemaker")
    await (await cham.transferOwnership(address)).wait()
  }

  const wineMaker = await ethers.getContract("WineMaker")
  if (await wineMaker.owner() !== dev) {
    // Transfer ownership of WineMaker to dev
    console.log("Transfer ownership of WineMaker to dev")
    await (await wineMaker.transferOwnership(dev)).wait()
  }
}

module.exports.tags = ["WineMaker"]
module.exports.dependencies = ["UniswapV2Factory", "UniswapV2Router02", "ChampagneToken"]
