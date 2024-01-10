import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-headings',
  templateUrl: './headings.component.html',
  styleUrls: ['./headings.component.scss']
})
export class HeadingsComponent {
  @Input() heading!: Heading<string>;
  @Input() form!: FormGroup;

  changeHeader() {
    const formValues = Object.values(this.form?.value) as string[];
    this.heading?.options.forEach((option:any)=>{
      if(formValues.includes(option.key)){
        option.disabled = true;
      } else {
        option.disabled = false;
      }
    })
  }
}

export interface Heading<T> {
  value: T|undefined;
  key: string;
  required: boolean;
  options: Option[];
}

export interface Option {key: string, value: string, isRequired: boolean, disabled?: boolean}

export interface CopyPasteConfiguration {
  apiEndpoint: string;
  apiMethod: string;
  headerText: string;
  helpText:string;
  isDeletionEnabled:boolean;
  columns: Option[]
}