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

export function interactClosestNpc(
	npcId: number,
	action: string,
	maxDistance?: number,
) {
	const npcs = bot.npcs.getWithIds([npcId]);
	if (npcs) {
		let closestNpc = null;
		let minDistance = Number.MAX_VALUE;

		for (const currentNpc of npcs) {
			const distance = client
				.getLocalPlayer()
				.getWorldLocation()
				.distanceTo(currentNpc.getWorldLocation());

			if (maxDistance && distance > maxDistance) {
				continue;
			}

			if (distance < minDistance) {
				minDistance = distance;
				closestNpc = currentNpc;
			}
		}
		if (closestNpc) {
			return bot.npcs.interactSupplied(closestNpc, action);
		}
	}
}

export function isVisible(number: number, number2: number) {
	const targetWidget = client.getWidget(number, number2);

	if (targetWidget != null && !targetWidget.isHidden()) {
		return true;
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
	bot.printGameMessage('Barb Fisher started.');
}

export function onGameTick() {
	if (sleep > 0) {
		sleep--;
		return;
	}
	const playerAnimation = client.getLocalPlayer().getAnimation();
	if (
		playerAnimation != 9349 &&
		playerAnimation != 9350 &&
		!bot.inventory.containsAnyIds([11330, 11328, 11334, 11324, 11332])
	) {
		interactClosestNpc(1542, 'Use-rod');
		sleep = 2;
	}

	if (bot.inventory.containsAnyIds([11334, 11324, 11332])) {
		interactConsecutively([11334, 11324, 11332], ['Drop']);
	}

	if (bot.inventory.containsAnyIds([11330])) {
		bot.inventory.itemOnItemWithIds(946, 11330);
		sleep = 1;
		return;
	}

	if (bot.inventory.containsAnyIds([11328])) {
		bot.inventory.itemOnItemWithIds(946, 11328);
		sleep = 1;
		return;
	}

	if (bot.inventory.containsAnyIds([11332])) {
		bot.inventory.itemOnItemWithIds(946, 11332);
		sleep = 1;
		return;
	}
}
