// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { posix } from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "verilog-runner" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('verilog-runner.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Verilog-Runner!');
	});

	context.subscriptions.push(disposable);

	context.subscriptions.push(vscode.commands.registerCommand('verilog-runner.createTerminal', () => {
		const terminal = vscode.window.createTerminal(`Machi inga`);
		terminal.sendText("echo 'Sent text immediately after creating'");
	}));

	context.subscriptions.push(vscode.commands.registerCommand('verilog-runner.iverilog',async function () {
		
		//Check for a open workspace
		if (!vscode.workspace.workspaceFolders) {
			return vscode.window.showInformationMessage('No folder or workspace opened');
		}
		
		//get all the files from the src directory and make it a buffer
		async function returnFilePath(folder: vscode.Uri): Promise<{total: number, val: string[]}> {
			let val: Array<string> = [];
			let total = 0;
			for (const [name,type] of await vscode.workspace.fs.readDirectory(folder)){
				if(type === vscode.FileType.File) {
					const filePath = "src/" + name;
					val.push(filePath);
					total += 1;
				}
			}
			
			return {total,val};

		}
		//getting src folder
		const folderUri = vscode.workspace.workspaceFolders[0].uri;
		const srcUri = folderUri.with({ path: posix.join(folderUri.path,'src') });
		console.log(posix.join(folderUri.path,'src') );
		if(!vscode.workspace.fs.readDirectory(srcUri))
		{
			return vscode.window.showInformationMessage("NoSrcFolder");
		}
		const info = await returnFilePath(srcUri);
		
		//get top file name
		let top = vscode.window.showQuickPick(info.val).then(item => {
			if(item){
				return item;
			}
			else {
				return "Noneeeee";
			}
		});
		var topA = await top;
		//const index = info.val.indexOf(topA, 0);
		console.log(topA);
		//if (index > -1) {
		topA = topA.slice(4, -3);
		//}

		//making of filepath.txt
		let totW = new String;
		for (let n of info.val){
			totW = totW.concat(n,"\n");
		}

		//create a buffer of file names
		console.log('the total number of files were ' + info.total);


		const writeData = Buffer.from(totW, 'utf8');
		
		//insert buffer to filepath.txt
		
		const fileUri = folderUri.with({ path: posix.join(folderUri.path, 'filepath.txt') });

		await vscode.workspace.fs.writeFile(fileUri, writeData);

		var str = "iverilog -o "+ topA + ".o " + "-c filepath.txt";

		console.log(str);
		
		//check for terminal and select 
		if (ensureTerminalExists()) {
			selectTerminal().then(terminal => {
				if (terminal) {
					terminal.sendText(str);
				}
			});
		}
		else {
			const terminal = vscode.window.createTerminal("verilog");
			terminal.sendText(str);
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('verilog-runner.gtkwave',() => {
		if (ensureTerminalExists()) {
			selectTerminal().then(terminal => {
				if (terminal) {
					terminal.sendText("gtkwave dump.vcd");
				}
			});
		}
		else {
			const terminal = vscode.window.createTerminal("verilog");
			terminal.sendText("gtkwave dump.vcd");
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('verilog-runner.seeOutputs',async function () {
		
		async function returnFilePath(folder: vscode.Uri): Promise<{total: number, val: string[]}> {
			let val: Array<string> = [];
			let total = 0;
			for (const [name,type] of await vscode.workspace.fs.readDirectory(folder)){
				if(type === vscode.FileType.File) {
					const filePath = name;
					val.push(filePath);
					total += 1;
				}
			}
			
			return {total,val};

		}
		
		if (!vscode.workspace.workspaceFolders) {
			return vscode.window.showInformationMessage('No folder or workspace opened');
		}

		const folderUri = vscode.workspace.workspaceFolders[0].uri;
		const info = await returnFilePath(folderUri);
		
		//get top file name
		let top = vscode.window.showQuickPick(info.val).then(item => {
			if(item){
				return item;
			}
			else {
				return "Noneeeee";
			}
		});

		let topA = await top;
		
		if (ensureTerminalExists()) {
			selectTerminal().then(terminal => {
				if (terminal) {
					terminal.sendText("vvp "+ topA);
				}
			});
		}
		else {
			const terminal = vscode.window.createTerminal("verilog");
			terminal.sendText("vvp "+ topA);
		}
	}));

}

// This method is called when your extension is deactivated
export function deactivate() {}

function ensureTerminalExists(): boolean {
	if ((<any>vscode.window).terminals.length === 0) {
		vscode.window.showInformationMessage('No active terminals, creating a new one');
		return false;
	}
	return true;
}

function selectTerminal(): Thenable<vscode.Terminal | undefined> {
	interface TerminalQuickPickItem extends vscode.QuickPickItem {
		terminal: vscode.Terminal;
	}
	const terminals = <vscode.Terminal[]>(<any>vscode.window).terminals;
	const items: TerminalQuickPickItem[] = terminals.map(t => {
		return {
			label: `name: ${t.name}`,
			terminal: t
		};
	});
	return vscode.window.showQuickPick(items).then(item => {
		return item ? item.terminal : undefined;
	});
}
