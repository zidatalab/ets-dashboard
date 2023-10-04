import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateAnalysisComponent } from './private-analysis.component';

describe('PrivateAnalysisComponent', () => {
  let component: PrivateAnalysisComponent;
  let fixture: ComponentFixture<PrivateAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrivateAnalysisComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivateAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
