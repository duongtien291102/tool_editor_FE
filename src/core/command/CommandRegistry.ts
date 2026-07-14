export interface CommandDefinition {
  id: string;
  title: string;
  category?: string;
  action: () => void;
}

class CommandRegistry {
  private commands: Map<string, CommandDefinition> = new Map();

  register(command: CommandDefinition) {
    this.commands.set(command.id, command);
  }

  getCommand(id: string) {
    return this.commands.get(id);
  }

  getAllCommands() {
    return Array.from(this.commands.values());
  }
}

export const commandRegistry = new CommandRegistry();
