'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as ts from 'typescript';
import * as path from 'path';
import { LiveCodeDocumentContentProvider } from './LiveCodeDocumentContentProvider';

var output:vscode.OutputChannel;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    output = vscode.window.createOutputChannel("Live Code");
    output.show(true);
    output.appendLine("Live Code Started!");
    
	let provider = new LiveCodeDocumentContentProvider(context,compileTypeScript);
	let registration = vscode.workspace.registerTextDocumentContentProvider('livecode', provider);

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('livecode.previewTypeScript', () => {      
        var document = vscode.window.activeTextEditor.document;
        showPreview(document);
    });

    vscode.workspace.onDidChangeTextDocument(event=>{
        var document = event.document;
        if(!isTypeScriptFile(document)){
            return;
        }

        provider.update(GetPreviewUri(document.uri));
    });
    
    context.subscriptions.push(disposable,registration);
}

// this method is called when your extension is deactivated
export function deactivate() {
}


function showPreview(document:vscode.TextDocument){
    
    var resource = document.uri;
    var dynamicHtmlUrl= GetPreviewUri(resource); // "livecode:/c:/work/demo/test.ts?file:///c:/work/demo/test.ts"

    // Error because livecode:// is unknown.
    return vscode.commands.executeCommand('vscode.previewHtml', 
        dynamicHtmlUrl,
        vscode.ViewColumn.Three,
        `Preview ${path.basename(resource.fsPath)}`
        ).then(()=>{},(e)=>{
            output.appendLine(e)
        });
}

function GetPreviewUri(uri:vscode.Uri){
    return uri.with({ scheme: 'livecode', path: uri.path, query: uri.toString() });
}



function isTypeScriptFile(document:vscode.TextDocument){
    return document.languageId === 'typescript'
		&& document.uri.scheme !== 'livecode'; // prevent processing of own documents
}

function compileTypeScript(source:string){
    var tsconfig:ts.CompilerOptions = {
        target: ts.ScriptTarget.ES5
    };
    var compileResult = ts.transpileModule(source, { compilerOptions: tsconfig });
    var javascript = compileResult.outputText;
    var scriptTag = 
    `<script> 
        try{
            eval(${JSON.stringify(javascript)});
        }
        catch(e){
            var error = document.createElement('p');
            error.style.color="#e50";
            error.style.fontSize="larger";
            error.textContent = e;
            document.body.appendChild(error);
        }  
    </script>`;
    return scriptTag;
}