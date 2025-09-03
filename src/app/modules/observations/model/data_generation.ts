import { Processing } from "./processings";
import { Reportings } from "./reportings";
import { Samplings } from "./samplings";

export class DataGeneration{
    id:number|string;
    deployment_id:number;
    from:Date;
    to:Date|null;
    sampling?:Samplings;
    processing?:Processing;
    reporting:Reportings;

    tittle?:string;
}