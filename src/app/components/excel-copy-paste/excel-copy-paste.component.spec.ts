import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcelCopyPasteComponent } from './excel-copy-paste.component';

describe('ExcelCopyPasteComponent', () => {
  let component: ExcelCopyPasteComponent;
  let fixture: ComponentFixture<ExcelCopyPasteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExcelCopyPasteComponent]
    });
    fixture = TestBed.createComponent(ExcelCopyPasteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
