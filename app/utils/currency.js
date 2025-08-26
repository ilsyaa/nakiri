const { prisma } = require('./prisma.js');
const luxon = require('luxon');
const { isJidUser } = require('baileys');
const { consola } = require('consola');
const EventEmitter = require('events');

class Currency {
  constructor() {
    this.minerMap = new Map();
    this.messageHistoryMap = new Map();
    this.metadata = null;
    this.isProcessing = false;
    this.timeoutMiner = null;
    this.lastMinerIndex = 0;
    this.MINING_TIMEOUT_MINUTES = 1;
    this.PRECISION_MULTIPLIER = 100000000;
    this.MIN_REWARD = 0.00000001;
    this.ev = new EventEmitter();
  }

  /**
   * Initialize coin metadata from database
   * @returns {Promise<void>}
   */
  async init() {
    try {
      let init = await prisma.CurrencyMetadata.findFirst();

      if (!init) {
        init = await prisma.CurrencyMetadata.create({
          data: {
            maxSupply: 100000000,
            currentSupply: 0,
            initialReward: 100,
            halvingInterval: 500000,
            transferFee: 0.01,
          },
        });
      }

      this.metadata = init;
    } catch (error) {
      console.error('[CC] Failed to initialize metadata:', error);
      throw new Error('Failed to initialize coin system');
    }
  }

  /**
   * Get current transfer fee from metadata
   * @returns {number}
   */
  get transferFee() {
    return this.metadata?.transferFee || 0.01;
  }

  /**
   * Round amount to 8 decimal places for precision
   * @param {number} amount 
   * @returns {number}
   */
  roundAmount(amount) {
    return Math.round(amount * this.PRECISION_MULTIPLIER) / this.PRECISION_MULTIPLIER;
  }

