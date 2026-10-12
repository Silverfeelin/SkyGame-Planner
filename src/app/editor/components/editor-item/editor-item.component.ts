import { Component, ChangeDetectionStrategy, output, input, effect } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { AbstractControl, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ItemTypePipe } from '@app/pipes/item-type.pipe';
import { nanoid } from 'nanoid';
import { IItem, ItemType, ItemSubtype, ItemGroup } from 'skygame-data';

interface IOption<T> { value: T; label: string; }

@Component({
  selector: 'app-editor-item',
  templateUrl: './editor-item.component.html',
  styleUrl: './editor-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, NgTemplateOutlet, ItemTypePipe, MatIcon],
})
export class EditorItemComponent {
  item = input<IItem>();

  saved = output<IItem>();
  cancelled = output<void>();

  typeEmote = ItemType.Emote;
  typeOptions = Object.values(ItemType);
  subtypeOptions: Array<IOption<ItemSubtype>> = [
    { value: ItemSubtype.Instrument, label: 'Instrument' },
    { value: ItemSubtype.FriendEmote, label: 'Friend emote' },
  ];
  groupOptions: Array<IOption<ItemGroup>> = [
    { value: 'Elder', label: 'Elder' },
    { value: 'SeasonPass', label: 'Season Pass' },
    { value: 'Ultimate', label: 'Ultimate' },
    { value: 'Limited', label: 'Limited' },
  ];
  levelOptions = ['1', '2', '3', '4'];
  dyeOptions: Array<IOption<string>> = [
    { value: '0', label: 'None' },
    { value: '1', label: '1 slot' },
    { value: '2', label: '2 slots' },
  ];

  /** Kept per form so repeated saves of a new item produce the same GUID. */
  private readonly _newGuid = nanoid(10);

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
      this.form.reset({
        name: item?.name || '',
        type: item?.type || '',
        subtype: item?.subtype || '',
        group: item?.group || '',
        icon: item?.icon || '',
        previewUrl: item?.previewUrl || '',
        dyes: item?.dye?.secondary ? '2' : item?.dye?.primary ? '1' : '0',
        dyePreview: item?.dye?.previewUrl || '',
        dyeInfo: item?.dye?.infoUrl || '',
        level: item?.level ? `${item.level}` : '1',
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

  hasError(control: AbstractControl): boolean {
    return control.invalid && control.touched;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;

    let icon = value.icon || '';
    if (icon.includes('/revision/')) { icon = icon.split('/revision/')[0]; }

    let previewUrl = value.previewUrl || '';
    if (previewUrl.includes('/revision/')) { previewUrl = previewUrl.split('/revision/')[0]; }

    const item: IItem = {
      id: -1,
      guid: this.item()?.guid || this._newGuid,
      name: value.name || '',
      type: value.type as ItemType,
      subtype: value.subtype as ItemSubtype || undefined,
      group: value.group as ItemGroup || undefined,
      icon,
      previewUrl: previewUrl || undefined,
    };

    switch (value.dyes) {
      case '1': item.dye = { primary: {} }; break;
      case '2': item.dye = { primary: {}, secondary: {} }; break;
    }

    if (item.dye) {
      if (value.dyePreview) item.dye.previewUrl = value.dyePreview;
      if (value.dyeInfo) item.dye.infoUrl = value.dyeInfo;
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
    if (this.form.dirty && !confirm('Are you sure you want to discard these changes?')) { return; }
    this.cancelled.emit();
  }
}
