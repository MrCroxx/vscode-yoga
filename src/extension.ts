import * as vscode from 'vscode';
import { Yoga, YogaContext, YogaOptions } from './yoga';

let global: Yoga;


function getInstance(extensionContext: vscode.ExtensionContext, context: YogaContext): Yoga {
	if (!global || !global.isActive) {
		const options = getYogaOptions();
		global = new Yoga(extensionContext, options, context);
	}
	return global;
}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('yoga.find', async () => {
			const yoga = getInstance(context, { matchCase: false });
			yoga.show();
		}),

		vscode.commands.registerCommand('yoga.findWithCase', async () => {
			const yoga = getInstance(context, { matchCase: true });
			yoga.show();
		})
	);
}

function getConfiguration<Type>(name: string): Type {
	const config = vscode.workspace.getConfiguration("yoga");
	const value: Type = config.get(name)!;
	return value;
}

function getYogaOptions(): YogaOptions {
	const activeEditorOnly = getConfiguration<boolean>("activeEditorOnly");
	return new YogaOptions(activeEditorOnly);
}