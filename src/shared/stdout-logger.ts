const stdout = (...args:any[]) => {
  process.stdout.write(`${args.join(' ')}\n`)
}

export default stdout;