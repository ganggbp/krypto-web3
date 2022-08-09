const main = async () => {
  const Transactions = await ethers.getContractFactory('Transactions');
  const transactions = await Transactions.deploy();

  await transactions.deployed();
};

const runMain = async () => {
  try {
    await main();
    process.exit(0); // exit(0) == process went successfully
  } catch (error) {
    console.error(error);
    process.exit(1); // exit(1) == process have an error
  }
};

runMain();
