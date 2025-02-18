import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SharedMaterialModuleModule } from '../../shared-material-module/shared-material-module.module';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { SafePipe } from '../pipes/safe-pipe.pipe';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [SharedMaterialModuleModule, CommonModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmationDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ConfirmationDialogComponent>);
  readonly data = inject<{
    title?: string,
    body?: string,
    okBtnName?: string,
    okAction?: () => void,
    cancelBtnName?: string ,
    cancelAction?: () => void,
  }>(MAT_DIALOG_DATA);
}
