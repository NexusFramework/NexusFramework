import { spawn } from "child_process";
import path = require("path");
import fs = require("fs");

console.log("NexusFramework V" + require("../package.json").version + " Commandline Parser");
console.log();

function mkdir(path: string) {
    try {
        fs.mkdirSync(path);
    } catch(e) {
        if (e.code !== "EEXIST")
            throw e;
    }
}

const templates = path.resolve(__dirname, "../templates");
const cmd = process.argv.slice(2);
switch(cmd[0]) {
    case "init":
        const template = cmd[2] || "bootstrap";
        const _path = path.resolve(process.cwd(), cmd[1] || ".");
        console.log("Initializing NexusFramework", template, "template at", _path, "...")
        var tpath = path.resolve(templates, template);
        if (!fs.existsSync(tpath))
            tpath = require.resolve(template);
        mkdir(_path);
        const src = path.resolve(_path, "src");
        mkdir(src);
        const name = path.basename(_path);
        const root = path.resolve(src, name);
        mkdir(root);
        const www = path.resolve(tpath, "www");
        fs.readdirSync(www).forEach(function(file) {
            fs.writeFileSync(path.resolve(root, file), fs.readFileSync(path.resolve(www, file)));
        });
        const tpkg = require(path.resolve(tpath, "package.json"));
        const mpkg = require(path.resolve(__dirname, "../package.json"));
        fs.writeFileSync(path.resolve(_path, "package.json"), JSON.stringify({
            name,
            version: "1.0.0",
            main: "server.js",
            private: true,
            hosts: [
                {
                    handler: "nexusframework",
                    skeleton: tpkg.skeleton,
                    pagesysskeleton: tpkg.pagesysskeleton,
                    scripts: tpkg.scripts || [],
                    styles: tpkg.styles || [],
                    fonts: tpkg.fonts || [],
                    locals: tpkg.locals || {},
                    root: "src/" + name,
                    pages: "pages"
                }
            ],
            dependencies: {
                "typescript": mpkg.devDependencies.typescript,
                "nexusfork": mpkg.devDependencies.nexusfork,
                "nexusframework": "^" + mpkg.version
            },
            devDependencies: {
                "@types/socket.io": mpkg.devDependencies['@types/socket.io'],
                "@types/socket.io-client": mpkg.devDependencies['@types/socket.io-client']
            }
        }));
        fs.writeFileSync(path.resolve(_path, "server.js"), 'require("nexusfork")(__dirname);');
        spawn(/^win/.test(process.platform) ? "npm.bat" : "npm", ["install"], {cwd: _path, stdio: "inherit"}).on("exit", function(code, signal) {
            process.exit(code);
        });
        break;
    case "templates":
        fs.readdirSync(templates).forEach(function(template) {
            console.log(template);
            const p = path.resolve(templates, template);
            console.log("    " + require(path.resolve(p, "package.json")).description);
        });
        break;
    default:
        console.log("Usage: nexusframework <command> <...args>");
        console.log();
        const command = cmd[1];
        if (!command) {
            console.log("Where <command> is one of:");
            console.log("    init templates help");
            console.log();
        }
        if (command === "init" || !command) {
            console.log("nexusframework init <path> <template>")
            console.log("    Initialize a new site at path")
            console.log("    The default path is `process.cwd()`")
            console.log("    The default template is bootstrap")
        }
        if (command === "templates" || !command) {
            console.log("nexusframework templates")
            console.log("    Lists all built-in templates")
        }
        if (command === "help" || !command) {
            console.log("nexusframework help <command>")
            console.log("    Displays this screen")
        }
}