import { assert } from "console";
import * as vscode from "vscode";

export class YogaWidget {
    public isActive = false;


    private readonly alphabet: string = "abcdefghijklmnopqrstuvwxyz";
    private readonly quickPick: vscode.QuickPick<vscode.QuickPickItem> =
        vscode.window.createQuickPick();

    private candidates: Candidate[] = [];
    private traps: Map<string, Candidate> = new Map();

    constructor(
        private readonly context: vscode.ExtensionContext,
    ) {
        this.quickPick.title = "Yoga Finder";
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
        this.find(value, false);
    }

    private find(searchString: string, matchCase: boolean): void {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }


        const trap = this.traps.get(searchString.slice(-1));
        if (trap !== undefined) {
            editor.selections = [new vscode.Selection(trap.range.start, trap.range.start)];
            this.hide();
        }

        this.dispose();
        assert(this.candidates.length === 0);
        assert(this.traps.size === 0);

        searchString = matchCase ? searchString : searchString.toLowerCase();

        if (searchString.length === 0) {
            return;
        }

        const labels = new Set<string>();
        for (const label of this.alphabet) {
            labels.add(label);
        }


        const matches = [];

        for (const visibleRange of editor.visibleRanges) {
            for (let i = visibleRange.start.line; i <= visibleRange.end.line; i++) {
                const line = editor.document.lineAt(i);
                const text = matchCase ? line.text : line.text.toLowerCase();

                let index = 0;
                while (true) {
                    index = text.indexOf(searchString, index);
                    if (index === -1) { break; }

                    const startPosition = new vscode.Position(i, index);
                    const endPosition = new vscode.Position(i, index + searchString.length);
                    const matchRange = new vscode.Range(startPosition, endPosition);
                    const nextCharacter = endPosition.character < text.length ? text.charAt(endPosition.character) : "";

                    labels.delete(nextCharacter);
                    matches.push(new Match(matchRange, nextCharacter));

                    index += searchString.length;
                }
            }
        }

        for (const match of matches) {
            const label = labels.values().next().value || "";
            labels.delete(label);
            const candidate = new Candidate(label, match.range, match.nextCharacter);
            this.candidates.push(candidate);
            if (candidate.label !== "") {
                this.traps.set(candidate.label, candidate);
            }
        }

        for (const candidate of this.candidates) {
            editor.setDecorations(candidate.decorationType, [candidate.range]);
        }
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
    public range: vscode.Range;
    public nextCharacter: string;

    constructor(range: vscode.Range, nextCharacter: string) {
        this.range = range;
        this.nextCharacter = nextCharacter;
    }
}

class Candidate {
    public label: string;
    public range: vscode.Range;
    public nextCharacter: string;
    public decorationType: vscode.TextEditorDecorationType;

    constructor(label: string, range: vscode.Range, nextCharacter: string) {
        this.label = label;
        this.range = range;
        this.nextCharacter = nextCharacter;
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

// class Match {
//     public range: vscode.Range;
//     public nextCharacter: string;

//     constructor(range: vscode.Range, next: string) {
//         this.range = range;
//         this.nextCharacter = next;
//     }
// }