export class Reportings{
    id:number;
    data_generation_id:number|string;
    schedule:{
        is_used_for_international_reporting:number;
        reporting_interval:number;//menit
        period_of_reporting:{
            time:Interval;
            day:Interval;
            month:Interval;
        };
        diurnal_base_time:string|null;
    };
    observation_count:number;
    measurement_unit_id:number;
    data_policy_id:number;
    spatial_reporting_interval:number;
    timeliness:number;
    timeliness_unit:number;
    numerical_resolution:number;
    level_of_data_id:number;
    data_format_id:number;
    data_format_version:number;
    reference_datum:string;
    reference_time_id:number;
    is_traceable:number|null;
    quality_flag_system_id:number;
    is_primary:number|null;
    timestamp_meaning_id:number;
    attribution?:{
        title_of_work:string;
        attribution_url:string;
        originator_of_work:string;
        source_work_url:string;//klo di dev oscar begini
    };
    measurement_unit_desc?:string;
    timeliness_desc?:string|null;

    data_policy_desc?:string;
    level_of_data_desc?:string;
    data_format_desc?:string;
    reference_time_desc?:string;
    quality_flag_system_desc?:string;
    timestamp_meaning_desc?:string;
}

export class Interval{
    from:string;
    to:string;
}