import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  
  //Configuration for copy-paste functionality
  configObj = {
    apiEndpoint: 'grant-revision/copy-paste-submit',
    apiMethod:'POST',
    headerText:"Copy-paste data from excel for Total Expenditure",
    helpText:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla eu volutpat dolor. Sed bibendum in dolor in consectetur. Quisque tellus erat, porta id mauris ac, commodo tempus elit. Maecenas auctor nec elit nec scelerisque. Duis sit amet accumsan metus. Sed accumsan magna mi, non suscipit elit molestie eu. Vestibulum vestibulum odio vel vestibulum tempor.',
    isDeletionEnabled:false,
    columns:[
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
      }
    ]
  }
}
