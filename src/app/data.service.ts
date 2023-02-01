import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Stock, StockValue } from './stocks';
import { BACKEND_URL } from './urls';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor (private http: HttpClient) { }

  getStocks () {
    console.log("Starting fetch for stocks...");
    return this.http.get<Stock[]>(BACKEND_URL + '/stocks')
      .pipe(stocks => {
        console.log("Fetched stocks");
        return stocks;
      });
  }

  getStockValues () {
    console.log("Starting fetch for stock values...");
    return this.http.get<StockValue[]>(BACKEND_URL + '/stockvalues')
      .pipe(stockValues => {
        console.log("Fetched stockValues");
        return stockValues;
      });
  }
}
