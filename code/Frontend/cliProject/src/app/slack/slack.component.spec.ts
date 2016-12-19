/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SlackComponent } from './slack.component';

describe('SlackComponent', () => {
  let component: SlackComponent;
  let fixture: ComponentFixture<SlackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
