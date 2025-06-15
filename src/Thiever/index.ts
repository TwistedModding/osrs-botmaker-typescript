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
let drop = 0;
let walkBack = 0;

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

export function depositAll() {
	if (bot.bank.isOpen()) {
		bot.widgets.interactSpecifiedWidget(786476, 1, 57, -1);
	}
}

export function isInventoryFull() {
	return bot.inventory.getEmptySlots() === 0;
}

export function onStart() {
	bot.printGameMessage('Thiever Started.');
}

export function interactClosestObject(
	object: number,
	action: string,
	maxDistance?: number,
) {
	const objects = bot.objects.getTileObjectsWithIds([object]);
	if (objects) {
		let closestObject = null;
		let minDistance = Number.MAX_VALUE;

		for (const currentObject of objects) {
			const distance = client
				.getLocalPlayer()
				.getWorldLocation()
				.distanceTo(currentObject.getWorldLocation());

			if (maxDistance && distance > maxDistance) {
				continue;
			}

			if (distance < minDistance) {
				minDistance = distance;
				closestObject = currentObject;
			}
		}
		if (closestObject) {
			return bot.objects.interactSuppliedObject(closestObject, action);
		}
	}
}

export function onGameTick() {
	if (sleep > 0) {
		sleep--;
		return;
	}

	if (
		isInventoryFull() &&
		bot.localPlayerIdle() &&
		!bot.inventory.containsAnyIds([
			1955, 5504, 2114, 1963, 2102, 247, 2120, 1951, 5972,
		]) &&
		!bot.walking.isWebWalking()
	) {
		bot.walking.webWalkStart(
			new net.runelite.api.coords.WorldPoint(1748, 3598, 0),
		);
		sleep = 15;
	}

	if (
		client
			.getLocalPlayer()
			.getWorldLocation()
			.distanceTo(new net.runelite.api.coords.WorldPoint(1748, 3598, 0)) <
		5
	) {
		if (bot.bank.isOpen() && isInventoryFull()) {
			depositAll();
			sleep = 5;
		} else if (!bot.bank.isOpen() && isInventoryFull()) {
			bot.bank.open();
			sleep = 5;
			return;
		} else if (bot.bank.isOpen() && !isInventoryFull()) {
			bot.bank.close();
			sleep = 5;
			return;
		}
		walkBack = 1;
	}

	if (
		walkBack === 1 &&
		!bot.bank.isOpen() &&
		bot.localPlayerIdle() &&
		!bot.walking.isWebWalking()
	) {
		bot.walking.webWalkStart(
			new net.runelite.api.coords.WorldPoint(1800, 3607, 0),
		);
		sleep = 15;
		walkBack = 0;
	}

	if (
		isInventoryFull() &&
		bot.inventory.containsAnyIds([
			1955, 5504, 2114, 1963, 2102, 247, 2120, 1951, 5972,
		])
	) {
		drop = 1;
	}

	if (
		isInventoryFull() &&
		bot.localPlayerIdle() &&
		drop === 1 &&
		!bot.walking.isWebWalking()
	) {
		interactConsecutively(
			[1955, 5504, 2114, 1963, 2102, 247, 2120, 1951, 5972],
			['Drop'],
		);
		sleep = 5;
		drop = 0;
	}

	if (
		!isInventoryFull() &&
		bot.localPlayerIdle() &&
		!bot.walking.isWebWalking()
	) {
		interactClosestObject(28823, 'Steal-from', 2);
		sleep = 5;
	}
}

export function onEnd() {
	bot.printGameMessage('Thiever Ended.');
	bot.walking.webWalkCancel();
}
