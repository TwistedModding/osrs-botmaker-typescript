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

export function depositAll() {
	if (bot.bank.isOpen()) {
		bot.widgets.interactSpecifiedWidget(786476, 1, 57, -1);
	}
}

export function isInventoryFull() {
	return bot.inventory.getEmptySlots() === 0;
}

export function isVisible(number: number, number2: number) {
	const targetWidget = client.getWidget(number, number2);

	if (targetWidget != null && !targetWidget.isHidden()) {
		return true;
	}
}

export function onStart() {
	bot.printGameMessage('Reward Searcher started.');
}

let dialogText = '';

let terminate = 0;

export function onGameTick() {
	if (sleep > 0) {
		sleep--;
		return;
	}

	{
		const w = client.getWidget(231, 6);
		if (w != null && !w.isHidden()) {
			dialogText = w.getText();
		}
	}

	if (dialogText.includes('Placeholder for now') && terminate === 0) {
		bot.printGameMessage('Out of searches, stopping.');
		bot.widgets.interactSpecifiedWidget(10551342, 1, 57, -1);
		terminate = 1;
		return;
	}

	if (terminate === 1) {
		bot.widgets.interactSpecifiedWidget(11927560, 1, 57, -1);
		bot.printGameMessage('Logging out.');
		terminate = 0;
		bot.terminate();
		return;
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
		bot.objects.interactObject('Reward Cart', 'Big-search');
		sleep = 10;
	}
}
