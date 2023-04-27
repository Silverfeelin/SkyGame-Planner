# Sky Planner

## [Link to website](https://silverfeelin.github.io/SkyGame-Planner/realm)

Sky Planner is a tool to track items and progress in [Sky: Children of the Light](https://www.thatskygame.com/).

For every realm, season, event, traveling spirit, etc, you can see items available for in-game currency and for real money. You can track collected items to see what you're still missing making it easier to plan ahead.

If you have any suggestions, please let me know by opening a new ticket on the [Issues](https://github.com/Silverfeelin/SkyGame-Planner/issues) page.

# Data

All data is read from JSON files located in `/src/assets/data/` and available under the object `skyData` in the console. The below diagram shows the structure of this data.

References in JSON are made through 10-length [nanoids](https://github.com/ai/nanoid). For example the reference `"spirit": "1234567890"` in JSON is resolved by looking up the spirit with `"guid: "1234567890"`.

![Data structure](https://raw.githubusercontent.com/Silverfeelin/SkyGame-Planner/master/diagrams/SkyPlannerData.jpg)

# License

Most of the source code is publicly available under the [MIT License](https://github.com/Silverfeelin/SkyGame-Planner/blob/master/LICENSE). Please refer to the license for specific details.

# Credits

* [Contributors](https://github.com/Silverfeelin/SkyGame-Planner/graphs/contributors)
* This project would not have been possible without the information provided by the community in various channels. For an overview of information used please refer to the [Credits](https://silverfeelin.github.io/SkyGame-Planner/credits) page.
