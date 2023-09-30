import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    constructor() { }

    public saveData(key: string, value: string) {
        window.localStorage.setItem(key, value);
    }

    public getData(key: string) {
        return window.localStorage.getItem(key)
    }
    public removeData(key: string) {
        window.localStorage.removeItem(key);
    }

    public clearData() {
        window.localStorage.clear();
    }
}