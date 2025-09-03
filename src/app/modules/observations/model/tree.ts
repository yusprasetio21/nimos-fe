import { Observation } from "./observation";

export class TreeModel {
    index?:number;
    id:number;
    path?:number;
    text: string;
    children?: TreeModel[];
  
    data?: Observation;
  }