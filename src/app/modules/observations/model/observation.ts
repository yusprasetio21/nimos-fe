import { Deployment } from "./deployment";

export class Observation{
  id?:number|string|null;
  observed_variable_id:number;
  programs?:Program[];
  geometry_id:number;
  observed_since?:Date|null;
  observing_method_id?:number;
  
  variable?:string;
  geometryName?:string;
  program?:number;
  methodName?:string;
  programs_text?:string;

  methodNode?:{
    id:number;
    text:string;
  }

  deployments?:Deployment[];

  last_update?:string|null;
}

export class Program{
  id?:number;
  desc?:string;
}
