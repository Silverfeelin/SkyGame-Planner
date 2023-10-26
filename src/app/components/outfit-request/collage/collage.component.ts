import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import createPanZoom, { PanZoom } from 'panzoom';

@Component({
  selector: 'app-collage',
  templateUrl: './collage.component.html',
  styleUrls: ['./collage.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollageComponent {
  blockSize = [Array(5).fill(false), Array(3).fill(false)];
  collageSize = [4, 1];
  files: Array<Array<string>>;
  panZooms: Array<Array<PanZoom>>;

  constructor(
    private readonly _changeDetectorRef: ChangeDetectorRef,
  ) {
    this.setCollageSize(4, 1);
    this.files = [];
    this.panZooms = [];

    // Rows
    for (let y = 0; y < 3; y++) {
      this.files.push([]);
      this.panZooms.push([]);

      // Columns
      for (let x = 0; x < 5; x++) {
        this.files[y][x] = '';

        setTimeout(() => {
          const el = document.querySelector(`img[data-x="${x}"][data-y="${y}"]`) as HTMLElement;
          const p = this.createPanZoom(el);
          this.panZooms[y][x] = p;
        })
      }
    }
  }

  setCollageSize(x: number, y: number): void {
    this.collageSize = [x, y];
    this.blockSize[0].forEach((_, i) => this.blockSize[0][i] = i < x);
    this.blockSize[1].forEach((_, i) => this.blockSize[1][i] = i < y);
    this._changeDetectorRef.markForCheck();
  }

  paste(event: ClipboardEvent): void{
    console.log(event);
    retrieveImageFromClipboardAsBase64(event, (objectUrl: any) => {
      this.files[0][0] = objectUrl;
      this.panZooms[0][0].moveTo(0, 0);
      const el = document.querySelector(`img[data-x="${0}"][data-y="${0}"]`) as HTMLElement;
      // this.createPanZoom(el);
      this._changeDetectorRef.markForCheck();
    }, undefined);
  }

  clearTxt(evt: Event): void{
    const inp = evt.target as HTMLInputElement;
    inp.value = '';
  }

  pickFile(x: number, y: number): void {
    this.files[x][y] = '';

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.item(0);
      if (!file) { return; }
      const url  = URL.createObjectURL(file);
      this.files[y][x] = url;
      this.panZooms[y][x].moveTo(0, 0);
      this._changeDetectorRef.markForCheck();

      const el = document.querySelector(`img[data-x="${x}"][data-y="${y}"]`) as HTMLElement;
      // this.createPanZoom(el);
    };
    input.click();
  }

  private createPanZoom(el: HTMLElement): PanZoom {
    return createPanZoom(el, {
      zoomSpeed: 0.05,
      smoothScroll: false
    });
  }
}

function retrieveImageFromClipboardAsBase64(pasteEvent: any, callback: any, imageFormat: any) {
  if(pasteEvent.clipboardData == false){
      if(typeof(callback) == "function"){
          callback(undefined);
      }
  };

  // retrive elements from clipboard
  var items = pasteEvent.clipboardData.items;

  if(items == undefined){
      if(typeof(callback) == "function"){
          callback(undefined);
      }
  };
  // loop the elements
  for (var i = 0; i < items.length; i++) {
      // Skip content if not image
      if (items[i].type.indexOf("image") == -1) continue;
      // Retrieve image on clipboard as blob
      var blob = items[i].getAsFile();

      const url = URL.createObjectURL(blob);
      callback(url);

      // // Create an abstract canvas and get context
      // var mycanvas = document.createElement("canvas");
      // var ctx = mycanvas.getContext('2d');

      // // Create an image
      // var img = new Image();

      // // Once the image loads, render the img on the canvas
      // img.onload = function() {
      //     // Update dimensions of the canvas with the dimensions of the image
      //     mycanvas.width = img.width;
      //     mycanvas.height = img.height;

      //     // Draw the image
      //     ctx!.drawImage(img, 0, 0);

      //     // Execute callback with the base64 URI of the image
      //     if(typeof(callback) == "function"){
      //         callback(mycanvas.toDataURL(
      //             (imageFormat || "image/png")
      //         ));
      //     }
      // };

      // // Crossbrowser support for URL
      // var URLObj = window.URL || window.webkitURL;

      // // Creates a DOMString containing a URL representing the object given in the parameter
      // // namely the original Blob
      // img.src = URLObj.createObjectURL(blob);
  }
}
