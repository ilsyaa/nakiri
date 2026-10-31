export interface CommandDefinition {
  name: string
  aliases?: string[]
  category: string
  description: string
  usage?: string
  execute: (args: string[], options: Record<string, any>) => Promise<any> | any
}

export function defineCommand(definition: CommandDefinition): CommandDefinition

export function parseCliArgs(rawArgs: string[]): {
  command: string
  args: string[]
  options: Record<string, any>
}

export class CliRegistry {
  commands: Map<string, CommandDefinition>
  aliases: Map<string, string>
  register(commandDef: CommandDefinition): this
  has(name?: string): boolean
  get(name?: string): CommandDefinition | undefined
  list(): CommandDefinition[]
  printHelp(): void
  run(rawArgs: string[]): Promise<number>
}

export default CliRegistry
