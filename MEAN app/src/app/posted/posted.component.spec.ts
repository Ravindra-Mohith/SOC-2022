import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostedComponent } from './posted.component';

describe('PostedComponent', () => {
  let component: PostedComponent;
  let fixture: ComponentFixture<PostedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
