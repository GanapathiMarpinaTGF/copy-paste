import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import  * as Papa from 'papaparse';

@Component({
  selector: 'app-excel-copy-paste',
  templateUrl: './excel-copy-paste.component.html',
  styleUrls: ['./excel-copy-paste.component.css'],
})
export class ExcelCopyPasteComponent implements OnInit {
  pasteData!: string;
  tableForm: FormGroup = this.fb.group({});
  form!: FormGroup;
  options = [
    { key: 'costDimension', value: 'Cost Dimension', isRequired: true },
    { key: 'budget', value: 'Budget', isRequired: false },
    { key: 'actualExp', value: 'Actual Expenditure', isRequired: false },
    {
      key: 'budgetVsActualExp',
      value: 'Budget Vs Actual Variance',
      isRequired: true,
    },
  ];

  headings!: {
    key: string;
    label: string;
    value: string;
    required: boolean;
    options: { key: string; value: string; isRequired: boolean }[];
  }[];
  constructor(private readonly fb: FormBuilder, private readonly toastr: ToastrService) {}
  ngOnInit(): void {
    this.tableForm = this.fb.group({
      rows: this.fb.array([]),
    });
  }

  toFormGroup(options: any[]) {
    const group: any = {};
    options.forEach((option) => {
      group[option.key] = option.required
        ? new FormControl(option.value || '', Validators.required)
        : new FormControl(option.value || '');
    });
    return new FormGroup(group);
  }

  get rowsContrlos() {
    // const controls = (this.tableForm?.get('rows') as FormArray).controls
    // return (this.tableForm?.get('rows') as FormArray).controls as FormControl[];
    return (<FormArray>this.tableForm.get('rows')).controls;
  }

  pasteEvent(event: ClipboardEvent) {
    const htmlText = event.clipboardData?.getData('text/html');
    //console.log("HTML text===>",htmlText);
    if(htmlText){
      const parser = new DOMParser();
      const parsedText = parser.parseFromString(htmlText,'text/html');
      const trTags = parsedText.getElementsByTagName('tr');
      const formRows = this.tableForm.get('rows') as FormArray;
      formRows.clear();
      let tabCount = 0;
      for(let i = 0; i< trTags.length; i++){
        if(tabCount < trTags[i].cells.length) { 
          tabCount = trTags[i].cells.length;
        }
      }
      for(let i = 0; i< trTags.length; i++){
        const formRow = this.fb.group({});
        for(let j = 0; j< trTags[i].cells.length||j < tabCount; j++){
          const childs = trTags[i].cells[j]?.childNodes;
          if(childs && childs.length > 1) {
            let nodeValues = '';
            childs.forEach((child)=>{
              nodeValues = child.nodeValue? nodeValues.concat(child.nodeValue) : nodeValues.concat('');
            });
            formRow.addControl(`col${j}`, this.fb.control(nodeValues));
          } else 
          if(childs) {
            formRow.addControl(`col${j}`, this.fb.control(trTags[i].cells[j].childNodes[0]?.nodeValue?.trim()));
          } else {
            formRow.addControl(`col${j}`, this.fb.control(''));
          }
        }
        formRows.push(formRow);
      }
      this.createFormRowsData(tabCount);
    }
  }

  removeRow(rowIndex: number) {
    const formRows = this.tableForm.get('rows') as FormArray;
    formRows.removeAt(rowIndex);
  }

  removeColumn(colIndex: number,controlKey:string) {
    const isMandatoryCol = this.options.find(option=>option.key === this.form.get(controlKey)?.value)
    if(isMandatoryCol?.isRequired){
      this.toastr.warning("As this column is requied, should not delete");
      return;
    }
    this.form.removeControl(controlKey);
    const rows = this.tableForm.get('rows') as FormArray;
    if (this.headings.length > 1) {
      this.headings.splice(colIndex, 1);
      rows.controls.forEach((row) => {
        const rowRecord = row as FormGroup;
        rowRecord.removeControl(controlKey);
      })
    }
  }

  //File upload start here
  onUploadFile(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      let file = files.item(0);
      if (file) {
        let reader: FileReader = new FileReader();
        reader.readAsText(file);
        reader.onload = (e) => {
          let csv: string = reader.result as string;
          Papa.parse(csv, {
            header: false,
            skipEmptyLines: true,
            complete: (result, file) => {
              const resultData = result.data as string[][];
              this.createFormRowsData(resultData[0].length);
              const formRows = this.tableForm.get('rows') as FormArray;
              formRows.clear();
              resultData.forEach((row) => {
                const formRow = this.fb.group({});
                row.forEach((value, index) => {
                  formRow.addControl(`col${index}`, this.fb.control(value));
                });
                formRows.push(formRow);
              });
            },
          });
        };
      }
    }
  }

  createFormRowsData(tabsCount: number) {
    this.headings = [];
    const lastOptionIndex = this.options.length - 1;
    for (let tabIndex = 0; tabIndex < tabsCount; tabIndex++) {
      if (lastOptionIndex > tabIndex) {
        const dropdownObject = {
          key: `col${tabIndex}`,
          label: this.options[tabIndex].value,
          value: this.options[tabIndex].key,
          required: this.options[tabIndex].isRequired,
          options: this.options,
        };
        this.headings.push(dropdownObject);
      } else {
        const dropdownObject = {
          key: `col${tabIndex}`,
          label: this.options[lastOptionIndex].value,
          value: this.options[lastOptionIndex].key,
          required: this.options[lastOptionIndex].isRequired,
          options: this.options,
        };
        this.headings.push(dropdownObject);
      }
    }
    this.form = this.toFormGroup(this.headings);
  }

  onSubmit() {
    let finalSaveObject = {
      fields: [],
      data: []
    }
    const columnHeadingsValue = this.form.value;
    const reqColMissing = this.isMandatoryColumnMissing(Object.values(columnHeadingsValue));
    if(!reqColMissing){
      finalSaveObject.fields = Object.values(columnHeadingsValue);
      const dataValues = this.tableForm.get('rows')?.value;
      dataValues.forEach((obj: any)=>{
        let vals = Object.values(obj) as string[];
        vals = vals.map(val=>val?.replace(/\n/g, ''));
        finalSaveObject.data.push(vals as never);
      });
      console.log("Final save object==>",finalSaveObject);
    }
  }

  isMandatoryColumnMissing(fields:string[]):boolean {
    const option = this.options.find(option=> option.isRequired && !fields.includes(option.key));
    if(option) {
      this.toastr.error(`${option.key} is missing as it is required`,"Error");
      return true;
    }
    return false;
  }

  clearAll() {
    const formRows = this.tableForm.get('rows') as FormArray;
    formRows.clear();
    this.headings = [];
    this.tableForm.clearValidators();
  }
}
