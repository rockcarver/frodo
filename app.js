fs = require('fs')
const {
    Command
} = require('commander');
const utils = require('./utils.js')

const program = new Command();

(async () => {
    try {
        utils.InitConnections();
        /*  Dynamically load frodo modules from the "modules" subdirectory, each module has is own "<module_name>"
            subdirectory under "modules".
            Refer to the "journey" module for structure of a module.
            Basically, the "<module_name>" directory needs at least
                - a "cmd.js" file: this will prepare a sub command of type "Command" and return it
                - if desired, the implementation of sub command is large/complex, it can be in additional js source 
                    files. This keeps the "cmd.js" relatively cleaner.
        */
        for (const f of fs.readdirSync("./modules", {withFileTypes: true})) {
            // console.log(`${f.name} - ${f.isDirectory()}`)
            if (f.isDirectory()) {
                let m = require(`./modules/${f.name}/cmd.js`);
                program.addCommand(m.Setup());
            }
        }
        program.showHelpAfterError();
        program.parse();
    } catch (e) {
        console.error("ERROR: exception running frodo - ", e);
    }
})()
