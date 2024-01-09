import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { parse } from 'papaparse';
import { Modal } from 'bootstrap';
import { Option } from '../headings/headings.component';

@Component({
  selector: 'app-excel-copy-paste',
  templateUrl: './excel-copy-paste.component.html',
  styleUrls: ['./excel-copy-paste.component.css'],
})
export class ExcelCopyPasteComponent implements OnInit {
  @ViewChild('inputFile')
  inputFile!: ElementRef;
  pasteData!: string;
  tableForm: FormGroup = this.fb.group({});
  form!: FormGroup;
  copyPasteModal!: Modal;
  copyModal!: Modal;
  options:Option[] = [
    {
      key: 'costingDimension',
      value: 'Costing Dimension',
      isRequired: true
    },
    {
      key: 'budget',
      value: 'Budget',
      isRequired: false,
    },
    {
      key: 'actualExpenditure',
      value: 'Actual Expenditure',
      isRequired: true,
    },
    {
      key: 'budgetVsActualVariance',
      value: 'Budget vs Actual Variance',
      isRequired: false,
    },
    {
      key: 'absorptionRate',
      value: 'Absorption Rate',
      isRequired: false,
    },
    {
      key: 'comment',
      value: 'Comment',
      isRequired: false,
    },
  ];

  headings!: {
    key: string;
    label: string;
    value: string;
    required: boolean;
    options: { key: string; value: string; isRequired: boolean }[];
  }[];
  clipboardString?: string;
  constructor(private readonly fb: FormBuilder, private readonly toastr: ToastrService) {}
  ngOnInit(): void {
    this.tableForm = this.fb.group({
      rows: this.fb.array([]),
    });
  }

  openCopyPasteModal() {
    const copyPasteModal: Element | null = document.getElementById(
      'copyPasteModal',
    );

    if (copyPasteModal) {
      if (!this.copyPasteModal) {
        this.copyPasteModal = new Modal(copyPasteModal, {
          backdrop: 'static',
          keyboard: false,
        });
      }
      this.copyPasteModal.show();
    }
  }

  openCopyModal() {
    const copyModal: Element | null = document.getElementById(
      'copyModal',
    );

    if (copyModal) {
      if (!this.copyModal) {
        this.copyModal = new Modal(copyModal, {
          backdrop: 'static',
          keyboard: false,
        });
      }
      this.copyModal.show();
    }
  }

  closeModal() {
    if(this.copyPasteModal) {
      this.copyPasteModal.hide();
    }
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
    const colToRemove = this.options.find(option=>option.key === this.form.get(controlKey)?.value)
    if(colToRemove){
      colToRemove.disabled = false;
    }
    if(colToRemove?.isRequired){
      this.toastr.warning("Unable to delete: this column is required.","Warning");
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
          parse(csv, {
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
    for (let tabIndex = 0; tabIndex < tabsCount; tabIndex++) {
        const dropdownObject = {
          key: `col${tabIndex}`,
          label: '',
          value: '',
          required: false,
          options: this.options,
        };
        this.headings.push(dropdownObject);
    }
    this.form = this.toFormGroup(this.headings);
  }

  onSubmit() {
    let finalSaveObject = {
      fields: [],
      data: []
    }
    const columnHeadingsValue = this.form.value;
    const dataValues = this.tableForm.get('rows')?.value;
    if(!dataValues.length){
      this.toastr.warning("Unable to submit: there is no data.","Warning");
      return;
    }
    const reqColMissing = this.isMandatoryColumnMissing(Object.values(columnHeadingsValue));
    if(!reqColMissing){
      finalSaveObject.fields = Object.values(columnHeadingsValue);
      dataValues.forEach((obj: any)=>{
        let vals = Object.values(obj) as string[];
        vals = vals.map(val=>val?.replace(/\n/g, ''));
        finalSaveObject.data.push(vals as never);
      });
      console.log("Final save object==>",finalSaveObject);
    }
  }

  isMandatoryColumnMissing(headings:string[]):boolean {
    const emptyHeadings = headings.filter(field=>field === '');
    if(emptyHeadings.length) {
      this.toastr.error(`Unable to submit. please select all columns.`,"Error");
      return true;
    }
    const requiredColumn = this.options.find(option=> option.isRequired && !headings.includes(option.key));
    if(requiredColumn) {
      this.toastr.error(`Unable to submit: a required column (${requiredColumn.value}) is missing.`,"Error");
      return true;
    }
    return false;
  }

  clearAll() {
    const formRows = this.tableForm.get('rows') as FormArray;
    formRows.clear();
    this.headings = [];
    this.form = this.fb.group({});
    this.options.forEach(option=>option.disabled=false);
    this.inputFile.nativeElement.value = "";
  }

  // Copy data to paste into excel starts here
  copyData() {
    const dataObject = {
      "fields": [
          "Costing Dimension",
          "Actual Expenditure",
          "Comment"
      ],
      "data": [
          [
              "1.1 Salaries - program management",
              "3421725",
              "Salaries - program management: The overall variation of USD 536,431.1  variance is mainly due to the reprogramming and adding some position which was not filled during 2022, the consultancies services that was projected for one year completed in the 1st quarter, In some areas the recruitment was delayed by WHO hence the budget is not fully utilized, withdrawal of OTCD in July-22 from the continuation of HIV-Harm reduction services and delay in timely recruitment of required staff by UNODC and nominal savings due to exchange profit."
          ],
          [
              "2.2 Technical assistance-related per diems/transport/other costs",
              "13073",
              "The overall negative variation of 11% is due not the implementation of Case detection and diagnosis (TB care and prevention) and the expenditure booked is related to the lunch and refreshment costs for the meetings of the national program review."
          ],
          [
              "3.3 External audit fees",
              "286763",
              "This comment should span multiple lines but cannot."
          ]
      ]
    }
    let copyString = '';
    dataObject.fields.forEach(field=>copyString = copyString.concat(`${field}\t`));
    dataObject.data.forEach(row=>{
      copyString = copyString.concat(`\n`);
      row.forEach(value=>copyString = copyString.concat(`${value}\t`))
    });
    this.clipboardString = copyString;
    console.log("Final copied string is:\n",copyString);
    navigator.clipboard.writeText(copyString);
    this.toastr.success("Data copied and ready to be pasted into Excel.","Success");
    //TODO: text formatting pending in modal, see in console it is displaying as expected
    //this.openCopyModal();
  }
}
