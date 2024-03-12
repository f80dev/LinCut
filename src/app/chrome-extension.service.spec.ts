import { TestBed } from '@angular/core/testing';

import { ChromeExtensionService } from './chrome-extension.service';

describe('ChromeExtensionService', () => {
  let service: ChromeExtensionService;
  let chrome=null

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChromeExtensionService);
  });

  it('should be created', () => {
    let obj={"key":"coucou"}
    service.set_local("test",obj)
    expect(service).toBeTruthy();
    expect(service.get_local("test")).toBe(obj)
  });


});
