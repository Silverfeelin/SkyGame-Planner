/**
 * This component was set up to map a list of preview images to their respective items.
 * The CSV file can then be used to update the item definitions more easily (using NodeJS or whatever).
 */

import { Component } from '@angular/core';
import { IItem } from '@app/interfaces/item.interface';
import { ItemClickEvent, ItemsComponent } from '@app/components/items/items.component';
import { ItemIconComponent } from '@app/components/items/item-icon/item-icon.component';

const fileNames = [
  '/assets/game/dyes/2slots_Feast_yetigoggles.jpg',
  '/assets/game/dyes/2slots_Remembrance_ultsash.jpg',
  '/assets/game/dyes/Feast_scarf.jpg',
  '/assets/game/dyes/2slots_Feast_yetigoggles.jpg',
  '/assets/game/dyes/Mischief_sticker.jpg',
  '/assets/game/dyes/Moments_ultglasses.jpg',
  '/assets/game/dyes/Nature_Riverscarf.jpg',
  '/assets/game/dyes/Nature_shellnecklace.jpg',
  '/assets/game/dyes/Remembrance_childscarf.jpg',
  '/assets/game/dyes/2slots_Remembrance_ultsash.jpg',
  '/assets/game/dyes/cape/2slots_Abyss_CannoneerCape.jpg',
  '/assets/game/dyes/cape/2slots_Abyss_boat.jpg',
  '/assets/game/dyes/cape/2slots_Abyss_ult.jpg',
  '/assets/game/dyes/cape/2slots_Belonging_CousinCape.jpg',
  '/assets/game/dyes/cape/2slots_Belonging_GrandpaCape.jpg',
  '/assets/game/dyes/cape/2slots_Belonging_PleafulCape.jpg',
  '/assets/game/dyes/cape/2slots_Bloom_rosecape.jpg',
  '/assets/game/dyes/cape/2slots_Color_DarkRainbowCape.jpg',
  '/assets/game/dyes/cape/2slots_Duets_cellist.jpg',
  '/assets/game/dyes/cape/2slots_Duets_pianist.jpg',
  '/assets/game/dyes/cape/2slots_Enchantment_alchemist.jpg',
  '/assets/game/dyes/cape/2slots_Enchantment_playfight.jpg',
  '/assets/game/dyes/cape/2slots_Enchantment_snooze.jpg',
  '/assets/game/dyes/cape/2slots_Enchantment_snooze_alt.jpg',
  '/assets/game/dyes/cape/2slots_Feast_WinterAncestorCape.jpg',
  '/assets/game/dyes/cape/2slots_Feast_YetiCape.jpg',
  '/assets/game/dyes/cape/2slots_Flight_NaviCape.jpg',
  '/assets/game/dyes/cape/2slots_Fortune_SnekCape.jpg',
  '/assets/game/dyes/cape/2slots_Gratitude_dismiss.jpg',
  '/assets/game/dyes/cape/2slots_Lightseeker_SLS.jpg',
  '/assets/game/dyes/cape/2slots_Lightseeker_piggyback.jpg',
  '/assets/game/dyes/cape/2slots_Moments_RangerCape.jpg',
  '/assets/game/dyes/cape/2slots_Nesting_cape.jpg',
  '/assets/game/dyes/cape/2slots_Passage_CoatCape.jpg',
  '/assets/game/dyes/cape/2slots_Performance_storyteller.jpg',
  '/assets/game/dyes/cape/2slots_Prophecy_BatCape.jpg',
  '/assets/game/dyes/cape/2slots_Prophecy_SpiderCape.jpg',
  '/assets/game/dyes/cape/2slots_Radiance_X.jpg',
  '/assets/game/dyes/cape/2slots_Radiance_fork.jpg',
  '/assets/game/dyes/cape/2slots_Radiance_star.jpg',
  '/assets/game/dyes/cape/2slots_Radiance_ult.jpg',
  '/assets/game/dyes/cape/2slots_Remembrance_tiptoe.jpg',
  '/assets/game/dyes/cape/2slots_Remembrance_vet.jpg',
  '/assets/game/dyes/cape/2slots_Revival_GratCape.jpg',
  '/assets/game/dyes/cape/2slots_Revival_RhythmCape.jpg',
  '/assets/game/dyes/cape/2slots_Sanctuary_shell.jpg',
  '/assets/game/dyes/cape/2slots_Sunlight_manta.jpg',
  '/assets/game/dyes/cape/Bloom_rosecape.jpg',
  '/assets/game/dyes/hair-accessory/2slots_Moments_rangerhat.jpg',
  '/assets/game/dyes/hair-accessory/Belonging_earmuffs.jpg',
  '/assets/game/dyes/hair-accessory/Flight_chimefeather.jpg',
  '/assets/game/dyes/hair-accessory/Flight_navifeathers.jpg',
  '/assets/game/dyes/hair-accessory/Flight_ultfeathers.jpg',
  '/assets/game/dyes/hair-accessory/Fortune_fish.jpg',
  '/assets/game/dyes/hair-accessory/Love_flowercrown.jpg',
  '/assets/game/dyes/hair-accessory/Moments_rangerhat.jpg',
  '/assets/game/dyes/hair-accessory/Moments_ulthat.jpg',
  '/assets/game/dyes/hair-accessory/Nesting_pencil.jpg',
  '/assets/game/dyes/hair-accessory/Revival_bow.jpg',
  '/assets/game/dyes/hair-accessory/Sanctuary_chillhat.jpg',
  '/assets/game/dyes/hair-accessory/Style_tophat.jpg',
  '/assets/game/dyes/hair-accessory/Style_veil.jpg',
  '/assets/game/dyes/hair-accessory/Sunlight_hat.jpg',
  '/assets/game/dyes/hair/2slots_Bloom_rosebraid.jpg',
  '/assets/game/dyes/hair/Bloom_rosebraid.jpg',
  '/assets/game/dyes/head-accessory/2slots_Passage_tassels.jpg',
  '/assets/game/dyes/head-accessory/Dreams_yetihorns.jpg',
  '/assets/game/dyes/head-accessory/Enchantment_ulttassels.jpg',
  '/assets/game/dyes/head-accessory/Feast_antlers.jpg',
  '/assets/game/dyes/head-accessory/Fortune_dragonearrings.jpg',
  '/assets/game/dyes/head-accessory/Passage_tassels.jpg',
  '/assets/game/dyes/head-accessory/Revival_earrings.jpg',
  '/assets/game/dyes/mask/2slots_Abyss_Cease.jpg',
  '/assets/game/dyes/mask/2slots_Abyss_f2p.jpg',
  '/assets/game/dyes/mask/2slots_Abyss_ult.jpg',
  '/assets/game/dyes/mask/2slots_Bloom_rosemask.jpg',
  '/assets/game/dyes/mask/2slots_Colour_mask.jpg',
  '/assets/game/dyes/mask/2slots_Fortune_blush.jpg',
  '/assets/game/dyes/mask/2slots_Gratitude_ult.jpg',
  '/assets/game/dyes/mask/2slots_Love_rose.jpg',
  '/assets/game/dyes/mask/2slots_Mischief_cat.jpg',
  '/assets/game/dyes/mask/2slots_Performance_ult.jpg',
  '/assets/game/dyes/mask/2slots_Radiance_ult.jpg',
  '/assets/game/dyes/mask/2slots_Treasure_mask.jpg',
  '/assets/game/dyes/mask/Bloom_rosemask.jpg',
  '/assets/game/dyes/mask/Treasure_mask.jpg',
  '/assets/game/dyes/outfit/2slots_Abyss_angler.jpg',
  '/assets/game/dyes/outfit/2slots_Assembly_chuckle.jpg',
  '/assets/game/dyes/outfit/2slots_Belonging_kid.jpg',
  '/assets/game/dyes/outfit/2slots_Bloom_gardener.jpg',
  '/assets/game/dyes/outfit/2slots_Color_DarkRainbowTunic.jpg',
  '/assets/game/dyes/outfit/2slots_Color_GaySuspenders.jpg',
  '/assets/game/dyes/outfit/2slots_Dreams_Yeti.jpg',
  '/assets/game/dyes/outfit/2slots_Duets_Cellist1.jpg',
  '/assets/game/dyes/outfit/2slots_Duets_Cellist2.jpg',
  '/assets/game/dyes/outfit/2slots_Duets_Pianist1.jpg',
  '/assets/game/dyes/outfit/2slots_Duets_Pianist2.jpg',
  '/assets/game/dyes/outfit/2slots_Flight_Builder.jpg',
  '/assets/game/dyes/outfit/2slots_Flight_LW.jpg',
  '/assets/game/dyes/outfit/2slots_Flight_chime.jpg',
  '/assets/game/dyes/outfit/2slots_Flight_ult.jpg',
  '/assets/game/dyes/outfit/2slots_Fortune_Snake.jpg',
  '/assets/game/dyes/outfit/2slots_Moments_Nightbird.jpg',
  '/assets/game/dyes/outfit/2slots_Moments_monk.jpg',
  '/assets/game/dyes/outfit/2slots_Moonlight_robe.jpg',
  '/assets/game/dyes/outfit/2slots_Music_pants.jpg',
  '/assets/game/dyes/outfit/2slots_Nesting_ult.jpg',
  '/assets/game/dyes/outfit/2slots_Passage_Mope.jpg',
  '/assets/game/dyes/outfit/2slots_Passage_Oddball.jpg',
  '/assets/game/dyes/outfit/2slots_Performance_modest.jpg',
  '/assets/game/dyes/outfit/2slots_Performance_storyteller.jpg',
  '/assets/game/dyes/outfit/2slots_Prophecy_fire.jpg',
  '/assets/game/dyes/outfit/2slots_Radiance_Leap.jpg',
  '/assets/game/dyes/outfit/2slots_Radiance_Provoke.jpg',
  '/assets/game/dyes/outfit/2slots_Radiance_Shaman.jpg',
  '/assets/game/dyes/outfit/2slots_Remembrance_child.jpg',
  '/assets/game/dyes/outfit/2slots_Remembrance_tiptoe.jpg',
  '/assets/game/dyes/outfit/2slots_Remembrance_warrior.jpg',
  '/assets/game/dyes/outfit/2slots_Rhythm_Actor.jpg',
  '/assets/game/dyes/outfit/2slots_Rhythm_Greeter.jpg',
  '/assets/game/dyes/outfit/2slots_Rhythm_Juggler.jpg',
  '/assets/game/dyes/outfit/2slots_Rhythm_Spin.jpg',
  '/assets/game/dyes/outfit/2slots_Style_jeans.jpg',
  '/assets/game/dyes/outfit/2slots_Style_suit.jpg',
  '/assets/game/dyes/outfit/2slots_Sunlight_dadpants.jpg',
  '/assets/game/dyes/outfit/Treasure_pants.jpg',
  '/assets/game/dyes/shoes/Treasure_boots.jpg'
];

@Component({
    selector: 'app-editor-dyes',
    templateUrl: './editor-dyes.component.html',
    styleUrls: ['./editor-dyes.component.scss'],
    standalone: true,
    imports: [ItemsComponent, ItemIconComponent]
})
export class EditorDyesComponent {
  currentFileName = '';
  currentFileIndex = -1;
  previewFiles = fileNames;

  previewFile = '';
  previewFileMap: { [file: string]: IItem } = {};

  onItemClicked(evt: ItemClickEvent): void {
    this.previewFileMap[this.previewFile] = evt.item;
  }

  onPreviewClicked(file: string): void {
    this.previewFile = file;
  }

  export(): void {
    let csv = '';
    Object.keys(this.previewFileMap).filter(k => k).forEach(previewFile => {
      const item = this.previewFileMap[previewFile];
      csv += `${item.guid},${previewFile}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'previews.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
