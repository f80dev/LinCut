import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {HttpClient} from "@angular/common/http";;
import {NetworkService} from "../network.service";
import {MatDialog} from "@angular/material/dialog";
import {_prompt} from "../prompt/prompt.component";
import {MatIcon} from "@angular/material/icon";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable
} from "@angular/material/table";
import {MatButton} from "@angular/material/button";
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-dbtable',
  standalone:true,
  imports: [
    MatIcon,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatHeaderRow,
    MatButton,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    NgIf,
    NgForOf
  ],
  templateUrl: './dbtable.component.html',
  styleUrls: ['./dbtable.component.css']
})
export class DbtableComponent implements OnInit,OnChanges {
  @Input("table") table:string="";
  @Input() source:any="db";
  @Input("max_len") max_len=20;
  @Input("excludes") excludes:string="";
  @Input() rows:any[]=[];
  @Input() cols:string[]=[];
  @Input() showClear=false;
  @Input() title="";
  @Input() dictionnary:any={};

  constructor(
    public httpClient:HttpClient,
    public network:NetworkService,
    public dialog:MatDialog
  ) { }

  update_cols(cols:string[]){
    let rc=[];
    for(let c of cols){
      if(!this.dictionnary.hasOwnProperty(c))this.dictionnary[c]=c;
      rc.push(this.dictionnary[c]);
    }
    return rc;
  }

  update_cells(rows:any[]){
    for(let i=0;i<rows.length;i++){
      for(let k of Object.keys(rows[i])){
        let v=rows[i][k];
        if(typeof(v)=="boolean"){v=v ? "X" : "";}
        if(typeof(v)=="object"){v=JSON.stringify(v)}
        rows[i][this.dictionnary[k]]=v;
      }
    }
    return(rows);
  }


  refresh(){
    if(this.source=="db"){
      if(this.title.length==0)this.title=this.table;
      this.httpClient.get(this.network.server_nfluent+"/api/tables/"+this.table+"?excludes="+this.excludes).subscribe((rows:any)=>{
        this.rows=rows;
        if(this.cols.length==0){
          for(let k in this.rows[0]){
            this.cols.push(k);
          }
        }
      })
    } else {
      if(this.source){
        if(typeof(this.source)=="object"){
          this.cols=this.update_cols(Object.keys(this.source[0]));
          this.rows=this.update_cells(this.source);
        }
      }
    }

  }

  ngOnInit(): void {
    this.refresh()
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.hasOwnProperty("source")){
      this.refresh()
    }
  }

  async clear() {
    let rep=await _prompt(this,"Confirmer l'effacement","","","oui/non","Effacer tout","Annuler",true);

    if(rep=="yes" && this.source!="local"){
      this.httpClient.delete(this.network.server_nfluent+"/api/tables/"+this.table).subscribe(()=>{
        this.refresh();
      })
    }
  }

  truncate(txt:any) {
    if(txt && typeof(txt)=="string"){
      if(txt.length<this.max_len){
        return txt;
      } else {
        return txt.substring(0,this.max_len)+"...";
      }
    } else
      return txt;
  }
}