  /**
   * Transfer coins between users
   * @param {Object} params
   * @param {string} params.fromJid - Sender JID
   * @param {string} params.toJid - Receiver JID  
   * @param {number} params.amount - Amount to transfer
   * @returns {Promise<Object>} Transaction result
   */
  async transfer({ fromJid, toJid, amount }) {
    // Input validation
    if (!isJidUser(fromJid) || !isJidUser(toJid)) {
      throw new Error(__('currency.util.invalidJid'));
    }

    if (typeof amount !== 'number' || amount <= 0 || !isFinite(amount)) {
      throw new Error(__('currency.util.invalidAmount'));
    }

    if (fromJid === toJid) {
      throw new Error(__('currency.util.sameJid'));
    }

    try {
      return await prisma.$transaction(async (tx) => {
        // Fetch users concurrently
        const [fromUser, toUser] = await Promise.all([
          tx.user.findUnique({ where: { jid: fromJid } }),
          tx.user.findUnique({ where: { jid: toJid } })
        ]);

        if (!fromUser || !toUser) {
          throw new Error(__('currency.util.userNotFound'));
        }

        const fee = this.roundAmount(amount * this.transferFee);
        const totalDeduct = this.roundAmount(amount + fee);

        if (fromUser.balance < totalDeduct) {
          throw new Error(__('currency.util.insufficientBalance'));
        }

        // Create transaction record
        const transaction = await tx.transaction.create({
          data: {
            fromAddress: fromUser.jid,
            toAddress: toUser.jid,
            amount: this.roundAmount(amount),
            fee,
            status: 'pending',
          },
        });

        // Update sender balance
        await tx.user.update({
          where: { jid: fromUser.jid },
          data: {
            balance: this.roundAmount(fromUser.balance - totalDeduct),
          },
        });

        // Trigger mining process asynchronously
        setImmediate(() => this.minerHandler());

        return {
          id: transaction.id,
          status: transaction.status,
          amount: this.roundAmount(amount),
          fee,
          totalPaid: totalDeduct,
          timestamp: transaction.createdAt,
          users: {
            from: {
              jid: fromUser.jid,
              pushName: fromUser.pushName
            },
            to: {
              jid: toUser.jid,
              pushName: toUser.pushName
            },
          },
        };
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Start mining process for a user
   * @param {string} jid - User JID
   * @param {number} remainingMines - Repeat count (default: 1)
   * @returns {Promise<boolean>}
   */
  async mine({ jid, remainingMines = 1 }) {
    if (!isJidUser(jid)) {
      throw new Error(__('currency.util.invalidJid'));
    }

    if (typeof remainingMines !== 'number' || remainingMines < 1) {
      throw new Error(__('currency.util.invalidReminingMines'));
    }

    if (this.minerMap.has(jid)) {
      throw new Error(__('currency.util.alreadyMining'));
    }

    try {
      const user = await prisma.user.findUnique({ where: { jid } });
      if (!user) {
        throw new Error(__('currency.util.userNotFound'));
      }

      this.minerMap.set(jid, {
        remainingMines,
        history: [],
        timestamp: luxon.DateTime.now(),
      });

      this.minerHandler();
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle mining process and transaction processing
   */
  async minerHandler() {
    if (this.minerMap.size === 0) return;
    
    try {
      const pendingTransaction = await prisma.transaction.findFirst({
        where: { status: 'pending' },
      });
      const miner = this.getNextMiner();
      if (pendingTransaction) {
        await this.handlePendingTransactions(miner);
        this.isProcessing = false;
      } else if (this.metadata.currentSupply <= this.metadata.maxSupply) {
        this.scheduleNextMining(miner);
      }
    } catch (error) {
      consola.error('[CC] Miner handler error:', error);
      this.isProcessing = false;
    }
  }

  /**
   * Handle pending transactions processing
   */
  async handlePendingTransactions(minerMap) {
    if (this.timeoutMiner) {
      clearTimeout(this.timeoutMiner);
      this.timeoutMiner = null;
    }

    if (this.isProcessing) return;
    
    this.isProcessing = true;

    try {
      await prisma.$transaction(async (tx) => {
        const pendingTx = await tx.transaction.findMany({
          where: { status: 'pending' },
          orderBy: { createdAt: 'asc' }
        });

        if (pendingTx.length === 0) return;

        let totalFee = 0;

        for (const transaction of pendingTx) {
          await tx.user.update({
            where: { jid: transaction.toAddress },
            data: {
              balance: { increment: this.roundAmount(transaction.amount) }
            }
          });

          await tx.transaction.update({
            where: { id: transaction.id },
            data: { status: 'completed' }
          });

          totalFee += transaction.fee;

          minerMap.history.push({
            type: 'transaction',
            transaction: {
              id: transaction.id,
              status: 'completed',
              amount: this.roundAmount(transaction.amount),
              fee: transaction.fee,
              totalPaid: this.roundAmount(transaction.amount + transaction.fee),
              timestamp: transaction.createdAt,
              users: {
                from: {
                  jid: transaction.fromAddress,
                },
                to: {
                  jid: transaction.toAddress,
                },
              },
            }
          });
        }

        const minerPrisma = await tx.user.findUnique({
          where: { jid: minerMap.jid }
        });

        if (!minerPrisma) {
          throw new Error(__('currency.util.userNotFound'));
        }

        let totalReward = this.roundAmount(totalFee);
        let supplyReward = 0;

        try {
          supplyReward = await this.calculateSupplyReward(tx);
          totalReward = this.roundAmount(totalReward + supplyReward);
          minerMap.history.push({
            type: 'reward',
            reward: this.roundAmount(supplyReward),
          });
        } catch {}

        await tx.user.update({
          where: { jid: minerMap.jid },
          data: {
            balance: this.roundAmount(minerPrisma.balance + totalReward),
          },
        });

        minerMap.remainingMines = minerMap.remainingMines - 1;
        this.minerMap.set(minerMap.jid, minerMap);

        if (minerMap.remainingMines == 0) {
          this.removeMiner(minerMap.jid);

          this.ev.emit('miner', { 
            minerMap,
          });
        }

        this.ev.emit('transaction', {
          minerMap,
          transactions: pendingTx.map((transaction) => ({
            ...transaction,
            status: 'completed',
          }))
        });
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Schedule next mining cycle
   */
  scheduleNextMining(minerMap) {
    if (this.timeoutMiner) return;
    console.log('Scheduling next mining cycle...');

    this.timeoutMiner = setTimeout(async () => {
      try {
        console.log('Processing reward supply...');
        let reward = 0;
  
        await prisma.$transaction(async (tx) => {
          reward = await this.calculateSupplyReward(tx);
          await tx.user.update({
            where: { jid: minerMap.jid },
            data: {
              balance: { increment: this.roundAmount(reward) }
            }
          });
        });
  
        clearTimeout(this.timeoutMiner);
        this.timeoutMiner = null;
  
        minerMap.remainingMines = minerMap.remainingMines - 1;
        this.minerMap.set(minerMap.jid, minerMap);
  
        if (minerMap.remainingMines == 0) {
          this.removeMiner(minerMap.jid);
        }
  
        this.minerHandler();

        this.ev.emit('miner', {
          minerMap,
          supplyReward: this.roundAmount(reward),
          totalReward: this.roundAmount(reward),
          totalFee: 0,
          transactions: []
        });
      } catch (error) {
        consola.error('[CC] Error scheduling next mining cycle:', error);
      }
    }, this.MINING_TIMEOUT_MINUTES * 60 * 1000);
  }

  /**
   * Calculate current mining reward based on halving
   * @returns {Promise<number>}
   */
  async getCurrentReward() {
    if (!this.metadata) {
      throw new Error('Metadata not initialized');
    }

    const halvingCount = Math.floor(this.metadata.currentSupply / this.metadata.halvingInterval);
    const reward = this.metadata.initialReward / Math.pow(2, halvingCount);
    return Math.max(reward, this.MIN_REWARD);
  }

  /**
   * Get next miner from the queue (round-robin)
   * @returns {string|null}
   */
  getNextMiner() {
    const miners = Array.from(this.minerMap.keys());
    const selectedMiner = miners[this.lastMinerIndex % miners.length];
    this.lastMinerIndex++;

    if (miners.length === 0) {
      return null;
    }
    
    return {
      jid: selectedMiner,
      ...this.minerMap.get(selectedMiner)
    };
  }

  /**
   * Remove miner from the queue
   * @param {string} minerJid - JID of the miner
   */
  removeMiner(minerJid) {
    const currentMiners = Array.from(this.minerMap.keys());
    const removedIndex = currentMiners.indexOf(minerJid);

    this.minerMap.delete(minerJid);

    if (removedIndex !== -1 && removedIndex <= this.lastMinerIndex) {
      this.lastMinerIndex--;
    }

    if (this.minerMap.size === 0) {
      this.lastMinerIndex = 0;
    }
  }

  /**
   * Calculate supply reward for mining
   * @param {Object} tx - Prisma transaction object
   * @returns {Promise<number>}
   */
  async calculateSupplyReward(tx) {
    if (this.metadata.currentSupply >= this.metadata.maxSupply) {
      throw new Error(__('currency.util.maxSupply'));
    }

    const reward = await this.getCurrentReward();
    const newSupply = this.roundAmount(this.metadata.currentSupply + reward);

    await tx.CurrencyMetadata.updateMany({
      where: {},
      data: { currentSupply: newSupply },
    });

    this.metadata.currentSupply = newSupply;

    return reward;
  }

  /**
   * Get current system status and mining info
   * @returns {Promise<Object>}
   */
  async statusInfo() {
    try {
      const currentReward = await this.getCurrentReward();
      const supplyPercentage = ((this.metadata.currentSupply / this.metadata.maxSupply) * 100).toFixed(2);

      return {
        totalMiners: this.minerMap.size,
        isProcessing: this.isProcessing,
        metadata: {
          maxSupply: this.metadata.maxSupply,
          halvingInterval: this.metadata.halvingInterval,
          transferFee: this.metadata.transferFee,
          initialReward: this.metadata.initialReward,
          currentReward,
          currentSupply: this.metadata.currentSupply,
          supplyPercentage: `${supplyPercentage}%`,
        }
      };
    } catch {
      throw new Error('Failed to retrieve system status');
    }
  }

  /**
   * Cleanup resources on shutdown
   */
  cleanup() {
    if (this.timeoutMiner) {
      clearTimeout(this.timeoutMiner);
      this.timeoutMiner = null;
    }
    this.minerMap.clear();
    this.isProcessing = false;
  }
}

const currencyInstance = new Currency();
module.exports = currencyInstance;