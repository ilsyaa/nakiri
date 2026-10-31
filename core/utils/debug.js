import util from 'util';
import pc from 'picocolors';

function getCallerInfo() {
  const err = new Error();
  const stack = err.stack?.split('\n') || [];

  if (stack.length > 3) {
    const callerLine = stack[3];
    const match = callerLine.match(
      /at\s+(?:.*\s+\()?(?:file:\/\/)?(.+:\d+:\d+)\)?/
    );

    if (match && match[1]) {
      let callerPath = match[1];
      callerPath = callerPath.replace(/\/\.([^\/]+?)_\d+\.tmp\.js/g, '/$1.js');
      return callerPath;
    }
  }

  return 'Unknown location';
}

export const dump = (...args) => {
  const time = new Date().toLocaleTimeString();
  const caller = getCallerInfo();
  const headerText = ` DUMP | ${time} | ${caller} `;
  const terminalWidth = process.stdout.columns || 80;
  const separator = '-'.repeat(terminalWidth);

  console.log(pc.cyan(`\n${separator}`));
  console.log(pc.bold(pc.cyan(`🐛 ${headerText}`)));
  console.log(pc.cyan(`${separator}`));

  args.forEach((arg) => {
    console.log(
      util.inspect(arg, { showHidden: false, depth: null, colors: true })
    );
  });

  console.log(pc.cyan(`${separator}\n`));
};

export const dd = (...args) => {
  dump(...args);
  process.exit(1);
};

export default { dump, dd };
