import {} from '@deafwave/osrs-botmaker-types'; // Loads the types from the package

/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Available bindings:
 *
 * api
 * client
 * net
 *
 */

let sleep = 0;

export class Utils {
    dialogVisible(text: string): boolean {
        const pid = 14352385;
        const widget = client.getWidget(pid);
  
        if (widget && !widget.isHidden()) {
            const children = widget.getChildren();
            if (children) {
                return children.some((child) => {
                    return child && child.getType() === 4 && child.getText() === text;
                });
            }
        }
        return false;
    }
}

export class Widget {
    pid: number;
    id: number;
    op: number;
    parameter: number;

    constructor(pid: number, id: number, op: number, parameter: number) {
        this.pid = pid;
        this.id = id;
        this.op = op;
        this.parameter = parameter;
    }

    isVisible(): boolean {
        const targetWidget = client.getWidget(this.pid);

        if (targetWidget != null && !targetWidget.isHidden()) {
            return true;
        }
        return false;
    }

    getText(): string | null {
        const targetWidget = client.getWidget(this.pid);
        
        if (targetWidget != null) {
            return targetWidget.getText();
        }
        return null;
    }

    click(): void {
        bot.widgets.interactSpecifiedWidget(this.pid, this.id, this.op, this.parameter);
    }
}

export function depositAll() {
	if (bot.bank.isOpen()) {
		bot.widgets.interactSpecifiedWidget(786476, 1, 57, -1);
	}
}

export function isInventoryFull() {
	return bot.inventory.getEmptySlots() === 0;
}

export function onStart() {
	bot.printGameMessage('Reward Searcher started.');
}

const utils = new Utils();

export function onGameTick() {
	if (sleep > 0) {
		sleep--;
		return;
	}
	
	if (utils.dialogVisible('Welcome, brother.')) {
		bot.printGameMessage('Found the dialogue!!');
	}

	if (isInventoryFull() && !bot.bank.isOpen()) {
		bot.printGameMessage('Inventory is full, depositing items...');
		bot.bank.open();
		sleep = 3;
	}

	if (isInventoryFull() && bot.bank.isOpen()) {
		bot.printGameMessage('Depositing all items...');
		depositAll();
		sleep = 2;
	}

	if (bot.bank.isOpen() && !isInventoryFull()) {
		bot.bank.close();
		sleep = 1;
	}

	if (bot.localPlayerIdle() && !isInventoryFull() && !bot.bank.isOpen()) {
		bot.objects.interactObject('Reward Cart', 'Search');
		sleep = 10;
	}
}