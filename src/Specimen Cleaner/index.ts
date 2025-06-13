import {} from '@deafwave/osrs-botmaker-types'; // Loads the types from the packageAdd commentMore actions

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

export function interactConsecutively(itemIds: number[], actions: string[]) {
	itemIds.forEach((itemId) => {
		if (
			!itemIds ||
			!actions ||
			itemIds.length === 0 ||
			actions.length === 0
		) {
			return;
		}

		const inventorySlots = getAllInventoryIndexes(itemId);

		for (const index of inventorySlots) {
			const itemComposition = client.getItemDefinition(itemId);
			const itemActions = itemComposition.getInventoryActions();
			const itemName = itemComposition.getName();

			if (!itemActions || itemActions.length === 0) {
				continue;
			}

			let actionPerformed = false;
			for (const [actionIndex, itemAction] of itemActions.entries()) {
				if (itemAction == null) continue;
				if (actions.includes(String(itemAction))) {
					const finalActionIndex =
						actionIndex <= 2 ? actionIndex + 2 : actionIndex + 3;
					const finalOpcode =
						finalActionIndex <= 5
							? net.runelite.api.MenuAction.CC_OP
							: net.runelite.api.MenuAction.CC_OP_LOW_PRIORITY;
					bot.menuAction(
						index,
						9764864,
						finalOpcode,
						finalActionIndex,
						itemId,
						itemAction,
						itemName,
					);

					actionPerformed = true;
					break;
				}
			}

			if (!actionPerformed) {
				break;
			}
		}
	});
}

export function getAllInventoryIndexes(itemId: number) {
	const inventory = client.getItemContainer(
		net.runelite.api.InventoryID.INVENTORY,
	);
	if (!inventory) {
		return [];
	}

	const indexes = [];
	const items = inventory.getItems();
	for (const [index, item] of items.entries()) {
		if (item && item.getId() === itemId) {
			indexes.push(index);
		}
	}

	return indexes;
}

export function isVisible(number: number, number2: number) {
	const targetWidget = client.getWidget(number, number2);

	if (targetWidget != null && !targetWidget.isHidden()) {
		return true;
	}
}

export function isInventoryFull() {
	return bot.inventory.getEmptySlots() === 0;
}

export function onStart() {
	bot.printGameMessage('Specimen cleaner started.');
}

export function onGameTick() {
	if (sleep > 0) {
		sleep--;
		return;
	}

	if (
		!isInventoryFull() &&
		bot.localPlayerIdle() &&
		!bot.inventory.containsAnyIds([973])
	) {
		bot.objects.interactObject('Specimen tray', 'Search');
		sleep = 5;
	}

	if (isInventoryFull() && bot.localPlayerIdle()) {
		interactConsecutively([526, 687, 694, 1203, 674, 1469], ['Drop']);
		sleep = 5;
	}

	if (bot.inventory.containsAnyIds([973])) {
		bot.widgets.interactSpecifiedWidget(10551342, 1, 57, -1);
		bot.widgets.interactSpecifiedWidget(11927560, 1, 57, -1);
		bot.printGameMessage('Logging out.');
		bot.terminate();
		return;
	}
}
