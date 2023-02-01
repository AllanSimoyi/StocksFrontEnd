import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { debounceTime, distinctUntilChanged, filter, fromEvent, Observable, Subscription, tap } from 'rxjs';
import { DataService } from './data.service';
import { Stock, StockValue } from './stocks';

interface SelectableStock extends Stock {
  selected: boolean;
}

type StocksSortCriteria = "Stock" | "Industry" | "Sector" | "Currency Code";
type StockValueSortCriteria = "Date" | "Value";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  stocks: SelectableStock[] = [];
  stockValues: StockValue[] = [];

  filteredStocks: SelectableStock[] = [];

  selectedStock: Stock | undefined = undefined;
  filteredStockValues: StockValue[] = [];

  searchControl = new FormControl();
  searchControlSub!: Subscription;

  exportJsonUri!: SafeUrl;

  constructor (private dataService: DataService, private sanitizer: DomSanitizer) { }

  ngOnInit (): void {
    this.dataService.getStocks()
      .subscribe(fetchedStocks => {
        this.stocks = fetchedStocks.map(stock => ({
          ...stock,
          selected: false,
        }));
        this.filteredStocks = [...this.stocks];
      });

    this.dataService.getStockValues()
      .subscribe(fetchedStockValues => {
        this.stockValues = fetchedStockValues;
      });

    this.searchControlSub = this.searchControl.valueChanges
      .pipe(debounceTime(500))
      .subscribe((newSearchTerm: string) => {
        this.filteredStocks = this.stocks.filter(stock => {
          return stock.stock.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
            stock.industry.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
            stock.sector.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
            stock.currency_code.toLowerCase().includes(newSearchTerm.toLowerCase());
        });
      });
  }

  ngOnDestroy () {
    this.searchControlSub.unsubscribe();
  }

  public generateExportJsonUri () {
    const jsonString = JSON.stringify(this.filteredStockValues);
    this.exportJsonUri = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," + encodeURIComponent(jsonString));
  }

  public filterStockValues (selectedStockId: number, checked: boolean) {
    if (checked) {
      this.selectedStock = this.filteredStocks
        .find(stock => stock.id === selectedStockId);
      this.filteredStocks = this.filteredStocks
        .map(stock => {
          return stock.id === selectedStockId ?
            stock :
            { ...stock, selected: false };
        });
      this.filteredStockValues = this.stockValues
        .filter(stockValue => stockValue.stock_id === selectedStockId);
      this.generateExportJsonUri();
    } else {
      this.selectedStock = undefined;
      this.filteredStockValues = [];
      this.generateExportJsonUri();
    }
  }

  public sortStocks (criteria: StocksSortCriteria, mode: "asc" | "desc") {
    if (criteria === "Stock") {
      this.filteredStocks = this.filteredStocks.sort((a, b) => {
        if (mode === "asc") {
          return a.stock.localeCompare(b.stock);
        }
        return b.stock.localeCompare(a.stock);
      });
      return;
    }
    if (criteria === "Industry") {
      this.filteredStocks = this.filteredStocks.sort((a, b) => {
        if (mode === "asc") {
          return a.industry.localeCompare(b.industry);
        }
        return b.industry.localeCompare(a.industry);
      });
      return;
    }
    if (criteria === "Currency Code") {
      this.filteredStocks = this.filteredStocks.sort((a, b) => {
        if (mode === "asc") {
          return a.currency_code.localeCompare(b.currency_code);
        }
        return b.currency_code.localeCompare(a.currency_code);
      });
      return;
    }
    if (criteria === "Sector") {
      this.stocks = this.stocks.sort((a, b) => {
        if (mode === "asc") {
          return a.sector.localeCompare(b.sector);
        }
        return b.sector.localeCompare(a.sector);
      });
      return;
    }
  }

  public sortStockValues (criteria: StockValueSortCriteria, mode: "asc" | "desc") {
    if (criteria === "Date") {
      this.filteredStockValues = this.filteredStockValues.sort((a, b) => {
        if (mode === "asc") {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      return;
    }
    if (criteria === "Value") {
      this.filteredStockValues = this.filteredStockValues.sort((a, b) => {
        if (mode === "asc") {
          return a.value - b.value;
        }
        return b.value - a.value;
      });
      return;
    }
  }
}
