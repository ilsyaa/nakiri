module.exports = async function ({
  id,
  sock
}) {
  await require('./group.js')({
    id,
    sock
  });

  await require('./message.js')({
    id,
    sock
  });
};
