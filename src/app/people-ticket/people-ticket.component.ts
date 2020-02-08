import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {DynamicDialogRef, DynamicDialogConfig} from 'primeng/api';
import {FormGroup, FormControl} from '@angular/forms';

@Component({
  selector: 'app-people-ticket',
  templateUrl: './people-ticket.component.html',
  styleUrls: ['./people-ticket.component.less'],
  encapsulation: ViewEncapsulation.None,
})
export class PeopleTicketComponent {
  public formGroup: FormGroup;
  public allOptionsControl: FormControl;
  public selectedOptionsControl: FormControl;
  public filterTextControl: FormControl;

  public allOptions = [];

  public selectedOptions = [];

  public upDisabled = true;
  public downDisabled = true;

  constructor(public ref: DynamicDialogRef, public config: DynamicDialogConfig) {
    this.formGroup = new FormGroup({
      filterText: new FormControl(''),
      all: new FormControl(''),
      selected: new FormControl(''),
    });

    if (this.config.data.options) {
      this.allOptions = this.config.data.options;
    }

    if (this.config.data.items) {
      this.selectedOptions = this.config.data.items;
      for (let item of this.config.data.items) {
        const index = this.allOptions.findIndex(option => option === item);
        this.allOptions.splice(index, 1);
      }
    }

    this.allOptionsControl = this.formGroup.get('all') as FormControl;
    this.selectedOptionsControl = this.formGroup.get('selected') as FormControl;
    this.filterTextControl = this.formGroup.get('filterText') as FormControl;

    this.selectedOptionsControl.valueChanges.subscribe(() => {
      this.upDisabled = this.checkUp();
      this.downDisabled = this.checkDown();
    });
  }

  sortBy() {
    const ordered = this.allOptions.sort((a, b) => a.localeCompare(b));
    const filterText = this.filterTextControl.value;

    let result = ordered;
    if (filterText && filterText.length) {
      result = ordered.filter(x => {
        return x.toLowerCase().indexOf(filterText.toLowerCase()) > -1;
      });
    }

    return result;
  }

  add() {
    const val = this.allOptionsControl.value;
    if (!val) return;
    const index = this.allOptions.findIndex(x => x === val);
    const element = this.allOptions.splice(index, 1).pop();
    this.selectedOptions.push(element);
    this.allOptionsControl.setValue('');
    this.upDisabled = this.checkUp();
    this.downDisabled = this.checkDown();
  }

  remove() {
    const val = this.selectedOptionsControl.value;
    if (!val) return;
    const index = this.selectedOptions.findIndex(x => x === val);
    const element = this.selectedOptions.splice(index, 1).pop();
    this.allOptions.push(element);
    this.selectedOptionsControl.setValue('');
    this.upDisabled = this.checkUp();
    this.downDisabled = this.checkDown();
  }

  shift(shift: number = 0) {
    const val = this.selectedOptionsControl.value;
    const index = this.selectedOptions.findIndex(x => x === val) + shift;
    const elements = this.selectedOptions.splice(index, 1);
    this.selectedOptions.splice(index - 1, 0, ...elements);
    this.upDisabled = this.checkUp();
    this.downDisabled = this.checkDown();
  }

  checkUp(): boolean {
    const val = this.selectedOptionsControl.value;
    if (!val) {
      return true;
    }
    const index = this.selectedOptions.findIndex(x => x === val);
    if (index === 0) return true;
    return false;
  }

  checkDown(): boolean {
    const val = this.selectedOptionsControl.value;
    if (!val) {
      return true;
    }
    const index = this.selectedOptions.findIndex(x => x === val);
    if (index === this.selectedOptions.length - 1) return true;
    return false;
  }

  submit() {
    this.ref.close(this.selectedOptions);
  }

  close() {
    this.ref.close();
  }
}
