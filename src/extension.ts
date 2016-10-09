'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

var output:vscode.OutputChannel;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    output = vscode.window.createOutputChannel("Live Code");
    output.show(true);
    output.appendLine("Live Code Started!");

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('livecode.previewTypeScript', () => {      
        var document = vscode.window.activeTextEditor.document;
        handleDocumentChange(document);
    });
    context.subscriptions.push(disposable);

    vscode.workspace.onDidChangeTextDocument(event=>{
        handleDocumentChange(event.document);
    });
}

// this method is called when your extension is deactivated
export function deactivate() {
}


function handleDocumentChange(document:vscode.TextDocument){
    
    if(!isTypeScriptFile(document)){
        return;
    }

    output.appendLine(`Document changed: ${document.uri.toString()}`);
}

function isTypeScriptFile(document:vscode.TextDocument){
    return document.languageId === 'typescript'
		&& document.uri.scheme !== 'livecode'; // prevent processing of own documents
}