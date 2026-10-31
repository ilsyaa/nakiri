#!/usr/bin/env node
import { runCli } from '@nakiri/core/services/cli';

const exitCode = await runCli(process.argv.slice(2));
process.exit(exitCode);
