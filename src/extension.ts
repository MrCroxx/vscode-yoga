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
			const yoga = getInstance(context, { matchCase: false, jumpToEnd: false });
			yoga.show();
		}),

		vscode.commands.registerCommand('yoga.findWithCase', async () => {
			const yoga = getInstance(context, { matchCase: true, jumpToEnd: false });
			yoga.show();
		}),

		vscode.commands.registerCommand('yoga.findEnd', async () => {
			const yoga = getInstance(context, { matchCase: false, jumpToEnd: true });
			yoga.show();
		}),

		vscode.commands.registerCommand('yoga.findEndWithCase', async () => {
			const yoga = getInstance(context, { matchCase: true, jumpToEnd: true });
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
	const alphabet = getConfiguration<string>("alphabet");

	return new YogaOptions(activeEditorOnly, alphabet);
}