export class Samplings{
    id:number|string;
    data_generation_id:number|string;
    sampling_strategy_id:number;
    sampling_interval:number;
    sampling_interval_unit_id:number;
    sampling_period:number;
    sampling_period_unit:number;
    spatial_sampling_resolution:number;
    sampling_procedure_id:number;
    sampling_procedure_description:number;
    sample_treatment_id:number;

    sampling_strategy_desc?:string;
    interval_unit_desc?:string;
    priod_unit_desc?:string;
    sampling_procedure_desc?:string;
    sample_treatment_desc?:string;
    
}