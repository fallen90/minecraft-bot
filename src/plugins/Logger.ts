import chalk from 'chalk';

export class Logger {
  name: string;
  handler: any = console.log;

  constructor(name?: string) {
    this.name = name || 'Logger';
  }

  log(...args: any[]) {
    const color = (() => {
      if(this.name.includes('Plugins')) return chalk.green;
      else return chalk.magenta;
    })();
    this.handler(color`[${this.name}]`, chalk.whiteBright(args.join(' ')));
  }

  setLogHandler(handler: any){
    this.handler = handler;
  }
}
