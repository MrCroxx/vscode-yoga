import * as vscode from 'vscode';
import { YogaWidget } from './widget';

let widget: YogaWidget;

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('yoga.find', async () => {
			if (!widget || !widget.isActive) {
				widget = new YogaWidget(context);
			}
			widget.show();
		})
	);
}

export function deactivate() { }
