module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()

  const cham = await deployments.get("ChampagneToken")

  await deploy("ChampagneCellar", {
    from: deployer,
    args: [cham.address],
    log: true,
    deterministicDeployment: false
  })
}

module.exports.tags = ["ChampagneCellar"]
module.exports.dependencies = ["UniswapV2Factory", "UniswapV2Router02", "ChampagneToken"]
