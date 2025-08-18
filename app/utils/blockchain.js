const crypto = require('crypto');

// Kelas untuk merepresentasikan satu transaksi
class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.timestamp = Date.now();
  }

  // Menghitung hash dari transaksi untuk integritas
  calculateHash() {
    return crypto.createHash('sha256').update(this.fromAddress + this.toAddress + this.amount + this.timestamp).digest('hex');
  }

  // Menandatangani transaksi dengan kunci privat
  signTransaction(signingKey) {
    // Implementasi penandatanganan akan lebih kompleks, untuk contoh ini kita abaikan
    // Anggap saja ini adalah validasi sederhana
    const hashTx = this.calculateHash();
    // Di sini kita akan menggunakan kunci publik dari 'fromAddress' untuk verifikasi
    // Asumsi: 'fromAddress' adalah kunci publik
    // this.signature = signingKey.sign(hashTx, 'base64');
    // Untuk contoh sederhana, kita hanya menandai bahwa transaksi ini 'ditandatangani'
    this.signature = 'signed';
  }

  // Memeriksa apakah transaksi valid
  isValid() {
    // Transaksi 'mining reward' tidak memiliki 'fromAddress'
    if (this.fromAddress === null) return true;
    
    if (!this.signature || this.signature.length === 0) {
      throw new Error('No signature in this transaction');
    }
    
    // Logika verifikasi tanda tangan akan lebih kompleks
    // Untuk contoh ini, kita hanya memastikan tanda tangan ada
    return this.signature === 'signed';
  }
}

// Kelas untuk merepresentasikan satu blok dalam rantai
class Block {
  constructor(timestamp, transactions, previousHash = '') {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0; // Nomor acak yang akan diubah untuk menemukan hash yang valid (Proof of Work)
    this.hash = this.calculateHash();
  }

  // Menghitung hash dari blok
  calculateHash() {
    return crypto.createHash('sha256').update(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).digest('hex');
  }

  // Implementasi Proof of Work
  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log('Block mined: ' + this.hash);
  }

  // Memeriksa validitas semua transaksi dalam blok
  hasValidTransactions() {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false;
      }
    }
    return true;
  }
}

// Kelas utama untuk mengelola seluruh rantai
class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 4; // Tingkat kesulitan penambangan
    this.pendingTransactions = [];
    this.miningReward = 50; // Hadiah awal untuk penambang
    this.halvingInterval = 20; // Halving setiap 20 blok
    this.maxSupply = 50000000; // Suplai maksimal
    this.currentSupply = 0;
  }

  // Membuat blok pertama (genesis block)
  createGenesisBlock() {
    return new Block('01/01/2025', [], '0');
  }

  // Mendapatkan blok terakhir di rantai
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  // Menambahkan transaksi baru ke dalam daftar transaksi yang tertunda
  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must include from and to address');
    }

    if (!transaction.isValid()) {
      throw new Error('Cannot add invalid transaction to chain');
    }

    this.pendingTransactions.push(transaction);
  }

  // Proses penambangan blok
  minePendingTransactions(miningRewardAddress) {
    // 1. Hitung total biaya (fee) dari transaksi yang tertunda
    let totalFee = this.pendingTransactions.reduce((acc, tx) => acc + (tx.fee || 0), 0);
    
    // 2. Buat transaksi reward untuk penambang
    // Reward = miningReward + totalFee
    const rewardTransaction = new Transaction(null, miningRewardAddress, this.miningReward + totalFee);

    // 3. Tambahkan transaksi reward ke daftar transaksi yang tertunda
    this.pendingTransactions.push(rewardTransaction);
    
    // 4. Buat blok baru dan tambahkan transaksi tertunda
    let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);

    // 5. Perbarui suplai
    this.currentSupply += this.miningReward + totalFee;
    if (this.currentSupply > this.maxSupply) {
      console.log('Maximum supply reached. No more rewards will be given.');
      return;
    }

    // 6. Tambahkan blok baru ke rantai
    this.chain.push(block);
    
    // 7. Lakukan halving jika sudah waktunya
    if (this.chain.length % this.halvingInterval === 0 && this.miningReward > 1) {
      this.miningReward = Math.floor(this.miningReward / 2);
      console.log(`Halving event occurred! New mining reward is ${this.miningReward}.`);
    }

    // 8. Kosongkan transaksi tertunda untuk blok berikutnya
    this.pendingTransactions = [];
  }

  // Mendapatkan saldo dari sebuah alamat
  getBalanceOfAddress(address) {
    let balance = 0;
    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount;
          if (trans.fee) {
            balance -= trans.fee;
          }
        }
        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }
    return balance;
  }

  // Mendapatkan informasi rantai
  getChainInfo() {
    return {
      chainLength: this.chain.length,
      difficulty: this.difficulty,
      pendingTransactions: this.pendingTransactions.length,
      currentMiningReward: this.miningReward,
      currentSupply: this.currentSupply,
      maxSupply: this.maxSupply,
      halvingInterval: this.halvingInterval,
    };
  }

  // Memvalidasi integritas seluruh rantai
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // 1. Cek validitas semua transaksi dalam blok saat ini
      if (!currentBlock.hasValidTransactions()) {
        return false;
      }
      
      // 2. Cek apakah hash blok saat ini valid
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      // 3. Cek apakah hash sebelumnya di blok saat ini sama dengan hash blok sebelumnya
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}

module.exports = Blockchain;