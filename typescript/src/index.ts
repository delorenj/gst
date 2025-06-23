import {Command, Flags} from '@oclif/core'
import {execa} from 'execa'
import * as chalk from 'chalk'
import * as fs from 'fs/promises'
import * as path from 'path'

export class GstCommand extends Command {
  static description = 'GitHub Gist Management Tool'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> search-term',
    '<%= config.bin %> <%= command.id %> search-term filename',
    '<%= config.bin %> <%= command.id %> search-term filename --clip',
    '<%= config.bin %> <%= command.id %> search-term filename output.txt',
  ]

  static flags = {
    help: Flags.help({char: 'h'}),
    clip: Flags.boolean({
      description: 'copy content to clipboard',
    }),
  }

  static args = [
    {name: 'gist_search', description: 'search term for gists', required: false},
    {name: 'filename', description: 'filter files by name', required: false},
    {name: 'destination', description: 'save content to file', required: false},
  ]

  private printError(message: string): void {
    this.error(chalk.red(`Error: ${message}`))
  }

  private printSuccess(message: string): void {
    this.log(chalk.green(message))
  }

  private printWarning(message: string): void {
    this.log(chalk.yellow(message))
  }

  private async checkCommand(command: string): Promise<boolean> {
    try {
      await execa('which', [command])
      return true
    } catch {
      return false
    }
  }

  private async checkDependencies(): Promise<void> {
    const missingDeps: string[] = []

    if (!(await this.checkCommand('gh'))) {
      missingDeps.push('gh (GitHub CLI)')
    }

    if (!(await this.checkCommand('fzf'))) {
      missingDeps.push('fzf')
    }

    if (missingDeps.length > 0) {
      this.printError('Missing required dependencies:')
      for (const dep of missingDeps) {
        this.log(`  - ${dep}`)
      }
      this.log('Please install the missing dependencies and try again.')
      this.exit(1)
    }
  }

  private async detectClipboard(): Promise<string | null> {
    const clipboardCommands = [
      {cmd: 'wl-copy', args: []},
      {cmd: 'xclip', args: ['-selection', 'clipboard']},
      {cmd: 'pbcopy', args: []},
      {cmd: 'clip', args: []},
    ]

    for (const {cmd, args} of clipboardCommands) {
      if (await this.checkCommand(cmd)) {
        return JSON.stringify({cmd, args})
      }
    }

    return null
  }

  private async copyToClipboard(content: string): Promise<boolean> {
    const clipboardCmd = await this.detectClipboard()

    if (!clipboardCmd) {
      this.printError('No clipboard utility found. Install wl-copy, xclip, pbcopy, or clip.')
      return false
    }

    try {
      const {cmd, args} = JSON.parse(clipboardCmd)
      await execa(cmd, args, {input: content})
      this.printSuccess('Content copied to clipboard!')
      return true
    } catch {
      this.printError('Failed to copy to clipboard')
      return false
    }
  }

  private async listGists(search?: string): Promise<string> {
    try {
      const {stdout} = await execa('gh', ['gist', 'list', '--limit', '100'])

      if (search) {
        const lines = stdout.split('\n').filter(line => 
          line.toLowerCase().includes(search.toLowerCase())
        )
        if (lines.length === 0) {
          this.printError(`No gists found matching '${search}'`)
          this.exit(1)
        }
        return lines.join('\n')
      }

      return stdout
    } catch {
      this.printError('Failed to list gists')
      this.exit(1)
    }
  }

  private async selectWithFzf(items: string, preview?: string): Promise<string | null> {
    const args = ['--ansi', '--no-multi']
    if (preview) {
      args.push('--preview', preview, '--preview-window=right:60%:wrap')
    }

    try {
      const {stdout} = await execa('fzf', args, {input: items})
      return stdout.trim()
    } catch {
      return null
    }
  }

  private async getGistData(gistId: string): Promise<any> {
    try {
      const {stdout} = await execa('gh', ['api', `gists/${gistId}`])
      return JSON.parse(stdout)
    } catch {
      this.printError(`Failed to get gist data for ${gistId}`)
      this.exit(1)
    }
  }

  private async getGistFiles(gistId: string): Promise<string[]> {
    const data = await this.getGistData(gistId)
    return Object.keys(data.files || {})
  }

  private async getGistContent(gistId: string, filename: string): Promise<string> {
    const data = await this.getGistData(gistId)
    const files = data.files || {}

    if (!(filename in files)) {
      this.printError(`File '${filename}' not found in gist`)
      this.exit(1)
    }

    return files[filename].content || ''
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(GstCommand)

    await this.checkDependencies()

    // List and select gist
    const gists = await this.listGists(args.gist_search)
    const selectedGist = await this.selectWithFzf(gists, 'gh gist view {1}')

    if (!selectedGist) {
      this.printWarning('No gist selected')
      return
    }

    // Extract gist ID
    const gistId = selectedGist.split(/\s+/)[0]

    // Get list of files
    let files = await this.getGistFiles(gistId)

    // Filter files if filename provided
    if (args.filename) {
      files = files.filter(f => f.toLowerCase().includes(args.filename.toLowerCase()))
      if (files.length === 0) {
        this.printError(`No files found matching '${args.filename}'`)
        this.exit(1)
      }
    }

    // Select file
    let selectedFile: string
    if (files.length === 1) {
      selectedFile = files[0]
    } else {
      const filesStr = files.join('\n')
      const previewCmd = `gh api 'gists/${gistId}' --jq '.files["{}"]'.content`
      const selected = await this.selectWithFzf(filesStr, previewCmd)

      if (!selected) {
        this.printWarning('No file selected')
        return
      }
      selectedFile = selected
    }

    // Get file content
    const content = await this.getGistContent(gistId, selectedFile)

    // Handle output
    if (flags.clip) {
      await this.copyToClipboard(content)
    } else if (args.destination) {
      await fs.writeFile(args.destination, content)
      this.printSuccess(`Content saved to ${args.destination}`)
    } else {
      this.log(content)
    }
  }
}

export default GstCommand
