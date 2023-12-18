import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-excel-copy-paste',
  templateUrl: './excel-copy-paste.component.html',
  styleUrls: ['./excel-copy-paste.component.css']
})
export class ExcelCopyPasteComponent {

  form: FormGroup = this.fb.group({});
  pasteData!: string;
  inputRows: any[]=[];
  inputCols:any[] = [];
  inputFieldsArray = new FormArray([new FormControl('')]);
  constructor(private readonly fb:FormBuilder) {
  }


  readCopiedTextandPopulate() {
    let inputDivElement = document.getElementById("input");
    //let pasteDivText = event.clipboardData? (event.clipboardData).getData("text") : ''
    //let pasteDivText = (event.clipboardData || window.clipboardData).getData("text/html");
    let pasteDivText = this.pasteData;
    console.log("Copied text:\n");
    console.log(pasteDivText);

    let rows = pasteDivText.split(/\r?\n/);

    for (let i = 0; i < rows.length; i++) {

      let rowIndex = i + 1;

      const rowDivElement = document.createElement("div");
      rowDivElement.classList.add("row", "m-3");
      let columns = rows[i].split(/\t/);
      this.inputCols = [];
      for (let j = 0; j < columns.length; j++) {
        
        let columnIndex = j + 1;
        this.inputCols.push({formControlName:`${'formCtrl'}${j}`});
        const columnDivElement = document.createElement("div");
        columnDivElement.classList.add("col");

        const inputElement = document.createElement("input");
        inputElement.setAttribute("formControlName","paste"+rowIndex+columnIndex);
        inputElement.classList.add("form-control");
        inputElement.setAttribute("type", "text");
        inputElement.setAttribute("id", "i" + "-" + rowIndex + "-" + columnIndex);
        inputElement.value = columns[j];
        columnDivElement.appendChild(inputElement);

        rowDivElement.appendChild(columnDivElement);

      }
      this.inputRows.push({inputCols:this.inputCols});
      inputDivElement?.appendChild(rowDivElement)

    }
  } 
  
  createControls() {
    let pasteDivText = this.pasteData;
    let rows = pasteDivText.split(/\r?\n/);
    for (let i = 0; i < rows.length; i++) {
      let columns = rows[i].split(/\t/);
      for (let j = 0; j < columns.length; j++) {
        const control = new FormControl(columns[j]);
        this.inputFieldsArray.push(control);
        this.form.addControl('control'+i+j,this.fb.control(columns[j]));
      }
    }
    console.log(this.inputFieldsArray, this.form);
  }
}
