import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

interface INewsEntry {
  readonly title: string;
  /** Pre-rendered HTML body (anchors / lists). RouterLink anchors are not used here because we want
   *  redesign-relative paths to stay legacy until the rest of the routes are ported. */
  readonly bodyHtml: string;
}

@Component({
  selector: 'app-atmos-news',
  templateUrl: './atmos-news.component.html',
  styleUrl: './atmos-news.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon]
})
export class AtmosNewsComponent {
  readonly entries = signal<ReadonlyArray<INewsEntry>>([
    {
      title: 'March - May 2026',
      bodyHtml: `
        <ul>
          <li>A new <a class="atmos-text-link" href="/settings">Setting</a> has been introduced to add regular candles automatically when you check in your dailies.</li>
          <li>The <a class="atmos-text-link" href="/cr-tracker">Candle Run Tracker</a> now includes data for every realm.</li>
          <li>Favourited items can now be quickly added on the <a class="atmos-text-link" href="/item/unlock-calculator">Item cost calculator</a> page.</li>
          <li>The <a class="atmos-text-link" href="/currency">Currency</a> page now shows the currencies you've gained or spent today. Keep in mind that unlocking items automatically deducts your currencies!</li>
          <li>Added a new <a class="atmos-text-link" href="/realm/shared-creations">Shared Creations</a> map to the Realms page.</li>
          <li>Moved the <a class="atmos-text-link" href="/cr-tracker">Candle Run Tracker</a> and <a class="atmos-text-link" href="/pnr-tracker">Eden Statue Tracker</a> to the Realms page.</li>
          <li>Added a new <a class="atmos-text-link" href="/daily">Daily</a> page to track your daily activities in one place.</li>
          <li>In-game currency shop items can now be navigated to by clicking on them. To unlock, click on the price below the item. This better matches the behaviour of in-app purchase items.</li>
          <li>A new table format has been applied to all the spirits on the <a class="atmos-text-link" href="/spirits">Spirits</a> page. More pages will follow.</li>
        </ul>`
    },
    {
      title: 'December 2025',
      bodyHtml: `
        <ul>
          <li>New <a class="atmos-text-link" href="/friends">Friends</a> page to manage your friendship trees.</li>
          <li>Added the permanent <a class="atmos-text-link" href="/shop/wonderland-cafe">Wonderland Cafe</a> shop page.</li>
        </ul>`
    },
    {
      title: 'November 2025',
      bodyHtml: `
        <ul>
          <li>Outfit closet split into <a class="atmos-text-link" href="/item?type=Outfit">Outfits</a> and <a class="atmos-text-link" href="/item?type=OutfitShoes">Outfits with shoes</a> to match the in-game closets.</li>
          <li>Data has been moved to a separate repository: <a class="atmos-text-link" href="https://github.com/Silverfeelin/SkyGame-Data" target="_blank" rel="noopener">https://github.com/SkyPlanner/SkyPlanner-Data</a></li>
        </ul>`
    },
    {
      title: 'October 2025',
      bodyHtml: `
        <ul>
          <li>New <a class="atmos-text-link" href="/season/optimizer">Migration Friendship Point Optimizer</a> page. Similar to a season calculator, but for the new friendship level system.</li>
          <li><a class="atmos-text-link" href="/cr-tracker">Candle Run Tracker</a> now includes data for Valley of Triumph.</li>
        </ul>`
    },
    {
      title: 'August 2025',
      bodyHtml: `
        <ul>
          <li>New <a class="atmos-text-link" href="/cr-tracker">Candle Run Tracker</a> with data for Home, Isle, Prairie and Forest.</li>
        </ul>`
    },
    {
      title: 'May 2025',
      bodyHtml: `
        <ul>
          <li>New <a class="atmos-text-link" href="/pnr-tracker">Eden Statue Tracker</a> based on a suggestion by Harriett.</li>
        </ul>`
    },
    {
      title: 'January 2025',
      bodyHtml: `
        <ul>
          <li>New dye plant tracker available from the <a class="atmos-text-link" href="/tools">Tools page</a>.</li>
          <li>New dye filter for items.</li>
          <li>Dye previews, with many screenshots provided by cysketch, kotoeri and JustAMoff.</li>
          <li>New Outfit Request changes to support requests with dyes.</li>
        </ul>`
    },
    {
      title: 'December 2024',
      bodyHtml: `
        <ul>
          <li>The season and event calculators now have a short description for bonus currency (i.e. daily light).</li>
          <li>The Course Creation Prop is now available from the Equipment Rack "Spirit Tree". For tracking spent currencies, please unlock it again on the <a class="atmos-text-link" href="/shop/event">Aviary Event Store</a> page.</li>
        </ul>`
    },
    {
      title: 'November 2024',
      bodyHtml: `
        <ul>
          <li>The <a class="atmos-text-link" href="/shop/nesting">Nesting Workshop</a> shows the permanent items and an expected date for all rotations.</li>
          <li>When editing a spirit tree, you can now choose between modifying or creating a copy (for data contributors).</li>
          <li>Keyboard shortcuts, which can be viewed with Ctrl+Shift+?, or from the settings page.</li>
          <li>The new <a class="atmos-text-link" href="/item/heart">Hearts</a> page helps you find any regular hearts you can get from spirits around Sky.</li>
          <li>Fixed the <a class="atmos-text-link" href="/outfit-request/vault">Outfit Vault</a> for the Sky closet changes in update 0.27.0.</li>
        </ul>`
    },
    {
      title: 'October 2024',
      bodyHtml: `
        <ul>
          <li>A daily quest card is now available on the dashboard between seasons.</li>
          <li>Item icon loading has been optimized, which should speed up loading pages such as <a class="atmos-text-link" href="/item">Items</a> and <a class="atmos-text-link" href="/outfit-request/request">Outfit Request</a>.</li>
          <li>The Realm filters on the <a class="atmos-text-link" href="/item">Items</a> page now only target items from Regular and Elder Spirits.</li>
          <li>Added a button to add +1 event currency / season candles to the calculators.</li>
          <li>Added button to quickly adjust currency to the <a class="atmos-text-link" href="/currency">Currency</a> page.</li>
          <li>The <a class="atmos-text-link" href="/realm">Realms</a> and individual Realm pages offer quick access to the realm's areas.</li>
          <li>The Shard indicator on the dashboard clock will now also be visible when a shard is going to land today. For more detailed information, you can always click on the shard icon to visit the <a class="atmos-text-link" href="https://sky-shards.pages.dev/" target="_blank" rel="noopener">Sky Shards</a> website by Plutoy.</li>
          <li>You can now share any Spirit Tree as an image.</li>
          <li>Site load speed improved between frequent visits when using Dropbox.</li>
          <li>Added a <a class="atmos-text-link" href="/spirit-tree/editor">Spirit Tree Editor</a> to make your own spirit trees.</li>
          <li>The new <a class="atmos-text-link" href="/event/history">Events - History</a> page shows a full list of the events throughout the years.</li>
          <li>You can now quickly create an <a class="atmos-text-link" href="/item/collection">Item collection</a> from the <a class="atmos-text-link" href="/item/unlock-calculator">Item cost calculator</a>, or calculate the costs from an item collection.</li>
          <li>Reworked the Nesting Workshop page for patch 0.27.0. Thank you cozuki for testing!</li>
        </ul>`
    },
    {
      title: 'September 2024',
      bodyHtml: `
        <ul>
          <li>The item list has received <i>a lot</i> of new filters.</li>
          <li>The dashboard shows a shard icon next to the Sky time whenever a shard has landed. Clicking on it will open the <a class="atmos-text-link" href="https://sky-shards.pages.dev/" target="_blank" rel="noopener">Sky Shards</a> website by Plutoy.</li>
          <li>A link to the <a class="atmos-text-link" href="https://skydreamers.notion.site/Sky-Event-Calendar-FM-ec6e6134924048859b2a8410b0a8b20d" target="_blank" rel="noopener">Sky Event Calendar | FM</a> website has been added to seasons and events.</li>
          <li>The <a class="atmos-text-link" href="/item/unlock-calculator">Unlock cost calculator</a> allows you to calculate how many candles you need to unlock items of your choosing.</li>
          <li>Various new spirit graphs can be found on the <a class="atmos-text-link" href="/graph/spirit">Graphs - Spirits</a> page.</li>
          <li>You can now indicate you own a season pass or an in-app purchase as a gift. The prices will in turn be excluded from the Currency page.</li>
          <li>The website theme is now truly random when you choose 'Surprise'.</li>
          <li>Launched a survey to collect feedback.</li>
          <li>This page! Any changes before September have not been listed.</li>
          <li>You can now create and manage item collections on the <a class="atmos-text-link" href="/item/collection">Items - Collections</a> page.</li>
          <li>The <a class="atmos-text-link" href="/shop/nesting">Nesting Workshop</a> page now lists props in their store rotations and highlights the current rotation.</li>
        </ul>`
    }
  ]);

  /** Tracks which entries are open. The first entry starts open; the rest are folded. */
  readonly openIndex = signal<Set<number>>(new Set([0]));

  isOpen(index: number): boolean {
    return this.openIndex().has(index);
  }

  toggle(index: number): void {
    const next = new Set(this.openIndex());
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    this.openIndex.set(next);
  }
}
