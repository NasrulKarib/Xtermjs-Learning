import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { SearchAddon } from '@xterm/addon-search';
import { ClipboardAddon } from '@xterm/addon-clipboard';
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

let fitAddon, webLinksAddon, searchAddon, clipboardAddon;

function createAddons(){
    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    const searchAddon = new SearchAddon();
    const clipboardAddon = new ClipboardAddon();

    return {fitAddon, webLinksAddon, searchAddon, clipboardAddon};
}


function loadAddons(){
    const addons = createAddons();

    fitAddon = addons.fitAddon;
    webLinksAddon = addons.webLinksAddon;
    searchAddon = addons.searchAddon;
    clipboardAddon = addons.clipboardAddon;

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.loadAddon(searchAddon);
    term.loadAddon(clipboardAddon);
}

loadAddons();
term.open(document.getElementById('terminal'));
term.focus();

fitAddon.fit();
window.addEventListener('resize', ()=>{
    fitAddon.fit();
});

let currentInp = '';
let commandHistory = [];
let historyIndex = -1;
let tempInp = '';
const availableCommands = ['clear', 'quit', 'theme', 'cursor', 'fontsize', 'help'];

term.attachCustomKeyEventHandler(event =>{

    if(event.ctrlKey && event.key == 'q'){
        term.write('\x1b[31m\x1b[1mForce quit!\x1b[0m\r\n');
        setTimeout(() => {
            term.dispose();
            document.getElementById('terminal').innerHTML = '<p>Terminal closed.</p>';
        }, 500);
        return false;
    }
    if (event.ctrlKey && event.key === 'f') {
        const searchTerm = prompt('Enter search term:');
        if (searchTerm) {
            const result = searchAddon.findNext(searchTerm);
            if (result) {
                term.write(`\r\n\x1b[32mFound: "${searchTerm}"\x1b[0m\r\n`);
            } else {
                term.write(`\r\n\x1b[31mNot found: "${searchTerm}"\x1b[0m\r\n`);
            }
            term.write('Enter your command: ');
        }
        return false;
    }
    if (event.ctrlKey && event.key === 'c') {
        event.preventDefault();
        term.write('\r\n\x1b[32mText copied!\x1b[0m\r\n');
        term.write('Enter your command: ');
        return false;
    }
    if(event.key === 'F1'){
        term.write('\r\n\x1b[33m=== Shortcuts ===\x1b[0m\r\n');
        term.write('\x1b[37mCtrl+Q: Quit | F1: Help\x1b[0m\r\n');
        term.write('\x1b[37mCtrl+F: Search | Ctrl+C: Copy\x1b[0m\r\n');
        term.write('\x1b[37m↑/↓: History | Esc: Cancel\x1b[0m\r\n');
        term.write('Enter your command: ' + currentInp);
        return false;
    }

    if(event.key === 'ArrowUp'){
        if(commandHistory.length>0 && historyIndex<commandHistory.length-1){
            if(historyIndex == -1) tempInp = currentInp;
            historyIndex++;
            clearCurrentLine();
            currentInp = commandHistory[commandHistory.length - historyIndex - 1];
            term.write(currentInp);
        }
        return false;
    }

    if(event.key === 'ArrowDown'){
        if(historyIndex > -1){
            historyIndex--;
            clearCurrentLine();
            currentInp = historyIndex === -1 ? tempInp : commandHistory[commandHistory.length-1-historyIndex];
            term.write(currentInp);
            if(historyIndex === -1) tempInp = '';
        }
        return false;
    }

    if(event.key == 'Escape'){
        clearCurrentLine();
        currentInp = '';
        term.write('\r\nCancelled. Enter your command: ');
        return false;
    }

    return true;
})

function clearCurrentLine() {
    for (let i = 0; i < currentInp.length; i++) {
        term.write('\b \b');
    }
}

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

function demo(){
   typeWrite('\x1b[31m\x1b[1mWelcome to xtermjs...\x1b[0m\r\n')
   .then(() => {
       term.write("Check https://xtermjs.org/ for official documentation\r\n\n")
       term.write("Commands: clear, quit, theme, cursor, fontsize, history, help\r\n\n");
       term.write("Enter your command: ");
   });
}
demo();


