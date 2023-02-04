import { DataModel  } from "@essenza/core";

export function LocalityModel(m){
    DataModel.call(this, "comune", {search: "search_comuni"});

    //const m = new DataModel("comune");
    this.search = (v) => {
        //this.api(this.op.search + ": comune {*}", {denominazione: v});
        this.CallApi("search", {denominazione: v});
    };
    return m;
}