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

export function onStart() {
	bot.printGameMessage('Reward Searcher started.');
}

export function onGameTick() {
	if (sleep > 0) {
		sleep--;
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
		bot.objects.interactObject('Reward Cart', 'Search');
		sleep = 10;
	}
}
