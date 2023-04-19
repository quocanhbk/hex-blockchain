import chalk from "chalk"

export class Logger {
  private readonly context: string

  constructor(context: string) {
    this.context = context
  }

  public error(...messages: string[]): void {
    const message = messages.join(" ")
    console.log(chalk.red(`[${this.context}] ${message}`))
  }

  public info(...messages: string[]): void {
    const message = messages.join(" ")
    console.log(chalk.cyan(`[${this.context}] ${message}`))
  }

  public warn(...messages: string[]): void {
    const message = messages.join(" ")
    console.log(chalk.hex("#FFFF00")(`[${this.context}] ${message}`))
  }

  public log(...messages: string[]): void {
    const message = messages.join(" ")
    console.log(chalk.green(`[${this.context}] ${message}`))
  }
}

export default Logger
