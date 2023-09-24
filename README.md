# Sky Planner

Sky Planner is an online tool to track items and progress in [Sky: Children of the Light](https://www.thatskygame.com/).

## [Click here to go to the website.](https://silverfeelin.github.io/SkyGame-Planner)


**Noteworthy features:**

* Search for items, spirits, seasons and events by name.
* View a list of all items per category.
* Keep track of all unlocked items through spirit trees and IAPs.
* Find the origin of an item, i.e. the event in which an item can be unlocked.
* Keep track of all Wing Buffs.
* Fantastic Spirits and Where to Find Them.
* Many links to relevant pages on the official [Sky: Children of the Light Fandom Wiki](https://sky-children-of-the-light.fandom.com/wiki/Sky:_Children_of_the_Light_Wiki).

If you have any suggestions, please let me know by opening a new ticket on the [Issues](https://github.com/Silverfeelin/SkyGame-Planner/issues) page.

# Data

All data is read from JSON files located in `/src/assets/data/`. The below diagram shows the structure of this data.

In the JSON files references between objects are stored as 10-length [nanoids](https://github.com/ai/nanoid). For example, the reference `"spirit": "1234567890"` in JSON is resolved by looking up the spirit with `"guid": "1234567890"`.

![Data structure](https://raw.githubusercontent.com/Silverfeelin/SkyGame-Planner/master/diagrams/SkyPlannerData.jpg)

For those who know what they're doing the data is available through the `skyData` object in the console. The helpers [`CostHelper`](https://github.com/Silverfeelin/SkyGame-Planner/blob/master/src/app/helpers/cost-helper.ts), [`DateHelper`](https://github.com/Silverfeelin/SkyGame-Planner/blob/master/src/app/helpers/date-helper.ts) and [`NodeHelper`](https://github.com/Silverfeelin/SkyGame-Planner/blob/master/src/app/helpers/node-helper.ts) are also available.

This allows you to do cool things with your own code, like measuring how much of each in-game currency you've spent on items:

```js
// Select all items unlocked through spirit trees.
var unlockedItems = skyData.itemConfig.items.filter(item => item.unlocked && item.nodes?.length);
// Select the unlocked nodes from these items.
var unlockedNodes = unlockedItems.map(item => item.nodes.filter(n => n.unlocked)).flat();
// Add up the currencies spent on these nodes.
var spent = CostHelper.add(CostHelper.create(), ...unlockedNodes);
// Log the results.
console.log('Spent currencies on items:', spent)
// > Spent currencies on items: {ac: 1, c: 18, ec: 0, h: 8, sc: 0, sh: 0}
```

# License

Most of the source code is publicly available under the [MIT License](https://github.com/Silverfeelin/SkyGame-Planner/blob/master/LICENSE). Please refer to the license for specific details.

# Credits

* [Contributors](https://github.com/Silverfeelin/SkyGame-Planner/graphs/contributors)
* This project would not have been possible without the information provided by the community in various channels. For an overview of information used please refer to the [Credits](https://silverfeelin.github.io/SkyGame-Planner/credits) page.

## [Click here to go to the website.](https://silverfeelin.github.io/SkyGame-Planner)
