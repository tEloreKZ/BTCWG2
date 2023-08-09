const fs = require('fs');
const readline = require('readline');
const generateWallets = require('./generateWallet');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Сколько seed фраз вы хотите сгенерировать? ', (numSeedPhrases) => {
  const num = parseInt(numSeedPhrases);

  if (num <= 0) {
    console.log('Пожалуйста, введите корректное число.');
    rl.close();
    return;
  }

  rl.question('Сохранить все результаты (да/нет)? ', (saveAll) => {
    const saveAllLowerCase = saveAll.trim().toLowerCase();

    if (saveAllLowerCase !== 'да' && saveAllLowerCase !== 'нет') {
      console.log('Пожалуйста, ответьте "да" или "нет".');
      rl.close();
      return;
    }

    generateWallets(num, (wallets) => {
      if (saveAllLowerCase === 'да') {
        const content = wallets.map(wallet => JSON.stringify(wallet)).join('\n');
        fs.writeFileSync('gen.txt', content);
        console.log('Все результаты успешно сохранены в файл gen.txt');
      } else if (saveAllLowerCase === 'нет') {
        const walletsWithPositiveBalances = wallets.filter(wallet => wallet.balances.some(balance => balance > 0));
        if (walletsWithPositiveBalances.length > 0) {
          const content = walletsWithPositiveBalances.map(wallet => JSON.stringify(wallet)).join('\n');
          fs.writeFileSync('gen.txt', content);
          console.log('Результаты с положительными балансами успешно сохранены в файл gen.txt');
        } else {
          console.log('Не найдено кошельков с положительными балансами. Файл не сохранен.');
        }
      }
      rl.close();
    });
  });
});
