certoraRun spec/harnesses/WineMakerV2Harness.sol spec/harnesses/DummyERC20A.sol spec/harnesses/DummyERC20B.sol spec/harnesses/DummyCHAM.sol --link WineMakerV2Harness:CHAM=DummyCHAM --settings -assumeUnwindCond,-enableStorageAnalysis=true,-ciMode=true --verify WineMakerV2Harness:spec/WineMakerV2.spec --cache WineMakerV2 --msg "WineMakerV2"
