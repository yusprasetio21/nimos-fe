export class Processing{
    id:number;
    data_generation_id:number|string;
    aggregation_priod:number;
    interval_unit_id:number;
    data_processing_method:string;
    software_version:string;
    software_repository_url:string;
    processing_centre:number;

    interval_unit_desc?:string;
    processing_centre_desc?: string;
}