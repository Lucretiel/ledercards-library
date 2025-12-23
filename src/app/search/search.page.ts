import { Component, computed, effect, inject, type OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { LocalStorageService } from 'ngx-webstorage';
import { reformatQueryToJustHaveProduct } from '../../../search/search';
import {
  SearchService,
  type QueryDisplay,
  type QuerySort,
  type QuerySortDir,
} from '../search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {
  private route = inject(ActivatedRoute);
  private searchService = inject(SearchService);
  private storageService = inject(LocalStorageService);

  public get query() { return this.searchService.queryString() }

  public page = 0;

  ngOnInit() {
    // Restore search settings when the search page loads, then ensure that
    // any changes to search settings are stored
    this.linkQuerySettingToStorage(s => s.queryDisplayValue(), "search-display", (s, display) => s.updateDisplay(display));
    this.linkQuerySettingToStorage(s => s.querySortValue(), "search-sort", (s, sort) => s.updateSort(sort));
    this.linkQuerySettingToStorage(s => s.querySortDirValue(), "search-direction", (s, dir) => s.updateSortDir(dir))
  }

  // Do two things:
  // - One-time preload the search setting from the cache
  // - Set up an effect that propagates changes to the search setting TO the cache
  private linkQuerySettingToStorage<T>(
    queryValue: (service: SearchService) => (T | null),
    key: string,
    updater: (service: SearchService, value: T) => void,
  ) {
    if (queryValue(this.searchService) === null) {
      const cached = this.storageService.retrieve(key) as T;
      updater(this.searchService, cached)
    }

    // effect(() => {
    //   const setting = queryValue(this.searchService);
    //   if (setting !== null) {
    //     this.storageService.store(key, setting);
    //   }
    // });
  }
}
