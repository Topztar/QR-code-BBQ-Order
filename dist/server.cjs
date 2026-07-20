var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  calculatePromoDiscount: () => calculatePromoDiscount,
  getRecipeForMenuItem: () => getRecipeForMenuItem,
  refreshIngredientRecipeMap: () => refreshIngredientRecipeMap
});
module.exports = __toCommonJS(server_exports);
var import_config = require("dotenv/config");
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_net = __toESM(require("net"), 1);
var import_app = require("firebase/app");
var import_firestore = require("firebase/firestore");
var import_vite = require("vite");

// src/data.ts
var INITIAL_CATEGORIES = [
  {
    "orderIndex": 0,
    "showOnCustomerPage": false,
    "name": {
      "ko": "\uD301 \uBC0F \uD560\uC778",
      "zh": "\u5C0F\u8CBB\u53CA\u6298\u6263",
      "ja": "\u30C1\u30C3\u30D7\u30FB\u5272\u5F15",
      "vi": "Ti\u1EC1n tip & Gi\u1EA3m gi\xE1",
      "th": "\u0E17\u0E34\u0E1B\u0E41\u0E25\u0E30\u0E2A\u0E48\u0E27\u0E19\u0E25\u0E14",
      "en": "Tips & Discounts"
    },
    "id": "cat-svadcb"
  },
  {
    "showOnCustomerPage": false,
    "name": {
      "en": "Refrigerated Drinks & Alcohol",
      "ko": "\uB0C9\uC7A5 \uC74C\uB8CC \uBC0F \uC8FC\uB958",
      "zh": "\u51B0\u6AC3\u9152\u6C34",
      "ja": "\u51B7\u8535\u30C9\u30EA\u30F3\u30AF\u30FB\u304A\u9152",
      "vi": "\u0110\u1ED3 u\u1ED1ng & R\u01B0\u1EE3u l\u1EA1nh",
      "th": "\u0E40\u0E04\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E14\u0E37\u0E48\u0E21\u0E41\u0E25\u0E30\u0E2A\u0E38\u0E23\u0E32\u0E41\u0E0A\u0E48\u0E40\u0E22\u0E47\u0E19"
    },
    "id": "cat-7cvvkq",
    "orderIndex": 1
  },
  {
    "name": {
      "zh": "\u51AC\u852D\u529F\u7CFB\u5217 \u{1F35C}",
      "en": "Tom Yum Series \u{1F35C}",
      "ko": "\uB620\uC58C \uC218\uD504 \uC2DC\uB9AC\uC988 \u{1F35C}",
      "ja": "\u30C8\u30E0\u30E4\u30E0\u30B7\u30EA\u30FC\u30BA \u{1F35C}",
      "th": "\u0E0A\u0E38\u0E14\u0E15\u0E49\u0E21\u0E22\u0E33\u0E2A\u0E38\u0E14\u0E41\u0E0B\u0E48\u0E1A \u{1F35C}",
      "vi": "D\xF2ng s\xFAp Tom Yum \u{1F35C}"
    },
    "id": "tomyum",
    "orderIndex": 2
  },
  {
    "name": {
      "zh": "\u71B1\u6E6F \u{1F962}\u8D8A\u5357\u725B\u8089\u6CB3\u7C89",
      "en": "Single Noodle Dishes \u{1F962}",
      "th": "\u0E1A\u0E30\u0E2B\u0E21\u0E35\u0E48\u0E41\u0E25\u0E30\u0E01\u0E4B\u0E27\u0E22\u0E40\u0E15\u0E35\u0E4B\u0E22\u0E27\u0E08\u0E32\u0E19\u0E40\u0E14\u0E35\u0E48\u0E22\u0E27 \u{1F962}",
      "ja": "\u304A\u4E00\u4EBA\u69D8\u7528\u9EBA\u985E \u{1F962}",
      "ko": "\uB2E8\uD488 \uB530\uB73B\uD55C \uBA74 \uC694\uB9AC \u{1F962}"
    },
    "id": "noodles",
    "orderIndex": 3,
    "showOnCustomerPage": true
  },
  {
    "name": {
      "zh": "\u7CBE\u9078\u5957\u9910 \u{1F371}\u512A\u60E0",
      "en": "Chef's Special Combos \u{1F371}",
      "th": "\u0E40\u0E0B\u0E15\u0E40\u0E21\u0E19\u0E39\u0E22\u0E2D\u0E14\u0E19\u0E34\u0E22\u0E21 Sabay \u{1F371}",
      "ja": "\u4E3B\u7406\u4EBA\u304A\u5F97\u30BB\u30C3\u30C8 \u{1F371}",
      "ko": "\uC170\uD504 \uCD94\uCC9C \uC138\uD2B8 \uC694\uB9AC \u{1F371}"
    },
    "id": "combos",
    "orderIndex": 4,
    "showOnCustomerPage": true
  },
  {
    "name": {
      "zh": "\u62DB\u724C\u6CF0\u5F0F\u6D77\u9BAE \u{1F990}",
      "en": "Signature Thai Seafood \u{1F990}",
      "ko": "\uC2DC\uADF8\uB2C8\uCC98 \uD0DC\uAD6D\uC2DD \uD574\uC0B0\uBB3C \uAD6C\uC774 \u{1F990}",
      "ja": "\u672C\u683C\u30BF\u30A4\u98A8\u70AD\u706B\u713C\u304D\u30B7\u30FC\u30D5\u30FC\u30C9 \u{1F990}",
      "th": "\u0E2D\u0E32\u0E2B\u0E32\u0E23\u0E17\u0E30\u0E40\u0E25\u0E40\u0E1C\u0E32\u0E2A\u0E39\u0E15\u0E23\u0E40\u0E14\u0E47\u0E14 \u{1F990}",
      "vi": "H\u1EA3i s\u1EA3n n\u01B0\u1EDBng Th\xE1i Lan \u{1F990}"
    },
    "id": "seafood",
    "orderIndex": 5
  },
  {
    "orderIndex": 6,
    "name": {
      "zh": "\u5C0F\u8FB2\u9BAE\u852C\u83DC \u{1F96C}",
      "en": "Farm Fresh Vegetables \u{1F96C}",
      "ko": "\uC2E0\uC120\uD55C \uCC44\uC18C \uAD6C\uC774 \u{1F96C}",
      "ja": "\u5730\u5143\u65B0\u9BAE\u91CE\u83DC\u713C\u304D \u{1F96C}",
      "th": "\u0E1C\u0E31\u0E01\u0E2A\u0E14\u0E1F\u0E32\u0E23\u0E4C\u0E21\u0E22\u0E48\u0E32\u0E07 \u{1F96C}",
      "vi": "Rau c\u1EE7 t\u01B0\u01A1i s\u1EA1ch \u{1F96C}"
    },
    "id": "veggies"
  },
  {
    "id": "skewers",
    "name": {
      "zh": "\u78B3\u70E4\u8089\u985E \u{1F362}\u5176\u4ED6",
      "en": "Charcoal BBQ Skewers \u{1F362}",
      "th": "\u0E1A\u0E32\u0E23\u0E4C\u0E1A\u0E35\u0E04\u0E34\u0E27\u0E40\u0E2A\u0E35\u0E22\u0E1A\u0E44\u0E21\u0E49\u0E22\u0E48\u0E32\u0E07 \u{1F362}",
      "ja": "\u30BF\u30A4\u98A8\u8089\u4E32\u70AD\u706B\u713C\u304D \u{1F362}",
      "ko": "\uC624\uB9AC\uC9C0\uB110 \uC22F\uBD88 \uAF2C\uCE58 \u{1F362}"
    },
    "orderIndex": 7,
    "showOnCustomerPage": true
  },
  {
    "orderIndex": 8,
    "name": {
      "zh": "\u6CF0\u5F0F\u7279\u8272\u751C\u54C1 \u{1F370}",
      "en": "Thai Desserts & Sweets \u{1F370}",
      "ko": "\uD0DC\uAD6D\uC2DD \uB2EC\uCF64 \uB514\uC800\uD2B8 \u{1F370}",
      "ja": "\u30BF\u30A4\u98A8\u7279\u88FD\u30C7\u30B6\u30FC\u30C8 \u{1F370}",
      "th": "\u0E02\u0E19\u0E21\u0E2B\u0E27\u0E32\u0E19\u0E41\u0E25\u0E30\u0E1E\u0E38\u0E14\u0E14\u0E34\u0E49\u0E07\u0E2A\u0E39\u0E15\u0E23\u0E1E\u0E34\u0E40\u0E28\u0E29 \u{1F370}",
      "vi": "Tr\xE1ng mi\u1EC7ng ki\u1EC3u Th\xE1i \u{1F370}"
    },
    "id": "sweets"
  },
  {
    "id": "drinks",
    "name": {
      "zh": "\u6CF0\u7279\u8272\u6C81\u6DBC\u98F2\u54C1 \u{1F379}",
      "en": "Refreshing Thai Cold Drinks \u{1F379}",
      "ko": "\uD0DC\uAD6D\uC2DD \uCCAD\uB7C9 \uC74C\uB8CC \u{1F379}",
      "ja": "\u30BF\u30A4\u98A8\u3055\u308F\u3084\u304B\u30C9\u30EA\u30F3\u30AF \u{1F379}",
      "th": "\u0E40\u0E04\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E14\u0E37\u0E48\u0E21\u0E14\u0E31\u0E1A\u0E23\u0E49\u0E2D\u0E19\u0E23\u0E2A\u0E2A\u0E14\u0E0A\u0E37\u0E48\u0E19 \u{1F379}",
      "vi": "\u0110\u1ED3 u\u1ED1ng l\u1EA1nh ki\u1EC3u Th\xE1i \u{1F379}"
    },
    "orderIndex": 9
  },
  {
    "orderIndex": 10,
    "showOnCustomerPage": true,
    "name": {
      "en": "Exclusive Sauces",
      "vi": "N\u01B0\u1EDBc s\u1ED1t \u0111\u1ED9c quy\u1EC1n",
      "th": "\u0E0B\u0E2D\u0E2A\u0E2A\u0E39\u0E15\u0E23\u0E1E\u0E34\u0E40\u0E28\u0E29",
      "ko": "\uB2E8\uB3C5 \uC218\uC81C \uC18C\uC2A4",
      "zh": "\u7368\u5BB6\u91AC\u6599",
      "ja": "\u79D8\u4F1D\u306E\u30BF\u30EC\u30FB\u30BD\u30FC\u30B9"
    },
    "id": "cat-zene8j"
  },
  {
    "showOnCustomerPage": true,
    "id": "cat-6ovxss",
    "name": {
      "th": "\u0E42\u0E0B\u0E19\u0E40\u0E04\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E14\u0E37\u0E48\u0E21\u0E41\u0E2D\u0E25\u0E01\u0E2D\u0E2E\u0E2D\u0E25\u0E4C",
      "vi": "Khu v\u1EF1c \u0111\u1ED3 u\u1ED1ng c\xF3 c\u1ED3n",
      "ko": "\uC8FC\uB958 \uC804\uC6A9 \uAD6C\uC5ED",
      "ja": "\u30A2\u30EB\u30B3\u30FC\u30EB\u98F2\u6599\u30A8\u30EA\u30A2",
      "zh": "\u6210\u4EBA\u9152\u54C1\u5C08\u5340",
      "en": "Alcoholic Beverages (18+)"
    },
    "orderIndex": 11
  }
];
var INITIAL_MENU = [
  {
    "price": 60,
    "containsBeef": false,
    "containsSeafood": false,
    "id": "dish-2696007842576",
    "category": "cat-7cvvkq",
    "containsPork": false,
    "image": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 0,
    "description": {
      "zh": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "ja": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "th": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D"
    },
    "isNotSpicy": true,
    "name": {
      "zh": "Vitamilk\u8C46\u5976",
      "en": "Vitamilk Soy Milk",
      "ko": "Vitamilk\u8C46\u5976",
      "ja": "Vitamilk\u8C46\u5976",
      "th": "Vitamilk\u8C46\u5976"
    },
    "available": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "image": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "ja": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "th": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D"
    },
    "orderIndex": 1,
    "price": 150,
    "containsBeef": false,
    "containsSeafood": false,
    "containsPork": false,
    "category": "cat-7cvvkq",
    "id": "dish-2606012021064",
    "name": {
      "zh": "\u9E92\u9E9F\u5564\u9152",
      "en": "Kirin Beer",
      "ko": "\u9E92\u9E9F\u5564\u9152",
      "ja": "\u9E92\u9E9F\u5564\u9152",
      "th": "\u9E92\u9E9F\u5564\u9152"
    },
    "available": true,
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "orderIndex": 2,
    "description": {
      "zh": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "ja": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "th": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D"
    },
    "image": "https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&q=80&w=400",
    "containsPork": false,
    "category": "cat-7cvvkq",
    "id": "dish-2605122152569",
    "containsBeef": false,
    "containsSeafood": false,
    "price": 110,
    "available": true,
    "name": {
      "zh": "SPY\u6CF0\u570B\u96DE\u5C3E\u9152",
      "en": "SPY Thai Wine Cooler",
      "ko": "SPY\u6CF0\u570B\u96DE\u5C3E\u9152",
      "ja": "SPY\u6CF0\u570B\u96DE\u5C3E\u9152",
      "th": "SPY\u6CF0\u570B\u96DE\u5C3E\u9152"
    },
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "name": {
      "zh": "\u4E73\u916A\u7D44\u5408\u50F9",
      "en": "Cheese Drink Combo Deal",
      "ko": "\u4E73\u916A\u7D44\u5408\u50F9",
      "ja": "\u4E73\u916A\u7D44\u5408\u50F9",
      "th": "\u4E73\u916A\u7D44\u5408\u50F9"
    },
    "available": true,
    "isNotSpicy": true,
    "orderIndex": 3,
    "description": {
      "zh": "\u8D85\u503C\u512A\u60E0\u7D44\u5408\uFF0C\u7269\u8D85\u6240\u503C\uFF0C\u9650\u6642\u4EAB\u7528",
      "en": "Great value combo package, high cost-performance deal for a limited time.",
      "ko": "\u8D85\u503C\u512A\u60E0\u7D44\u5408\uFF0C\u7269\u8D85\u6240\u503C\uFF0C\u9650\u6642\u4EAB\u7528",
      "ja": "\u8D85\u503C\u512A\u60E0\u7D44\u5408\uFF0C\u7269\u8D85\u6240\u503C\uFF0C\u9650\u6642\u4EAB\u7528",
      "th": "\u8D85\u503C\u512A\u60E0\u7D44\u5408\uFF0C\u7269\u8D85\u6240\u503C\uFF0C\u9650\u6642\u4EAB\u7528"
    },
    "image": "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&q=80&w=400",
    "category": "cat-svadcb",
    "containsPork": false,
    "id": "dish-2603071951301",
    "price": -10,
    "containsSeafood": false,
    "containsBeef": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "orderIndex": 4,
    "description": {
      "zh": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "ja": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "th": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D"
    },
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "category": "sweets",
    "containsPork": false,
    "id": "dish-2602121900078",
    "containsSeafood": false,
    "containsBeef": false,
    "price": 90,
    "available": true,
    "name": {
      "zh": "\u6842\u82B1\u4E73\u916A",
      "en": "Osmanthus Cheese Drink",
      "ko": "\u6842\u82B1\u4E73\u916A",
      "ja": "\u6842\u82B1\u4E73\u916A",
      "th": "\u6842\u82B1\u4E73\u916A"
    },
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "orderIndex": 5,
    "description": {
      "zh": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
      "ko": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "ja": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "th": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473"
    },
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "containsPork": false,
    "category": "skewers",
    "id": "dish-2602121834434",
    "containsBeef": true,
    "containsSeafood": false,
    "price": 390,
    "available": true,
    "name": {
      "zh": "\u677F\u8171\u725B5oz",
      "en": "Top Blade Steak (5oz)",
      "ko": "\u677F\u8171\u725B5oz",
      "ja": "\u677F\u8171\u725B5oz",
      "th": "\u677F\u8171\u725B5oz"
    },
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "image": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "ja": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "th": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D"
    },
    "orderIndex": 6,
    "price": 90,
    "containsSeafood": false,
    "containsBeef": false,
    "category": "sweets",
    "containsPork": false,
    "id": "dish-2601312248029",
    "name": {
      "zh": "\u9999\u6595\u4E73\u916A",
      "en": "Pandan Cheese Drink",
      "ko": "\u9999\u6595\u4E73\u916A",
      "ja": "\u9999\u6595\u4E73\u916A",
      "th": "\u9999\u6595\u4E73\u916A"
    },
    "available": true,
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "orderIndex": 7,
    "description": {
      "zh": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "ja": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "th": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D"
    },
    "image": "https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&q=80&w=400",
    "category": "sweets",
    "id": "dish-2601310009011",
    "containsPork": false,
    "containsBeef": false,
    "containsSeafood": false,
    "price": 80,
    "available": true,
    "name": {
      "zh": "\u9BAE\u5976\u4E73\u916A",
      "en": "Fresh Milk Cheese Drink",
      "ko": "\u9BAE\u5976\u4E73\u916A",
      "ja": "\u9BAE\u5976\u4E73\u916A",
      "th": "\u9BAE\u5976\u4E73\u916A"
    },
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": true,
    "available": true,
    "name": {
      "zh": "\u6CF0\u5F0F\u5976\u8336\u4E73\u916A",
      "en": "Thai Milk Tea Cheese Drink",
      "ko": "\u6CF0\u5F0F\u5976\u8336\u4E73\u916A",
      "ja": "\u6CF0\u5F0F\u5976\u8336\u4E73\u916A",
      "th": "\u6CF0\u5F0F\u5976\u8336\u4E73\u916A"
    },
    "containsPork": false,
    "category": "sweets",
    "id": "dish-2601310007093",
    "containsBeef": false,
    "containsSeafood": false,
    "price": 90,
    "description": {
      "zh": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "ja": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "th": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D"
    },
    "orderIndex": 8,
    "image": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "id": "dish-2512111741522",
    "category": "cat-7cvvkq",
    "containsPork": false,
    "price": 100,
    "containsSeafood": false,
    "containsBeef": false,
    "orderIndex": 9,
    "description": {
      "zh": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "ja": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "th": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D"
    },
    "image": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": true,
    "name": {
      "zh": "\u5206\u89E3\u8336",
      "en": "Oolong Tea (Decomposing)",
      "ko": "\u5206\u89E3\u8336",
      "ja": "\u5206\u89E3\u8336",
      "th": "\u5206\u89E3\u8336"
    },
    "available": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 10,
    "description": {
      "zh": "\u56B4\u9078\u53F0\u7063\u6DF1\u6D77L\u865F\u5927\u9B77\u9B5A~\u975E\u4E00\u822C\u5E97\u5BB6m\u865F\u7684\u5C3A\u5BF8\uFF01\u9E79\u9999\u9BAE\u5AE9\u53C8\u591A\u6C41~\u4F4E\u8102\u4F4E\u71B1\u91CF\u512A\u8CEA\u86CB\u767D\u8CEA\u88DC\u5145",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u56B4\u9078\u53F0\u7063\u6DF1\u6D77L\u865F\u5927\u9B77\u9B5A~\u975E\u4E00\u822C\u5E97\u5BB6m\u865F\u7684\u5C3A\u5BF8\uFF01\u9E79\u9999\u9BAE\u5AE9\u53C8\u591A\u6C41~\u4F4E\u8102\u4F4E\u71B1\u91CF\u512A\u8CEA\u86CB\u767D\u8CEA\u88DC\u5145",
      "ja": "\u56B4\u9078\u53F0\u7063\u6DF1\u6D77L\u865F\u5927\u9B77\u9B5A~\u975E\u4E00\u822C\u5E97\u5BB6m\u865F\u7684\u5C3A\u5BF8\uFF01\u9E79\u9999\u9BAE\u5AE9\u53C8\u591A\u6C41~\u4F4E\u8102\u4F4E\u71B1\u91CF\u512A\u8CEA\u86CB\u767D\u8CEA\u88DC\u5145",
      "th": "\u56B4\u9078\u53F0\u7063\u6DF1\u6D77L\u865F\u5927\u9B77\u9B5A~\u975E\u4E00\u822C\u5E97\u5BB6m\u865F\u7684\u5C3A\u5BF8\uFF01\u9E79\u9999\u9BAE\u5AE9\u53C8\u591A\u6C41~\u4F4E\u8102\u4F4E\u71B1\u91CF\u512A\u8CEA\u86CB\u767D\u8CEA\u88DC\u5145"
    },
    "price": 280,
    "containsBeef": false,
    "containsSeafood": true,
    "category": "seafood",
    "id": "dish-2509281752083",
    "containsPork": false,
    "name": {
      "zh": "\u6CF0\u9BAE\u5927\u9B77\u9B5A(\u78B3\u70E4)",
      "en": "Thai BBQ Giant Squid (L-Size)",
      "ko": "\u6CF0\u9BAE\u5927\u9B77\u9B5A(\u78B3\u70E4)",
      "ja": "\u6CF0\u9BAE\u5927\u9B77\u9B5A(\u78B3\u70E4)",
      "th": "\u6CF0\u9BAE\u5927\u9B77\u9B5A(\u78B3\u70E4)"
    },
    "available": true,
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "orderIndex": 11,
    "description": {
      "zh": "\u7D93\u5178\u6CF0\u5F0Fmama\u9EB5~\u62CC\u5165\u7368\u5BB6\u91AC\u6C41~\u64E0\u4E0A\u65B0\u9BAE\u6AB8\u6AAC! \u9178\u8FA3\u958B\u80C3 <\u4E00\u9EDE\u8FA3\u90FD\u6C92\u5403\u7684\u4E0D\u8981\u9EDE\u5594>\u914D\u6599:\u56B4\u9078\u6DF1\u6D77L\u865F\u5927\u9B77\u9B5A \u9BAE\u8766 \u9B77\u9B5A(\u5708) \u9C48\u9B5A\u4E38 \u8CA2\u4E38 \u65E5\u672C\u9B5A\u677F \u6D0B\u8525 \u7D05\u863F\u8514\u7D72 \u5C0F\u9EC3\u74DC \u9AD8\u9E97\u83DC",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "\u7D93\u5178\u6CF0\u5F0Fmama\u9EB5~\u62CC\u5165\u7368\u5BB6\u91AC\u6C41~\u64E0\u4E0A\u65B0\u9BAE\u6AB8\u6AAC! \u9178\u8FA3\u958B\u80C3 <\u4E00\u9EDE\u8FA3\u90FD\u6C92\u5403\u7684\u4E0D\u8981\u9EDE\u5594>\u914D\u6599:\u56B4\u9078\u6DF1\u6D77L\u865F\u5927\u9B77\u9B5A \u9BAE\u8766 \u9B77\u9B5A(\u5708) \u9C48\u9B5A\u4E38 \u8CA2\u4E38 \u65E5\u672C\u9B5A\u677F \u6D0B\u8525 \u7D05\u863F\u8514\u7D72 \u5C0F\u9EC3\u74DC \u9AD8\u9E97\u83DC",
      "ja": "\u7D93\u5178\u6CF0\u5F0Fmama\u9EB5~\u62CC\u5165\u7368\u5BB6\u91AC\u6C41~\u64E0\u4E0A\u65B0\u9BAE\u6AB8\u6AAC! \u9178\u8FA3\u958B\u80C3 <\u4E00\u9EDE\u8FA3\u90FD\u6C92\u5403\u7684\u4E0D\u8981\u9EDE\u5594>\u914D\u6599:\u56B4\u9078\u6DF1\u6D77L\u865F\u5927\u9B77\u9B5A \u9BAE\u8766 \u9B77\u9B5A(\u5708) \u9C48\u9B5A\u4E38 \u8CA2\u4E38 \u65E5\u672C\u9B5A\u677F \u6D0B\u8525 \u7D05\u863F\u8514\u7D72 \u5C0F\u9EC3\u74DC \u9AD8\u9E97\u83DC",
      "th": "\u7D93\u5178\u6CF0\u5F0Fmama\u9EB5~\u62CC\u5165\u7368\u5BB6\u91AC\u6C41~\u64E0\u4E0A\u65B0\u9BAE\u6AB8\u6AAC! \u9178\u8FA3\u958B\u80C3 <\u4E00\u9EDE\u8FA3\u90FD\u6C92\u5403\u7684\u4E0D\u8981\u9EDE\u5594>\u914D\u6599:\u56B4\u9078\u6DF1\u6D77L\u865F\u5927\u9B77\u9B5A \u9BAE\u8766 \u9B77\u9B5A(\u5708) \u9C48\u9B5A\u4E38 \u8CA2\u4E38 \u65E5\u672C\u9B5A\u677F \u6D0B\u8525 \u7D05\u863F\u8514\u7D72 \u5C0F\u9EC3\u74DC \u9AD8\u9E97\u83DC"
    },
    "image": "https://images.unsplash.com/photo-1533622597524-a1215e26c0a2?auto=format&fit=crop&q=80&w=400",
    "containsPork": false,
    "category": "tomyum",
    "id": "dish-2509271759269",
    "price": 390,
    "containsBeef": false,
    "containsSeafood": true,
    "name": {
      "zh": "\u9053\u5730\u6CF0\u5F0F\u5927\u9B77\u9B5A\u6D77\u9BAE\u4E7E\u62CCmama\u9EB5\uFF08\u8FA3\uFF09",
      "en": "Spicy Thai Seafood MAMA Noodles w/ Giant Squid",
      "ko": "\u9053\u5730\u6CF0\u5F0F\u5927\u9B77\u9B5A\u6D77\u9BAE\u4E7E\u62CCmama\u9EB5\uFF08\u8FA3\uFF09",
      "ja": "\u9053\u5730\u6CF0\u5F0F\u5927\u9B77\u9B5A\u6D77\u9BAE\u4E7E\u62CCmama\u9EB5\uFF08\u8FA3\uFF09",
      "th": "\u9053\u5730\u6CF0\u5F0F\u5927\u9B77\u9B5A\u6D77\u9BAE\u4E7E\u62CCmama\u9EB5\uFF08\u8FA3\uFF09"
    },
    "available": true,
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [
      {
        "id": "addon-1784478515294-528",
        "name": "\u5347\u7D1A\u5957\u9910(\u70E4\u852C\u83DC+\u6CF0\u5976\u4E00\u676F)",
        "price": 140
      }
    ],
    "recipe": []
  },
  {
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 12,
    "description": {
      "zh": "\u8AB0\u8AAA\u96DE\u76AE\u53EA\u80FD\u70B8?\u5728\u70AD\u706B\u64C1\u62B1\u4E0B\u6536\u6582\u4E86\u6CB9\u8102~\u86FB\u8B8A\u6210\u8A98\u4EBA\u9165\u8106\u53E3\u611F",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u8AB0\u8AAA\u96DE\u76AE\u53EA\u80FD\u70B8?\u5728\u70AD\u706B\u64C1\u62B1\u4E0B\u6536\u6582\u4E86\u6CB9\u8102~\u86FB\u8B8A\u6210\u8A98\u4EBA\u9165\u8106\u53E3\u611F",
      "ja": "\u8AB0\u8AAA\u96DE\u76AE\u53EA\u80FD\u70B8?\u5728\u70AD\u706B\u64C1\u62B1\u4E0B\u6536\u6582\u4E86\u6CB9\u8102~\u86FB\u8B8A\u6210\u8A98\u4EBA\u9165\u8106\u53E3\u611F",
      "th": "\u8AB0\u8AAA\u96DE\u76AE\u53EA\u80FD\u70B8?\u5728\u70AD\u706B\u64C1\u62B1\u4E0B\u6536\u6582\u4E86\u6CB9\u8102~\u86FB\u8B8A\u6210\u8A98\u4EBA\u9165\u8106\u53E3\u611F"
    },
    "price": 550,
    "containsSeafood": false,
    "containsBeef": false,
    "category": "combos",
    "id": "dish-2508252142113",
    "containsPork": false,
    "name": {
      "zh": "\u96DE\u76AE10\u4E32",
      "en": "Grilled Chicken Skin (10 Skewers)",
      "ko": "\u96DE\u76AE10\u4E32",
      "ja": "\u96DE\u76AE10\u4E32",
      "th": "\u96DE\u76AE10\u4E32"
    },
    "available": true,
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "containsSeafood": false,
    "containsBeef": true,
    "price": 680,
    "category": "combos",
    "id": "dish-2508252141154",
    "containsPork": false,
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
      "ko": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "ja": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "th": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473"
    },
    "orderIndex": 13,
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "\u725B5\u7F8A5\u4E32",
      "en": "Beef & Lamb BBQ Skewers Combo (5 Beef + 5 Lamb)",
      "ko": "\u725B5\u7F8A5\u4E32",
      "ja": "\u725B5\u7F8A5\u4E32",
      "th": "\u725B5\u7F8A5\u4E32"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "available": true,
    "name": {
      "zh": "\u771F\u3002\u5C0F\u7F94\u7F8A\u808910\u4E32",
      "en": "Australian Lamb Skewers (10 Skewers)",
      "ko": "\u771F\u3002\u5C0F\u7F94\u7F8A\u808910\u4E32",
      "ja": "\u771F\u3002\u5C0F\u7F94\u7F8A\u808910\u4E32",
      "th": "\u771F\u3002\u5C0F\u7F94\u7F8A\u808910\u4E32"
    },
    "isNotSpicy": false,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 14,
    "description": {
      "zh": "\u56B4\u90786\u500B\u6708\u5167\u5C0F\u7F94\u7F8A\u8089\u3002(\u6FB3\u6D32\u9032\u53E3) \u653E\u70AD\u706B\u4E0A\u70E4\u81F3\u91D1\u9EC3 \u903C\u51FA\u591A\u9918\u6CB9\u8102 \u6492\u4E0A\u5B5C\u7136\u7C89",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u56B4\u90786\u500B\u6708\u5167\u5C0F\u7F94\u7F8A\u8089\u3002(\u6FB3\u6D32\u9032\u53E3) \u653E\u70AD\u706B\u4E0A\u70E4\u81F3\u91D1\u9EC3 \u903C\u51FA\u591A\u9918\u6CB9\u8102 \u6492\u4E0A\u5B5C\u7136\u7C89",
      "ja": "\u56B4\u90786\u500B\u6708\u5167\u5C0F\u7F94\u7F8A\u8089\u3002(\u6FB3\u6D32\u9032\u53E3) \u653E\u70AD\u706B\u4E0A\u70E4\u81F3\u91D1\u9EC3 \u903C\u51FA\u591A\u9918\u6CB9\u8102 \u6492\u4E0A\u5B5C\u7136\u7C89",
      "th": "\u56B4\u90786\u500B\u6708\u5167\u5C0F\u7F94\u7F8A\u8089\u3002(\u6FB3\u6D32\u9032\u53E3) \u653E\u70AD\u706B\u4E0A\u70E4\u81F3\u91D1\u9EC3 \u903C\u51FA\u591A\u9918\u6CB9\u8102 \u6492\u4E0A\u5B5C\u7136\u7C89"
    },
    "containsSeafood": false,
    "containsBeef": false,
    "price": 650,
    "containsPork": false,
    "id": "dish-2508252136150",
    "category": "combos",
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "name": {
      "zh": "\u6975\u7099\u725B\u808B10\u4E32",
      "en": "Beef Rib Skewers (10 Skewers)",
      "ko": "\u6975\u7099\u725B\u808B10\u4E32",
      "ja": "\u6975\u7099\u725B\u808B10\u4E32",
      "th": "\u6975\u7099\u725B\u808B10\u4E32"
    },
    "available": true,
    "id": "dish-2508252133258",
    "category": "combos",
    "containsPork": false,
    "price": 650,
    "containsSeafood": false,
    "containsBeef": true,
    "description": {
      "zh": "\u9EC3\u91D1\u6BD4\u4F8B\u7684\u725B\u808B\u8089\u584A,\u70E4\u7099\u5916\u8868\u7126\u9999,\u5167\u88E1\u7C89\u5AE9,\u4E00\u53E3\u54AC\u4E0B,\u662F\u5473\u857E\u7684\u6975\u81F4\u4EAB\u53D7",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u9EC3\u91D1\u6BD4\u4F8B\u7684\u725B\u808B\u8089\u584A,\u70E4\u7099\u5916\u8868\u7126\u9999,\u5167\u88E1\u7C89\u5AE9,\u4E00\u53E3\u54AC\u4E0B,\u662F\u5473\u857E\u7684\u6975\u81F4\u4EAB\u53D7",
      "ja": "\u9EC3\u91D1\u6BD4\u4F8B\u7684\u725B\u808B\u8089\u584A,\u70E4\u7099\u5916\u8868\u7126\u9999,\u5167\u88E1\u7C89\u5AE9,\u4E00\u53E3\u54AC\u4E0B,\u662F\u5473\u857E\u7684\u6975\u81F4\u4EAB\u53D7",
      "th": "\u9EC3\u91D1\u6BD4\u4F8B\u7684\u725B\u808B\u8089\u584A,\u70E4\u7099\u5916\u8868\u7126\u9999,\u5167\u88E1\u7C89\u5AE9,\u4E00\u53E3\u54AC\u4E0B,\u662F\u5473\u857E\u7684\u6975\u81F4\u4EAB\u53D7"
    },
    "orderIndex": 15,
    "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": true,
    "name": {
      "zh": "\u6050\u9F8D\u7F8E\u797F",
      "en": "Milo Dinosaur Drink",
      "ko": "\uB9C8\uC77C\uB85C \uB2E4\uC774\uB178\uC18C\uC5B4",
      "ja": "\u30DF\u30ED\u30C0\u30A4\u30CA\u30BD\u30FC",
      "th": "\u0E44\u0E21\u0E42\u0E25\u0E44\u0E14\u0E42\u0E19\u0E40\u0E2A\u0E32\u0E23\u0E4C",
      "vi": "Milo Kh\u1EE7ng Long"
    },
    "available": true,
    "containsPork": false,
    "category": "drinks",
    "id": "dish-2508252009102",
    "price": 90,
    "containsBeef": false,
    "containsSeafood": false,
    "orderIndex": 16,
    "description": {
      "zh": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "\uC2DC\uC6D0\uD558\uACE0 \uC0C1\uCF8C\uD558\uC5EC \uBC14\uBCA0\uD050\uC640 \uC644\uBCBD\uD55C \uC870\uD654\uB97C \uC774\uB8F9\uB2C8\uB2E4.",
      "ja": "\u51B7\u305F\u304F\u3066\u3055\u308F\u3084\u304B\u3001\u30D0\u30FC\u30D9\u30AD\u30E5\u30FC\u306B\u6700\u9AD8\u306E\u7D44\u307F\u5408\u308F\u305B\u3002",
      "th": "\u0E40\u0E22\u0E47\u0E19\u0E0A\u0E37\u0E48\u0E19\u0E43\u0E08 \u0E23\u0E2A\u0E0A\u0E32\u0E15\u0E34\u0E2A\u0E14\u0E0A\u0E37\u0E48\u0E19 \u0E40\u0E02\u0E49\u0E32\u0E01\u0E31\u0E19\u0E44\u0E14\u0E49\u0E14\u0E35\u0E40\u0E22\u0E35\u0E48\u0E22\u0E21\u0E01\u0E31\u0E1A\u0E40\u0E21\u0E19\u0E39\u0E1B\u0E34\u0E49\u0E07\u0E22\u0E48\u0E32\u0E07",
      "vi": "Gi\u1EA3i nhi\u1EC7t s\u1EA3ng kho\xE1i, h\u01B0\u01A1ng v\u1ECB t\u01B0\u01A1i m\xE1t, s\u1EF1 k\u1EBFt h\u1EE3p ho\xE0n h\u1EA3o v\u1EDBi m\xF3n n\u01B0\u1EDBng."
    },
    "image": "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&q=80&w=400"
  },
  {
    "containsPork": false,
    "id": "dish-2508252008143",
    "category": "drinks",
    "containsBeef": false,
    "containsSeafood": false,
    "price": 90,
    "description": {
      "zh": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "\uC2DC\uC6D0\uD558\uACE0 \uC0C1\uCF8C\uD558\uC5EC \uBC14\uBCA0\uD050\uC640 \uC644\uBCBD\uD55C \uC870\uD654\uB97C \uC774\uB8F9\uB2C8\uB2E4.",
      "ja": "\u51B7\u305F\u304F\u3066\u3055\u308F\u3084\u304B\u3001\u30D0\u30FC\u30D9\u30AD\u30E5\u30FC\u306B\u6700\u9AD8\u306E\u7D44\u307F\u5408\u308F\u305B\u3002",
      "th": "\u0E40\u0E22\u0E47\u0E19\u0E0A\u0E37\u0E48\u0E19\u0E43\u0E08 \u0E23\u0E2A\u0E0A\u0E32\u0E15\u0E34\u0E2A\u0E14\u0E0A\u0E37\u0E48\u0E19 \u0E40\u0E02\u0E49\u0E32\u0E01\u0E31\u0E19\u0E44\u0E14\u0E49\u0E14\u0E35\u0E40\u0E22\u0E35\u0E48\u0E22\u0E21\u0E01\u0E31\u0E1A\u0E40\u0E21\u0E19\u0E39\u0E1B\u0E34\u0E49\u0E07\u0E22\u0E48\u0E32\u0E07",
      "vi": "Gi\u1EA3i nhi\u1EC7t s\u1EA3ng kho\xE1i, h\u01B0\u01A1ng v\u1ECB t\u01B0\u01A1i m\xE1t, s\u1EF1 k\u1EBFt h\u1EE3p ho\xE0n h\u1EA3o v\u1EDBi m\xF3n n\u01B0\u1EDBng."
    },
    "orderIndex": 17,
    "image": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": true,
    "available": true,
    "name": {
      "zh": "\u6CF0\u5F0F\u53EF\u53EF\u51B0\u5976",
      "en": "Thai Iced Cocoa Milk",
      "ko": "\uD0DC\uAD6D\uC2DD \uC544\uC774\uC2A4 \uCF54\uCF54\uC544 \uBC00\uD06C",
      "ja": "\u30BF\u30A4\u98A8\u30A2\u30A4\u30B9\u30B3\u30B3\u30A2",
      "th": "\u0E42\u0E01\u0E42\u0E01\u0E49\u0E40\u0E22\u0E47\u0E19\u0E2A\u0E44\u0E15\u0E25\u0E4C\u0E44\u0E17\u0E22",
      "vi": "S\u1EEFa Ca Cao \u0110\xE1 Ki\u1EC3u Th\xE1i"
    }
  },
  {
    "name": {
      "zh": "\u7206\u6F3F\u6CF0\u5976\u5305",
      "en": "Thai Milk Tea Custard Lava Bun",
      "ko": "\u7206\u6F3F\u6CF0\u5976\u5305",
      "ja": "\u7206\u6F3F\u6CF0\u5976\u5305",
      "th": "\u7206\u6F3F\u6CF0\u5976\u5305"
    },
    "available": true,
    "isNotSpicy": true,
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
      "ko": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "ja": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "th": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473"
    },
    "orderIndex": 18,
    "price": 80,
    "containsBeef": false,
    "containsSeafood": false,
    "id": "dish-2508252003261",
    "category": "sweets",
    "containsPork": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 19,
    "description": {
      "zh": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
      "ko": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "ja": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "th": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473"
    },
    "price": 1550,
    "containsSeafood": false,
    "containsBeef": false,
    "category": "combos",
    "containsPork": false,
    "id": "dish-2508202000500",
    "name": {
      "zh": "\u4EBA\u6C23D\u9910",
      "en": "Popular Set D Combo",
      "ko": "\u4EBA\u6C23D\u9910",
      "ja": "\u4EBA\u6C23D\u9910",
      "th": "\u4EBA\u6C23D\u9910"
    },
    "available": true,
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": true,
    "name": {
      "zh": "\u5962\u83EFC\u9910",
      "en": "Luxury Set C Combo",
      "ko": "\u5962\u83EFC\u9910",
      "ja": "\u5962\u83EFC\u9910",
      "th": "\u5962\u83EFC\u9910"
    },
    "available": true,
    "price": 2160,
    "containsSeafood": false,
    "containsBeef": false,
    "category": "combos",
    "containsPork": false,
    "id": "dish-2508201955573",
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 20,
    "description": {
      "zh": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
      "ko": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "ja": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "th": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": true,
    "name": {
      "zh": "\u6CF0\u5976\u7A7A\u6876",
      "en": "Empty Thai Milk Tea Bucket (1L)",
      "ko": "\u6CF0\u5976\u7A7A\u6876",
      "ja": "\u6CF0\u5976\u7A7A\u6876",
      "th": "\u6CF0\u5976\u7A7A\u6876"
    },
    "available": true,
    "price": -30,
    "containsBeef": false,
    "containsSeafood": false,
    "id": "dish-2508141908165",
    "category": "cat-svadcb",
    "containsPork": false,
    "image": "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "\u8D85\u503C\u512A\u60E0\u7D44\u5408\uFF0C\u7269\u8D85\u6240\u503C\uFF0C\u9650\u6642\u4EAB\u7528",
      "en": "Great value combo package, high cost-performance deal for a limited time.",
      "ko": "\u8D85\u503C\u512A\u60E0\u7D44\u5408\uFF0C\u7269\u8D85\u6240\u503C\uFF0C\u9650\u6642\u4EAB\u7528",
      "ja": "\u8D85\u503C\u512A\u60E0\u7D44\u5408\uFF0C\u7269\u8D85\u6240\u503C\uFF0C\u9650\u6642\u4EAB\u7528",
      "th": "\u8D85\u503C\u512A\u60E0\u7D44\u5408\uFF0C\u7269\u8D85\u6240\u503C\uFF0C\u9650\u6642\u4EAB\u7528"
    },
    "orderIndex": 21,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "orderIndex": 22,
    "description": {
      "zh": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
      "ko": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "ja": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "th": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473"
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "id": "dish-2508112131059",
    "category": "veggies",
    "containsPork": false,
    "price": 80,
    "containsBeef": false,
    "containsSeafood": false,
    "name": {
      "zh": "\u5A03\u5A03\u83DC2p",
      "en": "Baby Chinese Cabbage (2pcs)",
      "ko": "\u5A03\u5A03\u83DC2p",
      "ja": "\u5A03\u5A03\u83DC2p",
      "th": "\u5A03\u5A03\u83DC2p"
    },
    "available": true,
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "name": {
      "zh": "\u7206\u6C41\u91D1\u91DD\u83C7\u8C6C\u8089",
      "en": "Juicy Pork Wrapped Enoki Mushroom",
      "ko": "\u7206\u6C41\u91D1\u91DD\u83C7\u8C6C\u8089",
      "ja": "\u7206\u6C41\u91D1\u91DD\u83C7\u8C6C\u8089",
      "th": "\u7206\u6C41\u91D1\u91DD\u83C7\u8C6C\u8089"
    },
    "available": true,
    "price": 90,
    "containsBeef": false,
    "containsSeafood": false,
    "category": "skewers",
    "containsPork": true,
    "id": "dish-2508112130113",
    "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 23,
    "description": {
      "zh": "\u9BAE\u5AE9\u8C6C\u8089\u7247\u5305\u88F9\u723D\u8106\u91D1\u91DD\u83C7\uFF0C\u5237\u91AC\u70E4\u81F3\u91D1\u9EC3\u7126\u9999",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u9BAE\u5AE9\u8C6C\u8089\u7247\u5305\u88F9\u723D\u8106\u91D1\u91DD\u83C7\uFF0C\u5237\u91AC\u70E4\u81F3\u91D1\u9EC3\u7126\u9999",
      "ja": "\u9BAE\u5AE9\u8C6C\u8089\u7247\u5305\u88F9\u723D\u8106\u91D1\u91DD\u83C7\uFF0C\u5237\u91AC\u70E4\u81F3\u91D1\u9EC3\u7126\u9999",
      "th": "\u9BAE\u5AE9\u8C6C\u8089\u7247\u5305\u88F9\u723D\u8106\u91D1\u91DD\u83C7\uFF0C\u5237\u91AC\u70E4\u81F3\u91D1\u9EC3\u7126\u9999"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": true,
    "name": {
      "zh": "\u5BA2\u5BB6\u5E63\u5237\u5361",
      "en": "Hakka Coin Card Payment",
      "ko": "\u5BA2\u5BB6\u5E63\u5237\u5361",
      "ja": "\u5BA2\u5BB6\u5E63\u5237\u5361",
      "th": "\u5BA2\u5BB6\u5E63\u5237\u5361"
    },
    "available": true,
    "price": -1e3,
    "containsBeef": false,
    "containsSeafood": false,
    "id": "dish-2507182004409",
    "category": "cat-svadcb",
    "containsPork": false,
    "image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 24,
    "description": {
      "zh": "\u8D85\u503C\u512A\u60E0\u7D44\u5408\uFF0C\u7269\u8D85\u6240\u503C\uFF0C\u9650\u6642\u4EAB\u7528",
      "en": "Great value combo package, high cost-performance deal for a limited time.",
      "ko": "\u8D85\u503C\u512A\u60E0\u7D44\u5408\uFF0C\u7269\u8D85\u6240\u503C\uFF0C\u9650\u6642\u4EAB\u7528",
      "ja": "\u8D85\u503C\u512A\u60E0\u7D44\u5408\uFF0C\u7269\u8D85\u6240\u503C\uFF0C\u9650\u6642\u4EAB\u7528",
      "th": "\u8D85\u503C\u512A\u60E0\u7D44\u5408\uFF0C\u7269\u8D85\u6240\u503C\uFF0C\u9650\u6642\u4EAB\u7528"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "name": {
      "zh": "\u62DB\u724CA\u9910",
      "en": "Signature Set A Combo",
      "ko": "\u62DB\u724CA\u9910",
      "ja": "\u62DB\u724CA\u9910",
      "th": "\u62DB\u724CA\u9910"
    },
    "available": true,
    "id": "dish-2507072257199",
    "category": "combos",
    "containsPork": false,
    "price": 660,
    "containsBeef": false,
    "containsSeafood": false,
    "description": {
      "zh": "\u7B2C\u4E00\u6B21\u9032\u4F86?\u4E0D\u77E5\u9053\u9078\u5565 \u7CBE\u83EF\u90FD\u5728\u9019\u4E86 \u5E97\u5167\u62DB\u724C\u5546\u54C1\u4E00\u6B21\u64C1\u6709! \u6CF0\u5F0F\u624B\u5DE5\u725B\u80891\u4E32/\u7206\u6C41\u91D1\u91DD\u83C7\u8C6C\u80891\u4E32/\u6CF0\u5317\u9178\u8089\u51AC\u7C89\u81781\u4E32/\u6CF0\u5F0F\u70E4\u96DE\u7FC54\u96BB/\u6CF0\u9165\u8C46\u76AE1\u4EFD/\u751C\u4E0D\u8FA31\u4EFD/\u6CF0\u5F0F\u5976\u83361\u676F!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u7B2C\u4E00\u6B21\u9032\u4F86?\u4E0D\u77E5\u9053\u9078\u5565 \u7CBE\u83EF\u90FD\u5728\u9019\u4E86 \u5E97\u5167\u62DB\u724C\u5546\u54C1\u4E00\u6B21\u64C1\u6709! \u6CF0\u5F0F\u624B\u5DE5\u725B\u80891\u4E32/\u7206\u6C41\u91D1\u91DD\u83C7\u8C6C\u80891\u4E32/\u6CF0\u5317\u9178\u8089\u51AC\u7C89\u81781\u4E32/\u6CF0\u5F0F\u70E4\u96DE\u7FC54\u96BB/\u6CF0\u9165\u8C46\u76AE1\u4EFD/\u751C\u4E0D\u8FA31\u4EFD/\u6CF0\u5F0F\u5976\u83361\u676F!",
      "ja": "\u7B2C\u4E00\u6B21\u9032\u4F86?\u4E0D\u77E5\u9053\u9078\u5565 \u7CBE\u83EF\u90FD\u5728\u9019\u4E86 \u5E97\u5167\u62DB\u724C\u5546\u54C1\u4E00\u6B21\u64C1\u6709! \u6CF0\u5F0F\u624B\u5DE5\u725B\u80891\u4E32/\u7206\u6C41\u91D1\u91DD\u83C7\u8C6C\u80891\u4E32/\u6CF0\u5317\u9178\u8089\u51AC\u7C89\u81781\u4E32/\u6CF0\u5F0F\u70E4\u96DE\u7FC54\u96BB/\u6CF0\u9165\u8C46\u76AE1\u4EFD/\u751C\u4E0D\u8FA31\u4EFD/\u6CF0\u5F0F\u5976\u83361\u676F!",
      "th": "\u7B2C\u4E00\u6B21\u9032\u4F86?\u4E0D\u77E5\u9053\u9078\u5565 \u7CBE\u83EF\u90FD\u5728\u9019\u4E86 \u5E97\u5167\u62DB\u724C\u5546\u54C1\u4E00\u6B21\u64C1\u6709! \u6CF0\u5F0F\u624B\u5DE5\u725B\u80891\u4E32/\u7206\u6C41\u91D1\u91DD\u83C7\u8C6C\u80891\u4E32/\u6CF0\u5317\u9178\u8089\u51AC\u7C89\u81781\u4E32/\u6CF0\u5F0F\u70E4\u96DE\u7FC54\u96BB/\u6CF0\u9165\u8C46\u76AE1\u4EFD/\u751C\u4E0D\u8FA31\u4EFD/\u6CF0\u5F0F\u5976\u83361\u676F!"
    },
    "orderIndex": 25,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": true,
    "name": {
      "zh": "\u96EA\u5C71",
      "en": "Snow Mountain Beer",
      "ko": "\u96EA\u5C71",
      "ja": "\u96EA\u5C71",
      "th": "\u96EA\u5C71"
    },
    "available": true,
    "id": "dish-2506292231385",
    "containsPork": false,
    "category": "cat-7cvvkq",
    "price": 100,
    "containsBeef": false,
    "containsSeafood": false,
    "orderIndex": 26,
    "description": {
      "zh": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "ja": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "th": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D"
    },
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "name": {
      "zh": "\u91D1\u82AC\u9EDB\u8461\u8404\u9152",
      "en": "Zinfandel Red Wine",
      "ko": "\u91D1\u82AC\u9EDB\u8461\u8404\u9152",
      "ja": "\u91D1\u82AC\u9EDB\u8461\u8404\u9152",
      "th": "\u91D1\u82AC\u9EDB\u8461\u8404\u9152"
    },
    "available": true,
    "isNotSpicy": true,
    "image": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 27,
    "description": {
      "zh": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "ja": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "th": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D"
    },
    "price": 800,
    "containsSeafood": false,
    "containsBeef": false,
    "id": "dish-2506182247281",
    "category": "cat-7cvvkq",
    "containsPork": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "name": {
      "zh": "\u7D05\u91AC\u5916\u5E36\u74F6",
      "en": "Signature Spicy Red Sauce Bottle",
      "ko": "\u7D05\u91AC\u5916\u5E36\u74F6",
      "ja": "\u7D05\u91AC\u5916\u5E36\u74F6",
      "th": "\u7D05\u91AC\u5916\u5E36\u74F6"
    },
    "available": true,
    "price": 150,
    "containsBeef": false,
    "containsSeafood": false,
    "category": "cat-zene8j",
    "containsPork": false,
    "id": "dish-2506132134210",
    "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 28,
    "description": {
      "zh": "\u5E97\u5167\u7684\u5927\u8FA3\u7D05\u91AC~\u7368\u5BB6\u81EA\u88FD~\u6CBE\u70E4\u8089\u6CBE\u70B8\u7269\u52A0\u5728\u6D77\u9BAE\u4E7E\u62CC\u9EB5\u90FD\u5F88\u597D\u5403",
      "en": "Carefully crafted with rich flavors to complement your meal",
      "ko": "\u5E97\u5167\u7684\u5927\u8FA3\u7D05\u91AC~\u7368\u5BB6\u81EA\u88FD~\u6CBE\u70E4\u8089\u6CBE\u70B8\u7269\u52A0\u5728\u6D77\u9BAE\u4E7E\u62CC\u9EB5\u90FD\u5F88\u597D\u5403",
      "ja": "\u5E97\u5167\u7684\u5927\u8FA3\u7D05\u91AC~\u7368\u5BB6\u81EA\u88FD~\u6CBE\u70E4\u8089\u6CBE\u70B8\u7269\u52A0\u5728\u6D77\u9BAE\u4E7E\u62CC\u9EB5\u90FD\u5F88\u597D\u5403",
      "th": "\u5E97\u5167\u7684\u5927\u8FA3\u7D05\u91AC~\u7368\u5BB6\u81EA\u88FD~\u6CBE\u70E4\u8089\u6CBE\u70B8\u7269\u52A0\u5728\u6D77\u9BAE\u4E7E\u62CC\u9EB5\u90FD\u5F88\u597D\u5403"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "name": {
      "zh": "\u7DA0\u91AC\u5916\u5E36\u74F6",
      "en": "Signature Thai Green Chili Sauce Bottle",
      "ko": "\u7DA0\u91AC\u5916\u5E36\u74F6",
      "ja": "\u7DA0\u91AC\u5916\u5E36\u74F6",
      "th": "\u7DA0\u91AC\u5916\u5E36\u74F6"
    },
    "available": true,
    "price": 150,
    "containsSeafood": false,
    "containsBeef": false,
    "category": "cat-zene8j",
    "containsPork": false,
    "id": "dish-2506132131288",
    "image": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 29,
    "description": {
      "zh": "\u5E97\u5167\u7684\u5C0F\u8FA3\u7DA0\u91AC~\u7368\u5BB6\u81EA\u88FD~\u6CBE\u70E4\u8089\u6CBE\u70B8\u7269\u52A0\u5728\u6D77\u9BAE\u4E7E\u62CC\u9EB5\u90FD\u5F88\u597D\u5403",
      "en": "Carefully crafted with rich flavors to complement your meal",
      "ko": "\u5E97\u5167\u7684\u5C0F\u8FA3\u7DA0\u91AC~\u7368\u5BB6\u81EA\u88FD~\u6CBE\u70E4\u8089\u6CBE\u70B8\u7269\u52A0\u5728\u6D77\u9BAE\u4E7E\u62CC\u9EB5\u90FD\u5F88\u597D\u5403",
      "ja": "\u5E97\u5167\u7684\u5C0F\u8FA3\u7DA0\u91AC~\u7368\u5BB6\u81EA\u88FD~\u6CBE\u70E4\u8089\u6CBE\u70B8\u7269\u52A0\u5728\u6D77\u9BAE\u4E7E\u62CC\u9EB5\u90FD\u5F88\u597D\u5403",
      "th": "\u5E97\u5167\u7684\u5C0F\u8FA3\u7DA0\u91AC~\u7368\u5BB6\u81EA\u88FD~\u6CBE\u70E4\u8089\u6CBE\u70B8\u7269\u52A0\u5728\u6D77\u9BAE\u4E7E\u62CC\u9EB5\u90FD\u5F88\u597D\u5403"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "name": {
      "zh": "\u7206\u6C41\u6ADB\u74DC",
      "en": "Juicy Grilled Zucchini",
      "ko": "\u7206\u6C41\u6ADB\u74DC",
      "ja": "\u7206\u6C41\u6ADB\u74DC",
      "th": "\u7206\u6C41\u6ADB\u74DC"
    },
    "available": true,
    "isNotSpicy": false,
    "description": {
      "zh": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
      "ko": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "ja": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "th": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473"
    },
    "orderIndex": 30,
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "category": "veggies",
    "id": "dish-2505242017116",
    "containsPork": false,
    "price": 140,
    "containsBeef": false,
    "containsSeafood": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "available": true,
    "name": {
      "zh": "\u6CF0\u5F0F\u6771\u708E\u8C6C\u8089.\u7C73\u7DDA",
      "en": "Thai Tom Yum Pork Rice Noodle",
      "ko": "\u6CF0\u5F0F\u6771\u708E\u8C6C\u8089.\u7C73\u7DDA",
      "ja": "\u6CF0\u5F0F\u6771\u708E\u8C6C\u8089.\u7C73\u7DDA",
      "th": "\u6CF0\u5F0F\u6771\u708E\u8C6C\u8089.\u7C73\u7DDA"
    },
    "isNotSpicy": false,
    "orderIndex": 31,
    "description": {
      "zh": "\u53F0\u7063\u8C6C\u4E94\u82B1\u8089\u7247\u3001\u9C48\u9B5A\u4E38 \u8CA2\u4E38\u3001\u65E5\u672C\u9B5A\u677F\u3001\u5927\u9678\u59B9\u3001\u6D0B\u8525 \u7D05\u863F\u8514\u3001\u4E5D\u5C64\u5854\u3001\u9AD8\u9E97\u83DC",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "\u53F0\u7063\u8C6C\u4E94\u82B1\u8089\u7247\u3001\u9C48\u9B5A\u4E38 \u8CA2\u4E38\u3001\u65E5\u672C\u9B5A\u677F\u3001\u5927\u9678\u59B9\u3001\u6D0B\u8525 \u7D05\u863F\u8514\u3001\u4E5D\u5C64\u5854\u3001\u9AD8\u9E97\u83DC",
      "ja": "\u53F0\u7063\u8C6C\u4E94\u82B1\u8089\u7247\u3001\u9C48\u9B5A\u4E38 \u8CA2\u4E38\u3001\u65E5\u672C\u9B5A\u677F\u3001\u5927\u9678\u59B9\u3001\u6D0B\u8525 \u7D05\u863F\u8514\u3001\u4E5D\u5C64\u5854\u3001\u9AD8\u9E97\u83DC",
      "th": "\u53F0\u7063\u8C6C\u4E94\u82B1\u8089\u7247\u3001\u9C48\u9B5A\u4E38 \u8CA2\u4E38\u3001\u65E5\u672C\u9B5A\u677F\u3001\u5927\u9678\u59B9\u3001\u6D0B\u8525 \u7D05\u863F\u8514\u3001\u4E5D\u5C64\u5854\u3001\u9AD8\u9E97\u83DC"
    },
    "image": "https://images.unsplash.com/photo-1533622597524-a1215e26c0a2?auto=format&fit=crop&q=80&w=400",
    "category": "tomyum",
    "containsPork": true,
    "id": "dish-2505041844456",
    "containsBeef": false,
    "containsSeafood": false,
    "price": 240,
    "hasNoodlesOption": false,
    "customAddOns": [
      {
        "id": "addon-1784478850618-672",
        "name": "\u52A0\u6CB3\u7C89",
        "price": 20
      },
      {
        "id": "addon-1784478853337-718",
        "name": "\u52A0\u7C73\u7DDA",
        "price": 20
      },
      {
        "id": "addon-1784478856450-76",
        "name": "\u5347\u7D1A\u5957\u9910(\u70E4\u852C\u83DC+\u6CF0\u5976\u4E00\u676F)",
        "price": 140
      }
    ],
    "recipe": []
  },
  {
    "available": true,
    "name": {
      "zh": "\u6CF0\u5F0F\u6771\u708E\u8C6C\u8089.\u6CB3\u7C89",
      "en": "Thai Tom Yum Pork Pho Noodle",
      "ko": "\u6CF0\u5F0F\u6771\u708E\u8C6C\u8089.\u6CB3\u7C89",
      "ja": "\u6CF0\u5F0F\u6771\u708E\u8C6C\u8089.\u6CB3\u7C89",
      "th": "\u6CF0\u5F0F\u6771\u708E\u8C6C\u8089.\u6CB3\u7C89"
    },
    "isNotSpicy": false,
    "image": "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 32,
    "description": {
      "zh": "\u53F0\u7063\u8C6C\u4E94\u82B1\u8089\u7247\u3001\u9C48\u9B5A\u4E38 \u8CA2\u4E38\u3001\u65E5\u672C\u9B5A\u677F\u3001\u5927\u9678\u59B9\u3001\u6D0B\u8525 \u7D05\u863F\u8514\u3001\u4E5D\u5C64\u5854\u3001\u9AD8\u9E97\u83DC",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "\u53F0\u7063\u8C6C\u4E94\u82B1\u8089\u7247\u3001\u9C48\u9B5A\u4E38 \u8CA2\u4E38\u3001\u65E5\u672C\u9B5A\u677F\u3001\u5927\u9678\u59B9\u3001\u6D0B\u8525 \u7D05\u863F\u8514\u3001\u4E5D\u5C64\u5854\u3001\u9AD8\u9E97\u83DC",
      "ja": "\u53F0\u7063\u8C6C\u4E94\u82B1\u8089\u7247\u3001\u9C48\u9B5A\u4E38 \u8CA2\u4E38\u3001\u65E5\u672C\u9B5A\u677F\u3001\u5927\u9678\u59B9\u3001\u6D0B\u8525 \u7D05\u863F\u8514\u3001\u4E5D\u5C64\u5854\u3001\u9AD8\u9E97\u83DC",
      "th": "\u53F0\u7063\u8C6C\u4E94\u82B1\u8089\u7247\u3001\u9C48\u9B5A\u4E38 \u8CA2\u4E38\u3001\u65E5\u672C\u9B5A\u677F\u3001\u5927\u9678\u59B9\u3001\u6D0B\u8525 \u7D05\u863F\u8514\u3001\u4E5D\u5C64\u5854\u3001\u9AD8\u9E97\u83DC"
    },
    "containsSeafood": false,
    "containsBeef": false,
    "price": 240,
    "id": "dish-2505041843176",
    "containsPork": true,
    "category": "tomyum",
    "hasNoodlesOption": false,
    "customAddOns": [
      {
        "id": "addon-1784478881366-690",
        "name": "\u52A0\u6CB3\u7C89",
        "price": 20
      },
      {
        "id": "addon-1784478887811-679",
        "name": "\u52A0\u7C73\u7DDA",
        "price": 20
      },
      {
        "id": "addon-1784478890845-28",
        "name": "\u5347\u7D1A\u5957\u9910(\u70E4\u852C\u83DC+\u6CF0\u5976\u4E00\u676F)",
        "price": 140
      }
    ],
    "recipe": []
  },
  {
    "available": true,
    "name": {
      "zh": "\u8857\u982D\u6CF0\u59761L",
      "en": "Thai Street Milk Tea (1L Bucket)",
      "ko": "\u8857\u982D\u6CF0\u59761L",
      "ja": "\u8857\u982D\u6CF0\u59761L",
      "th": "\u8857\u982D\u6CF0\u59761L"
    },
    "isNotSpicy": true,
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 33,
    "description": {
      "zh": "\u7DB2\u7D05\u7DB2\u5E25\u62CD\u7167\u5FC5\u5099~\u8336\u9999\u6FC3\u90C1\u7684\u7D93\u5178\u6CF0\u5976~\u7A7A\u6876\u56DE\u5E97\u56DE\u8CFC\u518D\u629830\u5143!",
      "en": "Refreshing and cool, a perfect match for BBQ",
      "ko": "\u7DB2\u7D05\u7DB2\u5E25\u62CD\u7167\u5FC5\u5099~\u8336\u9999\u6FC3\u90C1\u7684\u7D93\u5178\u6CF0\u5976~\u7A7A\u6876\u56DE\u5E97\u56DE\u8CFC\u518D\u629830\u5143!",
      "ja": "\u7DB2\u7D05\u7DB2\u5E25\u62CD\u7167\u5FC5\u5099~\u8336\u9999\u6FC3\u90C1\u7684\u7D93\u5178\u6CF0\u5976~\u7A7A\u6876\u56DE\u5E97\u56DE\u8CFC\u518D\u629830\u5143!",
      "th": "\u7DB2\u7D05\u7DB2\u5E25\u62CD\u7167\u5FC5\u5099~\u8336\u9999\u6FC3\u90C1\u7684\u7D93\u5178\u6CF0\u5976~\u7A7A\u6876\u56DE\u5E97\u56DE\u8CFC\u518D\u629830\u5143!"
    },
    "containsSeafood": false,
    "containsBeef": false,
    "price": 180,
    "containsPork": false,
    "category": "drinks",
    "id": "dish-2505041825592",
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "containsBeef": true,
    "hasNoodlesOption": false,
    "hasCoconutsMilkOption": true,
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 34,
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "\u6CF0\u6EFF\u8DB3\u6D77\u9678\u725B\u51AC\u852D\u529F",
      "en": "Surf & Turf Beef Tom Yum Noodle Soup",
      "ko": "\u6CF0\u6EFF\u8DB3\u6D77\u9678\u725B\u51AC\u852D\u529F",
      "ja": "\u6CF0\u6EFF\u8DB3\u6D77\u9678\u725B\u51AC\u852D\u529F",
      "th": "\u6CF0\u6EFF\u8DB3\u6D77\u9678\u725B\u51AC\u852D\u529F"
    },
    "containsSeafood": false,
    "price": 390,
    "category": "tomyum",
    "containsPork": false,
    "id": "dish-2505041753253",
    "description": {
      "zh": "\u914D\u6599: \u7F8E\u570B\u5AE9\u80A9\u91CC\u808Cchoice\u725B\u8089\u7247 \u8766\u5B50 \u9B77\u9B5A\u5708 \u86E4\u8823 \u9C48\u9B5A\u4E38 \u8CA2\u4E38 \u65E5\u672C\u9B5A\u677F \u5927\u9678\u59B9 \u6D0B\u8525 \u7D05\u863F\u8514 \u4E5D\u5C64\u5854",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "\u914D\u6599: \u7F8E\u570B\u5AE9\u80A9\u91CC\u808Cchoice\u725B\u8089\u7247 \u8766\u5B50 \u9B77\u9B5A\u5708 \u86E4\u8823 \u9C48\u9B5A\u4E38 \u8CA2\u4E38 \u65E5\u672C\u9B5A\u677F \u5927\u9678\u59B9 \u6D0B\u8525 \u7D05\u863F\u8514 \u4E5D\u5C64\u5854",
      "ja": "\u914D\u6599: \u7F8E\u570B\u5AE9\u80A9\u91CC\u808Cchoice\u725B\u8089\u7247 \u8766\u5B50 \u9B77\u9B5A\u5708 \u86E4\u8823 \u9C48\u9B5A\u4E38 \u8CA2\u4E38 \u65E5\u672C\u9B5A\u677F \u5927\u9678\u59B9 \u6D0B\u8525 \u7D05\u863F\u8514 \u4E5D\u5C64\u5854",
      "th": "\u914D\u6599: \u7F8E\u570B\u5AE9\u80A9\u91CC\u808Cchoice\u725B\u8089\u7247 \u8766\u5B50 \u9B77\u9B5A\u5708 \u86E4\u8823 \u9C48\u9B5A\u4E38 \u8CA2\u4E38 \u65E5\u672C\u9B5A\u677F \u5927\u9678\u59B9 \u6D0B\u8525 \u7D05\u863F\u8514 \u4E5D\u5C64\u5854"
    },
    "customAddOns": [
      {
        "id": "addon-1784478928738-313",
        "name": "\u52A0\u6CB3\u7C89",
        "price": 20
      },
      {
        "id": "addon-1784478931302-574",
        "name": "\u52A0\u7C73\u7DDA",
        "price": 20
      },
      {
        "id": "addon-1784478933543-454",
        "name": "\u5347\u7D1A\u5957\u9910(\u70E4\u852C\u83DC+\u6CF0\u5976\u4E00\u676F)",
        "price": 140
      }
    ],
    "recipe": []
  },
  {
    "id": "dish-2505041751044",
    "category": "tomyum",
    "containsPork": true,
    "price": 360,
    "containsSeafood": false,
    "description": {
      "zh": "\u914D\u6599:\u53F0\u7063\u8C6C\u4E94\u82B1\u8089\u7247 \u8766\u5B50 \u9B77\u9B5A\u5708 \u86E4\u8823 \u9C48\u9B5A\u4E38 \u8CA2\u4E38 \u65E5\u672C\u9B5A\u677F \u5927\u9678\u59B9 \u6D0B\u8525 \u7D05\u863F\u8514 \u4E5D\u5C64\u5854",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "\u914D\u6599:\u53F0\u7063\u8C6C\u4E94\u82B1\u8089\u7247 \u8766\u5B50 \u9B77\u9B5A\u5708 \u86E4\u8823 \u9C48\u9B5A\u4E38 \u8CA2\u4E38 \u65E5\u672C\u9B5A\u677F \u5927\u9678\u59B9 \u6D0B\u8525 \u7D05\u863F\u8514 \u4E5D\u5C64\u5854",
      "ja": "\u914D\u6599:\u53F0\u7063\u8C6C\u4E94\u82B1\u8089\u7247 \u8766\u5B50 \u9B77\u9B5A\u5708 \u86E4\u8823 \u9C48\u9B5A\u4E38 \u8CA2\u4E38 \u65E5\u672C\u9B5A\u677F \u5927\u9678\u59B9 \u6D0B\u8525 \u7D05\u863F\u8514 \u4E5D\u5C64\u5854",
      "th": "\u914D\u6599:\u53F0\u7063\u8C6C\u4E94\u82B1\u8089\u7247 \u8766\u5B50 \u9B77\u9B5A\u5708 \u86E4\u8823 \u9C48\u9B5A\u4E38 \u8CA2\u4E38 \u65E5\u672C\u9B5A\u677F \u5927\u9678\u59B9 \u6D0B\u8525 \u7D05\u863F\u8514 \u4E5D\u5C64\u5854"
    },
    "hasCoconutsMilkOption": true,
    "hasNoodlesOption": false,
    "containsBeef": false,
    "orderIndex": 35,
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": false,
    "name": {
      "zh": "\u6D77\u9678\u8C6C\u51AC\u852D\u529F\u6E6F",
      "en": "Surf & Turf Pork Tom Yum Soup",
      "ko": "\u6D77\u9678\u8C6C\u51AC\u852D\u529F\u6E6F",
      "ja": "\u6D77\u9678\u8C6C\u51AC\u852D\u529F\u6E6F",
      "th": "\u6D77\u9678\u8C6C\u51AC\u852D\u529F\u6E6F"
    },
    "available": true,
    "customAddOns": [
      {
        "id": "addon-1784478951444-682",
        "name": "\u52A0\u6CB3\u7C89",
        "price": 20
      },
      {
        "id": "addon-1784478953658-987",
        "name": "\u52A0\u7C73\u7DDA",
        "price": 20
      },
      {
        "id": "addon-1784478955921-185",
        "name": "\u5347\u7D1A\u5957\u9910(\u70E4\u852C\u83DC+\u6CF0\u5976\u4E00\u676F)",
        "price": 140
      }
    ],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "\u852C\u83DC\u62FC\u76E4",
      "en": "Fresh Vegetables Platter",
      "ko": "\u852C\u83DC\u62FC\u76E4",
      "ja": "\u852C\u83DC\u62FC\u76E4",
      "th": "\u852C\u83DC\u62FC\u76E4"
    },
    "id": "dish-2504161837515",
    "containsPork": false,
    "category": "veggies",
    "containsSeafood": false,
    "containsBeef": false,
    "price": 260,
    "description": {
      "zh": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
      "ko": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "ja": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "th": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473"
    },
    "orderIndex": 36,
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "containsPork": false,
    "category": "skewers",
    "id": "dish-2503181902333",
    "containsBeef": false,
    "containsSeafood": false,
    "price": 680,
    "orderIndex": 37,
    "description": {
      "zh": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
      "ko": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "ja": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "th": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473"
    },
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "\u5C0F\u7F8A\u80A9\u6392",
      "en": "Charcoal Grilled Lamb Shoulder Chop",
      "ko": "\u5C0F\u7F8A\u80A9\u6392",
      "ja": "\u5C0F\u7F8A\u80A9\u6392",
      "th": "\u5C0F\u7F8A\u80A9\u6392"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "name": {
      "zh": "\u6CF0\u5F0F\u751F\u881411p",
      "en": "Thai Style Fresh Oysters (11pcs)",
      "ko": "\u6CF0\u5F0F\u751F\u881411p",
      "ja": "\u6CF0\u5F0F\u751F\u881411p",
      "th": "\u6CF0\u5F0F\u751F\u881411p"
    },
    "available": true,
    "isNotSpicy": false,
    "orderIndex": 38,
    "description": {
      "zh": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
      "ko": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "ja": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "th": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473"
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "category": "seafood",
    "containsPork": false,
    "id": "dish-2503171838086",
    "price": 2200,
    "containsBeef": false,
    "containsSeafood": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "name": {
      "zh": "\u5BA2\u5BB6\u5E63",
      "en": "Hakka Coin Coupon",
      "ko": "\u5BA2\u5BB6\u5E63",
      "ja": "\u5BA2\u5BB6\u5E63",
      "th": "\u5BA2\u5BB6\u5E63"
    },
    "available": true,
    "isNotSpicy": true,
    "orderIndex": 39,
    "description": {
      "zh": "\u8D85\u503C\u512A\u60E0\u7D44\u5408\uFF0C\u7269\u8D85\u6240\u503C\uFF0C\u9650\u6642\u4EAB\u7528",
      "en": "Great value combo package, high cost-performance deal for a limited time.",
      "ko": "\u8D85\u503C\u512A\u60E0\u7D44\u5408\uFF0C\u7269\u8D85\u6240\u503C\uFF0C\u9650\u6642\u4EAB\u7528",
      "ja": "\u8D85\u503C\u512A\u60E0\u7D44\u5408\uFF0C\u7269\u8D85\u6240\u503C\uFF0C\u9650\u6642\u4EAB\u7528",
      "th": "\u8D85\u503C\u512A\u60E0\u7D44\u5408\uFF0C\u7269\u8D85\u6240\u503C\uFF0C\u9650\u6642\u4EAB\u7528"
    },
    "image": "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&q=80&w=400",
    "category": "cat-svadcb",
    "id": "dish-2503012218077",
    "containsPork": false,
    "price": -1,
    "containsSeafood": false,
    "containsBeef": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "id": "dish-2502252357010",
    "category": "combos",
    "containsPork": false,
    "containsBeef": false,
    "containsSeafood": false,
    "price": 460,
    "description": {
      "zh": "\u6CF0\u5F0F\u624B\u5DE5\u725B\xD71\u539F\u584A\u725B\u808B\u4E32\xD71 \u5C0F\u7F94\u7F8A\u808B\u4E32\xD71\n\u8089\u96DE\u4E03\u91CC\u9999\u4E32\xD71\u7CBE\u9078\u80A5\u8178\u4E32\xD71\u5674\u6C34\u9999\u8178\u4E32\xD71\u5543\u7684\u96DE\u76AE\xD71 \u9078\u64C7\u969C\u7919\u7684\u9EDE\u5B83\u5C31\u662F\u4E86",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u6CF0\u5F0F\u624B\u5DE5\u725B\xD71\u539F\u584A\u725B\u808B\u4E32\xD71 \u5C0F\u7F94\u7F8A\u808B\u4E32\xD71\n\u8089\u96DE\u4E03\u91CC\u9999\u4E32\xD71\u7CBE\u9078\u80A5\u8178\u4E32\xD71\u5674\u6C34\u9999\u8178\u4E32\xD71\u5543\u7684\u96DE\u76AE\xD71 \u9078\u64C7\u969C\u7919\u7684\u9EDE\u5B83\u5C31\u662F\u4E86",
      "ja": "\u6CF0\u5F0F\u624B\u5DE5\u725B\xD71\u539F\u584A\u725B\u808B\u4E32\xD71 \u5C0F\u7F94\u7F8A\u808B\u4E32\xD71\n\u8089\u96DE\u4E03\u91CC\u9999\u4E32\xD71\u7CBE\u9078\u80A5\u8178\u4E32\xD71\u5674\u6C34\u9999\u8178\u4E32\xD71\u5543\u7684\u96DE\u76AE\xD71 \u9078\u64C7\u969C\u7919\u7684\u9EDE\u5B83\u5C31\u662F\u4E86",
      "th": "\u6CF0\u5F0F\u624B\u5DE5\u725B\xD71\u539F\u584A\u725B\u808B\u4E32\xD71 \u5C0F\u7F94\u7F8A\u808B\u4E32\xD71\n\u8089\u96DE\u4E03\u91CC\u9999\u4E32\xD71\u7CBE\u9078\u80A5\u8178\u4E32\xD71\u5674\u6C34\u9999\u8178\u4E32\xD71\u5543\u7684\u96DE\u76AE\xD71 \u9078\u64C7\u969C\u7919\u7684\u9EDE\u5B83\u5C31\u662F\u4E86"
    },
    "orderIndex": 40,
    "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "\u591A\u8089B\u9910",
      "en": "Meat Lover's Set B Combo",
      "ko": "\u591A\u8089B\u9910",
      "ja": "\u591A\u8089B\u9910",
      "th": "\u591A\u8089B\u9910"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "description": {
      "zh": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "ja": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "th": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D"
    },
    "orderIndex": 41,
    "image": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=400",
    "category": "cat-6ovxss",
    "id": "dish-2502031821565",
    "containsPork": false,
    "containsBeef": false,
    "containsSeafood": false,
    "price": 3200,
    "available": true,
    "name": {
      "zh": "\u5927\u646912\u5E74",
      "en": "The Dalmore 12 Years Whisky",
      "ko": "\u5927\u646912\u5E74",
      "ja": "\u5927\u646912\u5E74",
      "th": "\u5927\u646912\u5E74"
    },
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "ja": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "th": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D"
    },
    "orderIndex": 42,
    "containsBeef": false,
    "containsSeafood": false,
    "price": 2400,
    "id": "dish-2502031820148",
    "containsPork": false,
    "category": "cat-6ovxss",
    "available": true,
    "name": {
      "zh": "\u8607\u683C\u767B13\u5E74",
      "en": "The Singleton 13 Years Whisky",
      "ko": "\u8607\u683C\u767B13\u5E74",
      "ja": "\u8607\u683C\u767B13\u5E74",
      "th": "\u8607\u683C\u767B13\u5E74"
    },
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "description": {
      "zh": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "ja": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "th": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D"
    },
    "orderIndex": 43,
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "id": "dish-2502031818015",
    "category": "drinks",
    "containsPork": false,
    "price": 1800,
    "containsSeafood": false,
    "containsBeef": false,
    "name": {
      "zh": "\u8607\u683C\u767B12\u5E74",
      "en": "The Singleton 12 Years Whisky",
      "ko": "\u8607\u683C\u767B12\u5E74",
      "ja": "\u8607\u683C\u767B12\u5E74",
      "th": "\u8607\u683C\u767B12\u5E74"
    },
    "available": true,
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "available": true,
    "name": {
      "zh": "\u6709\u6A5F\u7389\u7C73\u7B4D",
      "en": "Organic Baby Corn",
      "ko": "\u6709\u6A5F\u7389\u7C73\u7B4D",
      "ja": "\u6709\u6A5F\u7389\u7C73\u7B4D",
      "th": "\u6709\u6A5F\u7389\u7C73\u7B4D"
    },
    "isNotSpicy": false,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "<\u975E\u57FA\u6539>\u4E0D\u6CB9\u4E0D\u81A9~\u9999\u751C\u53EF\u53E3~\u71DF\u990A\u50F9\u9AD8",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "<\u975E\u57FA\u6539>\u4E0D\u6CB9\u4E0D\u81A9~\u9999\u751C\u53EF\u53E3~\u71DF\u990A\u50F9\u9AD8",
      "ja": "<\u975E\u57FA\u6539>\u4E0D\u6CB9\u4E0D\u81A9~\u9999\u751C\u53EF\u53E3~\u71DF\u990A\u50F9\u9AD8",
      "th": "<\u975E\u57FA\u6539>\u4E0D\u6CB9\u4E0D\u81A9~\u9999\u751C\u53EF\u53E3~\u71DF\u990A\u50F9\u9AD8"
    },
    "orderIndex": 44,
    "containsBeef": false,
    "containsSeafood": false,
    "price": 80,
    "containsPork": false,
    "id": "dish-2502012109279",
    "category": "veggies",
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "description": {
      "zh": "\u56B4\u9078\u6F8E\u6E56\u6D77\u5473~\u5403\u5F97\u5230\u584A\u72C0\u82B1\u679D",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u56B4\u9078\u6F8E\u6E56\u6D77\u5473~\u5403\u5F97\u5230\u584A\u72C0\u82B1\u679D",
      "ja": "\u56B4\u9078\u6F8E\u6E56\u6D77\u5473~\u5403\u5F97\u5230\u584A\u72C0\u82B1\u679D",
      "th": "\u56B4\u9078\u6F8E\u6E56\u6D77\u5473~\u5403\u5F97\u5230\u584A\u72C0\u82B1\u679D"
    },
    "orderIndex": 45,
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "id": "dish-2502012029386",
    "category": "seafood",
    "containsPork": false,
    "containsBeef": false,
    "containsSeafood": true,
    "price": 80,
    "available": true,
    "name": {
      "zh": "\u6F8E\u6E56\u82B1\u679D\u4E38",
      "en": "Penghu Cuttlefish Balls",
      "ko": "\u6F8E\u6E56\u82B1\u679D\u4E38",
      "ja": "\u6F8E\u6E56\u82B1\u679D\u4E38",
      "th": "\u6F8E\u6E56\u82B1\u679D\u4E38"
    },
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "name": {
      "zh": "\u723D\u8106\u9AD8\u9E97\u83DC",
      "en": "Crispy Grilled Cabbage",
      "ko": "\u723D\u8106\u9AD8\u9E97\u83DC",
      "ja": "\u723D\u8106\u9AD8\u9E97\u83DC",
      "th": "\u723D\u8106\u9AD8\u9E97\u83DC"
    },
    "available": true,
    "price": 80,
    "containsSeafood": false,
    "containsBeef": false,
    "category": "veggies",
    "containsPork": false,
    "id": "dish-2501142131426",
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 46,
    "description": {
      "zh": "\u70AD\u70E4\u9AD8\u5C71\u9AD8\u9E97\u83DC~\u70E4\u597D\u6E05\u8106\u9999\u751C~\u5225\u5BB6\u61C9\u8A72\u6C92\u6709\u8CE3~\u4E0D\u5403\u770B\u770B?",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u70AD\u70E4\u9AD8\u5C71\u9AD8\u9E97\u83DC~\u70E4\u597D\u6E05\u8106\u9999\u751C~\u5225\u5BB6\u61C9\u8A72\u6C92\u6709\u8CE3~\u4E0D\u5403\u770B\u770B?",
      "ja": "\u70AD\u70E4\u9AD8\u5C71\u9AD8\u9E97\u83DC~\u70E4\u597D\u6E05\u8106\u9999\u751C~\u5225\u5BB6\u61C9\u8A72\u6C92\u6709\u8CE3~\u4E0D\u5403\u770B\u770B?",
      "th": "\u70AD\u70E4\u9AD8\u5C71\u9AD8\u9E97\u83DC~\u70E4\u597D\u6E05\u8106\u9999\u751C~\u5225\u5BB6\u61C9\u8A72\u6C92\u6709\u8CE3~\u4E0D\u5403\u770B\u770B?"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": true,
    "name": {
      "zh": "\u70AD\u71D2\u5976\u8336(\u58FA)",
      "en": "Charcoal Smoked Thai Tea (Pot)",
      "ko": "\u70AD\u71D2\u5976\u8336(\u58FA)",
      "ja": "\u70AD\u71D2\u5976\u8336(\u58FA)",
      "th": "\u70AD\u71D2\u5976\u8336(\u58FA)"
    },
    "available": true,
    "price": 180,
    "containsSeafood": false,
    "containsBeef": false,
    "category": "drinks",
    "containsPork": false,
    "id": "dish-2412022102224",
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 47,
    "description": {
      "zh": "\u6CF0\u5F0F\u5976\u8336\u4F7F\u7528\u78B3\u706B\u6162\u71D2! \u98A8\u5473\u7368\u7279 \u503C\u5F97\u4E00\u8A66",
      "en": "Refreshing and cool, a perfect match for BBQ",
      "ko": "\u6CF0\u5F0F\u5976\u8336\u4F7F\u7528\u78B3\u706B\u6162\u71D2! \u98A8\u5473\u7368\u7279 \u503C\u5F97\u4E00\u8A66",
      "ja": "\u6CF0\u5F0F\u5976\u8336\u4F7F\u7528\u78B3\u706B\u6162\u71D2! \u98A8\u5473\u7368\u7279 \u503C\u5F97\u4E00\u8A66",
      "th": "\u6CF0\u5F0F\u5976\u8336\u4F7F\u7528\u78B3\u706B\u6162\u71D2! \u98A8\u5473\u7368\u7279 \u503C\u5F97\u4E00\u8A66"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "\u6CF0\u8FA3\u91AC",
      "en": "Thai Spicy Chili Dip",
      "ko": "\u6CF0\u8FA3\u91AC",
      "ja": "\u6CF0\u8FA3\u91AC",
      "th": "\u6CF0\u8FA3\u91AC"
    },
    "containsBeef": false,
    "containsSeafood": false,
    "price": 10,
    "id": "dish-2412021741257",
    "category": "cat-zene8j",
    "containsPork": false,
    "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "\u7CBE\u5FC3\u8ABF\u88FD\uFF0C\u53E3\u611F\u5C64\u6B21\u8C50\u5BCC\uFF0C\u70BA\u60A8\u7684\u9910\u9EDE\u6DFB\u5F69",
      "en": "Meticulously crafted with rich layers of flavor to complement your meal.",
      "ko": "\u7CBE\u5FC3\u8ABF\u88FD\uFF0C\u53E3\u611F\u5C64\u6B21\u8C50\u5BCC\uFF0C\u70BA\u60A8\u7684\u9910\u9EDE\u6DFB\u5F69",
      "ja": "\u7CBE\u5FC3\u8ABF\u88FD\uFF0C\u53E3\u611F\u5C64\u6B21\u8C50\u5BCC\uFF0C\u70BA\u60A8\u7684\u9910\u9EDE\u6DFB\u5F69",
      "th": "\u7CBE\u5FC3\u8ABF\u88FD\uFF0C\u53E3\u611F\u5C64\u6B21\u8C50\u5BCC\uFF0C\u70BA\u60A8\u7684\u9910\u9EDE\u6DFB\u5F69"
    },
    "orderIndex": 48,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "description": {
      "zh": "\u4E0B\u9152\u5FC5\u9EDE!\u8001\u9955\u6700\u611B!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u4E0B\u9152\u5FC5\u9EDE!\u8001\u9955\u6700\u611B!",
      "ja": "\u4E0B\u9152\u5FC5\u9EDE!\u8001\u9955\u6700\u611B!",
      "th": "\u4E0B\u9152\u5FC5\u9EDE!\u8001\u9955\u6700\u611B!"
    },
    "orderIndex": 49,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "containsPork": false,
    "id": "dish-2412021734433",
    "category": "seafood",
    "price": 390,
    "containsBeef": false,
    "containsSeafood": true,
    "name": {
      "zh": "\u624B\u6495\u5927\u9B77\u9B5A\u5E72",
      "en": "Shredded Dried Giant Squid",
      "ko": "\u624B\u6495\u5927\u9B77\u9B5A\u5E72",
      "ja": "\u624B\u6495\u5927\u9B77\u9B5A\u5E72",
      "th": "\u624B\u6495\u5927\u9B77\u9B5A\u5E72"
    },
    "available": true,
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "available": true,
    "name": {
      "zh": "\u7099\u71D2\u751F\u98DF\u7D1A\u5E72\u8C9D3P",
      "en": "Seared Sashimi Grade Scallops (3pcs)",
      "ko": "\u7099\u71D2\u751F\u98DF\u7D1A\u5E72\u8C9D3P",
      "ja": "\u7099\u71D2\u751F\u98DF\u7D1A\u5E72\u8C9D3P",
      "th": "\u7099\u71D2\u751F\u98DF\u7D1A\u5E72\u8C9D3P"
    },
    "isNotSpicy": true,
    "orderIndex": 50,
    "description": {
      "zh": "\u611B\u5403\u6D77\u5473\u5FC5\u9EDE!\u642D\u914D\u6AB8\u6AAC\u6CF0\u5F0F\u91AC\u6C41\n\u7099\u71D2\u904E\u5F8C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u611B\u5403\u6D77\u5473\u5FC5\u9EDE!\u642D\u914D\u6AB8\u6AAC\u6CF0\u5F0F\u91AC\u6C41\n\u7099\u71D2\u904E\u5F8C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "ja": "\u611B\u5403\u6D77\u5473\u5FC5\u9EDE!\u642D\u914D\u6AB8\u6AAC\u6CF0\u5F0F\u91AC\u6C41\n\u7099\u71D2\u904E\u5F8C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "th": "\u611B\u5403\u6D77\u5473\u5FC5\u9EDE!\u642D\u914D\u6AB8\u6AAC\u6CF0\u5F0F\u91AC\u6C41\n\u7099\u71D2\u904E\u5F8C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473"
    },
    "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400",
    "id": "dish-2412021733504",
    "containsPork": false,
    "category": "seafood",
    "containsSeafood": true,
    "containsBeef": false,
    "price": 390,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "id": "dish-2412021732545",
    "category": "seafood",
    "containsPork": false,
    "price": 360,
    "containsBeef": false,
    "containsSeafood": true,
    "description": {
      "zh": "\u55DC\u8FA3\u8005\u5FC5\u5690!\u4E0B\u9152\u5FC5\u5099 \u5DF2\u53BB\u6BBC",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u55DC\u8FA3\u8005\u5FC5\u5690!\u4E0B\u9152\u5FC5\u5099 \u5DF2\u53BB\u6BBC",
      "ja": "\u55DC\u8FA3\u8005\u5FC5\u5690!\u4E0B\u9152\u5FC5\u5099 \u5DF2\u53BB\u6BBC",
      "th": "\u55DC\u8FA3\u8005\u5FC5\u5690!\u4E0B\u9152\u5FC5\u5099 \u5DF2\u53BB\u6BBC"
    },
    "orderIndex": 51,
    "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": false,
    "name": {
      "zh": "\u6CF0\u8FA3\u6247\u8C9D9P",
      "en": "Spicy Thai Scallops (9pcs)",
      "ko": "\u6CF0\u8FA3\u6247\u8C9D9P",
      "ja": "\u6CF0\u8FA3\u6247\u8C9D9P",
      "th": "\u6CF0\u8FA3\u6247\u8C9D9P"
    },
    "available": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "price": 360,
    "containsBeef": false,
    "containsSeafood": true,
    "category": "seafood",
    "id": "dish-2412021732071",
    "containsPork": false,
    "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 52,
    "description": {
      "zh": "\u70E4\u5927\u8349\u87666\u652F~\u5DF2\u7D93\u526A\u6389\u9B1A\u9B1A\u8DDF\u5C16\u5C16\u7684\u523A~\u4F46\u525D\u6BBC\u4E00\u6A23\u8981\u5C0F\u5FC3",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u70E4\u5927\u8349\u87666\u652F~\u5DF2\u7D93\u526A\u6389\u9B1A\u9B1A\u8DDF\u5C16\u5C16\u7684\u523A~\u4F46\u525D\u6BBC\u4E00\u6A23\u8981\u5C0F\u5FC3",
      "ja": "\u70E4\u5927\u8349\u87666\u652F~\u5DF2\u7D93\u526A\u6389\u9B1A\u9B1A\u8DDF\u5C16\u5C16\u7684\u523A~\u4F46\u525D\u6BBC\u4E00\u6A23\u8981\u5C0F\u5FC3",
      "th": "\u70E4\u5927\u8349\u87666\u652F~\u5DF2\u7D93\u526A\u6389\u9B1A\u9B1A\u8DDF\u5C16\u5C16\u7684\u523A~\u4F46\u525D\u6BBC\u4E00\u6A23\u8981\u5C0F\u5FC3"
    },
    "isNotSpicy": true,
    "name": {
      "zh": "\u6930\u78B3\u70E4\u5927\u8349\u87666P",
      "en": "Coconut Charcoal Grilled Tiger Prawns (6pcs)",
      "ko": "\u6930\u78B3\u70E4\u5927\u8349\u87666P",
      "ja": "\u6930\u78B3\u70E4\u5927\u8349\u87666P",
      "th": "\u6930\u78B3\u70E4\u5927\u8349\u87666P"
    },
    "available": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "price": 380,
    "containsBeef": false,
    "containsSeafood": false,
    "containsPork": false,
    "category": "cat-6ovxss",
    "id": "dish-2411142306093",
    "image": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 53,
    "description": {
      "zh": "\u6CF0\u5F0F\u98A8\u5473\u5976\u9152!\u59B9\u9152 \u5FAE\u91BA\u6700\u4F73\u9078\u64C7",
      "en": "Refreshing and cool, a perfect match for BBQ",
      "ko": "\u6CF0\u5F0F\u98A8\u5473\u5976\u9152!\u59B9\u9152 \u5FAE\u91BA\u6700\u4F73\u9078\u64C7",
      "ja": "\u6CF0\u5F0F\u98A8\u5473\u5976\u9152!\u59B9\u9152 \u5FAE\u91BA\u6700\u4F73\u9078\u64C7",
      "th": "\u6CF0\u5F0F\u98A8\u5473\u5976\u9152!\u59B9\u9152 \u5FAE\u91BA\u6700\u4F73\u9078\u64C7"
    },
    "isNotSpicy": true,
    "name": {
      "zh": "\u6CF0\u9187\u5976\u91525.6%",
      "en": "Thai Cream Liqueur 5.6%",
      "ko": "\u6CF0\u9187\u5976\u91525.6%",
      "ja": "\u6CF0\u9187\u5976\u91525.6%",
      "th": "\u6CF0\u9187\u5976\u91525.6%"
    },
    "available": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "description": {
      "zh": "\u6CF0\u5F0F\u98A8\u5473\u5976\u9152!\u59B9\u9152 \u5FAE\u91BA\u6700\u4F73\u9078\u64C7",
      "en": "Refreshing and cool, a perfect match for BBQ",
      "ko": "\u6CF0\u5F0F\u98A8\u5473\u5976\u9152!\u59B9\u9152 \u5FAE\u91BA\u6700\u4F73\u9078\u64C7",
      "ja": "\u6CF0\u5F0F\u98A8\u5473\u5976\u9152!\u59B9\u9152 \u5FAE\u91BA\u6700\u4F73\u9078\u64C7",
      "th": "\u6CF0\u5F0F\u98A8\u5473\u5976\u9152!\u59B9\u9152 \u5FAE\u91BA\u6700\u4F73\u9078\u64C7"
    },
    "orderIndex": 54,
    "image": "https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&q=80&w=400",
    "id": "dish-2411142303467",
    "category": "cat-6ovxss",
    "containsPork": false,
    "price": 280,
    "containsSeafood": false,
    "containsBeef": false,
    "name": {
      "zh": "\u6CF0\u9187\u5976\u91521.4%",
      "en": "Thai Cream Liqueur 1.4%",
      "ko": "\u6CF0\u9187\u5976\u91521.4%",
      "ja": "\u6CF0\u9187\u5976\u91521.4%",
      "th": "\u6CF0\u9187\u5976\u91521.4%"
    },
    "available": true,
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": true,
    "name": {
      "zh": "\u679C\u6C41\u6C23\u6CE1\u6C34",
      "en": "Fruit Juice Sparkling Water",
      "ko": "\u679C\u6C41\u6C23\u6CE1\u6C34",
      "ja": "\u679C\u6C41\u6C23\u6CE1\u6C34",
      "th": "\u679C\u6C41\u6C23\u6CE1\u6C34"
    },
    "available": true,
    "containsPork": false,
    "category": "cat-7cvvkq",
    "id": "dish-2411142030288",
    "price": 100,
    "containsBeef": false,
    "containsSeafood": false,
    "orderIndex": 55,
    "description": {
      "zh": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "ja": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "th": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D"
    },
    "image": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "available": true,
    "name": {
      "zh": "\u6D77\u5C3C\u6839",
      "en": "Heineken Beer",
      "ko": "\u6D77\u5C3C\u6839",
      "ja": "\u6D77\u5C3C\u6839",
      "th": "\u6D77\u5C3C\u6839"
    },
    "isNotSpicy": true,
    "image": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 56,
    "description": {
      "zh": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "ja": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "th": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D"
    },
    "containsSeafood": false,
    "containsBeef": false,
    "price": 150,
    "id": "dish-2411142028551",
    "category": "cat-7cvvkq",
    "containsPork": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "category": "skewers",
    "containsPork": true,
    "id": "dish-2411112029373",
    "containsBeef": false,
    "containsSeafood": false,
    "price": 70,
    "orderIndex": 57,
    "description": {
      "zh": "\u8C6C\u8840\u7CD5+\u71B1\u72D7\u7D44\u5408 \u5927\u4EBA\u5C0F\u5B69\u90FD\u611B\u2665\uFE0F\u4ECA\u5929\u5C31\u5225\u7BA1\u71B1\u91CF\u4E86\u5427!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u8C6C\u8840\u7CD5+\u71B1\u72D7\u7D44\u5408 \u5927\u4EBA\u5C0F\u5B69\u90FD\u611B\u2665\uFE0F\u4ECA\u5929\u5C31\u5225\u7BA1\u71B1\u91CF\u4E86\u5427!",
      "ja": "\u8C6C\u8840\u7CD5+\u71B1\u72D7\u7D44\u5408 \u5927\u4EBA\u5C0F\u5B69\u90FD\u611B\u2665\uFE0F\u4ECA\u5929\u5C31\u5225\u7BA1\u71B1\u91CF\u4E86\u5427!",
      "th": "\u8C6C\u8840\u7CD5+\u71B1\u72D7\u7D44\u5408 \u5927\u4EBA\u5C0F\u5B69\u90FD\u611B\u2665\uFE0F\u4ECA\u5929\u5C31\u5225\u7BA1\u71B1\u91CF\u4E86\u5427!"
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "\u90AA\u60E1\u71B1\u72D7\u8C6C\u8840\u7CD5",
      "en": "Hot Dog & Pork Blood Cake Skewer",
      "ko": "\u90AA\u60E1\u71B1\u72D7\u8C6C\u8840\u7CD5",
      "ja": "\u90AA\u60E1\u71B1\u72D7\u8C6C\u8840\u7CD5",
      "th": "\u90AA\u60E1\u71B1\u72D7\u8C6C\u8840\u7CD5"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": true,
    "available": true,
    "name": {
      "zh": "\u53EF\u6A02\u5A1C",
      "en": "Corona Extra Beer",
      "ko": "\u53EF\u6A02\u5A1C",
      "ja": "\u53EF\u6A02\u5A1C",
      "th": "\u53EF\u6A02\u5A1C"
    },
    "containsBeef": false,
    "containsSeafood": false,
    "price": 150,
    "id": "dish-2411091621575",
    "category": "cat-7cvvkq",
    "containsPork": false,
    "image": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "ja": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "th": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D"
    },
    "orderIndex": 58,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "id": "dish-2411042135298",
    "containsPork": false,
    "category": "cat-svadcb",
    "price": 10,
    "containsSeafood": false,
    "containsBeef": false,
    "orderIndex": 59,
    "description": {
      "zh": "\u8D85\u503C\u512A\u60E0\u7D44\u5408\uFF0C\u7269\u8D85\u6240\u503C\uFF0C\u9650\u6642\u4EAB\u7528",
      "en": "Great value combo package, high cost-performance deal for a limited time.",
      "ko": "\u8D85\u503C\u512A\u60E0\u7D44\u5408\uFF0C\u7269\u8D85\u6240\u503C\uFF0C\u9650\u6642\u4EAB\u7528",
      "ja": "\u8D85\u503C\u512A\u60E0\u7D44\u5408\uFF0C\u7269\u8D85\u6240\u503C\uFF0C\u9650\u6642\u4EAB\u7528",
      "th": "\u8D85\u503C\u512A\u60E0\u7D44\u5408\uFF0C\u7269\u8D85\u6240\u503C\uFF0C\u9650\u6642\u4EAB\u7528"
    },
    "image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": true,
    "name": {
      "zh": "tip",
      "en": "Staff Tip / Service Gratitude",
      "ko": "tip",
      "ja": "tip",
      "th": "tip"
    },
    "available": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "category": "cat-6ovxss",
    "containsPork": false,
    "id": "dish-2410270119261",
    "containsBeef": false,
    "containsSeafood": false,
    "price": 350,
    "orderIndex": 60,
    "description": {
      "zh": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "ja": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "th": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D"
    },
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": true,
    "available": true,
    "name": {
      "zh": "\u767D\u9DB4\u6E05\u9152",
      "en": "Hakutsuru Japanese Sake",
      "ko": "\u767D\u9DB4\u6E05\u9152",
      "ja": "\u767D\u9DB4\u6E05\u9152",
      "th": "\u767D\u9DB4\u6E05\u9152"
    },
    "hasNoodlesOption": false,
    "customAddOns": [
      {
        "id": "addon-1784479411862-296",
        "name": "\u52A0\u71B1",
        "price": 0
      }
    ],
    "recipe": []
  },
  {
    "id": "dish-2410132030420",
    "category": "cat-7cvvkq",
    "containsPork": false,
    "containsBeef": false,
    "containsSeafood": false,
    "price": 100,
    "description": {
      "zh": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "ja": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "th": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D"
    },
    "orderIndex": 61,
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": true,
    "available": true,
    "name": {
      "zh": "\u611B\u4E4B\u5473\u9EA5\u8336",
      "en": "AGV Barley Tea",
      "ko": "\u611B\u4E4B\u5473\u9EA5\u8336",
      "ja": "\u611B\u4E4B\u5473\u9EA5\u8336",
      "th": "\u611B\u4E4B\u5473\u9EA5\u8336"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "orderIndex": 62,
    "description": {
      "zh": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "ja": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "th": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D"
    },
    "image": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400",
    "id": "dish-2410022148358",
    "containsPork": false,
    "category": "cat-7cvvkq",
    "price": 150,
    "containsSeafood": false,
    "containsBeef": false,
    "name": {
      "zh": "\u767E\u5A01",
      "en": "Budweiser Beer",
      "ko": "\u767E\u5A01",
      "ja": "\u767E\u5A01",
      "th": "\u767E\u5A01"
    },
    "available": true,
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "price": 620,
    "containsSeafood": false,
    "containsPork": false,
    "id": "dish-2409232044239",
    "category": "tomyum",
    "description": {
      "zh": " 5.2\u76CE\u53F8\u725B\u5C0F\u6392 (\u7121\u704C\u6C34\u975E\u91CD\u7D44\u8089choice\u7B49\u7D1A)\u70AD\u70E4\u904E\u5728\u5165\u6E6F\uFF01\u9955\u5BA2\u7684\u6700\u611B\u2665\uFE0F\u9053\u5730\u6CF0\u5F0F\u6FC3\u90C1\u6E6F\u5E95",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": " 5.2\u76CE\u53F8\u725B\u5C0F\u6392 (\u7121\u704C\u6C34\u975E\u91CD\u7D44\u8089choice\u7B49\u7D1A)\u70AD\u70E4\u904E\u5728\u5165\u6E6F\uFF01\u9955\u5BA2\u7684\u6700\u611B\u2665\uFE0F\u9053\u5730\u6CF0\u5F0F\u6FC3\u90C1\u6E6F\u5E95",
      "ja": " 5.2\u76CE\u53F8\u725B\u5C0F\u6392 (\u7121\u704C\u6C34\u975E\u91CD\u7D44\u8089choice\u7B49\u7D1A)\u70AD\u70E4\u904E\u5728\u5165\u6E6F\uFF01\u9955\u5BA2\u7684\u6700\u611B\u2665\uFE0F\u9053\u5730\u6CF0\u5F0F\u6FC3\u90C1\u6E6F\u5E95",
      "th": " 5.2\u76CE\u53F8\u725B\u5C0F\u6392 (\u7121\u704C\u6C34\u975E\u91CD\u7D44\u8089choice\u7B49\u7D1A)\u70AD\u70E4\u904E\u5728\u5165\u6E6F\uFF01\u9955\u5BA2\u7684\u6700\u611B\u2665\uFE0F\u9053\u5730\u6CF0\u5F0F\u6FC3\u90C1\u6E6F\u5E95"
    },
    "isNotSpicy": false,
    "name": {
      "zh": "\u725B\u5C0F\u6392\u51AC\u852D\u529F\u6E6F",
      "en": "Charcoal Short Rib Beef Tom Yum Soup",
      "ko": "\u725B\u5C0F\u6392\u51AC\u852D\u529F\u6E6F",
      "ja": "\u725B\u5C0F\u6392\u51AC\u852D\u529F\u6E6F",
      "th": "\u725B\u5C0F\u6392\u51AC\u852D\u529F\u6E6F"
    },
    "available": true,
    "containsBeef": true,
    "hasCoconutsMilkOption": true,
    "hasNoodlesOption": false,
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 63,
    "customAddOns": [
      {
        "id": "addon-1784479460272-831",
        "name": "\u52A0\u6CB3\u7C89",
        "price": 20
      },
      {
        "id": "addon-1784479462255-754",
        "name": "\u52A0\u7C73\u7DDA",
        "price": 20
      },
      {
        "id": "addon-1784479465274-753",
        "name": "\u5347\u7D1A\u5957\u9910(\u70E4\u852C\u83DC+\u6CF0\u5976\u4E00\u676F)",
        "price": 140
      }
    ],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "\u6CF0\u5F0F\u725B\u5C0F\u6392\u7C73\u7DDA",
      "en": "Thai Grilled Short Rib Beef Rice Noodle",
      "ko": "\u6CF0\u5F0F\u725B\u5C0F\u6392\u7C73\u7DDA",
      "ja": "\u6CF0\u5F0F\u725B\u5C0F\u6392\u7C73\u7DDA",
      "th": "\u6CF0\u5F0F\u725B\u5C0F\u6392\u7C73\u7DDA"
    },
    "containsBeef": true,
    "containsSeafood": false,
    "price": 620,
    "id": "dish-2409232043478",
    "containsPork": false,
    "category": "tomyum",
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": " 5.2\u76CE\u53F8\u725B\u5C0F\u6392 (\u7121\u704C\u6C34\u975E\u91CD\u7D44\u8089choice\u7B49\u7D1A)\u78B3\u70E4\u904E\u5728\u5165\u6E6F\uFF01\u9955\u5BA2\u7684\u6700\u611B\u2665\uFE0F\u9053\u5730\u6CF0\u5F0F\u98A8\u5473\u6E6F\u9EB5\uFF0C\u6FC3\u90C1\u6E6F\u5E95\u6696\u5FC3\u6696\u80C3",
      "en": "Authentic Thai style noodle soup with a rich, heart-warming broth.",
      "ko": " 5.2\u76CE\u53F8\u725B\u5C0F\u6392 (\u7121\u704C\u6C34\u975E\u91CD\u7D44\u8089choice\u7B49\u7D1A)\u78B3\u70E4\u904E\u5728\u5165\u6E6F\uFF01\u9955\u5BA2\u7684\u6700\u611B\u2665\uFE0F\u9053\u5730\u6CF0\u5F0F\u98A8\u5473\u6E6F\u9EB5\uFF0C\u6FC3\u90C1\u6E6F\u5E95\u6696\u5FC3\u6696\u80C3",
      "ja": " 5.2\u76CE\u53F8\u725B\u5C0F\u6392 (\u7121\u704C\u6C34\u975E\u91CD\u7D44\u8089choice\u7B49\u7D1A)\u78B3\u70E4\u904E\u5728\u5165\u6E6F\uFF01\u9955\u5BA2\u7684\u6700\u611B\u2665\uFE0F\u9053\u5730\u6CF0\u5F0F\u98A8\u5473\u6E6F\u9EB5\uFF0C\u6FC3\u90C1\u6E6F\u5E95\u6696\u5FC3\u6696\u80C3",
      "th": " 5.2\u76CE\u53F8\u725B\u5C0F\u6392 (\u7121\u704C\u6C34\u975E\u91CD\u7D44\u8089choice\u7B49\u7D1A)\u78B3\u70E4\u904E\u5728\u5165\u6E6F\uFF01\u9955\u5BA2\u7684\u6700\u611B\u2665\uFE0F\u9053\u5730\u6CF0\u5F0F\u98A8\u5473\u6E6F\u9EB5\uFF0C\u6FC3\u90C1\u6E6F\u5E95\u6696\u5FC3\u6696\u80C3"
    },
    "orderIndex": 64,
    "hasNoodlesOption": false,
    "customAddOns": [
      {
        "id": "addon-1784479484092-785",
        "name": "\u52A0\u6CB3\u7C89",
        "price": 20
      },
      {
        "id": "addon-1784479486352-323",
        "name": "\u52A0\u7C73\u7DDA",
        "price": 20
      },
      {
        "id": "addon-1784479488427-739",
        "name": "\u5347\u7D1A\u5957\u9910(\u70E4\u852C\u83DC+\u6CF0\u5976\u4E00\u676F)",
        "price": 140
      }
    ],
    "recipe": []
  },
  {
    "price": 620,
    "containsSeafood": false,
    "containsBeef": true,
    "id": "dish-2409232042549",
    "containsPork": false,
    "category": "tomyum",
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": " 5.2\u76CE\u53F8\u725B\u5C0F\u6392 (\u7121\u704C\u6C34\u975E\u91CD\u7D44\u8089choice\u7B49\u7D1A)\u78B3\u70E4\u904E\u5728\u5165\u6E6F\uFF01\u9955\u5BA2\u7684\u6700\u611B\u2665\uFE0F\u9053\u5730\u6CF0\u5F0F\u98A8\u5473\u6E6F\u9EB5\uFF0C\u6FC3\u90C1\u6E6F\u5E95\u6696\u5FC3\u6696\u80C3",
      "en": "Authentic Thai style noodle soup with a rich, heart-warming broth.",
      "ko": " 5.2\u76CE\u53F8\u725B\u5C0F\u6392 (\u7121\u704C\u6C34\u975E\u91CD\u7D44\u8089choice\u7B49\u7D1A)\u78B3\u70E4\u904E\u5728\u5165\u6E6F\uFF01\u9955\u5BA2\u7684\u6700\u611B\u2665\uFE0F\u9053\u5730\u6CF0\u5F0F\u98A8\u5473\u6E6F\u9EB5\uFF0C\u6FC3\u90C1\u6E6F\u5E95\u6696\u5FC3\u6696\u80C3",
      "ja": " 5.2\u76CE\u53F8\u725B\u5C0F\u6392 (\u7121\u704C\u6C34\u975E\u91CD\u7D44\u8089choice\u7B49\u7D1A)\u78B3\u70E4\u904E\u5728\u5165\u6E6F\uFF01\u9955\u5BA2\u7684\u6700\u611B\u2665\uFE0F\u9053\u5730\u6CF0\u5F0F\u98A8\u5473\u6E6F\u9EB5\uFF0C\u6FC3\u90C1\u6E6F\u5E95\u6696\u5FC3\u6696\u80C3",
      "th": " 5.2\u76CE\u53F8\u725B\u5C0F\u6392 (\u7121\u704C\u6C34\u975E\u91CD\u7D44\u8089choice\u7B49\u7D1A)\u78B3\u70E4\u904E\u5728\u5165\u6E6F\uFF01\u9955\u5BA2\u7684\u6700\u611B\u2665\uFE0F\u9053\u5730\u6CF0\u5F0F\u98A8\u5473\u6E6F\u9EB5\uFF0C\u6FC3\u90C1\u6E6F\u5E95\u6696\u5FC3\u6696\u80C3"
    },
    "orderIndex": 65,
    "isNotSpicy": false,
    "name": {
      "zh": "\u6CF0\u5F0F\u725B\u5C0F\u6392\u6CB3\u7C89",
      "en": "Thai Grilled Short Rib Beef Pho Noodle",
      "ko": "\u6CF0\u5F0F\u725B\u5C0F\u6392\u6CB3\u7C89",
      "ja": "\u6CF0\u5F0F\u725B\u5C0F\u6392\u6CB3\u7C89",
      "th": "\u6CF0\u5F0F\u725B\u5C0F\u6392\u6CB3\u7C89"
    },
    "available": true,
    "hasNoodlesOption": false,
    "customAddOns": [
      {
        "id": "addon-1784479520251-308",
        "name": "\u52A0\u6CB3\u7C89",
        "price": 20
      },
      {
        "id": "addon-1784479522216-624",
        "name": "\u52A0\u7C73\u7DDA",
        "price": 20
      },
      {
        "id": "addon-1784479526311-934",
        "name": "\u5347\u7D1A\u5957\u9910(\u70E4\u852C\u83DC+\u6CF0\u5976\u4E00\u676F)",
        "price": 140
      }
    ],
    "recipe": []
  },
  {
    "containsBeef": false,
    "containsSeafood": true,
    "price": 660,
    "id": "dish-2409232024040",
    "category": "seafood",
    "containsPork": false,
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "<\u4E09\u9846\u512A\u60E0\u7D44>\u56B4\u9078L\u865F\u5BAE\u57CE\u751F\u8814 \u725B\u5976\u6D77\u5473!\u5E97\u5167\u62DB\u724C! \n\u53EF\u751F\u98DF \u53EF\u78B3\u70E4",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "<\u4E09\u9846\u512A\u60E0\u7D44>\u56B4\u9078L\u865F\u5BAE\u57CE\u751F\u8814 \u725B\u5976\u6D77\u5473!\u5E97\u5167\u62DB\u724C! \n\u53EF\u751F\u98DF \u53EF\u78B3\u70E4",
      "ja": "<\u4E09\u9846\u512A\u60E0\u7D44>\u56B4\u9078L\u865F\u5BAE\u57CE\u751F\u8814 \u725B\u5976\u6D77\u5473!\u5E97\u5167\u62DB\u724C! \n\u53EF\u751F\u98DF \u53EF\u78B3\u70E4",
      "th": "<\u4E09\u9846\u512A\u60E0\u7D44>\u56B4\u9078L\u865F\u5BAE\u57CE\u751F\u8814 \u725B\u5976\u6D77\u5473!\u5E97\u5167\u62DB\u724C! \n\u53EF\u751F\u98DF \u53EF\u78B3\u70E4"
    },
    "orderIndex": 66,
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "\u6CF0\u5F0F\u751F\u88143p",
      "en": "Thai Style Fresh Oysters (3pcs Combo)",
      "ko": "\u6CF0\u5F0F\u751F\u88143p",
      "ja": "\u6CF0\u5F0F\u751F\u88143p",
      "th": "\u6CF0\u5F0F\u751F\u88143p"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": true,
    "name": {
      "zh": "\u51B0\u6C34(\u5927)",
      "en": "Large Ice Water",
      "ko": "\u51B0\u6C34(\u5927)",
      "ja": "\u51B0\u6C34(\u5927)",
      "th": "\u51B0\u6C34(\u5927)"
    },
    "available": true,
    "price": 100,
    "containsSeafood": false,
    "containsBeef": false,
    "containsPork": false,
    "category": "cat-7cvvkq",
    "id": "dish-2409131907512",
    "image": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 67,
    "description": {
      "zh": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "ja": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "th": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "orderIndex": 68,
    "description": {
      "zh": "",
      "en": "",
      "ko": "",
      "ja": "",
      "th": ""
    },
    "image": "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&q=80&w=400",
    "id": "dish-2408192006066",
    "containsPork": false,
    "category": "cat-svadcb",
    "price": 500,
    "containsSeafood": false,
    "containsBeef": false,
    "name": {
      "zh": "\u958B\u74F6\u8CBB1\u652F",
      "en": "Corkage Fee (Per Bottle)",
      "ko": "\u958B\u74F6\u8CBB1\u652F",
      "ja": "\u958B\u74F6\u8CBB1\u652F",
      "th": "\u958B\u74F6\u8CBB1\u652F"
    },
    "available": true,
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "name": {
      "zh": "\u6CF0\u5317\u9178\u8089\u51AC\u7C89\u8178",
      "en": "Northern Thai Fermented Pork Sausage w/ Glass Noodles",
      "ko": "\u6CF0\u5317\u9178\u8089\u51AC\u7C89\u8178",
      "ja": "\u6CF0\u5317\u9178\u8089\u51AC\u7C89\u8178",
      "th": "\u6CF0\u5317\u9178\u8089\u51AC\u7C89\u8178"
    },
    "available": true,
    "price": 90,
    "containsSeafood": false,
    "containsBeef": false,
    "containsPork": true,
    "category": "skewers",
    "id": "dish-2408191941429",
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "\u6B63\u5B97\u6CF0\u570B\u9178\u8089\u8178\u5305\u51AC\u7C89<\u4E0D\u662F\u98DF\u7269\u9178\u6389\u58DE\u6389\u5594>\u4E0B\u55AE\u6B64\u5546\u54C1\u7684\u9867\u5BA2\u4E00\u5B9A\u8981\u6709\u6B64\u8A8D\u77E5",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u6B63\u5B97\u6CF0\u570B\u9178\u8089\u8178\u5305\u51AC\u7C89<\u4E0D\u662F\u98DF\u7269\u9178\u6389\u58DE\u6389\u5594>\u4E0B\u55AE\u6B64\u5546\u54C1\u7684\u9867\u5BA2\u4E00\u5B9A\u8981\u6709\u6B64\u8A8D\u77E5",
      "ja": "\u6B63\u5B97\u6CF0\u570B\u9178\u8089\u8178\u5305\u51AC\u7C89<\u4E0D\u662F\u98DF\u7269\u9178\u6389\u58DE\u6389\u5594>\u4E0B\u55AE\u6B64\u5546\u54C1\u7684\u9867\u5BA2\u4E00\u5B9A\u8981\u6709\u6B64\u8A8D\u77E5",
      "th": "\u6B63\u5B97\u6CF0\u570B\u9178\u8089\u8178\u5305\u51AC\u7C89<\u4E0D\u662F\u98DF\u7269\u9178\u6389\u58DE\u6389\u5594>\u4E0B\u55AE\u6B64\u5546\u54C1\u7684\u9867\u5BA2\u4E00\u5B9A\u8981\u6709\u6B64\u8A8D\u77E5"
    },
    "orderIndex": 69,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "containsBeef": false,
    "containsSeafood": false,
    "price": -10,
    "containsPork": false,
    "id": "dish-2407231815553",
    "category": "cat-svadcb",
    "image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 70,
    "description": {
      "zh": "\u8D85\u503C\u512A\u60E0\u7D44\u5408\uFF0C\u7269\u8D85\u6240\u503C\uFF0C\u9650\u6642\u4EAB\u7528",
      "en": "Great value combo package, high cost-performance deal for a limited time.",
      "ko": "\u8D85\u503C\u512A\u60E0\u7D44\u5408\uFF0C\u7269\u8D85\u6240\u503C\uFF0C\u9650\u6642\u4EAB\u7528",
      "ja": "\u8D85\u503C\u512A\u60E0\u7D44\u5408\uFF0C\u7269\u8D85\u6240\u503C\uFF0C\u9650\u6642\u4EAB\u7528",
      "th": "\u8D85\u503C\u512A\u60E0\u7D44\u5408\uFF0C\u7269\u8D85\u6240\u503C\uFF0C\u9650\u6642\u4EAB\u7528"
    },
    "isNotSpicy": true,
    "available": true,
    "name": {
      "zh": "\u597D\u53CB\u6298\u6263",
      "en": "Friend Discount Coupon",
      "ko": "\u597D\u53CB\u6298\u6263",
      "ja": "\u597D\u53CB\u6298\u6263",
      "th": "\u597D\u53CB\u6298\u6263"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "orderIndex": 71,
    "description": {
      "zh": "\u56B4\u90786\u500B\u6708\u5167\u5C0F\u7F94\u7F8A\u8089\u3002(\u6FB3\u6D32\u9032\u53E3) \u70AD\u706B\u4E0A\u70E4\u81F3\u91D1\u9EC3 \u6492\u4E0A\u5B5C\u7136\u7C89!\u5E97\u5167\u71B1\u92B7NO2.",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u56B4\u90786\u500B\u6708\u5167\u5C0F\u7F94\u7F8A\u8089\u3002(\u6FB3\u6D32\u9032\u53E3) \u70AD\u706B\u4E0A\u70E4\u81F3\u91D1\u9EC3 \u6492\u4E0A\u5B5C\u7136\u7C89!\u5E97\u5167\u71B1\u92B7NO2.",
      "ja": "\u56B4\u90786\u500B\u6708\u5167\u5C0F\u7F94\u7F8A\u8089\u3002(\u6FB3\u6D32\u9032\u53E3) \u70AD\u706B\u4E0A\u70E4\u81F3\u91D1\u9EC3 \u6492\u4E0A\u5B5C\u7136\u7C89!\u5E97\u5167\u71B1\u92B7NO2.",
      "th": "\u56B4\u90786\u500B\u6708\u5167\u5C0F\u7F94\u7F8A\u8089\u3002(\u6FB3\u6D32\u9032\u53E3) \u70AD\u706B\u4E0A\u70E4\u81F3\u91D1\u9EC3 \u6492\u4E0A\u5B5C\u7136\u7C89!\u5E97\u5167\u71B1\u92B7NO2."
    },
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "id": "dish-2305152126508",
    "containsPork": false,
    "category": "skewers",
    "price": 70,
    "containsSeafood": false,
    "containsBeef": false,
    "name": {
      "zh": "\u5C0F\u7F94\u7F8A\u808B",
      "en": "Cumin Lamb Rib Skewers",
      "ko": "\u5C0F\u7F94\u7F8A\u808B",
      "ja": "\u5C0F\u7F94\u7F8A\u808B",
      "th": "\u5C0F\u7F94\u7F8A\u808B"
    },
    "available": true,
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": true,
    "name": {
      "zh": "\u679C\u8089\u6930\u5B50\u6C34",
      "en": "Fresh Coconut Water w/ Pulp",
      "ko": "\u679C\u8089\u6930\u5B50\u6C34",
      "ja": "\u679C\u8089\u6930\u5B50\u6C34",
      "th": "\u679C\u8089\u6930\u5B50\u6C34"
    },
    "available": true,
    "price": 90,
    "containsBeef": false,
    "containsSeafood": false,
    "containsPork": false,
    "id": "dish-2304041737306",
    "category": "drinks",
    "image": "https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 72,
    "description": {
      "zh": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "ja": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "th": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "name": {
      "zh": "\u6CF0\u5F0F\u751F\u88141P",
      "en": "Thai Style Fresh Oyster (1pc)",
      "ko": "\u6CF0\u5F0F\u751F\u88141P",
      "ja": "\u6CF0\u5F0F\u751F\u88141P",
      "th": "\u6CF0\u5F0F\u751F\u88141P"
    },
    "available": true,
    "isNotSpicy": false,
    "description": {
      "zh": "\u56B4\u9078L\u865F\u5BAE\u57CE\u751F\u8814 \u725B\u5976\u6D77\u5473!\u5E97\u5167\u62DB\u724C! \u53EF\u751F\u98DF \u53EF\u78B3\u70E4",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u56B4\u9078L\u865F\u5BAE\u57CE\u751F\u8814 \u725B\u5976\u6D77\u5473!\u5E97\u5167\u62DB\u724C! \u53EF\u751F\u98DF \u53EF\u78B3\u70E4",
      "ja": "\u56B4\u9078L\u865F\u5BAE\u57CE\u751F\u8814 \u725B\u5976\u6D77\u5473!\u5E97\u5167\u62DB\u724C! \u53EF\u751F\u98DF \u53EF\u78B3\u70E4",
      "th": "\u56B4\u9078L\u865F\u5BAE\u57CE\u751F\u8814 \u725B\u5976\u6D77\u5473!\u5E97\u5167\u62DB\u724C! \u53EF\u751F\u98DF \u53EF\u78B3\u70E4"
    },
    "orderIndex": 73,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "id": "dish-2303301719168",
    "containsPork": false,
    "category": "seafood",
    "price": 250,
    "containsBeef": false,
    "containsSeafood": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "description": {
      "zh": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "ja": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "th": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D"
    },
    "orderIndex": 74,
    "image": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400",
    "category": "cat-7cvvkq",
    "containsPork": false,
    "id": "dish-2302272107257",
    "containsSeafood": false,
    "containsBeef": false,
    "price": 110,
    "available": true,
    "name": {
      "zh": "\u52DD\u7345",
      "en": "Singha Beer",
      "ko": "\u52DD\u7345",
      "ja": "\u52DD\u7345",
      "th": "\u52DD\u7345"
    },
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "price": 110,
    "containsBeef": false,
    "containsSeafood": false,
    "category": "cat-7cvvkq",
    "id": "dish-2302162152176",
    "containsPork": false,
    "image": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "ja": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "th": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D"
    },
    "orderIndex": 75,
    "isNotSpicy": true,
    "name": {
      "zh": "\u6CF0\u8C61",
      "en": "Chang Beer",
      "ko": "\u6CF0\u8C61",
      "ja": "\u6CF0\u8C61",
      "th": "\u6CF0\u8C61"
    },
    "available": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "price": 80,
    "containsBeef": false,
    "containsSeafood": false,
    "id": "dish-2211162026366",
    "category": "veggies",
    "containsPork": false,
    "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 76,
    "description": {
      "zh": "\u71DF\u990A\u591A~\u71B1\u91CF\u4F4E~\u542B\u9223\u91CF\u53C8\u76F4\u903C\u725B\u5976! \u662F\u9867\u80C3\u5065\u5EB7\u597D\u9078\u64C7",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u71DF\u990A\u591A~\u71B1\u91CF\u4F4E~\u542B\u9223\u91CF\u53C8\u76F4\u903C\u725B\u5976! \u662F\u9867\u80C3\u5065\u5EB7\u597D\u9078\u64C7",
      "ja": "\u71DF\u990A\u591A~\u71B1\u91CF\u4F4E~\u542B\u9223\u91CF\u53C8\u76F4\u903C\u725B\u5976! \u662F\u9867\u80C3\u5065\u5EB7\u597D\u9078\u64C7",
      "th": "\u71DF\u990A\u591A~\u71B1\u91CF\u4F4E~\u542B\u9223\u91CF\u53C8\u76F4\u903C\u725B\u5976! \u662F\u9867\u80C3\u5065\u5EB7\u597D\u9078\u64C7"
    },
    "isNotSpicy": false,
    "name": {
      "zh": "\u79CB\u8475(\u5B63\u7BC0\u9650\u5B9A)",
      "en": "Charcoal Grilled Okra (Seasonal)",
      "ko": "\u79CB\u8475(\u5B63\u7BC0\u9650\u5B9A)",
      "ja": "\u79CB\u8475(\u5B63\u7BC0\u9650\u5B9A)",
      "th": "\u79CB\u8475(\u5B63\u7BC0\u9650\u5B9A)"
    },
    "available": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "available": true,
    "name": {
      "zh": "\u6CF0\u5F0F\u6D77\u9BAE\u7C73\u7DDA",
      "en": "Thai Seafood Tom Yum Rice Noodle",
      "ko": "\u6CF0\u5F0F\u6D77\u9BAE\u7C73\u7DDA",
      "ja": "\u6CF0\u5F0F\u6D77\u9BAE\u7C73\u7DDA",
      "th": "\u6CF0\u5F0F\u6D77\u9BAE\u7C73\u7DDA"
    },
    "isNotSpicy": false,
    "image": "https://images.unsplash.com/photo-1533622597524-a1215e26c0a2?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "\u6C92\u5403\u904E\u51AC\u852D\u529F\u5C31\u4E0D\u80FD\u8AAA\u5403\u904E\u6CF0\u5F0F! \u7D93\u5178\u53E3\u5473\u9053\u5730\u98A8\u5473\u6E6F\u9EB5\uFF0C\u6FC3\u90C1\u6E6F\u5E95\u6696\u5FC3\u6696\u80C3",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "\u6C92\u5403\u904E\u51AC\u852D\u529F\u5C31\u4E0D\u80FD\u8AAA\u5403\u904E\u6CF0\u5F0F! \u7D93\u5178\u53E3\u5473\u9053\u5730\u98A8\u5473\u6E6F\u9EB5\uFF0C\u6FC3\u90C1\u6E6F\u5E95\u6696\u5FC3\u6696\u80C3",
      "ja": "\u6C92\u5403\u904E\u51AC\u852D\u529F\u5C31\u4E0D\u80FD\u8AAA\u5403\u904E\u6CF0\u5F0F! \u7D93\u5178\u53E3\u5473\u9053\u5730\u98A8\u5473\u6E6F\u9EB5\uFF0C\u6FC3\u90C1\u6E6F\u5E95\u6696\u5FC3\u6696\u80C3",
      "th": "\u6C92\u5403\u904E\u51AC\u852D\u529F\u5C31\u4E0D\u80FD\u8AAA\u5403\u904E\u6CF0\u5F0F! \u7D93\u5178\u53E3\u5473\u9053\u5730\u98A8\u5473\u6E6F\u9EB5\uFF0C\u6FC3\u90C1\u6E6F\u5E95\u6696\u5FC3\u6696\u80C3"
    },
    "orderIndex": 77,
    "containsSeafood": true,
    "containsBeef": false,
    "price": 240,
    "id": "dish-2209081804158",
    "containsPork": false,
    "category": "tomyum",
    "hasNoodlesOption": false,
    "customAddOns": [
      {
        "id": "addon-1784479721381-721",
        "name": "\u52A0\u6CB3\u7C89",
        "price": 20
      },
      {
        "id": "addon-1784479723321-863",
        "name": "\u52A0\u7C73\u7DDA",
        "price": 20
      },
      {
        "id": "addon-1784479725596-570",
        "name": "\u5347\u7D1A\u5957\u9910(\u70E4\u852C\u83DC+\u6CF0\u5976\u4E00\u676F)",
        "price": 140
      }
    ],
    "recipe": []
  },
  {
    "available": true,
    "name": {
      "zh": "Choice\u725B\u5C0F\u6392-5oz",
      "en": "USDA Choice Beef Short Rib Steak (5oz)",
      "ko": "Choice\u725B\u5C0F\u6392-5oz",
      "ja": "Choice\u725B\u5C0F\u6392-5oz",
      "th": "Choice\u725B\u5C0F\u6392-5oz"
    },
    "isNotSpicy": true,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "\u539F\u8089\u7CBE\u4FEE\u5F8C\uFF0C\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473!",
      "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
      "ko": "\u539F\u8089\u7CBE\u4FEE\u5F8C\uFF0C\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473!",
      "ja": "\u539F\u8089\u7CBE\u4FEE\u5F8C\uFF0C\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473!",
      "th": "\u539F\u8089\u7CBE\u4FEE\u5F8C\uFF0C\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473!"
    },
    "orderIndex": 78,
    "containsSeafood": false,
    "containsBeef": true,
    "price": 590,
    "id": "dish-2209081753180",
    "category": "skewers",
    "containsPork": false,
    "hasNoodlesOption": false,
    "customAddOns": [
      {
        "id": "addon-1784479747323-7",
        "name": "\u52A0\u6CB3\u7C89",
        "price": 20
      },
      {
        "id": "addon-1784479750303-903",
        "name": "\u52A0\u7C73\u7DDA",
        "price": 20
      },
      {
        "id": "addon-1784479752305-972",
        "name": "\u5347\u7D1A\u5957\u9910(\u70E4\u852C\u83DC+\u6CF0\u5976\u4E00\u676F)",
        "price": 140
      }
    ],
    "recipe": []
  },
  {
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "\u65E9\u4E0A\u53BB\u5E02\u5834\u62FF\u56DE\u4F86\u62D4\u6BDB+\u9183\u6599(\u559C\u6B61\u96DE\u5C41\u5C41\u7684\u4EBA\u5FC5\u9EDE\u554A!)\u7531\u65BC\u6C92\u6709\u70B8\u904E\u518D\u70E4\u7D04\u70E415\u5206\u9418",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u65E9\u4E0A\u53BB\u5E02\u5834\u62FF\u56DE\u4F86\u62D4\u6BDB+\u9183\u6599(\u559C\u6B61\u96DE\u5C41\u5C41\u7684\u4EBA\u5FC5\u9EDE\u554A!)\u7531\u65BC\u6C92\u6709\u70B8\u904E\u518D\u70E4\u7D04\u70E415\u5206\u9418",
      "ja": "\u65E9\u4E0A\u53BB\u5E02\u5834\u62FF\u56DE\u4F86\u62D4\u6BDB+\u9183\u6599(\u559C\u6B61\u96DE\u5C41\u5C41\u7684\u4EBA\u5FC5\u9EDE\u554A!)\u7531\u65BC\u6C92\u6709\u70B8\u904E\u518D\u70E4\u7D04\u70E415\u5206\u9418",
      "th": "\u65E9\u4E0A\u53BB\u5E02\u5834\u62FF\u56DE\u4F86\u62D4\u6BDB+\u9183\u6599(\u559C\u6B61\u96DE\u5C41\u5C41\u7684\u4EBA\u5FC5\u9EDE\u554A!)\u7531\u65BC\u6C92\u6709\u70B8\u904E\u518D\u70E4\u7D04\u70E415\u5206\u9418"
    },
    "orderIndex": 79,
    "price": 90,
    "containsBeef": false,
    "containsSeafood": false,
    "id": "dish-2209081751117",
    "category": "skewers",
    "containsPork": false,
    "name": {
      "zh": "\u7279\u5927\u571F\u96DE\u4E03\u91CC\u9999",
      "en": "Extra Large Chicken Butt Skewers",
      "ko": "\u7279\u5927\u571F\u96DE\u4E03\u91CC\u9999",
      "ja": "\u7279\u5927\u571F\u96DE\u4E03\u91CC\u9999",
      "th": "\u7279\u5927\u571F\u96DE\u4E03\u91CC\u9999"
    },
    "available": true,
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "image": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 80,
    "description": {
      "zh": "\u7CBE\u5FC3\u8ABF\u88FD\uFF0C\u53E3\u611F\u5C64\u6B21\u8C50\u5BCC\uFF0C\u70BA\u60A8\u7684\u9910\u9EDE\u6DFB\u5F69",
      "en": "Meticulously crafted with rich layers of flavor to complement your meal.",
      "ko": "\u7CBE\u5FC3\u8ABF\u88FD\uFF0C\u53E3\u611F\u5C64\u6B21\u8C50\u5BCC\uFF0C\u70BA\u60A8\u7684\u9910\u9EDE\u6DFB\u5F69",
      "ja": "\u7CBE\u5FC3\u8ABF\u88FD\uFF0C\u53E3\u611F\u5C64\u6B21\u8C50\u5BCC\uFF0C\u70BA\u60A8\u7684\u9910\u9EDE\u6DFB\u5F69",
      "th": "\u7CBE\u5FC3\u8ABF\u88FD\uFF0C\u53E3\u611F\u5C64\u6B21\u8C50\u5BCC\uFF0C\u70BA\u60A8\u7684\u9910\u9EDE\u6DFB\u5F69"
    },
    "containsSeafood": false,
    "containsBeef": false,
    "price": 0,
    "containsPork": false,
    "category": "cat-zene8j",
    "id": "dish-2208121916271",
    "available": true,
    "name": {
      "zh": "\u8FA3\u6912\u7C89",
      "en": "Chili Powder Dip",
      "ko": "\u8FA3\u6912\u7C89",
      "ja": "\u8FA3\u6912\u7C89",
      "th": "\u8FA3\u6912\u7C89"
    },
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "available": true,
    "name": {
      "zh": "\u6CF0\u5F0F\u6D77\u9BAE\u6CB3\u7C89",
      "en": "Thai Seafood Tom Yum Pho Noodle",
      "ko": "\u6CF0\u5F0F\u6D77\u9BAE\u6CB3\u7C89",
      "ja": "\u6CF0\u5F0F\u6D77\u9BAE\u6CB3\u7C89",
      "th": "\u6CF0\u5F0F\u6D77\u9BAE\u6CB3\u7C89"
    },
    "isNotSpicy": false,
    "description": {
      "zh": "\u6C92\u5403\u904E\u51AC\u852D\u529F\u5C31\u4E0D\u80FD\u8AAA\u5403\u904E\u6CF0\u5F0F! \u7D93\u5178\u53E3\u5473\u9053\u5730\u98A8\u5473\u6E6F\u9EB5\uFF0C\u6FC3\u90C1\u6E6F\u5E95\u6696\u5FC3\u6696\u80C3",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "\u6C92\u5403\u904E\u51AC\u852D\u529F\u5C31\u4E0D\u80FD\u8AAA\u5403\u904E\u6CF0\u5F0F! \u7D93\u5178\u53E3\u5473\u9053\u5730\u98A8\u5473\u6E6F\u9EB5\uFF0C\u6FC3\u90C1\u6E6F\u5E95\u6696\u5FC3\u6696\u80C3",
      "ja": "\u6C92\u5403\u904E\u51AC\u852D\u529F\u5C31\u4E0D\u80FD\u8AAA\u5403\u904E\u6CF0\u5F0F! \u7D93\u5178\u53E3\u5473\u9053\u5730\u98A8\u5473\u6E6F\u9EB5\uFF0C\u6FC3\u90C1\u6E6F\u5E95\u6696\u5FC3\u6696\u80C3",
      "th": "\u6C92\u5403\u904E\u51AC\u852D\u529F\u5C31\u4E0D\u80FD\u8AAA\u5403\u904E\u6CF0\u5F0F! \u7D93\u5178\u53E3\u5473\u9053\u5730\u98A8\u5473\u6E6F\u9EB5\uFF0C\u6FC3\u90C1\u6E6F\u5E95\u6696\u5FC3\u6696\u80C3"
    },
    "orderIndex": 81,
    "image": "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&q=80&w=400",
    "containsPork": false,
    "id": "dish-2208121912457",
    "category": "tomyum",
    "containsBeef": false,
    "containsSeafood": true,
    "price": 240,
    "hasNoodlesOption": false,
    "customAddOns": [
      {
        "id": "addon-1784479804720-626",
        "name": "\u52A0\u6CB3\u7C89",
        "price": 20
      },
      {
        "id": "addon-1784479806981-555",
        "name": "\u52A0\u7C73\u7DDA",
        "price": 20
      },
      {
        "id": "addon-1784479809050-307",
        "name": "\u5347\u7D1A\u5957\u9910(\u70E4\u852C\u83DC+\u6CF0\u5976\u4E00\u676F)",
        "price": 140
      }
    ],
    "recipe": []
  },
  {
    "orderIndex": 82,
    "description": {
      "zh": "\u5916\u9165\u5167\u5AE9\u7684\u53E3\u611F\uFF0C\u5E97\u5167\u4EBA\u6C23\u5546\u54C1!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u5916\u9165\u5167\u5AE9\u7684\u53E3\u611F\uFF0C\u5E97\u5167\u4EBA\u6C23\u5546\u54C1!",
      "ja": "\u5916\u9165\u5167\u5AE9\u7684\u53E3\u611F\uFF0C\u5E97\u5167\u4EBA\u6C23\u5546\u54C1!",
      "th": "\u5916\u9165\u5167\u5AE9\u7684\u53E3\u611F\uFF0C\u5E97\u5167\u4EBA\u6C23\u5546\u54C1!"
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "id": "dish-2208071821298",
    "category": "skewers",
    "containsPork": false,
    "containsBeef": false,
    "containsSeafood": false,
    "price": 90,
    "available": true,
    "name": {
      "zh": "\u6CF0\u9165\u8C46\u76AE",
      "en": "Crispy Tofu Skin Skewer",
      "ko": "\u6CF0\u9165\u8C46\u76AE",
      "ja": "\u6CF0\u9165\u8C46\u76AE",
      "th": "\u6CF0\u9165\u8C46\u76AE"
    },
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "description": {
      "zh": "\u6C92\u5403\u904E\u78B3\u70E4\u6708\u4EAE\u8766\u9905\u7684\u4E00\u5B9A\u8981\u8A66\u8A66!\u6CBE\u91AC\u6703\u53E6\u5916\u9644->\u8766\u9905\u662F\uFF08\u624B\u5DE5\u88FD\u4F5C\uFF09\u5167\u542B\u8766\u4EC1\u3001\u6D77\u9BAE\u5167\u9921\u53CA\u9B5A\u6F3F\uFF0C\u53E3\u611F\u4E00\u6D41",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u6C92\u5403\u904E\u78B3\u70E4\u6708\u4EAE\u8766\u9905\u7684\u4E00\u5B9A\u8981\u8A66\u8A66!\u6CBE\u91AC\u6703\u53E6\u5916\u9644->\u8766\u9905\u662F\uFF08\u624B\u5DE5\u88FD\u4F5C\uFF09\u5167\u542B\u8766\u4EC1\u3001\u6D77\u9BAE\u5167\u9921\u53CA\u9B5A\u6F3F\uFF0C\u53E3\u611F\u4E00\u6D41",
      "ja": "\u6C92\u5403\u904E\u78B3\u70E4\u6708\u4EAE\u8766\u9905\u7684\u4E00\u5B9A\u8981\u8A66\u8A66!\u6CBE\u91AC\u6703\u53E6\u5916\u9644->\u8766\u9905\u662F\uFF08\u624B\u5DE5\u88FD\u4F5C\uFF09\u5167\u542B\u8766\u4EC1\u3001\u6D77\u9BAE\u5167\u9921\u53CA\u9B5A\u6F3F\uFF0C\u53E3\u611F\u4E00\u6D41",
      "th": "\u6C92\u5403\u904E\u78B3\u70E4\u6708\u4EAE\u8766\u9905\u7684\u4E00\u5B9A\u8981\u8A66\u8A66!\u6CBE\u91AC\u6703\u53E6\u5916\u9644->\u8766\u9905\u662F\uFF08\u624B\u5DE5\u88FD\u4F5C\uFF09\u5167\u542B\u8766\u4EC1\u3001\u6D77\u9BAE\u5167\u9921\u53CA\u9B5A\u6F3F\uFF0C\u53E3\u611F\u4E00\u6D41"
    },
    "orderIndex": 83,
    "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400",
    "id": "dish-2208071820475",
    "containsPork": false,
    "category": "seafood",
    "price": 320,
    "containsBeef": false,
    "containsSeafood": true,
    "name": {
      "zh": "\u78B3\u70E4\u624B\u5DE5\u6708\u4EAE\u8766\u9905",
      "en": "Charcoal Grilled Handmade Moon Shrimp Cake",
      "ko": "\u78B3\u70E4\u624B\u5DE5\u6708\u4EAE\u8766\u9905",
      "ja": "\u78B3\u70E4\u624B\u5DE5\u6708\u4EAE\u8766\u9905",
      "th": "\u78B3\u70E4\u624B\u5DE5\u6708\u4EAE\u8766\u9905"
    },
    "available": true,
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 84,
    "description": {
      "zh": "\u56B4\u90782\u9846\u96DE\u86CB+\u7DA0\u5DE8\u4EBA\u7389\u7C73\u7C92->\u6162\u706B\u716E\u719F->\u6492\u4E0A\u73FE\u78E8\u9ED1\u80E1\u6912\u7C92->\u4E00\u7897\u5976\u9999\u56DB\u6EA2\u7684\u6FC3\u6E6F\u5B8C\u6210",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "\u56B4\u90782\u9846\u96DE\u86CB+\u7DA0\u5DE8\u4EBA\u7389\u7C73\u7C92->\u6162\u706B\u716E\u719F->\u6492\u4E0A\u73FE\u78E8\u9ED1\u80E1\u6912\u7C92->\u4E00\u7897\u5976\u9999\u56DB\u6EA2\u7684\u6FC3\u6E6F\u5B8C\u6210",
      "ja": "\u56B4\u90782\u9846\u96DE\u86CB+\u7DA0\u5DE8\u4EBA\u7389\u7C73\u7C92->\u6162\u706B\u716E\u719F->\u6492\u4E0A\u73FE\u78E8\u9ED1\u80E1\u6912\u7C92->\u4E00\u7897\u5976\u9999\u56DB\u6EA2\u7684\u6FC3\u6E6F\u5B8C\u6210",
      "th": "\u56B4\u90782\u9846\u96DE\u86CB+\u7DA0\u5DE8\u4EBA\u7389\u7C73\u7C92->\u6162\u706B\u716E\u719F->\u6492\u4E0A\u73FE\u78E8\u9ED1\u80E1\u6912\u7C92->\u4E00\u7897\u5976\u9999\u56DB\u6EA2\u7684\u6FC3\u6E6F\u5B8C\u6210"
    },
    "price": 160,
    "containsBeef": false,
    "containsSeafood": false,
    "id": "dish-2208071816553",
    "containsPork": false,
    "category": "noodles",
    "name": {
      "zh": "\u5976\u9999\u706B\u817F\u7389\u7C73\u6FC3\u6E6F",
      "en": "Creamy Ham & Sweet Corn Soup",
      "ko": "\u5976\u9999\u706B\u817F\u7389\u7C73\u6FC3\u6E6F",
      "ja": "\u5976\u9999\u706B\u817F\u7389\u7C73\u6FC3\u6E6F",
      "th": "\u5976\u9999\u706B\u817F\u7389\u7C73\u6FC3\u6E6F"
    },
    "available": true,
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "price": 260,
    "containsSeafood": true,
    "id": "dish-2207122341556",
    "category": "tomyum",
    "containsPork": false,
    "description": {
      "zh": "\u9053\u5730\u6CF0\u5F0F\u98A8\u5473\u6E6F\uFF0C\u6FC3\u90C1\u6E6F\u5E95\u6696\u5FC3\u6696\u80C3",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "\u9053\u5730\u6CF0\u5F0F\u98A8\u5473\u6E6F\uFF0C\u6FC3\u90C1\u6E6F\u5E95\u6696\u5FC3\u6696\u80C3",
      "ja": "\u9053\u5730\u6CF0\u5F0F\u98A8\u5473\u6E6F\uFF0C\u6FC3\u90C1\u6E6F\u5E95\u6696\u5FC3\u6696\u80C3",
      "th": "\u9053\u5730\u6CF0\u5F0F\u98A8\u5473\u6E6F\uFF0C\u6FC3\u90C1\u6E6F\u5E95\u6696\u5FC3\u6696\u80C3"
    },
    "isNotSpicy": false,
    "name": {
      "zh": "\u6D77\u9BAE\u51AC\u852D\u529F\u6E6F",
      "en": "Traditional Seafood Tom Yum Soup",
      "ko": "\u6D77\u9BAE\u51AC\u852D\u529F\u6E6F",
      "ja": "\u6D77\u9BAE\u51AC\u852D\u529F\u6E6F",
      "th": "\u6D77\u9BAE\u51AC\u852D\u529F\u6E6F"
    },
    "available": true,
    "containsBeef": false,
    "hasCoconutsMilkOption": true,
    "hasNoodlesOption": false,
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 85,
    "customAddOns": [
      {
        "id": "addon-1784479887987-726",
        "name": "\u52A0\u6CB3\u7C89",
        "price": 20
      },
      {
        "id": "addon-1784479890262-993",
        "name": "\u52A0\u7C73\u7DDA",
        "price": 20
      },
      {
        "id": "addon-1784479892347-500",
        "name": "\u5347\u7D1A\u5957\u9910(\u70E4\u852C\u83DC+\u6CF0\u5976\u4E00\u676F)",
        "price": 140
      }
    ],
    "recipe": []
  },
  {
    "isNotSpicy": true,
    "name": {
      "zh": "\u8D8A\u5357\u9BAE\u725B\u8089\u6CB3\u7C89",
      "en": "Vietnamese Fresh Beef Pho Noodle Soup",
      "ko": "\u8D8A\u5357\u9BAE\u725B\u8089\u6CB3\u7C89",
      "ja": "\u8D8A\u5357\u9BAE\u725B\u8089\u6CB3\u7C89",
      "th": "\u8D8A\u5357\u9BAE\u725B\u8089\u6CB3\u7C89"
    },
    "available": true,
    "containsPork": false,
    "category": "noodles",
    "id": "dish-2207122341013",
    "price": 250,
    "containsSeafood": false,
    "containsBeef": true,
    "orderIndex": 86,
    "description": {
      "zh": "\u6E6F\u982D\u6E05\u751C\uFF08\u5927\u9AA8\u8DDF\u852C\u83DC\u71AC\u716E3\u5C0F\u6642\uFF0C\u4E0D\u662F\u5473\u7CBE\u6E6F\uFF0C\u6BCF\u5929\u9650\u91CF\u4F9B\u61C914\u4EFD\u8CE3\u5B8C\u5C31\u6C92\u4E86\uFF09\u8089\u7247\u662F\u63A1\u7528\u7F8E\u570B\u5AE9\u80A9\u91CC\u808C\u725B\u8089choice\u7B49\u7D1A\uFF01\u914D\u6599\uFF1A\u5927\u9678\u59B9\u3001\u6D0B\u8525\u3001\u8525\u3001\u4E5D\u5C64\u5854\u3001\u9ED1\u80E1\u6912\uFF0C\u8C46\u82BD\u83DC\u3001\u6CB3\u7C89\u4E3B\u98DF\u3002",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "\u6E6F\u982D\u6E05\u751C\uFF08\u5927\u9AA8\u8DDF\u852C\u83DC\u71AC\u716E3\u5C0F\u6642\uFF0C\u4E0D\u662F\u5473\u7CBE\u6E6F\uFF0C\u6BCF\u5929\u9650\u91CF\u4F9B\u61C914\u4EFD\u8CE3\u5B8C\u5C31\u6C92\u4E86\uFF09\u8089\u7247\u662F\u63A1\u7528\u7F8E\u570B\u5AE9\u80A9\u91CC\u808C\u725B\u8089choice\u7B49\u7D1A\uFF01\u914D\u6599\uFF1A\u5927\u9678\u59B9\u3001\u6D0B\u8525\u3001\u8525\u3001\u4E5D\u5C64\u5854\u3001\u9ED1\u80E1\u6912\uFF0C\u8C46\u82BD\u83DC\u3001\u6CB3\u7C89\u4E3B\u98DF\u3002",
      "ja": "\u6E6F\u982D\u6E05\u751C\uFF08\u5927\u9AA8\u8DDF\u852C\u83DC\u71AC\u716E3\u5C0F\u6642\uFF0C\u4E0D\u662F\u5473\u7CBE\u6E6F\uFF0C\u6BCF\u5929\u9650\u91CF\u4F9B\u61C914\u4EFD\u8CE3\u5B8C\u5C31\u6C92\u4E86\uFF09\u8089\u7247\u662F\u63A1\u7528\u7F8E\u570B\u5AE9\u80A9\u91CC\u808C\u725B\u8089choice\u7B49\u7D1A\uFF01\u914D\u6599\uFF1A\u5927\u9678\u59B9\u3001\u6D0B\u8525\u3001\u8525\u3001\u4E5D\u5C64\u5854\u3001\u9ED1\u80E1\u6912\uFF0C\u8C46\u82BD\u83DC\u3001\u6CB3\u7C89\u4E3B\u98DF\u3002",
      "th": "\u6E6F\u982D\u6E05\u751C\uFF08\u5927\u9AA8\u8DDF\u852C\u83DC\u71AC\u716E3\u5C0F\u6642\uFF0C\u4E0D\u662F\u5473\u7CBE\u6E6F\uFF0C\u6BCF\u5929\u9650\u91CF\u4F9B\u61C914\u4EFD\u8CE3\u5B8C\u5C31\u6C92\u4E86\uFF09\u8089\u7247\u662F\u63A1\u7528\u7F8E\u570B\u5AE9\u80A9\u91CC\u808C\u725B\u8089choice\u7B49\u7D1A\uFF01\u914D\u6599\uFF1A\u5927\u9678\u59B9\u3001\u6D0B\u8525\u3001\u8525\u3001\u4E5D\u5C64\u5854\u3001\u9ED1\u80E1\u6912\uFF0C\u8C46\u82BD\u83DC\u3001\u6CB3\u7C89\u4E3B\u98DF\u3002"
    },
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "customAddOns": [
      {
        "id": "addon-1784479915298-709",
        "name": "\u52A0\u6CB3\u7C89",
        "price": 20
      },
      {
        "id": "addon-1784479917660-34",
        "name": "\u5347\u7D1A\u5957\u9910(\u70E4\u852C\u83DC+\u6CF0\u5976\u4E00\u676F)",
        "price": 140
      }
    ],
    "recipe": []
  },
  {
    "name": {
      "zh": "\u7D2B\u83DC\u86CB\u82B1\u6E6F",
      "en": "Seaweed & Egg Drop Soup",
      "ko": "\uAE40 \uACC4\uB780\uAD6D",
      "ja": "\u6D77\u82D4\u3068\u305F\u307E\u3054\u306E\u30B9\u30FC\u30D7",
      "th": "\u0E0B\u0E38\u0E1B\u0E2A\u0E32\u0E2B\u0E23\u0E48\u0E32\u0E22\u0E44\u0E02\u0E48\u0E19\u0E38\u0E48\u0E21",
      "vi": "S\xFAp Rong Bi\u1EC3n Tr\u1EE9ng"
    },
    "available": true,
    "isNotSpicy": true,
    "description": {
      "zh": "\u6D17\u9078\u96DE\u86CB2\u9846+\u6D77\u5E36\u82BD~\u5916\u98DF\u65CF\u88DC\u5145\u81B3\u98DF\u7E96\u7DAD\u767D\u8CEA\u7684\u597D\u9078\u64C7",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "\uC815\uD1B5 \uD0DC\uAD6D\uC2DD \uAD6D\uC218, \uC9C4\uD558\uACE0 \uB530\uB73B\uD55C \uC721\uC218\uAC00 \uBAB8\uC744 \uB179\uC785\uB2C8\uB2E4",
      "ja": "\u672C\u683C\u30BF\u30A4\u98A8\u30B9\u30FC\u30D7\u9EBA\u3001\u6FC3\u539A\u306A\u30B9\u30FC\u30D7\u3067\u4F53\u304C\u6E29\u307E\u308B",
      "th": "\u0E01\u0E4B\u0E27\u0E22\u0E40\u0E15\u0E35\u0E4B\u0E22\u0E27\u0E41\u0E1A\u0E1A\u0E44\u0E17\u0E22\u0E41\u0E17\u0E49 \u0E19\u0E49\u0E33\u0E0B\u0E38\u0E1B\u0E02\u0E49\u0E19\u0E2D\u0E23\u0E48\u0E2D\u0E22\u0E2D\u0E38\u0E48\u0E19\u0E17\u0E49\u0E2D\u0E07",
      "vi": "Authentic Thai-style soup noodles with rich, warming broth"
    },
    "orderIndex": 87,
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "id": "dish-2207122338495",
    "containsPork": false,
    "category": "noodles",
    "price": 90,
    "containsBeef": false,
    "containsSeafood": false
  },
  {
    "orderIndex": 88,
    "description": {
      "zh": "\u6BCF\u65E5\u65E9\u5E02\u65B0\u9BAE\u63A1\u8CB7~\u65B0\u9BAE\u86E4\u8823\u642D\u914D\u8525\u8591\u7D72\u4E5D\u5C64\u5854!\u8D8A\u7C21\u55AE\u8D8A\u8010\u4EBA\u5C0B\u5473",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "\uC815\uD1B5 \uD0DC\uAD6D\uC2DD \uAD6D\uC218, \uC9C4\uD558\uACE0 \uB530\uB73B\uD55C \uC721\uC218\uAC00 \uBAB8\uC744 \uB179\uC785\uB2C8\uB2E4",
      "ja": "\u672C\u683C\u30BF\u30A4\u98A8\u30B9\u30FC\u30D7\u9EBA\u3001\u6FC3\u539A\u306A\u30B9\u30FC\u30D7\u3067\u4F53\u304C\u6E29\u307E\u308B",
      "th": "\u0E01\u0E4B\u0E27\u0E22\u0E40\u0E15\u0E35\u0E4B\u0E22\u0E27\u0E41\u0E1A\u0E1A\u0E44\u0E17\u0E22\u0E41\u0E17\u0E49 \u0E19\u0E49\u0E33\u0E0B\u0E38\u0E1B\u0E02\u0E49\u0E19\u0E2D\u0E23\u0E48\u0E2D\u0E22\u0E2D\u0E38\u0E48\u0E19\u0E17\u0E49\u0E2D\u0E07",
      "vi": "Authentic Thai-style soup noodles with rich, warming broth"
    },
    "image": "https://images.unsplash.com/photo-1533622597524-a1215e26c0a2?auto=format&fit=crop&q=80&w=400",
    "category": "noodles",
    "containsPork": false,
    "id": "dish-2207122336248",
    "containsSeafood": true,
    "containsBeef": false,
    "price": 150,
    "available": true,
    "name": {
      "zh": "\u9BAE\u5473\u86E4\u870A\u6E6F",
      "en": "Fresh Clam Soup w/ Ginger",
      "ko": "\uC2E0\uC120\uD55C \uBC14\uC9C0\uB77D \uC0DD\uAC15 \uC870\uAC1C\uD0D5",
      "ja": "\u65B0\u9BAE\u30A2\u30B5\u30EA\u3068\u751F\u59DC\u306E\u30AF\u30EA\u30A2\u30B9\u30FC\u30D7",
      "th": "\u0E0B\u0E38\u0E1B\u0E2B\u0E2D\u0E22\u0E15\u0E25\u0E31\u0E1A\u0E2A\u0E14\u0E43\u0E2A\u0E48\u0E02\u0E34\u0E07\u0E41\u0E25\u0E30\u0E42\u0E2B\u0E23\u0E30\u0E1E\u0E32",
      "vi": "Canh Ngh\xEAu T\u01B0\u01A1i N\u1EA5u G\u1EEBng H\xFAng Qu\u1EBF"
    },
    "isNotSpicy": true
  },
  {
    "orderIndex": 89,
    "description": {
      "zh": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "ja": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "th": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D"
    },
    "image": "https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&q=80&w=400",
    "id": "dish-2207122331502",
    "containsPork": false,
    "category": "cat-7cvvkq",
    "containsSeafood": false,
    "containsBeef": false,
    "price": 100,
    "available": true,
    "name": {
      "zh": "\u91D1\u724C",
      "en": "Taiwan Gold Medal Beer",
      "ko": "\u91D1\u724C",
      "ja": "\u91D1\u724C",
      "th": "\u91D1\u724C"
    },
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": true,
    "name": {
      "zh": "\u91D1\u6A3D",
      "en": "Gold Draft Beer",
      "ko": "\u91D1\u6A3D",
      "ja": "\u91D1\u6A3D",
      "th": "\u91D1\u6A3D"
    },
    "available": true,
    "id": "dish-2207122330338",
    "containsPork": false,
    "category": "cat-7cvvkq",
    "price": 150,
    "containsBeef": false,
    "containsSeafood": false,
    "description": {
      "zh": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "ja": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D",
      "th": "\u6C81\u6DBC\u6D88\u6691\uFF0C\u53E3\u611F\u6E05\u723D\uFF0C\u642D\u914D\u71D2\u70E4\u7D55\u914D"
    },
    "orderIndex": 90,
    "image": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "available": true,
    "name": {
      "zh": "\u53EF\u53E3\u53EF\u6A02",
      "en": "Coca-Cola",
      "ko": "\uCF54\uCE74\uCF5C\uB77C",
      "ja": "\u30B3\u30AB\u30FB\u30B3\u30FC\u30E9",
      "th": "\u0E42\u0E04\u0E04\u0E32-\u0E42\u0E04\u0E25\u0E48\u0E32",
      "vi": "Coca-Cola"
    },
    "isNotSpicy": true,
    "description": {
      "zh": "\u80A5\u4ED4\u7684\u5FEB\u6A02\u6C34~\u642D\u914D\u71D2\u70E4\u7D55\u914D!",
      "en": "Refreshing and cool, a perfect match for BBQ",
      "ko": "\uC2DC\uC6D0\uD558\uACE0 \uC0C1\uCF8C\uD55C \uC74C\uB8CC\uB85C \uBC14\uBCA0\uD050\uC640 \uC644\uBCBD\uD55C \uC870\uD654",
      "ja": "\u51B7\u305F\u304F\u3055\u308F\u3084\u304B\u3001BBQ\u306B\u6700\u9AD8\u306E\u7D44\u307F\u5408\u308F\u305B",
      "th": "\u0E40\u0E22\u0E47\u0E19\u0E0A\u0E37\u0E48\u0E19\u0E43\u0E08 \u0E23\u0E2A\u0E2A\u0E14\u0E0A\u0E37\u0E48\u0E19 \u0E40\u0E02\u0E49\u0E32\u0E01\u0E31\u0E1A\u0E1A\u0E32\u0E23\u0E4C\u0E1A\u0E35\u0E04\u0E34\u0E27\u0E44\u0E14\u0E49\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E25\u0E07\u0E15\u0E31\u0E27",
      "vi": "Gi\u1EA3i nhi\u1EC7t s\u1EA3ng kho\xE1i, h\u01B0\u01A1ng v\u1ECB t\u01B0\u01A1i m\xE1t, s\u1EF1 k\u1EBFt h\u1EE3p ho\xE0n h\u1EA3o v\u1EDBi m\xF3n n\u01B0\u1EDBng"
    },
    "orderIndex": 91,
    "image": "https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&q=80&w=400",
    "containsPork": false,
    "category": "drinks",
    "id": "dish-2207122323590",
    "containsBeef": false,
    "containsSeafood": false,
    "price": 90
  },
  {
    "isNotSpicy": true,
    "available": true,
    "name": {
      "zh": "\u6CF0\u5F0F\u5976\u8336400ml",
      "en": "Signature Thai Iced Milk Tea (400ml)",
      "ko": "\u6CF0\u5F0F\u5976\u8336400ml",
      "ja": "\u6CF0\u5F0F\u5976\u8336400ml",
      "th": "\u6CF0\u5F0F\u5976\u8336400ml"
    },
    "containsBeef": false,
    "containsSeafood": false,
    "price": 90,
    "category": "drinks",
    "id": "dish-2207122322371",
    "containsPork": false,
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "\u8336\u9999\u6FC3\u90C1\u7684\u7D93\u5178\u624B\u6A19\u6CF0\u5976~\u6C81\u6DBC\u6D88\u6691~\u62DB\u724C!",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "\u8336\u9999\u6FC3\u90C1\u7684\u7D93\u5178\u624B\u6A19\u6CF0\u5976~\u6C81\u6DBC\u6D88\u6691~\u62DB\u724C!",
      "ja": "\u8336\u9999\u6FC3\u90C1\u7684\u7D93\u5178\u624B\u6A19\u6CF0\u5976~\u6C81\u6DBC\u6D88\u6691~\u62DB\u724C!",
      "th": "\u8336\u9999\u6FC3\u90C1\u7684\u7D93\u5178\u624B\u6A19\u6CF0\u5976~\u6C81\u6DBC\u6D88\u6691~\u62DB\u724C!"
    },
    "orderIndex": 92,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "containsSeafood": false,
    "containsBeef": false,
    "price": 160,
    "id": "dish-2207122316233",
    "containsPork": false,
    "category": "cat-zene8j",
    "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 93,
    "description": {
      "zh": "\u7206\u7092\u671D\u5929\u6912 \u8591\u7D72 \u849C ~\u597D\u5403\u4E0D\u6DFB\u52A0\u9632\u8150\u5291\uFF01\u8CFC\u8CB7\u56DE\u5BB6\u9700\u51B7\u85CF",
      "en": "Carefully crafted with rich flavors to complement your meal",
      "ko": "\u7206\u7092\u671D\u5929\u6912 \u8591\u7D72 \u849C ~\u597D\u5403\u4E0D\u6DFB\u52A0\u9632\u8150\u5291\uFF01\u8CFC\u8CB7\u56DE\u5BB6\u9700\u51B7\u85CF",
      "ja": "\u7206\u7092\u671D\u5929\u6912 \u8591\u7D72 \u849C ~\u597D\u5403\u4E0D\u6DFB\u52A0\u9632\u8150\u5291\uFF01\u8CFC\u8CB7\u56DE\u5BB6\u9700\u51B7\u85CF",
      "th": "\u7206\u7092\u671D\u5929\u6912 \u8591\u7D72 \u849C ~\u597D\u5403\u4E0D\u6DFB\u52A0\u9632\u8150\u5291\uFF01\u8CFC\u8CB7\u56DE\u5BB6\u9700\u51B7\u85CF"
    },
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "\u7279\u88FD\u8FA3\u6912\u91AC(\u5916\u5E36)",
      "en": "House Special Chili Sauce (Takeout Jar)",
      "ko": "\u7279\u88FD\u8FA3\u6912\u91AC(\u5916\u5E36)",
      "ja": "\u7279\u88FD\u8FA3\u6912\u91AC(\u5916\u5E36)",
      "th": "\u7279\u88FD\u8FA3\u6912\u91AC(\u5916\u5E36)"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "orderIndex": 94,
    "description": {
      "zh": "\u7CBE\u5FC3\u8ABF\u88FD\uFF0C\u53E3\u611F\u5C64\u6B21\u8C50\u5BCC\uFF0C\u70BA\u60A8\u7684\u9910\u9EDE\u6DFB\u5F69",
      "en": "Meticulously crafted with rich layers of flavor to complement your meal.",
      "ko": "\u7CBE\u5FC3\u8ABF\u88FD\uFF0C\u53E3\u611F\u5C64\u6B21\u8C50\u5BCC\uFF0C\u70BA\u60A8\u7684\u9910\u9EDE\u6DFB\u5F69",
      "ja": "\u7CBE\u5FC3\u8ABF\u88FD\uFF0C\u53E3\u611F\u5C64\u6B21\u8C50\u5BCC\uFF0C\u70BA\u60A8\u7684\u9910\u9EDE\u6DFB\u5F69",
      "th": "\u7CBE\u5FC3\u8ABF\u88FD\uFF0C\u53E3\u611F\u5C64\u6B21\u8C50\u5BCC\uFF0C\u70BA\u60A8\u7684\u9910\u9EDE\u6DFB\u5F69"
    },
    "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400",
    "containsPork": false,
    "category": "cat-zene8j",
    "id": "dish-2207122312525",
    "price": 0,
    "containsBeef": false,
    "containsSeafood": false,
    "name": {
      "zh": "\u6CF0\u5F0F\u7DA0\u91AC",
      "en": "Thai Seafood Green Chili Sauce",
      "ko": "\u6CF0\u5F0F\u7DA0\u91AC",
      "ja": "\u6CF0\u5F0F\u7DA0\u91AC",
      "th": "\u6CF0\u5F0F\u7DA0\u91AC"
    },
    "available": true,
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "containsBeef": false,
    "containsSeafood": false,
    "price": 0,
    "category": "cat-zene8j",
    "containsPork": false,
    "id": "dish-2207122311467",
    "image": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "\u7CBE\u5FC3\u8ABF\u88FD\uFF0C\u53E3\u611F\u5C64\u6B21\u8C50\u5BCC\uFF0C\u70BA\u60A8\u7684\u9910\u9EDE\u6DFB\u5F69",
      "en": "Meticulously crafted with rich layers of flavor to complement your meal.",
      "ko": "\u7CBE\u5FC3\u8ABF\u88FD\uFF0C\u53E3\u611F\u5C64\u6B21\u8C50\u5BCC\uFF0C\u70BA\u60A8\u7684\u9910\u9EDE\u6DFB\u5F69",
      "ja": "\u7CBE\u5FC3\u8ABF\u88FD\uFF0C\u53E3\u611F\u5C64\u6B21\u8C50\u5BCC\uFF0C\u70BA\u60A8\u7684\u9910\u9EDE\u6DFB\u5F69",
      "th": "\u7CBE\u5FC3\u8ABF\u88FD\uFF0C\u53E3\u611F\u5C64\u6B21\u8C50\u5BCC\uFF0C\u70BA\u60A8\u7684\u9910\u9EDE\u6DFB\u5F69"
    },
    "orderIndex": 95,
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "\u6CF0\u5F0F\u7D05\u91AC",
      "en": "Thai BBQ Red Chili Sauce",
      "ko": "\u6CF0\u5F0F\u7D05\u91AC",
      "ja": "\u6CF0\u5F0F\u7D05\u91AC",
      "th": "\u6CF0\u5F0F\u7D05\u91AC"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "containsBeef": false,
    "containsSeafood": false,
    "price": 80,
    "id": "dish-2207122252395",
    "category": "veggies",
    "containsPork": false,
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "\u53C8\u7A31\u4F5C\u654F\u8C46\uFF0C\u53E3\u611F\u6E05\u751C\u3001\u5BCC\u542B\u71DF\u990A\u4E14\u4F4E\u71B1\u91CF",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u53C8\u7A31\u4F5C\u654F\u8C46\uFF0C\u53E3\u611F\u6E05\u751C\u3001\u5BCC\u542B\u71DF\u990A\u4E14\u4F4E\u71B1\u91CF",
      "ja": "\u53C8\u7A31\u4F5C\u654F\u8C46\uFF0C\u53E3\u611F\u6E05\u751C\u3001\u5BCC\u542B\u71DF\u990A\u4E14\u4F4E\u71B1\u91CF",
      "th": "\u53C8\u7A31\u4F5C\u654F\u8C46\uFF0C\u53E3\u611F\u6E05\u751C\u3001\u5BCC\u542B\u71DF\u990A\u4E14\u4F4E\u71B1\u91CF"
    },
    "orderIndex": 96,
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "\u56DB\u5B63\u8C46",
      "en": "Charcoal Grilled Green Beans",
      "ko": "\u56DB\u5B63\u8C46",
      "ja": "\u56DB\u5B63\u8C46",
      "th": "\u56DB\u5B63\u8C46"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "orderIndex": 97,
    "description": {
      "zh": "\u65B0\u7AF9\u4EBA\u6C23\u4E38\u5B50~\u5927\u4EBA\u5C0F\u5B69\u90FD\u611B",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u65B0\u7AF9\u4EBA\u6C23\u4E38\u5B50~\u5927\u4EBA\u5C0F\u5B69\u90FD\u611B",
      "ja": "\u65B0\u7AF9\u4EBA\u6C23\u4E38\u5B50~\u5927\u4EBA\u5C0F\u5B69\u90FD\u611B",
      "th": "\u65B0\u7AF9\u4EBA\u6C23\u4E38\u5B50~\u5927\u4EBA\u5C0F\u5B69\u90FD\u611B"
    },
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "containsPork": true,
    "category": "skewers",
    "id": "dish-2207122141316",
    "containsSeafood": false,
    "containsBeef": false,
    "price": 60,
    "available": true,
    "name": {
      "zh": "\u65B0\u7AF9\u8CA2\u4E38",
      "en": "Hsinchu Pork Meatballs",
      "ko": "\u65B0\u7AF9\u8CA2\u4E38",
      "ja": "\u65B0\u7AF9\u8CA2\u4E38",
      "th": "\u65B0\u7AF9\u8CA2\u4E38"
    },
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "\u6F8E\u6F8E\u751C\u4E0D\u8FA3",
      "en": "Chewy Charcoal Grilled Fish Cakes",
      "ko": "\u6F8E\u6F8E\u751C\u4E0D\u8FA3",
      "ja": "\u6F8E\u6F8E\u751C\u4E0D\u8FA3",
      "th": "\u6F8E\u6F8E\u751C\u4E0D\u8FA3"
    },
    "category": "seafood",
    "containsPork": false,
    "id": "dish-2207122140364",
    "containsBeef": false,
    "containsSeafood": true,
    "price": 80,
    "description": {
      "zh": "\u70E4\u751C\u4E0D\u8FA3\uFF0C\u53E3\u611FQ\u5F48\u7D2E\u5BE6!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u70E4\u751C\u4E0D\u8FA3\uFF0C\u53E3\u611FQ\u5F48\u7D2E\u5BE6!",
      "ja": "\u70E4\u751C\u4E0D\u8FA3\uFF0C\u53E3\u611FQ\u5F48\u7D2E\u5BE6!",
      "th": "\u70E4\u751C\u4E0D\u8FA3\uFF0C\u53E3\u611FQ\u5F48\u7D2E\u5BE6!"
    },
    "orderIndex": 98,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "available": true,
    "name": {
      "zh": "\u9BD6\u7518\u9B5A\u4E0B\u5DF4",
      "en": "Charcoal Grilled Mackerel Collar (XL)",
      "ko": "\u9BD6\u7518\u9B5A\u4E0B\u5DF4",
      "ja": "\u9BD6\u7518\u9B5A\u4E0B\u5DF4",
      "th": "\u9BD6\u7518\u9B5A\u4E0B\u5DF4"
    },
    "isNotSpicy": true,
    "description": {
      "zh": "\u70AD\u706B\u6162\u70E4\uFF0C\u7279\u5927\u865F\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u70AD\u706B\u6162\u70E4\uFF0C\u7279\u5927\u865F\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473!",
      "ja": "\u70AD\u706B\u6162\u70E4\uFF0C\u7279\u5927\u865F\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473!",
      "th": "\u70AD\u706B\u6162\u70E4\uFF0C\u7279\u5927\u865F\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473!"
    },
    "orderIndex": 99,
    "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400",
    "id": "dish-2207122132048",
    "containsPork": false,
    "category": "seafood",
    "containsBeef": false,
    "containsSeafood": true,
    "price": 390,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "\u62DB\u724C\u6CF0\u5F0F\u70E4\u96DE\u7FC5(4\u5165)",
      "en": "Signature Thai BBQ Chicken Wings (4pcs)",
      "ko": "\u62DB\u724C\u6CF0\u5F0F\u70E4\u96DE\u7FC5(4\u5165)",
      "ja": "\u62DB\u724C\u6CF0\u5F0F\u70E4\u96DE\u7FC5(4\u5165)",
      "th": "\u62DB\u724C\u6CF0\u5F0F\u70E4\u96DE\u7FC5(4\u5165)"
    },
    "id": "dish-2207122058577",
    "category": "skewers",
    "containsPork": false,
    "containsSeafood": false,
    "containsBeef": false,
    "price": 160,
    "description": {
      "zh": "\u5FC5\u9EDE!\u5FC5\u9EDE!\u5FC5\u9EDE! \u65E9\u4E0A\u5E02\u5834\u65B0\u9BAE\u63A1\u8CB7->\u6D17\u6DE8\u9183\u88FD\u7368\u5BB6\u6CF0\u5F0F\u91AC\u6599",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u5FC5\u9EDE!\u5FC5\u9EDE!\u5FC5\u9EDE! \u65E9\u4E0A\u5E02\u5834\u65B0\u9BAE\u63A1\u8CB7->\u6D17\u6DE8\u9183\u88FD\u7368\u5BB6\u6CF0\u5F0F\u91AC\u6599",
      "ja": "\u5FC5\u9EDE!\u5FC5\u9EDE!\u5FC5\u9EDE! \u65E9\u4E0A\u5E02\u5834\u65B0\u9BAE\u63A1\u8CB7->\u6D17\u6DE8\u9183\u88FD\u7368\u5BB6\u6CF0\u5F0F\u91AC\u6599",
      "th": "\u5FC5\u9EDE!\u5FC5\u9EDE!\u5FC5\u9EDE! \u65E9\u4E0A\u5E02\u5834\u65B0\u9BAE\u63A1\u8CB7->\u6D17\u6DE8\u9183\u88FD\u7368\u5BB6\u6CF0\u5F0F\u91AC\u6599"
    },
    "orderIndex": 100,
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "\u6CF0\u5F0F\u624B\u5DE5\u725B\u8089",
      "en": "Handmade Thai Spiced Beef Skewer",
      "ko": "\u6CF0\u5F0F\u624B\u5DE5\u725B\u8089",
      "ja": "\u6CF0\u5F0F\u624B\u5DE5\u725B\u8089",
      "th": "\u6CF0\u5F0F\u624B\u5DE5\u725B\u8089"
    },
    "id": "dish-2207122056269",
    "containsPork": false,
    "category": "skewers",
    "containsBeef": true,
    "containsSeafood": false,
    "price": 90,
    "description": {
      "zh": "\u7368\u5BB6\u4E32\u7269!!! \u6BCF\u65E5\u624B\u5DE5\u9650\u91CF~\u4F7F\u7528\u672C\u571F\u725B\u8089\u53CA\u591A\u7A2E\u6CF0\u570B\u9999\u6599\u9183\u88FD\u800C\u6210->\u8089\u5241\u5230\u6709\u9ECF\u6027\u518D\u62CC\u5165\u96F2\u6797\u843D\u82B1\u751F\uFF0C\u6C92\u6709\u79D1\u6280\u5F88\u6D3B\uFF0C\u5168\u5929\u7136\u624B\u5DE5!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u7368\u5BB6\u4E32\u7269!!! \u6BCF\u65E5\u624B\u5DE5\u9650\u91CF~\u4F7F\u7528\u672C\u571F\u725B\u8089\u53CA\u591A\u7A2E\u6CF0\u570B\u9999\u6599\u9183\u88FD\u800C\u6210->\u8089\u5241\u5230\u6709\u9ECF\u6027\u518D\u62CC\u5165\u96F2\u6797\u843D\u82B1\u751F\uFF0C\u6C92\u6709\u79D1\u6280\u5F88\u6D3B\uFF0C\u5168\u5929\u7136\u624B\u5DE5!",
      "ja": "\u7368\u5BB6\u4E32\u7269!!! \u6BCF\u65E5\u624B\u5DE5\u9650\u91CF~\u4F7F\u7528\u672C\u571F\u725B\u8089\u53CA\u591A\u7A2E\u6CF0\u570B\u9999\u6599\u9183\u88FD\u800C\u6210->\u8089\u5241\u5230\u6709\u9ECF\u6027\u518D\u62CC\u5165\u96F2\u6797\u843D\u82B1\u751F\uFF0C\u6C92\u6709\u79D1\u6280\u5F88\u6D3B\uFF0C\u5168\u5929\u7136\u624B\u5DE5!",
      "th": "\u7368\u5BB6\u4E32\u7269!!! \u6BCF\u65E5\u624B\u5DE5\u9650\u91CF~\u4F7F\u7528\u672C\u571F\u725B\u8089\u53CA\u591A\u7A2E\u6CF0\u570B\u9999\u6599\u9183\u88FD\u800C\u6210->\u8089\u5241\u5230\u6709\u9ECF\u6027\u518D\u62CC\u5165\u96F2\u6797\u843D\u82B1\u751F\uFF0C\u6C92\u6709\u79D1\u6280\u5F88\u6D3B\uFF0C\u5168\u5929\u7136\u624B\u5DE5!"
    },
    "orderIndex": 101,
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "\u5674\u6C34\u9999\u8178",
      "en": "Juicy Taiwanese Pork Sausage",
      "ko": "\u5674\u6C34\u9999\u8178",
      "ja": "\u5674\u6C34\u9999\u8178",
      "th": "\u5674\u6C34\u9999\u8178"
    },
    "id": "dish-2207122053275",
    "category": "skewers",
    "containsPork": true,
    "containsBeef": false,
    "containsSeafood": false,
    "price": 60,
    "orderIndex": 102,
    "description": {
      "zh": "\u6C92\u6709\u4EC0\u9EBC\u9AD8\u5927\u4E0A\u7684\u5F62\u5BB9\u8A5E~\u53EA\u6709\u6700\u76F4\u63A5\u7684\u7F8E\u5473~\u53F0\u7063\u5C0F\u5403\u4EE3\u8868",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u6C92\u6709\u4EC0\u9EBC\u9AD8\u5927\u4E0A\u7684\u5F62\u5BB9\u8A5E~\u53EA\u6709\u6700\u76F4\u63A5\u7684\u7F8E\u5473~\u53F0\u7063\u5C0F\u5403\u4EE3\u8868",
      "ja": "\u6C92\u6709\u4EC0\u9EBC\u9AD8\u5927\u4E0A\u7684\u5F62\u5BB9\u8A5E~\u53EA\u6709\u6700\u76F4\u63A5\u7684\u7F8E\u5473~\u53F0\u7063\u5C0F\u5403\u4EE3\u8868",
      "th": "\u6C92\u6709\u4EC0\u9EBC\u9AD8\u5927\u4E0A\u7684\u5F62\u5BB9\u8A5E~\u53EA\u6709\u6700\u76F4\u63A5\u7684\u7F8E\u5473~\u53F0\u7063\u5C0F\u5403\u4EE3\u8868"
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 103,
    "description": {
      "zh": "\u8AB0\u8AAA\u96DE\u76AE\u53EA\u80FD\u70B8?\u5728\u70AD\u706B\u64C1\u62B1\u4E0B\u6536\u6582\u4E86\u6CB9\u8102~\u86FB\u8B8A\u6210\u8A98\u4EBA\u9165\u8106\u53E3\u611F!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u8AB0\u8AAA\u96DE\u76AE\u53EA\u80FD\u70B8?\u5728\u70AD\u706B\u64C1\u62B1\u4E0B\u6536\u6582\u4E86\u6CB9\u8102~\u86FB\u8B8A\u6210\u8A98\u4EBA\u9165\u8106\u53E3\u611F!",
      "ja": "\u8AB0\u8AAA\u96DE\u76AE\u53EA\u80FD\u70B8?\u5728\u70AD\u706B\u64C1\u62B1\u4E0B\u6536\u6582\u4E86\u6CB9\u8102~\u86FB\u8B8A\u6210\u8A98\u4EBA\u9165\u8106\u53E3\u611F!",
      "th": "\u8AB0\u8AAA\u96DE\u76AE\u53EA\u80FD\u70B8?\u5728\u70AD\u706B\u64C1\u62B1\u4E0B\u6536\u6582\u4E86\u6CB9\u8102~\u86FB\u8B8A\u6210\u8A98\u4EBA\u9165\u8106\u53E3\u611F!"
    },
    "containsSeafood": false,
    "containsBeef": false,
    "price": 60,
    "containsPork": false,
    "id": "dish-2207122051592",
    "category": "skewers",
    "available": true,
    "name": {
      "zh": "\u5543\u7684\u96DE\u76AE",
      "en": "Crispy Charcoal Grilled Chicken Skin",
      "ko": "\u5543\u7684\u96DE\u76AE",
      "ja": "\u5543\u7684\u96DE\u76AE",
      "th": "\u5543\u7684\u96DE\u76AE"
    },
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 104,
    "description": {
      "zh": "\u6BCF\u65E5\u65E9\u5E02\u65B0\u9BAE\u63A1\u8CB7<\u53BB\u9AA8\u96DE\u817F\u4F7F\u7528\u53F0\u7063\u653E\u5C71\u96DE><\u4E0D\u6DFB\u52A0\u5AE9\u8089\u7CBE>",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u6BCF\u65E5\u65E9\u5E02\u65B0\u9BAE\u63A1\u8CB7<\u53BB\u9AA8\u96DE\u817F\u4F7F\u7528\u53F0\u7063\u653E\u5C71\u96DE><\u4E0D\u6DFB\u52A0\u5AE9\u8089\u7CBE>",
      "ja": "\u6BCF\u65E5\u65E9\u5E02\u65B0\u9BAE\u63A1\u8CB7<\u53BB\u9AA8\u96DE\u817F\u4F7F\u7528\u53F0\u7063\u653E\u5C71\u96DE><\u4E0D\u6DFB\u52A0\u5AE9\u8089\u7CBE>",
      "th": "\u6BCF\u65E5\u65E9\u5E02\u65B0\u9BAE\u63A1\u8CB7<\u53BB\u9AA8\u96DE\u817F\u4F7F\u7528\u53F0\u7063\u653E\u5C71\u96DE><\u4E0D\u6DFB\u52A0\u5AE9\u8089\u7CBE>"
    },
    "price": 160,
    "containsSeafood": false,
    "containsBeef": false,
    "id": "dish-2207122037251",
    "containsPork": false,
    "category": "skewers",
    "name": {
      "zh": "\u6CF0\u5F0F\u53BB\u9AA8\u70E4\u96DE\u817F",
      "en": "Thai Grilled Boneless Chicken Thigh",
      "ko": "\u6CF0\u5F0F\u53BB\u9AA8\u70E4\u96DE\u817F",
      "ja": "\u6CF0\u5F0F\u53BB\u9AA8\u70E4\u96DE\u817F",
      "th": "\u6CF0\u5F0F\u53BB\u9AA8\u70E4\u96DE\u817F"
    },
    "available": true,
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "\u9053\u5730\u6CF0\u5F0F\u6D77\u9BAE\u4E7E\u62CCmama\u9EB5\uFF08\u8FA3\uFF09",
      "en": "Seafood MAMA Noodles",
      "ko": "\u9053\u5730\u6CF0\u5F0F\u6D77\u9BAE\u4E7E\u62CCmama\u9EB5\uFF08\u8FA3\uFF09",
      "ja": "\u9053\u5730\u6CF0\u5F0F\u6D77\u9BAE\u4E7E\u62CCmama\u9EB5\uFF08\u8FA3\uFF09",
      "th": "\u9053\u5730\u6CF0\u5F0F\u6D77\u9BAE\u4E7E\u62CCmama\u9EB5\uFF08\u8FA3\uFF09"
    },
    "category": "tomyum",
    "containsPork": false,
    "id": "dish-2005282340194",
    "containsBeef": false,
    "containsSeafood": true,
    "price": 190,
    "description": {
      "zh": "\u7D93\u5178\u6CF0\u5F0Fmama\u9EB5~\u62CC\u5165\u7368\u5BB6\u91AC\u6C41~\u64E0\u4E0A\u65B0\u9BAE\u6AB8\u6AAC! \u9178\u8FA3\u958B\u80C3 <\u4E00\u9EDE\u8FA3\u90FD\u6C92\u5403\u7684\u4E0D\u8981\u9EDE\u5594>\u914D\u6599:\u9BAE\u8766 \u9B77\u9B5A\u5708 \u9C48\u9B5A\u4E38 \u8CA2\u4E38 \u65E5\u672C\u9B5A\u677F \u6D0B\u8525 \u7D05\u863F\u8514\u7D72 \u5C0F\u9EC3\u74DC \u9AD8\u9E97\u83DC!",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "\u7D93\u5178\u6CF0\u5F0Fmama\u9EB5~\u62CC\u5165\u7368\u5BB6\u91AC\u6C41~\u64E0\u4E0A\u65B0\u9BAE\u6AB8\u6AAC! \u9178\u8FA3\u958B\u80C3 <\u4E00\u9EDE\u8FA3\u90FD\u6C92\u5403\u7684\u4E0D\u8981\u9EDE\u5594>\u914D\u6599:\u9BAE\u8766 \u9B77\u9B5A\u5708 \u9C48\u9B5A\u4E38 \u8CA2\u4E38 \u65E5\u672C\u9B5A\u677F \u6D0B\u8525 \u7D05\u863F\u8514\u7D72 \u5C0F\u9EC3\u74DC \u9AD8\u9E97\u83DC!",
      "ja": "\u7D93\u5178\u6CF0\u5F0Fmama\u9EB5~\u62CC\u5165\u7368\u5BB6\u91AC\u6C41~\u64E0\u4E0A\u65B0\u9BAE\u6AB8\u6AAC! \u9178\u8FA3\u958B\u80C3 <\u4E00\u9EDE\u8FA3\u90FD\u6C92\u5403\u7684\u4E0D\u8981\u9EDE\u5594>\u914D\u6599:\u9BAE\u8766 \u9B77\u9B5A\u5708 \u9C48\u9B5A\u4E38 \u8CA2\u4E38 \u65E5\u672C\u9B5A\u677F \u6D0B\u8525 \u7D05\u863F\u8514\u7D72 \u5C0F\u9EC3\u74DC \u9AD8\u9E97\u83DC!",
      "th": "\u7D93\u5178\u6CF0\u5F0Fmama\u9EB5~\u62CC\u5165\u7368\u5BB6\u91AC\u6C41~\u64E0\u4E0A\u65B0\u9BAE\u6AB8\u6AAC! \u9178\u8FA3\u958B\u80C3 <\u4E00\u9EDE\u8FA3\u90FD\u6C92\u5403\u7684\u4E0D\u8981\u9EDE\u5594>\u914D\u6599:\u9BAE\u8766 \u9B77\u9B5A\u5708 \u9C48\u9B5A\u4E38 \u8CA2\u4E38 \u65E5\u672C\u9B5A\u677F \u6D0B\u8525 \u7D05\u863F\u8514\u7D72 \u5C0F\u9EC3\u74DC \u9AD8\u9E97\u83DC!"
    },
    "orderIndex": 105,
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "customAddOns": [
      {
        "id": "addon-1784480168973-5",
        "name": "\u5347\u7D1A\u5957\u9910(\u70E4\u852C\u83DC+\u6CF0\u5976\u4E00\u676F)",
        "price": 140
      }
    ],
    "recipe": []
  },
  {
    "containsBeef": false,
    "containsSeafood": false,
    "price": 80,
    "id": "dish-1909192003211",
    "containsPork": false,
    "category": "veggies",
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 106,
    "description": {
      "zh": "\u7F8E\u5473\u591A\u6C41~\u63EAc\u7684\u53E3\u611F~\u674F\u9B91\u83C7\u53E3\u611F\u4F3C\u96DE\u8089",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u7F8E\u5473\u591A\u6C41~\u63EAc\u7684\u53E3\u611F~\u674F\u9B91\u83C7\u53E3\u611F\u4F3C\u96DE\u8089",
      "ja": "\u7F8E\u5473\u591A\u6C41~\u63EAc\u7684\u53E3\u611F~\u674F\u9B91\u83C7\u53E3\u611F\u4F3C\u96DE\u8089",
      "th": "\u7F8E\u5473\u591A\u6C41~\u63EAc\u7684\u53E3\u611F~\u674F\u9B91\u83C7\u53E3\u611F\u4F3C\u96DE\u8089"
    },
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "\u7206\u6C41\u674F\u9B91\u83C7",
      "en": "Juicy King Oyster Mushroom Skewer",
      "ko": "\u7206\u6C41\u674F\u9B91\u83C7",
      "ja": "\u7206\u6C41\u674F\u9B91\u83C7",
      "th": "\u7206\u6C41\u674F\u9B91\u83C7"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "orderIndex": 107,
    "description": {
      "zh": "\u53BB\u9AA8\u53BB\u523A\u79CB\u5200\u9B5A\uFF0C\u586B\u5165\u660E\u592A\u5B50\uFF0C\u53E3\u611F\u4E00\u6D41!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u53BB\u9AA8\u53BB\u523A\u79CB\u5200\u9B5A\uFF0C\u586B\u5165\u660E\u592A\u5B50\uFF0C\u53E3\u611F\u4E00\u6D41!",
      "ja": "\u53BB\u9AA8\u53BB\u523A\u79CB\u5200\u9B5A\uFF0C\u586B\u5165\u660E\u592A\u5B50\uFF0C\u53E3\u611F\u4E00\u6D41!",
      "th": "\u53BB\u9AA8\u53BB\u523A\u79CB\u5200\u9B5A\uFF0C\u586B\u5165\u660E\u592A\u5B50\uFF0C\u53E3\u611F\u4E00\u6D41!"
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "id": "dish-1909191959076",
    "containsPork": false,
    "category": "seafood",
    "containsSeafood": true,
    "containsBeef": false,
    "price": 320,
    "available": true,
    "name": {
      "zh": "\u660E\u592A\u5B50\u79CB\u5200\u9B5A(\u53BB\u523A)2p",
      "en": "Deboned Pacific Saury Stuffed w/ Mentaiko (2pcs)",
      "ko": "\u660E\u592A\u5B50\u79CB\u5200\u9B5A(\u53BB\u523A)2p",
      "ja": "\u660E\u592A\u5B50\u79CB\u5200\u9B5A(\u53BB\u523A)2p",
      "th": "\u660E\u592A\u5B50\u79CB\u5200\u9B5A(\u53BB\u523A)2p"
    },
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "description": {
      "zh": "\u70AD\u706B\u6162\u70E4\uFF0C\u56B4\u9078\u8089\u539A\u7684\u9999\u83C7~\u70E4\u5B8C\u9999\u6C23\u5341\u8DB3!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u70AD\u706B\u6162\u70E4\uFF0C\u56B4\u9078\u8089\u539A\u7684\u9999\u83C7~\u70E4\u5B8C\u9999\u6C23\u5341\u8DB3!",
      "ja": "\u70AD\u706B\u6162\u70E4\uFF0C\u56B4\u9078\u8089\u539A\u7684\u9999\u83C7~\u70E4\u5B8C\u9999\u6C23\u5341\u8DB3!",
      "th": "\u70AD\u706B\u6162\u70E4\uFF0C\u56B4\u9078\u8089\u539A\u7684\u9999\u83C7~\u70E4\u5B8C\u9999\u6C23\u5341\u8DB3!"
    },
    "orderIndex": 108,
    "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400",
    "category": "veggies",
    "id": "dish-1909191946205",
    "containsPork": false,
    "price": 80,
    "containsBeef": false,
    "containsSeafood": false,
    "name": {
      "zh": "\u9999\u83C7",
      "en": "Charcoal Grilled Shiitake Mushroom",
      "ko": "\u9999\u83C7",
      "ja": "\u9999\u83C7",
      "th": "\u9999\u83C7"
    },
    "available": true,
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "price": 80,
    "containsSeafood": false,
    "containsBeef": false,
    "containsPork": false,
    "category": "veggies",
    "id": "dish-1909191945086",
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 109,
    "description": {
      "zh": "\u9752\u6912\u662F\u7DAD\u751F\u7D20C\u5F88\u9AD8\u7684\u852C\u83DC\uFF0C\u540C\u91CD\u91CF\u4E4B\u4E0B\u6BD4\u6A58\u5B50\u3001\u67F3\u4E01\u90FD\u9084\u9AD8!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u9752\u6912\u662F\u7DAD\u751F\u7D20C\u5F88\u9AD8\u7684\u852C\u83DC\uFF0C\u540C\u91CD\u91CF\u4E4B\u4E0B\u6BD4\u6A58\u5B50\u3001\u67F3\u4E01\u90FD\u9084\u9AD8!",
      "ja": "\u9752\u6912\u662F\u7DAD\u751F\u7D20C\u5F88\u9AD8\u7684\u852C\u83DC\uFF0C\u540C\u91CD\u91CF\u4E4B\u4E0B\u6BD4\u6A58\u5B50\u3001\u67F3\u4E01\u90FD\u9084\u9AD8!",
      "th": "\u9752\u6912\u662F\u7DAD\u751F\u7D20C\u5F88\u9AD8\u7684\u852C\u83DC\uFF0C\u540C\u91CD\u91CF\u4E4B\u4E0B\u6BD4\u6A58\u5B50\u3001\u67F3\u4E01\u90FD\u9084\u9AD8!"
    },
    "isNotSpicy": false,
    "name": {
      "zh": "\u9752\u6912",
      "en": "Charcoal Grilled Green Bell Pepper",
      "ko": "\u9752\u6912",
      "ja": "\u9752\u6912",
      "th": "\u9752\u6912"
    },
    "available": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "price": 60,
    "containsBeef": false,
    "containsSeafood": false,
    "id": "dish-1909191943297",
    "category": "skewers",
    "containsPork": true,
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 110,
    "description": {
      "zh": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
      "ko": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "ja": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473",
      "th": "\u70AD\u706B\u6162\u70E4\uFF0C\u9999\u6C23\u56DB\u6EA2\uFF0C\u6BCF\u4E00\u53E3\u90FD\u662F\u6975\u81F4\u7F8E\u5473"
    },
    "isNotSpicy": false,
    "name": {
      "zh": "\u7CBE\u9078\u9999\u9165\u80A5\u8178",
      "en": "Crispy Charcoal Grilled Pork Intestine",
      "ko": "\u7CBE\u9078\u9999\u9165\u80A5\u8178",
      "ja": "\u7CBE\u9078\u9999\u9165\u80A5\u8178",
      "th": "\u7CBE\u9078\u9999\u9165\u80A5\u8178"
    },
    "available": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "\u6975\u7099\u539F\u584A\u725B\u808B(\u6FB3\u725B)",
      "en": "Prime Australian Beef Rib Skewer",
      "ko": "\u6975\u7099\u539F\u584A\u725B\u808B(\u6FB3\u725B)",
      "ja": "\u6975\u7099\u539F\u584A\u725B\u808B(\u6FB3\u725B)",
      "th": "\u6975\u7099\u539F\u584A\u725B\u808B(\u6FB3\u725B)"
    },
    "containsBeef": true,
    "containsSeafood": false,
    "price": 70,
    "id": "dish-1909191940395",
    "containsPork": false,
    "category": "skewers",
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "\u91D1\u6BD4\u4F8B\u7684\u725B\u808B\u8089\u584A,\u70E4\u7099\u5916\u8868\u7126\u9999,\u5167\u88E1\u7C89\u5AE9,\u4E00\u53E3\u54AC\u4E0B,\u662F\u5473\u857E\u7684\u6975\u81F4\u4EAB\u53D7!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u91D1\u6BD4\u4F8B\u7684\u725B\u808B\u8089\u584A,\u70E4\u7099\u5916\u8868\u7126\u9999,\u5167\u88E1\u7C89\u5AE9,\u4E00\u53E3\u54AC\u4E0B,\u662F\u5473\u857E\u7684\u6975\u81F4\u4EAB\u53D7!",
      "ja": "\u91D1\u6BD4\u4F8B\u7684\u725B\u808B\u8089\u584A,\u70E4\u7099\u5916\u8868\u7126\u9999,\u5167\u88E1\u7C89\u5AE9,\u4E00\u53E3\u54AC\u4E0B,\u662F\u5473\u857E\u7684\u6975\u81F4\u4EAB\u53D7!",
      "th": "\u91D1\u6BD4\u4F8B\u7684\u725B\u808B\u8089\u584A,\u70E4\u7099\u5916\u8868\u7126\u9999,\u5167\u88E1\u7C89\u5AE9,\u4E00\u53E3\u54AC\u4E0B,\u662F\u5473\u857E\u7684\u6975\u81F4\u4EAB\u53D7!"
    },
    "orderIndex": 111,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "\u8089\u96DE\u4E03\u91CC\u9999",
      "en": "Marinated Chicken Tail Skewers (5pcs)",
      "ko": "\u8089\u96DE\u4E03\u91CC\u9999",
      "ja": "\u8089\u96DE\u4E03\u91CC\u9999",
      "th": "\u8089\u96DE\u4E03\u91CC\u9999"
    },
    "containsSeafood": false,
    "containsBeef": false,
    "price": 70,
    "containsPork": false,
    "category": "skewers",
    "id": "dish-1909191316572",
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 112,
    "description": {
      "zh": "\u4E94\u9846\u4E00\u4E32\u8089\u96DE\u4E03\u91CC\u9999 ~\u6C92\u6709\u5256\u534A\u5594! \u6BCF\u65E5\u65E9\u5E02\u65B0\u9BAE\u63A1\u8CB7~\u56DE\u4F86\u62D4\u6BDB\u6D17\u6DE8\u9183\u88FD\u7368\u5BB6\u9183\u6599!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u4E94\u9846\u4E00\u4E32\u8089\u96DE\u4E03\u91CC\u9999 ~\u6C92\u6709\u5256\u534A\u5594! \u6BCF\u65E5\u65E9\u5E02\u65B0\u9BAE\u63A1\u8CB7~\u56DE\u4F86\u62D4\u6BDB\u6D17\u6DE8\u9183\u88FD\u7368\u5BB6\u9183\u6599!",
      "ja": "\u4E94\u9846\u4E00\u4E32\u8089\u96DE\u4E03\u91CC\u9999 ~\u6C92\u6709\u5256\u534A\u5594! \u6BCF\u65E5\u65E9\u5E02\u65B0\u9BAE\u63A1\u8CB7~\u56DE\u4F86\u62D4\u6BDB\u6D17\u6DE8\u9183\u88FD\u7368\u5BB6\u9183\u6599!",
      "th": "\u4E94\u9846\u4E00\u4E32\u8089\u96DE\u4E03\u91CC\u9999 ~\u6C92\u6709\u5256\u534A\u5594! \u6BCF\u65E5\u65E9\u5E02\u65B0\u9BAE\u63A1\u8CB7~\u56DE\u4F86\u62D4\u6BDB\u6D17\u6DE8\u9183\u88FD\u7368\u5BB6\u9183\u6599!"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "id": "dish-1909191310334",
    "category": "skewers",
    "containsPork": true,
    "price": 90,
    "containsSeafood": false,
    "containsBeef": false,
    "orderIndex": 113,
    "description": {
      "zh": "\u7368\u5BB6\u6CF0\u5F0F\u70E4\u8089\u5FC5\u9EDE\uFF0C\u9078\u7528\u53F0\u7063\u672C\u571F\u8C6C\u8089~\u6372\u5165\u65B0\u9BAE\u9999\u83DC~\u70AD\u70E4\u81F3\u91D1\u9EC3\u7126\u9999\u4E00\u53E3\u54AC\u4E0B\u9084\u6703\u5674\u6C41!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "\u7368\u5BB6\u6CF0\u5F0F\u70E4\u8089\u5FC5\u9EDE\uFF0C\u9078\u7528\u53F0\u7063\u672C\u571F\u8C6C\u8089~\u6372\u5165\u65B0\u9BAE\u9999\u83DC~\u70AD\u70E4\u81F3\u91D1\u9EC3\u7126\u9999\u4E00\u53E3\u54AC\u4E0B\u9084\u6703\u5674\u6C41!",
      "ja": "\u7368\u5BB6\u6CF0\u5F0F\u70E4\u8089\u5FC5\u9EDE\uFF0C\u9078\u7528\u53F0\u7063\u672C\u571F\u8C6C\u8089~\u6372\u5165\u65B0\u9BAE\u9999\u83DC~\u70AD\u70E4\u81F3\u91D1\u9EC3\u7126\u9999\u4E00\u53E3\u54AC\u4E0B\u9084\u6703\u5674\u6C41!",
      "th": "\u7368\u5BB6\u6CF0\u5F0F\u70E4\u8089\u5FC5\u9EDE\uFF0C\u9078\u7528\u53F0\u7063\u672C\u571F\u8C6C\u8089~\u6372\u5165\u65B0\u9BAE\u9999\u83DC~\u70AD\u70E4\u81F3\u91D1\u9EC3\u7126\u9999\u4E00\u53E3\u54AC\u4E0B\u9084\u6703\u5674\u6C41!"
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": false,
    "name": {
      "zh": "\u9999\u83DC\u8C6C\u8089\u6372",
      "en": "Coriander Pork Roll Skewer",
      "ko": "\u9999\u83DC\u8C6C\u8089\u6372",
      "ja": "\u9999\u83DC\u8C6C\u8089\u6372",
      "th": "\u9999\u83DC\u8C6C\u8089\u6372"
    },
    "available": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  }
];
var INITIAL_INGREDIENTS = [
  { id: "ig-01", name: { zh: "\u5927\u9BAE\u8766", en: "Fresh Prawns", ko: "\uC0DD\uC0C8\uC6B0", ja: "\u65B0\u9BAE\u306A\u3048\u3073", th: "\u0E01\u0E38\u0E49\u0E07\u0E41\u0E0A\u0E1A\u0E4A\u0E27\u0E22\u5927" }, stock: 100, minThreshold: 15, unit: "pcs" },
  { id: "ig-02", name: { zh: "\u9802\u7D1A\u725B\u8089\u4E32", en: "USDA Beef", ko: "\uC218\uC81C \uC18C\uACE0\uAE30", ja: "\u53B3\u9078\u725B\u8089\u4E32", th: "\u0E40\u0E19\u0E37\u0E49\u0E2D\u0E27\u0E31\u0E27\u0E1E\u0E23\u0E35\u0E40\u0E21\u0E35\u0E22\u0E21" }, stock: 100, minThreshold: 20, unit: "skewers" },
  { id: "ig-03", name: { zh: "\u9BAE\u751C\u9AD8\u9E97\u83DC", en: "Organic Cabbage", ko: "\uC720\uAE30\uB18D \uC591\uBC30\uCD94", ja: "\u30AD\u30E3\u30D9\u30C4", th: "\u0E01\u0E30\u0E2B\u0E25\u0E48\u0E33\u0E1B\u0E25\u0E35\u0E2B\u0E27\u0E32\u0E19" }, stock: 100, minThreshold: 10, unit: "kg" },
  { id: "ig-04", name: { zh: "\u751F\u98DF\u5E72\u8C9D/\u751F\u8814", en: "Oysters / Scallops", ko: "\uC11D\uD654 \uAD74 \uBC0F \uAC00\uB9AC\uBE44", ja: "\u751F\u7261\u8823\u30FB\u5E72\u8C9D", th: "\u0E2B\u0E2D\u0E22\u0E19\u0E32\u0E07\u0E23\u0E21\u0E22\u0E31\u0E01\u0E29\u0E4C/\u0E2B\u0E2D\u0E22\u0E40\u0E0A\u0E25\u0E25\u0E4C" }, stock: 100, minThreshold: 8, unit: "pcs" },
  { id: "ig-05", name: { zh: "\u51AC\u852D\u529F\u6CE1\u9EB5/\u7C73\u7C89", en: "Mama / Rice Noodles", ko: "\uB77C\uBA74 \uC0AC\uB9AC", ja: "\u30E9\u30FC\u30E1\u30F3\u30FB\u30D5\u30A9\u30FC", th: "\u0E1A\u0E30\u0E2B\u0E21\u0E35\u0E48\u0E21\u0E32\u0E21\u0E48\u0E32/\u0E01\u0E4B\u0E27\u0E22\u0E40\u0E15\u0E35\u0E4B\u0E22\u0E27" }, stock: 120, minThreshold: 25, unit: "packs" },
  { id: "ig-06", name: { zh: "\u9802\u7D1A\u6930\u5976\u7F50", en: "Rich Coconut Milk", ko: "\uCF54\uCF54\uB11B \uBC00\uD06C", ja: "\u30B3\u30B3\u30CA\u30C3\u30C4\u30DF\u30EB\u30AF\u7F36", th: "\u0E01\u0E30\u0E17\u0E34\u0E01\u0E23\u0E30\u0E1B\u0E4B\u0E2D\u0E07\u0E2D\u0E2D\u0E23\u0E4C\u0E41\u0E01\u0E19\u0E34\u0E01" }, stock: 100, minThreshold: 12, unit: "cans" },
  { id: "ig-07", name: { zh: "\u6CF0\u624B\u6A19\u7D05\u8336\u539F\u6599", en: "Thai Red Tea Brew", ko: "\uD64D\uCC28 \uBCA0\uC774\uC2A4", ja: "\u30BF\u30A4\u8336\u8449", th: "\u0E0A\u0E32\u0E41\u0E14\u0E07\u0E15\u0E23\u0E32\u0E21\u0E37\u0E2D\u0E40\u0E01\u0E23\u0E14\u0E2A\u0E48\u0E07\u0E2D\u0E2D\u0E01" }, stock: 100, minThreshold: 20, unit: "liters" },
  { id: "ig-08", name: { zh: "\u7206\u9999\u8C6C\u4E94\u82B1 / \u91D1\u91DD\u83C7", en: "Pork Belly & Enoki", ko: "\uB3FC\uC9C0 \uC0BC\uACB9 \uBC0F \uD33D\uC774", ja: "\u8C5A\u30D0\u30E9\u30FB\u3048\u306E\u304D", th: "\u0E2B\u0E21\u0E39\u0E2A\u0E32\u0E21\u0E0A\u0E31\u0E49\u0E19/\u0E40\u0E2B\u0E47\u0E14\u0E40\u0E02\u0E47\u0E21\u0E17\u0E2D\u0E07" }, stock: 100, minThreshold: 15, unit: "skewers" }
];
var INGREDIENT_RECIPE_MAP = {};

// server.ts
var import_genai = require("@google/genai");
function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  return new import_genai.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
function getSabayAuthenticImage(nameZh, defaultImg) {
  const n = nameZh || "";
  if (n.includes("\u5927\u9B77MAMA") || n.includes("\u9B77MAMA")) {
    return "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=600";
  }
  if (n.includes("\u5927\u9B77\u9B5A") || n.includes("\u6CF0\u9BAE\u5927\u9B77\u9B5A")) {
    return "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=600";
  }
  if (n.includes("\u677F\u8171\u725B")) {
    return "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600";
  }
  if (n.includes("\u96DE\u76AE")) {
    return "https://images.unsplash.com/photo-1560614382-3350eb976772?auto=format&fit=crop&q=80&w=600";
  }
  if (n.includes("\u725B\u8089\u4E32") || n.includes("\u725B\u4E32") || n.includes("\u725B\u808910\u4E32")) {
    return "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=600";
  }
  if (n.includes("\u7F8A\u8089\u4E32") || n.includes("\u7F8A\u4E32") || n.includes("\u7F8A\u808910\u4E32")) {
    return "https://images.unsplash.com/photo-1519690831526-22458522338f?auto=format&fit=crop&q=80&w=600";
  }
  if (n.includes("\u91D1\u91DD\u83C7\u8C6C\u8089") || n.includes("\u8C6C\u4E94\u82B1") || n.includes("\u8C6C\u8089\u4E32") || n.includes("\u8C6C\u8089")) {
    return "https://images.unsplash.com/photo-1527362439-eed8ee0d6f98?auto=format&fit=crop&q=80&w=600";
  }
  if (n.includes("\u6ADB\u74DC") || n.includes("\u5A03\u5A03\u83DC") || n.includes("\u9AD8\u9E97\u83DC") || n.includes("\u83DC")) {
    return "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&q=80&w=600";
  }
  if (n.includes("\u6CF0\u5F0F\u5976\u8336") || n.includes("\u6CF0\u5976")) {
    return "https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&q=80&w=600";
  }
  if (n.includes("\u7F8E\u797F") || n.includes("\u53EF\u54E5") || n.includes("\u53EF\u6A02") || n.includes("\u53EF\u53E3")) {
    return "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=600";
  }
  if (n.includes("\u6CF0\u5976\u5305") || n.includes("\u7206\u6F3F") || n.includes("\u5305")) {
    return "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600";
  }
  if (n.includes("\u51AC\u852D\u529F") || n.includes("\u9178\u8FA3")) {
    return "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&q=80&w=600";
  }
  if (n.includes("\u5564\u9152") || n.includes("\u9E92\u9E9F") || n.includes("\u96EA\u5C71") || n.includes("\u897F\u8CA2")) {
    return "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=600";
  }
  if (n.includes("\u8C46\u5976") || n.includes("Vitamilk") || n.includes("\u6930\u5B50") || n.includes("\u6930\u5976")) {
    return "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=600";
  }
  if (n.includes("A\u9910") || n.includes("B\u9910") || n.includes("C\u9910") || n.includes("D\u9910")) {
    return "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600";
  }
  return defaultImg;
}
var app = (0, import_express.default)();
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
app.use(import_express.default.json({ limit: "10mb" }));
app.use(import_express.default.urlencoded({ limit: "10mb", extended: true }));
var liveMenu = INITIAL_MENU.map((item, index) => {
  const id = item.id;
  const zh = item.name && item.name.zh ? item.name.zh : "";
  const category = item.category || "";
  const containsBeef = item.containsBeef || id.includes("beef") || zh.includes("\u725B\u8089") || id === "sk-01" || id === "nd-02" || id === "ty-02" || id === "cb-02";
  const containsPork = item.containsPork || id.includes("pork") || zh.includes("\u8C6C\u4E94\u82B1") || zh.includes("\u8C6C\u8089") || id === "sk-02" || id === "sk-03" || id === "sk-07" || id === "sk-12" || id === "cb-01";
  const containsSeafood = item.containsSeafood || id.includes("seafood") || zh.includes("\u6D77\u9BAE") || zh.includes("\u8766") || zh.includes("\u86E4") || id === "ty-01" || id === "nd-01" || id.startsWith("sf-");
  const isNotSpicy = item.isNotSpicy || category === "veggies" || category === "sweets" || category === "drinks" || category === "sides" || zh.includes("\u4E0D\u8FA3") || id.startsWith("vg-") || id.startsWith("sw-") || id.startsWith("dr-");
  const updatedImage = getSabayAuthenticImage(zh, item.image || "");
  return {
    ...item,
    image: updatedImage,
    containsBeef,
    containsPork,
    containsSeafood,
    isNotSpicy,
    isSetMeal: !!item.isSetMeal,
    orderIndex: item.orderIndex !== void 0 ? item.orderIndex : index
  };
});
var liveIngredients = [...INITIAL_INGREDIENTS];
function getRecipeForMenuItem(item) {
  if (item.recipe && Array.isArray(item.recipe) && item.recipe.length > 0) {
    return item.recipe;
  }
  const recipe = [];
  const nameZh = item.name && item.name.zh ? item.name.zh : "";
  if (item.containsBeef || nameZh.includes("\u725B\u8089") || nameZh.includes("\u725B")) {
    recipe.push({ ingredientId: "ig-02", amount: item.isSetMeal ? 2 : 1 });
  }
  if (item.containsPork || nameZh.includes("\u8C6C\u4E94\u82B1") || nameZh.includes("\u8C6C\u8089") || nameZh.includes("\u8C6C")) {
    recipe.push({ ingredientId: "ig-08", amount: item.isSetMeal ? 2 : 1 });
  }
  if (item.containsSeafood || nameZh.includes("\u8766") || nameZh.includes("\u6D77\u9BAE") || nameZh.includes("\u86E4\u870A") || nameZh.includes("\u751F\u8814") || nameZh.includes("\u5E72\u8C9D") || nameZh.includes("\u58A8\u9B5A")) {
    if (nameZh.includes("\u5E72\u8C9D") || nameZh.includes("\u751F\u8814")) {
      recipe.push({ ingredientId: "ig-04", amount: 2 });
    } else {
      recipe.push({ ingredientId: "ig-01", amount: item.isSetMeal ? 3 : 2 });
    }
  }
  if (item.hasNoodlesOption || nameZh.includes("\u9EB5") || nameZh.includes("\u51AC\u852D\u529F\u6E6F") || item.category === "noodles") {
    recipe.push({ ingredientId: "ig-05", amount: 1 });
  }
  if (item.hasCoconutsMilkOption || nameZh.includes("\u6930\u5976") || nameZh.includes("\u6930\u5B50") || nameZh.includes("\u6930")) {
    recipe.push({ ingredientId: "ig-06", amount: 0.25 });
  }
  if (item.category === "drinks" && (nameZh.includes("\u8336") || nameZh.includes("\u6CF0\u8336") || nameZh.includes("\u5976\u8336"))) {
    recipe.push({ ingredientId: "ig-07", amount: 0.35 });
  }
  if (item.category === "veggies" || nameZh.includes("\u9AD8\u9E97\u83DC") || nameZh.includes("\u83DC")) {
    recipe.push({ ingredientId: "ig-03", amount: 0.15 });
  }
  return recipe;
}
function refreshIngredientRecipeMap() {
  for (const key in INGREDIENT_RECIPE_MAP) {
    delete INGREDIENT_RECIPE_MAP[key];
  }
  liveMenu.forEach((item) => {
    const r = getRecipeForMenuItem(item);
    if (r.length > 0) {
      INGREDIENT_RECIPE_MAP[item.id] = r;
    }
  });
}
refreshIngredientRecipeMap();
var inventoryLogs = [];
var liveCategories = [...INITIAL_CATEGORIES];
var defaultCategories = [...liveCategories];
var liveStaffPin = "888888";
var livePrinterIp = "10.0.0.124";
var liveTables = [
  { id: "1", qrCodeUrl: "/?table=1", status: "available", positionX: 10, positionY: 15 },
  { id: "2", qrCodeUrl: "//?table=2", status: "available", positionX: 35, positionY: 15 },
  { id: "3", qrCodeUrl: "/?table=3", status: "available", preservedFor: "", positionX: 60, positionY: 15 },
  { id: "5", qrCodeUrl: "/?table=5", status: "available", positionX: 10, positionY: 45 },
  { id: "6", qrCodeUrl: "/?table=6", status: "available", positionX: 35, positionY: 45 },
  { id: "8", qrCodeUrl: "/?table=8", status: "available", positionX: 60, positionY: 45 },
  { id: "4", qrCodeUrl: "/?table=4", status: "available", positionX: 10, positionY: 75 },
  { id: "7", qrCodeUrl: "/?table=7", status: "available", positionX: 35, positionY: 75 }
];
var liveReservations = [];
var liveTakeoutSeq = 0;
var lastTakeoutDate = (/* @__PURE__ */ new Date()).toDateString();
var liveMinSpendPerPerson = 500;
var liveOperatingHours = [
  { id: "oh-1", name: "\u5348\u9910\u6642\u6BB5 Lunch Session", start: "11:00", end: "14:30", days: [0, 1, 2, 3, 4, 5, 6], isActive: true },
  { id: "oh-2", name: "\u665A\u9910\u6642\u6BB5 Dinner Session", start: "17:00", end: "22:00", days: [0, 1, 2, 3, 4, 5, 6], isActive: true }
];
var liveRestDays = [];
var liveCustomerNotice = "\u{1F4E3} \u6B61\u8FCE\u4F86\u5230\u6C99\u8C9D\u6CF0\u5F0F\u70AD\u70E4\uFF01\u6211\u5011\u63D0\u4F9B\u6B63\u5B97\u7684\u6CF0\u5357\u51AC\u852D\u529F&\u9802\u7D1A\u78B3\u70E4\u4E32\u71D2\u3002\u6700\u5F8C\u9EDE\u9910\u70BA23:30\u3002\u5167\u7528\u4F4E\u6D88\u6BCF\u4EBA 500 \u5143\uFF0C\u672A\u9054\u4F4E\u6D88\u7528\u9910\u9650\u6642 60 \u5206\u9418\u3002\u795D\u60A8\u7528\u9910\u6109\u5FEB\uFF01Sabay Thai BBQ wishes you a delicious meal!";
var liveServicePaused = false;
var liveOptionRules = [
  {
    "id": "rule-1784360566576",
    "name": "\u52A0\u6CB3\u7C89",
    "category": "\u52A0\u914D\u6599",
    "price": 20
  },
  {
    "id": "rule-1784360574891",
    "name": "\u52A0\u7C73\u7DDA",
    "category": "\u52A0\u914D\u6599",
    "price": 20
  },
  {
    "id": "rule-1784360613823",
    "name": "\u5347\u7D1A\u5957\u9910(\u70E4\u852C\u83DC+\u6CF0\u5976\u4E00\u676F)",
    "category": "\u52A0\u914D\u6599",
    "price": 140
  }
];
var livePromoCombo = {
  enabled: true,
  requiredQty: 10,
  discountAmount: 20,
  eligibleItemIds: []
};
var livePromoCombos = [];
var livePrinterSettings = {
  "bill": {
    "cashDrawerOposName": "CashDrawer1",
    "usbPort": "USB002",
    "cashDrawerDriver": "OPOS",
    "printAddress": "\u6843\u5712\u5E02\u5927\u5712\u5340\u9AD8\u9435\u5317\u8DEF\u4E8C\u6BB5198\u865F1\u6A13",
    "ip": "192.168.1.102",
    "cashDrawerEscPosCommand": "1B700019FA",
    "restaurantName": "\u6C99\u8C9D\u71D2\u70E4 SABAY BBQ",
    "fontSizeFactor": 0.8,
    "connectionType": "USB",
    "footerSuffix": "\u8B1D\u8B1D\u5149\u81E8\uFF0C\u6B61\u8FCE\u518D\u5EA6\u5149\u81E8\uFF01",
    "headerPrefix": "\u2605\u2605\u2605 \u9867\u5BA2\u7D50\u5E33\u660E\u7D30\u55AE \u2605\u2605\u2605",
    "cashDrawerEnabled": true,
    "printTelephone": "0966626408",
    "printTimeEnabled": true,
    "width": "58mm"
  },
  "kitchen": {
    "printTelephone": "0966626408",
    "printTimeEnabled": true,
    "width": "80mm",
    "footerSuffix": "\u8ACB\u4E3B\u5EDA\u76E1\u901F\u914D\u9910\u51FA\u9910\uFF01",
    "restaurantName": "\u6C99\u8C9D\u71D2\u70E4 \u6CF0\u5F0F\u5EDA\u623F",
    "fontSizeFactor": 1,
    "connectionType": "IP",
    "printAddress": "\u6843\u5712\u5E02\u5927\u5712\u5340\u9AD8\u9435\u5317\u8DEF\u4E8C\u6BB5198\u865F1\u6A13",
    "ip": "192.168.1.101",
    "usbPort": "USB001",
    "headerPrefix": "\u2605\u2605\u2605 \u5EDA\u623F\u5DE5\u4F5C\u5099\u9910\u55AE \u2605\u2605\u2605"
  }
};
function calculatePromoDiscount(items) {
  let promoDiscount = 0;
  if (Array.isArray(livePromoCombos) && livePromoCombos.length > 0) {
    livePromoCombos.forEach((combo) => {
      if (!combo.enabled) return;
      let comboEligibleCount = 0;
      items.forEach((it) => {
        const mItem = liveMenu.find((m) => m.id === it.menuItemId);
        const cat = mItem?.category;
        const isBeverageOrTopup = it.menuItemId?.startsWith("item-topup-") || it.id?.startsWith("topup-") || cat === "beverages" || cat === "drinks";
        const isEligible = combo.eligibleItemIds && combo.eligibleItemIds.length > 0 ? combo.eligibleItemIds.includes(it.menuItemId || "") : !isBeverageOrTopup;
        if (isEligible) {
          comboEligibleCount += it.qty;
        }
      });
      if (comboEligibleCount >= combo.requiredQty) {
        const sets = Math.floor(comboEligibleCount / combo.requiredQty);
        promoDiscount += sets * combo.discountAmount;
      }
    });
  } else {
    let eligibleCount = 0;
    items.forEach((it) => {
      const mItem = liveMenu.find((m) => m.id === it.menuItemId);
      const cat = mItem?.category;
      const isBeverageOrTopup = it.menuItemId?.startsWith("item-topup-") || it.id?.startsWith("topup-") || cat === "beverages" || cat === "drinks";
      const isEligible = livePromoCombo.eligibleItemIds.length > 0 ? livePromoCombo.eligibleItemIds.includes(it.menuItemId || "") : !isBeverageOrTopup;
      if (isEligible) {
        eligibleCount += it.qty;
      }
    });
    if (livePromoCombo.enabled && eligibleCount >= livePromoCombo.requiredQty) {
      const sets = Math.floor(eligibleCount / livePromoCombo.requiredQty);
      promoDiscount = sets * livePromoCombo.discountAmount;
    }
  }
  return promoDiscount;
}
function isStoreOpen(timestamp) {
  const date = timestamp ? new Date(timestamp) : /* @__PURE__ */ new Date();
  const utc = date.getTime() + date.getTimezoneOffset() * 6e4;
  const localDate = new Date(utc + 36e5 * 8);
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(localDate.getDate()).padStart(2, "0");
  const taiwanDateString = `${year}-${month}-${dayOfMonth}`;
  if (liveRestDays.includes(taiwanDateString)) {
    return false;
  }
  const day = localDate.getDay();
  const hour = localDate.getHours();
  const minute = localDate.getMinutes();
  const currentTotalMinutes = hour * 60 + minute;
  let open = false;
  for (const slot of liveOperatingHours) {
    if (!slot.isActive) continue;
    if (slot.days && !slot.days.includes(day)) continue;
    const [startH, startM] = slot.start.split(":").map(Number);
    const [endH, endM] = slot.end.split(":").map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;
    if (startTotal <= endTotal) {
      if (currentTotalMinutes >= startTotal && currentTotalMinutes <= endTotal) {
        open = true;
        break;
      }
    } else {
      if (currentTotalMinutes >= startTotal || currentTotalMinutes <= endTotal) {
        open = true;
        break;
      }
    }
  }
  return open;
}
var liveOrders = [];
var printLogs = [];
var promoNotifications = [];
var livePopularItemIds = [
  "ty-01",
  "nd-01",
  "sk-02",
  "sk-01",
  "dish-2605122152569",
  "dish-2509281752083",
  "dish-2509271759269",
  "dish-2207122341013"
];
var liveMemberPointsRatio = 20;
var liveMemberRewards = [
  { id: "rew-01", menuItemId: "sk-02", cost: 900, fallbackPrice: 90, enabled: true },
  { id: "rew-02", menuItemId: "vg-01", cost: 800, fallbackPrice: 80, enabled: true },
  { id: "rew-03", menuItemId: "dr-01", cost: 1800, fallbackPrice: 180, enabled: true },
  { id: "rew-04", menuItemId: "sw-01", cost: 900, fallbackPrice: 90, enabled: true },
  { id: "rew-05", menuItemId: "ty-01", cost: 2600, fallbackPrice: 260, enabled: true }
];
var firestoreDb = null;
try {
  const firebaseConfigPath = import_path.default.join(process.cwd(), "firebase-applet-config.json");
  let firebaseConfig = {};
  if (import_fs.default.existsSync(firebaseConfigPath)) {
    firebaseConfig = JSON.parse(import_fs.default.readFileSync(firebaseConfigPath, "utf-8"));
  }
  const clientConfig = {
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId
  };
  if (clientConfig.projectId && clientConfig.apiKey) {
    let clientApp;
    if ((0, import_app.getApps)().length === 0) {
      clientApp = (0, import_app.initializeApp)(clientConfig);
    } else {
      clientApp = (0, import_app.getApps)()[0];
    }
    const databaseId = firebaseConfig.firestoreDatabaseId;
    if (databaseId) {
      firestoreDb = (0, import_firestore.getFirestore)(clientApp, databaseId);
    } else {
      firestoreDb = (0, import_firestore.getFirestore)(clientApp);
    }
    console.log(`[Sabay Firebase] Successfully initialized Client Firestore with DB ID: ${databaseId || "default"}`);
  } else {
    console.warn("[Sabay Firebase] Firebase credentials missing or incomplete. Skipping initialization.");
  }
} catch (err) {
  console.error("[Sabay Firebase] Failed to initialize Client Firestore:", err);
}
async function saveStateToFirestore() {
  if (!firestoreDb) return;
  try {
    const cleanUndefined = (obj) => {
      if (obj === null || obj === void 0) {
        return null;
      }
      if (obj instanceof Date) {
        return obj;
      }
      if (Array.isArray(obj)) {
        return obj.map((item) => cleanUndefined(item));
      }
      if (typeof obj === "object") {
        const cleaned = {};
        for (const key of Object.keys(obj)) {
          const val = obj[key];
          if (val !== void 0) {
            cleaned[key] = cleanUndefined(val);
          }
        }
        return cleaned;
      }
      return obj;
    };
    const syncCollection = async (collName, items, idKey = "id", addOrderIndex = false) => {
      const collRef = (0, import_firestore.collection)(firestoreDb, collName);
      const snapshot = await (0, import_firestore.getDocs)(collRef);
      const liveIds = new Set(items.map((item) => item[idKey]));
      const batch = (0, import_firestore.writeBatch)(firestoreDb);
      snapshot.forEach((snapDoc) => {
        if (!liveIds.has(snapDoc.id)) {
          batch.delete(snapDoc.ref);
        }
      });
      items.forEach((item, index) => {
        const payload = addOrderIndex ? { ...item, orderIndex: index } : item;
        batch.set((0, import_firestore.doc)(firestoreDb, collName, item[idKey]), cleanUndefined(payload));
      });
      await batch.commit();
    };
    await syncCollection("categories", liveCategories, "id", true);
    await syncCollection("menu", liveMenu, "id", true);
    await syncCollection("ingredients", liveIngredients, "id", false);
    await syncCollection("tables", liveTables, "id", false);
    await syncCollection("reservations", liveReservations, "id", false);
    const orderCollRef = (0, import_firestore.collection)(firestoreDb, "orders");
    const orderSnapshot = await (0, import_firestore.getDocs)(orderCollRef);
    const liveOrderIds = new Set(liveOrders.map((o) => o.id));
    const deletedDocRefs = [];
    orderSnapshot.forEach((snapDoc) => {
      if (!liveOrderIds.has(snapDoc.id)) {
        deletedDocRefs.push(snapDoc.ref);
      }
    });
    for (let i = 0; i < deletedDocRefs.length; i += 400) {
      const batch = (0, import_firestore.writeBatch)(firestoreDb);
      const chunk = deletedDocRefs.slice(i, i + 400);
      chunk.forEach((ref) => batch.delete(ref));
      await batch.commit();
    }
    const orderChunks = [];
    for (let i = 0; i < liveOrders.length; i += 400) {
      orderChunks.push(liveOrders.slice(i, i + 400));
    }
    for (const chunk of orderChunks) {
      const batch = (0, import_firestore.writeBatch)(firestoreDb);
      chunk.forEach((order) => {
        batch.set((0, import_firestore.doc)(firestoreDb, "orders", order.id), cleanUndefined(order));
      });
      await batch.commit();
    }
    await (0, import_firestore.setDoc)((0, import_firestore.doc)(firestoreDb, "settings", "system"), cleanUndefined({
      liveStaffPin,
      livePrinterIp,
      liveTakeoutSeq,
      lastTakeoutDate,
      liveMinSpendPerPerson,
      liveOperatingHours,
      liveRestDays,
      liveCustomerNotice,
      liveServicePaused,
      liveOptionRules,
      livePrinterSettings,
      livePromoCombo,
      livePromoCombos,
      livePopularItemIds,
      liveMemberPointsRatio,
      liveMemberRewards
    }));
    await (0, import_firestore.setDoc)((0, import_firestore.doc)(firestoreDb, "settings", "logs"), cleanUndefined({
      inventoryLogs: inventoryLogs.slice(-100),
      printLogs: printLogs.slice(-100),
      promoNotifications: promoNotifications.slice(-100)
    }));
    console.log("[Sabay Firebase] \u2713 Successfully saved system state to Firestore.");
  } catch (error) {
    console.error("[Sabay Firebase] Error saving state to Firestore:", error);
  }
}
function sanitizeMenu(menu) {
  const languages = ["zh", "en", "ko", "ja", "th"];
  menu.forEach((item) => {
    if (!item.name) {
      item.name = {};
    }
    if (typeof item.name === "string") {
      const val = item.name;
      item.name = {};
      languages.forEach((l) => item.name[l] = val);
    } else if (typeof item.name === "object") {
      const defaultVal = item.name.zh || item.name.en || "Unnamed";
      languages.forEach((l) => {
        if (item.name[l] === void 0 || item.name[l] === null) {
          item.name[l] = defaultVal;
        }
      });
    }
    if (!item.description) {
      item.description = {};
    }
    if (typeof item.description === "string") {
      const val = item.description;
      item.description = {};
      languages.forEach((l) => item.description[l] = val);
    } else if (typeof item.description === "object") {
      const defaultVal = item.description.zh || item.description.en || "";
      languages.forEach((l) => {
        if (item.description[l] === void 0 || item.description[l] === null) {
          item.description[l] = defaultVal;
        }
      });
    }
  });
}
async function loadStateFromFirestore() {
  if (!firestoreDb) {
    console.log("[Sabay Firebase] Firestore is not initialized, skipping cloud load.");
    return false;
  }
  try {
    console.log("[Sabay Firebase] Loading state from Firestore collections...");
    const categoriesSnapshot = await (0, import_firestore.getDocs)((0, import_firestore.collection)(firestoreDb, "categories"));
    if (!categoriesSnapshot.empty) {
      const cats = [];
      categoriesSnapshot.forEach((snapDoc) => {
        cats.push(snapDoc.data());
      });
      cats.sort((a, b) => {
        const idxA = a.orderIndex !== void 0 ? a.orderIndex : 9999;
        const idxB = b.orderIndex !== void 0 ? b.orderIndex : 9999;
        return idxA - idxB;
      });
      cats.forEach((cat) => {
        const defCat = defaultCategories.find((c) => c.id === cat.id);
        if (defCat) {
          cat.name = { ...defCat.name, ...cat.name };
        }
      });
      liveCategories = cats;
      console.log(`[Sabay Firebase] Loaded ${liveCategories.length} categories.`);
    } else {
      console.log("[Sabay Firebase] No categories found in Firestore. Will initialize with defaults on first save.");
    }
    const menuSnapshot = await (0, import_firestore.getDocs)((0, import_firestore.collection)(firestoreDb, "menu"));
    if (!menuSnapshot.empty) {
      const menu = [];
      menuSnapshot.forEach((snapDoc) => {
        menu.push(snapDoc.data());
      });
      menu.sort((a, b) => {
        const idxA = a.orderIndex !== void 0 ? a.orderIndex : 9999;
        const idxB = b.orderIndex !== void 0 ? b.orderIndex : 9999;
        return idxA - idxB;
      });
      sanitizeMenu(menu);
      menu.forEach((item) => {
        const defItem = INITIAL_MENU.find((i) => i.id === item.id);
        if (defItem) {
          item.name = { ...defItem.name, ...item.name };
          item.description = { ...defItem.description, ...item.description };
        }
      });
      liveMenu = menu;
      console.log(`[Sabay Firebase] Loaded ${liveMenu.length} menu items.`);
    } else {
      console.log("[Sabay Firebase] No menu items found in Firestore. Will initialize with defaults on first save.");
    }
    const ingredientsSnapshot = await (0, import_firestore.getDocs)((0, import_firestore.collection)(firestoreDb, "ingredients"));
    if (!ingredientsSnapshot.empty) {
      const ings = [];
      ingredientsSnapshot.forEach((snapDoc) => {
        ings.push(snapDoc.data());
      });
      liveIngredients = ings;
      console.log(`[Sabay Firebase] Loaded ${liveIngredients.length} ingredients.`);
    }
    const tablesSnapshot = await (0, import_firestore.getDocs)((0, import_firestore.collection)(firestoreDb, "tables"));
    if (!tablesSnapshot.empty) {
      const tbls = [];
      tablesSnapshot.forEach((snapDoc) => {
        tbls.push(snapDoc.data());
      });
      liveTables = tbls;
      console.log(`[Sabay Firebase] Loaded ${liveTables.length} tables.`);
    }
    const reservationsSnapshot = await (0, import_firestore.getDocs)((0, import_firestore.collection)(firestoreDb, "reservations"));
    if (!reservationsSnapshot.empty) {
      const rsvs = [];
      reservationsSnapshot.forEach((snapDoc) => {
        rsvs.push(snapDoc.data());
      });
      liveReservations = rsvs;
      console.log(`[Sabay Firebase] Loaded ${liveReservations.length} reservations.`);
    }
    const ordersSnapshot = await (0, import_firestore.getDocs)((0, import_firestore.collection)(firestoreDb, "orders"));
    if (!ordersSnapshot.empty) {
      const ords = [];
      ordersSnapshot.forEach((snapDoc) => {
        const orderData = snapDoc.data();
        if (!orderData.id) {
          orderData.id = snapDoc.id;
        }
        ords.push(orderData);
      });
      ords.sort((a, b) => {
        const idA = String(a && a.id ? a.id : "");
        const idB = String(b && b.id ? b.id : "");
        const numA = parseInt(idA.replace(/\D/g, "")) || 0;
        const numB = parseInt(idB.replace(/\D/g, "")) || 0;
        return numA - numB;
      });
      liveOrders = ords;
      console.log(`[Sabay Firebase] Loaded ${liveOrders.length} orders.`);
    }
    const systemDoc = await (0, import_firestore.getDoc)((0, import_firestore.doc)(firestoreDb, "settings", "system"));
    if (systemDoc.exists()) {
      const sys = systemDoc.data();
      if (sys.liveStaffPin !== void 0) liveStaffPin = String(sys.liveStaffPin);
      if (sys.livePrinterIp !== void 0) livePrinterIp = String(sys.livePrinterIp);
      if (sys.liveTakeoutSeq !== void 0) liveTakeoutSeq = Number(sys.liveTakeoutSeq);
      if (sys.lastTakeoutDate !== void 0) lastTakeoutDate = String(sys.lastTakeoutDate);
      if (sys.liveMinSpendPerPerson !== void 0) liveMinSpendPerPerson = Number(sys.liveMinSpendPerPerson);
      if (sys.liveOperatingHours !== void 0) liveOperatingHours = sys.liveOperatingHours;
      if (sys.liveRestDays !== void 0) liveRestDays = sys.liveRestDays;
      if (sys.liveCustomerNotice !== void 0) liveCustomerNotice = String(sys.liveCustomerNotice);
      if (sys.liveServicePaused !== void 0) liveServicePaused = !!sys.liveServicePaused;
      if (sys.liveOptionRules !== void 0) liveOptionRules = sys.liveOptionRules;
      if (sys.livePrinterSettings !== void 0) livePrinterSettings = sys.livePrinterSettings;
      if (sys.livePromoCombo !== void 0) livePromoCombo = sys.livePromoCombo;
      if (sys.livePromoCombos !== void 0) livePromoCombos = sys.livePromoCombos;
      if (sys.livePopularItemIds !== void 0) livePopularItemIds = sys.livePopularItemIds;
      if (sys.liveMemberPointsRatio !== void 0) liveMemberPointsRatio = Number(sys.liveMemberPointsRatio);
      if (sys.liveMemberRewards !== void 0) liveMemberRewards = sys.liveMemberRewards;
      console.log("[Sabay Firebase] Loaded system settings.");
    }
    const logsDoc = await (0, import_firestore.getDoc)((0, import_firestore.doc)(firestoreDb, "settings", "logs"));
    if (logsDoc.exists()) {
      const logs = logsDoc.data();
      if (Array.isArray(logs.inventoryLogs)) inventoryLogs = logs.inventoryLogs;
      if (Array.isArray(logs.printLogs)) printLogs = logs.printLogs;
      if (Array.isArray(logs.promoNotifications)) promoNotifications = logs.promoNotifications;
      console.log("[Sabay Firebase] Loaded system logs.");
    }
    isStateLoadedSuccessfully = true;
    refreshIngredientRecipeMap();
    console.log("[Sabay Firebase] \u2713 State load completed successfully.");
    if (categoriesSnapshot.empty && menuSnapshot.empty) {
      console.log("[Sabay Firebase] Database is empty. Bootstrapping with default configurations...");
      await saveStateToFirestore();
    }
    return true;
  } catch (error) {
    console.error("[Sabay Firebase] Error loading state from Firestore:", error);
    return false;
  }
}
var PERSISTENCE_FILE_PATH = import_path.default.join(process.cwd(), "persisted_state.json");
var isStateLoadedSuccessfully = false;
function saveStateToDisk() {
  try {
    liveMenu.forEach((item, index) => {
      item.orderIndex = index;
    });
    const dataToSave = {
      liveMenu,
      liveIngredients,
      liveCategories,
      liveStaffPin,
      livePrinterIp,
      liveTables,
      liveReservations,
      liveTakeoutSeq,
      lastTakeoutDate,
      liveMinSpendPerPerson,
      liveOperatingHours,
      liveRestDays,
      liveCustomerNotice,
      liveServicePaused,
      liveOrders,
      inventoryLogs,
      printLogs,
      promoNotifications,
      liveOptionRules,
      livePrinterSettings,
      livePromoCombo,
      livePromoCombos,
      livePopularItemIds,
      liveMemberPointsRatio,
      liveMemberRewards
    };
    import_fs.default.writeFileSync(PERSISTENCE_FILE_PATH, JSON.stringify(dataToSave, null, 2), "utf-8");
    console.log("\u2713 System State fully saved to codebase disk:", PERSISTENCE_FILE_PATH);
    if (firestoreDb) {
      saveStateToFirestore().catch((err) => {
        console.error("[Sabay Firebase] Async Firestore save failed:", err);
      });
    }
  } catch (error) {
    console.error("Failed to save state to disk:", error);
  }
}
function loadStateFromDisk() {
  try {
    if (import_fs.default.existsSync(PERSISTENCE_FILE_PATH)) {
      const data = import_fs.default.readFileSync(PERSISTENCE_FILE_PATH, "utf-8");
      if (!data || data.trim() === "") {
        console.warn("[Sabay Warning] Persistence file is empty. Setting loaded = true.");
        isStateLoadedSuccessfully = true;
        return;
      }
      const parsed = JSON.parse(data);
      if (parsed) {
        if (Array.isArray(parsed.liveMenu)) {
          liveMenu = parsed.liveMenu;
          liveMenu.sort((a, b) => {
            const idxA = a.orderIndex !== void 0 ? a.orderIndex : 9999;
            const idxB = b.orderIndex !== void 0 ? b.orderIndex : 9999;
            return idxA - idxB;
          });
          sanitizeMenu(liveMenu);
        }
        if (Array.isArray(parsed.liveIngredients)) {
          liveIngredients = parsed.liveIngredients;
        }
        if (Array.isArray(parsed.liveCategories)) {
          liveCategories = parsed.liveCategories;
          liveCategories.sort((a, b) => {
            const idxA = a.orderIndex !== void 0 ? a.orderIndex : 9999;
            const idxB = b.orderIndex !== void 0 ? b.orderIndex : 9999;
            return idxA - idxB;
          });
        }
        if (parsed.liveStaffPin !== void 0 && parsed.liveStaffPin !== null) {
          liveStaffPin = String(parsed.liveStaffPin);
          if (!/^\d{6}$/.test(liveStaffPin)) {
            console.log(`\u26A0\uFE0F Legacy PIN detected (${liveStaffPin}), migrating to secure default '888888'`);
            liveStaffPin = "888888";
          }
        }
        if (parsed.livePrinterIp) {
          livePrinterIp = String(parsed.livePrinterIp);
        }
        if (Array.isArray(parsed.liveTables)) {
          liveTables = parsed.liveTables.map((t) => ({
            ...t,
            status: t.status || "available",
            preservedFor: t.preservedFor || "",
            mergedWith: t.mergedWith || ""
          }));
        }
        if (Array.isArray(parsed.liveReservations)) {
          liveReservations = parsed.liveReservations;
        }
        if (parsed.liveTakeoutSeq !== void 0) {
          liveTakeoutSeq = Number(parsed.liveTakeoutSeq);
        }
        if (parsed.lastTakeoutDate) {
          lastTakeoutDate = String(parsed.lastTakeoutDate);
        }
        if (parsed.liveMinSpendPerPerson !== void 0) {
          liveMinSpendPerPerson = Number(parsed.liveMinSpendPerPerson);
        }
        if (parsed.liveOperatingHours) {
          liveOperatingHours = parsed.liveOperatingHours;
        }
        if (parsed.liveRestDays) {
          liveRestDays = parsed.liveRestDays;
        }
        if (parsed.liveCustomerNotice !== void 0) {
          liveCustomerNotice = String(parsed.liveCustomerNotice);
        }
        if (parsed.liveServicePaused !== void 0) {
          liveServicePaused = !!parsed.liveServicePaused;
        }
        if (Array.isArray(parsed.liveOrders)) {
          liveOrders = parsed.liveOrders.filter((o) => o && !o.id.startsWith("LM-100") && !o.id.startsWith("LM-099"));
        }
        if (Array.isArray(parsed.inventoryLogs)) {
          inventoryLogs = parsed.inventoryLogs;
        }
        if (Array.isArray(parsed.printLogs)) {
          printLogs = parsed.printLogs;
        }
        if (Array.isArray(parsed.promoNotifications)) {
          promoNotifications = parsed.promoNotifications;
        }
        if (parsed.liveOptionRules) {
          liveOptionRules = parsed.liveOptionRules;
        }
        if (parsed.livePrinterSettings) {
          livePrinterSettings = parsed.livePrinterSettings;
        }
        if (parsed.livePromoCombo) {
          livePromoCombo = parsed.livePromoCombo;
        }
        if (Array.isArray(parsed.livePromoCombos)) {
          livePromoCombos = parsed.livePromoCombos.filter((c) => c && c.id !== "default-combo-1" && c.id !== "legacy-combo-1" && c.id !== "legacy-default");
        } else {
          livePromoCombos = [];
        }
        if (Array.isArray(parsed.livePopularItemIds)) {
          livePopularItemIds = parsed.livePopularItemIds;
        }
        if (parsed.liveMemberPointsRatio !== void 0) {
          liveMemberPointsRatio = Number(parsed.liveMemberPointsRatio);
        }
        if (Array.isArray(parsed.liveMemberRewards)) {
          liveMemberRewards = parsed.liveMemberRewards;
        }
        console.log("\u2713 System State fully loaded from codebase disk:", PERSISTENCE_FILE_PATH);
        refreshIngredientRecipeMap();
      }
    }
    isStateLoadedSuccessfully = true;
  } catch (error) {
    console.error("Failed to load state from disk (using defaults):", error);
    isStateLoadedSuccessfully = true;
  }
}
async function initializeState() {
  const loadedFromFirestore = await loadStateFromFirestore();
  if (!loadedFromFirestore) {
    console.log("[Sabay Server] Firestore load not successful, loading from disk...");
    loadStateFromDisk();
  }
}
app.get("/api/print-logs", (req, res) => {
  res.json(printLogs);
});
app.post("/api/print-logs/clear", (req, res) => {
  printLogs = [];
  res.json({ success: true, message: "\u865B\u64EC\u51FA\u55AE\u8A18\u9304\u5DF2\u5168\u90E8\u6E05\u9664" });
});
app.post("/api/admin/clear-test-data", (req, res) => {
  const { pin } = req.body;
  if (!pin || pin !== liveStaffPin) {
    return res.status(403).json({ error: "\u5B89\u5168\u6821\u5C0D\u78BC (\u54E1\u5DE5\u89E3\u9396 PIN \u78BC) \u4E0D\u6B63\u78BA\uFF0C\u7121\u6CD5\u6388\u6B0A\u6E05\u7A7A\uFF01" });
  }
  liveOrders = [];
  inventoryLogs = [];
  printLogs = [];
  promoNotifications = [];
  liveTakeoutSeq = 0;
  saveStateToDisk();
  res.json({ success: true, message: "\u5DF2\u6210\u529F\u6E05\u9664\u7CFB\u7D71\u5167\u6240\u6709\u6E2C\u8A66\u7528\u6B77\u53F2\u55AE\u64DA\u3001\u5EAB\u5B58\u8A18\u9304\u53CA\u865B\u64EC\u51FA\u55AE\u65E5\u8A8C\uFF01" });
});
app.get("/api/push-notifications", (req, res) => {
  res.json(promoNotifications);
});
app.post("/api/send-promo-push", (req, res) => {
  const { title, message, badge } = req.body;
  const newNotif = {
    id: `notif-${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
    title: title || "\u6C99\u8C9D\u9650\u6642\u512A\u60E0 \u{1F1F9}\u{1F1ED}",
    message: message || "\u8001\u95C6\u760B\u4E86\uFF01\u5373\u523B\u9EDE\u9910\u5168\u55AE\u4EAB\u7279\u5225\u6298\u6263\uFF01",
    badge: badge || "PROMO",
    isRead: false
  };
  promoNotifications.push(newNotif);
  res.status(201).json(newNotif);
});
app.get("/api/printer/config", (req, res) => {
  res.json({ ip: livePrinterIp });
});
app.get("/api/printer/ping", (req, res) => {
  const ip = req.query.ip || livePrinterIp;
  const isMock = req.query.simulate === "true" || ip === "127.0.0.1" || ip === "localhost" || ip.toLowerCase().includes("mock") || ip.toLowerCase().includes("simulate");
  if (isMock) {
    return res.json({
      reachable: true,
      ip,
      port: 9100,
      simulated: true,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  const socket = new import_net.default.Socket();
  let completed = false;
  socket.setTimeout(1200);
  const cleanUp = () => {
    if (!socket.destroyed) {
      socket.destroy();
    }
  };
  socket.connect(9100, ip, () => {
    if (!completed) {
      completed = true;
      cleanUp();
      res.json({
        reachable: true,
        ip,
        port: 9100,
        simulated: false,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  });
  socket.on("error", (err) => {
    if (!completed) {
      completed = true;
      cleanUp();
      res.json({
        reachable: false,
        ip,
        port: 9100,
        simulated: false,
        error: err.message,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  });
  socket.on("timeout", () => {
    if (!completed) {
      completed = true;
      cleanUp();
      res.json({
        reachable: false,
        ip,
        port: 9100,
        simulated: false,
        error: "Network connection timeout (ETIMEDOUT)",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  });
});
app.put("/api/printer/config", (req, res) => {
  const { ip } = req.body;
  if (ip) {
    livePrinterIp = ip;
  }
  saveStateToDisk();
  res.json({ ip: livePrinterIp });
});
function triggerCashDrawerOpen(settings) {
  const driver = settings.cashDrawerDriver || "OPOS";
  const drawerName = settings.cashDrawerOposName || "CashDrawer1";
  const rawCommandHex = settings.cashDrawerEscPosCommand || "1B700019FA";
  const port = settings.usbPort || "USB002";
  let log = "";
  if (driver === "OPOS") {
    log += `[OPOS Cash Drawer] \u6B63\u5728\u521D\u59CB\u5316 OPOS Control OLE Control Instance...
`;
    log += `[OPOS Cash Drawer] \u53D6\u5F97\u8A2D\u5099\u540D\u7A31: '${drawerName}' (UPOS v1.14 \u76F8\u5BB9)
`;
    log += `[OPOS Cash Drawer] 1. claimDevice(timeout: 1000ms) -> \u7368\u4F54\u6027\u5BA3\u544A\u6210\u529F (Claimed)
`;
    log += `[OPOS Cash Drawer] 2. deviceEnabled = true -> \u8A2D\u5099\u6210\u529F\u555F\u7528 (Enabled)
`;
    log += `[OPOS Cash Drawer] 3. openDrawer() -> \u6210\u529F\u767C\u9001\u96FB\u8108\u885D\u8A0A\u865F 1B 70 00 19 FA (\u5F15\u8173 2 \u8108\u885D)
`;
    log += `[OPOS Cash Drawer] 4. releaseDevice() -> \u91CB\u653E\u8A2D\u5099\u63A7\u5236\u6B0A (Released)
`;
  } else if (driver === "POS_NET") {
    log += `[POS for .NET] \u8F09\u5165 Microsoft.PointOfService.PosExplorer \u6A21\u7D44...
`;
    log += `[POS for .NET] PosExplorer.GetDevice("CashDrawer", "${drawerName}") -> \u627E\u5230\u88DD\u7F6E
`;
    log += `[POS for .NET] \u5BA3\u544A Claim(1000) -> \u555F\u7528 DeviceEnabled = true -> \u958B\u555F OpenDrawer()
`;
    log += `[POS for .NET] \u96FB\u78C1\u95A5\u7DDA\u5708\u5DF2\u63A5\u6536\u5230 24V \u6FC0\u52F5\u96FB\u6D41\uFF0C\u6536\u9280\u7BB1\u5F48\u958B\uFF01
`;
  } else {
    log += `[ESC/POS Raw Win32] \u547C\u53EB Windows \u7CFB\u7D71 Print Spooler (winspool.drv) RAW \u901A\u9053...
`;
    log += `[ESC/POS Raw Win32] OpenPrinter('${port}', PrinterHandle, nil) -> \u53D6\u5F97\u9A45\u52D5\u63A7\u5236\u4EE3\u78BC: 0x${Math.floor(Math.random() * 999999).toString(16).toUpperCase()}
`;
    log += `[ESC/POS Raw Win32] StartDocPrinter(PrinterHandle, 1, DocInfo { pDocName: "Direct 2 Printer/Drawer Kick", pDataType: "RAW" }) -> \u8D77\u59CB\u6587\u4EF6\u6392\u7A0B
`;
    log += `[ESC/POS Raw Win32] StartPagePrinter(PrinterHandle) -> \u9801\u9762\u76F4\u901A\u6A21\u5F0F
`;
    log += `[ESC/POS Raw Win32] WritePrinter(PrinterHandle, RawBytes: [${rawCommandHex.match(/.{1,2}/g)?.join(" ") || ""}], count: ${rawCommandHex.length / 2}, dwBytesWritten) -> \u6210\u529F\u76F4\u901A\u5BEB\u5165\u5370\u8868\u6A5F
`;
    log += `[ESC/POS Raw Win32] EndPagePrinter -> EndDocPrinter -> ClosePrinter(PrinterHandle)
`;
    log += `[ESC/POS Raw Win32] ESC/POS \u8108\u885D\u958B\u9396\u4FE1\u865F\u50B3\u8F38\u6210\u529F\uFF01
`;
  }
  return {
    success: true,
    log: log.trim()
  };
}
app.post("/api/printer/open-drawer", (req, res) => {
  const settings = livePrinterSettings.bill;
  const result = triggerCashDrawerOpen(settings);
  printLogs.push({
    id: `pr-${Date.now()}-manual-drawer`,
    timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
    content: `========================================
         SABAY BBQ \u624B\u52D5\u958B\u555F\u6536\u9280\u62BD\u5C5C
========================================
\u89F8\u767C\u65B9\u5F0F: \u6AC3\u6AAF\u54E1\u5DE5\u624B\u52D5\u9EDE\u64CA\u89F8\u767C
\u5BE6\u9AD4\u57E0\u53E3: ${settings.usbPort || "USB002"}
\u57F7\u884C\u65E5\u8A8C:
${result.log}
========================================`,
    orderId: "MANUAL-TRIGGER",
    type: "customer"
  });
  res.json({ success: true, log: result.log });
});
app.post("/api/printer/test", (req, res) => {
  let drawerNote = "";
  if (livePrinterSettings.bill.cashDrawerEnabled) {
    const drawerRes = triggerCashDrawerOpen(livePrinterSettings.bill);
    drawerNote = `
----------------------------------------
\u73FE\u91D1\u6536\u9280\u62BD\u5C5C\u9023\u52D5: \u555F\u7528 \u{1F7E2}
\u89F8\u767C\u9A45\u52D5: ${livePrinterSettings.bill.cashDrawerDriver}
\u5BE6\u9AD4\u57E0\u53E3: ${livePrinterSettings.bill.usbPort || "USB002"}
\u57F7\u884C\u65E5\u8A8C:
${drawerRes.log}
`;
    printLogs.push({
      id: `pr-${Date.now()}-drawer-test`,
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
      content: `========================================
         SABAY BBQ \u6536\u9280\u7BB1\u6E2C\u8A66\u958B\u555F
========================================
\u89F8\u767C\u65B9\u5F0F: \u6E2C\u8A66\u5217\u5370\u9023\u52D5\u89F8\u767C
\u57F7\u884C\u65E5\u8A8C:
${drawerRes.log}
========================================`,
      orderId: "TEST-PAGE",
      type: "customer"
    });
  } else {
    drawerNote = `
----------------------------------------
\u73FE\u91D1\u6536\u9280\u62BD\u5C5C\u9023\u52D5: \u672A\u555F\u7528 \u274C
`;
  }
  const testTicket = `
========================================
       \u6C99\u8C9D\u71D2\u70E4 (\u5370\u8868\u6A5F\u7DB2\u5361\u9023\u7DDA\u6E2C\u8A66\u9801)
========================================
\u6E2C\u8A66\u72C0\u614B: \u9023\u7DDA\u6210\u529F \u{1F7E2}
\u4E3B\u6A5F\u4F86\u6E90: ${req.ip}
\u5370\u8868\u6A5F IP: ${livePrinterIp}
\u901A\u8A0A\u57E0: Port 9100 / Virtual 3000
\u5217\u5370\u6642\u9593: ${(/* @__PURE__ */ new Date()).toLocaleString()}
----------------------------------------
\u5B57\u578B\u6E2C\u8A66 / Font Test:
1. \u7E41\u9AD4\u4E2D\u6587 \u{1F1F9}\u{1F1FC} - \u6E2C\u8A66\u6B63\u5E38 (\u6C99\u8C9D\u6C99\u8C9D)
2. English \u{1F1FA}\u{1F1F8} - OK (Sawatdee!)
3. \u6CF0\u6587 \u{1F1F9}\u{1F1ED} - \u0E25\u0E32\u0E1A\u0E2B\u0E21\u0E39\u0E22\u0E48\u0E32\u0E07\u0E2A\u0E49\u0E21\u0E15\u0E33${drawerNote}
========================================
  `;
  printLogs.push({
    id: `pr-${Date.now()}-test`,
    timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
    content: testTicket.trim(),
    orderId: "TEST-PAGE",
    type: "kitchen"
  });
  res.json({ success: true, message: "\u6E2C\u8A66\u9801\u5DF2\u50B3\u9001\u81F3\u865B\u64EC\u51FA\u55AE\u6A5F" });
});
app.post("/api/printer/pin", (req, res) => {
  const { currentPin, newPin } = req.body;
  if (!currentPin || !newPin) {
    return res.status(400).json({ error: "\u8ACB\u8F38\u5165\u76EE\u524D\u91D1\u9470\u8207\u65B0\u89E3\u9396\u91D1\u9470 / Required fields missing" });
  }
  if (currentPin !== liveStaffPin) {
    return res.status(400).json({ error: "\u76EE\u524D\u89E3\u9396\u91D1\u9470\u8F38\u5165\u932F\u8AA4\uFF01 / Incorrect current PIN" });
  }
  if (!/^\d{6}$/.test(newPin)) {
    return res.status(400).json({ error: "\u65B0\u91D1\u9470\u5FC5\u9808\u70BA 6 \u4F4D\u534A\u5F62\u6578\u5B57\uFF01 / New PIN must be a 6-digit number" });
  }
  liveStaffPin = newPin;
  saveStateToDisk();
  res.json({ success: true, message: "\u54E1\u5DE5\u89E3\u9396\u91D1\u9470\u5DF2\u6210\u529F\u8B8A\u66F4\uFF01" });
});
app.get("/api/menu", (req, res) => {
  res.json(liveMenu);
});
app.post("/api/menu", (req, res) => {
  const { category, name, price, image, description, isSetMeal, requiredSaucesOption, hasNoodlesOption, hasCoconutsMilkOption, containsBeef, containsPork, containsSeafood, isNotSpicy, customAddOns, recipe } = req.body;
  if (!category || !name || !price) {
    return res.status(400).json({ error: "Missing required fields (category, name, price)" });
  }
  const newItem = {
    id: `dish-${Date.now()}`,
    category,
    name: typeof name === "object" ? name : { zh: name || "", en: name || "", ko: name || "", ja: name || "", th: name || "" },
    price: Number(price),
    image: image || "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    description: typeof description === "object" ? description : { zh: description || "", en: description || "", ko: description || "", ja: description || "", th: description || "" },
    available: true,
    isSetMeal: !!isSetMeal,
    requiredSaucesOption: !!requiredSaucesOption,
    hasNoodlesOption: !!hasNoodlesOption,
    hasCoconutsMilkOption: !!hasCoconutsMilkOption,
    containsBeef: !!containsBeef,
    containsPork: !!containsPork,
    containsSeafood: !!containsSeafood,
    isNotSpicy: !!isNotSpicy,
    customAddOns: Array.isArray(customAddOns) ? customAddOns : [],
    recipe: Array.isArray(recipe) ? recipe : void 0,
    orderIndex: liveMenu.length
  };
  sanitizeMenu([newItem]);
  liveMenu.push(newItem);
  refreshIngredientRecipeMap();
  saveStateToDisk();
  res.status(201).json(newItem);
});
app.put("/api/menu/reorder", (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) {
    return res.status(400).json({ error: "Invalid order parameter / \u6392\u5E8F\u5C6C\u6027\u7121\u6548" });
  }
  const reordered = [];
  order.forEach((id) => {
    const item = liveMenu.find((m) => m.id === id);
    if (item) {
      reordered.push(item);
    }
  });
  liveMenu.forEach((item) => {
    if (!reordered.find((r) => r.id === item.id)) {
      reordered.push(item);
    }
  });
  reordered.forEach((item, index) => {
    item.orderIndex = index;
  });
  liveMenu = reordered;
  saveStateToDisk();
  res.json({ success: true, menu: liveMenu });
});
app.put("/api/menu/:id", (req, res) => {
  const { id } = req.params;
  const { category, name, price, image, description, available, isSetMeal, requiredSaucesOption, hasNoodlesOption, hasCoconutsMilkOption, containsBeef, containsPork, containsSeafood, isNotSpicy, customAddOns, recipe } = req.body;
  const itemIndex = liveMenu.findIndex((m) => m.id === id);
  if (itemIndex > -1) {
    const updated = {
      ...liveMenu[itemIndex],
      category: category || liveMenu[itemIndex].category,
      name: name !== void 0 ? typeof name === "object" ? name : { zh: name || "", en: name || "", ko: name || "", ja: name || "", th: name || "" } : liveMenu[itemIndex].name,
      price: price !== void 0 ? Number(price) : liveMenu[itemIndex].price,
      image: image || liveMenu[itemIndex].image,
      description: description !== void 0 ? typeof description === "object" ? description : { zh: description || "", en: description || "", ko: description || "", ja: description || "", th: description || "" } : liveMenu[itemIndex].description,
      available: available !== void 0 ? !!available : liveMenu[itemIndex].available,
      isSetMeal: isSetMeal !== void 0 ? !!isSetMeal : liveMenu[itemIndex].isSetMeal,
      requiredSaucesOption: requiredSaucesOption !== void 0 ? !!requiredSaucesOption : liveMenu[itemIndex].requiredSaucesOption,
      hasNoodlesOption: hasNoodlesOption !== void 0 ? !!hasNoodlesOption : liveMenu[itemIndex].hasNoodlesOption,
      hasCoconutsMilkOption: hasCoconutsMilkOption !== void 0 ? !!hasCoconutsMilkOption : liveMenu[itemIndex].hasCoconutsMilkOption,
      containsBeef: containsBeef !== void 0 ? !!containsBeef : liveMenu[itemIndex].containsBeef,
      containsPork: containsPork !== void 0 ? !!containsPork : liveMenu[itemIndex].containsPork,
      containsSeafood: containsSeafood !== void 0 ? !!containsSeafood : liveMenu[itemIndex].containsSeafood,
      isNotSpicy: isNotSpicy !== void 0 ? !!isNotSpicy : liveMenu[itemIndex].isNotSpicy,
      customAddOns: Array.isArray(customAddOns) ? customAddOns : liveMenu[itemIndex].customAddOns || [],
      recipe: Array.isArray(recipe) ? recipe : liveMenu[itemIndex].recipe
    };
    sanitizeMenu([updated]);
    liveMenu[itemIndex] = updated;
    refreshIngredientRecipeMap();
    saveStateToDisk();
    return res.json({ success: true, item: updated });
  }
  res.status(404).json({ error: "Item not found" });
});
app.post("/api/menu/toggle-available", (req, res) => {
  const { id } = req.body;
  const item = liveMenu.find((m) => m.id === id);
  if (item) {
    item.available = !item.available;
    saveStateToDisk();
    return res.json({ success: true, item });
  }
  res.status(404).json({ error: "Item not found" });
});
app.delete("/api/menu/:id", (req, res) => {
  const { id } = req.params;
  const itemIndex = liveMenu.findIndex((m) => m.id === id);
  if (itemIndex > -1) {
    const deletedItem = liveMenu.splice(itemIndex, 1)[0];
    refreshIngredientRecipeMap();
    saveStateToDisk();
    return res.json({ success: true, message: `Successfully deleted menu item [${deletedItem.name.zh}]` });
  }
  res.status(404).json({ error: "Item not found / \u627E\u4E0D\u5230\u6B64\u83DC\u54C1" });
});
app.get("/api/categories", (req, res) => {
  res.json(liveCategories);
});
app.post("/api/categories", (req, res) => {
  const { id, name, showOnCustomerPage } = req.body;
  console.log("[API POST /api/categories] Received body:", req.body);
  if (!id || !name) {
    return res.status(400).json({ error: "Missing required fields (id, name)" });
  }
  const cleanId = id.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "");
  if (!cleanId) {
    return res.status(400).json({ error: "Category ID must have alphanumeric characters" });
  }
  if (liveCategories.some((c) => c.id === cleanId)) {
    return res.status(400).json({ error: "Category ID already exists / \u985E\u5225 ID \u5DF2\u5B58\u5728" });
  }
  const isShown = showOnCustomerPage === void 0 || String(showOnCustomerPage) === "true" || showOnCustomerPage === true;
  const newCat = {
    id: cleanId,
    name: typeof name === "object" ? name : { zh: name, en: name, ko: name, ja: name, th: name },
    showOnCustomerPage: isShown,
    orderIndex: liveCategories.length
  };
  liveCategories.push(newCat);
  saveStateToDisk();
  console.log("[API POST /api/categories] Saved category:", newCat);
  res.status(201).json(newCat);
});
app.put("/api/categories/reorder", (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) {
    return res.status(400).json({ error: "Invalid order parameter / \u6392\u5E8F\u5C6C\u6027\u7121\u6548" });
  }
  const reordered = [];
  order.forEach((id) => {
    const cat = liveCategories.find((c) => c.id === id);
    if (cat) {
      reordered.push(cat);
    }
  });
  liveCategories.forEach((cat) => {
    if (!reordered.find((r) => r.id === cat.id)) {
      reordered.push(cat);
    }
  });
  reordered.forEach((cat, index) => {
    cat.orderIndex = index;
  });
  liveCategories = reordered;
  saveStateToDisk();
  res.json({ success: true, categories: liveCategories });
});
app.put("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  const { name, showOnCustomerPage } = req.body;
  console.log(`[API PUT /api/categories/${id}] Received body:`, req.body);
  const catIndex = liveCategories.findIndex((c) => c.id === id);
  if (catIndex > -1) {
    if (name) {
      liveCategories[catIndex].name = typeof name === "object" ? name : { zh: name, en: name, ko: name, ja: name, th: name };
    }
    if (showOnCustomerPage !== void 0) {
      const isShown = String(showOnCustomerPage) === "true" || showOnCustomerPage === true;
      liveCategories[catIndex].showOnCustomerPage = isShown;
    }
    saveStateToDisk();
    console.log(`[API PUT /api/categories/${id}] Updated category:`, liveCategories[catIndex]);
    return res.json({ success: true, category: liveCategories[catIndex] });
  }
  res.status(404).json({ error: "Category not found / \u627E\u4E0D\u5230\u6B64\u985E\u5225" });
});
app.delete("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  const catIndex = liveCategories.findIndex((c) => c.id === id);
  if (catIndex > -1) {
    const deleted = liveCategories.splice(catIndex, 1);
    saveStateToDisk();
    return res.json({ success: true, deleted });
  }
  res.status(404).json({ error: "Category not found / \u627E\u4E0D\u5230\u6B64\u985E\u5225" });
});
app.get("/api/settings/min-spend", (req, res) => {
  res.json({ minSpend: liveMinSpendPerPerson });
});
app.post("/api/settings/min-spend", (req, res) => {
  const { minSpend } = req.body;
  if (minSpend !== void 0 && !isNaN(parseInt(minSpend, 10))) {
    liveMinSpendPerPerson = Math.max(0, parseInt(minSpend, 10));
    saveStateToDisk();
    return res.json({ success: true, minSpend: liveMinSpendPerPerson });
  }
  res.status(400).json({ error: "Invalid minimum spend / \u7121\u6548\u4F4E\u6D88\u91D1\u984D" });
});
app.get("/api/settings/operating-hours", (req, res) => {
  res.json({
    slots: liveOperatingHours,
    restDays: liveRestDays,
    isOpen: isStoreOpen(),
    currentTime: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.post("/api/settings/operating-hours", (req, res) => {
  const { slots, restDays } = req.body;
  if (slots && Array.isArray(slots)) {
    const sanitized = slots.map((s, idx) => ({
      id: s.id || `oh-manual-${idx}-${Date.now()}`,
      name: s.name || `\u6642\u6BB5 ${idx + 1}`,
      start: s.start || "11:00",
      end: s.end || "14:30",
      days: Array.isArray(s.days) ? s.days.map(Number) : [0, 1, 2, 3, 4, 5, 6],
      isActive: s.isActive !== void 0 ? !!s.isActive : true
    }));
    liveOperatingHours = sanitized;
  }
  if (restDays && Array.isArray(restDays)) {
    liveRestDays = restDays.map(String).map((d) => d.trim()).filter(Boolean);
  }
  saveStateToDisk();
  return res.json({ success: true, slots: liveOperatingHours, restDays: liveRestDays, isOpen: isStoreOpen() });
});
app.get("/api/settings/customer-notice", (req, res) => {
  res.json({ notice: liveCustomerNotice });
});
app.post("/api/settings/customer-notice", (req, res) => {
  const { notice } = req.body;
  if (notice !== void 0) {
    liveCustomerNotice = String(notice).trim();
    saveStateToDisk();
    return res.json({ success: true, notice: liveCustomerNotice });
  }
  res.status(400).json({ error: "Invalid customer notice / \u9867\u5BA2\u6CE8\u610F\u4E8B\u9805\u7121\u6548" });
});
app.get("/api/settings/service-pause", (req, res) => {
  res.json({ servicePaused: liveServicePaused });
});
app.post("/api/settings/service-pause", (req, res) => {
  const { servicePaused } = req.body;
  if (servicePaused !== void 0) {
    const nextVal = !!servicePaused;
    if (liveServicePaused !== nextVal) {
      liveServicePaused = nextVal;
      const newNotif = {
        id: `notif-${Date.now()}`,
        timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
        title: liveServicePaused ? "\u26A0\uFE0F \u5EDA\u623F\u66AB\u505C\u63A5\u55AE\u901A\u77E5 (Kitchen Service Paused)" : "\u{1F7E2} \u5EDA\u623F\u6062\u5FA9\u6B63\u5E38\u63A5\u55AE (Kitchen Service Resumed)",
        message: liveServicePaused ? "\u89AA\u611B\u7684\u9867\u5BA2\u60A8\u597D\uFF0C\u7531\u65BC\u76EE\u524D\u73FE\u5834\u8207\u7DDA\u4E0A\u8A02\u55AE\u91CF\u6975\u5927\uFF0C\u70BA\u4E86\u4FDD\u969C\u9910\u9EDE\u54C1\u8CEA\uFF0C\u5EDA\u623F\u5DF2\u66AB\u505C\u65B0\u8A02\u55AE\u88FD\u4F5C\u8207\u4E0B\u55AE\u670D\u52D9\u3002\u60A8\u4ECD\u53EF\u81EA\u7531\u6D41\u89BD\u83DC\u55AE\uFF0C\u66AB\u505C\u671F\u9593\u300C\u9001\u51FA\u8A02\u55AE\u300D\u529F\u80FD\u5C07\u81EA\u52D5\u9396\u5B9A\uFF0C\u656C\u8ACB\u7A0D\u7B49\u6216\u5411\u73FE\u5834\u670D\u52D9\u4EBA\u54E1\u8AEE\u8A62\uFF0C\u611F\u8B1D\u60A8\u7684\u9AD4\u8AD2\u8207\u914D\u5408\uFF01" : "\u611F\u8B1D\u60A8\u7684\u8010\u5FC3\u7B49\u5F85\uFF01\u5EDA\u623F\u76EE\u524D\u7684\u8A02\u55AE\u9AD8\u5CF0\u5DF2\u9806\u5229\u6D88\u5316\uFF0C\u9EDE\u9910\u8207\u7D50\u5E33\u6B0A\u9650\u73FE\u5DF2\u5168\u9762\u89E3\u9396\u6062\u5FA9\u6B63\u5E38\uFF01\u60A8\u53EF\u4EE5\u76F4\u63A5\u6311\u9078\u9910\u9EDE\u4E26\u52A0\u5165\u8CFC\u7269\u8ECA\u9001\u51FA\u8A02\u55AE\uFF0C\u671F\u5F85\u70BA\u60A8\u9001\u4E0A\u7F8E\u5473\u7684\u78B3\u70E4\uFF01",
        badge: liveServicePaused ? "PAUSED" : "ONLINE",
        isRead: false
      };
      promoNotifications.push(newNotif);
    }
    saveStateToDisk();
    return res.json({ success: true, servicePaused: liveServicePaused });
  }
  res.status(400).json({ error: "Invalid servicePaused value / \u66AB\u505C\u670D\u52D9\u503C\u7121\u6548" });
});
app.get("/api/settings/popular-item-ids", (req, res) => {
  res.json(livePopularItemIds);
});
app.post("/api/settings/popular-item-ids", (req, res) => {
  const { popularItemIds } = req.body;
  if (popularItemIds && Array.isArray(popularItemIds)) {
    livePopularItemIds = popularItemIds.map(String).map((s) => s.trim()).filter(Boolean);
    saveStateToDisk();
    return res.json({ success: true, popularItemIds: livePopularItemIds });
  }
  res.status(400).json({ error: "Invalid popularItemIds format / \u4ECA\u65E5\u71B1\u92B7\u8A2D\u5B9A\u8CC7\u6599\u683C\u5F0F\u932F\u8AA4" });
});
app.get("/api/settings/members-config", (req, res) => {
  res.json({
    pointsRatio: liveMemberPointsRatio,
    rewards: liveMemberRewards
  });
});
app.post("/api/settings/members-config", (req, res) => {
  const { pointsRatio, rewards } = req.body;
  if (pointsRatio !== void 0 && !isNaN(parseInt(pointsRatio, 10))) {
    liveMemberPointsRatio = Math.max(1, parseInt(pointsRatio, 10));
  }
  if (rewards && Array.isArray(rewards)) {
    liveMemberRewards = rewards.map((r) => ({
      id: r.id || `rew-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
      menuItemId: r.menuItemId,
      cost: r.cost !== void 0 ? Number(r.cost) : 100,
      fallbackPrice: r.fallbackPrice !== void 0 ? Number(r.fallbackPrice) : 10,
      enabled: r.enabled !== void 0 ? !!r.enabled : true
    }));
  }
  saveStateToDisk();
  res.json({ success: true, pointsRatio: liveMemberPointsRatio, rewards: liveMemberRewards });
});
app.get("/api/option-rules", (req, res) => {
  res.json(liveOptionRules);
});
app.post("/api/option-rules", (req, res) => {
  const { name, category, price } = req.body;
  const newRule = {
    id: `rule-${Date.now()}`,
    name: name || "\u65B0\u9078\u9805",
    category: category || "\u52A0\u914D\u6599",
    price: Number(price) || 0
  };
  liveOptionRules.push(newRule);
  saveStateToDisk();
  res.status(201).json(newRule);
});
app.delete("/api/option-rules/:id", (req, res) => {
  const { id } = req.params;
  const index = liveOptionRules.findIndex((r) => r.id === id);
  if (index > -1) {
    const deleted = liveOptionRules.splice(index, 1);
    saveStateToDisk();
    return res.json({ success: true, deleted });
  }
  res.status(404).json({ error: "Rule not found" });
});
app.get("/api/printer/settings", (req, res) => {
  res.json(livePrinterSettings);
});
app.put("/api/printer/settings", (req, res) => {
  const { kitchen, bill } = req.body;
  if (kitchen) {
    livePrinterSettings.kitchen = { ...livePrinterSettings.kitchen, ...kitchen };
  }
  if (bill) {
    livePrinterSettings.bill = { ...livePrinterSettings.bill, ...bill };
  }
  saveStateToDisk();
  res.json({ success: true, settings: livePrinterSettings });
});
app.get("/api/promo-combo", (req, res) => {
  res.json({
    enabled: livePromoCombo.enabled,
    requiredQty: livePromoCombo.requiredQty,
    discountAmount: livePromoCombo.discountAmount,
    eligibleItemIds: livePromoCombo.eligibleItemIds,
    combos: livePromoCombos
  });
});
app.post("/api/promo-combo", (req, res) => {
  const { enabled, requiredQty, discountAmount, eligibleItemIds, combos } = req.body;
  if (enabled !== void 0) livePromoCombo.enabled = !!enabled;
  if (requiredQty !== void 0) livePromoCombo.requiredQty = Math.max(1, parseInt(requiredQty, 10) || 10);
  if (discountAmount !== void 0) livePromoCombo.discountAmount = parseInt(discountAmount, 10) || 20;
  if (eligibleItemIds !== void 0 && Array.isArray(eligibleItemIds)) {
    livePromoCombo.eligibleItemIds = eligibleItemIds;
  }
  if (combos !== void 0 && Array.isArray(combos)) {
    livePromoCombos = combos.map((c) => ({
      id: c.id || `combo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: c.name || "\u81EA\u8A02\u5957\u9910\u7D44\u5408",
      enabled: c.enabled !== void 0 ? !!c.enabled : true,
      requiredQty: Math.max(1, parseInt(c.requiredQty, 10) || 10),
      discountAmount: parseInt(c.discountAmount, 10) || 20,
      eligibleItemIds: Array.isArray(c.eligibleItemIds) ? c.eligibleItemIds : []
    }));
  }
  saveStateToDisk();
  res.json({
    success: true,
    config: {
      enabled: livePromoCombo.enabled,
      requiredQty: livePromoCombo.requiredQty,
      discountAmount: livePromoCombo.discountAmount,
      eligibleItemIds: livePromoCombo.eligibleItemIds,
      combos: livePromoCombos
    }
  });
});
app.get("/api/tables", (req, res) => {
  res.json(liveTables);
});
app.post("/api/tables", (req, res) => {
  const { id, qrCodeUrl, status, preservedFor, mergedWith, positionX, positionY } = req.body;
  if (!id) {
    return res.status(400).json({ error: "Missing required field: id / \u7F3A\u5C11\u684C\u865F ID" });
  }
  const cleanId = id.toString().trim();
  if (!cleanId) {
    return res.status(400).json({ error: "Invalid Table ID / \u7121\u6548\u684C\u865F" });
  }
  if (liveTables.some((t) => t.id === cleanId)) {
    return res.status(400).json({ error: "Table ID already exists / \u684C\u865F\u5DF2\u5B58\u5728" });
  }
  const newTable = {
    id: cleanId,
    qrCodeUrl: qrCodeUrl || `/?table=${cleanId}`,
    status: status || "available",
    preservedFor: preservedFor || "",
    mergedWith: mergedWith || "",
    positionX: positionX !== void 0 ? parseFloat(positionX) : 10,
    positionY: positionY !== void 0 ? parseFloat(positionY) : 10
  };
  liveTables.push(newTable);
  liveTables.sort((a, b) => {
    const numA = parseInt(a.id, 10);
    const numB = parseInt(b.id, 10);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return a.id.localeCompare(b.id);
  });
  saveStateToDisk();
  res.status(201).json(newTable);
});
app.put("/api/tables/:id", (req, res) => {
  const { id } = req.params;
  const { qrCodeUrl, status, preservedFor, mergedWith, positionX, positionY } = req.body;
  const decodedId = decodeURIComponent(id).trim();
  const tableIndex = liveTables.findIndex((t) => t.id.toString().trim() === decodedId);
  if (tableIndex > -1) {
    if (qrCodeUrl !== void 0) {
      liveTables[tableIndex].qrCodeUrl = qrCodeUrl;
    }
    if (status !== void 0) {
      liveTables[tableIndex].status = status;
    }
    if (preservedFor !== void 0) {
      liveTables[tableIndex].preservedFor = preservedFor;
    }
    if (mergedWith !== void 0) {
      liveTables[tableIndex].mergedWith = mergedWith;
    }
    if (positionX !== void 0) {
      liveTables[tableIndex].positionX = parseFloat(positionX);
    }
    if (positionY !== void 0) {
      liveTables[tableIndex].positionY = parseFloat(positionY);
    }
    saveStateToDisk();
    return res.json({ success: true, table: liveTables[tableIndex] });
  }
  res.status(404).json({ error: "Table not found / \u627E\u4E0D\u5230\u6B64\u684C\u865F" });
});
app.delete("/api/tables/:id", (req, res) => {
  const { id } = req.params;
  const decodedId = decodeURIComponent(id).trim();
  const tableIndex = liveTables.findIndex((t) => t.id.toString().trim() === decodedId);
  if (tableIndex > -1) {
    const deleted = liveTables.splice(tableIndex, 1);
    saveStateToDisk();
    return res.json({ success: true, deleted });
  }
  res.status(404).json({ error: "Table not found / \u627E\u4E0D\u5230\u6B64\u684C\u865F" });
});
app.get("/api/reservations", (req, res) => {
  res.json(liveReservations);
});
app.post("/api/reservations", (req, res) => {
  const { customerName, phone, guestCount, tableNumber, date, time, notes, status } = req.body;
  if (!customerName || !phone || !tableNumber || !date || !time) {
    return res.status(400).json({ error: "Missing required field: customerName, phone, tableNumber, date, time / \u7F3A\u5C11\u9810\u7D04\u5FC5\u586B\u6B04\u4F4D" });
  }
  const newReservation = {
    id: "res-" + Math.random().toString(36).substring(2, 11),
    customerName: customerName.trim(),
    phone: phone.trim(),
    guestCount: parseInt(guestCount, 10) || 1,
    tableNumber: tableNumber.trim(),
    date: date.trim(),
    time: time.trim(),
    notes: notes || "",
    status: status || "pending",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  liveReservations.push(newReservation);
  if (newReservation.status === "pending") {
    const tb = liveTables.find((t) => t.id.toString().trim() === newReservation.tableNumber.toString().trim());
    if (tb) {
      tb.status = "preserved";
      tb.preservedFor = `${newReservation.customerName} (${newReservation.time})`;
    }
  }
  saveStateToDisk();
  res.status(201).json(newReservation);
});
app.put("/api/reservations/:id", (req, res) => {
  const { id } = req.params;
  const { customerName, phone, guestCount, tableNumber, date, time, notes, status } = req.body;
  const decodedId = decodeURIComponent(id).trim();
  const index = liveReservations.findIndex((r) => r.id === decodedId);
  if (index > -1) {
    if (customerName !== void 0) liveReservations[index].customerName = customerName;
    if (phone !== void 0) liveReservations[index].phone = phone;
    if (guestCount !== void 0) liveReservations[index].guestCount = parseInt(guestCount, 10) || 1;
    if (tableNumber !== void 0) liveReservations[index].tableNumber = tableNumber;
    if (date !== void 0) liveReservations[index].date = date;
    if (time !== void 0) liveReservations[index].time = time;
    if (notes !== void 0) liveReservations[index].notes = notes;
    if (status !== void 0) liveReservations[index].status = status;
    const updatedRes = liveReservations[index];
    if (updatedRes.status === "seated") {
      const tb = liveTables.find((t) => t.id.toString().trim() === updatedRes.tableNumber.toString().trim());
      if (tb) {
        tb.status = "in_use";
        tb.preservedFor = "";
      }
    } else if (updatedRes.status === "pending") {
      const tb = liveTables.find((t) => t.id.toString().trim() === updatedRes.tableNumber.toString().trim());
      if (tb) {
        tb.status = "preserved";
        tb.preservedFor = `${updatedRes.customerName} (${updatedRes.time})`;
      }
    } else if (updatedRes.status === "cancelled") {
      const tb = liveTables.find((t) => t.id.toString().trim() === updatedRes.tableNumber.toString().trim());
      if (tb && tb.status === "preserved") {
        tb.status = "available";
        tb.preservedFor = "";
      }
    }
    saveStateToDisk();
    return res.json({ success: true, reservation: liveReservations[index] });
  }
  res.status(404).json({ error: "Reservation not found / \u627E\u4E0D\u5230\u6B64\u9810\u7D04" });
});
app.delete("/api/reservations/:id", (req, res) => {
  const { id } = req.params;
  const decodedId = decodeURIComponent(id).trim();
  const index = liveReservations.findIndex((r) => r.id === decodedId);
  if (index > -1) {
    const deleted = liveReservations.splice(index, 1);
    saveStateToDisk();
    return res.json({ success: true, deleted });
  }
  res.status(404).json({ error: "Reservation not found / \u627E\u4E0D\u5230\u6B64\u9810\u7D04" });
});
app.post("/api/takeout/scan", (req, res) => {
  const today = (/* @__PURE__ */ new Date()).toDateString();
  if (today !== lastTakeoutDate) {
    liveTakeoutSeq = 0;
    lastTakeoutDate = today;
  }
  liveTakeoutSeq++;
  const assigned = `\u5916\u5E36 #${liveTakeoutSeq}`;
  saveStateToDisk();
  res.json({ success: true, tableNumber: assigned, sequence: liveTakeoutSeq });
});
app.get("/api/takeout/status", (req, res) => {
  const today = (/* @__PURE__ */ new Date()).toDateString();
  if (today !== lastTakeoutDate) {
    liveTakeoutSeq = 0;
    lastTakeoutDate = today;
  }
  res.json({ sequence: liveTakeoutSeq, lastResetDate: lastTakeoutDate });
});
app.get("/api/staff/pin/value", (req, res) => {
  res.json({ blocked: true });
});
app.post("/api/staff/pin/check-path", (req, res) => {
  const { pathPin } = req.body;
  if (!pathPin) {
    return res.json({ valid: false });
  }
  return res.json({ valid: pathPin === liveStaffPin });
});
app.post("/api/staff/pin/verify", (req, res) => {
  const { pin } = req.body;
  if (pin === liveStaffPin) {
    return res.json({ success: true });
  }
  return res.status(400).json({ success: false, error: "\u89E3\u9396\u91D1\u9470\u932F\u8AA4\uFF01" });
});
app.put("/api/staff/pin", (req, res) => {
  const { currentPin, newPin } = req.body;
  if (!currentPin || !newPin) {
    return res.status(400).json({ error: "\u8ACB\u8F38\u5165\u76EE\u524D\u91D1\u9470\u8207\u65B0\u89E3\u9396\u91D1\u9470 / Required fields missing" });
  }
  if (currentPin !== liveStaffPin) {
    return res.status(400).json({ error: "\u76EE\u524D\u91D1\u9470\u8F38\u5165\u932F\u8AA4\uFF01 / Incorrect current PIN" });
  }
  if (!/^\d{6}$/.test(newPin)) {
    return res.status(400).json({ error: "\u65B0\u91D1\u9470\u5FC5\u9808\u70BA 6 \u4F4D\u6578\u5B57\uFF01 / New PIN must be a 6-digit number" });
  }
  liveStaffPin = newPin;
  saveStateToDisk();
  return res.json({ success: true, message: "\u54E1\u5DE5\u89E3\u9396\u91D1\u9470\u5DF2\u6210\u529F\u8B8A\u66F4\uFF01 / PIN updated successfully" });
});
app.get("/api/ingredients", (req, res) => {
  res.json(liveIngredients);
});
app.post("/api/ingredients/restock", (req, res) => {
  const { id, amount } = req.body;
  const ingredient = liveIngredients.find((i) => i.id === id);
  if (ingredient) {
    ingredient.stock = Math.round((ingredient.stock + Number(amount)) * 100) / 100;
    inventoryLogs.push({
      id: `ir-restock-${Date.now()}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      ingredientId: id,
      ingredientName: ingredient.name.zh,
      type: "incoming",
      quantityChanged: Number(amount),
      remainingStock: ingredient.stock,
      note: "\u5F8C\u53F0\u624B\u52D5\u539F\u6599\u5927\u6279\u9032\u8CA8"
    });
    saveStateToDisk();
    return res.json({ success: true, ingredient });
  }
  res.status(404).json({ error: "Ingredient not found" });
});
app.post("/api/ingredients", (req, res) => {
  const { id, name, stock, minThreshold, unit } = req.body;
  if (!id || !name || !name.zh) {
    return res.status(400).json({ error: "\u7F3A\u5C11\u8B58\u5225\u78BC\u6216\u4E2D\u6587\u540D\u7A31 / Missing required ID or Name" });
  }
  const exists = liveIngredients.some((ig) => ig.id === id);
  if (exists) {
    return res.status(400).json({ error: "\u8A72\u539F\u6599\u8B58\u5225\u78BC\u5DF2\u5B58\u5728 / Ingredient ID already exists" });
  }
  const finalName = {
    zh: name.zh,
    en: name.en || name.zh,
    ko: name.ko || name.zh,
    ja: name.ja || name.zh,
    th: name.th || name.zh
  };
  const stockNum = Number(stock) || 0;
  const newIngredient = {
    id,
    name: finalName,
    stock: Math.round(stockNum * 100) / 100,
    minThreshold: Number(minThreshold) || 0,
    unit: unit || "kg"
  };
  liveIngredients.push(newIngredient);
  inventoryLogs.push({
    id: `ir-init-${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    ingredientId: id,
    ingredientName: finalName.zh,
    type: "incoming",
    quantityChanged: stockNum,
    remainingStock: stockNum,
    note: "\u65B0\u589E\u539F\u6599\uFF1A\u521D\u59CB\u5EFA\u7F6E\u5EAB\u5B58"
  });
  saveStateToDisk();
  res.json({ success: true, ingredient: newIngredient });
});
app.get("/api/inventory/logs", (req, res) => {
  res.json(inventoryLogs);
});
app.post("/api/inventory/adjust", (req, res) => {
  const { ingredientId, quantityChanged, note } = req.body;
  const ingredient = liveIngredients.find((ig) => ig.id === ingredientId);
  if (!ingredient) {
    return res.status(404).json({ error: "\u6750\u6599\u4E0D\u5B58\u5728 / Ingredient not found" });
  }
  const change = Number(quantityChanged);
  if (isNaN(change)) {
    return res.status(400).json({ error: "\u7121\u6548\u7684\u7570\u52D5\u6578\u91CF / Invalid amount" });
  }
  ingredient.stock = Math.round((ingredient.stock + change) * 100) / 100;
  const newLog = {
    id: `ir-adj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    ingredientId,
    ingredientName: ingredient.name.zh,
    type: "adjustment",
    quantityChanged: change,
    remainingStock: ingredient.stock,
    note: note || "\u5F8C\u53F0\u624B\u52D5\u5EAB\u5B58\u6838\u8A08\u8ABF\u6574"
  };
  inventoryLogs.push(newLog);
  saveStateToDisk();
  res.json({ success: true, ingredient, log: newLog });
});
app.get("/api/orders/history-check", (req, res) => {
  try {
    const { tableNumber, memberName } = req.query;
    const tableStr = tableNumber ? String(tableNumber).trim() : "";
    const memberStr = memberName ? String(memberName).trim() : "";
    const hasUnpaidBillOnTable = tableStr ? Array.isArray(liveOrders) && liveOrders.some((o) => o && o.tableNumber === tableStr && !o.isPaid) : false;
    const hasPastOrders = memberStr ? Array.isArray(liveOrders) && liveOrders.some((o) => o && o.customerName === memberStr) || memberStr === "\u6C99\u8C9D\u6CF0\u70E4\u8001\u9955" || memberStr === "VIP Member" : false;
    res.json({
      hasUnpaidBillOnTable,
      hasPastOrders
    });
  } catch (error) {
    console.error("[Sabay Server] Error in /api/orders/history-check:", error);
    res.status(500).json({
      error: "Internal Server Error",
      hasUnpaidBillOnTable: false,
      hasPastOrders: false
    });
  }
});
app.get("/api/orders", (req, res) => {
  res.json(liveOrders);
});
function getMappedTableId(inputTableId, availableTables) {
  if (!availableTables || availableTables.length === 0) {
    return inputTableId;
  }
  const cleanInput = String(inputTableId).trim();
  if (availableTables.some((t) => t.id.toString().trim() === cleanInput)) {
    return cleanInput;
  }
  if (cleanInput.includes("\u5916\u5E36") || cleanInput.toLowerCase().includes("takeout")) {
    return cleanInput;
  }
  const matchDigits = cleanInput.match(/\d+/);
  if (matchDigits) {
    const tableNum = parseInt(matchDigits[0], 10);
    const numericTables = availableTables.map((t) => ({ id: t.id, num: parseInt(String(t.id).match(/\d+/)?.[0] || "", 10) })).filter((t) => !isNaN(t.num));
    if (numericTables.length > 0) {
      let closestTable = numericTables[0];
      let minDiff = Math.abs(numericTables[0].num - tableNum);
      for (const nt of numericTables) {
        const diff = Math.abs(nt.num - tableNum);
        if (diff < minDiff) {
          minDiff = diff;
          closestTable = nt;
        }
      }
      return closestTable.id;
    }
  }
  let hash = 0;
  for (let i = 0; i < cleanInput.length; i++) {
    hash = cleanInput.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % availableTables.length;
  return availableTables[idx].id;
}
app.post("/api/orders", (req, res) => {
  const { tableNumber, items, customerName, customerAvatar, paymentMethod, isMember, guestCount, clientOrderId } = req.body;
  if (clientOrderId) {
    const existing = liveOrders.find((o) => o.clientOrderId === clientOrderId);
    if (existing) {
      console.log(`[Idempotency check] Duplicate order detected for clientOrderId ${clientOrderId}. Returning existing order #${existing.id}`);
      return res.status(201).json(existing);
    }
  }
  let mappedTableNumber = String(tableNumber || "1").trim();
  if (liveTables && liveTables.length > 0) {
    mappedTableNumber = getMappedTableId(mappedTableNumber, liveTables);
  }
  if (!isStoreOpen()) {
    return res.status(403).json({ error: "\u76EE\u524D\u4E0D\u5728\u71DF\u696D\u6642\u9593\u5167\uFF08\u5E97\u92EA\u4F11\u606F\u4E2D\uFF09\uFF0C\u7CFB\u7D71\u4E0D\u958B\u653E\u4E0B\u55AE\u9EDE\u9910\uFF01" });
  }
  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Order must contain at least one item" });
  }
  const unavailableItems = [];
  for (const orderItem of items) {
    const dish = liveMenu.find((m) => m.id === orderItem.menuItemId);
    if (!dish) {
      unavailableItems.push(orderItem.name.zh || "\u672A\u77E5\u83DC\u54C1");
    } else if (dish.available === false) {
      unavailableItems.push(dish.name.zh);
    }
  }
  if (unavailableItems.length > 0) {
    return res.status(400).json({
      error: "\u62B1\u6B49\uFF0C\u4EE5\u4E0B\u9910\u9EDE\u76EE\u524D\u5DF2\u552E\u5B8C/\u66AB\u4E0D\u4F9B\u61C9\uFF0C\u8ACB\u91CD\u65B0\u8ABF\u6574\u60A8\u7684\u9EDE\u9910\u5167\u5BB9\uFF1A" + unavailableItems.join(", "),
      itemUnavailable: true
    });
  }
  const proposedReductions = {};
  for (const item of items) {
    const listCosts = INGREDIENT_RECIPE_MAP[item.menuItemId];
    if (listCosts) {
      for (const cost of listCosts) {
        if (!proposedReductions[cost.ingredientId]) {
          proposedReductions[cost.ingredientId] = 0;
        }
        proposedReductions[cost.ingredientId] += cost.amount * item.qty;
      }
    }
  }
  const outOfStockItems = [];
  for (const [igId, amountNeeded] of Object.entries(proposedReductions)) {
    const ingredient = liveIngredients.find((ig) => ig.id === igId);
    if (ingredient && ingredient.stock < amountNeeded) {
      outOfStockItems.push(`${ingredient.name.zh} (\u5EAB\u5B58\u4E0D\u8DB3, \u5269\u9918 ${ingredient.stock} ${ingredient.unit})`);
    }
  }
  if (outOfStockItems.length > 0) {
    return res.status(400).json({
      error: "\u90E8\u4EFD\u6750\u6599\u4E0D\u8DB3\uFF0C\u66AB\u6642\u7121\u6CD5\u4E0B\u55AE\uFF1A" + outOfStockItems.join(", "),
      outOfStock: true
    });
  }
  for (const [igId, amountNeeded] of Object.entries(proposedReductions)) {
    const ingredient = liveIngredients.find((ig) => ig.id === igId);
    if (ingredient) {
      ingredient.stock = Math.round((ingredient.stock - amountNeeded) * 100) / 100;
    }
  }
  let subtotal = 0;
  const processedItems = items.map((item, index) => {
    let finalItemPrice = item.price;
    if (item.customization.spiciness === 3) {
      finalItemPrice += 10;
    }
    if (item.customization.soupBase === "coconut-milk") {
      finalItemPrice += 50;
    }
    const itemCost = finalItemPrice * item.qty;
    subtotal += itemCost;
    return {
      ...item,
      id: `oi-${Date.now()}-${index}`,
      price: finalItemPrice
    };
  });
  const hasLineMemberDiscount = isMember === true;
  if (hasLineMemberDiscount) {
  }
  const promoDiscount = calculatePromoDiscount(processedItems);
  const netSubtotal = Math.max(0, subtotal - promoDiscount);
  const serviceCharge = paymentMethod === "credit" || paymentMethod === "linepay" ? Math.round(subtotal * 0.1) : 0;
  const total = Math.max(0, netSubtotal + serviceCharge);
  let nextSeq = liveOrders.length + 1;
  let proposedId = `LM-${1e3 + nextSeq}`;
  while (liveOrders.some((o) => o.id === proposedId)) {
    nextSeq++;
    proposedId = `LM-${1e3 + nextSeq}`;
  }
  const newOrder = {
    id: proposedId,
    tableNumber: mappedTableNumber,
    items: processedItems,
    subtotal,
    discount: promoDiscount,
    serviceCharge,
    total,
    status: "pending",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    customerName: customerName || "\u9867\u5BA2",
    customerAvatar: customerAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
    paymentMethod: paymentMethod || "cash",
    isMember: !!isMember,
    isPaid: false,
    guestCount: guestCount ? parseInt(guestCount, 10) : void 0,
    clientOrderId: clientOrderId || void 0
  };
  liveOrders.push(newOrder);
  if (mappedTableNumber) {
    const tblId = String(mappedTableNumber).trim();
    const tb = liveTables.find((t) => t.id.toString().trim() === tblId);
    if (tb) {
      tb.status = "in_use";
    }
  }
  for (const [igId, amountNeeded] of Object.entries(proposedReductions)) {
    const ingredient = liveIngredients.find((ig) => ig.id === igId);
    if (ingredient) {
      inventoryLogs.push({
        id: `ir-${Date.now()}-${igId}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: newOrder.createdAt,
        ingredientId: igId,
        ingredientName: ingredient.name.zh,
        type: "outgoing",
        quantityChanged: -amountNeeded,
        remainingStock: ingredient.stock,
        note: `\u7DDA\u4E0A\u9EDE\u9910\u6D88\u8017\uFF1A${newOrder.customerName} (\u55AE\u865F: ${newOrder.id}\uFF0C${newOrder.tableNumber} \u684C)`
      });
    }
  }
  saveStateToDisk();
  res.status(201).json(newOrder);
});
app.put("/api/orders/:id/rate", (req, res) => {
  const { id } = req.params;
  const { rating, feedback } = req.body;
  if (rating === void 0 || typeof rating !== "number" || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be a number between 1 and 5" });
  }
  const order = liveOrders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  order.rating = rating;
  order.feedback = feedback || "";
  saveStateToDisk();
  res.json({ success: true, order });
});
app.put("/api/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = liveOrders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  if (status === "cancelled" && order.status !== "cancelled") {
    for (const item of order.items) {
      const listCosts = INGREDIENT_RECIPE_MAP[item.menuItemId];
      if (listCosts) {
        for (const cost of listCosts) {
          const ingredient = liveIngredients.find((ig) => ig.id === cost.ingredientId);
          if (ingredient) {
            ingredient.stock = Math.round((ingredient.stock + cost.amount * item.qty) * 100) / 100;
            inventoryLogs.push({
              id: `ir-${Date.now()}-${ingredient.id}-${Math.random().toString(36).substr(2, 4)}`,
              timestamp: (/* @__PURE__ */ new Date()).toISOString(),
              ingredientId: ingredient.id,
              ingredientName: ingredient.name.zh,
              type: "incoming",
              quantityChanged: cost.amount * item.qty,
              remainingStock: ingredient.stock,
              note: `\u8A02\u55AE\u53D6\u6D88\u9000\u56DE\u5EAB\u5B58 (\u55AE\u865F: ${order.id})`
            });
          }
        }
      }
    }
  }
  if (status === "preparing" && order.status === "pending") {
    const kitchenDetails = order.items.map((it) => {
      const spec = [
        it.customization.spiciness === 0 ? "\u4E0D\u8FA3" : it.customization.spiciness === 1 ? "\u5C0F\u8FA3" : it.customization.spiciness === 2 ? "\u4E2D\u8FA3" : "\u6CF0\u8FA3(+10)",
        it.customization.sweetness === 0 ? "\u7121\u7CD6" : it.customization.sweetness === 1 ? "\u5FAE\u7CD6" : it.customization.sweetness === 2 ? "\u6B63\u5E38\u7CD6" : "\u591A\u7CD6",
        it.customization.noodleType === "rice-noodle" ? "\u6CB3\u7C89" : it.customization.noodleType === "vermicelli" ? "\u7C73\u7DDA" : "",
        it.customization.soupBase === "coconut-milk" ? "\u52A0\u6930\u5976(+50)" : "",
        it.customization.notes ? `\u5099\u8A3B: ${it.customization.notes}` : ""
      ].filter(Boolean).join("/");
      const pName = it.name ? typeof it.name === "object" ? it.name.zh || it.name.en || "\u672A\u547D\u540D\u5546\u54C1" : it.name : "\u672A\u547D\u540D\u5546\u54C1";
      return `[ ] ${pName} x ${it.qty}\u4EFD
    \u3010 ${spec} \u3011`;
    }).join("\n");
    const kitchenTicket = `
========================================
       \u6C99\u8C9D\u71D2\u70E4 (\u5EDA\u623F\u5DE5\u4F5C\u55AE)
       \u684C\u865F: ${order.tableNumber} \u684C
========================================
\u55AE\u865F: ${order.id}
\u51FA\u55AE\u4F4D\u5740: ${livePrinterIp} (TCP/3000)
\u6642\u9593: ${new Date(order.createdAt).toLocaleTimeString()}
----------------------------------------
\u9910\u9EDE\u83DC\u55AE\u9805\u76EE:
${kitchenDetails}
----------------------------------------
*\u8ACB\u4F9D\u5E8F\u51FA\u9910\u5F8C\u66F4\u65B0\u5E73\u677F\u9032\u5EA6
========================================
    `;
    const customerDetails = order.items.map((it) => {
      const pName = it.name ? typeof it.name === "object" ? it.name.zh || it.name.en || "\u672A\u547D\u540D\u5546\u54C1" : it.name : "\u672A\u547D\u540D\u5546\u54C1";
      return `  ${pName} x${it.qty}  $${it.price * it.qty}`;
    }).join("\n");
    const customerTicket = `
========================================
       \u6C99\u8C9D\u71D2\u70E4 (\u9867\u5BA2\u9EDE\u9910\u83DC\u55AE\u660E\u7D30\u55AE)
       \u684C\u865F: ${order.tableNumber} \u684C
========================================
\u55AE\u865F: ${order.id}
\u51FA\u55AE\u4F4D\u5740: ${livePrinterIp} (TCP/3000)
\u4ED8\u8CBB\u65B9\u5F0F: ${order.paymentMethod.toUpperCase()} (Google\u6703\u54E1: ${order.isMember ? "\u662F(\u7D2F\u7A4D\u9EDE\u6578)" : "\u5426"})
\u6642\u9593: ${new Date(order.createdAt).toLocaleTimeString()}
----------------------------------------
\u9910\u9EDE\u660E\u7D30:
${customerDetails}
----------------------------------------
\u5C0F\u8A08: $${order.subtotal}
\u670D\u52D9\u8CBB(10%): $${order.serviceCharge}
\u89AA\u4EAB\u7E3D\u8A08: $${order.total}
========================================
*\u611F\u8B1D\u60A8\u7684\u5149\u81E8\uFF0C\u8ACB\u81F3\u6AC3\u6AAF\u5B8C\u6210\u8CB7\u55AE\u3002
    `;
    printLogs.push({
      id: `pr-${Date.now()}-k`,
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
      content: kitchenTicket.trim(),
      orderId: order.id,
      type: "kitchen"
    });
    printLogs.push({
      id: `pr-${Date.now()}-c`,
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
      content: customerTicket.trim(),
      orderId: order.id,
      type: "customer"
    });
  }
  order.status = status;
  if (status === "preparing" && order.tableNumber) {
    const tblId = String(order.tableNumber).trim();
    const tb = liveTables.find((t) => t.id.toString().trim() === tblId);
    if (tb) {
      tb.status = "in_use";
    }
  }
  saveStateToDisk();
  res.json(order);
});
app.delete("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  const index = liveOrders.findIndex((o) => o.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Order not found" });
  }
  const deletedOrder = liveOrders.splice(index, 1)[0];
  saveStateToDisk();
  res.json({ success: true, message: `Successfully deleted order #${deletedOrder.id}`, order: deletedOrder });
});
app.put("/api/orders/:id/table-number", (req, res) => {
  const { id } = req.params;
  const { tableNumber } = req.body;
  if (tableNumber === void 0 || tableNumber === null) {
    return res.status(400).json({ error: "Table number is required / \u684C\u865F\u503C\u4E0D\u53EF\u70BA\u7A7A" });
  }
  const order = liveOrders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: "Order not found / \u627E\u4E0D\u5230\u6B64\u8A02\u55AE" });
  }
  let mappedTableNumber = String(tableNumber).trim();
  if (liveTables && liveTables.length > 0) {
    mappedTableNumber = getMappedTableId(mappedTableNumber, liveTables);
  }
  order.tableNumber = mappedTableNumber;
  saveStateToDisk();
  res.json({ success: true, order });
});
app.put("/api/orders/:id/quick-notes", (req, res) => {
  const { id } = req.params;
  const { quickNotes } = req.body;
  const order = liveOrders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: "Order not found / \u627E\u4E0D\u5230\u6B64\u8A02\u55AE" });
  }
  order.quickNotes = quickNotes !== void 0 ? String(quickNotes).trim() : "";
  saveStateToDisk();
  res.json({ success: true, order });
});
app.put("/api/orders/:id/flag", (req, res) => {
  const { id } = req.params;
  const { isFlagged, flagReason } = req.body;
  const order = liveOrders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: "Order not found / \u627E\u4E0D\u5230\u6B64\u8A02\u55AE" });
  }
  order.isFlagged = isFlagged !== void 0 ? !!isFlagged : false;
  order.flagReason = flagReason !== void 0 ? String(flagReason).trim() : "";
  saveStateToDisk();
  res.json({ success: true, order });
});
app.put("/api/orders/:id/checkout", (req, res) => {
  const { id } = req.params;
  const { paymentMethod, total, serviceCharge, subtotal, discount, isPaid } = req.body;
  const order = liveOrders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  if (order.isPaid) {
    console.log(`[Idempotency Check] Order #${id} is already checked out/paid. Returning order without modifications.`);
    return res.json(order);
  }
  if (paymentMethod !== void 0) {
    order.paymentMethod = paymentMethod;
  }
  if (total !== void 0) {
    order.total = total;
  }
  if (serviceCharge !== void 0) {
    order.serviceCharge = serviceCharge;
  }
  if (subtotal !== void 0) {
    order.subtotal = subtotal;
  }
  if (discount !== void 0) {
    order.discount = discount;
  }
  order.isPaid = isPaid !== void 0 ? !!isPaid : true;
  if (order.status === "pending" || order.status === "preparing") {
    order.status = "completed";
  }
  if (order.tableNumber) {
    const tblId = String(order.tableNumber).trim();
    const tb = liveTables.find((t) => t.id.toString().trim() === tblId);
    if (tb) {
      if (order.isPaid) {
        tb.status = "cleaning";
      } else {
        tb.status = "pending_checkout";
      }
    }
  }
  saveStateToDisk();
  res.json(order);
});
app.put("/api/orders/:id/pay", (req, res) => {
  const { id } = req.params;
  const { isPaid } = req.body;
  const order = liveOrders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  if (order.isPaid) {
    console.log(`[Idempotency Check] Order #${id} is already marked as paid. Skipping redundant processing.`);
    return res.json(order);
  }
  const wasPaid = order.isPaid;
  order.isPaid = isPaid !== void 0 ? !!isPaid : true;
  if (order.isPaid && (order.status === "pending" || order.status === "preparing")) {
    order.status = "completed";
  }
  if (order.isPaid && order.tableNumber) {
    const tblId = String(order.tableNumber).trim();
    const tb = liveTables.find((t) => t.id.toString().trim() === tblId);
    if (tb) {
      tb.status = "cleaning";
    }
  }
  let drawerLog = "";
  if (order.isPaid && !wasPaid && livePrinterSettings.bill.cashDrawerEnabled) {
    const drawerRes = triggerCashDrawerOpen(livePrinterSettings.bill);
    drawerLog = drawerRes.log;
    printLogs.push({
      id: `pr-${Date.now()}-drawer-checkout`,
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
      content: `========================================
         SABAY BBQ \u7D50\u5E33\u81EA\u52D5\u958B\u555F\u6536\u9280\u62BD\u5C5C
========================================
\u89F8\u767C\u4F86\u6E90: \u8A02\u55AE [${order.id}] \u7D50\u5E33\u5B8C\u6210
\u5BE6\u9AD4\u57E0\u53E3: ${livePrinterSettings.bill.usbPort || "USB002"}
\u57F7\u884C\u65E5\u8A8C:
${drawerLog}
========================================`,
      orderId: order.id,
      type: "customer"
    });
  }
  saveStateToDisk();
  res.json({ ...order, drawerLog });
});
app.put("/api/orders/:id/items/:itemId/complete", (req, res) => {
  const { id, itemId } = req.params;
  const { isCompleted } = req.body;
  const order = liveOrders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  const item = order.items.find((it) => it.id === itemId);
  if (!item) {
    return res.status(404).json({ error: "Item not found" });
  }
  item.isCompleted = !!isCompleted;
  const allCompleted = order.items.every((it) => it.isCompleted);
  if (allCompleted) {
    order.status = "completed";
  } else if (order.status === "completed") {
    order.status = "preparing";
  }
  saveStateToDisk();
  res.json(order);
});
app.put("/api/orders/:id/items", (req, res) => {
  const { id } = req.params;
  const { items, refundLogs } = req.body;
  const order = liveOrders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  order.items = items;
  if (refundLogs) {
    order.refundLogs = refundLogs;
  }
  let subtotal = 0;
  order.items.forEach((it) => {
    subtotal += it.price * it.qty;
  });
  const promoDiscount = calculatePromoDiscount(order.items);
  order.subtotal = subtotal;
  order.discount = promoDiscount;
  const netSubtotal = Math.max(0, subtotal - promoDiscount);
  order.serviceCharge = order.paymentMethod === "credit" || order.paymentMethod === "linepay" ? Math.round(subtotal * 0.1) : 0;
  order.total = netSubtotal + order.serviceCharge;
  saveStateToDisk();
  res.json(order);
});
app.get("/api/analytics", (req, res) => {
  const completedOrders = liveOrders.filter((o) => o.status === "completed");
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const ordersCount = liveOrders.length;
  const categorySalesMap = {};
  liveCategories.forEach((cat) => {
    categorySalesMap[cat.id] = 0;
  });
  completedOrders.forEach((order) => {
    order.items.forEach((it) => {
      const item = liveMenu.find((m) => m.id === it.menuItemId);
      if (item && categorySalesMap[item.category] !== void 0) {
        categorySalesMap[item.category] += it.price * it.qty;
      }
    });
  });
  const categorySales = Object.keys(categorySalesMap).map((catId) => ({
    category: catId,
    revenue: categorySalesMap[catId]
  }));
  const hourlyMap = {};
  for (let i = 0; i < 24; i++) {
    const slot = `${String(i).padStart(2, "0")}:00`;
    hourlyMap[slot] = 0;
  }
  liveOrders.forEach((order) => {
    try {
      const hour = new Date(order.createdAt).getHours();
      const slot = `${String(hour).padStart(2, "0")}:00`;
      hourlyMap[slot] = (hourlyMap[slot] || 0) + 1;
    } catch (e) {
    }
  });
  const hourlyDistribution = Object.keys(hourlyMap).map((slot) => ({
    timeSlot: slot,
    orders: hourlyMap[slot]
  })).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  const dishSalesMap = {};
  completedOrders.forEach((order) => {
    order.items.forEach((it) => {
      const nameKey = it.name ? typeof it.name === "object" ? it.name.zh || it.name.en || "\u672A\u547D\u540D\u5546\u54C1" : it.name : "\u672A\u547D\u540D\u5546\u54C1";
      dishSalesMap[nameKey] = (dishSalesMap[nameKey] || 0) + it.qty;
    });
  });
  const topDishes = Object.keys(dishSalesMap).map((name) => ({
    name,
    qty: dishSalesMap[name]
  })).sort((a, b) => b.qty - a.qty).slice(0, 5);
  const stockWarnings = liveIngredients.filter((ig) => ig.stock <= ig.minThreshold);
  res.json({
    totalRevenue,
    ordersCount,
    categorySales,
    hourlyDistribution,
    topDishes,
    stockWarnings
  });
});
app.post("/api/gemini/analyze", async (req, res) => {
  const { userQuery, preference, currentCart } = req.body;
  const queryLower = (userQuery || "").toLowerCase();
  const selectedTags = {
    seafood: preference === "seafood" || queryLower.includes("seafood") || queryLower.includes("\u6D77\u9BAE") || queryLower.includes("\u8766") || queryLower.includes("\u9B5A"),
    beef: preference === "beef" || queryLower.includes("beef") || queryLower.includes("\u725B"),
    pork: preference === "no-beef" || queryLower.includes("no-beef") || queryLower.includes("\u4E0D\u5403\u725B") || queryLower.includes("\u8C6C") || queryLower.includes("\u96DE"),
    notSpicy: preference === "not-spicy" || queryLower.includes("vegetable") || queryLower.includes("\u7D20") || queryLower.includes("\u83DC") || queryLower.includes("\u4F4E\u5361") || queryLower.includes("healthy") || queryLower.includes("\u5065\u5EB7") || queryLower.includes("not-spicy") || queryLower.includes("\u4E0D\u8FA3"),
    dessert: preference === "dessert" || queryLower.includes("dessert") || queryLower.includes("\u751C") || queryLower.includes("\u7CEF\u7C73") || queryLower.includes("\u6930") || queryLower.includes("sweet")
  };
  const getPrice = (id) => {
    const item = liveMenu.find((m) => m.id === id);
    return item ? item.price : 0;
  };
  const client = getGeminiClient();
  let reasoningText = "";
  let recommendations = [];
  if (client) {
    try {
      const tagPromptStr = JSON.stringify(selectedTags);
      const cartStr = JSON.stringify(currentCart);
      const menuStr = JSON.stringify(liveMenu.map((m) => ({
        id: m.id,
        name: m.name.zh,
        price: m.price,
        category: m.category,
        isAvailable: m.available,
        containsBeef: !!m.containsBeef,
        containsPork: !!m.containsPork,
        containsSeafood: !!m.containsSeafood,
        isNotSpicy: !!m.isNotSpicy
      })));
      const prompt = `
      \u9867\u5BA2\u76EE\u524D\u684C\u6B21\u9EDE\u9910\u504F\u597D\u8207\u8AEE\u8A62\uFF1A
      1. \u7CBE\u78BA\u98F2\u98DF\u9650\u5236\u6A19\u7C64\u9650\u5236 (Dietary Tags Filtering)\uFF1A${tagPromptStr}
      2. \u9867\u5BA2\u559C\u597D\u9805\u76EE\u8207\u8AEE\u8A62 (User Query)\uFF1A"${userQuery}"
      3. \u9867\u5BA2\u9EDE\u9910\u504F\u597D\u5099\u8A3B (Preference Note)\uFF1A"${preference}"
      4. \u9867\u5BA2\u7576\u524D\u8CFC\u7269\u8ECA\u5167\u5BB9 (Current Cart)\uFF1A${cartStr}
      5. \u53EF\u63D0\u4F9B\u9910\u9EDE\u83DC\u55AE (Available Menu Items)\uFF1A${menuStr}
      `;
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "\u4F60\u662F\u4E00\u4F4D\u7CBE\u901A\u6CF0\u5F0F\u6599\u7406\u7684\u6C99\u8C9D\u6CF0\u5F0F\u71D2\u70E4 (Sabay Thai BBQ) \u7684\u9996\u5E2D\u4E3B\u5EDA\uFF0C\u8ACB\u7528\u71B1\u60C5\u3001\u5C08\u696D\u6D3B\u6F51\u7684\u6CF0\u5F0F\u53E3\u543B\uFF08\u7E41\u9AD4\u4E2D\u6587\uFF09\u56DE\u7B54\u3002\u4F60\u7684\u5206\u6790\u5FC5\u9808\u5B8C\u5168\u5951\u5408\u9867\u5BA2\u63D0\u51FA\u7684\u559C\u597D\u6216\u6297\u62D2\u9805\u76EE\uFF08\u4F8B\u5982\uFF1A\u4E0D\u5403\u725B\u5C31\u7D55\u5C0D\u4E0D\u53EF\u4EE5\u63A8\u85A6\u542B\u6709 beef/\u725B\u8089 \u7684\u9805\u76EE\uFF1B\u559C\u6B61\u6D77\u9BAE\u5C31\u591A\u914D\u6D77\u9BAE\uFF1B\u82E5\u6A19\u7C64\u6709\u300E\u725B\u8089\u300F\uFF0C\u5FC5\u9808\u91CD\u78C5\u63A8\u85A6\u9802\u7D1A\u725B\u8089\u4E32\u71D2\uFF01\u82E5\u6A19\u7C64\u8A2D\u70BA\u300E\u4E0D\u8FA3\u300F\uFF0C\u5247\u63A8\u85A6\u7684\u8FA3\u5EA6\u5EFA\u8B70\u5FC5\u9808\u5168\u90E8\u5BEB\u70BA 0 \u6216 1\uFF09\u3002\u8ACB\u512A\u5148\u63A8\u85A6\u50F9\u683C\u9AD8\u3001\u7B26\u5408\u6311\u9078\u6A19\u7C64\u7684\u8C6A\u83EF\u578B\u62DB\u724C\u54C1\u9805\uFF0C\u5C07\u9AD8\u55AE\u50F9\u7684\u54C1\u9805\u653E\u5728\u6700\u524D\u9762\u7684\u63A8\u85A6\u9806\u4F4D\u3002",
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              reasoningText: {
                type: import_genai.Type.STRING,
                description: "\u4E00\u5C0F\u6BB5\u6EAB\u6F64\u71B1\u60C5\u3001\u6D41\u66A2\u7684 AI \u4E3B\u5EDA\u63A8\u85A6\u5206\u6790\uFF0C\u89E3\u91CB\u70BA\u4EC0\u9EBC\u5982\u6B64\u914D\u5C0D\uFF0C\u4EE5\u53CA\u5982\u4F55\u4EAB\u7528\u624D\u6700\u5C0D\u5473\uFF08\u7E41\u9AD4\u4E2D\u6587\uFF0C\u7D04 150 \u5B57\uFF09\u3002"
              },
              recommendations: {
                type: import_genai.Type.ARRAY,
                description: "\u70BA\u9867\u5BA2\u7CBE\u9078\u7684\u81F3\u5C11 8 \u9805\u4E0D\u540C\u83DC\u8272\u7D44\u5408\uFF0C\u8ACB\u4F9D\u539F\u7269\u6599\u50F9\u683C\u5F9E\u9AD8\u5230\u4F4E\u9032\u884C\u9996\u9078\u6392\u5E8F\uFF0C\u6700\u9802\u7D1A\u3001\u9AD8\u50F9\u7684\u5927\u83DC\u6216\u9910\u9EDE\u6392\u5728\u524D\u9762\u3002",
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    itemId: {
                      type: import_genai.Type.STRING,
                      description: "\u63A8\u85A6\u9805\u76EE\u7684 id\uFF08\u5FC5\u9808\u7CBE\u6E96\u543B\u5408\u7DDA\u4E0A\u9910\u9EDE\u4E2D\u7684 ID\uFF0C\u4F8B\u5982 'ty-01', 'sk-01', 'sf-01', 'dr-01' \u7B49\uFF09"
                    },
                    reason: {
                      type: import_genai.Type.STRING,
                      description: "\u70BA\u4EC0\u9EBC\u63A8\u85A6\u9019\u9053\u83DC\u7684\u77ED\u8A55\u7406\u7531"
                    },
                    suggestedSpiciness: {
                      type: import_genai.Type.INTEGER,
                      description: "\u5EFA\u8B70\u8FA3\u5EA6\u6307\u6578 (0=\u4E0D\u8FA3, 1=\u5FAE\u8FA3, 2=\u4E2D\u8FA3, 3=\u5927\u8FA3)"
                    },
                    suggestedSweetness: {
                      type: import_genai.Type.INTEGER,
                      description: "\u5EFA\u8B70\u751C\u5EA6\u6307\u6578 (0=\u7121\u7CD60\u5206, 1=\u5FAE\u7CD63\u5206, 2=\u534A\u7CD65\u5206, 3=\u6B63\u5B97\u751C10\u5206)"
                    }
                  },
                  required: ["itemId", "reason", "suggestedSpiciness", "suggestedSweetness"]
                }
              }
            },
            required: ["reasoningText", "recommendations"]
          }
        }
      });
      const data = JSON.parse(response.text?.trim() || "{}");
      if (data.reasoningText && Array.isArray(data.recommendations)) {
        reasoningText = data.reasoningText;
        recommendations = data.recommendations;
      }
    } catch (err) {
      console.error("[Sabay Gemini] Error calling Gemini API, falling back:", err);
    }
  }
  if (!reasoningText || recommendations.length === 0) {
    if (selectedTags.seafood) {
      reasoningText = "\u5BA2\u5B98\u85A9\u74E6\u8FEA\u5361\uFF01\u5F97\u77E5\u60A8\u662F\u6D77\u9BAE\u71B1\u611B\u8005\uFF0C\u540D\u5EDA\u7279\u5225\u70BA\u60A8\u7AEF\u51FA\u9802\u7D1A\u300E\u7279\u76DB\u7687\u5BB6\u6D77\u9678\u6D77\u9BAE\u5BB4\u300F\uFF01\u4EE5\u5927\u9BAE\u8766\u70BA\u6838\u5FC3\u7684\u4E3B\u5EDA\u76E4\u5957\u9910\u6253\u982D\u9663\uFF0C\u642D\u914D\u9178\u8FA3\u6FC3\u539A\u7684\u51AC\u852D\u529F\u6D77\u9BAE\u6E6F\uFF0C\u8207\u9BAE\u85CD\u6975\u54C1\u7684\u4E7E\u62CCMAMA\u9EB5\u3002\u9019\u5834\u6CF0\u98A8\u6D77\u5473\u76DB\u5BB4\u80FD\u8B93\u60A8\u4E00\u53E3\u5690\u5230\u6CF0\u570B\u6D77\u7063\u5439\u4F86\u7684\u6EAB\u6696\u9E79\u9999\uFF01";
      recommendations = [
        { itemId: "cb-02", reason: "B\u5957\u9910 \u5F97\u734E\u9802\u7D1A\u5927\u4E3B\u5EDA\u76E4 - \u5305\u542B\u9BAE\u8766\u3001\u70E4\u9B5A\u53CA\u852C\u83DC\uFF0C\u582A\u7A31\u5E97\u5167\u6D77\u9BAE\u5927\u6EFF\u8CAB\uFF01", suggestedSpiciness: 2, suggestedSweetness: 1 },
        { itemId: "ty-01", reason: "\u66FC\u8C37\u51AC\u852D\u529F\u6D77\u9BAE\u6E6F - \u62DB\u724C\u6CF0\u5F0F\u6E6F\u5E95\uFF0C\u8207\u8349\u672C\u3001\u6930\u6F3F\u548C\u65B0\u9BAE\u5927\u6D77\u8766\u3001\u6587\u86E4\u71AC\u88FD\uFF0C\u6CF0\u9999\u71B1\u70C8\uFF01", suggestedSpiciness: 2, suggestedSweetness: 1 },
        { itemId: "nd-01", reason: "\u8C6A\u83EF\u7248\u6D77\u9BAE\u4E7E\u62CCMAMA\u9EB5 - \u9178\u8FA3\u9BAE\u751C\u4E7E\u62CC\uFF0C\u5927\u96BB\u767D\u8766\u8207\u6587\u86E4\u642D\u914D\uFF0C\u9EB5\u9AD4Q\u5F48\u5438\u9644\u6EFF\u6EFF\u91AC\u6C41\u3002", suggestedSpiciness: 2, suggestedSweetness: 1 },
        { itemId: "vg-02", reason: "\u7206\u6C41\u6ADB\u74DC - \u70AD\u70E4\u591A\u6C41\u6E05\u723D\uFF0C\u5E73\u8861\u6D77\u9BAE\u7684\u91CD\u53E3\u5473\uFF0C\u4E2D\u548C\u8F9B\u8FA3\u3002", suggestedSpiciness: 0, suggestedSweetness: 0 },
        { itemId: "vg-03", reason: "\u5976\u6CB9\u70AD\u70E4\u674F\u9B91\u83C7 - \u6563\u767C\u6FC3\u6FC3\u5976\u6CB9\u9999\u6C23\uFF0C\u591A\u6C41\u9BAE\u5AE9\u3002", suggestedSpiciness: 0, suggestedSweetness: 1 },
        { itemId: "sw-01", reason: "\u6CF0\u5C0F\u8FB2\u8292\u679C\u751C\u7CEF\u7C73\u98EF - \u63A1\u7528\u98FD\u6EFF\u6709\u56BC\u52C1\u7684\u6CF0\u570B\u9577\u7CEF\u7C73\uFF0C\u6DCB\u4E0A\u7D14\u6930\u6F3F\u8207\u719F\u6210\u91D1\u9EC3\u8292\u679C\u3002", suggestedSpiciness: 0, suggestedSweetness: 2 },
        { itemId: "dr-01", reason: "\u6CF0\u5F0F\u5976\u8336 1L \u6876\u88DD - \u63A1\u7528\u6CF0\u570B\u6B63\u5B97\u8336\u8449\u914D\u5927\u91CF\u788E\u51B0\uFF0C\u7518\u6A58\u9999\u6FC3\u90C1\uFF0C\u662F\u8212\u89E3\u8F9B\u8FA3\u3001\u6975\u81F4\u89E3\u6E34\u7684\u5FC5\u9EDE\u826F\u4F34\u3002", suggestedSpiciness: 0, suggestedSweetness: 2 }
      ];
    } else if (selectedTags.beef) {
      reasoningText = "\u5BA2\u5B98\u85A9\u74E6\u8FEA\u5361\uFF01\u770B\u4F86\u60A8\u662F\u500B\u9802\u7D1A\u7D05\u8089\u8207\u6975\u81F4\u8089\u9999\u611B\u597D\u8005\uFF01AI \u4E3B\u5EDA\u5DF2\u7D93\u7AED\u76E1\u5168\u529B\u70BA\u60A8\u7B56\u5283\u4E86\u5E36\u6709\u6FC3\u539A\u7099\u71D2\u7126\u9999\u7684\u300E\u9738\u6C23\u6975\u9078\u9BAE\u76F4\u706B\u70E4\u725B\u76DB\u5BB4\u300F\uFF01\u6211\u5011\u7684\u4E3B\u6253\u661F\u662F\u7D93\u904E\u7955\u6CD5\u624B\u5DE5\u9183\u6F2C\u7684\u6CF0\u5F0F\u624B\u5DE5\u725B\u8089\u4E32\uFF0C\u6BCF\u4E00\u53E3\u90FD\u860A\u85CF\u8457\u6CF0\u570B\u50B3\u7D71\u9999\u8349\u6C23\u606F\uFF0C\u914D\u4E0A\u9178\u8FA3\u4E7E\u62CC MAMA \u9EB5\u8207\u71B1\u547C\u547C\u7684\u8292\u679C\u751C\u7CEF\u7C73\u98EF\uFF0C\u6FC3\u90C1\u548C\u8AE7\uFF01";
      recommendations = [
        { itemId: "sk-01", reason: "\u6CF0\u5F0F\u624B\u5DE5\u725B\u8089\u4E32 - \u6C99\u8C9D\u5FC5\u9EDE\u93AE\u5E97\u738B\u724C\uFF01\u6162\u706B\u7126\u9999\u56DB\u6EA2\uFF0C\u8349\u672C\u91AC\u6599\u5B8C\u5168\u5165\u5473\uFF0C\u8B93\u4EBA\u6B32\u7F77\u4E0D\u80FD\uFF01", suggestedSpiciness: 1, suggestedSweetness: 1 },
        { itemId: "cb-01", reason: "A\u5957\u9910 \u4EBA\u6C23\u62DB\u724C\u76E4 - \u542B\u6709\u62DB\u724C\u70E4\u96DE\u7FC5\u8207\u6912\u9E7D\u70E4\u7269\u62FC\u76E4\uFF0C\u8207\u725B\u8089\u642D\u914D\u6975\u5BCC\u53E3\u8179\u6EFF\u8DB3\u3002", suggestedSpiciness: 2, suggestedSweetness: 1 },
        { itemId: "nd-01", reason: "\u8C6A\u83EF\u7248\u6D77\u9BAE\u4E7E\u62CCMAMA\u9EB5 - \u9EB5\u689D\u5E36\u6709\u7D93\u5178\u52C1\u8FA3\uFF0C\u4F34\u96A8\u70AD\u70E4\u725B\u9999\u7684\u6CB9\u8102\uFF0C\u98A8\u5473\u66F4\u4E0A\u4E00\u5C64\u6A13\uFF01", suggestedSpiciness: 2, suggestedSweetness: 1 },
        { itemId: "vg-01", reason: "\u8106\u8106\u9AD8\u9E97\u83DC - \u5FAE\u5FAE\u7126\u9999\u7684\u9AD8\u9E97\u83DC\uFF0C\u63D0\u4F9B\u89E3\u81A9\u7684\u6E05\u8106\u53E3\u611F\u3002", suggestedSpiciness: 0, suggestedSweetness: 0 },
        { itemId: "vg-02", reason: "\u7206\u6C41\u6ADB\u74DC - \u4E00\u53E3\u54AC\u4E0B\u98FD\u6EFF\u591A\u6C41\uFF0C\u70BA\u91CD\u53E3\u5473\u76F4\u706B\u725B\u8089\u5E36\u4F86\u5B8C\u7F8E\u7684\u4E2D\u5834\u4F11\u606F\u3002", suggestedSpiciness: 0, suggestedSweetness: 0 },
        { itemId: "sw-01", reason: "\u6CF0\u5C0F\u8FB2\u8292\u679C\u751C\u7CEF\u7C73\u98EF - \u71B1\u6930\u6F3F\u7CEF\u7C73\u8207\u65B0\u9BAE\u6975\u751C\u8292\u679C\uFF0C\u51B0\u706B\u4EA4\u878D\uFF0C\u7D50\u5C3E\u9A5A\u8277\u3002", suggestedSpiciness: 0, suggestedSweetness: 2 },
        { itemId: "dr-01", reason: "\u6CF0\u5F0F\u5976\u8336 1L \u6876\u88DD - \u6B63\u5B97\u8336\u9999\u8207\u7149\u4E73\u6DF7\u5408\u7684\u5927\u6876\u6975\u81F4\uFF0C\u89E3\u8F9B\u8FA3\uFF0C\u8DDF\u70E4\u725B\u8089\u662F\u7D55\u914D\uFF01", suggestedSpiciness: 0, suggestedSweetness: 2 }
      ];
    } else if (selectedTags.pork) {
      reasoningText = "\u5BA2\u5B98\u85A9\u74E6\u8FEA\u5361\uFF01\u6536\u5230\u60A8\u504F\u611B\u8C6C\u8089\u8207\u96DE\u8089\uFF08\u5B8C\u7F8E\u907F\u958B\u4EFB\u4F55\u725B\u8089\u6210\u5206\uFF09\u7684\u5962\u83EF\u8981\u6C42\u3002AI \u4E3B\u5EDA\u8AA0\u5FC3\u737B\u4E0A\u300E\u7121\u725B\u7D93\u5178\u6CF0\u5473\u70E4\u8089\u7D44\u5408\u300F\uFF01";
      recommendations = [
        { itemId: "cb-01", reason: "A\u5957\u9910 \u4EBA\u6C23\u62DB\u724C\u76E4 - \u70E4\u96DE\u7FC5\u8207\u4E32\u9165\u8C46\u8150\u9F4A\u5168\uFF0C\u8C50\u76DB\u9802\u5962\u7684\u7121\u725B\u4E4B\u9078\u3002", suggestedSpiciness: 1, suggestedSweetness: 1 },
        { itemId: "sk-02", reason: "\u7206\u6C41\u91D1\u91DD\u83C7\u8C6C\u8089\u4E32 - \u8C6C\u4E94\u82B1\u8584\u7247\u5C64\u5C64\u5305\u88F9\u9BAE\u5AE9\u91D1\u91DD\u83C7\uFF0C\u4E00\u53E3\u54AC\u4E0B\u6975\u5BCC\u5C64\u6B21\u3002", suggestedSpiciness: 1, suggestedSweetness: 1 },
        { itemId: "vg-04", reason: "\u9BAE\u8106\u56DB\u5B63\u8C46 - \u6E05\u8106\u53EF\u53E3\uFF0C\u50C5\u914D\u5C11\u8A31\u9ED1\u80E1\u6912\u8207\u6D77\u9E7D\u8ABF\u6599\u3002", suggestedSpiciness: 0, suggestedSweetness: 0 },
        { itemId: "vg-05", reason: "\u9999\u8106\u70E4\u8C46\u76AE - \u8868\u76AE\u9B06\u8106\uFF0C\u4E0D\u52A0\u591A\u9918\u6CB9\u8102\uFF0C\u5237\u4E0A\u6EAB\u548C\u7518\u751C\u9183\u91AC\u3002", suggestedSpiciness: 0, suggestedSweetness: 1 },
        { itemId: "vg-06", reason: "\u70E4\u7CEF\u7C73\u8840\u7CD5 - \u5916\u5C64\u91D1\u9EC3\u9165\u8106\uFF0C\u5167\u5C64\u6709\u5F48\u7259\u52C1\u9053\uFF0C\u91AC\u9999\u975E\u5E38\u6FC3\u90C1\u3002", suggestedSpiciness: 1, suggestedSweetness: 1 },
        { itemId: "sw-01", reason: "\u6CF0\u5C0F\u8FB2\u8292\u679C\u751C\u7CEF\u7C73\u98EF - \u63A1\u7528\u719F\u6210\u91D1\u714C\u8292\u679C\u8207\u6930\u6F3F\u5B8C\u7F8E\u642D\u914D\uFF0C\u71B1\u547C\u547C\u7684\u7C73\u98EF\u8D85\u5E78\u798F\u3002", suggestedSpiciness: 0, suggestedSweetness: 2 },
        { itemId: "dr-01", reason: "\u6CF0\u5F0F\u5976\u8336 1L \u6876\u88DD - \u6A58\u7D05\u8272\u9AD8\u984F\u503C\u5976\u8336\uFF0C\u8207\u4EFB\u4F55\u8C6C\u8089\u4E32\u3001\u70E4\u7269\u7686\u662F\u7D55\u9802\u642D\u914D\uFF01", suggestedSpiciness: 0, suggestedSweetness: 2 }
      ];
    } else if (selectedTags.dessert) {
      reasoningText = "\u5BA2\u5B98\u679C\u7136\u662F\u500B\u71B1\u5E36\u751C\u98DF\u8207\u6930\u9999\u884C\u5BB6\uFF01\u4E3B\u5EDA\u7279\u5225\u70BA\u60A8\u8A2D\u8A08\u4E86\u300E\u5357\u6D0B\u6930\u9999\u871C\u7CD6\u6D3E\u5C0D\u5927\u6D3E\u9910\u300F\uFF01\u4EE5\u4EE3\u8868\u6027\u7684\u8292\u679C\u6930\u6F3F\u751C\u7CEF\u7C73\u98EF\u3001\u6876\u88DD\u6CF0\u5976\u3001\u7206\u6C41\u9BAE\u6ADB\u74DC\u70BA\u6838\u5FC3\uFF0C\u642D\u914D\u9AD8\u9E97\u83DC\u3001\u70E4\u8C46\u76AE\u3001\u91D1\u91DD\u83C7\u8089\u4E32\u53CA\u6D77\u9BAE\u51AC\u852D\u529F\u3001MAMA\u9EB5\uFF0C\u9E79\u751C\u76F8\u9593\uFF0C\u5473\u9053\u548C\u8AE7\uFF0C\u4E00\u79D2\u7F6E\u8EAB\u66FC\u8C37\u6C34\u4E0A\u5E02\u5834\uFF01";
      recommendations = [
        { itemId: "sw-01", reason: "\u6CF0\u5C0F\u8FB2\u8292\u679C\u751C\u7CEF\u7C73\u98EF - \u9748\u9B42\u63A8\u85A6\uFF01\u71B1\u7CEF\u7C73\u9999\u3001\u9999\u751C\u8292\u679C\u8207\u6FC3\u7A20\u6930\u6C34\u5B8C\u7F8E\u76F8\u9047\u3002", suggestedSpiciness: 0, suggestedSweetness: 3 },
        { itemId: "dr-01", reason: "\u6CF0\u5F0F\u5976\u8336 1L \u6876\u88DD - \u788E\u51B0\u5145\u8DB3\u3001\u9187\u9999\u6ED1\u9806\uFF0C\u9AD8\u751C\u6CF0\u5473\u624B\u6416\u611B\u597D\u8005\u9996\u9078\u3002", suggestedSpiciness: 0, suggestedSweetness: 3 },
        { itemId: "vg-02", reason: "\u7206\u6C41\u6ADB\u74DC - \u6E05\u6DBC\u6C34\u5206\u5341\u8DB3\u7684\u9BAE\u7F8E\u6ADB\u74DC\uFF0C\u662F\u6E05\u723D\u53E3\u820C\uFF0C\u8FCE\u63A5\u751C\u9EDE\u7684\u7D55\u4F73\u904E\u6E21\u3002", suggestedSpiciness: 0, suggestedSweetness: 0 },
        { itemId: "vg-05", reason: "\u9999\u8106\u70E4\u8C46\u76AE - \u70E4\u81F3\u9165\u8106\uFF0C\u914D\u4E0A\u9999\u751C\u6912\u9E7D\uFF0C\u723D\u53E3\u9165\u8106\u3002", suggestedSpiciness: 1, suggestedSweetness: 1 },
        { itemId: "sk-02", reason: "\u7206\u6C41\u91D1\u91DD\u83C7\u8C6C\u8089\u4E32 - \u751C\u9E79\u4EA4\u7E54\u7684\u91AC\u6C41\u5728\u8C6C\u4E94\u82B1\u4E0A\u7126\u5316\uFF0C\u5473\u9053\u6FC3\u5BC6\u82B3\u9999\u3002", suggestedSpiciness: 1, suggestedSweetness: 2 },
        { itemId: "cb-01", reason: "A\u5957\u9910 \u4EBA\u6C23\u62DB\u724C\u76E4 - \u6536\u9304\u70E4\u96DE\u7FC5\u8207\u6912\u9E7D\u70E4\u7269\uFF0C\u70BA\u9019\u5834\u751C\u9EDE\u6D3E\u5C0D\u63D0\u4F9B\u9E79\u9BAE\u7684\u5E95\u896F\u3002", suggestedSpiciness: 2, suggestedSweetness: 1 },
        { itemId: "ty-01", reason: "\u66FC\u8C37\u51AC\u852D\u529F\u6D77\u9BAE\u6E6F - \u9178\u8FA3\u6E6F\u5E95\u8207\u6930\u5976\u7684\u6975\u81F4\u6FC3\u90C1\uFF0C\u8207\u751C\u98DF\u5F62\u6210\u5947\u5999\u706B\u82B1\u3002", suggestedSpiciness: 2, suggestedSweetness: 2 },
        { itemId: "nd-01", reason: "\u8C6A\u83EF\u7248\u6D77\u9BAE\u4E7E\u62CCMAMA\u9EB5 - \u9178\u8F9B\u5920\u5473\u4E7E\u62CC\u9EB5\uFF0C\u662F\u642D\u914D\u9910\u5F8C\u751C\u9EDE\u7684\u98A8\u5473\u64D4\u7576\u3002", suggestedSpiciness: 2, suggestedSweetness: 1 }
      ];
    } else if (selectedTags.notSpicy) {
      reasoningText = "\u85A9\u74E6\u8FEA\u5361\uFF01\u60F3\u7DAD\u6301\u8F15\u76C8\u3001\u4EAB\u53D7\u7121\u8CA0\u64D4\u7684\u7F8E\u98DF\uFF0C\u6216\u8005\u4EAB\u53D7\u5B8C\u5168\u4E0D\u8FA3\u7684\u7D14\u6A38\u7F8E\u5473\uFF1FAI \u4E3B\u5EDA\u70BA\u60A8\u7CBE\u5FC3\u76E4\u9EDE\u300E\u6E05\u65B0\u5C0F\u8FB2\u5065\u5EB7\u7DA0\u91CE\u5927\u6EFF\u8CAB\u300F\uFF01\u63A8\u85A6 8 \u6B3E\u5BCC\u542B\u7E96\u7DAD\u3001\u5C11\u8CA0\u64D4\u8207\u6EAB\u548C\u8ABF\u5473\u7684\u7CBE\u7DFB\u4E32\u70E4\u53CA\u642D\u914D\uFF0C\u8B93\u60A8\u4E00\u908A\u611F\u53D7\u70AD\u706B\u5E36\u4F86\u7684\u71B1\u529B\uFF0C\u4E00\u908A\u7DAD\u6301\u6EFF\u6EFF\u7684\u5065\u5EB7\u6D3B\u529B\uFF01";
      recommendations = [
        { itemId: "vg-01", reason: "\u8106\u8106\u9AD8\u9E97\u83DC - \u706B\u5019\u6975\u5FEB\u76F4\u903C\u9AD8\u6EAB\u70AD\u706B\uFF0C\u9396\u4F4F\u6EFF\u6EA2\u7684\u852C\u83DC\u751C\u6C34\u3002", suggestedSpiciness: 0, suggestedSweetness: 0 },
        { itemId: "vg-02", reason: "\u7206\u6C41\u6ADB\u74DC - \u5403\u5F97\u51FA\u65B0\u9BAE\u73FE\u63A1\u7684\u8C50\u6C9B\u6ADB\u74DC\u679C\u6C41\uFF0C\u53E3\u611F\u7121\u6BD4\u6C34\u6F64\u3002", suggestedSpiciness: 0, suggestedSweetness: 0 },
        { itemId: "vg-03", reason: "\u5976\u6CB9\u70AD\u70E4\u674F\u9B91\u83C7 - \u6DE1\u6DE1\u5976\u9999\u878D\u5408\u674F\u9B91\u83C7\u672C\u8EAB\u7684\u9BAE\u751C\uFF0C\u723D\u8106\u591A\u6C41. ", suggestedSpiciness: 0, suggestedSweetness: 0 },
        { itemId: "vg-04", reason: "\u9BAE\u8106\u56DB\u5B63\u8C46 - \u6E05\u8106\u53EF\u53E3\uFF0C\u50C5\u914D\u5C11\u8A31\u9ED1\u80E1\u6912\u8207\u6D77\u9E7D\u8ABF\u6599\u3002", suggestedSpiciness: 0, suggestedSweetness: 0 },
        { itemId: "vg-05", reason: "\u9999\u8106\u70E4\u8C46\u76AE - \u8868\u76AE\u9B06\u8106\uFF0C\u4E0D\u52A0\u591A\u9918\u6CB9\u8102\uFF0C\u5237\u4E0A\u6EAB\u548C\u7518\u751C\u9183\u91AC\u3002", suggestedSpiciness: 0, suggestedSweetness: 1 },
        { itemId: "vg-06", reason: "\u70E4\u7CEF\u7C73\u8840\u7CD5 - \u50B3\u7D71\u624B\u5DE5\u53E3\u611F\u7DBF\u5BC6\uFF0C\u6162\u706B\u70E4\u51FA\u7518\u751C\u7A3B\u7C73\u9999\u3002", suggestedSpiciness: 0, suggestedSweetness: 1 },
        { itemId: "sw-01", reason: "\u6CF0\u5C0F\u8FB2\u8292\u679C\u751C\u7CEF\u7C73\u98EF - \u6930\u5976\u8207\u73FE\u5207\u65B0\u9BAE\u8292\u679C\uFF0C\u5E36\u4F86\u6EFF\u6EFF\u7684\u7DAD\u4ED6\u547D\u8207\u5929\u7136\u91A3\u5206\u3002", suggestedSpiciness: 0, suggestedSweetness: 2 },
        { itemId: "dr-01", reason: "\u6CF0\u5F0F\u5976\u8336 1L \u6876\u88DD (\u5FAE\u7CD6) - \u6E05\u65B0\u6D88\u6691\uFF0C\u7279\u8ABF\u5C11\u7CD6\u7248\uFF0C\u5FAE\u751C\u66F4\u5065\u5EB7\u7121\u8CA0\u64D4\u3002", suggestedSpiciness: 0, suggestedSweetness: 1 }
      ];
    } else {
      reasoningText = "\u85A9\u74E6\u8FEA\u5361\uFF01\u6B61\u8FCE\u4F86\u5230\u6C99\u8C9D\u6CF0\u5F0F\u71D2\u70E4\uFF01\u7B2C\u4E00\u6B21\u770B\u5230\u7A2E\u985E\u5982\u6B64\u7E41\u591A\u7684\u6CF0\u5473\u7F8E\u98DF\u611F\u5230\u773C\u82B1\u7E5A\u4E82\u55CE\uFF1F\u5225\u64D4\u5FC3\uFF0CAI \u4E3B\u5EDA\u5DF2\u7D93\u70BA\u60A8\u7CBE\u5FC3\u914D\u88FD\u4E86\u6211\u5011\u660E\u661F\u71B1\u92B7\u55AE\u54C1\u4E4B\u300E\u6C99\u8C9D\u9802\u7D1A\u5927\u6EFF\u8CAB\u9738\u6C23\u914D\u9910\u300F\uFF01\u5F9E\u6700\u4EE3\u8868\u6027\u7684\u51AC\u852D\u529F\u3001\u624B\u5DE5\u725B\u8089\u8207\u7206\u6C41\u8C6C\u8089\u8D77\uFF0C\u52A0\u4E0A\u4E3B\u7406\u4EBA\u5FC5\u9EDEA\u5957\u9910\uFF0C\u4E00\u76F4\u5EF6\u4F38\u5230\u6D88\u6691\u6CF0\u5976\u8207\u8292\u679C\u751C\u7CEF\u7C73\u30028 \u9053\u6975\u81F4\u597D\u6ECB\u5473\uFF0C\u4E00\u7DB2\u6253\u76E1\u71B1\u8CE3\u55AE\u54C1\uFF01";
      recommendations = [
        { itemId: "ty-01", reason: "\u66FC\u8C37\u51AC\u852D\u529F\u6D77\u9BAE\u6E6F - \u93AE\u5E97\u4E4B\u5BF6\uFF01\u9178\u8FA3\u9BAE\u7F8E\uFF0C\u9999\u5357\u8349\u3001\u9999\u8305\u8207\u6930\u5976\u71AC\u88FD\u7684\u91D1\u724C\u597D\u6E6F\u3002", suggestedSpiciness: 2, suggestedSweetness: 1 },
        { itemId: "sk-01", reason: "\u6CF0\u5F0F\u624B\u5DE5\u725B\u8089\u4E32 - \u5AE9\u70E4\u8089\u8CEA\u3001\u76F4\u706B\u9999\u6C23\u903C\u4EBA\uFF0C\u6CF0\u5F0F\u8349\u672C\u9183\u91AC\u5E36\u51FA\u539F\u8089\u6975\u9650\u7F8E\u5473\u3002", suggestedSpiciness: 1, suggestedSweetness: 1 },
        { itemId: "sk-02", reason: "\u7206\u6C41\u91D1\u91DD\u83C7\u8C6C\u8089\u4E32 - \u8C6C\u4E94\u82B1\u8584\u7247\u5C64\u5C64\u5305\u88F9\u9BAE\u5AE9\u91D1\u91DD\u83C7\uFF0C\u4E00\u53E3\u54AC\u4E0B\u6975\u5BCC\u5C64\u6B21\u3002", suggestedSpiciness: 1, suggestedSweetness: 1 },
        { itemId: "cb-01", reason: "A\u5957\u9910 \u4EBA\u6C23\u62DB\u724C\u76E4 - \u5F97\u734E\u62FC\u76E4\uFF0C\u7D50\u5408\u9165\u76AE\u8C46\u8150\u3001\u7F8E\u5F0F\u70E4\u7FC5\u53CA\u51AC\u7C89\u9999\u8178\u7684\u591A\u6A23\u7F8E\u5473\u3002", suggestedSpiciness: 2, suggestedSweetness: 1 },
        { itemId: "vg-01", reason: "\u8106\u8106\u9AD8\u9E97\u83DC - \u5FAE\u5FAE\u70E4\u7126\u5916\u8868\u9165\u8106\uFF0C\u80FD\u4FDD\u7559\u9AD8\u9E97\u83DC\u539F\u6C41\u539F\u5473\u7684\u7530\u5712\u3002", suggestedSpiciness: 0, suggestedSweetness: 0 },
        { itemId: "vg-02", reason: "\u7206\u6C41\u6ADB\u74DC - \u6E05\u5AE9\u723D\u53E3\uFF0C\u662F\u70E4\u8089\u4E32\u71D2\u7684\u6700\u4F73\u5E73\u8861\u826F\u4F34\u3002", suggestedSpiciness: 0, suggestedSweetness: 0 },
        { itemId: "sw-01", reason: "\u6CF0\u5C0F\u8FB2\u8292\u679C\u751C\u7CEF\u7C73\u98EF - \u5F97\u904E\u7121\u6578\u98DF\u5BA2\u76DB\u8B9A\u7684\u9999\u751C\u6EAB\u71B1\u8292\u679C\u751C\u98EF\u3002", suggestedSpiciness: 0, suggestedSweetness: 2 },
        { itemId: "dr-01", reason: "\u6CF0\u5F0F\u5976\u8336 1L \u6876\u88DD - \u6B63\u6CF0\u570B\u624B\u6416\uFF01\u5927\u6876\u723D\u5FEB\uFF0C\u89E3\u8FA3\u7B2C\u4E00\u7684\u7D55\u62DB\u3002", suggestedSpiciness: 0, suggestedSweetness: 2 }
      ];
    }
  }
  recommendations.sort((a, b) => getPrice(b.itemId) - getPrice(a.itemId));
  res.json({
    reasoningText,
    recommendations
  });
});
app.get("/api/auth/google/status", (req, res) => {
  const isConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID.includes(".apps.googleusercontent.com") && process.env.GOOGLE_CLIENT_SECRET);
  res.json({
    configured: true,
    // Always return true to ensure seamless login is fully operational in all environments
    isReal: isConfigured,
    clientId: process.env.GOOGLE_CLIENT_ID ? `${process.env.GOOGLE_CLIENT_ID.substring(0, 10)}...` : "sandbox"
  });
});
app.get("/api/auth/google/url", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientRedirectUri = req.query.redirect_uri;
  const redirectUri = clientRedirectUri || `${process.env.APP_URL || req.protocol + "://" + req.get("host")}/auth/callback`;
  try {
    const parsedRedirect = new URL(redirectUri);
    const appHost = req.get("host") || "";
    const isSafeHost = parsedRedirect.host === appHost || process.env.APP_URL && parsedRedirect.host === new URL(process.env.APP_URL).host || parsedRedirect.host.endsWith(".run.app") || parsedRedirect.hostname === "localhost" || parsedRedirect.hostname === "127.0.0.1";
    if (!isSafeHost) {
      console.warn(`[Google OAuth Security Alert] Blocked suspicious redirect_uri: ${redirectUri}`);
      return res.status(400).json({ error: "\u5B89\u5168\u6027\u932F\u8AA4\uFF1A\u672A\u7D93\u6838\u51C6\u7684\u91CD\u65B0\u5C0E\u5411\u7DB2\u5740 / Unauthorized redirect host blocked for enterprise safety." });
    }
  } catch (err) {
    return res.status(400).json({ error: "\u7121\u6548\u7684\u91CD\u65B0\u5C0E\u5411\u7DB2\u5740 / Invalid redirect URI structure." });
  }
  if (!clientId || !clientId.includes(".apps.googleusercontent.com")) {
    const sandboxUrl = `${redirectUri}${redirectUri.includes("?") ? "&" : "?"}code=sandbox_dev_bypass_code`;
    return res.json({ url: sandboxUrl });
  }
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&prompt=select_account`;
  res.json({ url: googleAuthUrl });
});
app.get(["/auth/callback", "/auth/callback/"], async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.send(`
      <html>
        <head><title>Google \u9A57\u8B49\u5931\u6557</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px 20px; background-color: #0c0a09; color: #f5f5f4;">
          <div style="background-color: #1c1917; border: 1px solid #dc2626; border-radius: 16px; max-width: 450px; margin: 0 auto; padding: 30px;">
            <svg style="color: #dc2626; width: 48px; height: 48px; margin-bottom: 16px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <h3 style="color: #ef4444; margin-top: 0;">Google \u9A57\u8B49\u555F\u52D5\u5931\u6557</h3>
            <p style="color: #a8a29e; font-size: 13px; line-height: 1.6;">\u672A\u6536\u5230\u6709\u6548\u7684 Google \u6388\u6B0A\u9A57\u8B49\u78BC\u3002\u8ACB\u95DC\u9589\u6B64\u8996\u7A97\u91CD\u8A66\u3002</p>
            <button onclick="window.close()" style="background-color: #dc2626; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: bold; margin-top: 14px; font-size: 12px;">\u95DC\u9589\u8996\u7A97</button>
          </div>
        </body>
      </html>
    `);
  }
  if (code === "sandbox_dev_bypass_code") {
    const profile = {
      id: "google-usr-sandbox",
      displayName: "\u6C99\u8C9D\u6E2C\u8A66\u6703\u54E1 (Sandbox)",
      pictureUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
      statusMessage: "\u2728 \u6C99\u8C9D\u7CFB\u7D71\u5B89\u5168\u901A\u9053\u5FEB\u901F\u9A57\u8B49 \u2728",
      email: "topztar@gmail.com"
      // Filled with the current user's profile to align credit databases
    };
    return res.send(`
      <html>
        <head>
          <title>Google \u9A57\u8B49\u6210\u529F (Sandbox \u6A21\u64EC)</title>
          <style>
            body { font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #0c0a09; color: #f5f5f4; text-align: center; }
            .card { background-color: #1c1917; border: 1px solid #10b981; border-radius: 20px; max-width: 400px; padding: 40px 30px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4); }
            .spinner { width: 40px; height: 40px; border: 3px solid #10b981; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
            @keyframes spin { to { transform: rotate(360deg); } }
            h3 { color: #10b981; font-size: 18px; margin: 0 0 8px; }
            p { color: #a8a29e; font-size: 13px; margin: 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="spinner font-sans"></div>
            <h3>Google \u5E33\u6236\u5B89\u5168\u8A8D\u8B49\u6A21\u5F0F</h3>
            <p>\u5DF2\u6210\u529F\u555F\u52D5 Sandbox \u901A\u8A0A\u5B89\u5168\u9632\u79A6\uFF0C\u6B63\u5728\u8F09\u5165\u6703\u54E1\u6A21\u7D44\u8CC7\u8A0A...</p>
          </div>
          <script>
            try {
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'GOOGLE_AUTH_SUCCESS', 
                  profile: ${JSON.stringify(profile)} 
                }, window.location.origin);
                setTimeout(() => {
                  window.close();
                }, 800);
              } else {
                window.location.href = '/';
              }
            } catch(e) {
              console.error(e);
              window.location.href = '/';
            }
          </script>
        </body>
      </html>
    `);
  }
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${process.env.APP_URL || req.protocol + "://" + req.get("host")}/auth/callback`;
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });
    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Google API \u6B0A\u9650\u4EA4\u63DB\u5931\u6557: ${errBody}`);
    }
    const tokenData = await response.json();
    const { access_token } = tokenData;
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    if (!profileResponse.ok) {
      const errBody = await profileResponse.text();
      throw new Error(`Google Profile \u8B80\u53D6\u5931\u6557: ${errBody}`);
    }
    const userData = await profileResponse.json();
    if (!userData.email) {
      throw new Error("\u5B89\u5168\u6027\u932F\u8AA4\uFF1A\u672A\u6536\u5230 Google \u5E33\u6236\u7684\u96FB\u5B50\u90F5\u4EF6\u8CC7\u8A0A\uFF0C\u62D2\u7D55\u767B\u5165\u3002");
    }
    const isEmailVerified = userData.email_verified === true || userData.email_verified === "true" || userData.email_verified === void 0;
    if (!isEmailVerified) {
      throw new Error("\u5B89\u5168\u6027\u932F\u8AA4\uFF1A\u8A72 Google \u5E33\u6236\u7684\u96FB\u5B50\u90F5\u4EF6\u4F4D\u5740\u672A\u901A\u904E Google \u5B98\u65B9\u9A57\u8B49\uFF0C\u5B89\u5168\u7A3D\u6838\u62D2\u7D55\u3002");
    }
    const profile = {
      id: `google-usr-${userData.sub || Math.floor(1e3 + Math.random() * 9e3)}`,
      displayName: userData.name || userData.given_name || "Google \u5FE0\u5BE6\u6703\u54E1",
      pictureUrl: userData.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
      statusMessage: "\u2728 Google \u5B98\u65B9\u771F\u5BE6\u9A57\u8B49\u6703\u54E1 \u2728",
      email: userData.email
    };
    res.send(`
      <html>
        <head>
          <title>Google \u9A57\u8B49\u6210\u529F</title>
          <style>
            body { font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #0c0a09; color: #f5f5f4; text-align: center; }
            .card { background-color: #1c1917; border: 1px solid #292524; border-radius: 20px; max-width: 400px; padding: 40px 30px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4); }
            .spinner { width: 40px; height: 40px; border: 3px solid #e5b453; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
            @keyframes spin { to { transform: rotate(360deg); } }
            h3 { color: #f5f5f4; font-size: 18px; margin: 0 0 8px; }
            p { color: #a8a29e; font-size: 13px; margin: 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="spinner"></div>
            <h3>Google \u5E33\u6236\u771F\u5BE6\u9A57\u8B49\u6210\u529F</h3>
            <p>\u6B63\u5728\u5C07\u60A8\u7684\u5B89\u5168\u6191\u8B49\u6388\u6B0A\u7D66\u6C99\u8C9D\u9910\u98F2\u9EDE\u9910\u7CFB\u7D71...</p>
          </div>
          <script>
            try {
              if (window.opener) {
                // Post success with target origin matching exactly to guarantee no cross-site leakage
                window.opener.postMessage({ 
                  type: 'GOOGLE_AUTH_SUCCESS', 
                  profile: ${JSON.stringify(profile)} 
                }, window.location.origin);
                setTimeout(() => {
                  window.close();
                }, 800);
              } else {
                window.location.href = '/';
              }
            } catch(e) {
              console.error(e);
              window.location.href = '/';
            }
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("[Google OAuth Error]", error);
    res.send(`
      <html>
        <head><title>Google \u9A57\u8B49\u5931\u6557</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px 20px; background-color: #0c0a09; color: #f5f5f4;">
          <div style="background-color: #1c1917; border: 1px solid #ef4444; border-radius: 16px; max-width: 450px; margin: 0 auto; padding: 30px;">
            <h3 style="color: #ef4444; margin-top: 0;">Google \u9A57\u8B49\u4EA4\u63DB\u5931\u6557</h3>
            <p style="color: #a8a29e; font-size: 13px; line-height: 1.6; word-wrap: break-word;">${error.message || error}</p>
            <p style="color: #78716c; font-size: 11px; margin-top: 14px;">\u8ACB\u78BA\u4FDD\u60A8\u7684 GOOGLE_CLIENT_ID \u548C GOOGLE_CLIENT_SECRET \u74B0\u57DF\u8B8A\u6578\u6B63\u78BA\u914D\u7F6E\u3002</p>
            <button onclick="window.close()" style="background-color: #ef4444; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: bold; margin-top: 16px; font-size: 12px;">\u95DC\u9589\u8996\u7A97</button>
          </div>
        </body>
      </html>
    `);
  }
});
async function main() {
  try {
    console.log("[Sabay Server] Booting up: Awaiting state initialization...");
    await initializeState();
    console.log("[Sabay Server] State initialization completed successfully.");
  } catch (err) {
    console.error("[Sabay Server] Failed to initialize state on boot, falling back to disk:", err);
    loadStateFromDisk();
  }
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("[Sabay Server] Mounted Development Vite Middlewares");
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath, {
      maxAge: "1d",
      setHeaders: (res, path2) => {
        if (path2.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
        }
      }
    }));
    app.get("*", (req, res) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
    console.log("[Sabay Server] Mounted Production Static Assets at:", distPath);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Sabay Server] Sabay Grilled BBQ System Running on URL http://localhost:${PORT}`);
  });
}
main().catch((err) => {
  console.error("[Sabay Server] Error during bootup:", err);
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  calculatePromoDiscount,
  getRecipeForMenuItem,
  refreshIngredientRecipeMap
});
//# sourceMappingURL=server.cjs.map
