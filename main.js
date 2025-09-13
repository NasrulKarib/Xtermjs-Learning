import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';

const term = new Terminal({
    cols: 80,
    rows: 24,
    cursorBlink: true,
    theme: {
        background: '#292727ff',
        foreground: '#15bf1bff'
    }
});

term.open(document.getElementById('terminal'));


function typeWrite(text, delay = 50) {
    return new Promise(resolve =>{
        let i = 0;
        const timer = setInterval(() => {
          term.write(text[i]);
          i++;
          if (i >= text.length) {
            clearInterval(timer);
            resolve();
          }
        }, delay);
    })
}

async function demo(){
   await typeWrite('\x1b[31m\x1b[1mWelcome to xtermjs...\x1b[0m\r\n');
   term.write("Enter your command: ")
}
demo();

let currentInp = ''
term.onData(data => {
    const code = data.charCodeAt(0);
    
    if (code === 13) { // Enter key
        term.write('\r\n');
        if(currentInp.trim()){
            if(currentInp == "clear"){
                term.clear();
                demo();
            }
            else {
                term.write(`Hello, ${currentInp}!\r\n`);
                term.write('Enter your command: ');
            }
        }
        currentInp = ''; 
    } 
    else if (code === 127) { // Backspace
        if (currentInp.length > 0) {
            currentInp = currentInp.slice(0, -1);
            term.write('\b \b'); // Visual backspace
        }
    } 
    else if (code >= 32) { // Only printable characters
        currentInp += data;
        term.write(data);
    }
});

