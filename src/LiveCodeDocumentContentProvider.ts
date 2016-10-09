
import * as vscode from 'vscode';
import * as path from 'path';
import { ExtensionContext, TextDocumentContentProvider, EventEmitter, Event, Uri, ViewColumn } from 'vscode';

interface IRenderer {
	(text: string): string;
}

export class LiveCodeDocumentContentProvider implements TextDocumentContentProvider {
	private _context: ExtensionContext;
	private _onDidChange = new EventEmitter<Uri>();
    private _render:IRenderer;

	constructor(context: ExtensionContext,render:IRenderer) {
		this._context = context;
        this._render = render;
	}

	public provideTextDocumentContent(uri: Uri): Thenable<string> {

		return vscode.workspace.openTextDocument(Uri.parse(uri.query)).then(document => {
			const head = [].concat(
				'<!DOCTYPE html>',
				'<html>',
				'<head>',
				'<meta http-equiv="Content-type" content="text/html;charset=UTF-8">',
				'</head>',
				'<body>'
			).join('\n');

			const body = this._render(document.getText());

			const tail = [
				'</body>',
				'</html>'
			].join('\n');

			return head + body + tail;
		});
	}

	get onDidChange(): Event<Uri> {
		return this._onDidChange.event;
	}

	public update(uri: Uri) {
        this._onDidChange.fire(uri);
	}
}