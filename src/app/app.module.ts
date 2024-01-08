import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ExcelCopyPasteComponent } from './components/excel-copy-paste/excel-copy-paste.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeadingsComponent } from './components/headings/headings.component';
import { KeysPipe } from './components/keys.pipe';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [
    AppComponent,
    ExcelCopyPasteComponent,
    HeadingsComponent,
    KeysPipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
