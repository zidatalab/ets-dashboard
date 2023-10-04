import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyDataContainerComponent } from './key-data-container.component';

describe('KeyDataContainerComponent', () => {
  let component: KeyDataContainerComponent;
  let fixture: ComponentFixture<KeyDataContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KeyDataContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KeyDataContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
