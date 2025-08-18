// const { WAProto } = require('baileys');
const { Command, commands } = require('../../utils/command.js');
// const { metadl } = require('../../utils/scrape.js');
// const { deletedMessagesLog } = require('../../utils/globalMap.js');
const Blockchain = require('../../utils/blockchain.js');
const { default: axios } = require('axios');

Command({
  name: 'test',
  description: 'Test command',
  alias: ['test'],
  // eslint-disable-next-line no-unused-vars
  run: async ({ sock, m, options }) => {
    console.log(m);
    // let text = '';
    // console.log(commands.entries());
    // const url = 'https://www.youtube.com/watch?v=0lDfQT0yiwc';
    // const format = 'mp3';
    // const { data: downloadInit } = await axios.get('https://p.oceansaver.in/ajax/download.php?copyright=0&format=' + format + '&url=' + url);
    // const { data: downloadUrl } = await axios.get(downloadInit.progress_url);
    // console.log(downloadUrl.download_url);
  }
});
