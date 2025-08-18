const { Command } = require('../../../utils/command.js');
const { delay } = require('baileys');
const crypto = require('crypto');

// ====== KONFIGURASI PROBABILITAS & BAYARAN ======
const PROB = {
  jackpot: 0.05,   // 5%   -> 3 simbol sama
  twomatch: 0.20,  // 20%  -> 2 simbol sama
  none: 0.75       // 75%  -> tidak ada yang sama 2/3
};
// (opsional) payout jika pakai taruhan: faktor pengali dari bet
const PAYOUT = { jackpot: 10, twomatch: 2, none: 0 };

// Helper RNG pakai crypto biar adil
function rng01() {
  // integer 0..1e9-1 lalu dibagi 1e9
  return crypto.randomInt(0, 1_000_000_000) / 1_000_000_000;
}

function decideOutcome() {
  const r = rng01();
  const pJack = PROB.jackpot;
  const pTwo  = PROB.twomatch;
  if (r < pJack) return 'jackpot';
  if (r < pJack + pTwo) return 'twomatch';
  return 'none';
}

const symbols = ['🍒', '🍋', '🍉', '🍇', '⭐', '💎', '7️⃣'];

// Bangun 3 simbol final berdasarkan outcome
function buildFinalSpin(outcome) {
  if (outcome === 'jackpot') {
    const s = symbols[crypto.randomInt(0, symbols.length)];
    return [s, s, s];
  }
  if (outcome === 'twomatch') {
    const a = symbols[crypto.randomInt(0, symbols.length)];
    // pastikan b != a
    let b;
    do { b = symbols[crypto.randomInt(0, symbols.length)]; } while (b === a);
    // acak posisi mana yang beda
    const posDiff = crypto.randomInt(0, 3); // 0,1,2
    const arr = [a, a, a];
    arr[posDiff] = b;
    return arr;
  }
  // outcome: none -> pastikan ketiganya berbeda
  let a = symbols[crypto.randomInt(0, symbols.length)];
  let b, c;
  do { b = symbols[crypto.randomInt(0, symbols.length)]; } while (b === a);
  do {
    c = symbols[crypto.randomInt(0, symbols.length)];
  } while (c === a || c === b);
  // acak urutan
  const arr = [a,b,c];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i+1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Untuk efek “berputar” saat edit pesan
function randomSpin() {
  return [
    symbols[crypto.randomInt(0, symbols.length)],
    symbols[crypto.randomInt(0, symbols.length)],
    symbols[crypto.randomInt(0, symbols.length)],
  ];
}

Command({
  name: 'game-slot',
  description: 'Main slot dengan probabilitas terkontrol',
  alias: ['slot', 'jackpot'],
  run: async ({ sock, m /*, dbUser, bet */ }) => {
    // (opsional) ambil bet dari argumen & validasi saldo user
    const outcome = decideOutcome();
    const finalSpin = buildFinalSpin(outcome);

    // Kirim pesan awal
    let msg = await sock.sendMessage(m.chat, { text: `🎰 | ${randomSpin().join(' ')} |` }, { quoted: m });

    // Edit beberapa kali untuk animasi
    for (let i = 0; i < 6; i++) {
      await delay(450);
      await sock.sendMessage(m.chat, { text: `🎰 | ${randomSpin().join(' ')} |`, edit: msg.key });
    }

    // (opsional) hitung payout kalau pakai taruhan
    const bet = 100; // contoh
    const winAmount = Math.floor(bet * PAYOUT[outcome]);

    await delay(650);
    const label = outcome === 'jackpot' ? '🎉 JACKPOT!!!' : outcome === 'twomatch' ? '✨ Lumayan!' : '😢 Coba lagi!';

    await sock.sendMessage(m.chat, {
      text: `🎰 | ${finalSpin.join(' ')} |\n\n${label}` + `\nHasil: ${outcome} | Payout: ${winAmount}`,
      edit: msg.key
    });
  }
});
