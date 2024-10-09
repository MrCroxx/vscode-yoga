import { assert } from "console";
import * as vscode from "vscode";


export class YogaOptions {
    constructor(
        public readonly activeEditorOnly: boolean,
        public readonly alphabet: string,
    ) { }
}

export class YogaContext {
    constructor(
        public readonly matchCase: boolean
    ) { }
}


export class Yoga {
    public isActive = false;

    private readonly quickPick: vscode.QuickPick<vscode.QuickPickItem> =
        vscode.window.createQuickPick();

    private candidates: Candidate[] = [];
    private traps: Map<string, Candidate> = new Map();
    private lastSearchString: string = "";

    constructor(
        private readonly extensionContext: vscode.ExtensionContext,
        private readonly options: YogaOptions,
        private readonly context: YogaContext,
    ) {
        this.quickPick.title = context.matchCase ? "Yoga Finder (Case sensitive)" : "Yoga Finder";
        this.quickPick.placeholder = "Find";

        this.quickPick.onDidHide(this.hide.bind(this));
        this.quickPick.onDidChangeValue(this.onChangeValue.bind(this));
    }

    public show(): void {
        if (this.isActive) {
            return;
        }
        this.isActive = true;
        this.quickPick.show();
    }

    private hide(): void {
        if (!this.isActive) {
            return;
        }
        this.isActive = false;
        this.dispose();
        this.quickPick.dispose();
    }

    private onChangeValue(value: string): void {
        this.find(value);
    }

    private find(searchString: string): void {
        // Update last search string.
        const lastSearchString = this.lastSearchString;
        this.lastSearchString = searchString;

        // Get all involved editors.
        const editors = this.getInvolvedEditors();

        // Check if hits a trap.
        if (searchString.length > lastSearchString.length && this.trap(searchString.slice(-1))) {
            return;
        }

        // Clear last state.
        this.dispose();
        assert(this.candidates.length === 0);
        assert(this.traps.size === 0);

        // Handle cases.
        searchString = this.context.matchCase ? searchString : searchString.toLowerCase();

        if (searchString.length === 0) {
            return;
        }

        const labels = new Set<string>();
        for (const label of this.options.alphabet) {
            labels.add(label);
        }

        const matches = [];

        for (const editor of editors) {
            for (const visibleRange of editor.visibleRanges) {
                for (let i = visibleRange.start.line; i <= visibleRange.end.line; i++) {
                    const line = editor.document.lineAt(i);
                    const text = this.context.matchCase ? line.text : line.text.toLowerCase();

                    let index = 0;
                    while (true) {
                        index = text.indexOf(searchString, index);
                        if (index === -1) { break; }

                        const startPosition = new vscode.Position(i, index);
                        const endPosition = new vscode.Position(i, index + searchString.length);
                        const matchRange = new vscode.Range(startPosition, endPosition);
                        const nextCharacter = endPosition.character < text.length ? text.charAt(endPosition.character) : "";

                        labels.delete(nextCharacter);
                        matches.push(new Match(editor, matchRange, nextCharacter));

                        index += searchString.length;
                    }
                }
            }
        }

        for (const match of matches) {
            const label = labels.values().next().value || "";
            labels.delete(label);
            const candidate = new Candidate(label, match.editor, match.range, match.nextCharacter);
            this.candidates.push(candidate);
            if (candidate.label !== "") {
                this.traps.set(candidate.label, candidate);
            }
        }

        for (const candidate of this.candidates) {
            candidate.editor.setDecorations(candidate.decorationType, [candidate.range]);
        }
    }

    // Get all involved editors.
    private getInvolvedEditors(): vscode.TextEditor[] {
        let editors = [];
        this.options.activeEditorOnly && vscode.window.activeTextEditor && editors.push(vscode.window.activeTextEditor!);
        !this.options.activeEditorOnly && editors.push(...vscode.window.visibleTextEditors);
        return editors;
    }

    // Jump to the position if hit a trap.
    private trap(input: string): boolean {
        const trap = this.traps.get(input);
        if (!trap) {
            return false;
        }
        vscode.window.showTextDocument(trap.editor.document.uri, { preview: false, viewColumn: trap.editor.viewColumn });
        trap.editor.selections = [new vscode.Selection(trap.range.start, trap.range.start)];
        this.hide();
        return true;
    }

    // Dispose last round matches and candidates.
    private dispose() {
        for (const candidate of this.candidates) {
            candidate.decorationType.dispose();
        }
        this.candidates = [];
        this.traps.clear();
    }

}

class Match {
    constructor(
        public readonly editor: vscode.TextEditor,
        public readonly range: vscode.Range,
        public readonly nextCharacter: string
    ) { }
}

class Candidate {
    public readonly decorationType: vscode.TextEditorDecorationType;

    constructor(
        public readonly label: string,
        public readonly editor: vscode.TextEditor,
        public readonly range: vscode.Range,
        public readonly nextCharacter: string
    ) {
        this.decorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: "var(--vscode-editor-findMatchHighlightBackground)",
            light: label !== "" ? {
                after: {
                    contentText: label,
                    color: "var(--vscode-editor-background)",
                    backgroundColor: "var(--vscode-editor-foreground)",
                    fontWeight: "bold",
                    border: "2px solid var(--vscode-editor-foreground)",
                }
            } : undefined,
            dark: label !== "" ? {
                after: {
                    contentText: label,
                    color: "var(--vscode-editor-background)",
                    backgroundColor: "var(--vscode-editor-foreground)",
                    fontWeight: "bold",
                    border: "2px solid var(--vscode-editor-foreground)",
                }
            } : undefined,
        });
    }
}
