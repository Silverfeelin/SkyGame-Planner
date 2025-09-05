# Development scripts

**json-watch.ts**

Development script that watches the `/src/assets/data` subfolders for changes and automatically rebuild the JSON files.

`npm run json-watch`

# Pipeline scripts

**json-build.ts**

Pipeline script that reads all subfolders in `/src/assets/data` and merges the contents into `/src/assets/data/{foldername}.json`.

The subfolders are used to organize the data, the compiled versions are used by the website.

**sitemap.js**

Pipeline script that generates a sitemap from the compiled JSON files.
