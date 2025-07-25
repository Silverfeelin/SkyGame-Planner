import { Component, ChangeDetectionStrategy, output, input, effect } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ItemType, ItemSubtype, IItem, ItemGroup } from '@app/interfaces/item.interface';
import { ItemTypePipe } from '@app/pipes/item-type.pipe';
import { nanoid } from 'nanoid';

@Component({
  selector: 'app-editor-item',
  templateUrl: './editor-item.component.html',
  styleUrl: './editor-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ItemTypePipe],
})
export class EditorItemComponent {
  item = input<IItem>();

  saved = output<IItem>();
  cancelled = output<void>();

  typeEmote = ItemType.Emote;
  typeOptions = ['', ...Object.values(ItemType)];
  subtypeOptions = ['', ...Object.values(ItemSubtype)];
  groupOptions = ['', 'Elder', 'SeasonPass', 'Ultimate', 'Limited'];

  form = new FormGroup({
    name: new FormControl('', { validators: [ Validators.required]}),
    type: new FormControl<ItemType|''>('', { validators: [ Validators.required]}),
    subtype: new FormControl<ItemSubtype|''>(''),
    group: new FormControl(''),
    icon: new FormControl(''),
    previewUrl: new FormControl(''),
    dyes: new FormControl('0'),
    dyePreview: new FormControl(''),
    dyeInfo: new FormControl(''),
    level: new FormControl('1'),
    wiki: new FormControl(''),
  });

  constructor() {
    effect(() => {
      const item = this.item();
      this.form.patchValue({
        name: item?.name || '',
        type: item?.type || '',
        subtype: item?.subtype || '',
        group: item?.group || '',
        icon: item?.icon || '',
        previewUrl: item?.previewUrl || '',
        dyes: item?.dye?.secondary ? '2' : item?.dye?.primary ? '1' : '0',
        dyePreview: item?.dye?.previewUrl || '',
        dyeInfo: item?.dye?.infoUrl || '',
        level: item?.level ? `${item.level}` : undefined,
        wiki: item?._wiki?.href || '',
      });
    });

    this.form.get('dyePreview')?.valueChanges.subscribe((value) => {
      if (value?.startsWith('src/assets/')) value = value.substring(3);
      this.form.patchValue({ dyePreview: value }, { emitEvent: false });
    });

    this.form.get('dyeInfo')?.valueChanges.subscribe((value) => {
      if (value?.startsWith('src/assets/')) value = value.substring(3);
      this.form.patchValue({ dyeInfo: value }, { emitEvent: false });
    });
  }

  save(): void {
    if (this.form.invalid) {
      alert('Please check all fields before saving.');
      return;
    }

    const value = this.form.value;

    let icon = value.icon || '';
    if (icon.includes('/revision/')) { icon = icon.split('/revision/')[0]; }

    let previewUrl = value.previewUrl || '';
    if (previewUrl.includes('/revision/')) { previewUrl = previewUrl.split('/revision/')[0]; }

    const item: IItem = {
      id: -1,
      guid: this.item()?.guid || nanoid(10),
      name: value.name || '',
      type: value.type as ItemType,
      subtype: value.subtype as ItemSubtype || undefined,
      group: value.group as ItemGroup || undefined,
      icon,
      previewUrl: previewUrl || undefined,
      dye: {}
    };

    switch (value.dyes) {
      case '1': item.dye = { primary: {} }; break;
      case '2': item.dye = { primary: {}, secondary: {} }; break;
      default: delete item.dye; break;
    }

    if (value.dyes) {
      if (value.dyePreview) item.dye!.previewUrl = value.dyePreview;
      if (value.dyeInfo) item.dye!.infoUrl = value.dyeInfo;
    }

    if (item.type === ItemType.Emote && value.level) {
      item.level = parseInt(value.level, 10);
    }

    if (value.wiki)  {
      item._wiki ??= {};
      item._wiki.href = value.wiki;
    }

    this.saved.emit(item);
  }

  cancel(): void {
    if (!confirm('Are you sure you want to cancel these changes?')) { return; }
    this.cancelled.emit();
  }
}
