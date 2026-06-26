from typing import List, Dict, Any

def calculate_promo_discount(items: List[Dict[str, Any]], menu_items: List[Any], promo_combos: List[Dict[str, Any]]) -> float:
    promo_discount = 0.0
    menu_map = {item.id: item for item in menu_items}

    if promo_combos:
        for combo in promo_combos:
            if not combo.get("enabled"):
                continue

            combo_eligible_count = 0
            eligible_ids = combo.get("eligibleItemIds", [])

            for it in items:
                menu_item_id = it.get("menuItemId")
                m_item = menu_map.get(menu_item_id)
                cat = m_item.category if m_item else ""

                is_beverage_or_topup = (
                    str(menu_item_id).startswith("item-topup-") or
                    str(it.get("id", "")).startswith("topup-") or
                    cat in ["beverages", "drinks"]
                )

                is_eligible = False
                if eligible_ids:
                    is_eligible = menu_item_id in eligible_ids
                else:
                    is_eligible = not is_beverage_or_topup

                if is_eligible:
                    combo_eligible_count += it.get("qty", 0)

            required_qty = combo.get("requiredQty", 10)
            if combo_eligible_count >= required_qty:
                sets = combo_eligible_count // required_qty
                promo_discount += sets * combo.get("discountAmount", 20)

    return promo_discount

def deduct_ingredients(order_items: List[Dict[str, Any]], menu_items: List[Any], ingredients: List[Any]):
    # This would update the stock in-place or return a list of adjustments
    # For now, let's assume menu items have a 'recipe' field
    adjustments = {}
    menu_map = {item.id: item for item in menu_items}

    for it in order_items:
        m_item = menu_map.get(it.get("menuItemId"))
        if m_item and m_item.recipe:
            # recipe is a list of {ingredientId, amount}
            for recipe_item in m_item.recipe:
                ing_id = recipe_item.get("ingredientId")
                amount = recipe_item.get("amount", 0) * it.get("qty", 0)
                adjustments[ing_id] = adjustments.get(ing_id, 0) + amount

    return adjustments
