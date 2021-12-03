// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as pinyin from 'pinyin'
import * as fse from 'fs-extra'
import * as path from 'path'
import * as prettier from 'prettier'
import * as fs from 'fs'

const contentTemplate = (content: string) => {
	return `
		export default {
			${content}
		}
	`
}

async function replaceSelectContentToTranslate() {
  const activeEditor = vscode.window.activeTextEditor;
	const workspaceFolders = vscode.workspace.workspaceFolders
  if (!activeEditor || !workspaceFolders ) {
    return;
  }
	const uri = workspaceFolders[0].uri


	const options: any = {
		parser: 'typescript',
		printWidth: 120,
		tabWidth: 2,
		singleQuote: true,
		semi: false,
		trailingComma: 'all',
		bracketSpacing: false,
		endOfLine: 'lf',
	}

	const rootPath = uri.path
	// const translationKeyFilePath = rootPath + '/src/locales/zh-CN.ts'; 
	// const translationKeysContent = fs.readFileSync(translationKeyFilePath, 'utf8');
	var config = vscode.workspace.getConfiguration('i18n-word-extract');
	const method: string = config['i18nMethod']

	/** 待生成国际化文件名 */
	const fileNameConfig: string = config['fileName']
	/** 国际化文件目录 */
	const localesPathConfig: string = config['localesPath']
	/** 是否替换选中文字的引号 */
	const quotationMarkReplaceConfig: boolean = config['quotationMarkReplace']

	const document = activeEditor.document
	/** 获取当前文件名称 */
	let filePath = document.fileName
	filePath = filePath.replace(/\.\w+$/,"");
	let fileName = filePath.replace(/(.*\/)*([^.]+).*/ig,"$2");
	if (fileNameConfig) {
		fileName = fileNameConfig
	}

	// const finalFilePath = rootPath + '/' + localesPath + '/' + fileName + '.ts'
	const localesPath = path.resolve(__dirname, rootPath, localesPathConfig)
	const finalFilePath = path.resolve(__dirname, rootPath, `${localesPath}/${fileName}.ts`)
	
	const tempFilePathList = filePath.replace(rootPath, '')
	const filePathList = tempFilePathList.split('/').slice(2)

	/** 选中文字 */
	let selectContent = activeEditor.document.getText(activeEditor.selection);

	const word = pinyin(selectContent, {
		style: pinyin.STYLE_NORMAL,
		group: true
	}).slice(0, 5).join('').replace(/\s+/g,"");

	const key = `${filePathList.join('.')}.${word}`

	activeEditor.edit((edit: vscode.TextEditorEdit) => {
		let newWord = method.replace('%s', key)
		if (quotationMarkReplaceConfig) {
			selectContent = selectContent.replace(/^(\'|\")/, '')
			selectContent = selectContent.replace(/(\'|\")$/, '')
			newWord = newWord.replace('%ss', selectContent)
			newWord = `{${newWord}}`
		} else {
			newWord = newWord.replace('%ss', selectContent)
		}
		edit.replace(activeEditor.selection, newWord)

		fse.ensureDir(localesPath).then(() => {
			const currentContent = `'${key}': '${selectContent}',`
			
			fs.access(finalFilePath, (err) => {
				if(!err){
					const fileContent = fse.readFileSync(finalFilePath, 'utf8').split(/\r\n|\n|\r/gm)
					fileContent.splice(fileContent.length - 2, 0, currentContent)
					const prettyOutputContent = prettier.format(fileContent.join('\r\n'), options)
					fse.writeFile(finalFilePath, prettyOutputContent)
					return;
				} else {
					const prettyOutputContent = prettier.format(contentTemplate(currentContent), options)
					fse.outputFile(finalFilePath, prettyOutputContent)
				}
			})
		})

	})
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "i18n-word-extract" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('i18n-word-extract.i18n-tool', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		replaceSelectContentToTranslate()
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
