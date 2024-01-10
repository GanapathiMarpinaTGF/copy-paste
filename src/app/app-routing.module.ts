import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExcelCopyPasteComponent } from './components/excel-copy-paste/excel-copy-paste.component';

const routes: Routes = [
  // {
  //   path: 'copypaste',
  //   pathMatch: 'full',
  //   component: ExcelCopyPasteComponent,
  // },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
