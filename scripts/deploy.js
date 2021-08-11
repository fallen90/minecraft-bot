const fs = require('fs');
const path = require('path');
const dist = path.join(__dirname, '../dist');
const scp = path.join(__dirname, './scp.sh');

if(fs.existsSync(scp)) fs.unlinkSync(scp);

fs.writeFileSync(scp,`#!/bin/sh\n`)

const read = () => {
  return fs.readFileSync(scp, 'utf-8');
}

const write = (filepath) => {
  const wait = `wait\necho "Completed"\n`;
  const contents = `scp ${filepath} root@45.77.156.150:/root/helper &\n`;

  let scpContents = read();
  
  scpContents = scpContents.replace(new RegExp(wait, 'gim'), '') + contents + wait
  fs.writeFileSync(scp, scpContents);
}

const walker = (filepath) => {
  const _files = fs.readdirSync(filepath);
  _files.forEach(file => {
    file = path.join(filepath, file);
    const isDir = fs.statSync(file).isDirectory();
  
    console.log(file, { isDir });
    if(isDir) walker(file);
    else write(file);
  })
}

walker(dist);


