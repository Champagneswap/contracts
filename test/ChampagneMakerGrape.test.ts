import { ethers } from "hardhat";
const { keccak256, defaultAbiCoder } = require("ethers");
import { expect } from "chai";
import { prepare, deploy, getBigNumber, createSLP } from "./utilities"

describe("GrapeChampagneMaker", function () {
  before(async function () {
    await prepare(this, ["ChampagneMakerGrape", "ChampagneCellar", "ChampagneMakerGrapeExploitMock", "ERC20Mock", "UniswapV2Factory", "UniswapV2Pair", "CellarV1", "GrapePairMediumRiskV1", "PeggedOracleV1"])
  })

  beforeEach(async function () {
    // Deploy ERC20 Mocks and Factory
    await deploy(this, [
      ["cham", this.ERC20Mock, ["CHAM", "CHAM", getBigNumber("10000000")]],
      ["dai", this.ERC20Mock, ["DAI", "DAI", getBigNumber("10000000")]],
      ["mic", this.ERC20Mock, ["MIC", "MIC", getBigNumber("10000000")]],
      ["usdc", this.ERC20Mock, ["USDC", "USDC", getBigNumber("10000000")]],
      ["weth", this.ERC20Mock, ["WETH", "ETH", getBigNumber("10000000")]],
      ["strudel", this.ERC20Mock, ["$TRDL", "$TRDL", getBigNumber("10000000")]],
      ["factory", this.UniswapV2Factory, [this.alice.address]],
    ])
    // Deploy Champagne and Grape contracts
    await deploy(this, [["bar", this.ChampagneCellar, [this.cham.address]]])
    await deploy(this, [["cellar", this.CellarV1, [this.weth.address]]])
    await deploy(this, [["grapeMaster", this.GrapePairMediumRiskV1, [this.cellar.address]]])
    await deploy(this, [["grapeMaker", this.ChampagneMakerGrape, [this.factory.address, this.bar.address, this.cellar.address, this.cham.address, this.weth.address, this.factory.pairCodeHash()]]])
    await deploy(this, [["exploiter", this.ChampagneMakerGrapeExploitMock, [this.grapeMaker.address]]])
    await deploy(this, [["oracle", this.PeggedOracleV1]])
    // Create SLPs
    await createSLP(this, "chamEth", this.cham, this.weth, getBigNumber(10))
    await createSLP(this, "strudelEth", this.strudel, this.weth, getBigNumber(10))
    await createSLP(this, "daiEth", this.dai, this.weth, getBigNumber(10))
    await createSLP(this, "usdcEth", this.usdc, this.weth, getBigNumber(10))
    await createSLP(this, "micUSDC", this.mic, this.usdc, getBigNumber(10))
    await createSLP(this, "chamUSDC", this.cham, this.usdc, getBigNumber(10))
    await createSLP(this, "daiUSDC", this.dai, this.usdc, getBigNumber(10))
    await createSLP(this, "daiMIC", this.dai, this.mic, getBigNumber(10))
    // Set Grape fees to Maker
    await this.grapeMaster.setFeeTo(this.grapeMaker.address)
    // Whitelist Grape on Cellar
    await this.cellar.whitelistMasterContract(this.grapeMaster.address, true)
    // Approve and make Cellar token deposits
    await this.cham.approve(this.cellar.address, getBigNumber(10))
    await this.dai.approve(this.cellar.address, getBigNumber(10))
    await this.mic.approve(this.cellar.address, getBigNumber(10))
    await this.usdc.approve(this.cellar.address, getBigNumber(10))
    await this.weth.approve(this.cellar.address, getBigNumber(10))
    await this.strudel.approve(this.cellar.address, getBigNumber(10))
    await this.cellar.deposit(this.cham.address, this.alice.address, this.alice.address, getBigNumber(10), 0)
    await this.cellar.deposit(this.dai.address, this.alice.address, this.alice.address, getBigNumber(10), 0)
    await this.cellar.deposit(this.mic.address, this.alice.address, this.alice.address, getBigNumber(10), 0)
    await this.cellar.deposit(this.usdc.address, this.alice.address, this.alice.address, getBigNumber(10), 0)
    await this.cellar.deposit(this.weth.address, this.alice.address, this.alice.address, getBigNumber(10), 0)
    await this.cellar.deposit(this.strudel.address, this.alice.address, this.alice.address, getBigNumber(10), 0)
    // Approve Grape to spend 'alice' Cellar tokens
    await this.cellar.setMasterContractApproval(this.alice.address, this.grapeMaster.address, true, "0", "0x0000000000000000000000000000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000000000000000000000000000")
    // **TO-DO - Initialize Grape Pair**
    //const oracleData = await this.oracle.getDataParameter("1")
    //const initData = defaultAbiCoder.encode(["address", "address", "address", "bytes"], [this.cham.address, this.dai.address, this.oracle.address, oracleData])
    //await this.cellar.deploy(this.GrapeMaster.address, initData, true)
  })

  describe("setBridge", function () {
    it("only allows the owner to set bridge", async function () {
      await expect(this.grapeMaker.connect(this.bob).setBridge(this.cham.address, this.weth.address, { from: this.bob.address })).to.be.revertedWith("Ownable: caller is not the owner")
    })
    
    it("does not allow to set bridge for Champagne", async function () {
      await expect(this.grapeMaker.setBridge(this.cham.address, this.weth.address)).to.be.revertedWith("Maker: Invalid bridge")
    })

    it("does not allow to set bridge for WETH", async function () {
      await expect(this.grapeMaker.setBridge(this.weth.address, this.cham.address)).to.be.revertedWith("Maker: Invalid bridge")
    })

    it("does not allow to set bridge to itself", async function () {
      await expect(this.grapeMaker.setBridge(this.dai.address, this.dai.address)).to.be.revertedWith("Maker: Invalid bridge")
    })

    it("emits correct event on bridge", async function () {
      await expect(this.grapeMaker.setBridge(this.dai.address, this.cham.address))
        .to.emit(this.grapeMaker, "LogBridgeSet")
        .withArgs(this.dai.address, this.cham.address)
    })
  })
  
  describe("convert", function () {
    it("reverts if caller is not EOA", async function () {
      await expect(this.exploiter.convert(this.cham.address)).to.be.revertedWith("Maker: Must use EOA")
    })
  })
})
