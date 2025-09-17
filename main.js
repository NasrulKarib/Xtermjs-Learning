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
    allowProposedApi : true,
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
    
    if(event.type == 'keydown'){

        if(event.ctrlKey && event.key == 'q'){
            event.preventDefault(); 
            term.write('\x1b[31m\x1b[1mForce quit!\x1b[0m\r\n');
            setTimeout(() => {
                term.dispose();
                document.getElementById('terminal').innerHTML = '<p>Terminal closed.</p>';
            }, 500);
            return false;
        }

        if (event.ctrlKey && event.key === 'f') {
            event.preventDefault(); 
            const searchTerm = prompt('Enter search term:');
            if (searchTerm) {
                searchAddon.clearDecorations();
                
                const result = searchAddon.findNext(searchTerm, {
                    decorations: {
                        matchBackground: '#ffff00',      // Yellow highlight
                        matchBorder: '#ff0000',          // Red border  
                        activeMatchBackground: '#ff6600', // Orange for current match
                        activeMatchBorder: '#ff0000'
                    }
                });
                
                if (result) {  
                    term.write(`\r\n\x1b[32mSearch results highlighted for "${searchTerm}"\x1b[0m\r\n`);
                } else {
                    term.write(`\r\n\x1b[31mNot found: "${searchTerm}"\x1b[0m\r\n`);
                }
                term.write('Enter your command: ');
            }
            return false;
        }

        if (event.ctrlKey && event.key === 'c') {
            event.preventDefault(); 

            const selection = term.getSelection();

            if(selection && selection.trim()){
                const displayText = selection.length > 50 ? selection.substring(0, 50) + '...' : selection;
                term.write(`\r\n\x1b[32mCopied: "${displayText}"\x1b[0m\r\n`);
            } else{
                term.write('\r\n\x1b[33mNo text selected to copy\x1b[0m\r\n');
            }
            term.write('Enter your command: ');
            return false;
        }

        if(event.key === 'F1'){
            event.preventDefault(); 
            term.write('\r\n\x1b[33m=== Shortcuts ===\x1b[0m\r\n');
            term.write('\x1b[37mCtrl+Q: Quit | F1: Help\x1b[0m\r\n');
            term.write('\x1b[37mCtrl+F: Search | Ctrl+C: Copy\x1b[0m\r\n');
            term.write('\x1b[37m↑/↓: History | Esc: Cancel\x1b[0m\r\n');
            term.write('Enter your command: ' + currentInp);
            return false;
        }
    
        if(event.key === 'ArrowUp'){
            event.preventDefault(); 
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
            event.preventDefault(); 
            if(historyIndex > -1){
                historyIndex--;
                clearCurrentLine();
                currentInp = historyIndex === -1 ? tempInp : commandHistory[commandHistory.length-1-historyIndex];
                term.write(currentInp);
                if(historyIndex === -1) tempInp = '';
            }
            return false;
        }

        if (event.key === 'Escape') { 
            clearCurrentLine();
            currentInp = '';
            term.write('\r\nCancelled.\r\nEnter your command: ');
            historyIndex = -1;
            tempInp = '';
        }
    }

    return true; 
});



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
   typeWrite('\x1b[31m\x1b[1mWelcome to my xterm.js demo terminal...\x1b[0m\r\n')
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
                searchAddon.clearDecorations();
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

            // ...existing code...

            else if (currentInp == "theme"){
                const themes = [
                    {
                        name: 'Dark',
                        background: '#292727ff',
                        foreground: '#15bf1bff',
                        cursor: '#15bf1bff',
                        cursorAccent: '#292727ff'
                    },
                    {
                        name: 'Light', 
                        background: '#ffffff',
                        foreground: '#000000',
                        cursor: '#000000',
                        cursorAccent: '#ffffff',
                        selection: '#b3d4fc'
                    },
                    {
                        name: 'Hacker',
                        background: '#000000',
                        foreground: '#00ff00',
                        cursor: '#ffffffff',
                        cursorAccent: '#000000',
                        selection: '#003300'
                    },
                    {
                        name: 'Solarized Dark',
                        background: '#002b36',
                        foreground: '#839496',
                        cursor: '#93a1a1',
                        cursorAccent: '#002b36',
                        selection: '#073642',
                        black: '#073642',
                        red: '#dc322f',
                        green: '#859900',
                        yellow: '#b58900',
                        blue: '#268bd2',
                        magenta: '#d33682',
                        cyan: '#2aa198',
                        white: '#eee8d5',
                        brightBlack: '#002b36',
                        brightRed: '#cb4b16',
                        brightGreen: '#586e75',
                        brightYellow: '#657b83',
                        brightBlue: '#839496',
                        brightMagenta: '#6c71c4',
                        brightCyan: '#93a1a1',
                        brightWhite: '#fdf6e3'
                    }
                ];

                const currentTheme = term.options.theme;
                let currentIndex = themes.findIndex(theme => 
                    theme.background === currentTheme.background && 
                    theme.foreground === currentTheme.foreground
                );
                
                // If theme not found, default to first theme
                if (currentIndex === -1) currentIndex = 0;
                
                const nextIndex = (currentIndex + 1) % themes.length;
                const selectedTheme = themes[nextIndex];

                // Apply the new theme
                term.options.theme = selectedTheme;

                // Provide visual feedback with theme-appropriate colors
                const themeColors = {
                    'Dark': '\x1b[32m',      // Green
                    'Light': '\x1b[34m',     // Blue  
                    'Hacker': '\x1b[92m',    // Bright Green
                    'Solarized Dark': '\x1b[36m' // Cyan
                };

                const color = themeColors[selectedTheme.name] || '\x1b[33m';
                term.write(`${color}Theme switched to: ${selectedTheme.name}\x1b[0m\r\n`);
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
        if(historyIndex !== -1) {
            historyIndex = -1;
            tempInp = '';
        }
    }
});

