import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ExcelCopyPasteComponent } from './components/excel-copy-paste/excel-copy-paste.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeadingsComponent } from './components/headings/headings.component';
import { KeysPipe } from './components/keys.pipe';

@NgModule({
  declarations: [
    AppComponent,
    ExcelCopyPasteComponent,
    HeadingsComponent,
    KeysPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