term.onData(data => {
    const code = data.charCodeAt(0);
    
    if (code === 13) { // Enter key
        term.write('\r\n');
        if(currentInp.trim()){
            if (currentInp.trim() !== '' && commandHistory[commandHistory.length - 1] !== currentInp.trim()) {
                commandHistory.push(currentInp.trim());
                if (commandHistory.length > 50) commandHistory.shift();
            }
            historyIndex = -1;
            tempInp = '';

            if(currentInp == "clear"){
                term.clear();
                demo();
                term.focus();
            }

            else if(currentInp == "quit"){
                term.write('\x1b[31m\x1b[1mGoodbye!\x1b[0m\r\n');
                setTimeout(() => {
                    term.dispose();
                    document.getElementById('terminal').innerHTML = '<p>Terminal closed.</p>';
                },1000);
                return;
            }

            else if (currentInp == "theme"){
                const themes = [
                    { background: '#292727ff', foreground: '#15bf1bff' }, 
                    { background: '#000000', foreground: '#ffffff' },     
                    { background: '#1e3a8a', foreground: '#ffffff' },     
                    { background: '#7f1d1d', foreground: '#fdfdfdff' }      
                ];

                const currentTheme = term.options.theme;
                const currentIndex = themes.findIndex(idx => idx.background === currentTheme.background)
                const nextIndex = (currentIndex + 1)%themes.length;

                term.options.theme = themes[nextIndex];

                term.write(`\x1b[33mTheme changed to ${nextIndex + 1}\x1b[0m\r\n`);
                term.write('Enter your command: ');
                
            }
            
            else if(currentInp == 'cursor'){
                const styles = ['block','underline','bar'];
                const currentStyle =  term.options.cursorStyle;
                const currentIndex = styles.indexOf(currentStyle);
                const nextIndex = (currentIndex + 1) % styles.length;

                term.options.cursorStyle = styles[nextIndex];

                term.write(`\x1b[36mCursor style: ${styles[nextIndex]}\x1b[0m\r\n`);
                term.write('Enter your command: ');

            }
            
            else if(currentInp == "fontsize"){
                const currentSize = term.options.fontSize;
                const sizes = [12, 14, 16, 18, 20];
                const currentIndex = sizes.indexOf(currentSize);
                const nextIndex = (currentIndex + 1) % sizes.length;
                
                term.options.fontSize = sizes[nextIndex];
                term.write(`\x1b[37mFont size changed to ${sizes[nextIndex]}px\x1b[0m\r\n`);
                term.write('Enter your command: ');
            }

            else if(currentInp == "help"){
                term.write('\x1b[37mAvailable commands:\x1b[0m\r\n');
                term.write('\x1b[37m  clear  - clear screen\x1b[0m\r\n');
                term.write('\x1b[37m  theme  - cycle through themes\x1b[0m\r\n');
                term.write('\x1b[37m  cursor - change cursor style\x1b[0m\r\n');
                term.write('\x1b[37m  size   - toggle terminal size\x1b[0m\r\n');
                term.write('\x1b[37m  history  - show command history\x1b[0m\r\n');
                term.write('\x1b[37m  quit   - exit terminal\x1b[0m\r\n');
                term.write('\x1b[37m  help   - show this help\x1b[0m\r\n');
                term.write('Enter your command: ');
            }
            else if(currentInp == "history"){
                term.write('\x1b[35mCommand History:\x1b[0m\r\n');
                if(commandHistory.length === 0) {
                    term.write('\x1b[37m  No commands in history\x1b[0m\r\n');
                } else {
                    commandHistory.forEach((cmd, index) => {
                        term.write(`\x1b[37m  ${index + 1}. ${cmd}\x1b[0m\r\n`);
                    });
                }
                term.write('Enter your command: ');
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
            if(historyIndex === -1) {
                tempInp = '';
            } else {
                historyIndex = -1;
                tempInp = '';
            }
        }
    } 
    else{ // Only printable characters
        currentInp += data;
        term.write(data);
        console.log(historyIndex)
        if(historyIndex !== -1) {
            historyIndex = -1;
            tempInp = '';
        }
    }
});

