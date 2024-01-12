import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DropboxService } from 'src/app/services/dropbox.service';

@Component({
  selector: 'app-dropbox-indicator',
  templateUrl: './dropbox-indicator.component.html',
  styleUrls: ['./dropbox-indicator.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropboxIndicatorComponent implements OnInit {
  constructor(
    private readonly _dropboxService: DropboxService
  ) {

  }

  ngOnInit(): void {
    this._dropboxService.authChanged.subscribe(auth => {

    });
  }
}
