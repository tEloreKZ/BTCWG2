const bitcoin = require('bitcoinjs-lib');
const bip39 = require('bip39');
const axios = require('axios');
const { SingleBar, Presets } = require('cli-progress');

function checkBitcoinBalance(address) {
  return axios.get(`https://chain.api.btc.com/v3/address/${address}`)
    .then(response => {
      const balanceData = response.data.data;
      if (balanceData && balanceData.balance) {
        const balance = balanceData.balance;
        return balance / 1e8; // Конвертация из сатоши в BTC
      } else {
        return 0;
      }
    })
    .catch(error => {
      console.log(`Ошибка при проверке баланса Bitcoin: ${error.message}`);
      return 0;
    });
}

function generateWallets(num, callback) {
  const progressBar = new SingleBar({}, Presets.shades_classic);
  progressBar.start(num, 0);

  const walletsToSave = [];

  const generateNextWallet = (index) => {
    if (index >= num) {
      progressBar.stop();
      callback(walletsToSave);
      return;
    }

    const mnemonic = bip39.generateMnemonic();
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const hdWallet = bitcoin.HDNode.fromSeedBuffer(seed);
    const path = "m/44'/0'/0'/0/0";
    const wallet = hdWallet.derivePath(path);
    const address = wallet.getAddress();

    const balancePromises = [
      checkBitcoinBalance(address)
    ];

    Promise.all(balancePromises)
      .then(balances => {
        walletsToSave.push({
          mnemonic,
          address,
          balances
        });

        progressBar.update(index + 1);
        generateNextWallet(index + 1);
      })
      .catch(error => {
        console.log(`Ошибка при проверке балансов кошелька ${index + 1}: ${error.message}\n`);
        progressBar.update(index + 1);
        generateNextWallet(index + 1);
      });
  };

  generateNextWallet(0);
}

module.exports = generateWallets;
